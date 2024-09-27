const fs = require('fs');
const path = require('path');

const Discord = require('discord.js');
const Intents = Discord.GatewayIntentBits;

const Utils = require('./commons/utils');
const mongoose = require('mongoose');

const client = new Discord.Client({
	intents: [
		Intents.GuildMessages,
		Intents.GuildMembers,
		Intents.GuildEmojisAndStickers,
		Intents.Guilds
	]
});

client.version = 0;

// Require the variables from the .env file
require("dotenv").config();

console.log(`[Trophy Bot] Starting Up...`);

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

// Connect to MongoDB and Discord
(async () => {
	await Utils.connectMongoDB();
	await Utils.connectDiscord();
})
