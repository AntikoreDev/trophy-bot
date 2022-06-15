const { getServer, anyIn, color, emoji, isDev, AttemptToFetchUsers } = require("../globals");
const Discord = require("discord.js");

// Note from the developer, I hate interactions and the whole slash command system.
module.exports = {
	name: 'interactionCreate',
	once: false,
	async run (interaction) {

		if (!interaction.inGuild()) return; 

		const client = interaction.client;
		const guild = interaction.guild;

		const commandName = interaction.commandName;
		
		const data = await getServer(client, guild.id, guild);

		// Fetch how many users is the bot serving
		await AttemptToFetchUsers(client);

		// If it's not a command, then WHY the heck is it here?
		if (!interaction.isCommand()) return;

		if (!client.commands) return;

		const command = client.commands.get(commandName);
		const user = await interaction.member.fetch();

		const embed = new Discord.MessageEmbed();

		if (!command) return;

		// Get roles from the user
		const roles = user.roles.cache.map(role => role.id);
		const isAdmin = (await client.channels.fetch(interaction.channelId)).permissionsFor(interaction.member).toArray().includes('ADMINISTRATOR');

		if (command.permissions && !(isAdmin || isDev(interaction.user.id))) {
			for (const perm of command.permissions){
				const permroles = client.db.guilds.get(`data.${guild.id}.permissions.${perm}`, []);
				if (!anyIn(permroles, roles)) {

					embed.setColor(color.error);
					embed.setDescription(`${emoji.error} You do not have permission to use this command.\nYou need the \`${perm}\` custom permission.`);
					embed.setFooter({ text: `You can change which roles have these permissions with the command /permissions` });

					return interaction.reply({
						embeds: [embed]
					});
				}
			}
		}

		if (!client.db.bot.has(`data.commands.${commandName}`)) client.db.bot.set(`data.commands.${commandName}`, 0);

		client.db.bot.add(`data.commands.${commandName}`, 1);
		client.db.bot.add(`data.commands.total`, 1);

		try {
			await command.run(interaction);
		} catch (error) {
			console.error(error);
		
			if (client.errorChannel !== null){
				try {
	
					const stack = error.stack.slice(0, 900) + "...";
					
					const embed = new Discord.MessageEmbed();
					embed.setTitle(`${emoji.error} Error Log`);
					embed.setColor(color.error);
					embed.setDescription(`**Command:** \`${interaction.toString()}\`\n**Perpetrator:** \`${interaction.user.id}\`\n**Guild:** \`${interaction.guild.id}\``);
					embed.addField(`Stacktrace`, `\`\`\`js\n${stack}\`\`\``);
	
					client.errorChannel.send({
						embeds: [embed]
					});
				}
				catch(err){
					console.log(err);
					interaction.channel.send(`Error log could not be sent, dev should know about this...`);
				}
			}

			if (!interaction) return;

			if (interaction.deferred || interaction.replied)
				await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true, embeds: [] });
			else
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}	
	}
}