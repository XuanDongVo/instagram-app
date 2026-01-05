import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getRoleFromAccessToken } from "../../services/jwt";

export default function AdminLayout() {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">(
    "loading"
  );

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const role = getRoleFromAccessToken(token);
        setStatus(role === "ADMIN" ? "allowed" : "denied");
      } catch {
        setStatus("denied");
      }
    })();
  }, []);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === "denied") return <Redirect href="/login" />;

  return (
    <Stack
      screenOptions={{
        headerTitle: "Quản trị",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#ffffff" },
        headerTitleStyle: { fontWeight: "800" },
        headerBackVisible: true, 
        headerBackTitle: "", 
      }}
    >
      <Stack.Screen name="index" options={{ title: "Trang quản trị" }} />
      <Stack.Screen name="users" options={{ title: "Người dùng" }} />
    </Stack>
  );
}
