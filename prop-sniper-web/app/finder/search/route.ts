export type FinderLead = {
  id: string;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  owner_name?: string | null;
  estimated_value?: number | null;
  estimated_rent?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  absentee_owner?: boolean | null;
  vacant?: boolean | null;
  high_equity?: boolean | null;
  score?: number | null;
};