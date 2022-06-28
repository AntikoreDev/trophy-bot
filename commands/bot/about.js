const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Who am I? Who are you? Questions never asked.'),
		
	async run (interaction) {

		const embed = new Discord.MessageEmbed();

		embed.setTitle(`About Trophy Bot :trophy:`);
		embed.setDescription(
			`This bot allows you to create, customize and award trophies to people in your server\nTo get started use **/help** for a few basic info and commands\n\n` +
			`You can find us on [Github](https://github.com/Aidanete/trophy-bot)\n` +
			`**Liking the bot?** Consider supporting us on [Ko-fi](https://ko-fi.com/antikore)\n` +
			`**Need help?** Join the [Support Server](https://discord.gg/kNmgU44xgU)\n\n` +
			`Bot created by *@Antikore#9357*`
		);

		embed.setThumbnail(interaction.client.user.displayAvatarURL());
		embed.setColor(color.main);

		return interaction.editReply({
			embeds: [embed]
		});
	},
};