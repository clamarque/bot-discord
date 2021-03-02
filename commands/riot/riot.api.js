/* eslint-disable max-len */

const axios = require('axios').default;

const urlRiotGame = 'https://euw1.api.riotgames.com/lol';

/**
 * request for get information of a summoner
 * @param {String} name
 */
const getSummonerData = async (name) => {
  return await axios.get(`${urlRiotGame}/summoner/v4/summoners/by-name/${encodeURIComponent(name)}?api_key=${process.env.API_RIOT_KEY}`);
};
/**
 * request for get information of a summoner's match
 * @param {String} id
 */
const getActiveGames = async (id) => {
  return await axios.get(`${urlRiotGame}/spectator/v4/active-games/by-summoner/${id}?api_key=${process.env.API_RIOT_KEY}`);
};
/**
 * request for get a summoner's rank
 * @param {String} id
 */
const getSummonerRank = async (id) => {
  return await axios.get(`${urlRiotGame}/league/v4/entries/by-summoner/${id}?api_key=${process.env.API_RIOT_KEY}`);
};
/**
 * request for get a list of champions
 * @param {String} version
 */
const getChampions = async (version) => {
  const champions = await axios.get(`http://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`);
  return champions.data;
};
/**
 * request for get the latest version
 */
const getLatestVersion = async () => {
  const version = (await axios.get('http://ddragon.leagueoflegends.com/api/versions.json')).data[0];
  return version;
};

module.exports = {
  getActiveGames,
  getSummonerData,
  getSummonerRank,
  getChampions,
  getLatestVersion,
};
