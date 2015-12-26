/*
Welcome to MarinaBot v2.0a for Discord.js!!!

Special thanks to Discord and its creators Hammer & Chisel, inc.,
 Discord.js and its creator hydrabolt, and DiscordBot and its creator chalda!
 
 http://www.discordapp.com/
 https://github.com/hydrabolt/discord.js
 https://github.com/chalda/DiscordBot/


*/

// Resource files for usage by MarinaBot, such as commands
var commands, settings, aliases, admins, pingpong;
var expCmdsStack = {};
var intervals = [];
var expCmds = [];

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

// Create the bot and other server related instances
var bot = new Discord.Client();

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
	admins = require("./plugins/admins.json");
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

// And finally, the login file.
try {
	var AuthDetails = require("./auth.json");
} catch(e) {
	console.log("Couldn't find auth.json file, needed for sign-in. " + e);
}

// Recently added plugins directory!!!
try {
	require('fs').readdirSync(__dirname + '/plugins').forEach(function(file) {
	  if (file.match(/\.js$/) !== null && file !== 'index.js') {
		var name = file.replace('.js', '');
		exports[name] = require('./plugins/' + file);
		// If this plugin has any functions, we'll add it to a stack.
		if (exports[name][0]) {
			intervals.push(name);
		}
	  }
	});
} catch(e) {
	console.log("No plugins found. " + e);
}

// And grab any commands from plugins as well...
try {
	for (var i = 0; i < intervals.length; i++) {
		expCmds.push(exports[intervals[i]][1]);
	}
} catch(e) {
	console.log(e);
}

// And push the commands to one stack for later...
try {
	for (var i = 0; i < intervals.length; i++) {
		for (var cmd in expCmds[i]) {
			expCmdsStack[cmd] = 1;
		}
	}
} catch(e) {
	console.log(e);
}


// When the bot comes online...
bot.on("ready", function () {
	// Let's just send this to the console.
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");

	// Send a message to the #general channel of each server, letting everyone know we're online.
	if (settings.loginMessage) {
		for (var i = 0; i < bot.channels.length; i++) {
			if (bot.channels[i].name == "general") {
				bot.sendMessage(bot.channels[i].id, settings.loginMessage.toString());
			}
		}
	}
	
	// Set game I'm playing to....
	try {
		bot.setPlayingGame(settings.gamePlaying);
	} catch(e) { // Or not.....
		console.log(e);
		//return;
	}
	
	try {
		// Run all the plugin intervals fn60sec functions once at start....
		for (var i = 0; i < intervals.length; i++) {
			if (exports[intervals[i]][0].fn60sec) {
				exports[intervals[i]][0].fn60sec(bot);
			}
		}
		// Then set the interval timer.
		setInterval(function () { for (var i = 0; i < intervals.length; i++) {
				if (exports[intervals[i]][0].fn60sec) {
					exports[intervals[i]][0].fn60sec(bot);
				}
			}
		}, 60000);
	} catch(e) {
		console.log(e);
	}
	
	try {
		// And run all plugin runOnce functions.
		for (var i = 0; i < intervals.length; i++) {
			if (exports[intervals[i]][0].runOnce) {
				exports[intervals[i]][0].runOnce(bot);
			}
		}
	} catch(e) {
		console.log("Nope again. " + e);
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
	if (randomReply == 1 && msg.author.id != bot.user.id && !msg.isMentioned(bot.user) && settings.aiEnabled == true
	&& settings.aiRandomReply == true) {
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
		var cmdTxt = msg.content.split(" ")[0].substring(1).toLowerCase().replace(/[^a-z0-9_!]/gi,'');
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
        if (cmdTxt === "help") {
            //help is special since it iterates over the other commands
            for (var cmd in commands) {
				if ((!commands[cmd].adminlvl || admins[msg.author.id] >= commands[cmd].adminlvl) && commands[cmd].disabled != true && commands[cmd].hidden != true) {
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
			for (var cmd in pingpong) {
				var info = "!" + cmd;
				bot.sendMessage(msg.channel, info + "\n\tPersonalized command made by the admins. Try it out!")
			}
			for (var i = 0; i < expCmds.length; i++) {
				for (var cmd in expCmds[i]) {
					if ((!expCmds[i][cmd].adminlvl || admins[msg.author.id] >= expCmds[i][cmd].adminlvl) && expCmds[i][cmd].disabled != true && expCmds[i][cmd].hidden != true) {
						var info = "!" + cmd;
						var usage = expCmds[i][cmd].usage;
						if (usage) {
							info += " " + usage;
						}
						var description = expCmds[i][cmd].description;
						if(description){
							info += "\n\t" + description;
						}
						bot.sendMessage(msg.channel,info);
						
					}
				}
			}
        } else if ((commands[cmdTxt] && (admins[msg.author.id] >= commands[cmdTxt].adminlvl || !commands[cmdTxt].adminlvl)
			&& (commands[cmdTxt].disabled != true || !commands[cmdTxt].disabled)) || pingpong[cmdTxt] || expCmdsStack[cmdTxt]) {
				
			if (!commands[cmdTxt] && pingpong[cmdTxt]) {
				var commandTxt = pingpong[cmdTxt];
				bot.sendMessage(msg.channel, commandTxt);
			} else if (!commands[cmdTxt] && !pingpong[cmdTxt]) {
				for (var i = 0; i < expCmds.length; i++) {
				if (expCmds[i][cmdTxt] && ((admins[msg.author.id] >= expCmds[i][cmdTxt].adminlvl) || !expCmds[i][cmdTxt].adminlvl)) {
						expCmds[i][cmdTxt].process(bot,msg,suffix);
						return;
					}
				}
			} else if (commands[cmdTxt].disabled != true) {
				commands[cmdTxt].process(bot,msg,suffix);
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

	if (msg.content.substring(0, 5).toLowerCase() === "shake" && msg.sender.username !== "CirnoBot") {
		//send a message to the channel the ping message was sent in.
		
		var randomnumber = (Math.floor(Math.random() * 6) + 1);

		if (randomnumber == 1) {
			bot.sendMessage(msg.channel, "NOOOOOO!!!!! *throws " + msg.sender.username + "*");
		} else {
			var shakeWut = msg.content.substring(6, 11).toLowerCase();
			//var theShaken;
			var shakeString = "grabs and shakes ";
			if (shakeWut === "shake") {
				shakeString += msg.sender.username.replace(" ", '');
				bot.sendMessage(msg.channel, "*" + shakeString + "*");
			} else {
				if (msg.content.substr(6).replace(/[^a-z_ ]/gi,'').trim() == "") {
					bot.sendMessage(msg.channel, "*shakes the air*");
					return;
				} else {
				shakeString += msg.content.substr(6).replace(/[^a-z_ ']/gi,'').trim();
					bot.sendMessage(msg.channel, "*" + shakeString + "*");

				}
			}
		}

		//alert the console
		console.log("ShakeShake-ed " + msg.sender.username);
	}

});
 

// Log user status changes
bot.on("presence", function(data) {
	console.log(data.user+" went "+data.status);
});

// Needed for login information.
bot.login(AuthDetails.email, AuthDetails.password);

function isInteger(x) {
	return Math.round(x) === x;
}

function testArray(array, obj) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === obj) {
			return true;
		}
	}
	return false;
}
