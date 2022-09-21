const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { emoji, color, updatePanel, showSuccess, showError } = require('../../globals');

module.exports = {
	permissions: ['manage_users'],
	data: new SlashCommandBuilder()
		.setDefaultMemberPermissions("0")
		.setName('panel')
		.setDescription('Create a leaderboard panel. You can only have one panel at a time.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Create the panel for the leaderboard.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')	
				.setDescription('Delete the panel for the leaderboard.')
		),

	async run (interaction) {
		
		const channel = interaction.channel;
		const client = interaction.client;
		const guild = interaction.guild.id;

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'create'){
			try {
				const msg = await channel.send(`Creating panel...`);
				client.db.guilds.set(`data.${guild}.panel`, {
					message: msg.id,
					channel: channel.id	
				});
	
				await updatePanel(client, interaction.guild);
				return interaction.deleteReply();
			} catch {
				const embed = new Discord.MessageEmbed();
				embed.setColor(color.error);
				embed.setDescription(showError('Failed to create panel. Check channel and bot permissions. If issue persists, join our [Support Server](https://discord.gg/kNmgU44xgU).'));

				return interaction.editReply({
					embeds: [embed]
				});
			}
			
		}
		else if (subcommand === 'delete'){
			client.db.guilds.delete(`data.${guild}.panel`);

			const embed = new Discord.MessageEmbed();
			embed.setColor(color.success);
			embed.setDescription(showSuccess(`Sucessfully **deleted** the panel.`));

			return interaction.editReply({
				embeds: [embed]
			});
		}
	}
}