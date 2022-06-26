const Discord = require('discord.js');
const { color } = require('../globals');

// Note from the developer, I hate interactions and the whole slash command system.
module.exports = {
	name: 'guildCreate',
	once: false,
	async run (guild) {
		
		console.log(`Joined a new guild!`);
		await guild.members.fetch();

		// In case someone is reading this...
		// Just a friendly reminder for myself to ha- love Discord API <3
		if (guild?.client?.guilds?.cache?.size == 75){

			const first = guild.client.db.bot.get(`data.milestone`) ?? null;
			if (first == null){

				const embed = new Discord.MessageEmbed();

				embed.setColor(color.success);
				embed.setTitle(`:tada: Trophy Bot got to 75 servers!`);
				embed.setDescription(`You should be proud of yourself! Now you should waitlist for the server members intent and verification. yay!`);

				await guild.client.errorChannel.send(
					{
						content: `<@353998390734094346>`,
						embeds: [embed],
					}
				);

				guild.client.db.bot.set(`data.milestone`, true);
			}
		}
		
	}
}