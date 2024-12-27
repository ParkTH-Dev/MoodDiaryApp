import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { colors } from "../../infrastructure/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EditEntryModal from "../components/EditEntryModal";
import { useTheme } from "../../infrastructure/theme/ThemeContext";

export default function CalendarScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // 데이터 로드 함수
  const loadDiaryEntries = async () => {
    try {
      const entries = await AsyncStorage.getItem("diaryEntries");
      if (entries) {
        // JSON 파싱 전에 데이터 유효성 검사
        try {
          const parsedEntries = JSON.parse(entries);
          if (!Array.isArray(parsedEntries)) {
            throw new Error("데이터 형식이 올바르지 않습니다");
          }

          // emotion 객체 구조 확인 및 복구
          const validatedEntries = parsedEntries.map((entry) => {
            if (typeof entry.emotion === "string") {
              // emotion이 문자열인 경우 객체로 변환
              const emotionObj = EMOTIONS.find(
                (e) => e.emoji === entry.emotion
              ) || {
                emoji: entry.emotion,
                primary: "알 수 없음",
                intensity: 5,
              };
              return { ...entry, emotion: emotionObj };
            }
            return entry;
          });

          setDiaryEntries(validatedEntries);

          // 마커 데이터 생성
          const markers = {};
          validatedEntries.forEach((entry) => {
            const dateStr = new Date(entry.date).toISOString().split("T")[0];
            markers[dateStr] = {
              marked: true,
              dotColor: colors.primary,
            };
          });
          setMarkedDates(markers);
        } catch (parseError) {
          console.error("데이터 파싱 실패:", parseError);
          // 손상된 데이터 초기화
          await AsyncStorage.setItem("diaryEntries", JSON.stringify([]));
          setDiaryEntries([]);
          Alert.alert(
            "데이터 오류",
            "데이터가 손상되어 초기화되었습니다. 죄송합니다."
          );
        }
      }
    } catch (error) {
      console.error("일기 데이터 로딩 실패:", error);
      Alert.alert("오류", "데이터를 불러오는 중 문제가 발생했습니다.");
    }
  };

  // 화면이 포커스될 때마다 데이터 새로 로드
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadDiaryEntries();
    });

    return unsubscribe;
  }, [navigation]);

  // 초기 로드
  useEffect(() => {
    loadDiaryEntries();
  }, []);

  // 선택된 날짜의 일기 항목 필터링
  const selectedDateEntries = diaryEntries
    .filter((entry) => {
      const entryDate = new Date(entry.date).toISOString().split("T")[0];
      return entryDate === selectedDate;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // 시간순 정렬

  const deleteEntry = async (id) => {
    try {
      const updatedEntries = diaryEntries.filter((entry) => entry.id !== id);
      await AsyncStorage.setItem(
        "diaryEntries",
        JSON.stringify(updatedEntries)
      );
      setDiaryEntries(updatedEntries);
      console.log("기록이 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  const editEntry = async (id, updatedFeeling, updatedEmotion) => {
    try {
      const updatedEntries = diaryEntries.map((entry) => {
        if (entry.id === id) {
          return {
            ...entry,
            feeling: updatedFeeling,
            emotion: updatedEmotion,
          };
        }
        return entry;
      });

      await AsyncStorage.setItem(
        "diaryEntries",
        JSON.stringify(updatedEntries)
      );
      setDiaryEntries(updatedEntries);
      console.log("기록이 수정되었습니다.");
    } catch (error) {
      console.error("수정 실패:", error);
    }
  };

  const showEditDeleteOptions = (entry) => {
    console.log("기록 관리 메뉴 열림");
    setSelectedEntry(entry);
    setIsEditModalVisible(true);
  };

  const renderEmotionEntry = (entry) => {
    return (
      <TouchableOpacity
        style={styles.entryContainer}
        onPress={() => showEditDeleteOptions(entry)}
      >
        <View style={styles.entryContent}>
          <Text
            style={[
              styles.emotionTime,
              {
                color: isDarkMode
                  ? colors.dark.placeholder
                  : colors.light.placeholder,
              },
            ]}
          >
            {new Date(entry.date).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <View style={styles.emotionContentWrapper}>
            <Text style={styles.emotionEmoji}>
              {typeof entry.emotion === "string"
                ? entry.emotion
                : entry.emotion.emoji}
            </Text>
            <Text
              style={[
                styles.emotionText,
                {
                  color: isDarkMode ? colors.dark.text : colors.light.text,
                },
              ]}
            >
              {entry.feeling}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayEntries = (entries) => {
    if (!entries || entries.length === 0) {
      return (
        <View style={styles.noEntriesContainer}>
          <Text style={styles.noEntriesText}>기록이 없습니다</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.entriesContainer}>
        {entries.map((entry, index) => (
          <View key={index}>{renderEmotionEntry(entry)}</View>
        ))}
      </ScrollView>
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
          감정 캘린더
        </Text>
      </View>

      <Calendar
        key={isDarkMode ? "dark" : "light"}
        style={[
          styles.calendar,
          {
            backgroundColor: isDarkMode
              ? colors.dark.surface
              : colors.light.background,
            borderRadius: 8,
          },
        ]}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        current={selectedDate || new Date().toISOString().split("T")[0]}
        theme={{
          backgroundColor: isDarkMode
            ? colors.dark.surface
            : colors.light.background,
          calendarBackground: isDarkMode
            ? colors.dark.surface
            : colors.light.background,

          // 텍스트 색상 통일
          textColor: isDarkMode ? colors.dark.text : colors.light.text,
          monthTextColor: isDarkMode ? colors.dark.text : colors.light.text,
          dayTextColor: isDarkMode ? colors.dark.text : colors.light.text,
          textSectionTitleColor: isDarkMode
            ? colors.dark.text
            : colors.light.text,
          arrowColor: isDarkMode ? colors.dark.text : colors.light.text,

          // 선택된 날짜
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: "#FFFFFF",

          // 오늘 날짜
          todayTextColor: colors.primary,

          // 비활성화된 날짜
          textDisabledColor: isDarkMode
            ? colors.dark.placeholder
            : colors.light.placeholder,

          // 마커 (점)
          dotColor: colors.primary,
          selectedDotColor: "#FFFFFF",

          // 폰트 설정
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
          textDayFontSize: 16,
          textDayHeaderFontWeight: "600",
          textMonthFontWeight: "bold",
        }}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
          },
        }}
        monthFormat={"yyyy년 MM월"}
      />

      {selectedDate && renderDayEntries(selectedDateEntries)}

      <EditEntryModal
        visible={isEditModalVisible}
        entry={selectedEntry}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedEntry(null);
        }}
        onSave={(updatedFeeling, updatedEmotion) => {
          if (selectedEntry) {
            editEntry(selectedEntry.id, updatedFeeling, updatedEmotion);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  calendar: {
    marginHorizontal: 20,
    marginVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 8,
  },
  emotionsList: {
    paddingHorizontal: 20,
  },
  emotionItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  emotionItemContent: {
    flex: 1,
  },
  emotionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  emotionTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  emotionEmoji: {
    fontSize: 24,
  },
  emotionText: {
    fontSize: 16,
    flex: 1,
  },
  noEntriesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  entriesContainer: {
    flex: 1,
    padding: 16,
  },
  entryContainer: {
    backgroundColor: colors.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryContent: {
    flexDirection: "column",
  },
  entryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  entryTextContainer: {
    flex: 1,
  },
  entryEmotion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  entryNote: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  entryTime: {
    fontSize: 12,
    color: "#999",
  },
  noEntriesContainer: {
    padding: 16,
    alignItems: "center",
  },
  emotionContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
