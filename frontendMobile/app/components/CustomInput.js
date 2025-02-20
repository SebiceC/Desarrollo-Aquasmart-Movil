import { Controller } from "react-hook-form";
import { TextInput, View, Text } from "react-native";

export default function CustomInput({
  control,
  name,
  label,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: "#374151",
          fontWeight: "500",
          marginBottom: 4,
        }}
      >
        {label}
        {label.includes("*") && <Text style={{ color: "red" }}> *</Text>}
      </Text>

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              padding: 12,
              backgroundColor: "white",
            }}
            placeholder={placeholder}
            onChangeText={onChange}
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
          />
        )}
      />
      {error && (
        <Text style={{ color: "red", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
