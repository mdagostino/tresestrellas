import { Context, Markup, Telegraf, Telegram } from 'telegraf';
import { Update } from 'typegram';
import cron from 'node-cron';
import axios from 'axios';
import express from 'express';
const HttpsProxyAgent = require("https-proxy-agent")
const httpsAgent = new HttpsProxyAgent({host: "138.121.113.179", port: "8080"})

const token: string = process.env.BOT_TOKEN as string;

const telegram: Telegram = new Telegram(token);

const bot: Telegraf<Context<Update>> = new Telegraf(token);

const chatId: string = process.env.CHAT_ID as string;

const config = {
  method: 'get',
  url: 'https://www.adidas.com.ar/api/products/IB3593/availability',
  httpsAgent: httpsAgent
};

bot.hears('dame la casaca', ()=>{
  sendMessage('Estoy en eso!')
});


cron.schedule('*/10 * * * * *', () => {
  axios(config)
    .then(function (response) {
      const status = response.data["availability_status"]
      console.log(JSON.stringify(response.data))
      if (status != 'NOT_AVAILABLE'){
        if (chatId) {
          const variations = response.data['variation_list']
          let result = `Disponible ${status}\n`
          for (const variation of variations) {
            result += `size: ${variation.size} availability: ${variation.availability}\n`
          }
          result += `Compra bobo: https://www.adidas.com.ar/camiseta-titular-argentina-3-estrellas-2022/IB3593.html\n`

          sendMessage(
            result
          );
        }
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});

function sendMessage(result: string) {
  const chats = chatId.split(',')
  for (const chat of chats) {
    telegram.sendMessage(
      chat,
      result
    );
  }
}

cron.schedule('*/30 * * * *', () => {
  axios(config)
    .then(function (response) {
      const status = response.data["availability_status"]
      sendMessage(`Status: ${status}`);
    })
    .catch(function (error) {
      console.log(error);
    });
});

bot.start((ctx) => {
  ctx.reply('Hello ' + ctx.chat.id + '!');
});

bot.launch();

const app = express()
const port = process.env.PORT ?? 3000

app.get('/', (req, res) => {
  res.send('Works!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
