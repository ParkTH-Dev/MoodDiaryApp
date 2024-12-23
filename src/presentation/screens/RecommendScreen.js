import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../infrastructure/theme/colors";
import { useTheme } from "../../infrastructure/theme/ThemeContext";

export default function RecommendScreen() {
  const { isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? colors.dark.background
            : colors.light.background,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isDarkMode ? colors.dark.text : colors.light.text },
        ]}
      >
        추천 화면
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
  },
});
