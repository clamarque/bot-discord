const discord = require('discord.js')
const dov = require('dotenv');
const cron = require('node-cron');
const client = new discord.Client();

dov.config();

client.once('ready', () => {
    console.log('ready');
    enableCron();
});

const enableCron = () => {
    // execute to 17:00 Friday
    cron.schedule('* 16 * * 5', () => {
        const ping = new Date();
        console.log(`Ping received at ${ping.getUTCHours()}:${ping.getUTCMinutes()}:${ping.getUTCSeconds()}`);
        console.log('running a task every minute');
        freeGamesAuto();
    }, { scheduled: true, timezone: 'Europe/Paris' });
}

const freeGamesAuto = () => {
    const channel = client.channels.cache.find(channel => channel.name === 'actualités');
    if (channel !== undefined) {
        resetMessagesBot(channel);
        const commandFile = require('./commands/free.js')
        message = { channel: channel }
        commandFile.run(client, message);
    }
}

const resetMessagesBot = (channel) => {
    channel.messages.fetch({ limit: 10 })
        .then(messages => {
            messages.forEach(message => {
                if (!message.pinned) {
                    message.delete();
                }
            })
        })
        .catch(console.error);
}

client.on('voiceStateUpdate', async (oldMember, newMember) => {
    const textChannel = client.channels.cache.find(channel => channel.name === 'noob');
    const currentChannel = client.channels.cache.find(channel => channel.id === newMember.channelID);
    const role = textChannel.guild.roles.cache.find(role => role.name === 'noob');
    const totalMilliseconde = 3600 * 1000;
    if (oldMember.channelID !== newMember.channelID && newMember.channelID !== null) {
        await textChannel.send(`<@&${role.id}> ${newMember.member.user.username} has joined the channel: ${currentChannel.name} `).then(sentMessage => {
            sentMessage.delete({ timeout: totalMilliseconde });
        }).catch(error => {
            console.log('ERRROR:', error);
        });
    };
});

client.login(process.env.TOKEN);