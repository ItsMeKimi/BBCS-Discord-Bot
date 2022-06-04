// Specific deployment for BBCS Discord.

const { Client, Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');
const { watchOptions } = require('nodemon/lib/config/defaults');

// Add environment variables
dotenv.config();
const appID = process.env.APP_ID;
const guildID = process.env.GUILD_ID;
const botSecretToken = process.env.DISCORD_TOKEN;

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_PRESENCES"] });

client.on("ready", () => {
	client.user.setActivity("out for / commands", { type: "WATCHING" });
	console.log("Bot Connected To Discord!");

	const channel = client.channels.cache.get("698868628459749407") // #verification Channel
});

// For Server Authentication
client.on("guildMemberAdd", async (member) => {
	console.log(`User Joined Guild with ID ${member.user.id}`)

	let guild = member.guild;
	// let memberTag = member.user.tag;
	const channel = client.channels.cache.get("698868628459749407") // #verification Channel

	setTimeout(() => {
		channel.send(
		  "Welcome to **" +
			guild.name +
			`**, <@${member.user.id}>! You are our ` +
			guild.memberCount +
			`th coder! Please use the command \`\/verify {Participant | Organiser} {School Initials} {Full Name}\` in this chat to verify your identity before proceeding. Do ensure that your School Initials + Full Name is under *32 characters*. An example would be \`\/verify Participant OJC Lim Ah Seng\` for Lim Ah Seng, a participant from Original Junior College`
			// `th coder! Please use the command \`\/verify {Participant | Organiser} {School Initials} {Full Name}\` in this chat to verify your identity before proceeding. Do ensure that your School Initials + Full Name is under *32 characters*. An example would be \`\/verify Participant OJC Lim Ah Seng\` for Lim Ah Seng, a participant from Original Junior College **To sign up for workshops and events, kindly head over to https://go.buildingblocs.sg/signup to register for your tickets!**` // For during BBCs events
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
		.setDescription('Verify your account. Usage: \/verify {Participant | Organiser} {School Initials} {Full Name}')
		.addSubcommand(subcommand =>
			subcommand
				.setName('participant')
				.setDescription('Verify as a participant.')
				.addStringOption(option =>
					option
						.setName('info')
						.setDescription('{School Initials} {Full Name}')
						.setRequired(true)
				)
				
			)
		.addSubcommand(subcommand =>
			subcommand
				.setName('organiser')
				.setDescription('Verify as an organiser.')
				.addStringOption(option =>
					option
						.setName('info')
						.setDescription('{School Initials} {Full Name}')
						.setRequired(true)
				)
			),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(botSecretToken);

// Add them to guild
rest.put(Routes.applicationGuildCommands(appID, guildID), {body: slashCommands})
	.then(() => console.log('Successfully registered slash commands.'))
	.catch(console.error);

// Handle Slash Commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName, channelId } = interaction;

	if (channelId !== '698868628459749407') { // #verification Channel | BBCS Discord Specific
		await interaction.reply({ content:`Hi <@${interaction.user.id}>! This bot currently only works for the verification channel.`, ephemeral: true });
		return;
	};

	if (commandName === 'help') {
		await interaction.reply({ content: `Hi! Please follow the instructions in this Channel's description to proceed. If you are facing continuous errors, please contact <@375841238013706240>`, ephemeral: true });
	} else if (commandName === 'test') {
		await interaction.reply({ content: `Hi! This is a test message that only you can see.`, ephemeral: true});
	} else if (commandName === 'verify') {
		const roleChoice = interaction.options.getSubcommand(); // participant or organiser
		const inputValue = interaction.options.data[0]['options'][0]['value']; // custom input

		// get schoolPortion and namePortion from interaction
		let splitCommand = inputValue.split(" ");

		let schoolPortion = splitCommand[0];
		let namePortionArray = splitCommand.slice(1);
		let namePortion = ''
		for (let i = 0; i < (namePortionArray.length); i++) {
			if (i === namePortionArray.length - 1) {
				namePortion += namePortionArray[i].toString();
			} else {
				namePortion += namePortionArray[i].toString() + ' ';
			}
		};
		let nickname = `${schoolPortion} ${namePortion}`
		
		// make sure theres at least school and one word name
		if (splitCommand.length < 2) {
			await interaction.reply({ content:`Error! Please ensure that you have written both your School Initials and your Full Name`, ephemeral: true });
		} else {
			if (schoolPortion.toUpperCase() === 'OJC') {
				await interaction.reply({ content: `Hi <@${interaction.user.id}>! Please read the verification instructions carefully and not copy the example given. Feel free to message the OICs or contact <@375841238013706240> if you need any help.`, ephemeral: true });
			} else if (inputValue.length > 32) {
				await interaction.reply({ content: `Hi <@${interaction.user.id}>! the command you entered was too long. Please ensure that you have entered the right information. If possible, use a short form of your name. If not possible, feel free to message the OICs or contact <@375841238013706240> for further help.`, ephemeral: true });
			} else if (roleChoice.toUpperCase() === 'PARTICIPANT' | roleChoice.toUpperCase() === 'ORGANISER') {
				await interaction.reply({ content: `Thank you <@${interaction.user.id}>! You can now access the other channels`, ephemeral: true });
				setTimeout(() => {}, 3000)
				// add 'verified' role
				await interaction.member.roles.add('952074561262858280'); // BBCS Discord Specific
				// add 'bbcs2022' role
				await interaction.member.roles.add('952074439477051424'); // BBCS Discord (2022) Specific
				
				if (roleChoice.toUpperCase() === 'PARTICIPANT') {
					await interaction.member.roles.add('698902585742196747'); // BBCS Discord Specific
				} else if (roleChoice.toUpperCase() === 'ORGANISER') {
					await interaction.member.roles.add('698841628324134923'); // BBCS Discord Specific
				};

				// In a try catch loop in case some member has higher roles than the bot
				try {
					await interaction.member.setNickname(nickname);
					console.log(`SUCCESS: Renamed \'${interaction.user.username}\' ID: \'${interaction.user.id}\' to \'${nickname}\'`)
				} catch (error) {
					console.log(`ERROR: Renaming \'${interaction.user.username}\' ID: \'${interaction.user.id}\' to \'${nickname}\' failed. {Missing Permissions}`);
				};
				
			} else {
				await interaction.reply({ content: `Hi <@${interaction.user.id}>! There is an error somewhere in your input. Make sure everything you have typed is correct. If it still returns this error, feel free to message the OICs or contact <@375841238013706240> if you need any help.`, ephemeral: true });
			};
			
		};

	};

});

client.on('messageCreate', (message) => {
	let messageContent = message.content;
	let messageChannelID = message.channelId;
	
	if (messageChannelID === '698868628459749407') {// #verification channel | BBCS Discord Specific
		const channel = client.channels.cache.get(messageChannelID);

		if (messageContent.startsWith('/verify')) {
			channel.send(`Hi <@${message.author.id}>! Please use the correct format for \/verify to proceed.`);
		};
	};
})

client.login(botSecretToken);
