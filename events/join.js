const { EmbedBuilder } = require('discord.js');

// Note from the developer, I hate interactions and the whole slash command system.
module.exports = {
	name: 'guildCreate',
	once: false,
	async run (guild) {
		
		console.log(`[Trophy Bot] Added server!`);
		await guild.members.fetch();
		
	}
}