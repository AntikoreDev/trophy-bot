const { trophy, guild, user, award } = require("./schemas.js");
const mongoose = require("mongoose");

const Trophies = mongoose.model("trophies", trophy);
const Guilds = mongoose.model("guilds", guild);
const Users = mongoose.model("users", user);
const Awards = mongoose.model("awards", award);

module.exports = {
	Trophies, Guilds, Users, Awards
};