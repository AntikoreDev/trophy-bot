const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji, doRewardRoles } = require('../../globals');
const Database = require("../../commons/database");
const Utils = require("../../commons/utils");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDefaultMemberPermissions("32")
		.setDescription('Clear all trophies and resets the score of an user to 0.')
		.addUserOption(option => option.setName('user').setDescription('User to award the trophy to').setRequired(true)),

	async run (interaction) {	

		const guild = interaction.guild.id;
		const user = interaction.options?.get('user')?.value;

		const results = await Database.clearUserTrophies(guild, user);
		if (!results){
			const embed = Utils.getError(guild, "error_clear_generic");

			if (!interaction) return;
			await interaction.editReply({
				embeds: [embed]
			});
		}

		/*
		try {
			doRewardRoles(client, interaction.guild, user);
		} catch {}
		*/

		const embed = new EmbedBuilder();

		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Successfully cleared trophies and score for ${Utils.formatUser(user)}`);

		if (!interaction) return;
		await interaction.editReply({
			embeds: [embed]
		});
	}
}