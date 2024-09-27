const { EmbedBuilder } = require("@discordjs/builders");
const { color, emoji, medals } = require("./statics");
const Locale = require("./locale");

function getMedal(i){
	return (medals[i] || medals["x"]);
}

async function getError(guild, key, params = {}){
	const embed = new EmbedBuilder();

	const errorTitle = await Locale.getLocalisedString(guild, "error_generic_title");
	const errorString = await Locale.getLocalisedString(guild, key, params);

	embed.setColor(color.error);
	embed.setDescription(`${emoji.error} **${errorTitle}** ${errorString}`);

	return embed;
}

async function getSuccess(guild, key, params = {}){
	const embed = new EmbedBuilder();

	const successTitle = await Locale.getLocalisedString(guild, "success_generic_title");
	const successString = await Locale.getLocalisedString(guild, key, params);

	embed.setColor(color.success);
	embed.setDescription(`${emoji.success} **${successTitle}** ${successString}`);

	return embed;
}

function formatUser(id){
	return `<@${id}>`;
}

function formatTrophy(trophy){
	return `${trophy.emoji} **${trophy.name}**`;
}

function formatLanguage(language){
	return `${language.icon} **${language.names[0]}**`
}

function getLanguageByID(client, lang = "en"){
	const languages = client.languages.filter(l => l.id == lang);
	return languages.first();
}

function formatValue(value){
	return (value > 0 ? `+${value}` : value);
}

async function connectMongoDB(){
	const user = process.env.MONGO_USER;
	const pass = process.env.MONGO_PASS;
	const host = process.env.MONGO_HOST;
	const port = process.env.MONGO_PORT;

	const dbName = process.env.MONGO_DBNAME;

	const connectionURI = `mongodb://${host}:${port}`;

	console.log(`[Trophy Bot] Connecting to database ${dbName} at "${host}:${port}"...`);

	return await mongoose.connect(connectionURI, { pass, user, dbName })
		.then(() => console.log(`[Trophy Bot] Connected to database ${dbName} at "${host}:${port}"!`))
		.catch(error => console.log(error));
}

async function connectDiscord(){
	console.log(`[Trophy Bot] Logging into Discord...`);
	client.login(process.env.DISCORD_TOKEN);
}

async function getUserNameByID(client, id){
	return await client.users.fetch(id).then(u => u.displayName);
}

module.exports = {
	getMedal, getError, getSuccess, formatUser, formatTrophy, formatLanguage, formatValue, getLanguageByID, connectMongoDB, connectDiscord, getUserNameByID
}
