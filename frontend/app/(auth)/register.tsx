import { useState } from "react"; 
import { StyleSheet, Alert } from "react-native"; 
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { authService } from "../../services/authService";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;

    if (!email || !password || !fullName || !userName) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
      return;
    }
    
    setLoading(true);

    try {
      await authService.register({
        email,
        password,
        userName,
        fullName,
      });

      // Tokens already saved by authService
      Alert.alert(
        "Đăng ký thành công", 
        "Tài khoản đã được tạo thành công!", 
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );

    } catch (error: any) {
      console.error("Register failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "Đăng ký thất bại. Vui lòng thử lại.";
      Alert.alert("Đăng ký thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.innerContainer}>
        {/* Logo */}
        <Text style={styles.logo}>Instagram</Text>

        {/* Inputs */}
        <TextInput
          placeholder="Email hoặc số điện thoại"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder="Tên đầy đủ"
          placeholderTextColor="#999"
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          placeholder="Tên người dùng"
          placeholderTextColor="#999"
          style={[styles.input, { marginBottom: 24 }]}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
        />

        {/* Chính sách */}
        <Text style={styles.policyText}>
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <Text style={styles.policyLink}>Điều khoản</Text> và{" "}
          <Text style={styles.policyLink}>Chính sách bảo mật</Text> của chúng tôi.
        </Text>

        {/* Nút đăng ký */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>HOẶC</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Chuyển về đăng nhập */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  innerContainer: {
    paddingHorizontal: 32,
    paddingTop: 64,
    paddingBottom: 40,
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
  policyText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  policyLink: {
    color: "#7d5fff",
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#7d5fff",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 32,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#4b5563",
    fontSize: 16,
  },
  loginLink: {
    color: "#7d5fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 4,
  },
});