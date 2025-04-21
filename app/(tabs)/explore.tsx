import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  StatusBar,
  Pressable,
} from "react-native";
import { useTrekStore } from "@/store/trek-store";
import { colors } from "@/constants/colors";
import TrekCard from "@/components/TrekCard";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import { TrekDifficulty } from "@/types/trek";

export default function ExploreScreen() {
  const {
    filteredTreks,
    fetchTreks,
    searchQuery,
    searchTreks,
    selectedDifficulty,
    selectedRegion,
    selectedDuration,
    filterByDifficulty,
    filterByRegion,
    filterByDuration,
    resetFilters,
  } = useTrekStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTreks();
  }, []);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedDifficulty) count++;
    if (selectedRegion) count++;
    if (selectedDuration) count++;
    return count;
  };

  const difficulties: TrekDifficulty[] = [
    "Easy",
    "Moderate",
    "Challenging",
    "Extreme",
  ];
  const regions = ["Everest", "Annapurna", "Langtang", "Manaslu", "Mustang"];
  const durations = [
    { id: "short", label: "Short (1-7 days)" },
    { id: "medium", label: "Medium (8-14 days)" },
    { id: "long", label: "Long (15+ days)" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Treks</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar value={searchQuery} onChangeText={searchTreks} />
      </View>

      <View style={styles.filterRow}>
        <FilterButton
          onPress={() => setShowFilters(!showFilters)}
          activeFilters={getActiveFiltersCount()}
        />
        {getActiveFiltersCount() > 0 && (
          <Pressable
            style={styles.resetButton}
            onPress={() => {
              resetFilters();
              setShowFilters(false);
            }}
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        )}
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Difficulty</Text>
            <View style={styles.filterOptions}>
              {difficulties.map((difficulty) => (
                <Pressable
                  key={difficulty}
                  style={[
                    styles.filterOption,
                    selectedDifficulty === difficulty &&
                      styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    filterByDifficulty(
                      selectedDifficulty === difficulty ? null : difficulty
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDifficulty === difficulty &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {difficulty}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Region</Text>
            <View style={styles.filterOptions}>
              {regions.map((region) => (
                <Pressable
                  key={region}
                  style={[
                    styles.filterOption,
                    selectedRegion === region && styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    filterByRegion(selectedRegion === region ? null : region)
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedRegion === region &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {region}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Duration</Text>
            <View style={styles.filterOptions}>
              {durations.map((duration) => (
                <Pressable
                  key={duration.id}
                  style={[
                    styles.filterOption,
                    selectedDuration === duration.id &&
                      styles.filterOptionActive,
                  ]}
                  onPress={() =>
                    filterByDuration(
                      selectedDuration === duration.id ? null : duration.id
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDuration === duration.id &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {duration.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={filteredTreks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TrekCard trek={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No treks found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  searchContainer: {
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resetText: {
    color: colors.primary,
    fontWeight: "500",
  },
  filtersContainer: {
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    color: colors.text,
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
