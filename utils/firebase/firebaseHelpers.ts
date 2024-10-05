import state from '@/app/context';
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function initializeUser() {
    return new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                state.userData.userId = user.uid;
                localStorage.setItem('userId', user.uid);
                await fetchUserData(user.uid);
            } else {
                await signInAnonymouslyAndCreateUser();
            }
            resolve();
        });
    });
}

async function signInAnonymouslyAndCreateUser() {
    try {
        const userCredential = await signInAnonymously(auth);
        const userId = userCredential.user.uid;
        state.userData.userId = userId;
        localStorage.setItem('userId', userId);
        await createUserDocument(userId);
        await fetchUserData(userId, 3);
    } catch (error) {
        console.error("Error in anonymous sign-in:", error);
        state.error = "Failed to sign in anonymously";
    }
}

async function createUserDocument(userId: string) {
    const userDocRef = doc(db, 'users', userId);
    try {
        await setDoc(userDocRef, {
            createdAt: new Date(),
            userId: userId,
            // Add any other initial user data you want to store
        }, { merge: true });
    } catch (error) {
        console.error("Error creating/updating user document:", error);
        state.error = "Failed to create user document";
    }
}

async function fetchUserData(userId: string, place?: number) {
    state.loading = true;
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            state.userData = { ...state.userData, ...userDoc.data() };
            state.userData.userFetched = true;
        } else {
            await createUserDocument(userId);
        }
    } catch (error) {
        console.error("Error fetching/creating user data:", error, userId, place);
        state.error = "Failed to fetch or create user data";
    }
    state.loading = false;
}

export async function updateUserData(userId: string, newUserData: any) {
    const userDocRef = doc(db, 'users', userId);
    try {
        await setDoc(userDocRef, newUserData, { merge: true });
        state.userData = { ...state.userData, ...newUserData };
    } catch (error) {
        console.error("Error updating user data:", error);
        state.error = "Failed to update user data";
    }
}
