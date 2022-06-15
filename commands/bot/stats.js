const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, timeFormat } = require('../../globals');
const Discord = require('discord.js');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Look at the bot stats'),
	
	async run (interaction){

		const embed = new Discord.MessageEmbed();

		const client = interaction.client;
		const commands = client.commands.size ?? 0;

		embed.setColor(color.main);
		embed.setTitle('Stats');
		embed.addField(`Discord`, 
			`**Servers:** ${client.guilds.cache.size}\n` +
			`**Users:** ${client.users.cache.size}\n` +
			`**Uptime:** ${timeFormat(client.uptime)}`
		, true);

		embed.addField(`Trophies`, 
			`**Commands:** ${commands}\n` + 
			`**Runs:** ${client.db.bot.get(`data.commands.total`) ?? 0} :gear:\n` +
			`**Trophies:** ${client.db.bot.get(`data.trophies`) ?? 0} :trophy:\n` +
			`**Awards:** ${client.db.bot.get(`data.trophiesAwarded`) ?? 0} :medal:\n`
		, true);

		interaction.reply({
			embeds: [embed]
		});
		
	}
}