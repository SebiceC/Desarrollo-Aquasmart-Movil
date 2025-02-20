import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

export default function LoadingButton({ title, onPress, isLoading = false }) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: "#2563eb",
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
      }}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
