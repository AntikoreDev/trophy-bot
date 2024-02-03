const { forgetMe } = require('../globals');
// Yeah, just because working correctly with awaitMessageComponent is so maisntream.
module.exports = {
	name: 'interactionCreate',
	once: false,
	async run (interaction) {

		if (!interaction.inGuild()) return;
		if (!interaction.isButton()) return;

		await interaction.deferReply({ ephemeral: true, fetchReply: true });
		
		if (interaction.guild.ownerId == interaction.member.user.id){
			
			if (interaction.customId == "forgetmeproceed"){
				await interaction.editReply({
					content: 'Okay! Thanks for using Trophy Bot. See ya next time :)',
				});

				await forgetMe(interaction.client, interaction.guild);
				return;
			}
			
			if (interaction.customId == "forgetmenope"){
				await interaction.editReply({
					content: 'Operation stopped',
				});
			}		
		}

		if (!interaction.replied){
			await interaction.editReply({
				content: 'Not replied',
			});
		}
		
	}
	
	
};