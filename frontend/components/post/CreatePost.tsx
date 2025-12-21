import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";
import UploadService from "@/services/uploadService";
import PostService from "@/services/postService";

const IMAGE_SIZE = 300;

interface SelectedMediaAsset {
  uri: string;
  cancelled: boolean;
  type: "image" | "video";
  width?: number;
  height?: number;
}

export default function CreatePost() {
  const getCurrentUserId = async () => {
    try {
      const userString = await AsyncStorage.getItem("currentUser");
      if (!userString) return null;

      const user = JSON.parse(userString);
      return user.id || user.userId || user._id;
    } catch (error) {
      console.error("Lỗi khi lấy UserId:", error);
      return null;
    }
  };

  // state lưu trữ danh sách các file đã chọn
  const [selectedAssets, setSelectedAssets] = useState<SelectedMediaAsset[]>(
    []
  );

  const [caption, setCaption] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  // func xóa một asset khỏi dsach
  const handleRemoveAsset = (indexToRemove: number) => {
    setSelectedAssets((prevAssets) =>
      prevAssets.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSelectFiles = async () => {
    // KHÔI PHỤC LOGIC KIỂM TRA QUYỀN
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Lỗi Quyền",
        "Ứng dụng cần quyền truy cập thư viện ảnh để hoạt động."
      );
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const newAssets: SelectedMediaAsset[] = pickerResult.assets.map(
        (asset: ImagePickerAsset) => ({
          uri: asset.uri,
          type: asset.type === "image" ? "image" : "video",
          cancelled: false,
          width: asset.width,
          height: asset.height,
        })
      );

      setSelectedAssets((prevAssets) => [...prevAssets, ...newAssets]);
    } else {
      console.log("Người dùng đã hủy chọn file");
    }
  };

  const handlePost = async () => {
    const userId = await getCurrentUserId();
    console.log("User id:", userId);
    setIsUploading(true);
    try {
      console.log("Đang bắt đầu quá trình upload...");
      const uploadPromises = selectedAssets.map((asset) => {
        if (asset.type === "video") {
          return UploadService.uploadVideo(asset.uri);
        } else {
          return UploadService.uploadImage(asset.uri);
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log("Danh sách URL đã upload thành công:", uploadedUrls);

      const postData = {
        content: caption.trim(),
        user_Id: userId,
        postImages: uploadedUrls,
      };
      const response = await PostService.createPost(postData);
      console.log("Đăng bài thành công:", response);
      Alert.alert("Thành công", "Bài viết của bạn đã được đăng!");

      setSelectedAssets([]);
      setCaption("");
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      Alert.alert("Lỗi", "Không thể đăng bài lúc này. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const hasAssets = selectedAssets.length > 0;

  return (
    <View style={styles.mainWrapper}>
      {/* Hiển thị Preview nếu đã chọn ảnh */}
      {hasAssets && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Ảnh/Video đã chọn:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {selectedAssets.map((asset, index) => (
              <View key={index} style={styles.assetWrapper}>
                <Image
                  source={{ uri: asset.uri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveAsset(index)}
                >
                  <Icon name="close-circle" size={24} color="#f00" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TextInput
            style={styles.input}
            placeholder="Bạn đang nghĩ gì ..."
            onChangeText={(text) => setCaption(text)}
            multiline={true}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={styles.postButton}
            onPress={handlePost}
            disabled={isUploading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Đăng bài</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hiển thị vùng chọn file ban đầu nếu chưa có ảnh nào */}
      {!hasAssets && (
        <View style={styles.contentArea}>
          <View style={styles.iconContainer}>
            <Icon
              name="image-outline"
              size={80}
              color="#737373"
              style={styles.imageIcon}
            />
            <Icon
              name="play-circle-outline"
              size={50}
              color="#737373"
              style={styles.videoIcon}
            />
          </View>
          <Text style={styles.dragText}>Kéo ảnh và video vào đây</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectFiles}
          >
            <Text style={styles.buttonText}>Chọn từ máy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    height: "100%",
  },
  contentArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    position: "relative",
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  imageIcon: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  videoIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    transform: [{ translateX: 10 }, { translateY: 10 }],
    backgroundColor: "#fff",
    borderRadius: 50,
  },
  dragText: {
    fontSize: 16,
    color: "#737373",
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: "#4267B2",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  previewContainer: {
    width: "100%",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ebebeb",
    alignItems: "flex-start",
  },
  scrollContent: {
    paddingLeft: 10,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 15,
    alignSelf: "flex-start",
  },
  assetWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: 10,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoOverlay: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    padding: 2,
  },
  input: {
    paddingHorizontal: 15,
    marginTop: 20,
    fontSize: 18,
    textAlignVertical: "top",
    width: "100%",
  },
  postButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginRight: 20,
    borderRadius: 8,
    alignItems: "flex-end",
    alignSelf: "flex-end",
  },
});
