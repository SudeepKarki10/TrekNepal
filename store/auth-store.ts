import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile as updateFirebaseProfile,
  resetPassword,
  subscribeToAuthChanges,
} from "@/firebase/auth";
import {
  getUserProfile as getSupabaseProfile,
  createUserProfile,
  updateUserProfile as updateSupabaseProfile,
  getUserFavorites,
  addUserFavorite,
  removeUserFavorite,
} from "@/utils/supabase";
import { User as FirebaseUser } from "firebase/auth";

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  savedTreks?: number[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  toggleFavoriteTrek: (trekId: number) => Promise<void>;
  clearError: () => void;
  clearSuccessMessage: () => void;
  initAuth: () => (() => void) | undefined;
  syncFavorites: (userId: string) => Promise<number[]>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      successMessage: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const userCredential = await loginUser(email, password);

          // Create basic user object from auth data
          const basicUser: User = {
            uid: userCredential.uid,
            displayName: userCredential.displayName,
            email: userCredential.email,
            photoURL: userCredential.photoURL,
            savedTreks: [],
          };

          // Set authenticated state immediately
          set({
            user: basicUser,
            isAuthenticated: true,
            isLoading: false,
            successMessage: "Login successful!",
          });

          // Try to get favorites from Supabase
          try {
            const favorites = await getUserFavorites(userCredential.uid);
            if (favorites && favorites.length > 0) {
              set((state) => ({
                user: {
                  ...state.user!,
                  savedTreks: favorites,
                },
              }));
            }
          } catch (profileError) {
            console.log(
              "Failed to fetch user favorites, using empty list:",
              profileError
            );
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Failed to login. Please try again.",
          });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          const userCredential = await registerUser(email, password, name);

          // Create user profile in Supabase
          try {
            await createUserProfile({
              id: userCredential.uid,
              email: userCredential.email || email,
              display_name: name,
              photo_url: userCredential.photoURL || undefined,
            });
          } catch (supabaseError) {
            console.error("Failed to create Supabase profile:", supabaseError);
            // Continue anyway - we'll sync later
          }

          // Set authenticated state immediately
          set({
            user: {
              uid: userCredential.uid,
              displayName: name,
              email: userCredential.email,
              photoURL: userCredential.photoURL,
              savedTreks: [],
            },
            isAuthenticated: true,
            isLoading: false,
            successMessage: "Registration successful!",
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Failed to register. Please try again.",
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await logoutUser();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            successMessage: "Logged out successfully",
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Failed to logout. Please try again.",
          });
          throw error;
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null, successMessage: null });
        try {
          await resetPassword(email);
          set({
            isLoading: false,
            successMessage:
              "Password reset email sent. Please check your inbox.",
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.message || "Failed to reset password. Please try again.",
          });
          throw error;
        }
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null, successMessage: null });
        try {
          // Update Firebase Auth profile
          await updateFirebaseProfile(user.uid, data);

          // Update Supabase profile
          try {
            await updateSupabaseProfile(user.uid, {
              display_name: data.displayName || undefined,
              photo_url: data.photoURL || undefined,
            });
          } catch (supabaseError) {
            console.error("Failed to update Supabase profile:", supabaseError);
            // Continue anyway
          }

          set({
            user: { ...user, ...data },
            isLoading: false,
            successMessage: "Profile updated successfully",
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error.message || "Failed to update profile. Please try again.",
          });
          throw error;
        }
      },

      toggleFavoriteTrek: async (trekId) => {
        const { user } = get();
        if (!user) return;

        // Create a copy of the current savedTreks array or initialize if undefined
        const currentSavedTreks = user.savedTreks ? [...user.savedTreks] : [];
        const isFavorite = currentSavedTreks.includes(trekId);

        // Update local state immediately for better UX
        let updatedSavedTreks;
        if (isFavorite) {
          updatedSavedTreks = currentSavedTreks.filter((id) => id !== trekId);
        } else {
          updatedSavedTreks = [...currentSavedTreks, trekId];
        }

        // Update the user object with the new savedTreks array
        set({
          user: {
            ...user,
            savedTreks: updatedSavedTreks,
          },
        });

        // Try to sync with Supabase
        try {
          if (isFavorite) {
            await removeUserFavorite(user.uid, trekId);
          } else {
            await addUserFavorite(user.uid, trekId);
          }
        } catch (error: any) {
          console.log("Failed to sync with Supabase:", error.message);
          // Don't revert the UI state to avoid confusion
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearSuccessMessage: () => {
        set({ successMessage: null });
      },

      syncFavorites: async (userId) => {
        try {
          const favorites = await getUserFavorites(userId);
          const { user } = get();

          if (user && user.uid === userId) {
            set({
              user: {
                ...user,
                savedTreks: favorites,
              },
            });
          }

          return favorites;
        } catch (error) {
          console.error("Failed to sync favorites:", error);
          return [];
        }
      },

      initAuth: () => {
        try {
          const unsubscribe = subscribeToAuthChanges(
            (firebaseUser: FirebaseUser | null) => {
              if (firebaseUser) {
                // Set basic authenticated state immediately
                set({
                  user: {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                    savedTreks: [],
                  },
                  isAuthenticated: true,
                });

                // Try to get favorites from Supabase
                getUserFavorites(firebaseUser.uid)
                  .then((favorites) => {
                    const currentUser = get().user;
                    if (currentUser && currentUser.uid === firebaseUser.uid) {
                      set({
                        user: {
                          ...currentUser,
                          savedTreks: favorites,
                        },
                      });
                    }
                  })
                  .catch((error) => {
                    console.log(
                      "Failed to fetch user favorites in initAuth:",
                      error
                    );
                  });
              } else {
                set({ user: null, isAuthenticated: false });
              }
            }
          );

          // Return unsubscribe function for cleanup
          return unsubscribe;
        } catch (error) {
          console.error("Failed to initialize auth listener:", error);
          return undefined;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
