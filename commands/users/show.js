const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getDedication } = require('../../globals');
const { color, emoji } = require('../../commons/statics');
const Database = require(`../../commons/database`);
const Utils = require(`../../commons/utils`);
const SelectionWindow = require('../../windows/selection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('show')
		.setDescription('Show a trophy.')
		.addStringOption(option => option.setName('trophy').setDescription('Name or ID of the trophy to show').setRequired(true)),

	async run (interaction) {

		const embed = new EmbedBuilder();
		const guild = interaction.guild.id;

		const filter = interaction.options?.get('trophy')?.value;
		const result = await Database.findTrophy(guild, filter, false);

		if (!result){
			const embed = await Utils.getError(guild, "error_generic_trophy_not_found", { filter });
			return interaction.editReply({ embeds: [embed] });
		}

		if (result.length > 1){
			new SelectionWindow(interaction, filter, result);
			return;
		}

		const trophy = result[0];
		if (!trophy){
			const embed = await Utils.getError(guild, "error_generic_trophy_not_found", { filter });
			return interaction.editReply({ embeds: [embed] });
		}

		const imageURL = (trophy.image || process.env.TROPHY_DEFAULT_IMAGE);

		embed.setURL(`https://www.youtube.com/watch?v=04854XqcfCY`);
		embed.setColor(color.main);
		embed.setTitle(`${trophy.emoji} ${trophy.name}`);
		embed.setImage(imageURL);
		embed.setDescription(`${trophy.description}`);
		embed.addFields({ name: 'Value', value: `\u200b${trophy.value} :medal:`, inline: true });
		embed.setFooter({ text: `ID: ${trophy.id}` });
		
		if (trophy.signed)
			embed.addFields({ name: 'Signed by', value: `\u200b<@${trophy.creator}>`, inline: true });

		if (trophy?.dedication?.name){
			const dedic = await getDedication(interaction.guild, trophy.dedication);

			if (dedic) 
				embed.addFields({ name: 'Dedicated to', value: `\u200b${dedic}`, inline: true });
		}

		interaction.editReply({
			embeds: [embed]
		});
	}
}