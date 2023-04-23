/* eslint-disable max-len */
const {Client, GatewayIntentBits} = require('discord.js');
const cooldownTime = 300000; // 5 minutes en millisecondes
const cooldowns = new Set(); // Liste des utilisateurs en cooldown
const dov = require('dotenv');
const cron = require('node-cron');

dov.config();

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
      const commandFile = require('./commands/epic/free.js');
      message = {channel: channel[1]};
      commandFile.run(Discord, message);
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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready', () => {
  console.log('ready');
  enableCron();
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const channels = client.channels.cache.filter((channel) => channel.type === 0 && channel.name === 'annonces');
  const findRoles = process.env.ROLES && process.env.ROLES.split(',');
  const authorizedServers = process.env.ENABLE && process.env.ENABLE.split(',');

  // eslint-disable-next-line no-unused-vars
  for (const [_, channel] of channels.entries()) {
    const guild = channel.guild;
    const role = guild?.roles.cache.find((role) => findRoles.includes(role.name)) || null;

    if (oldState.channelId !== newState.channelId && newState.channelId !== null) {
      console.log('user is connected to vocal');

      if (guild.available && authorizedServers.includes(guild.name)) {
        const currentChannel = newState.channel;
        console.log(`User ${newState.member.user.username} joined channel ${currentChannel.name}`);

        if (!cooldowns.has(newState.member.id)) {
          console.log(`Sending message in channel ${channel.name}`);
          await channel.send(`<@&${role?.id ?? ''}> Un ${newState.member.user.username} sauvage apparaît dans ${currentChannel.name}`)
              .then((sentMessage) => {
                setTimeout(() =>
                  sentMessage.delete().catch((error) => console.error(`Error deleting message in ${channel.name}`, error))
                , 600000);
              })
              .catch((error) => {
                console.error(`Error sending message in ${channel.name}`, error);
              });

          cooldowns.add(newState.member.id);
          setTimeout(() => {
            cooldowns.delete(newState.member.id);
          }, cooldownTime);
        }
      }
    }
  }
});

client.login(process.env.TOKEN);
