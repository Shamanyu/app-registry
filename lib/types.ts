export interface Project {
  id: string;
  created_at: string;
  name: string;
  url: string;
  description: string;
  icon_url: string | null;
}

export interface NewProject {
  name: string;
  url: string;
  description: string;
  icon_url?: string;
}
