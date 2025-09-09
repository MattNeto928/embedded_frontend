// User types
export interface User {
  username: string;
  role: 'student' | 'staff';
  studentId?: string;
  fullName?: string;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  showNameCollectionModal: boolean;
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

// Part submission types for lab checkoffs
export interface PartSubmission {
  submissionId: string;
  labId: string;
  partId: string;
  studentId: string;
  userId: string;
  username: string;
  fullName?: string;
  fileKey: string;
  videoUrl?: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submittedAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  queuePosition?: number;
}

// Lab part definition
export interface LabPart {
  partId: string;
  title: string;
  description: string;
  order: number;
  requiresCheckoff: boolean;
  checkoffType: 'in-lab' | 'video' | 'none';
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Student types
export interface Student {
  name: string;
  section: string;
  hasAccount: boolean;
  progressSummary?: {
    completedLabs: number;
    totalLabs: number;
    overallProgress: number;
    labSummary: {
      labId: string;
      title: string;
      status: string;
      completed: boolean;
      grade: number | null;
    }[];
  };
}

export interface StudentDetail extends Student {
  progress: {
    labId: string;
    title: string;
    status: 'locked' | 'unlocked';
    completed: boolean;
    grade: number | null;
    parts: {
      partId: string;
      title?: string;
      description?: string;
      completed: boolean;
      completedAt?: string;
      checkoffType: 'in-lab' | 'video' | 'pending';
      videoUrl?: string;
      submissionId?: string;
      submissionStatus?: 'pending' | 'approved' | 'rejected';
    }[];
  }[];
}

export interface CheckoffUpdate {
  labId: string;
  partId?: string;
  status?: 'locked' | 'unlocked';
  completed?: boolean;
  grade?: number | null;
  checkoffType?: 'in-lab' | 'video' | 'pending';
  submissionId?: string;
  feedback?: string;
}

// Queue types for staff review
export interface SubmissionQueue {
  items: PartSubmission[];
  totalCount: number;
  pendingCount: number;
}

// Filter options for the queue
export interface QueueFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  labId?: string;
  partId?: string;
  studentId?: string;
  sortBy?: 'submittedAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}
