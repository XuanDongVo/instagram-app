import CreatePost from "../../components/post/CreatePost";
import { View, Text, StyleSheet } from "react-native";

export default function Post() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tạo bài viết mới</Text>
      </View>
      <View style={{ flex: 1 }}>
        <CreatePost />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ebebeb",
    alignItems: "center",
  },
  headerText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
  },
});
