import { Context, Markup, Telegraf, Telegram } from 'telegraf';
import { Update } from 'typegram';
import cron from 'node-cron';
import axios from 'axios';
import express from 'express';


const token: string = process.env.BOT_TOKEN as string;

const telegram: Telegram = new Telegram(token);

const bot: Telegraf<Context<Update>> = new Telegraf(token);

const chatId: string = process.env.CHAT_ID as string;

const config = {
  method: 'get',
  url: 'https://www.adidas.com.ar/api/products/IB3593/availability',
  headers: {
    'Cookie': '_abck=B4E2DA1A0C8C70A0ACBD6A74C1983E03~-1~YAAQSuocuN7HWhmFAQAAmoJrTwkVxEdyXtMG+ywdJ5QXl3gywYpQgz26L4LohHiC3SVJB5LmBahaA7RqXnkMjg+dRqsq8gpCdcJiNuH5Z53pGvz9mGV/q/tLGohd5ZmPdccu+97rkJ46hbqkbuFslsl9v5icRBECHEiCeVCBpqnGdVl0xQ6SDyS1LF4Gwwh1toqgNJhrGPsfk1w8TOIsNyv0iIQ2lXGq6Sy0HunjDhpTObwpRBmQDX7DtrBch/05M7l0HnXCsiQuRJ26KCxZz9iLGFzQUNxz0WAbUCE0v0aq/C8mwStjXxwMJx/GEexV+DZTY7BLGvyShctk+bKJN348EuCSvut8OVDVtJ2QdoeXru17HI4H996OhZRbPgCVg1iPuaAIhvQKF0yrdF2V1oy389FlSuvIzduIooCwmJCW0Yvp4qLqvLOitn6Wkxuf3E2NDpjVEq5zn3OzPyo=~-1~-1~1672071190; ak_bmsc=0AC2B5AFBE00F268C88D09D63653C316~000000000000000000000000000000~YAAQSuocuN/HWhmFAQAAmoJrTxJ3FjeP1vJnfKws8RqD9XovpCQv/t2+WAOD4eC6U7guLc+4scwJBPpborZ6EYQ/tvz9qCGyQnw8qcD65oUsJjURGnnVstSddQ92f8F6miCwZe0CrB1L6ONWr6eHWEsg1ErvsL2gpOMiJ44oq1t73y524DVsRc4vyYhbugGcHKCKIq0Mr3WWmBQXDNgt/a3dKK8dh/5CeF7rZFt5iwEDWEY9WyF87deO96Y8276oncho/gCO/S2etydOC3m7STjLguwyq8efWgKs0v/01+gGD1lDiFRCOzClpry0CZMRJE8rGsQMlhempP2Eva0pTgQQFlQtHSKXCU5QhLiFishKi93bBFFW5NT2GsyPyA==; bm_sz=81D576BFEC77A64EFA562EA43716A6B2~YAAQSuocuODHWhmFAQAAmoJrTxKElzo1vRQiP87GJn+Qt+QB0xDTxkpY9DCrL5ZZRqgm7kAKLTFP2+EzD3Wk7yWIxXzjneSAkJ5n2A3Zpw4P1fz4r3DVLIT/xq8YmUPQLYa2bswhLNr5WugV7hYAlUoW1BOsBowHdZ0z69fk8Ko9RJyecfwWiEDMQt/Y+QOYnp6kbAZm3cvw/Pv1V3l8+oGJrwToLa7sPhmqfkPg8nJPp9EGsNsojLmW380HV0HqtQWsRl3XIFxwtyV7OVsaa6VJKXNDHZauIxqIxPO6oYaEQb/yxgXBbekZXx/LdTEuCeaIxJfi1PhWq8MLksnkdzKQAuZ6/1p6bFUVEVHSk8UkB6qE88iNmCBo3duzSjr3qSeZUq0=~3749698~4342328; akacd_plp_prod_adidas_grayling=3849527522~rv=39~id=42c19cc30748c648b538ea5d49c696b2; geo_country=AR; geo_ip=181.4.209.42'
  }
};


cron.schedule('*/30 * * * * *', () => {
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
