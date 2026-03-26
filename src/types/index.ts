// src/types/index.ts

export interface User {
  id: number;
  email: string;
  privacy_policy: boolean;
  profile: string;
  role:string ;
  account_status:string ;
  account_type: {
    worker: string;
  } | null;
  contact: Contact;
  enterprise_document: EnterpriseDocument | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  user_id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface EnterpriseDocument {
  id: number;
  user_id: number;
  document_type: string;
  document_url: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProjectUser {
  id: number;
  email: string | null;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface Project {
  id: number;
  name: string;
  uuid: string;
  description: string;
  status: string;
  amount: string;
  amount_to_perceive: string;
  accepted: boolean;
  location: string;
  images: ProjectImage[];
  files: ProjectFile[];
  created_at: string;
  updated_at: string;
  user: ProjectUser;
  project_solds: any[];
}
// export interface Project {
//   id: number;
//   title: string;
//   description: string;
//   location: string;
//   start_date: string;
//   end_date: string;
//   budget: number;
//   status: 'open' | 'in_progress' | 'completed' | 'cancelled';
//   required_workers: number;
//   created_at: string;
//   updated_at: string;
//   user_id: number;
//   observations?: ProjectObservation[];
// }

export interface ProjectObservation {
  id: number;
  project_id: number;
  title: string;
  description: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: number;
  user_id: number;
  worker_type: string;
  experience_years: number;
  skills: string[];
  availability: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface Application {
  id: number;
  project_id: number;
  worker_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: string;
  updated_at: string;
  project: Project;
  worker: Worker;
}

export interface Availability {
  id: number;
  user_id: number;
  available_from: string;
  available_to: string;
  is_available: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: number;
  project_id: number;
  worker_id: number;
  rated_by: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  account_type?: {
    worker: string;
  };
  privacy_policy: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}



export interface AnnotationBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label?: string;
}

export interface BackendCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
  strokeColor?: string;
}

export interface BackendObservation {
  name: string;
  description: string;
  critical: 'warning' | 'rejected' | 'accepted';
  document_type: 'image' | 'pdf' | 'dwg' | 'bim';
  project_image_id?: number;
  project_file_id?: number;
  coordinates: BackendCoordinates;
}

export interface FileAnnotatorProps {
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'dwg' | 'bim';
  fileId: number;
  isProjectFile: boolean;
  onSave: (observation: BackendObservation) => void;
  onClose: () => void;
  currentPage?: number;
  existingAnnotations?: BackendObservation[];
}



export interface BackendCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
  strokeColor?: string;
}

export interface Observation {
  id: number;
  name: string;
  description: string;
  critical: 'warning' | 'rejected' | 'accepted';
  document_type: 'image' | 'pdf' | 'dwg' | 'bim';
  coordinates?: BackendCoordinates;
  document: {
    id: number;
    url: string;
    filename?: string;
  };
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface ObservationViewerProps {
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'dwg' | 'bim';
  observations: Observation[];
  currentPage?: number;
  onClose: () => void;
}


export interface ProjectFile {
  id: number;
  filename: string;
  url: string;
}

export interface ProjectImage {
  id: number;
  url: string;
}

export interface ProjectObservationsProps {
  projectId: number;
  readOnly?: boolean;
  projectFiles?: ProjectFile[];
  projectImages?: ProjectImage[];
}



export interface PublicProject {
  id: number;
  name: string;
  description: string;
  amount: string;
  created_at: string;
  images: { id: number; url: string }[];
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  has_more: boolean;
}


export interface PublicProject {
  id: number;
  name: string;
  description: string;
  amount: string;
  created_at: string;
  images: { id: number; url: string }[];
  files: { id: number; filename: string }[];
}




export interface DashboardStats {
  accepted_projects: number;
  rejected_projects: number;
  total_amount_received: number;
  total_amount: number;
  total_projects: number;
}

export interface DashboardResponse {
  data: DashboardStats;
}


export interface ProjectStatsParsed {
  id: number;
  uuid: string;
  name: string;
  current_amount: number;
  amount_to_perceive: number;
  total_sales: number;
  total_amount_received: number;
  amount_set_at: Date;
}