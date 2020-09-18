const discord = require('discord.js')
const dov = require('dotenv');

dov.config();
const client = new discord.Client();

client.once('ready', () => {
    console.log('ready');
});

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