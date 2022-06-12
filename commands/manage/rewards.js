const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color, emoji: emojis, parseUse, emojir } = require('../../globals');

module.exports = {
	permissions: ['manage_rewards'],
	data: new SlashCommandBuilder()
		.setName('rewards')
		.setDescription('Create a new trophy for your server.')
		.addStringOption(option => option.setName('name').setDescription('The name of the trophy.').setRequired(true))
		.addStringOption(option => option.setName('description').setDescription('Description for the trophy').setRequired(false)),

	async run (interaction) {
	}
}