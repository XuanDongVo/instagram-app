import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { adminUserService } from "../../services/adminUserService";
import type { AdminUser } from "../../types/admin";

type ActionState =
  | { type: "none" }
  | { type: "role"; user: AdminUser }
  | { type: "delete"; user: AdminUser };

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [q, setQ] = useState("");
  const [action, setAction] = useState<ActionState>({ type: "none" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getAllUsers();
      setUsers(data);
    } catch (e: any) {
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message ||
          e?.message ||
          "Không tải được danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await adminUserService.getAllUsers();
      setUsers(data);
    } catch (e: any) {
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message ||
          e?.message ||
          "Không tải được danh sách người dùng"
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  // load lần đầu
  useMemo(() => {
    // tránh useEffect lint trong snippet
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((u) => {
      const s = `${u.fullName} ${u.userName} ${u.email} ${
        u.role || ""
      }`.toLowerCase();
      return s.includes(keyword);
    });
  }, [users, q]);

  const roleBadge = (role?: string) => {
    const r = role || "USER";
    const isAdmin = r === "ADMIN";
    return (
      <View
        style={[styles.badge, isAdmin ? styles.badgeAdmin : styles.badgeUser]}
      >
        <Text
          style={[
            styles.badgeText,
            isAdmin ? styles.badgeTextAdmin : styles.badgeTextUser,
          ]}
        >
          {r}
        </Text>
      </View>
    );
  };

  const openRoleModal = (user: AdminUser) => setAction({ type: "role", user });
  const openDeleteModal = (user: AdminUser) =>
    setAction({ type: "delete", user });
  const closeModal = () => setAction({ type: "none" });

  const onChangeRole = async (user: AdminUser, role: "USER" | "ADMIN") => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await adminUserService.updateUserRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      closeModal();
    } catch (e: any) {
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message || e?.message || "Cập nhật quyền thất bại"
      );
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (user: AdminUser) => {
    if (busy) return;
    setBusy(true);
    try {
      await adminUserService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      closeModal();
    } catch (e: any) {
      Alert.alert(
        "Lỗi",
        e?.response?.data?.message || e?.message || "Xóa người dùng thất bại"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách người dùng</Text>

      <View style={styles.searchBox}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Tìm theo tên / username / email / role..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {!!q && (
          <TouchableOpacity onPress={() => setQ("")} style={styles.clearBtn}>
            <Text style={styles.clearText}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#6b7280" }}>
              {loading ? "Đang tải..." : "Không có dữ liệu phù hợp."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.fullName}{" "}
                  <Text style={styles.username}>({item.userName})</Text>
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>

              {roleBadge(item.role)}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionPrimary]}
                onPress={() => openRoleModal(item)}
              >
                <Text style={styles.actionTextPrimary}>Đổi quyền</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionDanger]}
                onPress={() => openDeleteModal(item)}
              >
                <Text style={styles.actionTextDanger}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal đổi role */}
      <Modal
        visible={action.type === "role"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.backdrop} onPress={closeModal} />
        <View style={styles.modal}>
          {action.type === "role" && (
            <>
              <Text style={styles.modalTitle}>Đổi quyền</Text>
              <Text style={styles.modalDesc}>
                {action.user.fullName} ({action.user.email})
              </Text>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  disabled={busy}
                  style={[styles.modalBtn, styles.modalBtnUser]}
                  onPress={() => onChangeRole(action.user, "USER")}
                >
                  <Text style={styles.modalBtnText}>USER</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={busy}
                  style={[styles.modalBtn, styles.modalBtnAdmin]}
                  onPress={() => onChangeRole(action.user, "ADMIN")}
                >
                  <Text style={[styles.modalBtnText, { color: "white" }]}>
                    ADMIN
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={closeModal} style={{ marginTop: 14 }}>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    fontWeight: "700",
                  }}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        visible={action.type === "delete"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.backdrop} onPress={closeModal} />
        <View style={styles.modal}>
          {action.type === "delete" && (
            <>
              <Text style={styles.modalTitle}>Xóa người dùng</Text>
              <Text style={styles.modalDesc}>
                Bạn chắc chắn muốn xóa{" "}
                <Text style={{ fontWeight: "800" }}>
                  {action.user.fullName}
                </Text>
                ?
              </Text>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  disabled={busy}
                  style={[styles.modalBtn, styles.modalBtnUser]}
                  onPress={closeModal}
                >
                  <Text style={styles.modalBtnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={busy}
                  style={[styles.modalBtn, styles.modalBtnDelete]}
                  onPress={() => onDelete(action.user)}
                >
                  <Text style={[styles.modalBtnText, { color: "white" }]}>
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb", padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111827",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#111827" },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  clearText: { fontWeight: "900", color: "#6b7280" },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eef2ff",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 15, fontWeight: "800", color: "#111827" },
  username: { fontSize: 13, fontWeight: "700", color: "#6b7280" },
  email: { marginTop: 2, color: "#6b7280" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeAdmin: { backgroundColor: "#111827", borderColor: "#111827" },
  badgeUser: { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" },
  badgeText: { fontSize: 12, fontWeight: "900" },
  badgeTextAdmin: { color: "white" },
  badgeTextUser: { color: "#4338ca" },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  actionPrimary: { backgroundColor: "#7d5fff" },
  actionDanger: { backgroundColor: "#fee2e2" },
  actionTextPrimary: { color: "white", fontWeight: "900" },
  actionTextDanger: { color: "#b91c1c", fontWeight: "900" },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modal: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "35%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  modalDesc: { marginTop: 6, color: "#4b5563" },

  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnUser: { backgroundColor: "#f3f4f6" },
  modalBtnAdmin: { backgroundColor: "#111827" },
  modalBtnDelete: { backgroundColor: "#dc2626" },
  modalBtnText: { fontWeight: "900", color: "#111827" },
});
