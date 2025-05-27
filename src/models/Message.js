class Message {
  constructor(content, type = 'user', timestamp = new Date()) {
    this.content = content;
    this.type = type; // 'user' or 'assistant'
    this.timestamp = timestamp;
  }
}

module.exports = Message;

