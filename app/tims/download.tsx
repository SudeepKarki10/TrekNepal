import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Download, Eye, FileText } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams } from "expo-router"; // To get permitId
import { supabase } from "../../utils/supabase"; // Import supabase client
import { colors } from "@/constants/colors"; // Import colors
import { generatePermitHtml } from "../../utils/permitGenerator"; // Import generator
import { PermitData } from "../../types/permit"; // Import PermitData type

export default function TimsDownloadScreen() {
  const params = useLocalSearchParams<{ permitId?: string }>(); // Get permitId from route params
  const [permitData, setPermitData] = useState<PermitData | null>(null);
  const [loading, setLoading] = useState(false); // Loading state for PDF generation/sharing
  const [isFetching, setIsFetching] = useState(true); // Loading state for fetching data
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermitData = async () => {
      if (!params.permitId) {
        setFetchError("Permit ID not found.");
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      setFetchError(null);

      try {
        const { data, error } = await supabase
          .from("tims_applications")
          .select("*")
          .eq("id", params.permitId)
          .single(); // Fetch a single record

        if (error) {
          throw error;
        }

        if (data) {
          // Ensure permit_cost is a number if it comes as string from DB
          const formattedData = {
            ...data,
            permit_cost: Number(data.permit_cost) || 0,
          };
          setPermitData(formattedData as PermitData);
        } else {
          setFetchError("Permit data not found.");
        }
      } catch (error: any) {
        console.error("Error fetching permit data:", error);
        setFetchError(error.message || "Failed to fetch permit data.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPermitData();
  }, [params.permitId]); // Re-fetch if permitId changes

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const formatDateShort = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const generatePdf = async () => {
    if (!permitData) {
      Alert.alert("Error", "Permit data not available.");
      return;
    }
    if (Platform.OS === "web") {
      Alert.alert(
        "Not supported",
        "PDF generation/sharing is not supported on web."
      );
      return;
    }

    try {
      setLoading(true);

      // Generate HTML content using fetched data
      const htmlContent = generatePermitHtml(permitData);

      // Create temporary HTML file
      const htmlFilePath = `${FileSystem.cacheDirectory}permit_${permitData.id}.html`;
      await FileSystem.writeAsStringAsync(htmlFilePath, htmlContent);

      // Create a file with .pdf extension (for demonstration/sharing intent)
      const pdfFilePath = `${FileSystem.cacheDirectory}tims_permit_${permitData.tims_card_no}.pdf`;

      // Copy the HTML file to the PDF file path (This doesn't convert to PDF)
      // For actual PDF generation, a library like react-native-html-to-pdf would be needed
      await FileSystem.copyAsync({
        from: htmlFilePath,
        to: pdfFilePath,
      });

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        // Share the file (will likely share as HTML if opened on device, despite .pdf extension)
        await Sharing.shareAsync(pdfFilePath, {
          mimeType: "application/pdf", // Intent to share as PDF
          dialogTitle: "Download TIMS Permit",
          UTI: "com.adobe.pdf", // for iOS
        });
      } else {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device. File saved at: " +
            pdfFilePath
        );
        // Optionally, inform user where the file is saved if sharing fails
      }
    } catch (error) {
      console.error("Error generating/sharing PDF:", error);
      Alert.alert("Error", "Failed to generate or share PDF");
    } finally {
      setLoading(false);
    }
  };

  const viewPermitDetails = () => {
    if (!permitData) {
      Alert.alert("Error", "Permit data not available.");
      return;
    }
    // Display more details or navigate to a dedicated detail view if needed
    Alert.alert(
      "TIMS Permit Details",
      `TIMS Card No: ${permitData.tims_card_no}\nTransaction ID: ${permitData.transaction_id}\nFull Name: ${permitData.full_name}\nPassport: ${permitData.passport_number}`
    );
  };

  // Display Loading state
  if (isFetching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Permit Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Display Error state
  if (fetchError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading permit:</Text>
          <Text style={styles.errorDetails}>{fetchError}</Text>
          {/* Optionally add a retry button */}
        </View>
      </SafeAreaView>
    );
  }

  // Display Permit Data
  if (!permitData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Permit data could not be loaded.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Helper to safely display potentially null values
  const displayValue = (
    value: string | number | null | undefined,
    defaultValue = "N/A"
  ) => {
    return value !== null && value !== undefined ? String(value) : defaultValue;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your TIMS Permit</Text>
          <Text style={styles.subtitle}>
            View and download your trekking permit
          </Text>
        </View>

        <View style={styles.permitCard}>
          <View style={styles.permitHeader}>
            <FileText size={24} color={colors.primary} />
            <View style={styles.permitHeaderText}>
              <Text style={styles.permitTitle}>
                TIMS Card: {displayValue(permitData.tims_card_no)}
              </Text>
              <Text style={styles.permitSubtitle}>
                Transaction ID: {displayValue(permitData.transaction_id)}
              </Text>
            </View>
          </View>

          <View style={styles.permitSection}>
            <Text style={styles.sectionTitle}>Trekker Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Full Name:</Text>
                <Text style={styles.detailValue}>
                  {displayValue(permitData.full_name)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Issue Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDateShort(permitData.issue_date)}
                </Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Nationality:</Text>
                <Text style={styles.detailValue}>
                  {displayValue(permitData.nationality)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Passport No:</Text>
                <Text style={styles.detailValue}>
                  {displayValue(permitData.passport_number)}
                </Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Gender:</Text>
                <Text style={styles.detailValue}>
                  {displayValue(permitData.gender)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Date of Birth:</Text>
                <Text style={styles.detailValue}>
                  {formatDateShort(permitData.date_of_birth)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.permitSection}>
            <Text style={styles.sectionTitle}>Trek Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trekker Area:</Text>
              <Text style={styles.detailValue}>
                {displayValue(permitData.trekker_area)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Route:</Text>
              <Text style={styles.detailValue}>
                {displayValue(permitData.route)}
              </Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Entry Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDateShort(permitData.entry_date)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Exit Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDateShort(permitData.exit_date)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.contactsContainer}>
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Nepal Contact</Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Name: </Text>
                {displayValue(permitData.nepal_contact_name)}
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Organization: </Text>
                {displayValue(permitData.nepal_organization)}
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Mobile: </Text>
                {displayValue(permitData.nepal_mobile)}
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Address: </Text>
                {displayValue(permitData.nepal_address)}
              </Text>
            </View>

            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Home Contact</Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Name: </Text>
                {displayValue(permitData.home_contact_name)}
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>City: </Text>
                {displayValue(permitData.home_city)}
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Mobile: </Text>
                {displayValue(permitData.home_mobile)}
              </Text>
              <Text style={styles.contactItem}>
                <Text style={styles.contactLabel}>Address: </Text>
                {displayValue(permitData.home_address)}
              </Text>
            </View>
          </View>

          <View style={styles.permitSection}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <Text style={styles.emergencyItem}>• 1144 - Tourist Police</Text>
            <Text style={styles.emergencyItem}>• 9808717598 (Agency)</Text>
            <Text style={styles.emergencyItem}>
              • 01-45 40 920 (TAAN, Kathmandu)
            </Text>
            <Text style={styles.emergencyItem}>
              • 01-42 25 709 (Crisis Hotline NTB)
            </Text>
          </View>

          <View style={styles.permitSection}>
            <Text style={styles.sectionTitle}>Permit Status</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text
                  style={[
                    styles.statusValue,
                    permitData.status === "pending"
                      ? styles.statusPending
                      : styles.statusApproved,
                  ]}
                >
                  {displayValue(permitData.status).charAt(0).toUpperCase() +
                    displayValue(permitData.status).slice(1)}
                </Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Payment:</Text>
                <Text
                  style={[
                    styles.statusValue,
                    permitData.payment_status === "pending"
                      ? styles.statusPending
                      : styles.statusApproved,
                  ]}
                >
                  {displayValue(permitData.payment_status)
                    .charAt(0)
                    .toUpperCase() +
                    displayValue(permitData.payment_status).slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Permit Cost:</Text>
              <Text style={styles.detailValue}>
                NPR {displayValue(permitData.permit_cost)}
              </Text>
            </View>
          </View>

          <View style={styles.regulations}>
            <Text style={styles.regulationsTitle}>
              TIMS Regulatory Provisions
            </Text>
            <Text style={styles.regulationItem}>
              • Card cost NRs. {displayValue(permitData.permit_cost)} including
              VAT.
            </Text>
            <Text style={styles.regulationItem}>
              • Please keep this card with you during the trekking period.
            </Text>
            <Text style={styles.regulationItem}>
              • This card is non-transferable and valid only for prescribed area
              and duration.
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={viewPermitDetails}
          >
            <Eye size={20} color="#FFF" />
            <Text style={styles.buttonText}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.downloadButton]}
            onPress={generatePdf}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Download size={20} color="#FFF" />
                <Text style={styles.buttonText}>Download PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Adapted Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Use imported colors
  },
  scrollContent: {
    padding: 20,
  },
  centered: {
    // For loading/error states
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.error,
    textAlign: "center",
    marginBottom: 5,
  },
  errorDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text, // Use imported colors
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary, // Use imported colors
  },
  permitCard: {
    backgroundColor: colors.card, // Use imported colors
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border, // Use imported colors
  },
  permitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border, // Use imported colors
    paddingBottom: 15,
  },
  permitHeaderText: {
    marginLeft: 12,
  },
  permitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary, // Use imported colors
    marginBottom: 4,
  },
  permitSubtitle: {
    fontSize: 14,
    color: colors.textSecondary, // Use imported colors
  },
  permitSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border, // Use imported colors
    paddingBottom: 15,
    // Remove last border
    // &:last-child { borderBottomWidth: 0; paddingBottom: 0; marginBottom: 0; } -> Can't do this easily in RN styles
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.text, // Use imported colors
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Space out label/value
    marginBottom: 8,
  },
  detailsGrid: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailColumn: {
    flex: 1, // Make columns equal width
    paddingRight: 5, // Add spacing between columns
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary, // Use imported colors
    fontWeight: "500",
    marginBottom: 2, // Space between label and value
  },
  detailValue: {
    fontSize: 14,
    color: colors.text, // Use imported colors
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "bold", // Make status bold
  },
  statusPending: {
    color: colors.warning, // Use imported colors
  },
  statusApproved: {
    color: colors.success, // Use imported colors
  },
  contactsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border, // Use imported colors
    paddingBottom: 15,
    gap: 15, // Add gap
  },
  contactSection: {
    flex: 1,
    // Removed paddingRight as gap is used
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.text, // Use imported colors
  },
  contactItem: {
    fontSize: 13,
    marginBottom: 6,
    color: colors.text, // Use imported colors
    lineHeight: 18, // Improve readability
  },
  contactLabel: {
    fontWeight: "500",
    color: colors.textSecondary, // Use imported colors
  },
  emergencyItem: {
    fontSize: 13,
    marginBottom: 6,
    color: colors.text, // Use imported colors
  },
  regulations: {
    marginBottom: 15,
    // Removed border/background for cleaner look, maybe add back if needed
  },
  regulationsTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.text, // Use imported colors
  },
  regulationItem: {
    fontSize: 13,
    marginBottom: 6,
    color: colors.text, // Use imported colors
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10, // Add margin top
    marginBottom: 30,
    gap: 15, // Add gap
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  viewButton: {
    backgroundColor: colors.secondary, // Use imported colors
    // marginRight: 10, // Removed for gap
  },
  downloadButton: {
    backgroundColor: colors.primary, // Use imported colors
    // marginLeft: 10, // Removed for gap
  },
  buttonText: {
    color: colors.white, // Use imported colors
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});
