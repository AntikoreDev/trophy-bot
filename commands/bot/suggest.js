const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../globals');
const Discord = require('discord.js');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest a feature or change for the bot.')
		.addStringOption(option => option.setName('suggestion').setDescription('The suggestion you want to make.').setRequired(true)),

	async run (interaction) {
		const suggestion = interaction.options.get('suggestion').value;

		interaction.reply({ content: 'Thank you for your suggestion! (Note that this command is not yet implemented so your suggestion didn\'t go anywhere lmao)', ephemeral: true });
	}
}