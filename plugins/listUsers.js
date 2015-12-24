var settings;
var userList = {};

try {
	settings = require("../settings.json");
} catch(e) {
	//No settings file found. Terminating.
	console.log("Settings failed to load. " + e);
}

expFuncs = {}

expCmds = {
	"listusers": {
		description: "Lists usernames, and writes them to a file",
		adminlvl: 4,
		process: function(bot,msg,suffix) {
			for (var i = 0; i < bot.users.length; i++) {
				userList[bot.users[i].username] = bot.users[i].id;
			}
			require("fs").writeFile(settings.botLocation + "/plugins/userList.json",JSON.stringify(userList,null,4), null);
			bot.sendMessage(msg.channel,"Success!");
		}
	}
}

module.exports = [ expFuncs, expCmds ];
