# Sports Live Discord Bot

A Discord bot that displays live football matches using the football-data.org API.

## Features

- Shows all football matches for the day
- Updates automatically at midnight
- Displays match status, scores, and competition information
- Caches data to respect API rate limits (10 calls per minute)

## Setup

1. Install Node.js (if you haven't already):
   - Download from [nodejs.org](https://nodejs.org/)
   - Or use Homebrew: `brew install node`

2. Install the required dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your tokens:
```
DISCORD_TOKEN=your_discord_bot_token_here
FOOTBALL_API_KEY=your_football_data_api_key_here
```

4. Run the bot:
```bash
npm start
```

## Commands

- `!matches` - Display all football matches for the day
- `!refresh` - Force refresh the matches data

## API Information

This bot uses the [football-data.org](https://www.football-data.org/) API, which has the following limitations:
- Free tier: 10 calls per minute
- Data is cached and updated once per day at midnight
- Manual refresh available via `!refresh` command

## Note

Make sure to invite the bot to your Discord server with the necessary permissions to read and send messages. 