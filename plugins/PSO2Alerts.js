/* Plugin to enable PSO2 EQ Alerts for MarinaBot */
try {
	var jsonEQ = require("./eqJP.json");
} catch(e) {
	console.log("Couldn't load EQ Translation file, needed for PSO2 EQ Bot. " + e)
}

try {
	settings = require("../settings.json");
} catch(e) {
	//No settings file found. Terminating.
	console.log("Settings failed to load. " + e);
}

// Obviously need discord.js to run...
try {
	var Discord = require(settings.discordjsLocation);
} catch(e) {
	var Discord = require("../");
	console.log("Discord.JS not found. " + e);
}

var bot = new Discord.Client();

var hrnow, hridx, hrstr, str, oldstr, eqidx, eqstr, transEQ;

expFuncs = {
	"fn60sec" : function () {
		expFuncs.getNotice();
		if (oldstr == undefined || str == undefined) {
			oldstr = str;
		} else if (oldstr != str) {
			for (var i = 0; i < bot.channels.length; i++) {
				if (bot.channels[i].name == "general") {
					bot.sendMessage(bot.channels[i].id, "@everyone Incoming EQ Report from PSO2es: " + transEQ + "\n(JP: " + eqstr + "@" + hrstr + ":00 JST)");
				}
			}
			oldstr = str;
		}
		str = ''
	},

	"getNotice" : function () {
		var http = require('http');
		var options = {
			host: 'acf.me.uk',
			path: '/Public/PSO2EQ/pso2eq.txt'
		};

		callback = function(response) {

		//another chunk of data has been recieved, so append it to `str`
		response.on('data', function (chunk) {
			str += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		response.on('end', function () {
				expFuncs.findhour_EQ(str);
				expFuncs.findtitle_EQ(str);
			});
		}

		http.request(options, callback).end();
	},

	"findhour_EQ" : function (str) {
		hridx = str.indexOf('\u6642');
		if (hridx === -1) {
			return "-1";
		} else {
			hrstr = str.substring(hridx - 2, hridx);
			return;
		}
	},

	"findtitle_EQ" : function (str) {
		eqidx = str.indexOf('\u3010PSO2\u3011');
		if (eqidx === -1) {
			return "-1";
		} else {
			eqstr = str.substr(eqidx + 6);
			transEQ = jsonEQ[eqstr];
		}
	}
}

module.exports = expFuncs;