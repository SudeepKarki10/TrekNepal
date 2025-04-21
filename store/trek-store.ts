import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { Trek } from "@/types/trek";
import { treks as mockTreks } from "@/mocks/treks";
import { useAuthStore } from "./auth-store";
import {
  getUserFavorites,
  addUserFavorite,
  removeUserFavorite,
  syncTreksToSupabase,
  getTreksFromSupabase,
} from "@/utils/supabase";

interface TrekState {
  treks: Trek[];
  favorites: number[];
  searchQuery: string;
  filteredTreks: Trek[];
  selectedDifficulty: string | null;
  selectedRegion: string | null;
  selectedDuration: string | null;
  isLoading: boolean;

  // Actions
  fetchTreks: () => Promise<void>;
  searchTreks: (query: string) => void;
  toggleFavorite: (trekId: number) => void;
  isFavorite: (trekId: number) => boolean;
  filterByDifficulty: (difficulty: string | null) => void;
  filterByRegion: (region: string | null) => void;
  filterByDuration: (duration: string | null) => void;
  resetFilters: () => void;
  syncFavoritesWithAuth: () => void;
}

export const useTrekStore = create<TrekState>()(
  persist(
    (set, get) => ({
      treks: [],
      favorites: [],
      searchQuery: "",
      filteredTreks: [],
      selectedDifficulty: null,
      selectedRegion: null,
      selectedDuration: null,
      isLoading: false,

      fetchTreks: async () => {
        set({ isLoading: true });

        try {
          // Try to get treks from Supabase first
          const supabaseTreks = await getTreksFromSupabase();

          if (supabaseTreks && supabaseTreks.length > 0) {
            // Use treks from Supabase
            set({
              treks: supabaseTreks,
              filteredTreks: supabaseTreks,
              isLoading: false,
            });
          } else {
            // Fall back to mock data and sync to Supabase
            set({
              treks: mockTreks,
              filteredTreks: mockTreks,
              isLoading: false,
            });

            // Sync mock treks to Supabase in the background
            syncTreksToSupabase(mockTreks).catch((error) => {
              console.error("Failed to sync treks to Supabase:", error);
            });
          }

          // Sync favorites with auth state
          get().syncFavoritesWithAuth();
        } catch (error) {
          console.error("Error fetching treks:", error);
          // Fall back to mock data
          set({
            treks: mockTreks,
            filteredTreks: mockTreks,
            isLoading: false,
          });
        }
      },

      searchTreks: (query) => {
        const { treks, selectedDifficulty, selectedRegion, selectedDuration } =
          get();
        set({ searchQuery: query });

        let filtered = treks;

        // Apply search query
        if (query) {
          filtered = filtered.filter(
            (trek) =>
              trek.name.toLowerCase().includes(query.toLowerCase()) ||
              trek.district.toLowerCase().includes(query.toLowerCase()) ||
              trek.region.toLowerCase().includes(query.toLowerCase())
          );
        }

        // Apply filters
        if (selectedDifficulty) {
          filtered = filtered.filter(
            (trek) =>
              trek.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
          );
        }

        if (selectedRegion) {
          filtered = filtered.filter((trek) =>
            trek.region.toLowerCase().includes(selectedRegion.toLowerCase())
          );
        }

        if (selectedDuration) {
          filtered = filtered.filter((trek) => {
            // Extract the numeric part of the duration (e.g., "7-10 days" -> [7, 10])
            const durationRange = trek.duration.match(/\d+/g)?.map(Number);
            if (!durationRange || durationRange.length === 0) return false;

            if (selectedDuration === "short") {
              return durationRange[0] <= 7; // 7 days or less
            } else if (selectedDuration === "medium") {
              return durationRange[0] > 7 && durationRange[0] <= 14; // 8-14 days
            } else if (selectedDuration === "long") {
              return durationRange[0] > 14; // More than 14 days
            }

            return true;
          });
        }

        set({ filteredTreks: filtered });
      },

      toggleFavorite: (trekId) => {
        const { favorites } = get();
        const authStore = useAuthStore.getState();

        // If user is authenticated, use the auth store to toggle favorite
        if (authStore.isAuthenticated && authStore.user) {
          authStore.toggleFavoriteTrek(trekId);
          return;
        }

        // Otherwise, use local storage
        if (favorites.includes(trekId)) {
          set({ favorites: favorites.filter((id) => id !== trekId) });
        } else {
          set({ favorites: [...favorites, trekId] });
        }
      },

      isFavorite: (trekId) => {
        const authStore = useAuthStore.getState();
        const { favorites } = get();

        // If user is authenticated, check user's savedTreks
        if (
          authStore.isAuthenticated &&
          authStore.user &&
          authStore.user.savedTreks
        ) {
          return authStore.user.savedTreks.includes(trekId);
        }

        // Otherwise, check local favorites
        return favorites.includes(trekId);
      },

      filterByDifficulty: (difficulty) => {
        set({ selectedDifficulty: difficulty });
        get().searchTreks(get().searchQuery);
      },

      filterByRegion: (region) => {
        set({ selectedRegion: region });
        get().searchTreks(get().searchQuery);
      },

      filterByDuration: (duration) => {
        set({ selectedDuration: duration });
        get().searchTreks(get().searchQuery);
      },

      resetFilters: () => {
        set({
          selectedDifficulty: null,
          selectedRegion: null,
          selectedDuration: null,
          searchQuery: "",
          filteredTreks: get().treks,
        });
      },

      syncFavoritesWithAuth: () => {
        // This function should not update state directly to avoid infinite loops
        // It's called by other functions that will handle state updates
      },
    }),
    {
      name: "trek-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
