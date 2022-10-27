const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('support')
		.setDescription('You need extra help? Join our support server.'),
		
	async run (interaction) {
		
		const embed = new EmbedBuilder();

		embed.setColor(color.main);
		embed.setThumbnail(interaction.client.user.displayAvatarURL());
		embed.setTitle(`:question: You need support?`);
		embed.setDescription(
			`You can get help in our [Support Server](https://discord.gg/kNmgU44xgU)\n\n` +
			`You can also report bugs on [Github](https://github.com/Aidanete/trophy-bot/issues)\n` +
			`Or suggest stuff with **/suggest**.`
		)

		if (!interaction) return;
		return interaction.editReply({
			embeds: [embed],
			ephemeral: true,
		});
	}
}