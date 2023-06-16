const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji: emojis, parseUser, getTrophy, downloadImage } = require('../../globals');

module.exports = {
	permissions: ['manage_trophies'],
	data: new SlashCommandBuilder()
		.setName('edit')
		.setDefaultMemberPermissions("32")
		.setDescription('Edit an existing trophy for your server.')
		.addStringOption(option => option.setName('trophy').setDescription('The trophy to be edited').setRequired(true))
		.addStringOption(option => option.setName('name').setDescription('The new name of the trophy.').setRequired(false))
		.addStringOption(option => option.setName('description').setDescription('The new description for the trophy').setRequired(false))
		.addStringOption(option => option.setName('emoji').setDescription('A new emoji for the trophy, leave blank for default').setRequired(false))
		.addStringOption(option => option.setName('dedication').setDescription('A new dedication for the trophy').setRequired(false))
		.addStringOption(option => option.setName('details').setDescription('A new details text for the trophy').setRequired(false))
		.addBooleanOption(option => option.setName('tradeable').setDescription('A new tradeability status for the trophy').setRequired(false))
		.addAttachmentOption(option => option.setName('image').setDescription('A new image for the trophy').setRequired(false)),
		
	async run (interaction) {

		const embed = new EmbedBuilder();
		
		const client = interaction.client;
		const guild = interaction.guild.id;

		const trophy = interaction.options?.get('trophy')?.value || null;
		const id = await getTrophy(client, guild, trophy);

		if (!id){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} No trophies found for that name/id to edit.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		const current = client.db.guilds.get(`data.${guild}.trophies.${id}`);

		const value = current.value;
		const signed = current.signed;
		const creator = current.creator;
		const created = current.created;

		const name = interaction.options?.get('name')?.value || current.name;
		const desc = interaction.options?.get('description')?.value || current.description;
		const emoji = interaction.options?.get('emoji')?.value || current.emoji;
		// const value = interaction.options?.get('value')?.value || current.value;
		const image = interaction.options?.getAttachment('image')?.url || current.image;
		const dedic = interaction.options?.get('dedication')?.value || null;
		const tradeable = interaction.options?.get('tradeable')?.value ?? false;
		const details = interaction.options?.get('details')?.value || current.details || "No details provided.";

				// Error handling
		// If name is too long
		if (name.length > 32){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The name of the trophy is too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If desc is too long
		if (details.length > 300){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The details of the trophy are too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If desc is too long
		if (desc.length > 128){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The description of the trophy is too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If emoji is too long
		if (emoji.length > 64){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The emoji of the trophy is too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If the dedication is too long
		if (dedic && dedic.length > 32){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The dedication of the trophy is too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		let dedication = current.dedication;

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

		let changes = [];
		if (name != current.name) 			changes.push(`**Name:** ${current.name} > ${name}`);
		if (desc != current.description) 	changes.push(`**Description:** ${current.description} > ${desc}`);
		if (emoji != current.emoji) 		changes.push(`**Emoji:** ${current.emoji} > ${emoji}`);
		// if (value != current.value) 		changes.push(`**Value:** ${current.value} > ${value}`);
		if (dedic) 							changes.push(`**Dedication:** ${current.dedication.name ? current.dedication.name : `No dedication`} > ${dedication.name}`);
		if (tradeable != current.tradeable) changes.push(`**Tradeability:** ${current.tradeable} > ${tradeable}`);
		if (details != current.details) 	changes.push(`**Details changed**`);
		if (image != current.image) 		changes.push(`**Changed image**`);

		if (!changes.length){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} No changes were made to **${current}**`);

			return interaction.editReply({
				embeds: [embed]	
			});
		}
		
		let extension = null;
		if (image)
		 	extension = image.split('.').pop();
		if (image != current.image) {
			if (!(['png', 'jpg', 'jpeg', 'gif'].includes(extension))) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(color.error)
							.setDescription(`${emojis.error} The image must be a png, gif, jpg or jpeg.`)
					]
				});
			}

			if (image.size > 1000000){
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(color.error)
							.setDescription(`${emojis.error} The image must not be larger than \`1 MB\``)
					]
				});
			}
			
			await downloadImage(image, `./images/${guild}_${id}.${extension}`);
		}
		
		client.db.guilds.set(`data.${guild}.trophies.${id}`, {
			creator,
			created,
			name,
			description: desc,
			emoji,
			value,
			image: image,
			dedication,
			details,
			signed,
			tradeable
		});

		embed.setColor(color.main);
		embed.setDescription(`${emojis.success} **${current.name}** was edited successfully!`);
		embed.addFields({ name: `Changes`, value: changes.join('\n') });

		interaction.editReply({
			embeds: [embed]
		});
	},
};
