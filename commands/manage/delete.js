const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color, emoji, getTrophy, cleanseTrophies } = require('../../globals');

module.exports = {
	permissions: ['manage_trophies'],
	data: new SlashCommandBuilder()
		.setName('delete')
		.setDescription('Delete a trophy from your server.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to delete').setRequired(true)),

	async run (interaction) {

		const embed = new Discord.MessageEmbed();
		
		const client = interaction.client;
		const guild = interaction.guild.id;

		const trophy = interaction.options?.get('trophy')?.value || null;
		
		const id = await getTrophy(client, guild, trophy);

		if (!id){
			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} Could not find a trophy with the name or ID of \`${trophy}\``);

			return interaction.reply({
				embeds: [embed]
			});
		}

		const value = client.db.guilds.get(`data.${guild}.trophies.${id}`)?.value;
		client.db.guilds.delete(`data.${guild}.trophies.${id}`);

		cleanseTrophies(client, guild, id, value);

	}
}