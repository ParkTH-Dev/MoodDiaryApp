import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors } from "../../infrastructure/theme/colors";
import { useTheme } from "../../infrastructure/theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [backupData, setBackupData] = useState([]);

  const exportData = async () => {
    try {
      const diaryEntries = await AsyncStorage.getItem("diaryEntries");
      if (diaryEntries) {
        const fileName = `moodlog_backup_${
          new Date().toISOString().split("T")[0]
        }.json`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, diaryEntries);
        await Sharing.shareAsync(filePath);
      }
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      Alert.alert("오류", "데이터 내보내기에 실패했습니다.");
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      "데이터 초기화",
      "모든 감정 기록이 삭제됩니다. 계속하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert("완료", "모든 데이터가 초기화되었습니다.");
            } catch (error) {
              console.error("데이터 초기화 실패:", error);
              Alert.alert("오류", "데이터 초기화에 실패했습니다.");
            }
          },
        },
      ]
    );
  };

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
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDarkMode ? colors.dark.text : colors.light.text },
          ]}
        >
          설정
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.settingItem,
          {
            backgroundColor: isDarkMode
              ? colors.dark.surface
              : colors.light.surface,
          },
        ]}
        onPress={toggleTheme}
      >
        <Text
          style={[
            styles.settingText,
            { color: isDarkMode ? colors.dark.text : colors.light.text },
          ]}
        >
          다크 모드
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.light.placeholder, true: colors.primary }}
          thumbColor={isDarkMode ? colors.dark.text : colors.light.background}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.settingItem,
          {
            backgroundColor: isDarkMode
              ? colors.dark.surface
              : colors.light.surface,
          },
        ]}
      >
        <Text
          style={[
            styles.settingText,
            { color: isDarkMode ? colors.dark.text : colors.light.text },
          ]}
        >
          감정 기록 알림
        </Text>
        <Switch />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.settingGroup,
          {
            backgroundColor: isDarkMode
              ? colors.dark.surface
              : colors.light.surface,
          },
        ]}
      >
        <Text
          style={[
            styles.settingGroupTitle,
            { color: isDarkMode ? colors.dark.text : colors.light.text },
          ]}
        >
          데이터 관리
        </Text>
        <Text style={styles.settingDescription}>데이터 백업 및 복원</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.settingGroup,
          {
            backgroundColor: isDarkMode
              ? colors.dark.surface
              : colors.light.surface,
          },
        ]}
      >
        <Text
          style={[
            styles.settingGroupTitle,
            { color: isDarkMode ? colors.dark.text : colors.light.text },
          ]}
        >
          앱 정보
        </Text>
        <Text style={styles.settingDescription}>버전 1.0.0</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingGroup: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  settingGroupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.light.text,
  },
});
