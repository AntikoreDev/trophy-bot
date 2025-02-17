const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji } = require('../../commons/statics');
const Database = require("../../commons/database");
const Utils = require("../../commons/utils");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('award')
		.setDefaultMemberPermissions("32")
		.setDescription('Award a trophy for an user.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to award').setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('User to award the trophy to').setRequired(true))
		.addIntegerOption(option => option.setName('count').setDescription('Number of trophies to award, defaults to 1').setRequired(false)),

	async run (interaction) {
		
		const MIN = 1;
		const MAX = 50;

		const guild = interaction.guild.id;

		const filter = interaction.options?.get('trophy')?.value;
		const user = interaction.options?.get('user')?.value;
		const count = Math.floor(Math.max(interaction.options?.get('count')?.value || 1, 1));

		const trophy = await Database.findTrophy(guild, filter);
		if (!trophy){
			const embed = await Utils.getError(guild, "error_generic_trophy_not_found", { filter });
			return interaction.editReply({ embeds: [embed] });
		}

		const outrange = (count < MIN || count > MAX);
		if (outrange){
			const embed = await Utils.getError(guild, "error_award_amount", { min: MIN, max: MAX });
			return interaction.editReply({ embeds: [embed] });
		}

		const success = await Database.addTrophy(guild, user, trophy, count);
		if (!success){
			const embed = await Utils.getError(guild, "error_award_generic");
			return interaction.editReply({ embeds: [embed] });
		}
		
		/*try {
			doRewardRoles(client, interaction.guild, user);
		} catch {}
		*/

		const embed = new EmbedBuilder();

		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Successfully awarded **${count}** troph${count === 1 ? 'y' : 'ies'} of ${Utils.formatTrophy(trophy)} to ${Utils.formatUser(user)}`);

		if (!interaction) return;
		await interaction.editReply({
			embeds: [embed]
		});
	}
}