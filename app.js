require("dotenv").config();

const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const BaileysProvider = require("@bot-whatsapp/provider/baileys");
//const MySQLAdapter= require("@bot-whatsapp/database/mock");
//const MySQLAdapter= require("@bot-whatsapp/database/mysql");
const MockAdapter = require("@bot-whatsapp/database/mock");

const { PROMP_INICIAL: PROMP_INICIAL } = require('./promp_Ciudadano_Digital');
const ChatGPTClass = require('./chatgpt.class');
const chatgptClass = new ChatGPTClass();

/////////////////////////////////////////////////////////////////////////////////

// Crear un objeto para guardar el primer mensaje del usuario

const flowChatGPT = addKeyword(EVENTS.WELCOME,
  {
    capture: true
  }).addAnswer(
    "Gracias por utilizar el Chatbot de SASOFTCO el cual utiliza la IA de ChatGPT 🤖 . Estamos creando la conexión con ChatGPT, espera unos segundos..."
   )
  .addAction(
    async (ctx, { flowDynamic }) => {
      
        await chatgptClass.handleMsgChatGPT(ctx.from, PROMP_INICIAL);
        // Si el usuario escribe cualquier otra cosa, se puede manejar aqu
        const response = await chatgptClass.handleMsgChatGPT(ctx.from, ctx.body);
        const message = response.text;

        if (ctx.body.toString() !== 'si confirmo') {
          await flowDynamic(message);
        }
    }
  )
.addAnswer(
    "¿En que mas puedo ayudarte?",
    { capture: true },
    async (ctx, { gotoFlow, fallBack }) => {
      if (ctx.body.toString().toLowerCase() === 'gobierno') {
        // Si el usuario escribe 'GOBIERNO', redirige al flujo 'flowDocs'
        await gotoFlow(flowDocs);
      } else {
        // Si el usuario escribe cualquier otra cosa, se puede manejar aqu
        const response = await chatgptClass.handleMsgChatGPT(ctx.from, ctx.body);
        const message = response.text;
        if (ctx.body.toString() !== 'para') {
          await fallBack(message);
       //   await fallBack("Para salir escribe *para*");
        }
      }
    }
);

//////////////////////////////////////////////////////////////////////////////////


const main = async () => {
  /*
  const adapterDB = new MySQLAdapter(
    {
      host: 'localhost',
      user: 'root',
      database: 'Chatbot_Sasoftco',
      password: 'sasoftco123*',
      port: '3306',
    }
  );
*/
const adapterDB = new MockAdapter();

  const adapterFlow = createFlow([
    flowChatGPT,
  ]);

  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
};

main();