class SaveEmotionUseCase {
  constructor(emotionRepository) {
    this.emotionRepository = emotionRepository;
  }

  async execute(emotionData) {
    return await this.emotionRepository.save(emotionData);
  }
}

export default SaveEmotionUseCase;
