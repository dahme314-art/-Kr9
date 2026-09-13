require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ الأمر في ${file} ناقص خاصية data أو execute`);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 جارِ تسجيل ${commands.length} أمر...`);

    let route;
    if (process.env.GUILD_ID) {
      // تسجيل فوري على سيرفر واحد (مفيد أثناء التطوير)
      route = Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);
    } else {
      // تسجيل عام (يحتاج حتى ساعة ليظهر لدى جميع السيرفرات)
      route = Routes.applicationCommands(process.env.CLIENT_ID);
    }

    const data = await rest.put(route, { body: commands });
    console.log(`✅ تم تسجيل ${data.length} أمر بنجاح.`);
  } catch (error) {
    console.error('❌ خطأ أثناء تسجيل الأوامر:', error);
  }
})();
