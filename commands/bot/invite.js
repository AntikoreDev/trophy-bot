const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Invite the bot to your server!'),

	async run (interaction) {

		const embed = new EmbedBuilder();

		embed.setColor(color.main);
		embed.setTitle(`Invite Me to Your Server!`);
		embed.setDescription(`You can invite me to your server by using the following link\n\n*No worries, no rickroll in here ;)*\n[Click here](https://discord.com/oauth2/authorize?client_id=985134052665356299&permissions=34816&scope=applications.commands%20bot)`);
		embed.setThumbnail(interaction.client.user.displayAvatarURL());

		return interaction.editReply({
			embeds: [embed],
			ephemeral: true,
		});
	}
}


