import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 60) / 3;

interface SelectedMediaAsset {
  uri: string;
  cancelled: boolean;
  type: "image" | "video";
  width?: number;
  height?: number;
}

export default function ShopScreen() {
  // state lưu trữ danh sách các file đã chọn
  const [selectedAssets, setSelectedAssets] = useState<SelectedMediaAsset[]>(
    []
  );

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

  const hasAssets = selectedAssets.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tạo bài viết mới</Text>
      </View>

      {/* VÙNG HIỂN THỊ PREVIEW */}
      {hasAssets && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Ảnh/Video đã chọn:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedAssets.map((asset, index) => (
              <View key={asset.uri || index} style={styles.assetWrapper}>
                <Image
                  source={{ uri: asset.uri }}
                  style={styles.previewImage}
                />
                {/* NÚT XÓA */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveAsset(index)}
                >
                  <Icon name="close-circle" size={24} color="#f00" />
                </TouchableOpacity>
                {asset.type === "video" && (
                  <Icon
                    name="videocam"
                    size={24}
                    color="#fff"
                    style={styles.videoOverlay}
                  />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Section chọn file */}
      <View style={hasAssets ? styles.hiddenContentArea : styles.contentArea}>
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
  contentArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  hiddenContentArea: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ebebeb",
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 5,
  },
  assetWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginHorizontal: 5,
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
});
