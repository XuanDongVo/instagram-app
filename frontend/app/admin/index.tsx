import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";

export default function AdminHome() {
  const { logout } = useAuth();

  const cards = useMemo(
    () => [
      {
        title: "Quản lý người dùng",
        desc: "Xem danh sách, đổi quyền, xoá tài khoản",
        icon: "people-outline" as const,
        onPress: () => router.push("/admin/users" as any),
      },
      {
        title: "Quản lý bài viết",
        desc: "Xem danh sách, xoá bài viết",
        icon: "document" as const,
        onPress: () => router.push("/admin/posts" as any),
      },
      {
        title: "Kiểm duyệt bình luận",
        desc: "Lọc, tìm kiếm, xoá bình luận",
        icon: "chatbubble-ellipses-outline" as const,
        onPress: () => router.push("/admin/comments" as any),
      },
      {
        title: "Đăng xuất",
        desc: "Thoát khỏi khu vực quản trị",
        icon: "log-out-outline" as const,
        danger: true,
        onPress: async () => {
          await logout();
          router.replace("/login" as any);
        },
      },
    ],
    [logout]
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Bảng điều khiển</Text>
          <Text style={styles.heroSub}>Quản trị hệ thống mạng xã hội</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {cards.map((c) => (
          <TouchableOpacity
            key={c.title}
            activeOpacity={0.9}
            style={[styles.card, c.danger && styles.cardDanger]}
            onPress={c.onPress}
          >
            <View style={[styles.cardIcon, c.danger && styles.cardIconDanger]}>
              <Ionicons name={c.icon} size={22} color={c.danger ? "#b91c1c" : "#4338ca"} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, c.danger && { color: "#b91c1c" }]}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Admin Panel</Text>
        <Text style={styles.footerText}>v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb", padding: 16 },

  hero: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#7d5fff",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: "white", fontSize: 18, fontWeight: "900" },
  heroSub: { color: "#d1d5db", marginTop: 2 },

  grid: { gap: 12 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardDanger: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconDanger: {
    backgroundColor: "#fee2e2",
  },

  cardTitle: { fontSize: 15, fontWeight: "900", color: "#111827" },
  cardDesc: { marginTop: 2, color: "#6b7280", fontSize: 12.5 },

  footer: { marginTop: "auto", paddingTop: 12, flexDirection: "row", justifyContent: "space-between" },
  footerText: { color: "#9ca3af", fontWeight: "700" },
});
