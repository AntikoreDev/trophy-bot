// This event runs whenever the bot is ready to start working!
const { fetchModules } = require('../globals.js');
const path = require('path');

module.exports = {
	name: 'ready',
	once: true,
	async run (client) {
		
		// Import all the modules
		client.commands 	= await fetchModules(path.join(__dirname, '../commands'), '.js', true);
		client.categories 	= await fetchModules(path.join(__dirname, '../categories'));
		client.languages 	= await fetchModules(path.join(__dirname, '../locale/languages'));
		client.settings 	= await fetchModules(path.join(__dirname, '../settings'));

		// Set the bot's status
		console.log(`=: Bot Initialised :=`);
		console.log(`Name: ${client.user.username}#${client.user.discriminator}`);
		console.log(`ID: ${client.user.id}`);

		// Set the client user's activity.
		client.user.setActivity(`0 awarded trophies!`, { type: 'WATCHING' });

		// Set the basic bot stuff
		if (!client.db.bot.has(`data`)){
			client.db.bot.set(`data`, {
				version: client.version,

				defaultLanguage: 'en',
				bannedUsers: [],
				commands: {},
				trophiesAwarded: 0,
			});
		}
	}
}