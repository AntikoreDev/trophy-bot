const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('imsafe')
		.setDefaultMemberPermissions("32")
		.setDescription('Confirms you\'re using discord permissions instead of the deprecated custom permissions'),
		
	async run (interaction) {
		const client = interaction.client;
		const guild = interaction.guild.id;

		const imsafe = client.db.guilds.get(`data.${guild}.imsafe`) ?? false;
		
		const embed = new EmbedBuilder();

		if (imsafe){
			embed.setColor(color.main);
			embed.setDescription(":white_check_mark: You're currently on safe mode :)");

			return await interaction.editReply({
				embeds: [embed]
			});
		}

		client.db.guilds.set(`data.${guild}.imsafe`, true);

		embed.setColor(color.main);
		embed.setDescription(":white_check_mark: You have set your server as safe! (Hopefully everything is ok)");

		return await interaction.editReply({
			embeds: [embed]
		});
			
	}
}