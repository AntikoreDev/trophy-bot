const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color } = require('../../globals');
const Locale = require(`../../commons/locale.js`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('support')
		.setDescription('You need extra help? Join our support server.'),
		
	async run (interaction) {

		const locale = {
			title: await Locale.getLocalisedString(interaction.guild.id, "command_support_title"),
		}
		
		const embed = new EmbedBuilder();

		embed.setColor(color.main);
		embed.setThumbnail(interaction.client.user.displayAvatarURL());
		embed.setTitle(`:question: ${locale.title}`);
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