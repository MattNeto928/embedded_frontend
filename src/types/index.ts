// User types
export interface User {
  username: string;
  role: 'student' | 'staff';
  studentId?: string;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Lab types
export interface Lab {
  labId: string;
  title: string;
  description: string;
  content: string;
  structuredContent?: LabContent;
  order: number;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Structured lab content types
export interface LabContent {
  sections: LabSection[];
  resources?: LabResource[];
}

export interface LabSection {
  id: string;
  type: 'introduction' | 'objectives' | 'requirements' | 'instructions' | 'submission' | 'custom';
  title: string;
  content: string | LabContentBlock[];
  order: number;
}

export interface LabContentBlock {
  type: 'text' | 'image' | 'code' | 'video' | 'diagram' | 'note' | 'warning';
  content: string;
  caption?: string;
  language?: string; // For code blocks
  url?: string; // For images, videos, etc.
}

export interface LabResource {
  id: string;
  type: 'document' | 'image' | 'video' | 'link';
  title: string;
  description?: string;
  url: string;
}

export interface LabStatus {
  studentId: string;
  labId: string;
  status: 'locked' | 'unlocked';
  unlockedAt?: string;
  submissionStatus?: 'pending' | 'approved' | 'rejected';
  submissionId?: string;
  completed: boolean;
  updatedAt: string;
}

// Submission types
export interface Submission {
  submissionId: string;
  labId: string;
  studentId: string;
  userId: string;
  username: string;
  fileKey: string;
  videoUrl?: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}
