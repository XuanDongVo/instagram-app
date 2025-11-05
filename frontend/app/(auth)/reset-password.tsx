import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react"; 
import { authService } from "../../services/authService"; 

export default function ResetPasswordScreen() {

  // Lấy email từ màn hình trước
  const { email } = useLocalSearchParams<{ email: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // State ẩn/hiện mật khẩu (từ file gốc của bạn)
  const [secureNewPass, setSecureNewPass] = useState(true);
  const [secureConfirmPass, setSecureConfirmPass] = useState(true);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Không tìm thấy email. Vui lòng thử lại.");
      router.push("/forgot-password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }
    
    if (newPassword.length < 6) {
       Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự.");
       return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await authService.resetPassword({ email, newPassword });

      Alert.alert(
        "Thành công",
        "Mật khẩu của bạn đã được đặt lại. Vui lòng đăng nhập.",
        [
          { text: "OK", onPress: () => router.replace("/login") }
        ]
      );

    } catch (error: any) {
      console.error("Reset password failed:", error.response?.data);
      const errorMessage =
      error.response?.data?.message || 
      error.response?.data ||          
      "Đã xảy ra lỗi. Vui lòng thử lại."; 
      Alert.alert("Lỗi", errorMessage); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Đặt lại Mật khẩu</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Nhập mật khẩu mới của bạn.</Text>

      {/* New Password */}
      <TextInput
        placeholder="Mật khẩu mới"
        placeholderTextColor="#999"
        style={styles.input}
        secureTextEntry={secureNewPass}
        value={newPassword}
        onChangeText={setNewPassword} 
      />

      {/* Confirm New Password */}
      <TextInput
        placeholder="Xác nhận Mật khẩu"
        placeholderTextColor="#999"
        style={styles.input}
        secureTextEntry={secureConfirmPass}
        value={confirmPassword} 
        onChangeText={setConfirmPassword}
      />

      {/* Button Reset Password */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
        </Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity
        style={styles.backLinkContainer}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.backLinkText}>Quay lại Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16, 
    backgroundColor: "#f9fafb",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#7d5fff",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  backLinkContainer: {
    marginTop: 16,
  },
  backLinkText: {
    textAlign: "center",
    color: "#7d5fff",
    fontWeight: "500",
    fontSize: 16,
  },
});