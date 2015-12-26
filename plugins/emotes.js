//Add any globally accessible vars here. These are only accessible from this file!!!

//Example to grab the settings file into var settings.
var emotes, info;

try {
	emotes = require("./emotes.json");
} catch(e) {
	//No settings file found. Terminating.
	console.log("Emotes failed to load. " + e);
}

expFuncs = {
}

// expCmds are any commands you want your bot to be able to do.

expCmds = {
	"emote": {
		usage: "<emote> <optional username>",
		description: "Prints an emote, optionally with a second user (dependant on emote)",
		process: function(bot,msg,suffix) {
		var args = suffix.split(" ");
		var name = args.shift().toLowerCase();
		if (!name) {
			bot.sendMessage(msg.channel, "!emote " + this.usage + "\n" + this.description);
		} else if (!emotes[name]) {
			bot.sendMessage(msg.channel, msg.author + " I don't know that one...");
		} else {
			var victim = args.join(" ");
			if (!victim) {
				bot.sendMessage(msg.channel, msg.author.username + emotes[name][1]);
			} else if (victim == msg.author.username) {
				bot.sendMessage(msg.channel, msg.author + " That's a bit awkward, isn't it?")
			} else {
				for (var i = 0; i < bot.users.length; i++) {
					if (bot.users[i].username == victim) {
						var victimFound = victim;
					}
				}
				if (!victimFound) {
					bot.sendMessage(msg.channel, msg.author + " Who's that?");
				} else {
					if (!emotes[name][2]) {
						bot.sendMessage(msg.channel, msg.author + " You can't do that!!!");
					} else {
						bot.sendMessage(msg.channel, msg.author.username + emotes[name][2] + victim + emotes[name][3]);
					}
				}
			}
		}
	}
},
	"emotehelp": {
		description: "Prints a list of available emotes.",
		process: function(bot,msg,suffix) {
		info = " ";
		for (var cmd in emotes) {
			info += cmd + "\t";
		}
		bot.sendMessage(msg.channel, "Here are the available emotes:\n");
		setTimeout(function() {
			bot.sendMessage(msg.channel, info);
		}, 500);
		}
	}
}


module.exports = [ expFuncs, expCmds ];
