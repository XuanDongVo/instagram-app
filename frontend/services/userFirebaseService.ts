import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebaseApp } from "../firebaseConfig";
import { AuthResponse } from "../types/user";

class UserFirebaseService {
  private db;

  constructor() {
    const app = getFirebaseApp();
    this.db = getFirestore(app);
  }

  /**
   * Kiểm tra và tạo user trong Firebase sau khi login thành công
   * @param authResponse - Response từ API login
   * @param profileImage - URL ảnh đại diện (optional)
   * @param bio - Tiểu sử (optional)
   */
  async ensureUserExistsInFirebase(
    authResponse: AuthResponse,
    profileImage?: string,
    bio?: string
  ): Promise<void> {
    const userRef = doc(this.db, "users", authResponse.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // User chưa tồn tại trong Firebase, tạo mới
      const userData = {
        id: authResponse.id,
        email: authResponse.email,
        name: authResponse.name,
        userName: authResponse.name, // Có thể customize sau
        fullName: authResponse.name,
        profileImage: profileImage || "",
        bio: bio || "",
        isOnline: true,
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Chat-related settings
        chatSettings: {
          allowMessages: true,
          showOnlineStatus: true,
          readReceipts: true,
        },
      };

      await setDoc(userRef, userData);
      console.log("User created in Firebase:", authResponse.id);
    } else {
      // User đã tồn tại, cập nhật trạng thái online
      await setDoc(
        userRef,
        {
          isOnline: true,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log("User updated in Firebase:", authResponse.id);
    }
  }

  /**
   * Lấy thông tin user từ Firebase
   */
  async getUserFromFirebase(userId: string) {
    const userRef = doc(this.db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  }

  /**
   * Cập nhật trạng thái offline khi user logout
   */
  async setUserOffline(userId: string): Promise<void> {
    const userRef = doc(this.db, "users", userId);
    await setDoc(
      userRef,
      {
        isOnline: false,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  /**
   * Cập nhật thông tin profile user
   */
  async updateUserProfile(
    userId: string,
    updates: {
      name?: string;
      userName?: string;
      fullName?: string;
      profileImage?: string;
      bio?: string;
    }
  ): Promise<void> {
    const userRef = doc(this.db, "users", userId);
    await setDoc(
      userRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  /**
   * Tìm kiếm user theo email hoặc username (cho việc tạo chat)
   */
  async searchUsers(query: string, currentUserId: string) {
    // Note: Firestore không hỗ trợ text search trực tiếp
    // Bạn có thể sử dụng Algolia hoặc implement client-side filtering
    // Đây là implementation đơn giản:

    const usersRef = collection(this.db, "users");
    const snapshot = await getDocs(usersRef);

    const users: any[] = [];
    snapshot.forEach((docSnap) => {
      const userData = { id: docSnap.id, ...docSnap.data() } as any;

      // Loại bỏ current user
      if (userData.id === currentUserId) return;

      // Simple search trong name, userName, email
      const searchText = query.toLowerCase();
      if (
        userData.name?.toLowerCase().includes(searchText) ||
        userData.userName?.toLowerCase().includes(searchText) ||
        userData.email?.toLowerCase().includes(searchText)
      ) {
        users.push(userData);
      }
    });

    return users;
  }
}

export const userFirebaseService = new UserFirebaseService();
