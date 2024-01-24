// ToDo
const { trophy, user, guild } = require("./schemas.js");
// This file should contain generic functions on reading and writting on the database

async function getGuildLanguage(guild){
	if (!guild)
		return "en";
	
	const data = await Guilds.findOne({ snow: guild }).exec();
	const lang = data?.language;
	if (!lang){
		return "en";
	}

	return lang;
}

module.exports = {
	getGuildLanguage
}