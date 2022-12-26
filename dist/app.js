"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const HttpsProxyAgent = require("https-proxy-agent");
const httpsAgent = new HttpsProxyAgent({ host: "138.121.113.179", port: "8080" });
const token = process.env.BOT_TOKEN;
const telegram = new telegraf_1.Telegram(token);
const bot = new telegraf_1.Telegraf(token);
const chatId = process.env.CHAT_ID;
const config = {
    method: 'get',
    url: 'https://www.adidas.com.ar/api/products/IB3593/availability',
    httpsAgent: httpsAgent
};
bot.hears('dame la casaca', () => {
    sendMessage('Estoy en eso!');
});
node_cron_1.default.schedule('*/10 * * * * *', () => {
    (0, axios_1.default)(config)
        .then(function (response) {
        const status = response.data["availability_status"];
        console.log(JSON.stringify(response.data));
        if (status != 'NOT_AVAILABLE') {
            if (chatId) {
                const variations = response.data['variation_list'];
                let result = `Disponible ${status}\n`;
                for (const variation of variations) {
                    result += `size: ${variation.size} availability: ${variation.availability}\n`;
                }
                result += `Compra bobo: https://www.adidas.com.ar/camiseta-titular-argentina-3-estrellas-2022/IB3593.html\n`;
                sendMessage(result);
            }
        }
    })
        .catch(function (error) {
        console.log(error);
    });
});
function sendMessage(result) {
    const chats = chatId.split(',');
    for (const chat of chats) {
        telegram.sendMessage(chat, result);
    }
}
node_cron_1.default.schedule('*/30 * * * *', () => {
    (0, axios_1.default)(config)
        .then(function (response) {
        const status = response.data["availability_status"];
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
const app = (0, express_1.default)();
const port = process.env.PORT ?? 3000;
app.get('/', (req, res) => {
    res.send('Works!');
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
//# sourceMappingURL=app.js.map