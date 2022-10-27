const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color } = require('../../globals');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest a feature or change for the bot. (Now just an advice to join the support server to suggest)'),

	async run (interaction) {

		const embed = new EmbedBuilder();

		embed.setColor(color.main);
		embed.setTitle(':people_hugging: Migrating Suggestions');
		embed.setDescription(`Since 1.4, to suggest features and report issues you must go to our [Support Server](https://discord.gg/kNmgU44xgU)\n**Thanks for using our bot! :heart:**`);

		await interaction.editReply({
			embeds: [embed]
		});
	}
}