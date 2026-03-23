import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

/**
 * Registers a new user and creates their profile in Firestore.
 */
export async function registerUser(email, password, profileData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      name: profileData.name || "Nuovo Utente",
      sub: profileData.sub || "Creatore",
      emoji: profileData.emoji || "🦁",
      pronomi: profileData.pronomi || "lui/lui",
      pin: profileData.pin || "123456", // Temporary storage for quick unlock
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    return { success: true, user };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Logs in a user.
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login
    await setDoc(doc(db, "users", user.uid), {
      lastLogin: new Date().toISOString()
    }, { merge: true });

    return { success: true, user };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Logs out the current user.
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    // Clear local session markers
    sessionStorage.removeItem('cf_logged');
    localStorage.removeItem('cf_active_studio');
    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Observes auth state changes.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Fetch profile from Firestore
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const profile = docSnap.data();
        // Sync to localStorage for backward compatibility/fast UI
        localStorage.setItem('cf_profile', JSON.stringify(profile));
        callback(user, profile);
      } else {
        callback(user, null);
      }
    } else {
      // BACKWARD COMPATIBILITY: Check for local session marker (PIN login)
      const isLocalAuth = sessionStorage.getItem('cf_logged') === '1';
      if (isLocalAuth) {
        console.log("🔓 Local session detected (PIN), allowing read-only cloud mode");
        const profile = JSON.parse(localStorage.getItem('cf_profile') || '{"name":"Il Capo","emoji":"🦁"}');
        callback(null, profile);
      } else {
        callback(null, null);
      }
    }
  });
}
