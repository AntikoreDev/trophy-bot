const { SlashCommandBuilder } = require('@discordjs/builders');
const { color, emoji, settings, parseName, checkName } = require('../../globals');
const Discord = require('discord.js');

const available = settings.map(n => n.id);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDefaultMemberPermissions("32")
		.setDescription('Modify the server settings for the bot.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('set')
				.setDescription('Change a setting for the server.')
				.addStringOption(option => option.setName('setting').setDescription('Which setting you want to change.').setRequired(true).addChoices(
					...settings.map(n => ({ name: n.name, value: n.id })),
				))
				.addStringOption(option => option.setName('value').setDescription('The value you want to set the setting to. Defaults to setting default').setRequired(false))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all settings of the server')
		),
					
	async run (interaction){

		const embed = new Discord.MessageEmbed();

		const client = interaction.client;
		const guild = interaction.guild.id;

		const subcommand = interaction.options.getSubcommand();
		if (subcommand == 'list'){

			let text = [];
			const dbsettings = client.db.guilds.get(`data.${guild}.settings`);
			for (const stg of available){
				const setting = settings.find(n => n.id == stg);

				const name = setting.name;
				const description = setting.description;
				const options = setting.options;

				const value = dbsettings?.[setting.id] ?? setting.default;
				const parsed = setting.options[value];

				text.push(
					`**${name}:** ${parsed}\n` +
					`*${description}*\n` +
					`**Options:** \`${options.join('`, `')}\`\n\n`
				);
			}

			embed.setColor(color.main);
			embed.setTitle(`:gear: ${interaction?.guild?.name ?? 'Server'}'s Settings`);
			embed.setDescription(text.join(' '));
			embed.setFooter({ text: `Use /settings set <setting> <value> to change a setting.` });

			return interaction.editReply({
				embeds: [embed]
			});			
		}

		else if (subcommand == 'set'){

			const setting = interaction.options.get('setting')?.value || null;
			if (!setting && !available.includes(setting)){
				embed.setColor(color.error);
				embed.setDescription(`${emoji.error} You must specify a setting to change.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			const object = settings.find(n => n.id == setting);
			const value = (interaction.options.get('value')?.value) ?? (object.default + 1);

			const key = await findOption(object, value);
			if (key != null){
				
				client.db.guilds.set(`data.${guild}.settings.${setting}`, key);

				embed.setColor(color.success);
				embed.setDescription(`${emoji.success} Setting **${object.name}** changed to **${object.options[key]}**.`);

			}else{

				embed.setColor(color.error);
				embed.setDescription(`${emoji.error} You must specify a valid option for this setting.`);

			}

			return interaction.editReply({
				embeds: [embed]
			});
		}
	}
}

async function findOption(object, value){

	const isNumber = !Number.isNaN(parseInt(value));
	if (isNumber){
		const n = parseInt(value) - 1;
		const exists = n < object.options.length && n >= 0;
		if (exists){			
			return n;
		}
	}

	const name = parseName(value.toString());
	const key = object.options.findIndex(n => checkName(name, parseName(n)));

	if (key != null && key >= 0) return key;

	return null;
}