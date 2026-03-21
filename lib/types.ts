export type PopularityKind =
  | "new"
  | "growing"
  | "popular_lately"
  | "often_opened"
  | "steady";

export interface PopularityInfo {
  kind: PopularityKind;
  label: string;
  hint: string;
}

export interface Project {
  id: string;
  created_at: string;
  name: string;
  url: string;
  description: string;
  icon_url: string | null;
  owner: string | null;
  preview_url: string | null;
  /** Relative popularity on this directory; null when not enough signal */
  popularity: PopularityInfo | null;
}

export interface NewProject {
  name: string;
  url: string;
  description: string;
  icon_url?: string;
  owner?: string;
}
