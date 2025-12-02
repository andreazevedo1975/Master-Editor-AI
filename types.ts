
export interface ChapterRequest {
  bookTitle: string;
  genre: string;
  chapterName: string;
  plotSummary: string;
  mainCharacters?: string; // New field for character consistency
  lengthConstraint: string;
  writingStyle: string;
  dialogueEnhancement?: string; // New field for dialogue examples
  imageAspectRatio: string;
  imageArtStyle: string;
  imageCustomTopic?: string;
}

export interface ChapterResponse {
  title: string;
  content: string; // HTML or Markdown formatted content
  editorAnalysis: string;
  imagePrompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  WRITING = 'WRITING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface GenerationResult {
  textData: ChapterResponse | null;
  imageUrl: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  request: ChapterRequest;
  result: GenerationResult;
}