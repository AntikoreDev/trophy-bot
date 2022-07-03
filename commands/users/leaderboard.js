const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, emoji, getMedal, getPage, isInServer, getSetting } = require('../../globals');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Shows the server\'s leaderboard.')
		.addIntegerOption(option => option.setName('page').setDescription('Which page to show. Defaults to 1').setRequired(false)),

	async run (interaction) {

		const embed = new Discord.MessageEmbed();

		const client = interaction.client;
		const guild = interaction.guild.id;	

		const page = interaction.options?.get('page')?.value || 1;
		const users = client.db.guilds.get(`data.${guild}.users`) || {};

		const list = new Discord.Collection();
		let total = 0;

		const keys = Object.keys(users);
		for (const key of keys) {
			if (users[key].trophyValue && (isInServer(interaction.guild, key) || getSetting(client, guild, 'hide_quit_users') == 1)) {
				list.set(key, users[key].trophyValue);
				total += users[key].trophyValue;
			}
		}

		const sorted = list.sort((a, b) => b - a);
		const pages = getPage(Array.from(sorted.keys()), 10, page);

		let i = ((page - 1) * 10) + 1;
		const top = [];
		for (const user of pages.list) {
			const value = sorted.get(user);
			top.push(`${getMedal(i)} **${i}.-** <@${user}> ➤ **${value}** :medal:`);

			i++;
		}

		embed.setColor(color.main);
		embed.setTitle(`${emoji.trophy} ${interaction?.guild?.name ?? 'Server'}'s Leaderboard`);
		embed.setDescription(`Total server score: **${total}** :medal:`);
		embed.addField(`Leaderboard`, top.length ? top.join('\n') : `No scores yet`);
		embed.setFooter({ text: `Page ${pages.page} of ${pages.last}` });

		return interaction.editReply({
			embeds: [embed]
		});

	}
}