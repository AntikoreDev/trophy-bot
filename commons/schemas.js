const { Schema } = require("mongoose");
const Mixed = Schema.Types.Mixed;

const trophy = new Schema({
	id: Number,
	guild: String,
	creator: String,
	created: { type: Date, default: Date.now },
	name: String,
	description: String,
	emoji: { type: String, default: "🏆" },
	value: { type: Number, default: 10 },
	image: { type: String, default: process.env.TROPHY_DEFAULT_IMAGE },
	dedication: {
		user: { type: String, default: "" },
		name: { type: String, default: "" }
	},
	details: { type: String, default: "" },
	tradeable: { type: Boolean, default: false },
	signed: { type: Boolean, default: false }
});

const user = new Schema({
	snow: String,
	guild: String,
	total: { type: Number, default: 0 }
});

const guild = new Schema({
	snow: String,
	lastConnection: { type: Date, default: Date.now },
	language: { type: String, default: 'en' },
	apiToken: { type: String, default: null }
});

const award = new Schema({
	trophy: Number,
	guild: String,
	user: String,
	count: { type: Number, default: 0, min: 0, max: 65535 }
});

module.exports = {
	trophy, user, guild, award
};