const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { color, sleep } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forgetme')
		.setDefaultMemberPermissions("8")
		.setDescription('Remove all images and data about your server from the bot and kick it.'),

	async run (interaction){
		if (interaction.guild.ownerId != interaction.member.id){
			interaction.deleteReply();
			return;
		}

		const embed = new EmbedBuilder();

		embed.setColor(color.error);
		embed.setThumbnail(interaction.client.user.displayAvatarURL());
		embed.setTitle(`:warning: Warning!`);
		embed.setDescription(
			`Anything you have created or made in the bot will be deleted if you proceed with this operation.\n` +
			`This will remove any information the bot has about your server and automatically leave.\n` +
			`This is useful when you don't need the bot anymore and you want to clear any data.\n\n` +
			`After you press this button, there is no going back.\nYou still want to continue?`
		);

		const row = buttons();
		await interaction.editReply({
			embeds: [embed],
			components: [row],
		});
	}
}

function buttons(disabled = false){
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('forgetmeproceed')
				.setLabel('Delete all server data')
				.setStyle(ButtonStyle.Danger)
				.setEmoji('🧹')
				.setDisabled(disabled)
		);
}