var truth, dare, TorD, rngRandom, truthTotal, dareTotal;

try {
	truth = require("./truth.json");
	dare = require("./dare.json");
} catch(e) {
	console.log("Truth and Dare files failed to load. " + e);
	if (!truth) {
		truth = {};
	} else if (!dare) {
		dare = {};
	}
}

function getTorD(TorD, bot, msg) {
	if (TorD === "truth" && truth) {
		var length = Object.keys(truth).length;
		var whichOne = doRNG(length);
		bot.sendMessage(msg.channel, msg.author + " " + truth[whichOne]);
	} else if (TorD === "dare" && dare) {
		var length = Object.keys(dare).length;
		var whichOne = doRNG(length);
		bot.sendMessage(msg.channel, msg.author + " " + dare[whichOne]);
	}
}

function doRNG(maxRNG) {
	rngRandom = (Math.floor(Math.random() * maxRNG) + 1);
	return rngRandom;
}

expFuncs = {
	"runOnce" : function () {
	for (var item in truth) {
		truthTotal++;
	}
	for (var item in dare) {
		dareTotal++;
	}

	}
}

expCmds = {
    "truth": {
        description: "Prints out a random 'truth' question. Only ask for one if you'll answer it!!!",
		adminlvl: 1,
        process: function(bot,msg,suffix) {
			getTorD("truth", bot, msg);
		}
    },
	"dare": {
		description: "Prints out a random 'dare'. Only ask for one if you'll do it!!!",
		adminlvl: 1,
		process: function(bot,msg,suffix) {
			getTorD("dare", bot, msg);
		}
	},
	"truthordare": {
		description: "Prints out a random 'truth' or 'dare'. Only for the strong-willed!!!",
		process: function (bot,msg,suffix) {
			var whichOne = doRNG(2);
			if (whichOne == 1) {
				getTorD("truth", bot, msg);
			} else {
				getTorD("dare", bot, msg);
			}
		}
	}
}

module.exports = [ expFuncs, expCmds ];
