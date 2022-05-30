const { Client, Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');

// Add environment variables
dotenv.config();
const appID = process.env.APP_ID;
const guildID = process.env.GUILD_ID;
const botSecretToken = process.env.DISCORD_TOKEN;

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_PRESENCES"] });

client.on("ready", () => {
	client.user.setActivity("out for / commands", { type: "WATCHING" });
	console.log("Bot Connected To Discord!");

	const channel = client.channels.cache.get("980466966626197537")
});

// For Server Authentication
client.on("guildMemberAdd", async (member) => {
	let guild = member.guild;
	// let memberTag = member.user.tag;
	const channel = client.channels.cache.get("980466966626197537")

	// Give them 'unverified' role.
	// member.roles.add('')

	setTimeout(() => {
		channel.send(
		  "Welcome to **" +
			guild.name +
			`**, <@${member.user.id}>! You are our ` +
			guild.memberCount +
			`th coder! Please use the command \`\/verify {School Initials} {Full Name} {Participant | Organiser}\` in this chat to verify your identity before proceeding. An example would be \`\/confirm OJC Lim Ah Seng Participant\` for Lim Ah Seng, a participant from Original Junior College`
			// `th coder! Please use the command \`\/verify {School Initials} {Full Name} {Participant | Organiser}\` in this chat to verify your identity before proceeding. An example would be \`\/confirm OJC Lim Ah Seng Participant\` for Lim Ah Seng, a participant from Original Junior College **To sign up for workshops and events, kindly head over to https://go.buildingblocs.sg/signup to register for your tickets!**` // For during BBCs events
		);
	  }, 1000);
}); 


// Register Slash Commands to the Guild (server)

const slashCommands = [
	new SlashCommandBuilder()
		.setName('help')
		.setDescription("I'm a bot that does BBCS stuff! Click me for more options!"),
	new SlashCommandBuilder()
		.setName('test')
		.setDescription('Tests the bot. The message author should get a reply that only they can see.'),
	new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verify your account. Usage: \/verify {School Initials} {Full Name} {Participant | Organiser}')
		.addStringOption(option =>
			option.setName('Input')
				.setDescription('Input the info mentioned previously.')
				.setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(botSecretToken);

// Add them to guild
rest.put(Routes.applicationGuildCommands(appID, guildID), { body: slashCommands})
	.then(() => console.log('Successfully registered slash commands.'))
	.catch(console.error);

// Handle Slash Commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'help') {
		await interaction.reply({
			content: ``,
			ephemeral: true
		});
	} else if (commandName === 'test') {
		await interaction.reply({ content: `Hi! This is a test message that only you can see.`, ephemeral: true});
	} else if (commandName === 'verify') {
		await interaction.reply({ content: `${interaction.user.tag}`, ephemeral: true });
	}

});

client.login(botSecretToken);
