require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

// ===== إعداد خادم ويب صغير (مطلوب لـ Render Web Service حتى لا يتوقف البوت) =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ البوت يعمل الآن!');
});

app.listen(PORT, () => {
  console.log(`🌐 خادم keep-alive يعمل على المنفذ ${PORT}`);
});

// ===== إعداد عميل ديسكورد =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// ===== تحميل الأوامر =====
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`⚠️ الأمر في ${file} ناقص خاصية data أو execute`);
  }
}

// ===== تحميل الأحداث =====
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ===== الاستماع لتنفيذ الأوامر =====
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ خطأ في تنفيذ الأمر ${interaction.commandName}:`, error);
    const errorMessage = { content: '❌ حدث خطأ أثناء تنفيذ هذا الأمر.', ephemeral: true };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// ===== معالجة الأخطاء العامة =====
process.on('unhandledRejection', (error) => {
  console.error('❌ خطأ غير معالج:', error);
});

// ===== تسجيل الدخول =====
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ لم يتم العثور على DISCORD_TOKEN في متغيرات البيئة!');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
