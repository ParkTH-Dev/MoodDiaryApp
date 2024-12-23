import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { colors } from "../../infrastructure/theme/colors";
import { useTheme } from "../../infrastructure/theme/ThemeContext";

const EditEntryModal = ({ visible, entry, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const [feeling, setFeeling] = useState(entry?.feeling || "");
  const [selectedEmotion, setSelectedEmotion] = useState(entry?.emotion || "");

  const EmotionButton = ({ icon, isSelected }) => (
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

  const handleSave = () => {
    if (!feeling || !selectedEmotion) {
      Alert.alert("알림", "감정과 이모지를 모두 입력해주세요.");
      return;
    }
    onSave(feeling, selectedEmotion);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
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
                감정 수정하기
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text
                  style={[
                    styles.closeButtonText,
                    {
                      color: isDarkMode
                        ? colors.dark.placeholder
                        : colors.light.placeholder,
                    },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isDarkMode
                    ? colors.dark.surface
                    : colors.light.surface,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  { color: isDarkMode ? colors.dark.text : colors.light.text },
                ]}
                placeholder="감정을 입력해주세요 (최대 500자)"
                placeholderTextColor={
                  isDarkMode
                    ? colors.dark.placeholder
                    : colors.light.placeholder
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

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>수정하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: colors.light.background,
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.light.text,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.light.placeholder,
  },
  inputContainer: {
    backgroundColor: colors.light.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    minHeight: 100,
  },
  emotionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  // ... 기존 emotion 관련 스타일과 동일 ...
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.light.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditEntryModal;
