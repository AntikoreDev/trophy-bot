// ToDo
const Database = require("./database.js");

/**
 * Gets the localized version of the string with that kay, in the language of the provided guild.
 * 
 * @param {*} guild Guild that's going to read this string
 * @param {*} key Locale key for the string
 * @param {*} params Map of parameters to add into the string
 * @param {*} language Language to force use of
 * @returns Localized string
 */
async function getLocalisedString(guild, key, params = {}, language = null){
	
	let lang = language;
	if (!lang){
		lang = await Database.getGuildLanguage(guild);
	}
	
	let locale = null;
	try {
		locale = require(`../locale/translations/${lang}.js`);
	} catch (e) {}

	// If the locale doesn't exists
	if (!locale) {
		if (lang === "en"){
			return "LANG_NULL";
		}

		return await getLocalisedString(guild, key, params, "en");
	}

	const value = locale?.entries[key] ?? null;
	if (!value){
		if (lang === "en"){
			return key;
		}

		return await getLocalisedString(guild, key, params, "en");
	}

	return getParametrizedKey(value, params);
}

function getParametrizedKey(value, params = {}){
	let text = value;
	const keys = Object.keys(params);

	for (const param of keys){
		const value = params[param];
		while (text.includes(`%${param}%`)){
			text = text.replace(`%${param}%`, value);
		}
	}
	
	return text;
}

module.exports = {
	getLocalisedString
}