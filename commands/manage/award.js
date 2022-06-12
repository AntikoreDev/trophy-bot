const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color, emoji, getTrophy } = require('../../globals');

module.exports = {
	permissions: ['manage_users'],
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('award')
		.setDescription('Award a trophy for an user.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to award').setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('User to award the trophy to').setRequired(true))
		.addIntegerOption(option => option.setName('count').setDescription('Number of trophies to award, defaults to 1').setRequired(false)),

	async run (interaction) {
		
		const embed = new Discord.MessageEmbed();

		const client = interaction.client;
		const guild = interaction.guild.id;

		const trophy = interaction.options?.get('trophy')?.value || null;
		const user = interaction.options?.get('user')?.value || null;
		const count = Math.floor(Math.max(interaction.options?.get('count')?.value || 1, 1));

		const id = await getTrophy(client, guild, trophy);
		if (!id){
			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} Could not find a trophy with the name or ID of \`${trophy}\``);

			return interaction.reply({
				embeds: [embed]
			});
		}

		const object = client.db.guilds.get(`data.${guild}.trophies.${id}`);
		if (!object){
			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} Could not find a trophy with the name or ID of \`${trophy}\``);

			return interaction.reply({
				embeds: [embed]
			});
		}

		const value = object.value * count;
		let n = count;
		while (n > 0){
			
			client.db.guilds.push(`data.${guild}.users.${user}.trophies`, id);
			n--;
		}

		client.db.guilds.add(`data.${guild}.users.${user}.trophyValue`, value);
		client.db.bot.add(`data.trophiesAwarded`, count);

		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Successfully awarded **${count}** troph${count === 1 ? 'y' : 'ies'} of **${object.name}** to <@${user}>`);

		interaction.reply({
			embeds: [embed]
		});
	}
}