require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// API endpoints (you'll need to replace these with actual API endpoints)
const SPORTS_API_BASE = "https://api.example.com"; // Replace with actual API endpoint

// Function to fetch live games
async function fetchLiveGames(sport) {
    try {
        const response = await axios.get(`${SPORTS_API_BASE}/${sport}/live`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${sport} games:`, error.message);
        return null;
    }
}

// Function to format game information
function formatGameInfo(game, sport) {
    if (!game) return "No live games available";

    return `
**${game.home_team || 'Unknown'} vs ${game.away_team || 'Unknown'}**
🏟️ League: ${game.league || 'Unknown'}
📺 Stream: ${game.stream_url || 'No stream available'}
⏰ Time: ${game.time || 'Unknown'}
`;
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Command handler
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const command = message.content.slice(1).toLowerCase();

    switch (command) {
        case 'live':
            await showAllLive(message);
            break;
        case 'soccer':
            await showSoccer(message);
            break;
        case 'esports':
            await showCSGO(message);
            break;
        case 'nfl':
            await showNFL(message);
            break;
        case 'nba':
            await showNBA(message);
            break;
        case 'mlb':
            await showMLB(message);
            break;
        case 'tabletennis':
            await showTableTennis(message);
            break;
    }
});

// Command functions
async function showAllLive(message) {
    const sports = ['soccer', 'csgo', 'tabletennis', 'nfl', 'nba', 'mlb'];
    const embed = new EmbedBuilder()
        .setTitle('🎮 Live Games')
        .setDescription('Current live games across all sports')
        .setColor('#0099ff')
        .setTimestamp();

    for (const sport of sports) {
        const games = await fetchLiveGames(sport);
        if (games && games.length > 0) {
            const gameInfo = formatGameInfo(games[0], sport);
            embed.addFields({ name: sport.toUpperCase(), value: gameInfo, inline: false });
        }
    }

    await message.reply({ embeds: [embed] });
}

async function showSoccer(message) {
    const games = await fetchLiveGames('soccer');
    if (games && games.length > 0) {
        const embed = new EmbedBuilder()
            .setTitle('⚽ Live Soccer Games')
            .setColor('#00ff00')
            .setTimestamp();

        games.forEach(game => {
            const gameInfo = formatGameInfo(game, 'soccer');
            embed.addFields({ name: 'Match', value: gameInfo, inline: false });
        });

        await message.reply({ embeds: [embed] });
    } else {
        await message.reply('No live soccer games available at the moment.');
    }
}

async function showCSGO(message) {
    const games = await fetchLiveGames('csgo');
    if (games && games.length > 0) {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Live CS:GO Games')
            .setColor('#ff9900')
            .setTimestamp();

        games.forEach(game => {
            const gameInfo = formatGameInfo(game, 'csgo');
            embed.addFields({ name: 'Match', value: gameInfo, inline: false });
        });

        await message.reply({ embeds: [embed] });
    } else {
        await message.reply('No live CS:GO games available at the moment.');
    }
}

async function showNFL(message) {
    const games = await fetchLiveGames('nfl');
    if (games && games.length > 0) {
        const embed = new EmbedBuilder()
            .setTitle('🏈 Live NFL Games')
            .setColor('#ff0000')
            .setTimestamp();

        games.forEach(game => {
            const gameInfo = formatGameInfo(game, 'nfl');
            embed.addFields({ name: 'Match', value: gameInfo, inline: false });
        });

        await message.reply({ embeds: [embed] });
    } else {
        await message.reply('No live NFL games available at the moment.');
    }
}

async function showNBA(message) {
    const games = await fetchLiveGames('nba');
    if (games && games.length > 0) {
        const embed = new EmbedBuilder()
            .setTitle('🏀 Live NBA Games')
            .setColor('#ff9900')
            .setTimestamp();

        games.forEach(game => {
            const gameInfo = formatGameInfo(game, 'nba');
            embed.addFields({ name: 'Match', value: gameInfo, inline: false });
        });

        await message.reply({ embeds: [embed] });
    } else {
        await message.reply('No live NBA games available at the moment.');
    }
}

async function showMLB(message) {
    const games = await fetchLiveGames('mlb');
    if (games && games.length > 0) {
        const embed = new EmbedBuilder()
            .setTitle('⚾ Live MLB Games')
            .setColor('#0000ff')
            .setTimestamp();

        games.forEach(game => {
            const gameInfo = formatGameInfo(game, 'mlb');
            embed.addFields({ name: 'Match', value: gameInfo, inline: false });
        });

        await message.reply({ embeds: [embed] });
    } else {
        await message.reply('No live MLB games available at the moment.');
    }
}

async function showTableTennis(message) {
    const games = await fetchLiveGames('tabletennis');
    if (games && games.length > 0) {
        const embed = new EmbedBuilder()
            .setTitle('🏓 Live Table Tennis Games')
            .setColor('#9900ff')
            .setTimestamp();

        games.forEach(game => {
            const gameInfo = formatGameInfo(game, 'tabletennis');
            embed.addFields({ name: 'Match', value: gameInfo, inline: false });
        });

        await message.reply({ embeds: [embed] });
    } else {
        await message.reply('No live table tennis games available at the moment.');
    }
}

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN); 