import { create } from "zustand";

// Define the type for the form data fields managed by the store
// Exclude fields that are pre-filled, generated, or derived
export interface TimsFormData {
  // Export this interface
  full_name: string;
  nationality: string;
  passport_number: string;
  gender: string;
  date_of_birth: string;
  entry_date: string;
  exit_date: string;
  nepal_contact_name: string;
  nepal_organization: string;
  nepal_designation?: string;
  nepal_mobile: string;
  nepal_office_number?: string;
  nepal_address: string;
  home_contact_name: string;
  home_city: string;
  home_mobile: string;
  home_office_number?: string;
  home_address: string;
}

export interface TimsFormState extends TimsFormData {
  // Export this interface
  // Include pre-filled fields separately if needed for display, but manage updates carefully
  trekker_area: string;
  route: string;
  setFormField: <K extends keyof TimsFormData>(
    field: K,
    value: TimsFormData[K]
  ) => void;
  initializeForm: (trekArea: string, trekRoute: string) => void;
  resetForm: () => void;
}

const initialFormData: TimsFormData = {
  full_name: "",
  nationality: "",
  passport_number: "",
  gender: "",
  date_of_birth: "",
  entry_date: "",
  exit_date: "",
  nepal_contact_name: "",
  nepal_organization: "",
  nepal_designation: "",
  nepal_mobile: "",
  nepal_office_number: "",
  nepal_address: "",
  home_contact_name: "",
  home_city: "",
  home_mobile: "",
  home_office_number: "",
  home_address: "",
};

export const useTimsFormStore = create<TimsFormState>((set) => ({
  ...initialFormData,
  trekker_area: "", // Initial values for pre-filled fields
  route: "",
  setFormField: (field, value) =>
    set((state) => ({ ...state, [field]: value })),
  initializeForm: (trekArea, trekRoute) =>
    set({
      ...initialFormData, // Reset other fields
      trekker_area: trekArea,
      route: trekRoute,
    }),
  resetForm: () => set({ ...initialFormData, trekker_area: "", route: "" }), // Also clear pre-filled on reset
}));
