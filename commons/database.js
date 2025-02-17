const { Guilds, Trophies, Users, Awards } = require("./models.js");
// This file should contain generic functions on reading and writting on the database

const defaultLanguage = "en";
const languageCache = {};
const guildCache = [];

function cacheLanguage(guild, lang){
	languageCache[guild] = lang;
}

async function fetchLanguage(guild){

	let lang = null;
	try {
		lang = languageCache[guild];
	} catch (e) {}

	if (lang)
		return lang;

	try {
		const data = await Guilds.findOne({ snow: guild }).exec();
		const language = (data?.language ?? defaultLanguage);
		
		cacheLanguage(guild, language);
		
		return language;
	} catch (e) {
		return defaultLanguage;
	}
}

async function fetchGuild(guild, create = true){
	let guildObject = await Guilds.exists({ snow: guild }).exec();

	if (guildObject){
		guildCache.push(guild);
		return guildObject;
	}

	if (!create)
		return null;
	
	guildObject = {
		snow: guild
	};

	await Guilds.insertMany(guildObject);
	guildCache.push(guild);
	return guildObject;
}

/**
 * Checks if the guild passed as a parameter exists in the database or not. This function's only purpose is to save time in command execution
 * where the bot needs to check if the guild exists or not, and create it otherwise.
 * @param {string} guild Guild to check for
 * @param {boolean} [create=true] If the bot should add the guild to the database or just return the boolean.
 * @returns {boolean} Whether the guild exists or not
 */
async function checkGuild(guild, create = true){
	if (guildCache.includes(guild))
		return true;

	const guildObject = await fetchGuild(guild, create);
	return new Boolean(guildObject);
}

async function updateGuildLanguage(guild, language){
	if (!guild)
		return defaultLanguage;

	await Guilds.updateOne({ snow: guild }, { language });
	languageCache[guild] = language;
}

async function getGuildLanguage(guild){
	if (!guild)
		return defaultLanguage;
	
	const lang = await fetchLanguage(guild);
	return lang;
}

async function getGuildTrophyCount(guild){
	if (!guild)
		return null;

	const count = Trophies.countDocuments({ guild }).exec();
	return count;
}

async function getNextTrophyID(guild){
	if (!guild)
		return null;

	const trophies = await Trophies.find({ guild }, 'id').sort({ id: 1 }).exec();
	
	let lastId = 0;
	for (const trophy of trophies){
		const id = trophy.id;
		if (lastId < (id - 1))
			break;

		lastId = id;
	}

	return (lastId + 1);
}

async function findTrophy(guild, filter, first = true){

	// Catch block will the called when the filter is not numeric
	try {
		const trophyByID = await Trophies.find({ guild, id: filter }).exec();
		if (trophyByID)
			return (first ? trophyByID[0] : trophyByID);
	} catch (e) {}

	const trophyByName = await Trophies.find({ guild, name: { $regex: new RegExp(filter, 'i') } }).limit(5).exec();
	if (trophyByName.length){
		return (first ? trophyByName[0] : trophyByName);
	}

	return null;
}

async function addTrophy(guild, user, trophy, count){

	try {
		const exists = await Awards.exists({ guild, user, trophy: trophy.id });
		if (exists){
			await Awards.findOneAndUpdate(
				{ guild, user, trophy: trophy.id }, 
				{ $inc: { count } }
			);
		} else {
			await Awards.insertMany({
				guild, user, trophy: trophy.id, count
			});
		}
	} catch (e) {
		console.log(e);
		return false;
	}

	await updateUserScore(guild, user);
	return true;
}

async function revokeTrophy(guild, user, trophy, count){

	let c = count;
	try {
		const award = await Awards.findOne({ guild, user, trophy: trophy.id }, 'count');
		if (!award || award.count == 0){
			return -1;
		}

		const change = Math.max(Math.min((award.count - count), 65535), 0);

		const revoke = await Awards.findOneAndUpdate(
			{ guild, user, trophy: trophy.id }, 
			{ count: change },
			{ returnDocument: "after" }
		);

		const origin = award.count;
		const result = revoke.count;

		c = (result == 0 ? 0 : (origin - result));

	} catch (e) {
		console.log(e);
		return -2;
	}

	await updateUserScore(guild, user);
	return c;
}


async function updateUserScore(guild, user){
	await fetchUser(guild, user);

	const total = await calculateUserScore(guild, user)
		.catch((e) => {
			console.log(e);
			return null;
		});

	if (total == null)
		return total;

	await Users.findOneAndUpdate({ guild, snow: user }, { total });
	
	return total;
}

