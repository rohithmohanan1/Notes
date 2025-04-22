import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { InsertUser, User } from "@shared/schema";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

export async function registerWithEmail(email: string, password: string, username: string): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user in database with username
    await createUserInDatabase({
      ...result.user,
      displayName: username,
    });
    
    return result.user;
  } catch (error) {
    console.error("Error registering with email", error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    queryClient.clear();
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
}

export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
  return firebaseAuthStateChanged(auth, callback);
}

export async function createUserInDatabase(user: FirebaseUser): Promise<User> {
  try {
    // First check if user already exists
    const response = await fetch(`/api/users/current?uid=${user.uid}`);
    
    // If user exists, return it
    if (response.ok) {
      return await response.json();
    }
    
    // If user doesn't exist, create it
    const userData: InsertUser = {
      uid: user.uid,
      username: user.displayName || "User",
      email: user.email || "",
      photoURL: user.photoURL || "",
    };
    
    const res = await apiRequest("POST", "/api/users", userData);
    return await res.json();
  } catch (error) {
    console.error("Error creating user in database", error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  
  if (!firebaseUser) {
    return null;
  }
  
  try {
    const response = await fetch(`/api/users/current?uid=${firebaseUser.uid}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // User not found in database, create it
        return await createUserInDatabase(firebaseUser);
      }
      throw new Error("Failed to get current user");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting current user", error);
    throw error;
  }
}
