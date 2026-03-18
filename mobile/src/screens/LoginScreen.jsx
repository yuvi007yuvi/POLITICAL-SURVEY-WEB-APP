import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext.jsx";

export const LoginScreen = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await login(form);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f8fafc" }}>
      <View style={{ gap: 16, padding: 24, backgroundColor: "#ffffff", borderRadius: 24 }}>
        <Text style={{ fontSize: 30, fontWeight: "700", color: "#12453f" }}>Political Soch</Text>
        <Text style={{ color: "#475569" }}>Secure field survey login for survey agents.</Text>
        <TextInput
          placeholder="Email"
          style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 14, padding: 14 }}
          value={form.email}
          onChangeText={(email) => setForm((current) => ({ ...current, email }))}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={{ borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 14, padding: 14 }}
          value={form.password}
          onChangeText={(password) => setForm((current) => ({ ...current, password }))}
        />
        {error ? <Text style={{ color: "#dc2626" }}>{error}</Text> : null}
        <Pressable
          onPress={handleLogin}
          style={{ borderRadius: 14, backgroundColor: "#12453f", padding: 16, alignItems: "center" }}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: "#ffffff", fontWeight: "700" }}>Login</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

