import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themeMode");
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark");
      }
    } catch (error) {
      console.error("테마 설정 로드 실패:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      await AsyncStorage.setItem("themeMode", newThemeValue ? "dark" : "light");
      setIsDarkMode(newThemeValue);
      if (Platform.OS === "android") {
        const RNRestart = require("react-native-restart").default;
        setTimeout(() => {
          RNRestart.Restart();
        }, 100);
      }
    } catch (error) {
      console.error("테마 설정 저장 실패:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        key: isDarkMode ? "dark" : "light",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
