/*
This window should be called whenever a /show command is used and the filter returns more than one results
*/

const { EmbedBuilder, parseEmoji, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { color } = require("../commons/statics");
const Database = require('../commons/database');
const { getDedication } = require("../globals");

class SelectionWindow {
	constructor(interaction, filter, list){
		this.interaction = interaction;
		this.user = interaction.user;
		this.list = list;
		this.filter = filter; 
		this.id = interaction.id;

		this.run();
	}	

	async run(){

		const listString = this.list.map(t => {
			return `${t.emoji} ${t.name}`
		});

		const opts = this.list.map(t => {
			return new StringSelectMenuOptionBuilder()
				.setDescription(`ID: ${t.id}`)
				.setEmoji(parseEmoji(t.emoji))
				.setLabel(t.name)
				.setValue(`${t.id}`)
				.setDefault(false);
		});

		const selector = new StringSelectMenuBuilder()
			.addOptions(opts)
			.setMinValues(1)
			.setMaxValues(1)
			.setCustomId(this.id)
			.setPlaceholder(`Choose a trophy`);

		const row = new ActionRowBuilder({ components: [ selector ] })
		const embed = new EmbedBuilder();
		
		embed.setColor(color.main);
		embed.setTitle(`:mag: Looking for '${this.filter}'`);
		embed.setDescription(`_At least **${this.list.length}** trophies have been found that meet your criteria_`);
		embed.addFields({
			name: `Select Trophy`,
			value: listString.join('\n')
		});

		await this.interaction.editReply({
			embeds: [ embed ],
			components: [ row ]
		});

		this.expect();
	}

	async expect(){
		const filter = (interaction) => interaction.customId === this.id && interaction.user.id === this.user.id;

		this.interaction.channel.awaitMessageComponent({ filter, time: 15_000 })
			.then(async interaction => {
				const result = await Database.findTrophy(interaction.guild.id, parseInt(interaction.values[0]), true);

				const trophy = (result ? result[0] : null);
				if (!trophy){
					const embed = await Utils.getError(guild, "error_generic_trophy_not_found", { filter });
					return interaction.editReply({ embeds: [embed] });
				}
				
				const imageURL = (trophy.image || process.env.TROPHY_DEFAULT_IMAGE);
				const embed = new EmbedBuilder();

				embed.setURL(`https://www.youtube.com/watch?v=04854XqcfCY`);
				embed.setColor(color.main);
				embed.setTitle(`${trophy.emoji} ${trophy.name}`);
				embed.setImage(imageURL);
				embed.setDescription(`${trophy.description}`);
				embed.addFields({ name: 'Value', value: `\u200b${trophy.value} :medal:`, inline: true });
				embed.setFooter({
					text: `ID: ${trophy.id}`,
				});
				
				if (trophy.signed)
					embed.addFields({ name: 'Signed by', value: `\u200b<@${trophy.creator}>`, inline: true });

				if (trophy?.dedication?.name){
					const dedic = await getDedication(interaction.guild, trophy.dedication);

					if (dedic) 
						embed.addFields({ name: 'Dedicated to', value: `\u200b${dedic}`, inline: true });
				}

				this.interaction.editReply({
					embeds: [embed],
					components: []
				});
			})
			.catch((e) => {
				this.interaction.editReply({
					components: []
				});
			});
	}
}

module.exports = SelectionWindow;