export interface ColumnMapping {
  date: string;
  cashSales: string;
  upiSales: string;
  cardSales: string;
  returns: string;
  notes: string;
}

export interface ExcelImportPreview {
  fileName: string;
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  detectedMapping: Partial<ColumnMapping>;
  previewRows: Record<string, unknown>[];
  totalRows: number;
}

export interface GoogleSheetConfig {
  publishedUrl: string;
  sheetId: string;
  apiKey?: string;
  autoRefreshIntervalMins: number;
}
