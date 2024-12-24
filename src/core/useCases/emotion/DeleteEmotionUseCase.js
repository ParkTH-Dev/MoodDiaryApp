class DeleteEmotionUseCase {
  constructor(emotionRepository) {
    this.emotionRepository = emotionRepository;
  }

  async execute(id) {
    return await this.emotionRepository.delete(id);
  }
}

export default DeleteEmotionUseCase;
