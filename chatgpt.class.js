require('dotenv').config()

class ChatGPTClass {
  conversations = {}; 
  optionsGPT = { model: "gpt-3.5-turbo-0301" };
  openai = undefined;

  constructor() {
    this.init().then();
  }

  /**
   * Esta funcion inicializa
   */
  init = async () => {
    const { ChatGPTAPI } = await import("chatgpt");
    const fetch = await import('node-fetch');
    this.openai = new ChatGPTAPI(
        {
          apiKey: process.env.OPENAI_API_KEY,
          fetch: fetch.default
        }
    );
  };

  /**
   * Manejador de los mensajes
   * su funcion es enviar un mensaje a WhatsApp
   * @param {*} ctx 
   */
  handleMsgChatGPT = async (phone, body) => {
    console.log("Número de teléfono: ", phone); // Verifica el número de teléfono

    if (!this.conversations[phone]) {
      this.conversations[phone] = { queue: [] };
    }

    const interaccionChatGPT = await this.openai.sendMessage(body, {
      conversationId: !this.conversations[phone].queue.length
        ? undefined
        : this.conversations[phone].queue[this.conversations[phone].queue.length - 1].conversationId,
      parentMessageId: !this.conversations[phone].queue.length
        ? undefined
        : this.conversations[phone].queue[this.conversations[phone].queue.length - 1].id,
    });

    console.log("Identificadores de conversación y mensaje: ", interaccionChatGPT.conversationId, interaccionChatGPT.id); // Verifica los identificadores
    console.log("Interacción ChatGPT: ", interaccionChatGPT); // Verifica la interacción

    this.conversations[phone].queue.push(interaccionChatGPT);
    return interaccionChatGPT
  };
}

module.exports = ChatGPTClass;