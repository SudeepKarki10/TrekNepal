import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";
import { useTrekStore } from "@/store/trek-store";
import {
  Heart,
  LogOut,
  Settings,
  User,
  BookOpen,
  Award,
  MapPin,
} from "lucide-react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    logout,
    successMessage,
    clearSuccessMessage,
    syncFavorites,
  } = useAuthStore();
  const { treks, fetchTreks } = useTrekStore();
  const [favoriteTreks, setFavoriteTreks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure treks are loaded
  useEffect(() => {
    if (treks.length === 0) {
      fetchTreks();
    }
  }, []);

  // Show success message if present
  useEffect(() => {
    if (successMessage) {
      Alert.alert("Success", successMessage);
      clearSuccessMessage();
    }
  }, [successMessage]);

  // Sync favorites when user logs in
  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        try {
          await syncFavorites(user.uid);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to sync favorites:", error);
          setIsLoading(false);
        }
      }
    };

    loadFavorites();
  }, [isAuthenticated, user?.uid]);

  // Update favorite treks whenever user or treks change
  useEffect(() => {
    if (treks.length > 0 && user?.savedTreks) {
      const favTreks = treks.filter((trek) =>
        user.savedTreks?.includes(trek.id)
      );
      setFavoriteTreks(favTreks);
    } else {
      setFavoriteTreks([]);
    }
  }, [user?.savedTreks, treks]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert(
        "Logout Failed",
        "There was a problem logging out. Please try again."
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.authContainer}>
          <User size={60} color={colors.primary} />
          <Text style={styles.authTitle}>Sign in to your account</Text>
          <Text style={styles.authSubtitle}>
            Track your favorite treks, save itineraries, and share your
            experiences
          </Text>

          <Link href="/auth/login" asChild>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/auth/register" asChild>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Settings size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color={colors.white} />
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.displayName || "User"}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user?.savedTreks?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Activities</Text>
          <View style={styles.activityList}>
            <TouchableOpacity style={styles.activityItem} activeOpacity={0.8}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Heart size={20} color={colors.primary} />
              </View>
              <Text style={styles.activityText}>Favorite Treks</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityItem} activeOpacity={0.8}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${colors.secondary}20` },
                ]}
              >
                <BookOpen size={20} color={colors.secondary} />
              </View>
              <Text style={styles.activityText}>Trip Plans</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityItem} activeOpacity={0.8}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${colors.success}20` },
                ]}
              >
                <Award size={20} color={colors.success} />
              </View>
              <Text style={styles.activityText}>Achievements</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityItem} activeOpacity={0.8}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${colors.warning}20` },
                ]}
              >
                <MapPin size={20} color={colors.warning} />
              </View>
              <Text style={styles.activityText}>Visited Places</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading favorites...</Text>
          </View>
        ) : favoriteTreks.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Treks</Text>
            {favoriteTreks.map((trek) => (
              <Link key={trek.id} href={`/trek/${trek.id}`} asChild>
                <TouchableOpacity
                  style={styles.favoriteItem}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: trek.photos[0] }}
                    style={styles.favoriteImage}
                  />
                  <View style={styles.favoriteContent}>
                    <Text style={styles.favoriteName}>{trek.name}</Text>
                    <Text style={styles.favoriteRegion}>{trek.region}</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        ) : (
          <View style={styles.emptyFavoritesContainer}>
            <Heart size={40} color={colors.border} />
            <Text style={styles.emptyFavoritesText}>No favorite treks yet</Text>
            <Text style={styles.emptyFavoritesSubtext}>
              Add treks to your favorites to see them here
            </Text>
            <Link href="/explore" asChild>
              <TouchableOpacity
                style={styles.exploreTreksButton}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreTreksButtonText}>Explore Treks</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  authContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: colors.border,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  activityList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityItem: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  favoriteItem: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  favoriteImage: {
    width: 80,
    height: 80,
  },
  favoriteContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  favoriteRegion: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyFavoritesContainer: {
    alignItems: "center",
    padding: 32,
    marginTop: 16,
  },
  emptyFavoritesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyFavoritesSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  exploreTreksButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  exploreTreksButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 24,
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: "500",
    marginLeft: 8,
  },
});
