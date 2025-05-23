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

// Football Data API configuration
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const FOOTBALL_API_BASE = 'http://api.football-data.org/v4';

// Store matches data
let cachedMatches = null;
let lastFetchTime = null;

// Function to fetch matches from football-data.org
async function fetchFootballMatches() {
    try {
        const response = await axios.get(`${FOOTBALL_API_BASE}/matches`, {
            headers: {
                'X-Auth-Token': FOOTBALL_API_KEY,
                'X-Unfold-Goals': 'true'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching football matches:', error.message);
        return null;
    }
}

// Function to format match information
function formatMatchInfo(match) {
    const homeTeam = match.homeTeam.name;
    const awayTeam = match.awayTeam.name;
    const status = match.status;
    const score = match.score;
    const competition = match.competition.name;
    const utcDate = new Date(match.utcDate);
    const localTime = utcDate.toLocaleString();

    let scoreText = 'vs';
    if (status === 'FINISHED') {
        scoreText = `${score.fullTime.home} - ${score.fullTime.away}`;
    } else if (status === 'IN_PLAY' || status === 'PAUSED') {
        scoreText = `${score.halfTime.home} - ${score.halfTime.away}`;
    }

    return `
**${homeTeam} ${scoreText} ${awayTeam}**
🏆 Competition: ${competition}
⏰ Time: ${localTime}
📊 Status: ${status}
`;
}

// Function to create and send matches embed
async function sendMatchesEmbed(channel) {
    if (!cachedMatches) {
        cachedMatches = await fetchFootballMatches();
        lastFetchTime = new Date();
    }

    if (!cachedMatches) {
        await channel.send('Unable to fetch matches at the moment.');
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('⚽ Today\'s Football Matches')
        .setColor('#00ff00')
        .setTimestamp()
        .setFooter({ text: `Last updated: ${lastFetchTime.toLocaleString()}` });

    const matches = cachedMatches.matches;
    if (matches && matches.length > 0) {
        matches.forEach(match => {
            const matchInfo = formatMatchInfo(match);
            embed.addFields({ name: 'Match', value: matchInfo, inline: false });
        });
    } else {
        embed.setDescription('No matches scheduled for today.');
    }

    await channel.send({ embeds: [embed] });
}

// Schedule daily updates
function scheduleDailyUpdates() {
    const now = new Date();
    const updateTime = new Date(now);
    updateTime.setHours(0, 0, 0, 0); // Set to midnight

    if (now > updateTime) {
        updateTime.setDate(updateTime.getDate() + 1); // Set to next day
    }

    const timeUntilUpdate = updateTime - now;
    setTimeout(() => {
        cachedMatches = null; // Clear cache
        lastFetchTime = null;
        scheduleDailyUpdates(); // Schedule next update
    }, timeUntilUpdate);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    scheduleDailyUpdates();
});

// Command handler
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const command = message.content.slice(1).toLowerCase();

    switch (command) {
        case 'matches':
            await sendMatchesEmbed(message.channel);
            break;
        case 'refresh':
            cachedMatches = null;
            lastFetchTime = null;
            await sendMatchesEmbed(message.channel);
            break;
    }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN); 