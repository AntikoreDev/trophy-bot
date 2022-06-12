const Discord = require('discord.js');

const fetch = require('node-fetch');
const { writeFile } = require('fs');
const { promisify } = require('util');
const writeFilePromise = promisify(writeFile);

const fs = require('fs');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const color = {
	main: "#0096FF",
	error: "#FF6347",
	success: "#32CD32",
}

const emoji = {
	trophy: "🏆",
	success: "✅",
	error: "<:error:985469320844967946>",
}

function getMedal(i){
	const medals = {
		'1': "🥇",
		'2': "🥈",
		'3': "🥉",
	}

	return medals[i] || ":medal:";
}

async function getTrophy(client, guild, trophy){
	const isNumber = !Number.isNaN(parseInt(trophy));
		
	if (isNumber){
		const exists = client.db.guilds.has(`data.${guild}.trophies.${trophy}`);
		if (exists){			
			return trophy;
		}
	}

	const name = await parseName(trophy);

	const trophies = client.db.guilds.get(`data.${guild}.trophies`);
	for (const key in trophies){
		if (!key) continue;
		if (key == 'current') continue;

		const trophyName = trophies[key]?.name;
		const checker = await parseName(trophyName);

		if (checker && checkName(name, checker)){
			return key;
		}
	}

	return null;
}

async function parseName(trophy){
	if (!trophy) return trophy;
	return trophy.toLowerCase().replace(/\W/g, '').replace(/ /g, '');
}

function checkName(first, second){
	return second.includes(first);
}

async function cleanseTrophies(client, guild, trophy, value){
	const users = client.db.guilds.get(`data.${guild}.users`);
	for (const id in users){
		if (!id) continue;
		if (!users[id].trophies) continue;
		
		while (users[id].trophies.includes(trophy)){
			users[id].trophies.splice(users[id].trophies.indexOf(trophy), 1);
			users[id].trophyValue -= value;
		}
	}
	
	client.db.guilds.set(`data.${guild}.users`, users);
}

function anyIn(from, which){
	return which.some(x => from.includes(x));
}

async function fetchModules(dir, ext = '.js', command = false, first = true){

	// Create a collection for all the modules
	let collection = new Discord.Collection();
	let commands = [];

	// Get all files from the directory, and iterate over them
	const files = fs.readdirSync(dir);
	for (const file of files){

		// If the file starts with '-', means that it's an ignored file.
		if (file.startsWith('-')) continue;

		// If the file has the extension we want, load it
		if (file.endsWith(ext)){

			try {
				const module = require(`${dir}/${file}`);
				
				if (command){
					if (!module?.data?.name) continue;
					
					collection.set(module.data.name, module);
					commands.push(module.data.toJSON());
				} 
				else {
					if (!module.name) continue;
					collection.set(module.name, module);
				}
			}
			catch (e) {
				console.log(e);
			}
		}

		// If it's a folder, then we need to go deeper
		if (!file.includes('.')){
			const collection2 = await fetchModules(`${dir}/${file}`, ext, command, false);
			collection = collection.concat(collection2.col);

			commands = commands.concat(collection2.list);
		}

	}

	if (command && first){
		const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

		for (const server of testingServers){
			await rest.put(Routes.applicationGuildCommands('985134052665356299', server), { body: commands })
				.then()
				.catch(console.error);
		}

		console.log('Commands updated!');
	}

	collection.sort(a => a.name);

	if (first)
		return collection;

	return {
		col: collection,
		list: commands
	};
}

// If the ID is the Dev's ID
function isDev(id){
	return (id === '353998390734094346');
}

// If the ID is from a banned user
function isBanned(id){
	return false;
}

const testingServers = [
	'985439832388042822',
	'631540341148876800',
	'857735916067356682'
]


