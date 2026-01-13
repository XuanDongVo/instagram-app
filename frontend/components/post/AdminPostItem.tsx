import { PostResponse } from "@/types";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from "react-native";
import { useState } from "react";
import AdminPostCard from "./AdminPostCard";
import { Ionicons } from "@expo/vector-icons";

export default function AdminPostItem({
  post,
  onDeleteSuccess,
  onStatusChange,
}: {
  post: PostResponse;
  onDeleteSuccess: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
}) {
  const [showDetail, setShowDetail] = useState(false);

  // Hàm helper để hiển thị màu sắc theo trạng thái
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "#22c55e";
      case "HIDDEN":
        return "#f59e0b";
    }
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.infoSection}>
        <Text style={styles.username}>@{post.user.userName}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: getStatusColor(post.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(post.status) }]}>{post.status || "ACTIVE"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.detailBtn} onPress={() => setShowDetail(true)}>
        <Text style={styles.detailBtnText}>Chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color="#4338ca" />
      </TouchableOpacity>

      {/* MODAL HIỂN THỊ ADMIN POST CARD */}
      <Modal visible={showDetail} animationType="slide" transparent={true} onRequestClose={() => setShowDetail(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết bài viết</Text>
              <TouchableOpacity onPress={() => setShowDetail(false)}>
                <Ionicons name="close-circle" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <AdminPostCard
              post={post}
              onStatusChange={onStatusChange}
              onDeleteSuccess={(id: string) => {
                setShowDetail(false);
                onDeleteSuccess(id);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  infoSection: { flex: 1 },
  username: { fontSize: 15, fontWeight: "800", color: "#111827" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "700" },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailBtnText: { color: "#4338ca", fontWeight: "700", marginRight: 4 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "900" },
});
