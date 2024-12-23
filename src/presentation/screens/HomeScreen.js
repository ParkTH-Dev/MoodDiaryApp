import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../infrastructure/theme/colors";
import EditEntryModal from "../components/EditEntryModal";
import { useTheme } from "../../infrastructure/theme/ThemeContext";

export default function HomeScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const [feeling, setFeeling] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [entries, setEntries] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // 데이터 로드 함수
  const loadEntries = async () => {
    try {
      const savedEntries = await AsyncStorage.getItem("diaryEntries");
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  // 화면이 포커스될 때마다 데이터 새로 로드
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadEntries();
    });

    return unsubscribe;
  }, [navigation]);

  // 초기 로드
  useEffect(() => {
    loadEntries();
  }, []);

  const saveEntry = async () => {
    if (!feeling || !selectedEmotion) {
      Alert.alert("알림", "감정과 이모지를 모두 입력해주세요.");
      return;
    }

    try {
      const newEntry = {
        id: Date.now().toString(),
        feeling,
        emotion: selectedEmotion,
        date: new Date().toISOString(),
      };

      const updatedEntries = [newEntry, ...entries];
      await AsyncStorage.setItem(
        "diaryEntries",
        JSON.stringify(updatedEntries)
      );
      setEntries(updatedEntries);
      setFeeling("");
      setSelectedEmotion("");
      Alert.alert("성공", "감정이 저장되었습니다.");
    } catch (error) {
      console.error("저장 실패:", error);
      Alert.alert("오류", "저장에 실패했습니다.");
    }
  };

  const deleteEntry = async (id) => {
    try {
      const updatedEntries = entries.filter((entry) => entry.id !== id);
      await AsyncStorage.setItem(
        "diaryEntries",
        JSON.stringify(updatedEntries)
      );
      setEntries(updatedEntries);
      Alert.alert("성공", "기록이 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      Alert.alert("오류", "삭제에 실패했습니다.");
    }
  };

  const editEntry = async (id, updatedFeeling, updatedEmotion) => {
    try {
      const updatedEntries = entries.map((entry) => {
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
      setEntries(updatedEntries);
      Alert.alert("성공", "기록이 수정되었습니다.");
    } catch (error) {
      console.error("수정 실패:", error);
      Alert.alert("오류", "수정에 실패했습니다.");
    }
  };

  const showEditDeleteOptions = (entry) => {
    Alert.alert("기록 관리", "어떤 작업을 하시겠습니까?", [
      {
        text: "수정",
        onPress: () => {
          setSelectedEntry(entry);
          setIsEditModalVisible(true);
        },
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          Alert.alert("삭제 확인", "정말 삭제하시겠습니까?", [
            {
              text: "취소",
              style: "cancel",
            },
            {
              text: "삭제",
              style: "destructive",
              onPress: () => deleteEntry(entry.id),
            },
          ]);
        },
      },
      {
        text: "취소",
        style: "cancel",
      },
    ]);
  };

  const EmotionButton = ({ icon, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.emotionButton, isSelected && styles.selectedEmotionButton]}
      onPress={() => setSelectedEmotion(icon)}
    >
      <Text
        style={[styles.emotionIcon, isSelected && styles.selectedEmotionIcon]}
      >
        {icon}
      </Text>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedText}>선택됨</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            감정 기록
          </Text>
        </View>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDarkMode
                ? colors.dark.background
                : colors.light.background,
              marginBottom: 20,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode
                  ? colors.dark.surface
                  : colors.light.surface,
                color: isDarkMode ? colors.dark.text : colors.light.text,
                padding: 15,
                borderRadius: 8,
              },
            ]}
            placeholder="오늘의 감정을 기록해보세요... (최대 500자)"
            placeholderTextColor={
              isDarkMode ? colors.dark.placeholder : colors.light.placeholder
            }
            value={feeling}
            onChangeText={(text) => {
              if (text.length <= 500) {
                setFeeling(text);
              }
            }}
            maxLength={500}
            multiline
          />
        </View>

        <View style={styles.emotionsContainer}>
          <EmotionButton icon="😊" isSelected={selectedEmotion === "😊"} />
          <EmotionButton icon="😐" isSelected={selectedEmotion === "😐"} />
          <EmotionButton icon="😔" isSelected={selectedEmotion === "😔"} />
          <EmotionButton icon="😡" isSelected={selectedEmotion === "😡"} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? colors.dark.text : colors.light.text },
          ]}
        >
          최근 기록
        </Text>
        <ScrollView style={styles.entriesContainer}>
          {entries.slice(0, 5).map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={[
                styles.entryItem,
                {
                  backgroundColor: isDarkMode
                    ? colors.dark.surface
                    : colors.light.surface,
                },
              ]}
              onPress={() => showEditDeleteOptions(entry)}
              onLongPress={() => showEditDeleteOptions(entry)}
            >
              <View style={styles.entryContent}>
                <View style={styles.entryHeader}>
                  <Text
                    style={[
                      styles.entryDate,
                      {
                        color: isDarkMode
                          ? colors.dark.placeholder
                          : colors.light.placeholder,
                      },
                    ]}
                  >
                    {new Date(entry.date).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.entryEmotion}>{entry.emotion}</Text>
                </View>
                <Text
                  style={[
                    styles.entryText,
                    {
                      color: isDarkMode ? colors.dark.text : colors.light.text,
                    },
                  ]}
                >
                  {entry.feeling}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.light.text,
  },
  inputContainer: {
    backgroundColor: colors.light.surface,
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    fontWeight: "normal",
    minHeight: 100,
  },
  emotionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 30,
  },
  emotionButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 60,
  },
  emotionIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  emotionCount: {
    fontSize: 14,
    color: colors.light.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 15,
  },
  entriesContainer: {
    paddingHorizontal: 20,
  },
  entryItem: {
    backgroundColor: colors.light.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    color: colors.light.placeholder,
  },
  entryEmotion: {
    fontSize: 20,
  },
  entryText: {
    fontSize: 16,
    color: colors.light.text,
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: colors.light.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedEmotionButton: {
    backgroundColor: colors.light.surface,
    borderColor: colors.primary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedEmotionIcon: {
    transform: [{ scale: 1.1 }],
  },
  selectedIndicator: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  selectedText: {
    color: colors.light.background,
    fontSize: 12,
    fontWeight: "bold",
  },
});
