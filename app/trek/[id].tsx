import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTrekStore } from "@/store/trek-store";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/constants/colors";
import {
  Heart,
  Clock,
  Mountain,
  Calendar,
  DollarSign,
  MapPin,
  AlertTriangle,
  List,
} from "lucide-react-native";
import TrekMapView from "@/components/TrekMapView"; // Import the map component

const { width } = Dimensions.get("window");

export default function TrekDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { treks, toggleFavorite, isFavorite } = useTrekStore();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);

  const trek = treks.find((t) => t.id === Number(id));

  // Check if trek is favorite when component mounts or when auth state changes
  useEffect(() => {
    if (trek) {
      const isTrekFavorite = isFavorite(trek.id);
      setFavorite(isTrekFavorite);
    }
  }, [trek, user?.savedTreks, isAuthenticated]);

  if (!trek) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trek not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleFavorite = async () => {
    try {
      // Update local state immediately for better UX
      setFavorite(!favorite);

      // Use the store to toggle favorite (handles both auth and local storage)
      toggleFavorite(trek.id);
    } catch (error) {
      // Revert local state if there's an error
      setFavorite(favorite);
      Alert.alert("Error", "Failed to update favorites. Please try again.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <View>
            <Text style={styles.description}>{trek.description}</Text>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Mountain size={18} color={colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Max Elevation</Text>
                    <Text style={styles.infoValue}>
                      {trek.elevation_profile.max_elevation}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Clock size={18} color={colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Duration</Text>
                    <Text style={styles.infoValue}>{trek.duration}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Calendar size={18} color={colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Best Seasons</Text>
                    <Text style={styles.infoValue}>
                      {trek.best_seasons.join(", ")}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <MapPin size={18} color={colors.primary} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Region</Text>
                    <Text style={styles.infoValue}>{trek.region}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Add the TrekMapView component here */}
            {trek && <TrekMapView trek={trek} />}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historical Significance</Text>
              <Text style={styles.sectionText}>
                {trek.historical_significance}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nearby Attractions</Text>
              <View style={styles.tagContainer}>
                {trek.nearby_attractions.map((attraction, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{attraction}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Safety Information</Text>
              <View style={styles.safetyContainer}>
                <AlertTriangle size={18} color={colors.warning} />
                <Text style={styles.safetyText}>
                  Altitude Sickness Risk:{" "}
                  {trek.safety_info.altitude_sickness_risk}
                </Text>
              </View>
            </View>
          </View>
        );

      case "itinerary":
        return (
          <View style={styles.itineraryContainer}>
            {trek.itinerary.map((day, index) => (
              <View key={index} style={styles.itineraryItem}>
                <View style={styles.itineraryDot} />
                <View style={styles.itineraryContent}>
                  <Text style={styles.itineraryDay}>{day}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      case "costs":
        return (
          <View>
            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Permits</Text>
              <Text style={styles.costText}>{trek.cost_breakdown.permits}</Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Guide</Text>
              <Text style={styles.costText}>{trek.cost_breakdown.guide}</Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Porter</Text>
              <Text style={styles.costText}>{trek.cost_breakdown.porter}</Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Accommodation</Text>
              <Text style={styles.costText}>
                {trek.cost_breakdown.accommodation}
              </Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Food</Text>
              <Text style={styles.costText}>{trek.cost_breakdown.food}</Text>
            </View>

            <View style={styles.costSection}>
              <Text style={styles.costTitle}>Transportation</Text>
              <Text style={styles.costText}>{trek.transportation}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Permits</Text>
              <View style={styles.tagContainer}>
                {trek.required_permits.map((permit, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{permit}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      case "gear":
        return (
          <View>
            <Text style={styles.gearIntro}>
              Essential gear for the {trek.name}:
            </Text>
            <View style={styles.gearList}>
              {trek.recommended_gear.map((gear, index) => (
                <View key={index} style={styles.gearItem}>
                  <View style={styles.gearDot} />
                  <Text style={styles.gearText}>{gear}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.floor(
              event.nativeEvent.contentOffset.x / width
            );
            setActiveImageIndex(newIndex);
          }}
        >
          {trek.photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View style={styles.imagePagination}>
          {trek.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeImageIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
          activeOpacity={0.7}
        >
          <Heart
            size={24}
            color={colors.white}
            fill={favorite ? colors.error : "none"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{trek.name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.location}>
              {trek.district}, {trek.region}
            </Text>
          </View>

          <View style={styles.difficultyContainer}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(trek.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{trek.difficulty}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "overview" && styles.activeTab]}
            onPress={() => setActiveTab("overview")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "overview" && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "itinerary" && styles.activeTab]}
            onPress={() => setActiveTab("itinerary")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "itinerary" && styles.activeTabText,
              ]}
            >
              Itinerary
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "costs" && styles.activeTab]}
            onPress={() => setActiveTab("costs")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "costs" && styles.activeTabText,
              ]}
            >
              Costs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "gear" && styles.activeTab]}
            onPress={() => setActiveTab("gear")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "gear" && styles.activeTabText,
              ]}
            >
              Gear
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>{renderTabContent()}</View>
      </View>
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
  },
  imageContainer: {
    height: 300,
    position: "relative",
  },
  image: {
    width,
    height: 300,
  },
  imagePagination: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.white,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  difficultyContainer: {
    flexDirection: "row",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  difficultyText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTextContainer: {
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.text,
  },
  safetyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.warning}20`,
    borderRadius: 8,
    padding: 12,
  },
  safetyText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  itineraryContainer: {
    marginTop: 8,
  },
  itineraryItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  itineraryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
    marginRight: 12,
  },
  itineraryContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  itineraryDay: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  costSection: {
    marginBottom: 16,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  costText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  gearIntro: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  gearList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  gearItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  gearDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  gearText: {
    fontSize: 14,
    color: colors.text,
  },
});
