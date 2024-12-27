import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";
import { colors } from "../../infrastructure/theme/colors";
import { useTheme } from "../../infrastructure/theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useTheme();

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

  const openPrivacyPolicy = () => {
    Alert.alert(
      "개인정보처리방침",
      "이 앱은 사용자의 개인정보를 수집하지 않습니다. 모든 감정 기록은 사용자의 기기에만 저장되며, 외부로 전송되지 않습니다.",
      [{ text: "확인", style: "default" }]
    );
  };

  const openTermsOfService = () => {
    Alert.alert(
      "이용약관",
      "이 앱은 감정 기록 및 콘텐츠 추천을 목적으로 설계되었습니다. 앱에서 제공하는 분석과 추천은 참고용이며, 전문적인 상담을 대체할 수 없습니다. 앱 사용 중 발생한 문제에 대해 개발자는 법적 책임을 지지 않습니다.",
      [{ text: "확인", style: "default" }]
    );
  };

  const openDataUsage = () => {
    Alert.alert(
      "데이터 및 권한 안내",
      "• 저장 공간: 감정 기록을 기기에 저장하기 위해 사용됩니다.\n• 네트워크: AI 분석 및 음악 추천을 위해 사용됩니다.\n\n모든 데이터는 사용자의 기기에만 저장되며, 서버로 전송되지 않습니다.",
      [{ text: "확인", style: "default" }]
    );
  };

  const appVersion = Constants.expoConfig.version || "1.0.0";
  const buildNumber =
    Constants.expoConfig.ios?.buildNumber ||
    Constants.expoConfig.android?.versionCode ||
    "1";

  const SettingItem = ({ title, description, onPress, rightElement }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: isDarkMode
            ? colors.dark.surface
            : colors.light.surface,
        },
      ]}
      onPress={onPress}
      android_ripple={{ color: isDarkMode ? "#ffffff20" : "#00000020" }}
    >
      <View style={styles.settingItemContent}>
        <Text
          style={[
            styles.settingText,
            { color: isDarkMode ? colors.dark.text : colors.light.text },
          ]}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.settingDescription,
              {
                color: isDarkMode
                  ? colors.dark.placeholder
                  : colors.light.placeholder,
              },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

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
      <StatusBar
        backgroundColor={
          isDarkMode ? colors.dark.background : colors.light.background
        }
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />

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

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            앱 설정
          </Text>
          <SettingItem
            title="다크 모드"
            description="어두운 테마로 변경"
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={Platform.Version >= 23 ? "#ffffff" : "#f4f3f4"}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            법적 고지
          </Text>
          <SettingItem
            title="개인정보처리방침"
            description="개인정보 수집 및 이용에 대한 안내"
            onPress={openPrivacyPolicy}
          />
          <SettingItem
            title="이용약관"
            description="앱 사용에 대한 약관"
            onPress={openTermsOfService}
          />
          <SettingItem
            title="데이터 및 권한"
            description="앱이 사용하는 데이터와 권한 안내"
            onPress={openDataUsage}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            데이터 관리
          </Text>
          <SettingItem
            title="데이터 초기화"
            description="모든 감정 기록 삭제"
            onPress={clearAllData}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            앱 정보
          </Text>
          <SettingItem
            title="버전"
            description={`${appVersion} (${buildNumber})`}
          />
          <SettingItem title="개발자" description="감정기록 앱" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingItemContent: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
});
