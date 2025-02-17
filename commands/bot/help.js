const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color } = require('../../commons/statics.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Stop it! Get some help!'),

	async run (interaction) {

		const embed = new EmbedBuilder();
		
		embed.setColor(color.main);
		embed.setTitle(`How to trophies 101`);

		embed.setDescription(`You can create new trophies with **/create <name>**\nFor this, the command perpetrator needs the \`manage trophies\` permission.\n\nTo award a trophy to an user, use **/award <name or id> <user>**\nFor this, the command perpetrator needs the \`manage users\` permission.\n\nThe beforementioned permissions can be assigned and removed from roles with **/permissions (add|remove) <permission> <role>**, you'll need Discord's manage guild permission for this to work\n` +
			`Along with these commands, you can also use the following commands:\n` +
			`**/delete <name>** Deletes a trophy\n` +
			`**/edit <name>** Edits some details from a trophy\n` +
			`**/revoke <name> <user>** Revokes a trophy from any user\n` +
			`**/trophies** Lists all trophies, from one user or for the whole guild\n` +
			`**/leaderboard** See the leaderboard\n` +
			`**/settings** Change server settings for the bot\n` +
			`**/rewards** Modify role rewards (bot needs manage roles in order to work)\n` +
			`And a few more...`
		);
	

		return interaction.editReply({
			embeds: [embed]
		});
	}
}