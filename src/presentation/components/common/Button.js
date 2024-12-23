import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../../../infrastructure/theme/colors";
import { useTheme } from "../../../infrastructure/theme/ThemeContext";

const Button = ({ onPress, children, variant = "primary" }) => {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        {
          backgroundColor:
            variant === "primary"
              ? colors.primary
              : isDarkMode
              ? colors.dark.surface
              : colors.light.surface,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          {
            color:
              variant === "primary"
                ? colors.light.background
                : isDarkMode
                ? colors.dark.text
                : colors.light.text,
          },
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  text: {
    color: colors.light.background,
  },
});

export default Button;
