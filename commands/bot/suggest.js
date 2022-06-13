const { SlashCommandBuilder } = require('@discordjs/builders');
const { color } = require('../../globals');
const Discord = require('discord.js');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest a feature or change for the bot.')
		.addStringOption(option => option.setName('suggestion').setDescription('Suggestion you want to make').setRequired(true)),

	async run (interaction) {
		const client = interaction.client;
		const embed = new Discord.MessageEmbed();

		const suggestion = interaction.options.get('suggestion')?.value;

		if (!client.suggestionChannel){
			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} Sorry! Looks like the dev did something dum dum and the bot cannot send your suggestion. You may tell him to fix it.\nRefer to [Github Issues](https://github.com/Aidanete/trophy-bot) to report this issue.`);
		
			return interaction.reply({
				embeds: [embed]
			});
		}

		embed.setColor(color.main);
		embed.setTitle(':outbox_tray: Suggestion Sent');
		embed.setDescription(`Your suggestion has been sent to the developers. You won't receive any feedback but if your suggestion was accepted, it may appear in the bot sooner or later.`);

		await interaction.reply({
			embeds: [embed]
		});

		embed.setColor(color.main);
		embed.setTitle(':inbox_tray: Suggestion Received');
		embed.addField(`Suggestion`, `\u200b${suggestion}`);
		embed.setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }) });
		embed.setTimestamp();
		embed.setDescription(``);

		const channel = client.suggestionChannel;
		const message = await channel.send({
			embeds: [embed]
		});
	}
}