export interface AgreementData {
  name: string;
  assetName: string;
  assetId: string;
  signature?: string;
  id?: string; // For tracking multiple entries
  additionalAssets?: string[]; // Array of additional asset names
}

export interface ParsedRow {
  [key: string]: string;
}