const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');

// Add environment variables
dotenv.config();
botSecretToken = process.env.DISCORD_TOKEN;

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

client.on("ready", () => {
	client.user.setActivity("out for a &{command}", { type: "WATCHING" });
	console.log("Bot Connected To Discord!");
});

client.login(botSecretToken)