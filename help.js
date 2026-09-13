const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('يعرض قائمة الأوامر المتاحة'),

  async execute(interaction) {
    const commands = interaction.client.commands;
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`📖 أوامر ${config.botName}`)
      .setDescription(
        commands
          .map((cmd) => `**/${cmd.data.name}** — ${cmd.data.description}`)
          .join('\n')
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
