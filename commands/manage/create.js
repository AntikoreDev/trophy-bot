const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { color, emoji: emojis, parseUser, downloadImage } = require('../../globals');

module.exports = {
	permissions: ['manage_trophies'],
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Create a new trophy for your server.')
		.addStringOption(option => option.setName('name').setDescription('The name of the trophy.').setRequired(true))
		.addStringOption(option => option.setName('description').setDescription('Description for the trophy').setRequired(false))
		.addStringOption(option => option.setName('emoji').setDescription('An emoji for the trophy, leave blank for default').setRequired(false))
		.addNumberOption(option => option.setName('value').setDescription('How much this trophy values. Defaults to 10').setRequired(false))
		.addStringOption(option => option.setName('dedication').setDescription('Dedicate the trophy to someone, defaults to no one. You can use an user ID as well').setRequired(false))
		.addAttachmentOption(option => option.setName('image').setDescription('The image for the trophy, only seen on showcase command').setRequired(false)),
		
	async run (interaction) {
		
		const client = interaction.client;
		const guild = interaction.guild.id;

		const name = interaction.options?.get('name')?.value || 'New Trophy';
		const desc = interaction.options?.get('description')?.value || 'No description provided';
		const emoji = interaction.options?.get('emoji')?.value || ':trophy:';
		const value = interaction.options?.get('value')?.value || 10;
		const image = interaction.options?.getAttachment('image')?.url || null;
		const dedic = interaction.options?.get('dedication')?.value || null;

		const embed = new Discord.MessageEmbed();

		embed.setColor(color.success);
		embed.setTitle(`${emojis.success} Sucessfully created trophy!`);
		embed.setDescription(`${emoji} **${name}**\n${desc}`);
		
		embed.addField('Value', `\u200b${value} :medal:`, true);
		
		
		let dedication = {}

		// If there is a dedicated user, set it, else, ignore it
		if (dedic){

			// Try to parse the string as an user
			const dedicUser = await parseUser(client, dedic.trim(), null, guild, true);

			// If there is an user parsed
			if (dedicUser){

				// Set the user as the dedication
				dedication = {
					user: dedicUser.id,
					name: dedicUser.username,
				}
			} else {

				// Set the string as the dedication
				dedication = {
					user: null,
					name: dedic,
				}
			}
		}
		

		client.db.guilds.add(`data.${guild}.trophies.current`, 1);
		const next = client.db.guilds.get(`data.${guild}.trophies.current`);
		
		client.db.guilds.set(`data.${guild}.trophies.${next}`, {
			name,
			description: desc,
			emoji,
			value,
			image: `${guild}_${next}.png`,
			dedication
		});

		if (image) {
			await downloadImage(image, `./images/${guild}_${next}.png`);
			embed.setImage(image);
		}

		embed.addField(`ID`, `\u200b${next}`, true);
		if (dedication.name){
			embed.addField(`Dedicated to`, dedication.name, true);
		}

		interaction.reply({
			embeds: [embed],
		});
	},
};