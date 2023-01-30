import { telegramConfig } from '../conf';
import TelegramBot from 'node-telegram-bot-api';
import UserData from '../users_data';

//var id = 228803942
class TelegramMessage {
  private bot;

  constructor(userData: UserData) {
    this.bot = new TelegramBot(telegramConfig.token, { polling: true });
    let me = this

    this.bot.onText(/.*?/, async (msg, match) => {
      if(!msg.from) return
      if(!msg.from.username) return

      const username = msg.from.username//.toLowerCase();
      const telegramId = msg.from.id.toString();
      let added = await userData.setTelegramtId(username, telegramId)
      let ans = 'ваш телеграм добавлен в список'
      if(!added) ans = 'пользователь с вашим телеграм именем не найден в базе Unkaos или не требует обновления ID'
      me.bot.sendMessage(telegramId, username + ', ' + ans);
    });

    console.log('telegram bot up')
  }

  async send(userId: string, title: string, body: string) {

    console.log('userId', userId)
    try{ this.bot.sendMessage(userId, `${title}\n${body}`) } 
    catch(err){ console.log(`Error sending ts msg`, err) }
  }
}

export default TelegramMessage;