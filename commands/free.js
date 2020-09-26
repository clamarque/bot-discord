const Discord = require("discord.js");
const fetch = require("node-fetch");
const dayjs = require('dayjs')

// Free games JSON
const urlEpicFreeGames = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=fr-FR&country=FR&allowCountries=FR";

//Send embed messages about free games
module.exports.run = async (client, message) => {
    //Receive JSON
    let games = [];
    await fetch(urlEpicFreeGames)
        .then(response => response.json())
        .then((data) => {
            games = data.data.Catalog.searchStore.elements;
        });

    let startDate = new Date();
    let endDate = new Date();

    for (let game of games) {
        // Format Date
        startDate = dayjs(game.effectiveDate).format('DD/MM/YYYY');
        endDate = dayjs(game.effectiveDate).add(7, 'day').format('DD/MM/YYYY');
        let originalPrice = game.price.totalPrice.fmtPrice.originalPrice;
        let discountPrice = game.price.totalPrice.fmtPrice.discountPrice;
        // Format '0' value to 'FREE'
        if (originalPrice === '0') { originalPrice = 'GRATUIT'; }
        if (discountPrice === '0') { discountPrice = 'GRATUIT '; }
        // Get pictures
        let gameImage = '';
        for (let image of game.keyImages) {
            if (image.type === 'OfferImageTall') {
                gameImage = image.url;
            }
        }
        //Create the MessageEmbed
        const embedFreeGame = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(game.title)
            .setURL('https://www.epicgames.com/store/fr/product/' + game.productSlug)
            .addFields(
                { name: 'Date de début', value: startDate, inline: true },
                { name: 'Date de fin', value: endDate, inline: true },
                { name: '\u200b', value: '\u200b' },
                { name: 'Prix d\'origine:', value: originalPrice, inline: true },
                { name: 'Prix bas:', value: discountPrice, inline: true },
            )
            .setImage(encodeURI(gameImage))
            .setTimestamp()
            .setFooter('Le jeu est arrivé / arrive dans Epic Games: ' + startDate);

        //Send message
        await message.channel.send(embedFreeGame);
    }
}   