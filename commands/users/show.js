const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, emoji, getTrophy } = require('../../globals');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Show a trophy.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to show').setRequired(true)),

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
		
		const object = client.db.guilds.get(`data.${guild}.trophies.${id}`);
		const name = object?.name;
		const desc = object?.description;
		const image = object?.image || `https://cdn.discordapp.com/attachments/631540341148876802/985219082662064178/trophy.png`;
		const dedication = object?.dedication;
		const emoj = object?.emoji;
		const value = object?.value;

		embed.setColor(color.main);
		embed.setTitle(`${emoj} ${name}`);
		embed.setImage(image.startsWith(`https://`) ? image : `attachment://${image}`);
		embed.setDescription(`${desc}`);
		embed.addField('Value', `\u200b${value}`, true);
		embed.setFooter({
			text: `Trophy ID: ${id}`,
		});
		
		if (dedication.name) embed.addField('Dedicated to', `\u200b${dedication.name}`, true);

		interaction.reply({
			embeds: [embed],
			files: (image.startsWith(`https://`) ? [] : ['./images/' + image])
		});
	}
}