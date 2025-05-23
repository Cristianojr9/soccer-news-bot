# Sports Live Discord Bot

A Discord bot that displays live sports games and their streaming information for various sports including:
- Soccer
- CS:GO
- Table Tennis
- NFL
- NBA
- MLB

## Setup

1. Install Node.js (if you haven't already):
   - Download from [nodejs.org](https://nodejs.org/)
   - Or use Homebrew: `brew install node`

2. Install the required dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Discord bot token:
```
DISCORD_TOKEN=your_discord_bot_token_here
```

4. Run the bot:
```bash
npm start
```

## Commands

- `!live` - Display all live games across all supported sports
- `!soccer` - Display live soccer games
- `!esports` - Display live CS:GO games
- `!nfl` - Display live NFL games
- `!nba` - Display live NBA games
- `!mlb` - Display live MLB games
- `!tabletennis` - Display live table tennis games

## Note

Make sure to invite the bot to your Discord server with the necessary permissions to read and send messages. 