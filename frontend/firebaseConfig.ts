import { initializeApp, FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBi5edsxx6ttd5A1_HKAi8C05Orm-VPn4o",
  authDomain: "instagram-app-22d01.firebaseapp.com",
  projectId: "instagram-app-22d01",
  storageBucket: "instagram-app-22d01.firebasestorage.app",
  messagingSenderId: "770103690809",
  appId: "1:770103690809:android:0ecc511040672ca45e6fe8"
};

let app: FirebaseApp;

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};
