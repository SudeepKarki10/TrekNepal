import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity, // Changed from Button
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../utils/supabase"; // Assuming supabase client is here
import { Trek } from "../../types/trek"; // Assuming Trek type is defined here
import { useTrekStore } from "@/store/trek-store"; // Import trek store
import { useAuthStore } from "@/store/auth-store"; // Import auth store
import { colors } from "@/constants/colors"; // Import colors

// Define the type for the form data based on the SQL schema
interface TimsApplicationData {
  tims_card_no: string; // This might be generated server-side or later
  transaction_id: string; // This might be generated server-side or later
  issue_date: string; // This might be generated server-side or later
  full_name: string;
  nationality: string;
  passport_number: string;
  gender: string;
  date_of_birth: string; // Use string for input, convert later if needed
  trekker_area: string;
  route: string;
  entry_date: string; // Use string for input, convert later if needed
  exit_date: string; // Use string for input, convert later if needed
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
  permit_cost: number; // Added permit cost
  user_id?: string; // Add user_id (optional here, added during submission)
  // status and payment_status will likely have default values in DB
}

// Utility function to generate TIMS Card Number
const generateTimsCardNo = (length = 8) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const TimsApplyScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    trekId: string;
    trekArea: string;
    trekRoute: string;
  }>();
  const { trekId, trekArea, trekRoute } = params;
  const { treks } = useTrekStore(); // Get treks from store
  const { user, isAuthenticated } = useAuthStore(); // Get user and auth status
  const [trekData, setTrekData] = useState<Trek | null>(null); // State for the specific trek
  const [isTrekLoading, setIsTrekLoading] = useState(true); // Loading state for trek data

  // Reverted back to local state for form data
  const [formData, setFormData] = useState<Partial<TimsApplicationData>>({
    trekker_area: trekArea || "", // Initialize with params
    route: trekRoute || "", // Initialize with params
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
    transaction_id: "", // Add transaction_id to state
    // permit_cost will be set after fetching trek data
  });
  const [loading, setLoading] = useState(false); // Submission loading state

  // Fetch trek data when component mounts or trekId changes
  useEffect(() => {
    setIsTrekLoading(true);
    if (trekId) {
      const foundTrek = treks.find((t) => t.id === Number(trekId));
      if (foundTrek) {
        setTrekData(foundTrek);
        // Update formData with pre-filled fields if needed (though already done in initial state)
        setFormData((prev) => ({
          ...prev,
          trekker_area: foundTrek.region || trekArea || "",
          route: foundTrek.name || trekRoute || "",
        }));
      } else {
        Alert.alert("Error", "Trek details could not be loaded.");
      }
    }
    setIsTrekLoading(false);
  }, [trekId, treks, trekArea, trekRoute]); // Dependencies

  // Function to handle input changes using local state
  const handleInputChange = (
    // Allow transaction_id to be updated via this handler
    name: keyof Omit<
      TimsApplicationData,
      "tims_card_no" | "issue_date" | "permit_cost" // Only exclude generated/derived fields
    >,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // Ensure trek data is loaded before submitting
    if (isTrekLoading || !trekData) {
      Alert.alert("Please wait", "Loading trek details...");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user?.uid) {
      Alert.alert(
        "Authentication Required",
        "Please log in to submit a permit application."
      );
      // Optionally redirect to login: router.push('/auth/login');
      return;
    }

    setLoading(true);

    // Define required fields based on TimsApplicationData keys (excluding generated/derived/optional)
    const requiredFields: (keyof Omit<
      TimsApplicationData,
      | "tims_card_no"
      // | "transaction_id" // No longer excluding transaction_id
      | "issue_date"
      | "permit_cost"
      | "nepal_designation"
      | "nepal_office_number"
      | "home_office_number"
    >)[] = [
      "full_name",
      "nationality",
      "passport_number",
      "gender",
      "date_of_birth",
      "trekker_area", // Keep these as they are part of the form display/submission
      "route", // Keep these as they are part of the form display/submission
      "entry_date",
      "exit_date",
      "nepal_contact_name",
      "nepal_organization",
      "nepal_mobile",
      "nepal_address",
      "home_contact_name",
      "home_city",
      "home_mobile",
      "home_address",
      "transaction_id", // Add transaction_id to required fields
    ];

    // Validate only the required fields from local formData
    for (const field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        Alert.alert(
          "Error",
          `Please fill in the ${field.replace(/_/g, " ")} field.`
        );
        setLoading(false);
        return;
      }
    }

    try {
      // Generate TIMS Card No
      const timsCardNo = generateTimsCardNo();
      // Get current date/time for issue_date
      const issueDate = new Date().toISOString();

      // Prepare data for Supabase using local formData
      const submissionData: Partial<TimsApplicationData> = {
        ...formData, // Spread the current form data (includes user-entered transaction_id)
        user_id: user.uid, // Add the user ID
        tims_card_no: timsCardNo,
        issue_date: issueDate, // Add current timestamp
        permit_cost: trekData.transit_card_cost, // Add permit cost from fetched trek data
      };

      // Ensure all required fields for the DB are present before insertion
      if (
        !submissionData.user_id || // Check user_id
        !submissionData.tims_card_no ||
        !submissionData.transaction_id || // Check user-entered transaction_id
        !submissionData.issue_date || // Check generated issue_date
        submissionData.permit_cost === undefined ||
        !submissionData.trekker_area || // Double check pre-filled fields too
        !submissionData.route
      ) {
        throw new Error(
          "Missing required user ID, TIMS card number, transaction ID, issue date, permit cost, or trek details."
        );
      }

      const { data, error } = await supabase
        .from("tims_applications") // Use the exact table name
        .insert([submissionData as TimsApplicationData]) // Assert type after adding required fields
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      Alert.alert("Success", "TIMS application submitted successfully!");

      // Get the ID of the newly created record
      const newPermitId = data?.[0]?.id;

      // Reset local form state after successful submission
      setFormData({
        trekker_area: trekArea || "", // Keep pre-filled
        route: trekRoute || "", // Keep pre-filled
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
        transaction_id: "", // Reset transaction_id field
      });

      // Redirect to the download page, passing the new permit ID
      if (newPermitId) {
        router.push({
          pathname: "/tims/download",
          params: { permitId: newPermitId },
        });
      } else {
        // Handle case where ID wasn't returned (optional, but good practice)
        Alert.alert(
          "Submission successful, but could not navigate to download page."
        );
        // Maybe navigate back or to a generic success page
      }
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to render input fields with labels
  const renderInput = (
    label: string,
    placeholder: string,
    // Use the correct key type for local state
    value: string | undefined,
    onChange: (text: string) => void,
    options: {
      keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
      multiline?: boolean;
      editable?: boolean;
      isOptional?: boolean;
    } = {}
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {options.isOptional && (
          <Text style={styles.optionalText}> (Optional)</Text>
        )}
      </Text>
      <TextInput
        style={[
          styles.input,
          options.multiline && styles.multilineInput,
          options.editable === false && styles.disabledInput,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChange}
        keyboardType={options.keyboardType || "default"}
        multiline={options.multiline || false}
        editable={options.editable !== false}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {isTrekLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading Trek Details...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>TIMS Application Form</Text>
          <Text style={styles.trekInfo}>
            Applying for: {formData.trekker_area} - {formData.route}{" "}
            {/* Use local formData */}
          </Text>
          <Text style={styles.costInfo}>
            Permit Cost: NPR {trekData?.transit_card_cost ?? "N/A"}
          </Text>

          {/* Personal Information - Use local formData and handleInputChange */}
          {renderInput(
            "Full Name",
            "Enter your full name",
            formData.full_name,
            (text) => handleInputChange("full_name", text)
          )}
          {renderInput(
            "Nationality",
            "Enter your nationality",
            formData.nationality,
            (text) => handleInputChange("nationality", text)
          )}
          {renderInput(
            "Passport Number",
            "Enter passport number",
            formData.passport_number,
            (text) => handleInputChange("passport_number", text)
          )}
          {renderInput(
            "Gender",
            "e.g., Male, Female, Other",
            formData.gender,
            (text) => handleInputChange("gender", text)
          )}
          {renderInput(
            "Date of Birth",
            "YYYY-MM-DD",
            formData.date_of_birth,
            (text) => handleInputChange("date_of_birth", text)
          )}

          {/* Trek Information */}
          {renderInput("Trekker Area", "", formData.trekker_area, () => {}, {
            editable: false,
          })}
          {renderInput("Route", "", formData.route, () => {}, {
            editable: false,
          })}
          {renderInput(
            "Entry Date",
            "YYYY-MM-DD",
            formData.entry_date,
            (text) => handleInputChange("entry_date", text)
          )}
          {renderInput("Exit Date", "YYYY-MM-DD", formData.exit_date, (text) =>
            handleInputChange("exit_date", text)
          )}
          {/* Add Transaction ID Input */}
          {renderInput(
            "Transaction ID",
            "Enter payment transaction ID",
            formData.transaction_id,
            (text) => handleInputChange("transaction_id", text)
          )}

          {/* Nepal Contact Details */}
          <Text style={styles.sectionTitle}>Nepal Contact Details</Text>
          {renderInput(
            "Contact Name",
            "Emergency contact in Nepal",
            formData.nepal_contact_name,
            (text) => handleInputChange("nepal_contact_name", text)
          )}
          {renderInput(
            "Organization",
            "Your organization in Nepal (if any)",
            formData.nepal_organization,
            (text) => handleInputChange("nepal_organization", text)
          )}
          {renderInput(
            "Designation",
            "Your designation",
            formData.nepal_designation,
            (text) => handleInputChange("nepal_designation", text),
            { isOptional: true }
          )}
          {renderInput(
            "Mobile Number",
            "Nepal mobile number",
            formData.nepal_mobile,
            (text) => handleInputChange("nepal_mobile", text),
            { keyboardType: "phone-pad" }
          )}
          {renderInput(
            "Office Number",
            "Nepal office number",
            formData.nepal_office_number,
            (text) => handleInputChange("nepal_office_number", text),
            { keyboardType: "phone-pad", isOptional: true }
          )}
          {renderInput(
            "Address",
            "Full address in Nepal",
            formData.nepal_address,
            (text) => handleInputChange("nepal_address", text),
            { multiline: true }
          )}

          {/* Home Country Contact Details */}
          <Text style={styles.sectionTitle}>Home Country Contact Details</Text>
          {renderInput(
            "Contact Name",
            "Emergency contact back home",
            formData.home_contact_name,
            (text) => handleInputChange("home_contact_name", text)
          )}
          {renderInput("City", "Your home city", formData.home_city, (text) =>
            handleInputChange("home_city", text)
          )}
          {renderInput(
            "Mobile Number",
            "Home mobile number",
            formData.home_mobile,
            (text) => handleInputChange("home_mobile", text),
            { keyboardType: "phone-pad" }
          )}
          {renderInput(
            "Office Number",
            "Home office number",
            formData.home_office_number,
            (text) => handleInputChange("home_office_number", text),
            { keyboardType: "phone-pad", isOptional: true }
          )}
          {renderInput(
            "Address",
            "Full home address",
            formData.home_address,
            (text) => handleInputChange("home_address", text),
            { multiline: true }
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Submitting..." : "Submit Application"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </>
      )}
    </ScrollView>
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: colors.text,
  },
  trekInfo: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: "center",
    color: colors.textSecondary,
  },
  costInfo: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: colors.primary,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 25,
    marginBottom: 15,
    color: colors.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  optionalText: {
    fontStyle: "italic",
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  disabledInput: {
    backgroundColor: colors.border,
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
    elevation: 0,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TimsApplyScreen;
