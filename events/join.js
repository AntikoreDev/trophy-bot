const { EmbedBuilder } = require('discord.js');

// Note from the developer, I hate interactions and the whole slash command system.
module.exports = {
	name: 'guildCreate',
	once: false,
	async run (guild) {
		
		console.log(`Joined a new guild!`);
		await guild.members.fetch();
		
	}
}