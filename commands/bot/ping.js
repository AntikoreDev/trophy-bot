const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color } = require('../../commons/statics.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Current bot ping! If the bot doesn\'t answer then ping is probably over 5000ms and very likely down'),
		
	async run (interaction) {

		const embed = new EmbedBuilder();

		// Get the rounded websocket ping
		const api = Math.round(interaction.client.ws.ping);
		const sent = await interaction.editReply({ content: 'Pinging...', fetchReply: true });

		embed.setColor(color.main);
		embed.setDescription(
			`\n:robot: **Bot Latency:** ${(sent.createdTimestamp - interaction.createdTimestamp)} ms` +
			`\n:ping_pong: **Discord API:** ${api} ms` +
			`\n\nThis is bot ping, not yours :).`
		);

		return interaction.editReply({
			content: 'Done!',
			embeds: [embed]
		});
	},
};