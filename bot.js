const http = require('http');

const server = http.createServer((req, res) => {
    // Handle /get route
    if (req.url === '/get' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Hello from the server!',
            timestamp: new Date().toISOString()
        }));
        return;
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the /get route at: http://localhost:${PORT}/get`);
}); 

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
const FOOTBALL_API_BASE = process.env.FOOTBALL_API_BASE;

// Store matches data and API call tracking
let cachedMatches = null;
let lastFetchTime = null;
let apiCallsInLastMinute = 0;
let lastApiCallTime = null;
const API_CALL_LIMIT = 10; // 10 calls per minute limit
const API_CALL_WINDOW = 60000; // 1 minute in milliseconds

// Function to check if we're close to API limit
function isNearApiLimit() {
    if (!lastApiCallTime) return false;
    
    const timeSinceLastCall = Date.now() - lastApiCallTime;
    if (timeSinceLastCall > API_CALL_WINDOW) {
        apiCallsInLastMinute = 0;
        return false;
    }
    
    return apiCallsInLastMinute >= API_CALL_LIMIT - 2; // Leave 2 calls buffer
}

// Function to track API calls
function trackApiCall() {
    const now = Date.now();
    if (lastApiCallTime && now - lastApiCallTime > API_CALL_WINDOW) {
        apiCallsInLastMinute = 0;
    }
    apiCallsInLastMinute++;
    lastApiCallTime = now;
}

// Function to fetch matches from football-data.org
async function fetchFootballMatches() {
    if (isNearApiLimit()) {
        throw new Error('API rate limit nearly reached. Please try again later.');
    }

    try {
        const response = await axios.get(`${FOOTBALL_API_BASE}/matches`, {
            headers: {
                'X-Auth-Token': FOOTBALL_API_KEY,
                'X-Unfold-Goals': 'true'
            }
        });
        trackApiCall();
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
        try {
            cachedMatches = await fetchFootballMatches();
            lastFetchTime = new Date();
        } catch (error) {
            await channel.send('Unable to fetch matches at the moment. API rate limit nearly reached.');
            return;
        }
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

// Function to schedule daily updates at 9 AM
function scheduleDailyUpdates() {
    const now = new Date();
    const updateTime = new Date(now);
    updateTime.setHours(9, 0, 0, 0); // Set to 9 AM

    if (now > updateTime) {
        updateTime.setDate(updateTime.getDate() + 1); // Set to next day
    }

    const timeUntilUpdate = updateTime - now;
    setTimeout(() => {
        // Send matches to all guilds
        client.guilds.cache.forEach(guild => {
            const defaultChannel = guild.channels.cache.find(channel => 
                channel.type === 0 && channel.permissionsFor(guild.members.me).has('SendMessages')
            );
            if (defaultChannel) {
                sendMatchesEmbed(defaultChannel);
            }
        });

        // Schedule next update
        scheduleDailyUpdates();
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
            if (isNearApiLimit()) {
                await message.reply('Sorry, the API rate limit is nearly reached. Please try again in a minute.');
                return;
            }
            await sendMatchesEmbed(message.channel);
            break;
        case 'refresh':
            if (isNearApiLimit()) {
                await message.reply('Sorry, the API rate limit is nearly reached. Please try again in a minute.');
                return;
            }
            cachedMatches = null;
            lastFetchTime = null;
            await sendMatchesEmbed(message.channel);
            break;
    }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN); 