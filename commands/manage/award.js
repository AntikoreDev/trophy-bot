const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color, emoji, getTrophy, doRewardRoles } = require('../../globals');

module.exports = {
	permissions: ['manage_users'],
	data: new SlashCommandBuilder()
		.setName('award')
		.setDescription('Award a trophy for an user.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to award').setRequired(true))
		.addUserOption(option => option.setName('user').setDescription('User to award the trophy to').setRequired(true))
		.addIntegerOption(option => option.setName('count').setDescription('Number of trophies to award, defaults to 1').setRequired(false)),

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

			if (!interaction) return;
			return interaction.editReply({
				embeds: [embed]
			});
		}

		const object = client.db.guilds.get(`data.${guild}.trophies.${id}`);
		if (!object){
			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} Could not find a trophy with the name or ID of \`${trophy}\``);

			if (!interaction) return;
			return interaction.editReply({
				embeds: [embed]
			});
		}

		if (count < 0 || count > 50){
			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} You can only award between 0 and 50 trophies per command.`);

			if (!interaction) return;
			return interaction.editReply({
				embeds: [embed]
			});
		}

		const prev = client.db.guilds.get(`data.${guild}.users.${user}.trophies`) ?? [];

		const value = object.value * count;
		let n = count;
		while (n > 0){
			
			prev.push(id);
			n--;
		}

		client.db.guilds.set(`data.${guild}.users.${user}.trophies`, prev);
		client.db.guilds.add(`data.${guild}.users.${user}.trophyValue`, value);
		client.db.bot.add(`data.trophiesAwarded`, count);

		try {
			doRewardRoles(client, interaction.guild, interaction.member);
		} catch {}
		

		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Successfully awarded **${count}** troph${count === 1 ? 'y' : 'ies'} of **${object.name}** to <@${user}>`);

		if (!interaction) return;
		await interaction.editReply({
			embeds: [embed]
		});
	}
}