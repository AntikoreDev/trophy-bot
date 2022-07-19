const { supportServer } = require('../globals');

module.exports = {
	name: 'guildMemberAdd',
	once: false,
	async run (member) {

		// If the member is a bot, don't do anything
	    if (member.user.bot) return;

		// If the member guild is not the support server, don't do anything
		if (member.guild.id != supportServer) return;

		// Add the role to the new member
		try {
			member.roles.add(member.guild.roles.cache.find(r => r.id === '985440033286787123'));
		}
		catch {}
	}
}