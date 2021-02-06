/* eslint-disable max-len */
const riotFunctions = require('./riot.functions.js');

const prefix = '!';
const colors = {
  red: '#aa0505',
  yellow: '#fbca03',
};

module.exports.run = async (Discord, message) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const members = message.guild.members.cache.filter((member) => {
    return member.roles.cache.find((r) => r.name === 'Petit poro' || r.name === 'noob') && (member.presence.status !== 'offline');
  }).map((member) => {
    return {name: member.nickname || member.user.username, inGame: false};
  });

  switch (command) {
    case 'p': {
      const games = await riotFunctions.loadGameInfo(members);
      const filterGames = games.filter((g) => g);

      if (!filterGames.length) {
        const embedMessage = new Discord.MessageEmbed().setColor(colors.red).setTitle('Aucun poro en jeu 🙁');

        return message.channel.send(embedMessage);
      }

      for (const game of filterGames) {
        const embeddedMsg = new Discord.MessageEmbed();

        embeddedMsg.setColor(colors.yellow);
        embeddedMsg.setTitle(`${game.game.gameMode} - ${game.game.gameType} (${game.game.time})`);
        embeddedMsg.setDescription(game.info.teammates > 1 ? `En jeu avec d\'autres poros: \n **${game.info.summoners.join(' & ')}**` : `Ce poro est seul: **${game.info.summoners[0]}**`);
        embeddedMsg.addFields(
            {
              name: '🔵 Blue team:',
              value: game.teams.blue.map((v) => v.summonerName).join('\n'),
              inline: true,
            },
            {
              name: 'Champion',
              value: game.teams.blue.map((v) => v.summonerChampion).join('\n'),
              inline: true,
            },
            {
              name: 'Rank',
              value: game.teams.blue.map((v) => v.rank).join('\n'),
              inline: true,
            },
        );
        embeddedMsg.addField('🚫 Banned Champions', `${game.bannedChampions.blue.length ? game.bannedChampions.blue.join(' ') : '-'}`, true);
        embeddedMsg.addField('\u200b', '\u200b' );
        embeddedMsg.addFields(
            {
              name: '🔴 Red team:',
              value: game.teams.red.map((v) => v.summonerName).join('\n'),
              inline: true,
            },
            {
              name: 'Champion',
              value: game.teams.red.map((v) => v.summonerChampion).join('\n'),
              inline: true,
            },
            {
              name: 'Rank',
              value: game.teams.red.map((v) => v.rank).join('\n'),
              inline: true,
            },
        );
        embeddedMsg.addField('🚫 Banned Champions', `${game.bannedChampions.red.length ? game.bannedChampions.red.join(' ') : '-'}`, true);

        message.channel.send(embeddedMsg)
            .then((msg) => msg.delete({timeout: 60000}))
            .catch((e) => console.log(e));
      }
    }
  }
};
