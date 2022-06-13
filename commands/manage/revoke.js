const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color, emoji, getTrophy, doRewardRoles } = require('../../globals');

module.exports = {
	permissions: ['manage_users'],
	data: new SlashCommandBuilder()
		.setName('revoke')
		.setDescription('Revoke a trophy from an user.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to revoke').setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('User to revoke the trophy from').setRequired(true))
		.addIntegerOption(option => option.setName('count').setDescription('Number of trophies to revoke, defaults to 1.').setRequired(false)),

	async run (interaction) {

		await interaction.deferReply();
		
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

			return interaction.editReply({
				embeds: [embed]
			});
		}

		const object = client.db.guilds.get(`data.${guild}.trophies.${id}`);
		if (!object){
			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} Could not find a trophy with the name or ID of \`${trophy}\``);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		if (count < 0 || count > 50){

			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} You can only revoke between 0 and 50 trophies per command.`);
			
			return interaction.editReply({
				embeds: [embed]
			});
		}

		const trophies = client.db.guilds.get(`data.${guild}.users.${user}.trophies`) || [];
		const amount = trophies.filter(t => t === id).length;

		const all = count >= amount;

		const value = object.value * Math.min(count, amount);
		let n = Math.min(count, amount);
		while (n > 0){
			
			trophies.pop(id);
			n--;
		}

		client.db.guilds.set(`data.${guild}.users.${user}.trophies`, trophies);
		client.db.guilds.subtract(`data.${guild}.users.${user}.trophyValue`, value);

		doRewardRoles(client, interaction.guild, interaction.member);

		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Successfully removed **${all ? 'all' : count}** troph${count === 1 ? 'y' : 'ies'} of **${object.name}** from <@${user}>`);

		interaction.editReply({
			embeds: [embed]
		});
	}
}