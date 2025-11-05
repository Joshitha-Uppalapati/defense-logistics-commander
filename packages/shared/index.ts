
export type RFQSource = 'ERP' | 'GOV' | 'EMAIL' | 'PDF';

export interface ERPLine {
  rfqNumber: string;
  nsn: string;
  partName: string;
  quantity: number;
  dueDate: string; // ISO date
}

export interface QuoteDraft {
  rfqId: string;
  supplierId: string;
  leadTimeDays: number;
  items: Array<{ partId: string; quantity: number; unitPrice: number }>;
}
