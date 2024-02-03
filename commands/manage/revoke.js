const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji } = require("../../commons/statics");
const Database = require("../../commons/database");
const Utils = require("../../commons/utils");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('revoke')
		.setDefaultMemberPermissions("32")
		.setDescription('Revoke a trophy from an user.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to revoke').setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('User to revoke the trophy from').setRequired(true))
		.addIntegerOption(option => option.setName('count').setDescription('Number of trophies to revoke, defaults to 1.').setRequired(false)),

	async run (interaction) {

		const MIN = 1;
		const MAX = 50;

		const guild = interaction.guild.id;

		const filter 	= interaction.options?.get('trophy')?.value;
		const user 		= interaction.options?.get('user')?.value;
		const count 	= Math.floor(Math.max(interaction.options?.get('count')?.value || MIN, MIN));

		const trophy = await Database.findTrophy(guild, filter);
		if (!trophy){
			const embed = await Utils.getError(guild, "error_generic_trophy_not_found", { filter });
			return interaction.editReply({ embeds: [embed] });
		}

		const outrange = (count < MIN || count > MAX);
		if (outrange){
			const embed = await Utils.getError(guild, "error_revoke_amount", { min: MIN, max: MAX });
			return interaction.editReply({ embeds: [embed] });
		}

		// Using negative count to remove instead of adding MWAHAHAHA!!
		const success = await Database.revokeTrophy(guild, user, trophy, count);

		// -2: Thrown errors
		if (success == -2){
			const embed = await Utils.getError(guild, "error_revoke_generic");
			return interaction.editReply({ embeds: [embed] });
		}

		// -1: No existing awards for that user
		if (success == -1){
			const embed = await Utils.getError(guild, "error_revoke_no_trophies", { user: Utils.formatUser(user), trophy: Utils.formatTrophy(trophy) });
			return interaction.editReply({ embeds: [embed] });
		}

		/*
		try {
			doRewardRoles(client, interaction.guild, user);
		} catch {}
		*/
		
		const embed = new EmbedBuilder();

		const displayCount = (success == 0 ? "ALL" : success);
		
		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Successfully removed **${displayCount}** troph${success === 1 ? 'y' : 'ies'} of ${Utils.formatTrophy(trophy)} from ${Utils.formatUser(user)}`);

		interaction.editReply({
			embeds: [embed]
		});
	}
}