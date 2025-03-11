import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Controller } from "react-hook-form";

export const CustomInput = ({
  control,
  name,
  label,
  placeholder,
  error,
  secureTextEntry = false,
  showPasswordToggle = false,
  onTogglePassword,
  keyboardType = "default",
  maxLength,
  rules,
  numericOnly = false,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>
      {label}
      <Text style={{ color: "red" }}> *</Text>
    </Text>
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              error && { borderColor: "#E53E3E" },
              showPasswordToggle && { paddingRight: 70 },
            ]}
            placeholder={placeholder}
            placeholderTextColor="#A0AEC0"
            onChangeText={(text) => {
              const processedText = numericOnly
                ? text.replace(/[^0-9]/g, "")
                : text;
              const limitedText = maxLength
                ? processedText.slice(0, maxLength)
                : processedText;
              onChange(limitedText);
            }}
            value={value}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            maxLength={maxLength}
          />
          {showPasswordToggle && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={onTogglePassword}
            >
              <Text style={styles.toggleText}>
                {secureTextEntry ? "Mostrar" : "Ocultar"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
    {error && <Text style={styles.error}>{error.message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 24 },
  label: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: { position: "relative" },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#2D3748",
  },
  error: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 4,
  },
  toggleButton: {
    position: "absolute",
    right: 10,
    top: 12,
    zIndex: 2,
  },
  toggleText: {
    color: "#4299E1",
    fontWeight: "600",
    fontSize: 14,
  },
});
