/*
const { EmbedBuilder, Collection, ActivityType } = require('discord.js');

const axios = require('axios');
const { writeFile } = require('fs');
const { promisify } = require('util');
const writeFilePromise = promisify(writeFile);

const random = require('rngoose');

const fs = require('fs');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const color = {
	main: "#0096FF",
	error: "#E02D44",
	success: "#32CD32",
}

async function imsafeWarning(interaction){
	const embed = new EmbedBuilder();

	embed.setColor(color.error);
	embed.setTitle(':warning: WARNING! You\'re running unsafe mode');
	embed.setDescription(`As of 1.4, custom permissions have been deprecated as you can manage each slash command permission requirements on discord itself.\n As these are deprecated, this message avoids anyone using any management commands for the bad, so you may have to change Discord permissions for these commands before going to safe mode\nYou can change them on \`Server Settings > Integrations > Trophy Bot\`.\nYou can ask help on this in our [Support Server](https://discord.gg/kNmgU44xgU)\nAfter choosing permissions for the commands, use \`/imsafe\` to make these commands work again. **MAKE SURE YOU SET PERMISSIONS CORRECTLY TO AVOID ANYONE CREATING OR MANAGING TROPHIES**\n\n**Fun reminder,** commands that used to have custom permissions were: \`/award\`, \`/revoke\`, \`/clear\`, \`/create\`, \`/delete\`, \`/edit\`, \`/panel\` and \`/rewards\``);

	return await interaction.editReply({
		embeds: [embed]
	});
}

async function getDedication(guild, dedication, config = 0){
	const name = dedication.name;
	const id = dedication.user;

	if (!name) return null;
	if (!id) return name;

	if (config == 0) return `<@${id}>`;

	let user = null;
	try {
		user = await guild.members.fetch(id);
	} catch {}
	if (!user) return name;
	if (config == 1) return user?.username ?? name;
	return `<@${id}>`;
}

// Settings
const settings = [
	{
		name: 'Dedication Display',
		description: 'How to display the dedication of a trophy when it is given.',
		options: ['Always Mention', 'Always Name', 'Mention Only in Server'],
		id: 'dedication_display',
		default: 2,
	},
	{
		name: 'Stack Roles',
		id: 'stack_roles',
		description: 'When true, the role rewards will stack instead of only adding the highest role reward at a time.',
		options: ['Stack Roles', 'Only Highest Reward'],
		default: 1,
	},
	{
		name: 'Hide Unused Trophies',
		id: 'hide_unused_trophies',
		description: 'If true, any trophies that were not given to anyone will be hidden for users that don\'t have manage trophies custom permission.',
		options: ['Hide Unused Trophies', 'Show Unused Trophies'],
		default: 1,
	},
	{
		name: 'Hide Quit Users',
		id: 'hide_quit_users',
		description: 'If true, any users that quit the server will be hidden from the leaderboard.',
		options: ['Hide Quit Users', 'Show Quit Users'],
		default: 0,
	},
	{
		name: 'Leaderboard Format',
		id: 'leaderboard_format',
		description: 'How to display users on the leaderboard. (If there are issues on phones, try changing this to any other than mention',
		options: ['Mention', 'Username', 'Nickname', 'Username and Tag'],
		default: 0,
	}
]

function isInServer(guild, user){
	return guild.members.cache.get(user) != undefined;
}

// I'm very bad naming variables, please. discretion from the reader is thankful.
function getSetting(client, guild, setting){
	const stg = settings.find(x => x.id == setting);
	if (!stg) return null;

	const config = null; // client.db.guilds.get(`data.${guild}.settings.${setting}`);
	const set = config ?? stg.default;

	return set;
};

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

async function parseFormat(config, guild, id, pre = "Unknown User"){
	let user = null;
	switch (config){
		case 1:
			user = await guild.members.fetch(id);
			return user?.user?.username ?? pre;

		case 2:
			user = await guild.members.fetch(id);
			return user?.nickname ?? user?.user?.username ?? pre;

		case 3:
			user = await guild.members.fetch(id);
			return user?.user?.tag ?? pre;
			
		default:
			return `<@${id}>`;
	}
}

async function doRewardRoles(client, guild, id){

	let me = guild.me;
	if (me == undefined){
		me = await guild.members.fetch(client.user.id);
	}
	
	// Check if the bot has the manage roles permission
	const manageRoles = me.permissions.has('MANAGE_ROLES');
	if (!manageRoles) return;

	// Get all the reward roles
	const rewards = client.db.guilds.get(`data.${guild.id}.rewards`);
	if (!rewards) return;
	if (!rewards.length) return;

	// Get the user score
	const user = client.db.guilds.get(`data.${guild.id}.users.${id}`);
	if (!user) return;

	// Get the server configuration
	const config = client.db.guilds.get(`data.${guild.id}.settings`);

	// Get the stack roles setting
	const stackRoles = config?.stack_roles ?? 1;

	const score = user.trophyValue;
	let prev = 0, remove = [], award = [], prevRole = null;
	let foundBest = false;
	for (const reward of rewards){
		if (score < reward.requirement){
			if (prevRole != null) remove.push(prevRole);

			prev = reward.requirement;
			prevRole = reward.role;
		}else{
			if (!foundBest){
				award.push(reward.role);
				if (prevRole != null) remove.push(prevRole);

				foundBest = true;
				continue;
			}
				
			if (stackRoles == 0)
				award.push(reward.role);
			else
				remove.push(reward.role);

			foundBest = true;
		}
	}

	if (!foundBest) remove.push(prevRole);

	award = award.filter(x => x);
	remove = remove.filter(x => x);

	const member = await guild.members.fetch(id);

	await member.roles.add(award, `Role rewards`);
	await member.roles.remove(remove, `Role rewards`);
}

function parseName(text){
	if (!text) return text;
	return text.toLowerCase().replace(/\W/g, '').replace(/ /g, '');
}

function checkName(first, second){
	return second.includes(first);
}

function getTrophyCount(client, guild){
	const list = client.db.guilds.get(`data.${guild}.trophies`) ?? {};
	const count = Object.getOwnPropertyNames(list).length - 1;
	return count;
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

function timeFormat(ms) {
    let seconds = ms / 1000;
    const hours = parseInt(seconds / 3600);

    seconds = seconds % 3600;
    const minutes = parseInt(seconds / 60);

    seconds = seconds % 60;

    return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${Math.floor(seconds)}s `.trim();
}

async function attemptFetchIfCacheCleared(keys, guild){
	const cacheUsers = guild.members.cache.size;
	if (keys.length > cacheUsers){
		await guild.members.fetch();
	}
}

async function fetchModules(dir, ext = '.js', command = false, first = true){

	// Create a collection for all the modules
	let collection = new Collection();
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
					if (!module.names) continue;
					collection.set(module.names[0], module);
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

		if (process.platform === "win32"){
			for (const server of testingServers){
				await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_USER, server), { body: commands })
					.then()
					.catch(console.error);
			}
		}else{
			console.log("[Trophy Bot] Putting commands...");
			await rest.put(Routes.applicationCommands(process.env.CLIENT_USER), { body: commands })
				.then()
				.catch(console.error);
		}
	

		console.log('[Trophy Bot] Commands updated!');
	}

	collection.sort(a => a.name);

	if (first)
		return collection;

	return {
		col: collection,
		list: commands
	};
}

async function forgetMe(client, guild){
	const trophies = client.db.guilds.get(`data.${guild.id}.trophies`) ?? null;
	if (trophies != null){
		const keys = Object.keys(trophies).filter(m => m != "current");
		
		for (const tr of keys){
			const image = trophies[tr]?.image;
			if (image != null){
				await fs.unlink(`./images/${image}`, function (err) {});
			}
		}
	}
	await client.db.guilds.set(`data.${guild.id}`, -1);
	await guild.leave();
}

// If the ID is the Dev's ID
function isDev(id){
	return (id === '353998390734094346');
}

// If the ID is from a banned user
function isBanned(id){
	return false;
}

const supportServer = '985439832388042822';

const testingServers = [
	supportServer
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
		let value = client.db.guilds.get(`data.${id}`);
		if (value != -1)
			return value;
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
		rewards: [],
		permissions: {
			manage_trophies: [],
			manage_users: [],
			manage_rewards: []
		},
		imsafe: true,
		restapi: {
			token: '',
			enabled: false,
		}
	};

	// Set server data and return it
	client.db.guilds.set(`data.${id}`, server);
	return server;
}

async function changeActivity(client){
	await client.user.setActivity({ name: 'Starting up!', type: ActivityType.Watching });
	await sleep(10000);

	while (true){
		const activityName = getRandomActivity(client, client.db.bot.get(`data`));
	
		// Set the client user's activity.
		await client.user.setActivity({ name: activityName, type: ActivityType.Watching });
		await sleep(60000);
	}
}

function getRandomActivity(client, data){
	try {
		const list = [
			`${data.trophiesAwarded ?? 0} awarded trophies!`,
			`${data.trophies ?? 0} trophies created!`,
			`${data.commands.total ?? 0} commands ${random.choice(['executed', 'ran', 'used'])}!`,
			`${random.choice(['Serving', 'Helping', 'Running at'])} ${client.guilds.cache.size ?? 0} servers!`,
			`${random.choice(['Serving', 'Helping', 'Working for'])} ${client.users.cache.size ?? 0} users!`,
			`Running seamlessly ${timeFormat(client.uptime)}`,
			`Invite me with '/invite'`,
			`We are the champion`,
		];

		return random.choice(list);
	}
	catch (e) {
		return `Working harder than expected!`;
	}
}

async function AttemptToFetchUsers(client, force = false){

	const today = new Date().getDate();
	const lastDay = client.db.bot.get(`data.lastDay`) ?? 0;

	if (today != lastDay || force){

		client.db.bot.set(`data.lastDay`, today);

		for (const guild of client.guilds.cache.values()){
			await guild.members.fetch();
		}

	}
}



function downloadImage(url, filename){
	return axios.get(url)
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

async function updatePanel(client, guild){
	const id = guild.id;
	const panel = client.db.guilds.get(`data.${id}.panel`);

	if (!panel) return;

	const channel = await guild.channels.fetch(panel.channel);
	if (!channel) return;
	
	const message = await channel.messages.fetch(panel.message);
	if (!message) return;

	const embed = new EmbedBuilder();

	const page = 1;
	const users = client.db.guilds.get(`data.${id}.users`) || {};

	const list = new Collection();
	let total = 0;

	const keys = Object.keys(users);
	await attemptFetchIfCacheCleared(keys, guild);

	for (const key of keys) {
		if (users[key].trophyValue && (isInServer(guild, key) || getSetting(client, id, 'hide_quit_users') == 1)) {
			list.set(key, users[key].trophyValue);
			total += users[key].trophyValue;
		}
	}

	const sorted = list.sort((a, b) => b - a);
	const pages = getPage(Array.from(sorted.keys()), 10, page);

	const config = getSetting(client, id, 'leaderboard_format') ?? 0;

	let i = ((page - 1) * 10) + 1;
	const top = [];
	for (const user of pages.list) {
		const value = sorted.get(user);
		const parse = await parseFormat(config, guild, user);
		top.push(`${getMedal(i)} **${i}.-** ${parse} ➤ **${value}** :medal:`);

		i++;
	}

	embed.setColor(color.main);
	embed.setTitle(`${emoji.trophy} ${guild?.name ?? 'Server'}'s Leaderboard`);
	embed.setDescription(`Total server score: **${total}** :medal:`);
	embed.addFields({ name: `Leaderboard`, value: top.length ? top.join('\n') : `No scores yet` });

	return await message.edit({
		content: `\u200b`,
		embeds: [embed]
	});
}

async function updatePanels(client){
	while (true){
		await sleep(60000);
		for (const guild of client.guilds.cache.values()){
			try {
				await updatePanel(client, guild);
			}
			catch {}
			await sleep(1000);
		}
	}
}

const booleans = {
	true: ['yes', 'y', 'true', 't', '1', 'on'],
	false: ['no', 'n', 'false', 'f', '0', 'off']
}

const sortmethods = [
	{
		name: "By value",
		id: "value",
		func(a, b){
			return object[b].value - object[a].value;
		}
	},
	{
		name: "A-Z",
		id: "az",
		func(a, b){
			return object[b].name.localeCompare(object[a].name);
		}
	},
	{
		name: "Z-A",
		id: "za",
		func(a, b){
			return -object[b].name.localeCompare(object[a].name);
		}
	}
]

module.exports = {

	// Fetching
	fetchModules, getServer, downloadImage, AttemptToFetchUsers, isInServer, attemptFetchIfCacheCleared,

	// Technical
	isDev, isOnSnowflakeRange, isBanned, isAlphanumeric, 

	// Runtime
	sleep, changeActivity, updatePanels, doRewardRoles, forgetMe,

	// Output
	showError, showSuccess, showCooldown, timeFormat, updatePanel, imsafeWarning,

	// Math
	clamp, getPage, getMedal,

	// Parsing
	parseUser, parseName, parseFormat, clearMentions, getDedication,

	// Database
	getTrophy, cleanseTrophies, getSetting, getTrophyCount,

	// Comparison
	checkName, anyIn,

	// Colors, emojis, etc.
	color, emoji, booleans, testingServers, settings, supportServer, sortmethods
}
*/