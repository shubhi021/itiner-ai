export type TripFormData = {
  destination: string;
  days: number;
  budget: 'low' | 'medium' | 'high';
  interests: string[];
};
