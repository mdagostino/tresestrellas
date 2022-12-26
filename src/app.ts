import { Context, Markup, Telegraf, Telegram } from 'telegraf';
import { Update } from 'typegram';
import cron from 'node-cron';
import axios from 'axios';


const token: string = process.env.BOT_TOKEN as string;

const telegram: Telegram = new Telegram(token);

const bot: Telegraf<Context<Update>> = new Telegraf(token);

const chatId: string = process.env.CHAT_ID as string;

const config = {
  method: 'get',
  url: 'https://www.adidas.com.ar/api/products/IB3593/availability'
};


cron.schedule('*/10 * * * * *', () => {
  axios(config)
    .then(function (response) {
      const status = response.data["availability_status"]
      if (status != 'NOT_AVAILABLE'){
        if (chatId) {
          const variations = response.data['variation_list']
          let result = `Dispinible ${status}\n`
          for (const variation of variations) {
            result += `size: ${variation.size} availability: ${variation.availability}\n`
          }
          result += `Compra bobo: https://www.adidas.com.ar/camiseta-titular-argentina-3-estrellas-2022/IB3593.html\n`
          telegram.sendMessage(
            chatId,
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
  telegram.sendMessage(
    chatId,
    result
  );
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
  ctx.reply('Hello ' + ctx.from.first_name + '!');
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