async function updateAllUsersScore(guild){
	Users.updateMany(
		{ 
			guild 
		}, 
		[
			{
				$lookup: {
					from: 'awards',
					localField: 'snow',
					foreignField: 'user',
					as: 'userAwards',
				},
			},
			{
				$unwind: '$userAwards',
			},
			{
				$match: {
					'userAwards.guild': guild
				},
			},
			{
				$lookup: {
					from: 'trophies',
					localField: 'userAwards.trophy',
					foreignField: 'id',
					as: 'trophyDetails',
				},
			},
			{
				$unwind: '$trophyDetails',
			},
			{
				$match: {
					'trophyDetails.guild': guild,
				},
			},
			{
				$group: {
					_id: "_id",
					total: {
						$sum: {
							$multiply: ['$userAwards.count', '$trophyDetails.value'],
						},
					},
				},
			},
		]
	);
}

async function calculateUserScore(guild, user){
	try {
		const result = await Users.aggregate([
			{
				$match: {
					snow: user,
					guild
				},
			},
			{
				$lookup: {
					from: 'awards',
					localField: 'snow',
					foreignField: 'user',
					as: 'userAwards',
				},
			},
			{
				$unwind: '$userAwards',
			},
			{
				$match: {
					'userAwards.guild': guild
				},
			},
			{
				$lookup: {
					from: 'trophies',
					localField: 'userAwards.trophy',
					foreignField: 'id',
					as: 'trophyDetails',
				},
			},
			{
				$unwind: '$trophyDetails',
			},
			{
				$match: {
					'trophyDetails.guild': guild,
				},
			},
			{
				$group: {
					_id: "_id",
					total: {
						$sum: {
							$multiply: ['$userAwards.count', '$trophyDetails.value'],
						},
					},
				},
			},
		]);

		const final = (result.length > 0 ? result[0].total : 0);
		return final;
	} catch (err) {
		console.error(err);
		throw err;
	}
}

async function fetchUser(guild, user, total = undefined){
	let userObject = await Users.exists({ snow: user, guild: guild }).exec();
	if (userObject){
		return userObject;
	}
	
	userObject = {
		snow: user,
		guild,
		total
	};

	const result = await Users.insertMany(userObject).catch((e) => { console.log(e) });
	return (result.length ? result[0] : null);
}

async function clearUserTrophies(guild, user){
	
	let results = null;
	try {
		results = await Awards.deleteMany({ guild, user });
	} catch {}

	if (!results)
		return false;

	try {
		results = await Users.updateOne({ guild, snow: user }, { total: 0 });
	} catch {}

	if (!results)
		return false;

	return true;
}

async function deleteTrophy(guild, trophy){

	try {
		// Delete the trophy specified
		await Trophies.deleteMany({ guild, id: trophy });

		// Delete assignations of that trophy
		await Awards.deleteMany({ guild, trophy });

		// Update all users with that trophy
		await updateAllUsersScore(guild);

	} catch (e) {
		console.log(e);
		return false;
	}

	return true;
}

async function getTrophyList(guild, page = 1){

	const criteria = { guild };
	const count = await Trophies.find(criteria).countDocuments();

	const perPage = 10;
	const pagecount = Math.ceil(count / perPage);
	const actualPage = Math.max(Math.min(page, pagecount), 1);
	const skipped = ((actualPage - 1) * perPage);

	const list = await Trophies.find(criteria).sort({ value: -1, name: 1 }).skip(skipped).limit(perPage).exec();

	return { items: list, currentpage: actualPage, pagecount, count };
}

async function getTrophyUserList(guild, user, page = 1){
	const criteria = { guild, user };
	const individualCount = await Awards.find(criteria).countDocuments();
	const count = await Awards.aggregate([
		{
			$match: {
				guild, user
			},
		},
		{
			$group: {
				_id: "_id",
				total: {
					$sum: "awards.count"
				}
			}
		}
	]);

	const perPage = 10;
	const pagecount = Math.ceil(individualCount / perPage);
	const actualPage = Math.max(Math.min(page, pagecount), 1);
	const skipped = ((actualPage - 1) * perPage);

	const list = await Awards.aggregate([
		{
			$match: criteria
		},
		{
			$lookup: {
				from: 'trophies',
				localField: `trophy`,
				foreignField: 'id',
				as: 'trophydefs'
			},
		},
		{
			$addFields: {
				emoji: '$trophydefs.emoji',
				name: '$trophydefs.name',
				value:' $trophydefs.value',
				count: '$awards.count'
			}
		}
	]).sort({ value: -1, name: 1 }).skip(skipped).limit(perPage).exec();

	return { items: list, currentpage: actualPage, pagecount, count: individualCount.total, total: count };
}

module.exports = {

	// Fetchers (Get or create)
	fetchGuild, fetchUser,

	// Checkers (Check if exists)
	checkGuild,

	// Getters (Get)
	getGuildLanguage, getGuildTrophyCount, getNextTrophyID, getTrophyList, getTrophyUserList,

	// Finders (Find against a filter)
	findTrophy,

	// Adders (Add stuff to the database)
	addTrophy, 

	// Deleters (Delete stuff from the database)
	deleteTrophy, revokeTrophy,

	// Other
	clearUserTrophies, updateGuildLanguage
}