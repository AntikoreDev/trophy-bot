const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

const { color } = require('../../commons/statics');
const Utils = require('../../commons/utils');
const Database = require('../../commons/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('language')
		.setDefaultMemberPermissions("32")
		.setDescription('Set this server\'s language for the bot')
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List of available languages')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('Set the language of your server')
				.addStringOption(option => option.setName('language').setDescription('Name of the preferred language').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Support the bot by adding more languages')
		),

	async run (interaction) {

		const embed = new EmbedBuilder();

		const client = interaction.client;
		const guild = interaction.guild.id;
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'list'){

			const current = await Database.getGuildLanguage(guild);
			
			embed.setColor(color.main);
			embed.setTitle(`:globe_with_meridians: Supported Languages`);
			embed.setDescription(`The following languages are available for the bot to use.`);
			
			const list = client.languages.sort((a, b) => a.names[0].localeCompare(b.names[0]));
			const str = list.map(l => `${l.icon} **${l.names[0]}**`).join('\n');

			embed.addFields(
				{ name: `List of languages`, value: (str.length > 0 ? str : 'No languages available') },
				{ name: `\u000b`, value: `Your current language is ${Utils.formatLanguage(Utils.getLanguageByID(client, current))}` }
			);

			if (!interaction) return;
			return interaction.editReply({
				embeds: [embed]
			});
		}

		if (subcommand === 'set'){
			const filter = (interaction.options?.get('language')?.value).toLowerCase().trim();

			const languages = client.languages.filter((lang) => {
				const langs = lang.names.filter((name) => name.toLowerCase().trim().includes(filter));
				return (langs.length > 0);
			});

			if (languages.size <= 0){
				const embed = await Utils.getError(guild, "error_language_not_found", { filter });
				return interaction.editReply({ embeds: [embed] });
			}

			const language = languages.first();
			const code = language.id;

			await Database.updateGuildLanguage(guild, code);

			const embed = await Utils.getSuccess(guild, "success_language_changed", { language: Utils.formatLanguage(language) });
			return interaction.editReply({ embeds: [embed] });
		}

		if (subcommand === 'add'){

			const githubLink = "https://github.com/AntikoreDev/trophy-bot";
			const infoLink = "https://github.com/AntikoreDev/trophy-bot/blob/main/locale/README.md";

			embed.setColor(color.main);
			embed.setTitle(`:globe_with_meridians: Not your language?`);
			embed.setDescription(`You can help adding new languages to the bot on [Github](${githubLink}). See [Localization guidelines](${infoLink}) for more information.`);

			if (!interaction) return;
			return interaction.editReply({
				embeds: [embed]
			});
			
		}
	}
}

