import type { TransactionRecord } from '../types/paguei';

export const PAGUEI_FEE_RATE = 0.065;

export function calculateFeeBreakdown(grossAmount: number) {
  const safeGross = Math.max(0, Math.round(grossAmount));
  const feeAmount = Math.round(safeGross * PAGUEI_FEE_RATE);
  const netAmount = safeGross - feeAmount;
  return {
    grossAmount: safeGross,
    feeAmount,
    netAmount,
  };
}

export function formatKwanza(value: number, showDecimals = false): string {
  const formatted = new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);
  return `${formatted} Kz`;
}

/**
 * Formats Angolan mobile phone (9 digits starting with 9): "923 456 789"
 */
export function formatAngolanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function isValidAngolanPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return /^9[1-9]\d{7}$/.test(digits);
}

/**
 * Enforces Angolan Bilhete de Identidade format: 9 digits + 2 uppercase province letters + 3 digits (e.g. 004512890LA042)
 */
export function formatAngolanBI(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^0-9A-Z]/g, '');
  let out = '';
  for (let i = 0; i < cleaned.length && out.length < 14; i++) {
    const ch = cleaned[i];
    const pos = out.length;
    if (pos < 9) {
      if (/\d/.test(ch)) out += ch;
    } else if (pos < 11) {
      if (/[A-Z]/.test(ch)) out += ch;
    } else {
      if (/\d/.test(ch)) out += ch;
    }
  }
  return out;
}

export function isValidAngolanBI(raw: string): boolean {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
  return /^\d{9}[A-Z]{2}\d{3}$/.test(cleaned);
}

/**
 * Enforces Angolan IBAN format: AO06 + 21 digits, grouped in blocks of 4 (e.g. AO06 0040 0000 1234 5678 9012 3)
 */
export function formatAngolanIBAN(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleaned) return '';

  let bodyDigits = '';
  if (cleaned.startsWith('AO06')) {
    bodyDigits = cleaned.slice(4).replace(/\D/g, '').slice(0, 21);
  } else if (cleaned.startsWith('AO')) {
    bodyDigits = cleaned.replace(/^AO0?6?/, '').replace(/\D/g, '').slice(0, 21);
  } else {
    bodyDigits = cleaned.replace(/\D/g, '').slice(0, 21);
  }

  const full = `AO06${bodyDigits}`;
  return full.replace(/(.{4})(?=.)/g, '$1 ').trim();
}

export function isValidAngolanIBAN(raw: string): boolean {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
  return /^AO06\d{21}$/.test(cleaned);
}

export function slugifyProductName(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || 'produto-express';
}

export function downloadTransactionsCsv(transactions: TransactionRecord[]) {
  const headers = [
    'Referencia',
    'Cliente',
    'Telemovel',
    'Produto',
    'Canal',
    'Valor Bruto (AOA)',
    'Taxa PAGUEI 6.5% (AOA)',
    'Lucro Liquido (AOA)',
    'Estado',
    'Hora',
  ];

  const rows = transactions.map((tx) => [
    tx.reference,
    `"${tx.customer.replace(/"/g, '""')}"`,
    tx.phone,
    `"${tx.product.replace(/"/g, '""')}"`,
    tx.channel,
    tx.grossAmount,
    tx.feeAmount,
    tx.netAmount,
    tx.status,
    tx.timestampLabel,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  document.body.appendChild(link);
  link.setAttribute('download', 'paguei-relatorio-transacoes.csv');
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
