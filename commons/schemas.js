const { Schema } = require("mongoose");

const trophy = new Schema({
	id: Number,
	guild: String,
	creator: String,
	created: { type: Date, default: Date.now() },
	name: String,
	description: String,
	emoji: { type: String, default: "🏆" },
	value: { type: Number, default: 10 },
	image: { type: String, default: "" },
	dedication: { type: String, default: "" },
	details: { type: String, default: "" },
	tradeable: { type: Boolean, default: false },
	signed: { type: Boolean, default: false }
});

const user = new Schema({
	snow: String,
	trophies: {
		type: Map,
		of: Number
	},
	total: Number
});

const guild = new Schema({
	snow: String,
	lastConnection: { type: Date, default: new Date.now() },
	language: { type: String, default: 'en' },
	preferences: {
		type: Map,
		of: Mixed
	}
});

module.exports = {
	trophy, user, guild
};