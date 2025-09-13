export interface AgreementData {
  name: string;
  assetName: string;
  assetId: string;
  signature?: string;
  id?: string; // For tracking multiple entries
}

export interface ParsedRow {
  [key: string]: string;
}