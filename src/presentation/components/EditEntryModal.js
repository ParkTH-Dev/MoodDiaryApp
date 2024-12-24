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
  Animated,
  Alert,
} from "react-native";
import { colors } from "../../infrastructure/theme/colors";
import { useTheme } from "../../infrastructure/theme/ThemeContext";

const EditEntryModal = ({ visible, entry, onClose, onSave, onDelete }) => {
  const { isDarkMode } = useTheme();
  const [feeling, setFeeling] = useState(entry?.feeling || "");
  const [selectedEmotion, setSelectedEmotion] = useState(entry?.emotion || "");
  const [slideAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const modalTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handleDelete = () => {
    Alert.alert("삭제 확인", "이 기록을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          onDelete(entry.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDarkMode
                    ? colors.dark.background
                    : colors.light.background,
                  transform: [{ translateY: modalTranslateY }],
                },
              ]}
            >
              <View style={styles.header}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: isDarkMode ? colors.dark.text : colors.light.text,
                    },
                  ]}
                >
                  수정하기
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>✕</Text>
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
                    {
                      color: isDarkMode ? colors.dark.text : colors.light.text,
                    },
                  ]}
                  placeholder="감정을 입력해주세요 (최대 500자)"
                  placeholderTextColor={
                    isDarkMode
                      ? colors.dark.placeholder
                      : colors.light.placeholder
                  }
                  value={feeling}
                  onChangeText={setFeeling}
                  multiline
                  maxLength={500}
                />
              </View>

              <View style={styles.emotionsContainer}>
                {["😊", "😐", "😔", "😡"].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emotionButton,
                      selectedEmotion === emoji && styles.selectedEmotionButton,
                    ]}
                    onPress={() => setSelectedEmotion(emoji)}
                  >
                    <Text style={styles.emotionIcon}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton]}
                  onPress={() => {
                    onSave(feeling, selectedEmotion);
                    onClose();
                  }}
                >
                  <Text style={styles.saveButtonText}>수정</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#ff4444",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    flex: 1,
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
  emotionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  emotionIcon: {
    fontSize: 24,
  },
  selectedEmotionButton: {
    backgroundColor: colors.primary,
  },
  selectedEmotionIcon: {
    color: colors.light.background,
  },
  selectedIndicator: {
    backgroundColor: colors.light.background,
    borderRadius: 4,
    padding: 2,
    position: "absolute",
    top: -5,
    right: -5,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
});

export default EditEntryModal;
