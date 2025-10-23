import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.logo}>Instagram</Text>

      {/* Email */}
      <TextInput
        placeholder="Email hoặc số điện thoại"
        placeholderTextColor="#999"
        style={styles.input}
      />

      {/* Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#888"
          />
        </Pressable>
      </View>

      {/* Button Login */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.forgotContainer}
        onPress={() => router.push("/forgot-password")}
       >
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>HOẶC</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Register */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerLink}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 32,
    justifyContent: "center",
    paddingVertical: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 48,
    color: "#7d5fff",
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#7d5fff",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
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
  forgotContainer: {
    marginBottom: 16,
  },
  forgotText: {
    textAlign: "center",
    color: "#7d5fff",
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#4b5563",
    fontSize: 16,
  },
  registerLink: {
    color: "#7d5fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 4,
  },
});