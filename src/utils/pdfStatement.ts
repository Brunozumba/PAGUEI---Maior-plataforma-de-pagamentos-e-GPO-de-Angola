import { jsPDF } from 'jspdf';
import type { MerchantProfile, TransactionRecord } from '../types/paguei';
import { formatKwanza } from './formatters';

function getCurrentMonthPortugueseLabel(): { display: string; fileSlug: string } {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat('pt-AO', {
    month: 'long',
    year: 'numeric',
  }).format(now);
  const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return {
    display: capitalized,
    fileSlug: `${year}-${month}`,
  };
}

export function exportMonthlyStatementPdf(
  transactions: TransactionRecord[],
  profile: MerchantProfile,
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const { display: monthDisplay, fileSlug } = getCurrentMonthPortugueseLabel();
  const emittedAt = new Date().toLocaleString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Top Header Band (#102A56 Navy + #16B981 Emerald accent strip)
  doc.setFillColor(16, 42, 86);
  doc.rect(0, 0, pageWidth, 34, 'F');
  doc.setFillColor(22, 185, 129);
  doc.rect(0, 34, pageWidth, 1.8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PAGUEI!', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Extrato Mensal de Transações · Documento para Contabilidade', margin, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Período: ${monthDisplay}`, pageWidth - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Emitido em: ${emittedAt}`, pageWidth - margin, 22, { align: 'right' });

  // Merchant Identification Box
  let y = 44;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setTextColor(16, 42, 86);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Comerciante: ${profile.businessName}`, margin + 4, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`ID: ${profile.merchantId}   |   BI: ${profile.biNumber}   |   Província: ${profile.province}`, margin + 4, y + 13.5);
  doc.text(`IBAN Liquidação: ${profile.iban}   |   Express: ${profile.expressPhone}`, margin + 4, y + 20);

  // Totals Summary Box
  y += 32;
  const totalGross = transactions.reduce((sum, tx) => sum + tx.grossAmount, 0);
  const totalFee = transactions.reduce((sum, tx) => sum + tx.feeAmount, 0);
  const totalNet = transactions.reduce((sum, tx) => sum + tx.netAmount, 0);

  const cardW = (contentWidth - 9) / 4;
  const kpis = [
    { label: 'Transações (Mês)', value: String(transactions.length), highlight: false },
    { label: 'Volume Bruto', value: formatKwanza(totalGross), highlight: false },
    { label: 'Taxa Única (6,5%)', value: `-${formatKwanza(totalFee)}`, highlight: false },
    { label: 'Líquido Creditado', value: formatKwanza(totalNet), highlight: true },
  ];

  kpis.forEach((kpi, index) => {
    const x = margin + index * (cardW + 3);
    if (kpi.highlight) {
      doc.setFillColor(16, 42, 86);
      doc.roundedRect(x, y, cardW, 18, 2, 2, 'F');
      doc.setTextColor(22, 185, 129);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(x, y, cardW, 18, 2, 2, 'FD');
      doc.setTextColor(100, 116, 139);
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(kpi.label, x + 3, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    if (!kpi.highlight) doc.setTextColor(16, 42, 86);
    doc.text(kpi.value, x + 3, y + 13.5);
  });

  // Table Title
  y += 26;
  doc.setTextColor(16, 42, 86);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Detalhe das Transações do Mês Corrente', margin, y);

  y += 4;

  const drawTableHeader = (startY: number) => {
    doc.setFillColor(16, 42, 86);
    doc.rect(margin, startY, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Ref.', margin + 2, startY + 5.3);
    doc.text('Cliente / Produto', margin + 22, startY + 5.3);
    doc.text('Canal', margin + 78, startY + 5.3);
    doc.text('Bruto (Kz)', margin + 124, startY + 5.3, { align: 'right' });
    doc.text('Taxa 6,5%', margin + 148, startY + 5.3, { align: 'right' });
    doc.text('Líquido (Kz)', margin + 174, startY + 5.3, { align: 'right' });
    return startY + 8;
  };

  y = drawTableHeader(y);

  transactions.forEach((tx, idx) => {
    if (y > pageHeight - 24) {
      doc.addPage();
      y = drawTableHeader(16);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 9, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 9, margin + contentWidth, y + 9);

    doc.setTextColor(16, 42, 86);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(tx.reference, margin + 2, y + 5.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const label = `${tx.customer} · ${tx.product}`.slice(0, 34);
    doc.text(label, margin + 22, y + 5.8);

    doc.setTextColor(71, 85, 105);
    doc.text(tx.channel.slice(0, 18), margin + 78, y + 5.8);

    doc.setTextColor(30, 41, 59);
    doc.text(formatKwanza(tx.grossAmount), margin + 124, y + 5.8, { align: 'right' });

    doc.setTextColor(100, 116, 139);
    doc.text(`-${formatKwanza(tx.feeAmount)}`, margin + 148, y + 5.8, { align: 'right' });

    doc.setTextColor(11, 122, 84);
    doc.setFont('helvetica', 'bold');
    doc.text(formatKwanza(tx.netAmount), margin + 174, y + 5.8, { align: 'right' });

    y += 9;
  });

  // Accounting & Compliance Footer
  const footerY = Math.min(pageHeight - 14, Math.max(y + 12, pageHeight - 18));
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `PAGUEI! Angola · Taxa única de 6,5% por transação · Mensalidade: 0 Kz · E-mail: ${profile.contactEmail}`,
    margin,
    footerY,
  );
  doc.text('Documento gerado para conferência contabilística', pageWidth - margin, footerY, {
    align: 'right',
  });

  doc.save(`paguei-extrato-${fileSlug}.pdf`);
}