async function getServer(client, id, guild){

	await guild.fetch();

	if (!id){
		return {
			language: 'en'
		};
	}

	// If the server id is on the database, then return it
	if (client.db.guilds.has(`data.${id}`)){
		return client.db.guilds.get(`data.${id}`);
	}

	// Create the server data if it doesn't exist
	const server = {
		id: id,
		language: 'en',
		settings: {},
		trophies: {
			current: 0
		},
		users: {},
		permissions: {
			manage_trophies: [],
			manage_users: [],
			manage_rewards: []
		},
	};

	// Set server data and return it
	client.db.guilds.set(`data.${id}`, server);
	return server;
}

async function changeActivity(client){
	while (true){
		await sleep(20000);
	
		// Set the client user's activity.
		await client.user.setActivity(`${client.db.bot.get(`data.trophiesAwarded`, 0)} awarded trophies!`, { type: 'WATCHING' });
	}
	
}



function downloadImage(url, filename){
	return fetch(url)
		.then(x => x.arrayBuffer())
		.then(x => writeFilePromise(filename, Buffer.from(x)));
};


async function parseUser(client, ref, notfound = null, guild = null, member = false){

	if (!ref || ref == ``) return notfound;

	let search = ref;
	if (search.startsWith(`<@`) && search.endsWith(`>`)){
		search = ref.replace(/[<@!>]/g, ``);
	}

	let user = notfound;
	if (isOnSnowflakeRange(search)){
		try{
			user = await client.users.fetch(search);
		}
		catch (e) {
			user = notfound;
		}
	}
	else if (guild){
		// Search by username
		if (!guild?.available) return notfound;
		user = (await guild.members.search({ query: search, limit: 1, cache: true })).first();
	} 
	else {
		return notfound;
	}

	if (!user) return notfound;
	if (user.guild){
		if (user.guild != guild && guild != null){
			return notfound;
		}
	}
	if (!member){
		user = user?.user || user;
	}
	return user;
}

function isOnSnowflakeRange(sf){
	try{
		let snowflake = BigInt(sf);
		return (snowflake > 0 && snowflake<BigInt("9223372036854775807"));
	} catch(e){
		return false;
	}
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}

function clearMentions(message) {
	return message
		.replace(/@everyone/g, '@\u200Beveryone')
		.replace(/@here/g, '@\u200Bhere')
		.replace(/<@/g, '<@\u200B')
}

// Show an error message
function showError(message){
	return `${emoji.error} **Oopsie!** ${message}`;
}

// Show a success message
function showSuccess(message){
	return `${emoji.success} **Great!** ${message}`;
}

// Show the cooldown of a command when using it on cooldown
function showCooldown(time){
	return `${emoji.error} **Calm down!** You can use this command again in **${time}** seconds.`;
}

// Clamps a number between a min and max
function clamp(n, min, max){
	return Math.max(min, Math.min(n, max))
}

// Checks if the value is alphanumeric
function isAlphanumeric(str){
	return (str.match(/^[0-9A-Za-z]+$/) !== null);
}

// Gets the page number for a paginated command
function getPage(list, perPage, page = 1){
	const last = Math.ceil(list.length / perPage);
	const parsed = clamp(page, 1, last);
	return {
		list: list.slice((parsed - 1) * perPage, parsed * perPage),
		last: Math.max(1, last),
		page: parsed
	};
}

const booleans = {
	true: ['yes', 'y', 'true', 't', '1', 'on'],
	false: ['no', 'n', 'false', 'f', '0', 'off']
}

module.exports = {

	// Fetching
	fetchModules, getServer, downloadImage,

	// Technical
	isDev, isOnSnowflakeRange, isBanned, isAlphanumeric,

	// Runtime
	sleep, changeActivity, 

	// Output
	showError, showSuccess, showCooldown,

	// Math
	clamp, getPage, getMedal,

	// Parsing
	parseUser, parseName, clearMentions,

	// Database
	getTrophy, cleanseTrophies,

	// Comparison
	checkName, anyIn,

	// Colors, emojis, etc.
	color, emoji, booleans, testingServers
}