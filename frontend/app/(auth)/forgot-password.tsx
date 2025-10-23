import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Quên Mật Khẩu?</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
      </Text>

      {/* Email */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Button Send OTP */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/verify-otp")} 
      >
        <Text style={styles.buttonText}>Gửi Mã OTP</Text>
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
    marginBottom: 24, 
    backgroundColor: "#f9fafb",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#7d5fff", 
    borderRadius: 16,
    paddingVertical: 16,
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