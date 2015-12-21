/* Plugin to enable PSO2 EQ Alerts for MarinaBot */

// Translation file
try {
	var jsonEQ = require("./eqJP.json");
} catch(e) {
	console.log("Couldn't load EQ Translation file, needed for PSO2 EQ Bot. " + e)
}

var oldTxt, eqTxt, eqstr, hrstr;

expFuncs = {
	"fn60sec" : function (bot) {
		setTimeout(function() {
		if (oldTxt === undefined && eqTxt !== '') {
			oldTxt = eqTxt;
			return;
		} else {
			if (oldTxt !== eqTxt) {
				for (var i = 0; i < bot.channels.length; i++) {
					if (bot.channels[i].name == "bot-testing") {
						bot.sendMessage(bot.channels[i].id, "everyone Incoming EQ Report from PSO2es: " + jsonEQ[eqstr] + "\n(JP: " + eqstr + "@" + hrstr + ":00 JST)");
						return;
					}
				}
				oldTxt = eqTxt;
			}
		}
		}, 5000);
	},

	"getNotice" : function () {
		eqTxt = '';
		var http = require('http');
		var options = {
			host: 'acf.me.uk',
			path: '/Public/PSO2EQ/pso2eq.txt'
		};

		callback = function(response) {

		//another chunk of data has been recieved, so append it to `eqTxt`
		response.on('data', function (chunk) {
			eqTxt += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		response.on('end', function () {
				expFuncs.findhour_EQ(eqTxt);
				expFuncs.findtitle_EQ(eqTxt);
			});
		}

		http.request(options, callback).end();
	},

	"findhour_EQ" : function (eqTxt) {
		hridx = eqTxt.indexOf('\u6642');
		if (hridx === -1) {
			return;
		} else {
			hrstr = eqTxt.substring(hridx - 2, hridx);
		}
	},

	"findtitle_EQ" : function (eqTxt) {
		eqidx = eqTxt.indexOf('\u3010PSO2\u3011');
		if (eqidx === -1) {
			return;
		} else {
			eqstr = eqTxt.substr(eqidx + 6);
		}
	}
}

expCmds = {
	"checkeq": {
		description: "Responds with a message whether there is an upcoming EQ or not.",
		process: function(bot,msg) {
			expFuncs.getNotice();
			var d = new Date();
			var hrnow = d.getHours();
			
			if (hrstr == hrnow + 1) {
				bot.sendMessage(msg.channel, msg.author + " Incoming EQ Report from PSO2es: " + jsonEQ[eqstr] + "\n(JP: " + eqstr + "@" + hrstr + ":00 JST)");
			} else {
				bot.sendMessage(msg.channel, msg.author + " No new EQ Report from PSO2es.");
			}
		}
	}
}

module.exports = [expFuncs, expCmds];
