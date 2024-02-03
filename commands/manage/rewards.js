const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, emoji: emojis, getPage } = require('../../globals');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rewards')
		.setDefaultMemberPermissions("32")
		.setDescription('Create a new trophy for your server.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add permissions to a role.')
				.addRoleOption(option => option.setName('role').setDescription('Which role you want to add as reward.').setRequired(true))
				.addIntegerOption(option => option.setName('requirement').setDescription('How much score the user will require to get this role.').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a role reward from your server.')
				.addRoleOption(option => option.setName('role').setDescription('Which role you want to remove from rewards').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('clear')
				.setDescription('Clears all rewards in this server.')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List of reward roles.')
				.addIntegerOption(option => option.setName('page').setDescription('Page to look at').setRequired(false))
		),

	async run (interaction) {

		const embed = new EmbedBuilder();

		const client = interaction.client;
		const guild = interaction.guild.id;
		const guildName = interaction.guild.name;

		const subcommand = interaction.options?.getSubcommand();
		if (!subcommand) return;

		if (subcommand === 'add'){
			
			const target = interaction.options?.get('role')?.value;
			const requirement = Math.floor(Math.max(interaction.options?.get('requirement')?.value || 0, 0));

			const role = interaction.guild.roles.cache.get(target);
			if (!role){
				
				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} Role \`${target}\` was not found.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			const check = interaction.guild.roles.comparePositions(role, interaction.member.roles.highest);

			// If check is higher than 0 and the user is not the owner, they can't add a role higher than their own
			if (check >= 0 && !interaction.guild.ownerId == interaction.user.id){

				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} You can't edit roles that are higher than your highest role.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			if (requirement < 1){
				
				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} Sorry, due to limitations, any reward role must have a requirement of at least **1**.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			const prev = client.db.guilds.get(`data.${guild}.rewards`, []) || [];
			if (prev.length > 20){
				
				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} Sorry, due to limitations, there can only be **20** reward roles per server.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			const dup = prev.filter(a => a.requirement === requirement || a.role === role);
			if (dup.length > 0){

				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} Sorry, there is already a reward role with the same requirement or for this exact role.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			prev.push({
				role: role.id,
				requirement: requirement
			});

			const sorted = prev.sort((a, b) => b.requirement - a.requirement);
			client.db.guilds.set(`data.${guild}.rewards`, sorted);

			embed.setColor(color.success);
			embed.setDescription(`${emojis.success} Reward role <@&${role.id}> has been added with a requirement of **${requirement}** :medal:.`);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		else if (subcommand === 'remove'){

			const target = interaction.options?.get('role')?.value;
			const role = interaction.guild.roles.cache.get(target);
			if (!role){
				
				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} Role \`${target}\` was not found.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			// If check is higher than 0 and the user is not the owner, they can't add a role higher than their own
			const check = interaction.guild.roles.comparePositions(role, interaction.member.roles.highest);
			if (check >= 0 && !interaction.guild.ownerId == interaction.user.id){

				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} You can't edit roles that are higher than your highest role.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			const prev = client.db.guilds.get(`data.${guild}.rewards`) || [];
			if (prev.length <= 0){
				
				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} There are not any reward roles set up yet.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			const found = prev.find(a => a.role === role.id);
			if (!found){
				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} Sorry, we couldn't find a reward role for <@&${role.id}>.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			const sorted = prev.filter(a => a.role !== role.id).sort(
				(a, b) => b.requirement - a.requirement
			);
			
			client.db.guilds.set(`data.${guild}.rewards`, sorted);

			embed.setColor(color.success);
			embed.setDescription(`${emojis.success} Reward role <@&${role.id}> has been removed sucessfully.`);
			embed.setFooter({ text: `You may manually remove people that got this role with the bot, as the bot won't remove it for you.` });

			return interaction.editReply({
				embeds: [embed]
			});
		}

		else if (subcommand === 'list'){

			const author = interaction.user;
			const score = client.db.guilds.get(`data.${guild}.users.${author.id}.trophyValue`) ?? 0;

			const page = interaction.options?.get('page')?.value || 1;
			
			const list = client.db.guilds.get(`data.${guild}.rewards`, []) || [];
			let string = [];
			for (const reward of list){
				const role = reward.role;
				const requirement = reward.requirement;

				string.push(`**:medal: ${requirement}**\n<@&${role}>\n`);
			}

			const pages = getPage(string, 5, page);
			
			embed.setColor(color.main);
			embed.setDescription(`**Your score:** ${score} :medal:`);
			
			embed.setTitle(`${guildName}'s Role Rewards`);
			embed.addFields({ name: `Rewards`, value: `\u200b` + pages.list.join(`\n`) });
			
			return interaction.editReply({
				embeds: [embed]
			});
		}

		else if (subcommand === 'clear'){

			const prev = client.db.guilds.get(`data.${guild}.rewards`, []) ?? [];
			if (prev.length <= 0){
				
				embed.setColor(color.error);
				embed.setDescription(`${emojis.error} There are not any reward roles set up yet.`);

				return interaction.editReply({
					embeds: [embed]
				});
			}

			client.db.guilds.set(`data.${guild}.rewards`, []);

			embed.setColor(color.success);
			embed.setDescription(`${emojis.success} All reward roles have been removed sucessfully.`);
			
			return interaction.editReply({
				embeds: [embed]
			})
		}
	}
}