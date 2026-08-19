export type StockPlatform =
  | 'adobe-stock'
  | 'shutterstock'
  | 'freepik'
  | 'vecteezy'
  | '123rf'
  | 'pond5'
  | 'depositphotos'
  | 'canva'
  | 'istock'
  | 'general';

export type KeywordFormat = 'single' | 'double' | 'auto';

export type ContentType =
  | 'auto'
  | 'photo'
  | 'vector'
  | 'illustration'
  | '3d-render'
  | 'generative-ai';

export interface EssentialSettingsState {
  titleLength: number; // e.g. 150 chars
  keywordCount: number; // e.g. 45 keywords
  descriptionLength: number; // e.g. 160 chars
  keywordFormat: KeywordFormat;
  includeKeywords: string;
  excludeKeywords: string;
  contentType: ContentType;
  isAiGenerated: boolean;
  strictGuidelines: boolean;
  selectedModel: string;
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  complianceScore: number;
  complianceWarnings: string[];
}

export interface UploadedMediaItem {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  previewUrl: string;
  fileType: 'image' | 'svg' | 'video';
  status: 'idle' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  metadata?: GeneratedMetadata;
  createdAt: number;
}

export interface GroqApiKeyItem {
  id: string;
  key: string;
  label: string;
  isValid: boolean | null;
  lastUsed?: number;
  usageCount: number;
}

export interface PlatformExportConfig {
  id: StockPlatform;
  name: string;
  shortName: string;
  iconBg: string;
  iconText: string;
  badge?: string;
  description: string;
  titleRule: string;
  keywordLimit: number;
  headers: string[];
}
