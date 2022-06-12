const fs = require('fs');
const path = require('path');

const Discord = require('discord.js');
const Intents = Discord.Intents.FLAGS;

const client = new Discord.Client({
	intents: [
		Intents.GUILD_MESSAGES,
		Intents.GUILD_MEMBERS,
		Intents.GUILD_EMOJIS_AND_STICKERS,
	]
});

client.version = 0;

const db = require('quick.db');

client.db = {
	bot: new db.table('bot'),
	guilds: new db.table('guilds'),
}

// Require the token from the .env file
require("dotenv").config();

// ========================================================
// BOT EXECUTION
// ========================================================

// Handle all the events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);

	if (!event) continue;

	// If the event is only supposed to run once, then we'll add it to the client.once array.
	if (event.once) {
		client.once(
			event.name, 
			(...args) => event.run(...args)
		);
	} 
	else {
		client.on(
			event.name, 
			(...args) => event.run(...args)
		);
	}
}

// Login into the client
client.login(process.env.DISCORD_TOKEN);