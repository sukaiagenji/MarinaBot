/* Plugin to enable PSO2 EQ Alerts for MarinaBot */

// Translation file
try {
	var jsonEQ = require("./eqJP.json");
} catch(e) {
	console.log("Couldn't load EQ Translation file, needed for PSO2 EQ Bot. " + e)
}

var oldTxt, eqTxt, eqstr, hrstr, stringPrint;

expFuncs = {
	"fn60sec" : function (bot) {
		getNotice();
		var d = new Date();
		hrnow = d.getHours();
		setTimeout(function() {
		if (!oldTxt && eqTxt !== '') {
			oldTxt = eqTxt;
			return;
		} else {
			if (oldTxt !== eqTxt && (hrstr = hrnow + 1)) {
				for (var i = 0; i < bot.channels.length; i++) {
					if (bot.channels[i].name == "general") {
						bot.sendMessage(bot.channels[i].id, "@everyone Incoming EQ Report from PSO2es: " + jsonEQ[eqstr] + "\n(JP: " + eqstr + "@" + hrstr + ":00 JST)");
					}
				}
				oldTxt = eqTxt;
			}
		}
		}, 5000);
	}
}

function getNotice() {
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
				findhour_EQ(eqTxt);
				findmin_EQ(eqTxt);
				findtitle_EQ(eqTxt);
			});
		}

		http.request(options, callback).end();
	}

function findhour_EQ(eqTxt) {
		var hridx = eqTxt.indexOf('\u6642');
		if (hridx === -1) {
			return;
		} else {
			hrstr = eqTxt.substring(hridx - 2, hridx);
		}
	}
	
function findmin_EQ(str) {
		mnidx = str.indexOf('\u5206');
		if (mnidx === -1) {
			return "-1";
		}
		mnstr = str.substring(mnidx - 2, mnidx);
		return;
	}

function findtitle_EQ(eqTxt) {
		var eqidx = eqTxt.indexOf('\u3010PSO2\u3011');
		if (eqidx === -1) {
			return;
		} else {
			eqstr = eqTxt.substr(eqidx + 6);
		}
	}

function prevTime(cOrP) {
		var d = new Date();
		hrnow = d.getHours();
		
		if (hrstr == hrnow && cOrP === "current") {
			stringPrint = "Current EQ Report from PSO2es: " + jsonEQ[eqstr] + " (JP: " + eqstr + "@" + hrstr + ":" + mnstr + " JST)";
		}
		if (hrstr == hrnow + 1 && cOrP === "current") {
			stringPrint = "Try !checkeq. You might like it. :3";
		}
		if (hrstr >= hrnow && cOrP === "previous") {
			stringPrint = "No previous EQ Report. Have you tried !currenteq?";
		}
		if (hrstr < hrnow && cOrP === "current") {
			stringPrint = "No current EQ Report. Have you tried !previouseq?";
		}
		if (hrstr < hrnow && cOrP === "previous") {
			stringPrint = "Previous EQ Report from PSO2es: " + jsonEQ[eqstr] + " (JP: " + eqstr + "@" + hrstr + ":" + mnstr + " JST)";
		}
	}

expCmds = {
	"checkeq": {
		description: "Responds with a message whether there is an upcoming EQ or not.",
		process: function(bot,msg) {
			getNotice();
			var d = new Date();
			var hrnow = d.getHours();
			
			if (hrstr == hrnow + 1) {
				bot.sendMessage(msg.channel, msg.author + " Incoming EQ Report from PSO2es: " + jsonEQ[eqstr] + "\n(JP: " + eqstr + "@" + hrstr + ":" + mnstr + " JST)");
			} else {
				bot.sendMessage(msg.channel, msg.author + " No new EQ Report from PSO2es.");
			}
		}
	},
	"currenteq": {
		description: "Responds with the current EQ for this hour, if there is one.",
		process: function(bot,msg) {
			getNotice();
			prevTime("current");
			bot.sendMessage(msg.channel, stringPrint);
		}
	},
	"previouseq": {
		description: "Responds with the most recent previous EQ.",
		process: function(bot,msg) {
			getNotice();
			prevTime("previous");
			bot.sendMessage(msg.channel, stringPrint);
		}
	}
}

module.exports = [expFuncs, expCmds];
