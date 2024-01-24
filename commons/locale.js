// ToDo
const Database = require("./database.js");

// This file should contain functions to manage using locales
function getLocalisedString(guild, key, params = {}){

	const lang = Database.getGuildLanguage(guild);
	
	let locale = null;
	try {
		locale = require(`../locale/translations/${lang}.js`);
	} catch (e) {}

	// If the locale doesn't exists
	if (!locale) {
		if (lang === "en"){
			return "LANG_NULL";
		}

		return getLocalisedString(guild, "en", params);
	}

	const value = locale?.entries[key] ?? null;
	if (!value){
		if (lang === "en"){
			return "LOCALE_KEY_NULL";
		}

		return getLocalisedString(guild, "en", params);
	}

	return getParametrizedKey(value, params);
}

function getParametrizedKey(value, params = {}){
	let text = value;
	
	for (const param of params.keys()){
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