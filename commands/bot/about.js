const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color } = require('../../globals');
const Locale = require('../../commons/locale.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Who am I? Who are you? Questions never asked.'),
		
	async run (interaction) {

		const github = `https://github.com/AntikoreDev/trophy-bot`;
		const kofi = `https://ko-fi.com/antikore`;
		const server = `https://discord.gg/kNmgU44xgU`;
		const author = "`@antikore`";

		const locale = {
			title: await Locale.getLocalisedString(interaction.guild.id, "command_about_title"),
			desc: await Locale.getLocalisedString(interaction.guild.id, "command_about_desc"),
			desc2: await Locale.getLocalisedString(interaction.guild.id, "command_about_desc2", { cmd: "`/help`"}),
			github: await Locale.getLocalisedString(interaction.guild.id, "command_about_github", { link: github }),
			kofi: await Locale.getLocalisedString(interaction.guild.id, "command_about_kofi", { link: kofi }),
			server: await Locale.getLocalisedString(interaction.guild.id, "command_about_support", { link: server }),
			author: await Locale.getLocalisedString(interaction.guild.id, "command_about_author", { user: author })
		}

		const embed = new EmbedBuilder();

		embed.setTitle(`${locale.title} :trophy:`);
		embed.setDescription(
			`${locale.desc}\n` +
			`${locale.desc2}\n\n` +
			`${locale.github} \n` +
			`${locale.kofi}\n` +
			`${locale.server}\n\n` +
			`${locale.author}`
		);

		embed.setThumbnail(interaction.client.user.displayAvatarURL());
		embed.setColor(color.main);

		return interaction.editReply({
			embeds: [embed]
		});
	},
};