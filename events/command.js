const { getServer, anyIn, color, emoji, isDev, AttemptToFetchUsers, imsafeWarning } = require("../globals");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	once: false,
	async run (interaction) {

		if (!interaction.inGuild()) return;

		// If it's not a command, then WHY the heck is it here?
		if (!interaction.isCommand()) return;

		await interaction.deferReply();

		const client = interaction.client;
		const guild = interaction.guild;

		const commandName = interaction.commandName;
		
		const data = await getServer(client, guild.id, guild);

		// Fetch how many users is the bot serving
		AttemptToFetchUsers(client);

		if (!client.commands) return;

		const command = client.commands.get(commandName);
		const user = await interaction.member.fetch();

		const embed = new EmbedBuilder();

		if (!command) return;

		// Get roles from the user
		const roles = user.roles.cache.map(role => role.id);
		const isAdmin = (await client.channels.fetch(interaction.channelId)).permissionsFor(interaction.member).toArray().includes('ADMINISTRATOR');

		if (command.permissions && !isDev(interaction.user.id)) {
			const imsafe = client.db.guilds.get(`data.${guild.id}.imsafe`) ?? false;
			if (!imsafe){
				return await imsafeWarning(interaction);
			}
		}

		if (!client.db.bot.has(`data.commands.${commandName}`)) client.db.bot.set(`data.commands.${commandName}`, 0);

		client.db.bot.add(`data.commands.${commandName}`, 1);
		client.db.bot.add(`data.commands.total`, 1);

		try {
			await command.run(interaction);
		} catch (error) {
			console.error(error);
		
			// If the error channel exists, send a log with the issue
			if (client.errorChannel !== null){
				try {
	
					const stack = error.stack.slice(0, 900) + "...";
					
					const embed = new EmbedBuilder();
					embed.setTitle(`${emoji.error} Error Log`);
					embed.setColor(color.error);
					embed.setDescription(`**Command:** \`${interaction.toString()}\`\n**Perpetrator:** \`${interaction.user.id}\`\n**Guild:** \`${interaction.guild.id}\``);
					embed.addFields({ name: `Stacktrace`, value: `\`\`\`js\n${stack}\`\`\`` });
	
					client.errorChannel.send({
						embeds: [embed]
					});
				}
				catch(err){
					console.log(err);
					interaction.channel.send(`Error log could not be sent, dev should know about this...`);
				}
			}

			// If there was no interaction at all
			if (!interaction) return;

			const errorEmbed = new EmbedBuilder();
			errorEmbed.setDescription(`${emoji.error} There was an error while executing this command!\nYou can join our [support server](https://discord.gg/kNmgU44xgU) to report the issue`);
			errorEmbed.setFooter({ text: 'Errors are automatically delivered to the developer, it may be fixed in about 1 to 24 hours, but reporting will help to quick the process' });
			errorEmbed.setColor(color.error);

			await interaction.editReply({ ephemeral: true, embeds: [errorEmbed] });
		}	
	}
}