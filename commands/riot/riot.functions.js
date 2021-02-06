/* eslint-disable max-len */
const riotApi = require('./riot.api.js');

let list = [];
const champions = [];

const buildRank = async (summoner) => {
  return await riotApi.getSummonerRank(summoner.summonerId)
      .then(({data}) => {
        const soloQ = data.find((league) => league.queueType === 'RANKED_SOLO_5x5');
        const flexQ = data.find((league) => league.queueType === 'RANKED_FLEX_SR');

        const queue = soloQ || flexQ;

        if (!queue) {
          return 'Unranked';
        }

        const ratioWin = Math.round(queue.wins / (queue.wins + queue.losses) * 100);
        let rankString = `${queue.queueType}: ${queue.tier} ${queue.rank} ${queue.leaguePoints} LP / ${ratioWin}%`;

        if (queue.miniSeries) {
          let progress = queue.miniSeries.progress.split('');

          progress = progress.map((p) => p === 'N' ? 'O' : p).join('');

          rankString = `${rankString} ${progress}`;
        }
        return rankString;
      })
      .catch((error) => {
        return {
          error: error.response.status,
          message: error.response.statusText,
          request: 'league',
          username: summoner.name,
        };
      });
};

const buildTeam = async (team) => {
  return await Promise.all(team.map(async (summoner) =>
    ({
      'summonerName': summoner.summonerName,
      'summonerChampion': champions[summoner.championId].name,
      'rank': await buildRank(summoner),
    }),
  ));
};

const findPoroInTeam = async (game) => {
  let teammates = 0;
  const summoners = [];
  if (game && game.participants) {
    for (const participant of game.participants) {
      if (list.some((poro) => poro.name === participant.summonerName)) {
        teammates++;
        summoners.push(participant.summonerName);

        const index = list.findIndex((v) => v.name === participant.summonerName);

        if (index >= 0) {
          list[index].inGame = true;
        }
      }
    }
  }

  return {teammates, summoners};
};

const handleBanned = async (game) => {
  const bannedBlueTeam = game.bannedChampions.filter((c) => c.teamId === 100);
  const bannedRedTeam = game.bannedChampions.filter((c) => c.teamId === 200);

  const blue = bannedBlueTeam.map((g) => champions[g.championId] ? champions[g.championId].name : '');
  const red = bannedRedTeam.map((g) => champions[g.championId] ? champions[g.championId].name : '');

  return {blue, red};
};

const handleTeams = async (game) => {
  const blueTeam = game.participants.filter((s) => s.teamId === 100);
  const redTeam = game.participants.filter((s) => s.teamId === 200);

  const blue = await buildTeam(blueTeam);
  const red = await buildTeam(redTeam);

  return {blue, red};
};

const searchActiveGames = async (summoner) => {
  if (!summoner.inGame) {
    return await riotApi.getActiveGames(summoner.id)
        .then(async ({data}) => {
          const bannedChampions = await handleBanned(data);
          const game = {
            gameMode: data.gameMode,
            gameType: data.gameType,
            time: new Date(data.gameLength * 1000).toISOString().substr(11, 8),
          };
          const info = await findPoroInTeam(data);
          const teams = await handleTeams(data);

          return {
            bannedChampions,
            game,
            info,
            teams,
          };
        })
        .catch((error) => {
          summoner.inGame = false;

          console.log({
            error: error.response.status,
            message: error.response.statusText,
            request: 'spectator',
            username: summoner.name,
          });
        });
  }
};

module.exports = {
  loadGameInfo: async (members) => {
    list = members;
    const games = [];

    for (const summoner of members) {
      console.log('name:', summoner.name);
      await riotApi.getSummonerData(summoner.name)
          .then(async ({data}) => {
            const activeGame = await searchActiveGames({...data, ...summoner});
            games.push(activeGame);
          })
          .catch((error) => {
            console.error({
              error: error.response.status,
              message: error.response.statusText,
              request: 'summoner',
              username: summoner.name,
            });
          });
    }

    return games;
  },

  loadChampions: async () => {
    const currentVersion = await riotApi.getLatestVersion();
    const list = await riotApi.getChampions(currentVersion);

    for (const champion of Object.values(list.data)) {
      champions[champion.key] = champion;
    }
  },
};

