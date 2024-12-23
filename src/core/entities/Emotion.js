class Emotion {
  constructor(id, type, text, date, emoji) {
    this.id = id;
    this.type = type; // 'HAPPY', 'SAD', 'ANGRY' 등
    this.text = text;
    this.date = date;
    this.emoji = emoji;
  }
}

export default Emotion;
