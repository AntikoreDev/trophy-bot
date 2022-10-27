const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { color, } = require('../../globals');

/*
const permissions = [
	'manageusers',
	'managetrophies',
	'managerewards'
];
*/

module.exports = {
	data: new SlashCommandBuilder()
		.setName('permissions')
		.setDefaultMemberPermissions("32")
		.setDescription('Modify the permissions of a role.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add permissions to a role.')
				.addStringOption(option => option.setName('permission').setDescription('Which permission you want to add.').setRequired(true).addChoices(
					{ name: 'Manage Users', value: 'manageusers' },
					{ name: 'Manage Trophies', value: 'managetrophies' },
					{ name: 'Manage Rewards', value: 'managerewards' },
				))
				.addRoleOption(option => option.setName('target').setDescription('Which role you want to add permissions to.').setRequired(true))
		)		
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove permissions from a role.')
				.addStringOption(option => option.setName('permission').setDescription('Which permission you want to add.').setRequired(true).addChoices(
					{ name: 'Manage Users', value: 'manageusers' },
					{ name: 'Manage Trophies', value: 'managetrophies' },
					{ name: 'Manage Rewards', value: 'managerewards' },
				))
				.addRoleOption(option => option.setName('target').setDescription('Which role you want to add permissions to.').setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all permissions.')
		),

	async run (interaction) {

		const embed = new EmbedBuilder()
			.setColor(color.error)
			.setTitle(":warning: Caution!")
			.setDescription(`Custom permission system has been deprecated as Discord already supports custom permissions.\nRefer to [Slash Commands Permissions](https://discord.com/blog/slash-commands-permissions-discord-apps-bots)\nIf you didn't notice this change yet, all bot commands have been disabled until you run \`/imsafe\` after you set the correct permissions.\n**If you don't change the permissions with Discord permission system with adequate ones, and you run that command, every command that used this system will be available for everyone, beware!**\n\nAgain, my apologies as I didn't know about that feature when I was making the bot. After setting permissions through Discord itself and running \`/imsafe\` everything will go back to normal.\n\nAny additional help you need on this, you can ask on our [Support Server](https://discord.gg/kNmgU44xgU)`)

		interaction.editReply({
			embeds: [embed]
		})

		return;

		/*
		const embed = new Discord.MessageEmbed();

		const client = interaction.client;
		const guild = interaction.guild.id;

		const subcommand = interaction.options.getSubcommand();
		const dbperms = await client.db.guilds.get(`data.${guild}.permissions`);

		if (subcommand === 'list'){
			
			const manageUsers = (dbperms?.manage_users || []).map(n => `<@&${n}>`);
			const manageTrophies = (dbperms?.manage_trophies || []).map(n => `<@&${n}>`);
			const manageRewards = (dbperms?.manage_rewards || []).map(n => `<@&${n}>`);

			embed.setTitle('List of permissions');
			embed.setColor(color.main);
			embed.addField(`Manage Users`, manageUsers.length ? manageUsers.join(', ') : 'No permissions yet', true);
			embed.addField(`Manage Trophies`, manageTrophies.length ? manageTrophies.join(', ') : 'No permissions yet', true);
			embed.addField(`Manage Rewards`, manageRewards.length ? manageRewards.join(', ') : 'No permissions yet', true);

			return interaction.editReply({
				embeds: [embed]
			});	
		}

		const target = interaction.options?.get('target')?.value || null;
		const permission = interaction.options?.get('permission')?.value || null;
		
		const perm = await parseName(permission);

		if (checkName(perm, 'manageusers')){

			if (subcommand == 'add'){		

				if (dbperms.manage_users.includes(target)){
				
					embed.setColor(color.error);
					embed.setDescription(`${emoji.error} This role already has the permission \`${permission}\``);
	
					return interaction.editReply({
						embeds: [embed]
					});
				}

				dbperms.manage_users.push(target);
			}else{

				if (!dbperms.manage_users.includes(target)){
				
					embed.setColor(color.error);
					embed.setDescription(`${emoji.error} This role doesn't have permission \`${permission}\``);
	
					return interaction.editReply({
						embeds: [embed]
					});
				}

				dbperms.manage_users.splice(dbperms.manage_users.indexOf(target), 1);
			}
				
		}

		else if (checkName(perm, 'managetrophies')){
			

			if (subcommand == 'add'){		
					
				if (dbperms.manage_trophies.includes(target)){
				
					embed.setColor(color.error);
					embed.setDescription(`${emoji.error} This role already has the permission \`${permission}\``);
	
					return interaction.editReply({
						embeds: [embed]
					});
				}

				dbperms.manage_trophies.push(target);
			}else{

				if (!dbperms.manage_trophies.includes(target)){
				
					embed.setColor(color.error);
					embed.setDescription(`${emoji.error} This role doesn't have permission \`${permission}\``);
	
					return interaction.editReply({
						embeds: [embed]
					});
				}

				dbperms.manage_trophies.splice(dbperms.manage_trophies.indexOf(target), 1);
			}

		}
		else if (checkName(perm, 'managerewards')){
		

			if (subcommand == 'add'){		
					
				if (dbperms.manage_rewards.includes(target)){
				
					embed.setColor(color.error);
					embed.setDescription(`${emoji.error} This role already has the permission \`${permission}\``);
	
					return interaction.editReply({
						embeds: [embed]
					});
				}

				dbperms.manage_rewards.push(target);
			}else{

				if (!dbperms.manage_rewards.includes(target)){
				
					embed.setColor(color.error);
					embed.setDescription(`${emoji.error} This role doesn't have permission \`${permission}\``);
	
					return interaction.editReply({
						embeds: [embed]
					});
				}

				dbperms.manage_rewards.splice(dbperms.manage_rewards.indexOf(target), 1);
			}
		}else{

			embed.setColor(color.error);
			embed.setDescription(`${emoji.error} Could not find a permission with the name \`${permission}\``);

			return interaction.editReply({
				embeds: [embed]
			});
		}

		await client.db.guilds.set(`data.${guild}.permissions`, dbperms);
		embed.setColor(color.success);
		embed.setDescription(`${emoji.success} Permission \`${permission}\` has been ${subcommand == 'add' ? 'added' : 'removed'} to role <@&${target}>`);

		return interaction.editReply({
			embeds: [embed]
		});
	*/
	}
}