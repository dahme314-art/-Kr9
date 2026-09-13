const { ActivityType } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ تم تسجيل الدخول باسم ${client.user.tag}`);

    const activityType = ActivityType[config.activity.type] ?? ActivityType.Watching;

    client.user.setPresence({
      activities: [{ name: config.activity.name, type: activityType }],
      status: 'online',
    });
  },
};
