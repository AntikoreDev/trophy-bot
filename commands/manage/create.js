const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji: emojis } = require('../../commons/statics');

const Database = require('../../commons/database');
const { Trophies } = require('../../commons/models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDefaultMemberPermissions("32")
		.setDescription('Create a new trophy for your server.')
		.addStringOption(option => option.setName('name').setDescription('The name of the trophy.').setRequired(true))
		.addStringOption(option => option.setName('description').setDescription('Description for the trophy').setRequired(false))
		.addStringOption(option => option.setName('emoji').setDescription('An emoji for the trophy, leave blank for default').setRequired(false))
		.addNumberOption(option => option.setName('value').setDescription('How much this trophy values. Defaults to 10').setRequired(false))
		.addStringOption(option => option.setName('dedication').setDescription('Dedicate the trophy to someone, defaults to no one. You can use an id or mention as well').setRequired(false))
		.addBooleanOption(option => option.setName('signed').setDescription('If true, you\'ll sign this trophy as created by you. Defaults to false').setRequired(false))
		.addBooleanOption(option => option.setName('tradeable').setDescription('If true, people can trade this trophy with other user').setRequired(false))
		.addStringOption(option => option.setName('image').setDescription('The image for the trophy, only seen on showcase command').setRequired(false))
		.addStringOption(option => option.setName('details').setDescription("Private details for the trophy, you can set why do you give the trophy here.").setRequired(false)),

	async run (interaction) {

		const client = interaction.client;
		const guild = interaction.guild.id;

		const trophyCount = await Database.getGuildTrophyCount(guild);
		
		// This will prevent users on making A LOT of trophies so my database will die and my money too. I'll think on increasing the limit somehow.
		if (trophyCount >= process.env.MAX_TROPHIES){
			
			const embed = new EmbedBuilder()
				.setColor(color.error)
				.setDescription(`You have reached the limit of 150 trophies per guild :(`);
				
			return interaction.editReply({
				embeds: [embed]
			})
		}

		const def = {
			name: (interaction.options?.get('name')?.value ?? 'New Trophy'),
			desc: (interaction.options?.get('description')?.value ?? 'No description provided'),
			emoji: interaction.options?.get('emoji')?.value,
			value: interaction.options?.get('value')?.value,
			image: interaction.options?.get('image')?.value,
			dedication: interaction.options?.get('dedication')?.value,
			signed: interaction.options?.get('signed')?.value,
			tradeable: interaction.options?.get('tradeable')?.value,
			details: interaction.options?.get('details')?.value
		};

		const embed = new EmbedBuilder();

		// Error handling
		// If name is too long
		if (def.name.length > 32){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The name of the trophy is too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If details are too long
		if (def.details && def.details.length > 300){
			embed.setColor(color.error);
			embed.setDescription(("The details are too long"));

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If desc is too long
		if (def.desc && def.desc.length > 128){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The description of the trophy is too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If emoji is too long
		if (def.emoji && def.emoji.length > 64){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The emoji of the trophy is too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If value is too big or too small
		if (def.value > 999999 || def.value < -999999){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The value of the trophy is ${value > 0 ? `too big` : `too small`}.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		// If the dedication is too long
		if (def.dedic && def.dedic.length > 32){
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} The dedication of the trophy is too long.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}
	
		let dedication = undefined;

		/*
		// If there is a dedicated user, set it, else, ignore it
		if (def.dedic){

			// Try to parse the string as an user
			const dedicUser = await parseUser(client, def.dedic.trim(), null, guild, true);

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
					user: "",
					name: "",
				}
			}
		}
		*/
	
		const next = await Database.getNextTrophyID(guild);
		const trophy = {
			id: next,
			guild: guild,

			creator: interaction.user.id,

			name: def.name,
			description: def.desc,
			emoji: def.emoji,
			value: def.value,
			image: def.image,
			dedication: def.dedication,
			details: def.details,
			tradeable: def.tradeable,
			signed: def.signed
		};

		let doc = null;
		try {
			const result = await Trophies.insertMany(trophy);
			if (!result.length)
				throw new Error();

			doc = result[0];

		} catch (e) {
			embed.setColor(color.error);
			embed.setDescription(`${emojis.error} Couldn't create trophy sucessfully despite being valid. Ask the developer for this.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		embed.setColor(color.success);
		embed.setTitle(`${emojis.success} Sucessfully created trophy!`);
		embed.setDescription(`${doc.emoji} **${doc.name}**\n${doc.description}`);
		embed.addFields({ name: 'Value', value: `\u200b${doc.value} :medal:`, inline: true });

		if (doc.image)
			embed.setImage(doc.image);
		
		if (doc.signed)
			embed.addFields({ name: `Signed by`, value: `<@${doc.creator}>`, inline: true });

		if (doc?.dedication?.name)
			embed.addFields({ name: `Dedicated to`, value: doc.dedication.name, inline: true });

		embed.setFooter({ text: `ID: ${doc.id}` });

		interaction.editReply({
			embeds: [embed],
		});
	},
};