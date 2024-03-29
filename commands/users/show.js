const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji, getTrophy, getSetting, getDedication } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Show a trophy.')
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
		const name = object?.name;
		const desc = object?.description;
		const image = object?.image || `https://cdn.discordapp.com/attachments/631540341148876802/985219082662064178/trophy.png`;
		const dedication = object?.dedication;
		const emoj = object?.emoji;
		const value = object?.value;
		const signed = object?.signed;
		const creator = object?.creator;

		embed.setURL(`https://www.youtube.com/watch?v=04854XqcfCY`);
		embed.setColor(color.main);
		embed.setTitle(`${emoj} ${name}`);
		embed.setImage(image.startsWith(`https://`) ? image : `attachment://${image}`);
		embed.setDescription(`${desc}`);
		embed.addFields({ name: 'Value', value: `\u200b${value} :medal:`, inline: true });
		embed.setFooter({
			text: `Trophy ID: ${id}`,
		});
		
		if (signed){
			embed.addFields({ name: 'Signed by', value: `\u200b<@${creator}>`, inline: true });
		}
		
		const config = getSetting(client, guild, 'dedication_display');
		if (dedication.name){
			const dedic = await getDedication(interaction.guild, dedication, config);
			if (dedic) embed.addFields({ name: 'Dedicated to', value: `\u200b${dedic}`, inline: true });
		}

		interaction.editReply({
			embeds: [embed],
			files: (image.startsWith(`https://`) ? [] : ['./images/' + image])
		});
	}
}