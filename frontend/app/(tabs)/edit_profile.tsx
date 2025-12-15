import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { profileService } from "@/services/profileService";

const DEFAULT_AVATAR =
  "https://velle.vn/wp-content/uploads/2025/04/avatar-mac-dinh-4-2.jpg";

const EditProfileScreen: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [userName, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileImagePreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);


  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);


  // ================= LOAD PROFILE =================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUserString = await AsyncStorage.getItem("currentUser");
        if (!currentUserString) return;

        const currentUser = JSON.parse(currentUserString);
        setUserId(currentUser.id);

        const profile = await profileService.getUserProfile(currentUser.id);

        setFullName(profile.fullName || "");
        setUsername(profile.userName || "");
        setBio(profile.bio ?? "");
        setAvatarPreview(profile.avatarUrl || DEFAULT_AVATAR);
        setProfileImageUrl(profile.avatarUrl || null);

      } catch (e) {
        console.error("Load profile error:", e);
        Alert.alert("Error", "Không tải được profile");
      }
    };

    loadProfile();
  }, []);

  // ================= CANCEL =================
  const handleCancel = () => {
    router.back();
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      await profileService.updateProfile(userId, {
        fullName,
        userName,
        bio,
        profileImage: profileImageUrl || undefined,
      });

      Alert.alert("Success", "Cập nhật hồ sơ thành công");
      router.back();
    } catch (e: any) {
      console.error("Update profile error:", e);
      Alert.alert("Error", e.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ================= CHANGE AVATAR =================
  const handleChangePhoto = async () => {
    if (!userId) return;

    try {
      setUploadingAvatar(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      // preview NGAY
      setAvatarPreview(asset.uri);

      // upload
      const uploadedUrl = await profileService.uploadProfileImage(userId, {
        uri: asset.uri.startsWith("file://")
          ? asset.uri
          : "file://" + asset.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      // 🔥 QUAN TRỌNG
      setProfileImageUrl(uploadedUrl);
      setAvatarPreview(`${uploadedUrl}?t=${Date.now()}`);
    } catch (e) {
      Alert.alert("Error", "Upload ảnh thất bại");
    } finally {
      setUploadingAvatar(false);
    }
  };




  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || uploadingAvatar}
        >
          <Text style={[styles.headerButton, styles.doneButton]}>
            {uploadingAvatar
              ? "Uploading..."
              : loading
                ? "Saving..."
                : "Done"}
          </Text>

        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* AVATAR */}
        <View style={styles.profilePictureSection}>
          <Image
            source={{ uri: profileImagePreview }}
            style={styles.profileImage}
          />

          <TouchableOpacity onPress={handleChangePhoto}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>

        </View>

        {/* EDITABLE FIELDS */}
        <ProfileField
          label="Full Name"
          value={fullName}
          onChange={setFullName}
        />
        <ProfileField
          label="Username"
          value={userName}
          onChange={setUsername}
        />
        <ProfileField label="Bio" value={bio} onChange={setBio} multiline />
      </ScrollView>
    </SafeAreaView>
  );
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  multiline?: boolean;
}

const ProfileField = ({ label, value, onChange, multiline }: FieldProps) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
    />
    <View style={styles.separator} />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  headerButton: { fontSize: 17, color: "#007AFF" },
  doneButton: { fontWeight: "600" },

  profilePictureSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    backgroundColor: "#ccc",
  },
  changePhotoText: { color: "#007AFF", fontSize: 15 },

  fieldContainer: { paddingHorizontal: 15, paddingVertical: 8 },
  label: { fontSize: 12, color: "#666", marginBottom: 3 },
  input: { fontSize: 16, color: "#000" },
  multilineInput: { height: 80, textAlignVertical: "top" },
  separator: { height: 1, backgroundColor: "#efefef", marginTop: 6 },
});

export default EditProfileScreen;
