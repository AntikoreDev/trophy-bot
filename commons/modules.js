const fs = require('fs');
const Log = require('./logger.js');
const { Collection } = require('discord.js');

async function fetch(dir, ext, max_depth = -1, current_depth = 0){
	const modules = new Collection();
	const files = await fs.readdirSync(dir);

	for (const file of files){
		if (file.endsWith(ext)){
			const module = require(`${dir}/${file}`);
			if (!module.data) {
				Log.w(`Command module ${dir}/${file} does not meet criteria specified`);
				continue;
			}

			modules.set(module.data.name, module);
			continue;
		} 
		
		if (max_depth === -1 || current_depth < max_depth){
			const more_modules = await fetch(`${dir}/${file}`, ext, max_depth, current_depth + 1);
			more_modules.forEach((value, key) => {
				modules.set(key, value);
			});
		}
	}


	modules.sort(a => a.name);

	return modules;
}

async function fetchLanguages(dir, ext, max_depth = -1, current_depth = 0){
	const modules = new Collection();
	const files = await fs.readdirSync(dir);

	for (const file of files){
		if (file.endsWith(ext)){
			const module = require(`${dir}/${file}`);
			if (!module.id) {
				Log.w(`Language module ${dir}/${file} does not meet criteria specified`);
				continue;
			}

			modules.set(module.id, module);
			continue;
		} 
		
		if (max_depth === -1 || current_depth < max_depth){
			const more_modules = await fetchLanguages(`${dir}/${file}`, ext, max_depth, current_depth + 1);
			more_modules.forEach((value, key) => {
				modules.set(key, value);
			});
		}
	}


	modules.sort(a => a.name);

	return modules;
}

module.exports = {
	fetch, fetchLanguages
}