const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const { color, emoji } = require('../../commons/statics');
const Utils = require("../../commons/utils");
const Database = require("../../commons/database");

const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDefaultMemberPermissions("32")
		.setDescription('Delete a trophy from your server.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to delete').setRequired(true)),

	async run (interaction) {

		
		// Get the current guild's snowflake
		const guild = interaction.guild.id;

		// Get the specified trophy
		const filter = interaction.options?.get('trophy')?.value;
		const trophy = await Database.findTrophy(guild, filter);

		// If trophy doesn't exist, throw error
		if (!trophy){
			const embed = await Utils.getError(guild, "error_generic_trophy_not_found", { filter });
			return interaction.editReply({ embeds: [embed] });
		}

		// Attempt to delete the trophy
		const results = await Database.deleteTrophy(guild, trophy.id);

		// If trophy deletion gone wrong, throw error
		if (!results){
			const embed = await Utils.getError(guild, "error_delete_generic", { filter });
			return interaction.editReply({ embeds: [embed] });
		}
		
		const embed = new EmbedBuilder();

		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Sucessfully **deleted** trophy ${Utils.formatTrophy(trophy)}`);

		return interaction.editReply({
			embeds: [embed]
		});
	}
}