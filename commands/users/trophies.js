const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Database = require('../../commons/database');
const Utils = require('../../commons/utils');
const { color, emoji } = require('../../commons/statics');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trophies')
		.setDescription('See a list of trophies.')
		.addSubcommand(subcommand => subcommand
			.setName('user')
			.setDescription('Show the trophies any user has.')
			.addUserOption(option => option.setName('user').setDescription('User to check trophies').setRequired(false))
			.addIntegerOption(option => option.setName('page').setDescription('Page to look at').setRequired(false))
		)
		.addSubcommand(subcommand => subcommand
			.setName('server')
			.setDescription('Show the trophies the server has.')
			.addIntegerOption(option => option.setName('page').setDescription('Page to look at').setRequired(false))
		),

	async run (interaction) {

		const guild = interaction.guild.id;
		const subcommand = interaction.options?.getSubcommand();

		/*
		if (subcommand === 'user'){

			const user = interaction.options?.get('user')?.value || interaction.user.id;
			const page = Math.floor(Math.max(interaction.options?.get('page')?.value || 1, 1));

			const score = client.db.guilds.get(`data.${guild}.users.${user}.trophyValue`) || 0;

			const trophies = client.db.guilds.get(`data.${guild}.users.${user}.trophies`) || [];
			const trophyList = {};
			const trophyInventory = {};

			for (const trophy of trophies){
				const object = client.db.guilds.get(`data.${guild}.trophies.${trophy}`);
				if (object){
					trophyList[trophy] = object;
					
					if (trophyInventory[trophy] === undefined) trophyInventory[trophy] = { id: trophy, value: object.value, count: 0 };
					trophyInventory[trophy].count += 1;
				}
			}

			const userObject = await parseUser(client, user, interaction.user.username, interaction.guild, true);
			const username = userObject.username;

			const sorted = new Collection(Object.entries(trophyInventory)).sort(
				(a, b) => {
					return b.value - a.value;
				}
			);

			const entries = sorted.map(x => x.id);

			let trophyInvList = [];
			for (const trophy of entries){
				let name = trophyList[trophy].name;
				let value = trophyList[trophy].value;
				let count = trophyInventory[trophy].count;
				const trophyEmoji = trophyList[trophy].emoji;

				if (value > 0){
					value = `+${value}`;
				}

				trophyInvList.push(`${trophyEmoji} ${name} ${(value != 0 ? `**${value}** ` : ``)}_x${count}_`);
			}
			
			const pages = getPage(trophyInvList, 10, page);

			embed.setColor(color.main);
			embed.setTitle(`${emoji.trophy} ${username}'s Trophies`);

			embed.setDescription(`Total score: **${score}** :medal:`);
			embed.addFields({ name: 'Trophies', value: pages.list.length ? pages.list.join('\n') : 'No trophies yet.' });

			embed.setFooter({ 
				text: `Page ${pages.page} of ${pages.last}`,
			});

			return interaction.editReply({
				embeds: [embed]
			});
		}*/

		if (subcommand === 'user'){
			
			const user = interaction.options?.get('user')?.value || interaction.user.id;
			const page = Math.floor(Math.max(interaction.options?.get('page')?.value || 1, 1));

			const { items, currentpage, pagecount, count, total } = await Database.getTrophyUserList(guild, user, page);

			const list = [];
			for (const trophy of items){
				const v = Utils.formatValue(trophy.value);
				const valueString = (trophy.value != 0 ? ` · **(${v})**` : ``);

				list.push(`${trophy.emoji} ${trophy.name}${valueString}`);
			}

			const name = await Utils.getUserNameByID(interaction.client, user);
			const embed = new EmbedBuilder();

			embed.setColor(color.main);
			embed.setTitle(`${emoji.trophy} ${name}'s Trophies`);
			embed.addFields({ name: 'List of Trophies', value: (total > 0 ? list.join('\n') : 'No trophies yet :c') });

			embed.setFooter({ 
				text: `Page ${currentpage} of ${pagecount}`,
			});

			return interaction.editReply({
				embeds: [embed]
			});
		}
		
		if (subcommand === 'server'){

			const page = Math.floor(Math.max(interaction.options?.get('page')?.value || 1, 1));
			const { items, currentpage, pagecount, count } = await Database.getTrophyList(guild, page);

			const list = [];
			for (const trophy of items){
				const v = Utils.formatValue(trophy.value);
				const valueString = (trophy.value != 0 ? ` · **(${v})**` : ``);

				list.push(`${trophy.emoji} ${trophy.name}${valueString}`);
			}

			const embed = new EmbedBuilder();

			embed.setColor(color.main);
			embed.setTitle(`${emoji.trophy} Server Trophies`);
			embed.setDescription(`_**${count}** trophies created_`);
			embed.addFields({ name: 'List of Trophies', value: (count > 0 ? list.join('\n') : 'No trophies yet :c') });

			embed.setFooter({ 
				text: `Page ${currentpage} of ${pagecount}`,
			});

			return interaction.editReply({
				embeds: [embed]
			});

			/*
			const permroles = client.db.guilds.get(`data.${guild.id}.permissions.manage_trophies`) ?? [];
			const roles = interaction.member.roles.cache.map(role => role.id);
			
			const isAdmin = (await client.channels.fetch(interaction.channelId)).permissionsFor(interaction.member).toArray().includes('ADMINISTRATOR');
			const isPerm = anyIn(permroles, roles);
			const setting = (getSetting(client, guild, `hide_unused_trophies`) == 0);
		
			const hideUnusedTrophies = ((!isPerm && !isAdmin) && setting);

			const users = client.db.guilds.get(`data.${guild}.users`);

			const afterHidden = sorted.filter(trophy => {
				if (!hideUnusedTrophies) return true;
				for (const user in users){
					if (users[user].trophies.includes(trophy)) return true;
				}
				return false;
			});

			const list = [];
			for (const item of afterHidden){
				let name = object[item].name;
				let value = object[item].value;
				let emoj = object[item].emoji;

				if (value > 0){
					value = `+${value}`;
				}

			list.push(`${emoj} ${name} ${(value != 0 ? `**${value}**` : ``)}`);
			}
	
			const pages = getPage(list, 10, page);

			embed.setColor(color.main);
			embed.setTitle(`${emoji.trophy} Server Trophies`);

			embed.setDescription(`Total trophies created: **${trophies.length}**`);
			embed.addFields({ name: 'Trophies', value: pages.list.length ? pages.list.join('\n') : 'No trophies yet.' });

			embed.setFooter({ 
				text: `Page ${pages.page} of ${pages.last}`,
			});

			return interaction.editReply({
				embeds: [embed]
			});
			*/
		}
	}
}