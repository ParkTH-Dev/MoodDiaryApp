class Emotion {
  constructor(id, primary, intensity, emoji, subEmotions, text, date) {
    this.id = id;
    this.primary = primary;
    this.intensity = intensity;
    this.emoji = emoji;
    this.subEmotions = subEmotions;
    this.text = text;
    this.date = date;
  }

  static fromJSON(json) {
    return new Emotion(
      json.id,
      json.primary,
      json.intensity,
      json.emoji,
      json.subEmotions,
      json.text,
      json.date
    );
  }
}

export default Emotion;
