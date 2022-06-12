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

		// Only divide by 1000 if the system os is windows (For some fucking reason)
		const div = (process.platform === "win32" ? 1000 : 1);
		const latency = -(Math.round((Date.now() - interaction.createdTimestamp) / div) - 1);
		
		embed.setColor(color.main);
		embed.setDescription(
			`\n:robot: **Discord API:** ${api} ms` +
			`\n:speech_balloon: **Bot Latency:** ${latency} ms` +
			`\n\nThis is bot ping, not yours :).`
		);

		interaction.reply({
			embeds: [embed]
		});
	},
};