const Log = require('./logger.js');

require('toml-require').install();

let data = undefined;

async function cacheDataIfNeeded(){
	if (data) return;

	data = require('../config.toml');
}

async function get(category, key, def = undefined){
	await cacheDataIfNeeded();
	try {
		return data[category][key] ?? def;
	} catch (e) {
		Log.e(e);
		return def;
	}
}

module.exports = {
	get
};