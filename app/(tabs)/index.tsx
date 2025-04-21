import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import { useTrekStore } from "@/store/trek-store";
import { colors } from "@/constants/colors";
import { Bell } from "lucide-react-native";
import TrekCard from "@/components/TrekCard";
import CategoryCard from "@/components/CategoryCard";
import DestinationCard from "@/components/DestinationCard";
import SearchBar from "@/components/SearchBar";
import { categories, popularDestinations } from "@/mocks/categories";

export default function HomeScreen() {
  const { treks, fetchTreks, searchQuery, searchTreks } = useTrekStore();

  useEffect(() => {
    fetchTreks();
  }, []);

  const featuredTreks = treks.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1605649461784-edc01e8ec95e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
              }}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>Nepal Trek Explorer</Text>
          </View>
          <Bell size={24} color={colors.text} />
        </View>

        <SearchBar value={searchQuery} onChangeText={searchTreks} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Treks</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {featuredTreks.map((trek) => (
              <TrekCard key={trek.id} trek={trek} compact />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore by Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          {popularDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              id={destination.id}
              name={destination.name}
              rating={destination.rating}
              type={destination.type}
              image={destination.image}
            />
          ))}
        </View>
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  featuredContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
});
