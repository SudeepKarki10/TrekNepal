import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./config";

// Register a new user
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile
    if (user) {
      await updateProfile(user, {
        displayName: displayName,
      });
    }

    return user;
  } catch (error) {
    console.error("Firebase registration error:", error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Firebase login error:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Firebase logout error:", error);
    throw error;
  }
};

// Update user profile in Firebase Auth
export const updateUserProfile = async (uid, data) => {
  try {
    if (auth.currentUser) {
      const updates = {};
      if (data.displayName) updates.displayName = data.displayName;
      if (data.photoURL) updates.photoURL = data.photoURL;

      await updateProfile(auth.currentUser, updates);
    } else {
      throw new Error("No authenticated user found");
    }
    return true;
  } catch (error) {
    console.error("Error updating Firebase profile:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Firebase reset password error:", error);
    throw error;
  }
};

// Listen to auth state changes
export const subscribeToAuthChanges = (callback) => {
  try {
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error("Error setting up auth listener:", error);
    // Return a dummy unsubscribe function
    return () => {};
  }
};
