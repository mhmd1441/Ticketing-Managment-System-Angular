export interface Entry {
  ticketId: string;
  reporterId: string;
  staffId: string;
  faculty: string;
  description: string;
  channel: string;
  term: string;
  category: string;
  tags: string[];
  status: string;
  startDate: string;
  endDate?: string;
}
