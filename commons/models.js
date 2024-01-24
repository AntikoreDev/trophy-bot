const { trophy, guild, user } = require("./schemas.js");
const mongoose = require("mongoose");

const Trophies = mongoose.model("trophies", trophy);
const Guilds = mongoose.model("guilds", guild);
const User = mongoose.model("user", user);

module.exports = {
	Trophies, Guilds, User
};