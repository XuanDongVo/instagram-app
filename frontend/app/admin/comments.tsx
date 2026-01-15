
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View, ActivityIndicator, StyleSheet, Text, Alert, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Comment } from "@/types/comment";
import { CommentService } from "@/services/commentService";

export default function AdminCommentsScreen() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [postFilter, setPostFilter] = useState("");

    const loadComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await CommentService.getAllComments?.();
            console.log("Fetched comments for admin:", response);
            setComments(response || []);
        } catch (e) {
            console.error("Error loading comments:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleDelete = async (commentId: string) => {
        try {
            await CommentService.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (e) {
            Alert.alert("Lỗi", "Không thể xoá bình luận.");
        }
    };

    // Lọc nâng cao
    const filtered = comments.filter((c) => {
        const contentMatch = c.content.toLowerCase().includes(search.toLowerCase());
        const userMatch = userFilter ? c.sender.userName.toLowerCase().includes(userFilter.toLowerCase()) : true;
        const postMatch = postFilter ? (c as any).postId?.toLowerCase().includes(postFilter.toLowerCase()) : true;
        return contentMatch && userMatch && postMatch;
    });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4338ca" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kiểm duyệt bình luận</Text>
            <View style={styles.filterRowScroll}>
                <View style={styles.filterInputWrap}>
                    <Ionicons name="search" size={18} color="#4338ca" style={styles.filterIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm nội dung..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#9ca3af"
                    />
                </View>
                <View style={styles.filterInputWrap}>
                    <Ionicons name="person-outline" size={18} color="#4338ca" style={styles.filterIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Lọc theo user..."
                        value={userFilter}
                        onChangeText={setUserFilter}
                        placeholderTextColor="#9ca3af"
                    />
                </View>

            </View>
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 24 }}
                ListEmptyComponent={<Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 20 }}>Không có bình luận phù hợp.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            {/* Avatar */}
                            {item.sender.profileImage ? (
                                <View style={styles.avatarWrap}>
                                    <View style={styles.avatarBorder}>
                                        <img src={item.sender.profileImage} alt="avatar" style={{ width: 36, height: 36, borderRadius: 18 }} />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.avatarWrap}>
                                    <View style={styles.avatarBorder}>
                                        <Ionicons name="person-circle-outline" size={36} color="#c7d2fe" />
                                    </View>
                                </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.name} numberOfLines={1}>@{item.sender.userName}</Text>
                                {item.sender.fullName && (
                                    <Text style={styles.email}>{item.sender.fullName}</Text>
                                )}
                                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                    <TouchableOpacity
                                        style={styles.viewPostBtn}
                                        onPress={() => {
                                            Alert.alert('Đi tới bài viết', `Đi tới bài viết: ${item.id}`);
                                        }}
                                    >
                                        <Ionicons name="open-outline" size={16} color="#4338ca" />
                                        <Text style={styles.viewPostText}>Xem bài viết</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                                <Ionicons name="trash" size={18} color="#b91c1c" />
                                <Text style={styles.deleteText}>Xoá</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.commentContentBlock}>
                            <Text style={styles.commentLabel}>Nội dung bình luận:</Text>
                            <Text style={styles.content}>{item.content}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f7fb", padding: 16 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, fontWeight: "900", marginBottom: 16, color: "#111827" },
    filterRowScroll: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 18,
        overflow: 'visible',
    },
    filterInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 160,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    filterIcon: {
        marginRight: 6,
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 16,
        paddingHorizontal: 0,
        paddingVertical: 4,
        fontSize: 14,
        color: '#111827',
        borderWidth: 0,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    avatarWrap: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarBorder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#eef2ff',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    name: { fontSize: 15, fontWeight: "900", color: "#4338ca" },
    email: { color: "#6b7280", fontSize: 12, marginTop: 1 },
    date: { color: "#9ca3af", fontSize: 12, marginTop: 1 },
    postId: { color: "#6366f1", fontSize: 12, fontWeight: '700' },
    viewPostBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        backgroundColor: '#eef2ff',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    viewPostText: {
        color: '#4338ca',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 3,
    },
    content: { fontSize: 15, color: "#111827", marginTop: 8, marginBottom: 2 },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff1f2",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    deleteText: { color: "#b91c1c", fontWeight: "700", marginLeft: 4, fontSize: 14 },
    commentContentBlock: {
        marginTop: 8,
        marginBottom: 2,
        padding: 8,
        backgroundColor: '#f6f7fb',
        borderRadius: 10,
    },
    commentLabel: {
        fontWeight: '700',
        color: '#4338ca',
        fontSize: 13,
        marginBottom: 2,
    },
});
