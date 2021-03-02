/* eslint-disable max-len */
const Discord = require('discord.js');
const dov = require('dotenv');
const cron = require('node-cron');

const client = new Discord.Client();
const prefix = '!';
const riotFunctions = require('./commands/riot/riot.functions.js');


dov.config();

client.once('ready', () => {
  console.log('ready');
  riotFunctions.loadChampions();
  enableCron();
});

const enableCron = () => {
  // execute to 17:00 Friday
  cron.schedule('0 16 * * 5', () => {
    const ping = new Date();
    console.log(`Ping received at ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);
    const enableDay = ping.getDay();
    if (enableDay === 5 || enableDay === 6) {
      freeGamesAuto();
    }
  }, {scheduled: true, timezone: 'Europe/Paris'});
};

const freeGamesAuto = () => {
  const channels = client.channels.cache.filter((channel) => channel.name === 'annonces');
  for (const channel of channels) {
    if (channel[1] !== undefined) {
      resetMessagesBot(channel[1]);
      const commandFile = require('./commands/free.js');
      message = {channel: channel[1]};
      commandFile.run(client, message);
    }
  }
};

const resetMessagesBot = (channel) => {
  channel.messages.fetch({limit: 100})
      .then((messages) => {
        messages.forEach((message) => {
          if (!message.pinned) {
            message.delete();
          }
        });
      })
      .catch('resetMessagesBotError', console.error);
};

client.on('voiceStateUpdate', async (oldMember, newMember) => {
  const textChannels = client.channels.cache.filter((channel) => channel.name === 'annonces');
  const currentChannel = client.channels.cache.find((channel) => channel.id === newMember.channelID);
  const findRole = process.env.ROLES && process.env.ROLES.split(',');

  for (const channel of textChannels) {
    const role = channel[1].guild.roles.cache.find((role) => findRole.includes(role.name)) || {id: null};
    const totalMilliseconde = 3600 * 1000;
    if (oldMember.channelID !== newMember.channelID && newMember.channelID !== null) {
      const authorizedServer = process.env.ENABLE && process.env.ENABLE.split(',');
      // Check for own server
      if (channel[1].guild.name === newMember.guild.name && authorizedServer.includes(channel[1].guild.name)) {
        await channel[1].send(`<@&${role.id}> Un ${newMember.member.user.username} sauvage apparaît dans ${currentChannel.name} `).then((sentMessage) => {
          sentMessage.delete({timeout: totalMilliseconde});
        }).catch((error) => {
          console.error('voiceStateUpdateError:', error);
        });
      }
    };
  }
});

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const commandFile = require('./commands/riot/riot.discord.js');

  commandFile.run(Discord, message);
});

client.login(process.env.TOKEN);
