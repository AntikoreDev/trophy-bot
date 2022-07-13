const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('language')
		.setDefaultMemberPermissions("32")
		.setDescription('Set this server\'s language for the bot')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List of available languages')
		),

	async run (interaction) {

		const embed = new Discord.MessageEmbed();

		const client = interaction.client;
		const guild = interaction.guild.id;

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'list'){
			
			embed.setColor(color.main);
			embed.setTitle(`:globe_with_meridians: Language List`);
			embed.setDescription(`The following languages are available for the bot to use`);
			
			const list = client.languages.sort((a, b) => a.names[0].localeCompare(b.names[0]));
			const str = list.map(l => `${l.icon} **${l.names[0]}**`).join('\n');

			embed.addField(`List of languages`, str.length > 0 ? str : 'No languages available');

			return interaction.editReply({
				embeds: [embed]
			});
		}
	}
}
