/*
Welcome to MarinaBot v2.0a for Discord.js!!!

Special thanks to Discord and its creators Hammer & Chisel, inc.,
 Discord.js and its creator hydrabolt, and DiscordBot and its creator chalda!
 
 http://www.discordapp.com/
 https://github.com/hydrabolt/discord.js
 https://github.com/chalda/DiscordBot/


*/

// Resource files for usage by MarinaBot, such as commands and PSO2es EQ translation
var commands, settings, aliases, jsonEQ, admins, pingpong;

try {
	commands = require("./commands.js");
} catch(e) {
	console.log("Could not load commands file (required). Terminating. " + e);
}

try {
	aliases = require("./alias.json");
} catch(e) {
	//No aliases defined
	aliases = {};
	console.log("Aliases failed to load. " + e);
}

try {
	settings = require("./settings.json");
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

try {
	admins = require("./admins.json");
} catch(e) {
	admins = {};
	console.log("Admin file failed to load. " + e);
}

try {
	pingpong = require("./pingpong.json");
} catch(e) {
	pingpong = {};
	console.log("Pingpong commands not found. " + e);
}

// Let's add in EQ translation, IF we're doing EQ notifications.
if (settings.PSO2Bot == true) {
	try {
		jsonEQ = require("./eqJP.json");
	} catch(e) {
		console.log("Couldn't load EQ Translation file, needed for PSO2 EQ Bot.\n\t Try setting PSO2Bot to false in the settings file, or download the eqJP.json file.\n\t " + e)
	}
}

// And finally, the login file.
try {
	var AuthDetails = require("./auth.json");
} catch(e) {
	console.log("Couldn't find auth.json file, needed for sign-in. " + e);
}


// Create the bot and other server related instances
var bot = new Discord.Client();

// When the bot comes online...
bot.on("ready", function () {
	// Let's just send this to the console.
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");

	// Send a message to the #general channel of each server, letting everyone know we're online.
	for (var i = 0; i < bot.channels.length; i++) {
		if (bot.channels[i].name == "general") {
			bot.sendMessage(bot.channels[i].id, settings.loginMessage.toString());
		}
	}
	
	// Set game I'm playing to....
	try {
		bot.setPlayingGame(settings.gamePlaying);
	} catch(e) { // Or not.....
		return;
	}
	// Am I a PSO2 bot, or not?
	if (settings.PSO2Bot == true) {
		setInterval(fn60sec, 60000);
		fn60sec();
	}
});

// And when the bot goes offline for any reason.
bot.on("disconnected", function () {

	console.log("Disconnected!"); // Yep, we're disconnected.
	process.exit(1); //exit node.js with an error
	
});

// From DiscordBot
bot.on("message", function (msg) {
	
	// Set a random number generator for random AI responses.
	var randomReply = (Math.floor(Math.random() * 10) + 1);
	
	// And do the random AI response. Sometimes.....
	if (randomReply == 1 && msg.author.id != bot.user.id && !msg.isMentioned(bot.user) && settings.aiEnabled == true && settings.aiRandomReply == true) {
		// If the bot is allowed to Random Reply, no need to isolate. That's just silly.
		console.log("From " + msg.sender.username + ": " + msg.content);
		var querystring = require('querystring');
		var http = require('http');
		var data = querystring.stringify({
			input: msg.content,
			custid: msg.sender.username,
			botid: settings.botid.toString()
		});

		var options = {
			host: 'www.pandorabots.com',
			port: 80,
			path: '/pandora/talk-xml',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data)
			}
		};

		var req = http.request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
			var chunkSplit1 = chunk.indexOf('<that>');
			var chunkSplit2 = chunk.indexOf('</that>');
			var responce = chunk.substring((chunkSplit1 + 6), chunkSplit2);
			bot.reply(msg, responce);
			console.log("Reply: " + responce);
			});
		});

		req.write(data);
		req.end();
	}

	//check if message is a command
	if (msg.author.id != bot.user.id && msg.content[0] === '!') {
        console.log("treating " + msg.content + " from " + msg.author + " as command");
		var cmdTxt = msg.content.split(" ")[0].substring(1);
        var suffix = msg.content.substring(cmdTxt.length+2); // Add one for the ! and one for the space
        if (msg.content.indexOf(bot.user.mention()) == 0) {
			try {
				cmdTxt = msg.content.split(" ")[1];
				suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+2);
			} catch(e) { //no command
				bot.sendMessage(msg.channel,"Yes?");
				return;
			}
        }
		alias = aliases[cmdTxt];
		if (alias) {
			cmdTxt = alias[0];
			suffix = alias[1] + " " + suffix;
		}
		var cmd = commands[cmdTxt];
        if (cmdTxt === "help") {
            //help is special since it iterates over the other commands
            for (var cmd in commands) {
				if ((!commands[cmd].adminlvl || commands[cmd].adminlvl <= admins[msg.author.username]) && commands[cmd].disabled != true) {
					var info = "!" + cmd;
					var usage = commands[cmd].usage;
					if (usage) {
						info += " " + usage;
					}
					var description = commands[cmd].description;
					if(description){
						info += "\n\t" + description;
					}
					bot.sendMessage(msg.channel,info);
				}
            }
        } else if (((cmd && (admins[msg.author.username] >= cmd.adminlvl || !cmd.adminlvl)) || pingpong[cmdTxt.toLowerCase().replace(/[^a-z0-9_]/gi,'')] && cmd.disabled != true)) {
			if (!commands[cmdTxt]) {
				var commandName = cmdTxt.toLowerCase().replace(/[^a-z0-9_]/gi,'');
				var commandTxt = pingpong[commandName];
				bot.sendMessage(msg.channel, commandTxt);
			} else if (cmd.disabled != true) {
				cmd.process(bot,msg,suffix);
			}
		} else {
			bot.sendMessage(msg.channel, "Invalid command " + cmdTxt);
		}
	} else {
		//message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if (msg.author.id == bot.user.id) {
            return;
        }
        if (msg.author.id != bot.user.id && msg.isMentioned(bot.user) && !msg.content.split(" ")[1]) {
                bot.sendMessage(msg.channel,msg.author + ", you called?");
        } else if (msg.author.id != bot.user.id && msg.isMentioned(bot.user) && msg.content.split(" ")[1] && settings.aiEnabled == true) {
			// But we'll isolate here.
			var roomID;
			if (settings.aiIsolated) {
				for (var i = 0; i < bot.channels.length; i++) {
					if (bot.channels[i].name == settings.aiIsolated) {
						roomID = "<#" + bot.channels[i].id + ">"
					}
				}
			}
			console.log("From " + msg.sender.username + ": " + msg.content.substr(msg.content.indexOf(">") + 2));
			var querystring = require('querystring');
			var http = require('http');

			var data = querystring.stringify({
				input: msg.content.substr(msg.content.indexOf(">") + 2),
				custid: msg.sender.username,
				botid: settings.botid.toString()
			});

			var options = {
				host: 'www.pandorabots.com',
				port: 80,
				path: '/pandora/talk-xml',
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': Buffer.byteLength(data)
				}
			};

			var req = http.request(options, function(res) {
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
				var chunkSplit1 = chunk.indexOf('<that>');
				var chunkSplit2 = chunk.indexOf('</that>');
				var responce = chunk.substring((chunkSplit1 + 6), chunkSplit2);
				if (settings.aiIsolated) {
					if (msg.channel == roomID) {
						bot.reply(msg, responce);
						console.log("Reply: " + responce);
					} else {
						console.log("Message not sent in AI chat room. Ignored.");
					}
				}
				});
			});

			req.write(data);
			req.end();
		}
    }
});
 

// Log user status changes
bot.on("presence", function(data) {
	console.log(data.user+" went "+data.status);
});

// Needed for login information.
bot.login(AuthDetails.email, AuthDetails.password);

// Extra functions like PSO2es EQ alert
var hrnow, hridx, hrstr, str, oldstr, eqidx, eqstr, transEQ;

function fn60sec() {
	getNotice();
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
}

function isInteger(x) {
	return Math.round(x) === x;
}

function getNotice() {
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
			findhour_EQ(str);
			findtitle_EQ(str);
		});
	}

	http.request(options, callback).end();
}

function findhour_EQ(str) {
	hridx = str.indexOf('\u6642');
	if (hridx === -1) {
		return "-1";
	} else {
		hrstr = str.substring(hridx - 2, hridx);
		return;
	}
}

function findtitle_EQ(str) {
	eqidx = str.indexOf('\u3010PSO2\u3011');
	if (eqidx === -1) {
		return "-1";
	} else {
		eqstr = str.substr(eqidx + 6);
		transEQ = jsonEQ[eqstr];
	}
}

function testArray(array, obj) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === obj) {
			return true;
		}
	}
	return false;
}
