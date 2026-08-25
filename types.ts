
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface IframeMessage {
  type: string;
  payload?: any;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorName: string;
  authorDetails?: string;
  imageUrl?: string;
  category?: string;
  publishedAt: string | null;
  updatedAt: string;
  status: 'draft' | 'published';
  isFeatured?: boolean;
  linkedInUrl?: string;
}
