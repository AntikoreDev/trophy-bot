const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji, getTrophy, getSetting, getDedication } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setDefaultMemberPermissions("32")
		.setName('details')
		.setDescription('Shows the details of a trophy')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to show').setRequired(true)),

	async run (interaction) {

		const embed = new EmbedBuilder();
		
		const client = interaction.client;
		const guild = interaction.guild.id;

		const trophy = interaction.options?.get('trophy')?.value || null;
		
		const id = await getTrophy(client, guild, trophy);

		if (!id){
			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} Could not find a trophy with the name or ID of \`${trophy}\``);

			return interaction.editReply({
				embeds: [embed]
			});
		}
		
		const object = client.db.guilds.get(`data.${guild}.trophies.${id}`);
		const details = object?.details ?? "No details provided.";
		const emoj = object?.emoji;
		const name = object?.name;

		embed.setURL(`https://www.youtube.com/watch?v=PwP9ebvCBAM`);
		embed.setColor(color.main);
		embed.setTitle(`${emoj} ${name}`);
		embed.setDescription(`\u200b${details}`);
		embed.setFooter({
			text: `Trophy ID: ${id}`,
		});
	
		interaction.editReply({
			embeds: [embed],
		});
	}
}