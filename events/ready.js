// This event runs whenever the bot is ready to start working!
const { fetchModules, changeActivity } = require('../globals.js');
const path = require('path');
const Discord = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	async run (client) {

		try {
			client.errorChannel = await client.channels.fetch("985869722199416862").then();
			client.suggestionChannel = await client.channels.fetch("985872094153830400").then();
		}
		catch {}

		// Import all the modules
		client.commands 	= await fetchModules(path.join(__dirname, '../commands'), '.js', true);
		client.languages 	= await fetchModules(path.join(__dirname, '../locale/languages'));
		
		// Set the bot's status
		console.log(`=: Bot Initialised :=`);
		console.log(`Name: ${client.user.username}#${client.user.discriminator}`);
		console.log(`ID: ${client.user.id}`);

		client.cooldowns = new Discord.Collection();

		// Set the client user's activity.
		await client.user.setActivity(`${client.db.bot.get(`data.trophiesAwarded`, 0) ?? 0} awarded trophies!`, { type: 'WATCHING' });

		changeActivity(client);

		// Set the basic bot stuff
		if (!client.db.bot.has(`data`)){
			client.db.bot.set(`data`, {
				version: client.version,

				defaultLanguage: 'en',
				bannedUsers: [],
				commands: {
					total: 0
				},
				trophies: 0,
				trophiesAwarded: 0,
			});
		}
	}
}