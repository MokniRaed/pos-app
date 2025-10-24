import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#ef4444" />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>This screen does not exist.</Text>

        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Return to POS</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1f2937",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#2563eb",
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
