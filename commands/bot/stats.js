const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, timeFormat } = require('../../globals');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Look at the bot stats'),
	
	async run (interaction){

		const embed = new EmbedBuilder();

		const client = interaction.client;
		const commands = client.commands.size ?? 0;

		embed.setColor(color.main);
		embed.setTitle('Stats');
		embed.addFields(
			{ 
				name: `Discord`, 
				inline: true,
				value:
					`**Servers:** ${client.guilds.cache.size}\n` +
					`**Users:** ${client.users.cache.size}\n` +
					`**Uptime:** ${timeFormat(client.uptime)}`
			}
		);

		embed.addFields({
			name: `Trophies`,
			inline: true,
			value:
				`**Commands:** ${commands}\n` + 
				`**Runs:** ${client.db.bot.get(`data.commands.total`) ?? 0} :gear:\n` +
				`**Trophies:** ${client.db.bot.get(`data.trophies`) ?? 0} :trophy:\n` +
				`**Awards:** ${client.db.bot.get(`data.trophiesAwarded`) ?? 0} :medal:\n`
			}
		);

		return interaction.editReply({
			embeds: [embed]
		});
		
	}
}