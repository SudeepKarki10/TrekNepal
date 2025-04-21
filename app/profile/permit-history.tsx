import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FileText, ChevronRight } from "lucide-react-native";
import { supabase } from "../../utils/supabase"; // Adjust path if needed
import { useAuthStore } from "@/store/auth-store"; // Adjust path if needed
import { PermitData } from "../../types/permit"; // Adjust path if needed
import { colors } from "@/constants/colors"; // Adjust path if needed

export default function PermitHistoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPermits = async () => {
    if (!user?.uid) {
      setError("User not authenticated.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setError(null); // Clear previous errors
    try {
      const { data, error: dbError } = await supabase
        .from("tims_applications")
        .select("*")
        .eq("user_id", user.uid) // Assuming you have a user_id column
        .order("created_at", { ascending: false }); // Show newest first

      if (dbError) {
        throw dbError;
      }

      // Ensure permit_cost is a number
      const formattedData = data.map((item) => ({
        ...item,
        permit_cost: Number(item.permit_cost) || 0,
      })) as PermitData[];

      setPermits(formattedData);
    } catch (err: any) {
      console.error("Error fetching permit history:", err);
      setError(err.message || "Failed to fetch permit history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPermits();
  }, [user?.uid]); // Refetch if user changes

  const onRefresh = () => {
    setRefreshing(true);
    fetchPermits();
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

  const renderPermitItem = ({ item }: { item: PermitData }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        router.push({
          pathname: "/tims/download",
          params: { permitId: item.id },
        })
      }
      activeOpacity={0.7}
    >
      <FileText size={24} color={colors.primary} style={styles.itemIcon} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.route || "Unknown Route"}</Text>
        <Text style={styles.itemSubtitle}>TIMS No: {item.tims_card_no}</Text>
        <Text style={styles.itemDate}>
          Issued: {formatDateShort(item.issue_date)}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No permit history found.</Text>
      {/* Optionally add a button to navigate somewhere else */}
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          {/* Optionally add a retry button */}
          <TouchableOpacity onPress={fetchPermits} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={permits}
        renderItem={renderPermitItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderListEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Permit History</Text>
        {/* Add maybe a filter or sort button here later */}
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  listContent: {
    paddingVertical: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 3,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  itemDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
