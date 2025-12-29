export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  hasCode?: boolean;
  attachment?: string; // Base64 string of the image
}

export interface GeneratedCode {
  id: string;
  title: string;
  html: string;
  timestamp: number;
}

export type ViewMode = 'preview' | 'code' | 'elementor';
