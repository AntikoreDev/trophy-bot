const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji, doRewardRoles } = require('../../globals');

module.exports = {
	permissions: ['manage_users'],
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDefaultMemberPermissions("32")
		.setDescription('Clear all trophies and resets the score of an user to 0.')
		.addUserOption(option => option.setName('user').setDescription('User to award the trophy to').setRequired(true)),

	async run (interaction) {
		
		const embed = new EmbedBuilder();

		const client = interaction.client;
		const guild = interaction.guild.id;

		const user = interaction.options?.get('user')?.value || null;

		client.db.guilds.set(`data.${guild}.users.${user}.trophies`, []);
		client.db.guilds.set(`data.${guild}.users.${user}.trophyValue`, 0);

		try {
			doRewardRoles(client, interaction.guild, user);
		} catch {}
		
		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Successfully cleared trophies and score for <@${user}>`);

		if (!interaction) return;
		await interaction.editReply({
			embeds: [embed]
		});
	}
}