class SaveEmotionUseCase {
  constructor(emotionRepository) {
    this.emotionRepository = emotionRepository;
  }

  async execute(emotionData) {
    // 감정 강도가 없으면 기본값 5 설정
    const intensity = emotionData.intensity || 5;

    // 주요 감정 카테고리 확인
    const validPrimaryEmotions = [
      "기쁨",
      "슬픔",
      "분노",
      "불안",
      "평온",
      "설렘",
      "지침",
      "허탈",
    ];

    if (!validPrimaryEmotions.includes(emotionData.primary)) {
      throw new Error("올바르지 않은 감정 카테고리입니다.");
    }

    // 이모지 매핑
    const emojiMap = {
      기쁨: "😊",
      슬픔: "😔",
      분노: "😡",
      불안: "😰",
      평온: "😌",
      설렘: "🥰",
      지침: "😫",
      허탈: "😕",
    };

    const emotion = new Emotion(
      emotionData.id,
      emotionData.primary,
      intensity,
      emojiMap[emotionData.primary],
      emotionData.subEmotions || [],
      emotionData.text,
      emotionData.date || new Date()
    );

    return await this.emotionRepository.save(emotion);
  }
}

export default SaveEmotionUseCase;
