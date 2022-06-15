const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Current bot ping! If the bot doesn\'t answer then ping is probably over 5000ms and very likely down'),
		
	async run (interaction) {

		const embed = new Discord.MessageEmbed();

		// Get the rounded websocket ping
		const api = Math.round(interaction.client.ws.ping);
		
		embed.setColor(color.main);
		embed.setDescription(
			`\n:robot: **Discord API:** ${api} ms` +
			`\n\nThis is bot ping, not yours :).`
		);

		interaction.reply({
			embeds: [embed]
		});
	},
};