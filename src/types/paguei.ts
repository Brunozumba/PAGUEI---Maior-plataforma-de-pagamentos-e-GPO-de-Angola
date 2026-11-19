export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface EmailAuthCredentials {
  email: string;
  password: string;
}

export type PaymentChannel =
  | 'Multicaixa Express'
  | 'Link WhatsApp'
  | 'QR Code'
  | 'API REST'
  | 'MCP Agent';

export type PaymentStatus = 'Liquidado' | 'Confirmado' | 'Pendente';

export type PeriodFilter = 'hoje' | '7dias' | '30dias';

export interface TransactionRecord {
  id: string;
  reference: string;
  customer: string;
  phone: string;
  product: string;
  channel: PaymentChannel;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: PaymentStatus;
  timestampLabel: string;
  periodBucket: PeriodFilter;
}

export interface GeneratedPaymentLink {
  id: string;
  slug: string;
  url: string;
  productName: string;
  amount: number;
  createdAt: string;
  active: boolean;
  clicks: number;
  paidCount: number;
}

export interface OnboardingSubmission {
  biNumber: string;
  iban: string;
  expressPhone: string;
  businessName: string;
  contactEmail: string;
  merchantId: string;
  apiKeyPreview: string;
  mcpEndpoint: string;
  checkoutUrl: string;
}

export interface MerchantProfile extends OnboardingSubmission {
  webhookUrl: string;
  province: string;
  accountMode: 'Particular (BI)' | 'Comercial';
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'Respondido' | 'Em análise';
}

export type WebhookEventType =
  | 'transaction.approved'
  | 'transaction.settled'
  | 'link.paid';

export interface WebhookEndpoint {
  id: string;
  label: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt: string;
  lastDeliveredAt?: string;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  webhookLabel: string;
  url: string;
  event: WebhookEventType;
  reference: string;
  amount: number;
  statusLabel: string;
  timestamp: string;
}

