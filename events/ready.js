// This event runs whenever the bot is ready to start working!
// const { fetchModules, changeActivity, updatePanels } = require('../globals.js');
const path = require('path');
const modules = require('../commons/modules.js');
const Log = require('../commons/logger.js');
const REST = require('@discordjs/rest').REST;
const { Routes } = require('discord-api-types/v9');
const instance = require('../commons/instance.js');

module.exports = {
	name: 'ready',
	once: true,
	async run (client) {

		Log.i(`Fetching dump channels...`);
		try {
			client.errorChannel = await client.channels.fetch("985869722199416862").then();
		} catch (e) {
			Log.e(`Couldn't fetch error channel`);
		}

		Log.i(`Reading commands and locales...`);

		// Import all the modules
		client.commands 	= await modules.fetch(path.join(__dirname, '../commands'), '.js');
		client.languages 	= await modules.fetchLanguages(path.join(__dirname, '../locale/languages'), '.js');
		
		// Set the bot's status
		Log.i(`Loaded ${client.commands.size} commands and ${client.languages.size} languages`);
		Log.i(`Running as ${client.user.username}#${client.user.discriminator} with ID ${client.user.id}`);
		
		await sendCommands(client);

		// client.cooldowns = new Discord.Collection();

		// Set the client user's activity.
		// changeActivity(client);
		// updatePanels(client);
	}
}

async function sendCommands(client){
	const testingServers = await instance.get("main", "dev_servers");
	const environment = await instance.get("main", "environment");
	const commands = client.commands.map(command => {
		return command.data.toJSON();
	});

	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

	if (environment === "dev"){
		for (const server of testingServers){
			await rest.put(Routes.applicationGuildCommands(client.user.id, server), { body: commands })
				.then()
				.catch(console.error);
		}
		return;
	}

	Log.i("Putting commands...");
	await rest.put(Routes.applicationCommands(client.user.id), { body: commands }).then();
}