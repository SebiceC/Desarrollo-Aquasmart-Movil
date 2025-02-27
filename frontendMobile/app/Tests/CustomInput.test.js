import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomInput from "../CustomInput";
import { useForm, Controller } from "react-hook-form";

describe("CustomInput Component", () => {
  const Wrapper = ({
    name,
    label,
    placeholder,
    secureTextEntry,
    keyboardType,
    error,
  }) => {
    const { control } = useForm();
    return (
      <CustomInput
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        error={error}
      />
    );
  };

  test("renders label correctly", () => {
    const { getByText } = render(
      <Wrapper name="email" label="Email Address" />
    );
    expect(getByText("Email Address")).toBeTruthy();
  });

  test("renders required asterisk when label includes *", () => {
    const { getByText } = render(
      <Wrapper name="password" label="Password *" />
    );
    expect(getByText("Password *")).toBeTruthy();
  });

  test("displays error message when error is provided", () => {
    const { getByText } = render(
      <Wrapper name="email" label="Email" error="Required field" />
    );
    expect(getByText("Required field")).toBeTruthy();
  });

  test("updates value on text change", () => {
    const { getByPlaceholderText } = render(
      <Wrapper name="username" label="Username" placeholder="Enter username" />
    );
    const input = getByPlaceholderText("Enter username");
    fireEvent.changeText(input, "testuser");
    expect(input.props.value).toBe("testuser");
  });
});
