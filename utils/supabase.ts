import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Trek } from "@/types/trek";

// Use environment variables from the .env file
const supabaseUrl = "https://bynqnpgcyecqisajugcb.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bnFucGdjeWVjcWlzYWp1Z2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NDA1NzksImV4cCI6MjA2MDIxNjU3OX0.mkRy35POIVwo0MGL_jjkw9x_2zjwWOIBMk6xkGBHF9Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for our Supabase tables
export type UserProfile = {
  id: string; // Firebase UID
  email: string;
  display_name: string;
  photo_url?: string;
  created_at?: string;
};

export type UserFavorite = {
  id?: number;
  user_id: string; // Firebase UID
  trek_id: number;
  created_at?: string;
};

// Helper functions for user profiles
export const getUserProfile = async (userId: string) => {
  try {
    // Use maybeSingle() instead of single() to handle the case where the profile doesn't exist
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      return null;
    }
    return data;
  } catch (error: any) {
    console.error("Error fetching user profile from Supabase:", error.message);
    return null;
  }
};

export const createUserProfile = async (
  profile: Omit<UserProfile, "created_at">
) => {
  try {
    // Check if profile already exists
    const existingProfile = await getUserProfile(profile.id);

    if (existingProfile) {
      // Profile already exists, update it
      return updateUserProfile(profile.id, {
        display_name: profile.display_name,
        photo_url: profile.photo_url,
      });
    }

    // Create new profile
    const { data, error } = await supabase
      .from("user_profiles")
      .insert([
        {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          photo_url: profile.photo_url,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating user profile:", error.message);
      return null;
    }
    return data[0];
  } catch (error: any) {
    console.error("Error creating user profile in Supabase:", error.message);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Error updating user profile:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error: any) {
    console.error("Error updating user profile in Supabase:", error.message);
    return null;
  }
};

// Helper functions for user favorites
export const getUserFavorites = async (userId: string): Promise<number[]> => {
  try {
    const { data, error } = await supabase
      .from("user_favorites")
      .select("trek_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user favorites:", error.message);
      return [];
    }

    // Extract just the trek_ids into an array
    return data.map((favorite) => favorite.trek_id);
  } catch (error: any) {
    console.error(
      "Error fetching user favorites from Supabase:",
      error.message
    );
    return [];
  }
};

export const addUserFavorite = async (
  userId: string,
  trekId: number
): Promise<boolean> => {
  try {
    // Check if user profile exists, if not create it
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      // Create a minimal profile if it doesn't exist
      await createUserProfile({
        id: userId,
        email: `user_${userId}@example.com`, // Placeholder email
        display_name: `User ${userId}`, // Placeholder name
      });
    }

    // Check if favorite already exists
    const { data: existingFavorite } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("trek_id", trekId)
      .maybeSingle();

    if (existingFavorite) {
      // Favorite already exists, no need to add
      return true;
    }

    const { error } = await supabase.from("user_favorites").insert([
      {
        user_id: userId,
        trek_id: trekId,
      },
    ]);

    if (error) {
      console.error("Error adding user favorite:", error.message);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error("Error adding user favorite in Supabase:", error.message);
    return false;
  }
};

export const removeUserFavorite = async (
  userId: string,
  trekId: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("trek_id", trekId);

    if (error) {
      console.error("Error removing user favorite:", error.message);
      return false;
    }
    return true;
  } catch (error: any) {
    console.error("Error removing user favorite in Supabase:", error.message);
    return false;
  }
};

// Helper function to sync treks to Supabase
export const syncTreksToSupabase = async (treks: Trek[]): Promise<boolean> => {
  try {
    // Process treks in batches to avoid payload size limits
    const batchSize = 10;
    for (let i = 0; i < treks.length; i += batchSize) {
      const batch = treks.slice(i, i + batchSize);

      const { error } = await supabase.from("treks").upsert(
        batch.map((trek) => ({
          id: trek.id,
          name: trek.name,
          district: trek.district,
          region: trek.region,
          difficulty: trek.difficulty,
          duration: trek.duration,
          best_seasons: trek.best_seasons,
          elevation_profile: trek.elevation_profile,
          description: trek.description,
          historical_significance: trek.historical_significance,
          itinerary: trek.itinerary,
          cost_breakdown: trek.cost_breakdown,
          transportation: trek.transportation,
          nearby_attractions: trek.nearby_attractions,
          required_permits: trek.required_permits,
          recommended_gear: trek.recommended_gear,
          safety_info: trek.safety_info,
          photos: trek.photos,
        })),
        { onConflict: "id" }
      );

      if (error) {
        console.error(
          `Error syncing treks batch ${i}-${i + batchSize} to Supabase:`,
          error.message
        );
        // Continue with next batch instead of failing completely
      }
    }

    return true;
  } catch (error: any) {
    console.error("Error syncing treks to Supabase:", error.message);
    return false;
  }
};

// Helper function to get treks from Supabase
export const getTreksFromSupabase = async (): Promise<Trek[]> => {
  try {
    const { data, error } = await supabase.from("treks").select("*");

    if (error) {
      console.error("Error fetching treks from Supabase:", error.message);
      return [];
    }

    return data as Trek[];
  } catch (error: any) {
    console.error("Error fetching treks from Supabase:", error.message);
    return [];
  }
};
