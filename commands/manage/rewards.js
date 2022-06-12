const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color, emoji: emojis, parseUser } = require('../../globals');

module.exports = {
	cooldown: 5,
	permissions: ['manage_rewards'],
	data: new SlashCommandBuilder()
		.setName('rewards')
		.setDescription('Create a new trophy for your server.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add permissions to a role.')
				.addRoleOption(option => option.setName('target').setDescription('Which role you want to add as reward.').setRequired(true))
				.addIntegerOption(option => option.setName('requirement').setDescription('How much score the user will require to get this role.').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a role reward from your server.')
				.addRoleOption(option => option.setName('role').setDescription('Which role you want to remove from rewards').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List of reward roles.')
		),

	async run (interaction) {
	}
}