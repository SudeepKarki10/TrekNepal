import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { colors } from "@/constants/colors";
import { useTrekStore } from "@/store/trek-store";
import { Trek } from "@/types/trek";
import { MapPin, ArrowLeft } from "lucide-react-native";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import TrekMapCard from "@/components/TrekMapCard";
import TrekMapView from "@/components/TrekMapView";

const { width } = Dimensions.get("window");

export default function MapScreen() {
  const { treks, fetchTreks, searchQuery, searchTreks, resetFilters } =
    useTrekStore();
  const [selectedTrek, setSelectedTrek] = useState<Trek | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filteredTreks, setFilteredTreks] = useState<Trek[]>([]);

  useEffect(() => {
    fetchTreks();
  }, []);

  useEffect(() => {
    // Filter treks based on search query
    if (searchQuery) {
      const filtered = treks.filter(
        (trek) =>
          trek.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trek.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trek.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTreks(filtered);
    } else {
      setFilteredTreks(treks);
    }
  }, [searchQuery, treks]);

  const handleTrekSelect = (trek: Trek) => {
    setSelectedTrek(trek);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return colors.difficulty.easy;
      case "moderate":
        return colors.difficulty.moderate;
      case "challenging":
        return colors.difficulty.challenging;
      case "extreme":
        return colors.difficulty.extreme;
      default:
        return colors.difficulty.moderate;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trek Maps</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={searchTreks}
          placeholder="Search trek maps..."
        />
      </View>

      <View style={styles.filterRow}>
        <FilterButton onPress={() => {}} activeFilters={0} />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              resetFilters();
            }}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredTreks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TrekMapCard trek={item} onPress={handleTrekSelect} />
        )}
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

      {/* Trek Map Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedTrek?.name}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedTrek && (
              <>
                <Image
                  source={{ uri: selectedTrek.photos[0] }}
                  style={styles.trekImage}
                  resizeMode="cover"
                />

                <View style={styles.trekInfo}>
                  <Text style={styles.trekName}>{selectedTrek.name}</Text>

                  <View style={styles.trekLocation}>
                    <MapPin size={16} color={colors.textSecondary} />
                    <Text style={styles.locationText}>
                      {selectedTrek.district}, {selectedTrek.region}
                    </Text>
                  </View>

                  <View style={styles.trekDetails}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        {
                          backgroundColor: getDifficultyColor(
                            selectedTrek.difficulty
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.difficultyText}>
                        {selectedTrek.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.durationText}>
                      {selectedTrek.duration}
                    </Text>
                  </View>

                  <Text style={styles.trekDescription}>
                    {selectedTrek.description}
                  </Text>
                </View>

                <View style={styles.mapContainer}>
                  <Text style={styles.mapTitle}>Trek Route Map</Text>
                  <TrekMapView trek={selectedTrek} />
                </View>

                {selectedTrek.itinerary_points &&
                selectedTrek.itinerary_points.length > 0 ? (
                  <View style={styles.itineraryContainer}>
                    <Text style={styles.itineraryTitle}>Itinerary Points</Text>
                    {selectedTrek.itinerary_points.map((point, index) => (
                      <View key={index} style={styles.itineraryItem}>
                        <View style={styles.itineraryNumber}>
                          <Text style={styles.itineraryNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={styles.itineraryName}>{point.name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noItineraryContainer}>
                    <Text style={styles.noItineraryText}>
                      Detailed itinerary points coming soon
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  listContainer: {
    padding: 16,
    paddingTop: 0,
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

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
  },
  trekImage: {
    width: "100%",
    height: 200,
  },
  trekInfo: {
    padding: 16,
  },
  trekName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  trekLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  trekDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 12,
  },
  difficultyText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  durationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  trekDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  mapContainer: {
    padding: 16,
    paddingTop: 0,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  itineraryContainer: {
    padding: 16,
    paddingTop: 0,
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  itineraryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itineraryNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itineraryNumberText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  itineraryName: {
    fontSize: 16,
    color: colors.text,
  },
  noItineraryContainer: {
    padding: 16,
    paddingTop: 0,
    alignItems: "center",
  },
  noItineraryText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
});
