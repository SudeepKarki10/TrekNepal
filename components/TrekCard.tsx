import React from "react";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import { Link } from "expo-router";
import { Trek } from "@/types/trek";
import { colors } from "@/constants/colors";
import { Clock, Mountain } from "lucide-react-native";

interface TrekCardProps {
  trek: Trek;
  compact?: boolean;
}

export const TrekCard: React.FC<TrekCardProps> = ({
  trek,
  compact = false,
}) => {
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

  if (compact) {
    return (
      <Link href={`/trek/${trek.id}`} asChild>
        <Pressable style={styles.compactContainer}>
          <Image
            source={{ uri: trek.photos[0] }}
            style={styles.compactImage}
            resizeMode="cover"
          />
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {trek.name}
            </Text>
            <View style={styles.compactDetails}>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(trek.difficulty) },
                ]}
              >
                <Text style={styles.difficultyText}>{trek.difficulty}</Text>
              </View>
              <View style={styles.durationContainer}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={styles.durationText}>{trek.duration}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Link>
    );
  }

  return (
    <Link href={`/trek/${trek.id}`} asChild>
      <Pressable style={styles.container}>
        <Image
          source={{ uri: trek.photos[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Text style={styles.title}>{trek.name}</Text>
          <View style={styles.details}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(trek.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{trek.difficulty}</Text>
            </View>
            <View style={styles.durationContainer}>
              <Clock size={14} color={colors.white} />
              <Text style={styles.durationText}>{trek.duration}</Text>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <Mountain size={14} color={colors.white} />
            <Text style={styles.locationText}>{trek.region}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 12,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 8,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  difficultyText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: 4,
  },

  // Compact styles
  compactContainer: {
    width: 280,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: "100%",
    height: 120,
  },
  compactContent: {
    padding: 12,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  compactDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default TrekCard;
