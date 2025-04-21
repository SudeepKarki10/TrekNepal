// Matches the structure expected by the download page and Supabase table
export interface PermitData {
  id: number;
  tims_card_no: string;
  transaction_id: string;
  issue_date: string; // Keep as string, formatting happens in component
  full_name: string;
  nationality: string;
  passport_number: string;
  gender: string;
  date_of_birth: string; // Keep as string
  trekker_area: string;
  route: string;
  entry_date: string; // Keep as string
  exit_date: string; // Keep as string
  nepal_contact_name: string;
  nepal_organization: string;
  nepal_designation: string | null; // Allow null based on schema
  nepal_mobile: string;
  nepal_office_number: string | null; // Allow null
  nepal_address: string;
  home_contact_name: string;
  home_city: string;
  home_mobile: string;
  home_office_number: string | null; // Allow null
  home_address: string;
  status: string;
  payment_status: string;
  permit_cost: number; // Use number based on previous steps
  created_at?: string; // Optional DB timestamp
  updated_at?: string; // Optional DB timestamp
}
