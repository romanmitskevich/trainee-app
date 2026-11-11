export type BitrixTask = {
  id: string;
  title: string;
  description: string;
  createdDate: string;
  closedDate?: string | null;
  status?: string;
};
