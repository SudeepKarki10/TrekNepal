import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from "@/store/auth-store";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initAuth } = useAuthStore();
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Initialize Firebase auth listener
  useEffect(() => {
    try {
      const unsubscribe = initAuth();
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (err) {
      console.error("Failed to initialize auth:", err);
    }
  }, [initAuth]);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="trek/[id]"
        options={{
          headerTitle: "Trek Details",
          headerBackTitle: "Back",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <Stack.Screen
        name="auth/login"
        options={{
          headerTitle: "Login",
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          headerTitle: "Register",
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="auth/forgot-password"
        options={{
          headerTitle: "Reset Password",
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
