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
import Ionicons from "react-native-vector-icons/Ionicons";
import Modal from "react-native-modal";

const EMOTIONS = [
  { emoji: "😊", primary: "기쁨", intensity: 8 },
  { emoji: "😔", primary: "슬픔", intensity: 4 },
  { emoji: "😡", primary: "분노", intensity: 7 },
  { emoji: "😰", primary: "불안", intensity: 6 },
  { emoji: "😌", primary: "평온", intensity: 5 },
  { emoji: "🥰", primary: "설렘", intensity: 8 },
  { emoji: "😫", primary: "지침", intensity: 3 },
  { emoji: "😕", primary: "허탈", intensity: 4 },
];

export default function HomeScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const [feeling, setFeeling] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [isEmotionModalVisible, setIsEmotionModalVisible] = useState(false);
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
      console.error("데이터 로드 실패:", error);
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
    setSelectedEntry(entry);
    setIsEditModalVisible(true);
  };

  const EmotionButton = ({ emotion, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.emotionButton, isSelected && styles.selectedEmotionButton]}
      onPress={() => onPress(emotion)}
    >
      <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
      <Text
        style={[styles.emotionLabel, isSelected && styles.selectedEmotionLabel]}
      >
        {emotion.primary}
      </Text>
    </TouchableOpacity>
  );

  const renderSelectedEmotion = () => {
    if (!selectedEmotion) return null;
    return (
      <View style={styles.selectedEmotionContainer}>
        <Text style={styles.selectedEmotionText}>
          {selectedEmotion.emoji} {selectedEmotion.primary}
        </Text>
      </View>
    );
  };

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
    setIsEmotionModalVisible(false);
  };

  const handleDelete = async (id) => {
    try {
      const updatedEntries = entries.filter((entry) => entry.id !== id);
      await AsyncStorage.setItem(
        "diaryEntries",
        JSON.stringify(updatedEntries)
      );
      setEntries(updatedEntries);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("일기 삭제 실패:", error);
      Alert.alert("오류", "일기 삭제 중 문제가 발생했습니다.");
    }
  };

  const handleUpdate = async (feeling, emotion) => {
    try {
      if (!selectedEntry) return;

      const updatedEntries = entries.map((entry) =>
        entry.id === selectedEntry.id ? { ...entry, feeling, emotion } : entry
      );

      await AsyncStorage.setItem(
        "diaryEntries",
        JSON.stringify(updatedEntries)
      );
      setEntries(updatedEntries);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("일기 수정 실패:", error);
      Alert.alert("오류", "일기 수정 중 문제가 발생했습니다.");
    }
  };

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
        <View style={styles.inputSection}>
          <TouchableOpacity
            style={[
              styles.emotionSelector,
              selectedEmotion && styles.selectedEmotionSelector,
            ]}
            onPress={() => setIsEmotionModalVisible(true)}
          >
            <Text style={styles.emotionSelectorText}>
              {selectedEmotion
                ? `${selectedEmotion.emoji} ${selectedEmotion.primary}`
                : "감정 선택하기"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={24}
              color={isDarkMode ? colors.dark.text : colors.light.text}
            />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode
                  ? colors.dark.surface
                  : colors.light.surface,
                color: isDarkMode ? colors.dark.text : colors.light.text,
              },
            ]}
            placeholder="오늘의 감정을 기록해보세요.. (최대 500자)"
            placeholderTextColor={
              isDarkMode ? colors.dark.placeholder : colors.light.placeholder
            }
            value={feeling}
            onChangeText={setFeeling}
            multiline
            maxLength={500}
          />
        </View>

        <Modal
          isVisible={isEmotionModalVisible}
          onBackdropPress={() => setIsEmotionModalVisible(false)}
          backdropOpacity={0.5}
          style={styles.modal}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDarkMode
                  ? colors.dark.surface
                  : colors.light.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: isDarkMode ? colors.dark.text : colors.light.text,
                },
              ]}
            >
              감정 선택
            </Text>
            <View style={styles.emotionsList}>
              {EMOTIONS.map((emotion) => (
                <EmotionButton
                  key={emotion.primary}
                  emotion={emotion}
                  isSelected={selectedEmotion?.primary === emotion.primary}
                  onPress={handleEmotionSelect}
                />
              ))}
            </View>
          </View>
        </Modal>

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
                  <Text style={styles.entryEmotion}>
                    {entry.emotion.emoji} {entry.emotion.primary}
                  </Text>
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
          onSave={handleUpdate}
          onDelete={handleDelete}
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
  inputSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  emotionSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 12,
    backgroundColor: colors.light.surface,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  selectedEmotionSelector: {
    borderColor: colors.primary,
  },
  emotionSelectorText: {
    fontSize: 16,
    color: colors.light.text,
  },
  input: {
    fontSize: 16,
    fontWeight: "normal",
    minHeight: 100,
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
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  emotionsList: {
    paddingBottom: 20,
  },
  emotionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  selectedEmotionButton: {
    backgroundColor: colors.primary + "10",
  },
  emotionEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  emotionLabel: {
    fontSize: 16,
    color: colors.text,
  },
  selectedEmotionLabel: {
    color: colors.primary,
    fontWeight: "bold",
  },
  selectedEmotionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primary + "10",
    borderRadius: 8,
  },
  selectedEmotionText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: "center",
  },
});
