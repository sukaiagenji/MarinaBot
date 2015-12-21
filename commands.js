var aliases, admins, pingpong;

try {
	aliases = require("./alias.json");
} catch(e) {
	aliases = {};
}

try {
	admins = require("./admins.json");
} catch(e) {
	admins = {};
}

try {
	pingpong = require("./pingpong.json");
} catch(e) {
	pingpong = {};
}

try {
	rules = require("./rules.json");
} catch(e) {
	rules = {};
}

try {
	game_abbreviations = require("./gameMap.json");
} catch(e) {
	game_abbreviations = {};
	console.log("Game abbreviations not found. " + e);
}

commands = {
	"gif": {
		disabled: true,
		usage: "<image tags>",
        description: "returns a random gif matching the tags passed",
		process: function(bot, msg, suffix) {
		    var tags = suffix.split(" ");
		    get_gif(tags, function(id) {
			if (typeof id !== "undefined") {
			    bot.sendMessage(msg.channel, "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
			else {
			    bot.sendMessage(msg.channel, "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
		    });
		}
	},
    "ping": {
        description: "responds pong, useful for checking if bot is alive",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, msg.sender+" pong!");
            if(suffix){
                bot.sendMessage(msg.channel, "note that !ping takes no arguments!");
            }
        }
    },
	"game": {
		usage: "<name of game>",
		description: "pings channel asking if anyone wants to play",
		adminlvl: 1,
		process: function(bot,msg,suffix) {
            var game = game_abbreviations[suffix.toLowerCase()];
            if(!game) {
				for (var i in game_abbreviations) {
					if (game_abbreviations[i] == suffix) {
						game = game_abbreviations[i];
					}
				}
            }
			if (game) {
				bot.sendMessage(msg.channel, "@everyone Anyone up for " + game + "? From " + msg.author);
				console.log("sent game invites for " + game);
			} else {
				bot.sendMessage(msg.channel, msg.author + " Sorry, I don't know that game.");
				console.log(msg.author.username + " tried to play " + suffix);
			}
		}
	},
	"savegame": {
		usage: "<abbrev> <game title>",
		description: "Creates a new game and abbreviation for !game",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift().toLowerCase();
			if(!name){
				bot.sendMessage(msg.channel,"!savegame " + this.usage + "\n" + this.description);
			} else {
				var command = args.join(" ");
				game_abbreviations[name] = command;
				//now save the new game
				require("fs").writeFile("./gameMap.json",JSON.stringify(game_abbreviations,null,4), null);
				bot.sendMessage(msg.channel,"created game " + name);
			}
		}
	},
	"delgame": {
		usage: "<name>",
		description: "Deletes a game and abbreviation.",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift();
			if(!name){
				bot.sendMessage(msg.channel,"!delgame " + this.usage + "\n" + this.description);
			} else {
				delete game_abbreviations[name.toLowerCase()];
				//now save the new rules file
				require("fs").writeFile("./gameMap.json",JSON.stringify(game_abbreviations,null,4), null);
				bot.sendMessage(msg.channel,"deleted game " + name);
			}
		}
	},
    "servers": {
        description: "lists servers bot is connected to",
		adminlvl: 4,
        process: function(bot,msg){bot.sendMessage(msg.channel,bot.servers);}
    },
    "channels": {
        description: "lists channels bot is connected to",
		adminlvl: 4,
        process: function(bot,msg) { bot.sendMessage(msg.channel,bot.channels);}
    },
    "myid": {
        description: "returns the user id of the sender",
		adminlvl: 1,
        process: function(bot,msg){bot.sendMessage(msg.channel,msg.author.id);}
    },
    "idle": {
        description: "sets bot status to idle",
		adminlvl: 4,
        process: function(bot,msg){ bot.setStatusIdle();}
    },
    "online": {
        description: "sets bot status to online",
		adminlvl: 4,
        process: function(bot,msg){ bot.setStatusOnline();}
    },
    "youtube": {
		disabled: true,
        usage: "<video tags>",
        description: "gets youtube video matching tags",
        process: function(bot,msg,suffix){
            youtube_plugin.respond(suffix,msg.channel,bot);
        }
    },
    "say": {
        usage: "<message>",
        description: "bot says message",
		adminlvl: 1,
        process: function(bot,msg,suffix){ bot.sendMessage(msg.channel,suffix);}
    },
	"announce": {
        usage: "<message>",
        description: "bot says message with text to speech",
		adminlvl: 2,
        process: function(bot,msg,suffix){ bot.sendMessage(msg.channel,suffix,true);}
    },
    "image": {
		disabled: true,
        usage: "<image tags>",
        description: "gets image matching tags from google",
        process: function(bot,msg,suffix){ google_image_plugin.respond(suffix,msg.channel,bot);}
    },
    "pullanddeploy": {
		disabled: true,
		adminlvl: 4,
        description: "bot will perform a git pull master and restart with the new code",
        process: function(bot,msg,suffix) {
            bot.sendMessage(msg.channel,"fetching updates...",function(error,sentMsg){
                console.log("updating...");
	            var spawn = require('child_process').spawn;
                var log = function(err,stdout,stderr){
                    if(stdout){console.log(stdout);}
                    if(stderr){console.log(stderr);}
                };
                var fetch = spawn('git', ['fetch']);
                fetch.stdout.on('data',function(data){
                    console.log(data.toString());
                });
                fetch.on("close",function(code){
                    var reset = spawn('git', ['reset','--hard','origin/master']);
                    reset.stdout.on('data',function(data){
                        console.log(data.toString());
                    });
                    reset.on("close",function(code){
                        var npm = spawn('npm', ['install']);
                        npm.stdout.on('data',function(data){
                            console.log(data.toString());
                        });
                        npm.on("close",function(code){
                            console.log("goodbye");
                            bot.sendMessage(msg.channel,"brb!",function(){
                                bot.logout(function(){
                                    process.exit();
                                });
                            });
                        });
                    });
                });
            });
        }
    },
    "meme": {
		disabled: true,
        usage: 'meme "top text" "bottom text"',
        process: function(bot,msg,suffix) {
            var tags = msg.content.split('"');
            var memetype = tags[0].split(" ")[1];
            //bot.sendMessage(msg.channel,tags);
            var Imgflipper = require("imgflipper");
            var imgflipper = new Imgflipper(AuthDetails.imgflip_username, AuthDetails.imgflip_password);
            imgflipper.generateMeme(meme[memetype], tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
                //console.log(arguments);
                bot.sendMessage(msg.channel,image);
            });
        }
    },
    "memehelp": { //TODO: this should be handled by !help
		disabled: true,
        description: "returns available memes for !meme",
        process: function(bot,msg) {
            var str = "Currently available memes:\n"
            for (var m in meme){
                str += m + "\n"
            }
            bot.sendMessage(msg.channel,str);
        }
    },
    "version": {
		disabled: true,
        description: "returns the git commit this bot is running",
        process: function(bot,msg,suffix) {
            var commit = require('child_process').spawn('git', ['log','-n','1']);
            commit.stdout.on('data', function(data) {
                bot.sendMessage(msg.channel,data);
            });
            commit.on('close',function(code) {
                if( code != 0){
                    bot.sendMessage(msg.channel,"failed checking git version!");
                }
            });
        }
    },
    "log": {
        usage: "<log message>",
        description: "logs message to bot console",
		adminlvl: 4,
        process: function(bot,msg,suffix){console.log(msg.content);}
    },
    "wiki": {
		disabled: true,
        usage: "<search terms>",
        description: "returns the summary of the first matching search result from Wikipedia",
        process: function(bot,msg,suffix) {
            var query = suffix;
            if(!query) {
                bot.sendMessage(msg.channel,"usage: !wiki search terms");
                return;
            }
            var Wiki = require('wikijs');
            new Wiki().search(query,1).then(function(data) {
                new Wiki().page(data.results[0]).then(function(page) {
                    page.summary().then(function(summary) {
                        var sumText = summary.toString().split('\n');
                        var continuation = function() {
                            var paragraph = sumText.shift();
                            if(paragraph){
                                bot.sendMessage(msg.channel,paragraph,continuation);
                            }
                        };
                        continuation();
                    });
                });
            },function(err){
                bot.sendMessage(msg.channel,err);
            });
        }
    },
    "join-server": {
        usage: "<invite>",
        description: "joins the server it's invited to",
		adminlvl: 4,
        process: function(bot,msg,suffix) {
            console.log(bot.joinServer(suffix,function(error,server) {
                console.log("callback: " + arguments);
                if(error){
                    bot.sendMessage(msg.channel,"failed to join: " + error);
                } else {
                    console.log("Joined server " + server);
                    bot.sendMessage(msg.channel,"Successfully joined " + server);
                }
            }));
        }
    },
    "create": {
        usage: "<text|voice> <channel name>",
        description: "creates a channel with the given type and name.",
		adminlvl: 4,
        process: function(bot,msg,suffix) {
            var args = suffix.split(" ");
            var type = args.shift();
            if(type != "text" && type != "voice"){
                bot.sendMessage(msg.channel,"you must specify either voice or text!");
                return;
            }
            bot.createChannel(msg.channel.server,args.join(" "),type, function(error,channel) {
                if(error){
                    bot.sendMessage(msg.channel,"failed to create channel: " + error);
                } else {
                    bot.sendMessage(msg.channel,"created " + channel);
                }
            });
        }
    },
    "delete": {
        usage: "<channel name>",
        description: "deletes the specified channel",
		adminlvl: 4,
        process: function(bot,msg,suffix) {
            var channel = bot.getChannel("name",suffix);
            bot.sendMessage(msg.channel.server.defaultChannel, "deleting channel " + suffix + " at " +msg.author + "'s request");
            if(msg.channel.server.defaultChannel != msg.channel){
                bot.sendMessage(msg.channel,"deleting " + channel);
            }
            bot.deleteChannel(channel,function(error,channel){
                if(error){
                    bot.sendMessage(msg.channel,"couldn't delete channel: " + error);
                } else {
                    console.log("deleted " + suffix + " at " + msg.author + "'s request");
                }
            });
        }
    },
    "stock": {
		disabled: true,
        usage: "<stock to fetch>",
        process: function(bot,msg,suffix) {
            var yahooFinance = require('yahoo-finance');
            yahooFinance.snapshot({
              symbol: suffix,
              fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
            }, function (error, snapshot) {
                if(error){
                    bot.sendMessage(msg.channel,"couldn't get stock: " + error);
                } else {
                    //bot.sendMessage(msg.channel,JSON.stringify(snapshot));
                    bot.sendMessage(msg.channel,snapshot.name
                        + "\nprice: $" + snapshot.lastTradePriceOnly);
                }  
            });
        }
    },
	"wolfram": {
		disabled: true,
		usage: "<search terms>",
        description: "gives results from wolframalpha using search terms",
        process: function(bot,msg,suffix){
			if(!suffix){
				bot.sendMessage(msg.channel,"Usage: !wolfram <search terms> (Ex. !wolfram integrate 4x)");
			}
            wolfram_plugin.respond(suffix,msg.channel,bot);
        }
	},
    "rss": {
		disabled: true,
        description: "lists available rss feeds",
        process: function(bot,msg,suffix) {
            //var args = suffix.split(" ");
            //var count = args.shift();
            //var url = args.join(" ");
            //rssfeed(bot,msg,url,count,full);
            bot.sendMessage(msg.channel,"Available feeds:", function(){
                for(var c in rssFeeds){
                    bot.sendMessage(msg.channel,c + ": " + rssFeeds[c].url);
                }
            });
        }
    },
    "reddit": {
		disabled: true,
        usage: "[subreddit]",
        description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top psot there instead",
        process: function(bot,msg,suffix) {
            var path = "/.rss"
            if(suffix){
                path = "/r/"+suffix+path;
            }
            rssfeed(bot,msg,"https://www.reddit.com"+path,1,false);
        }
    },
	"alias": {
		usage: "<name> <actual command>",
		description: "Creates command aliases. Useful for making simple commands on the fly",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift();
			if(!name){
				bot.sendMessage(msg.channel,"!alias " + this.usage + "\n" + this.description);
			} else if(commands[name] || name === "help"){
				bot.sendMessage(msg.channel,"overwriting commands with aliases is not allowed!");
			} else {
				var command = args.shift();
				aliases[name] = [command, args.join(" ")];
				//now save the new alias
				require("fs").writeFile("./alias.json",JSON.stringify(aliases,null,2), null);
				bot.sendMessage(msg.channel,"created alias " + name);
			}
		}
	},
	"savecmd": {
		usage: "<name> <actual command>",
		description: "Creates simple 'ping pong' commands. Useful for keyword triggers",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift();
			if(!name){
				bot.sendMessage(msg.channel,"!savecmd " + this.usage + "\n" + this.description);
			} else if(commands[name] || name === "help"){
				bot.sendMessage(msg.channel,"overwriting commands with other commands is not allowed!");
			} else {
				var command = args.join(" ");
				pingpong[name] = command;
				//now save the new pingpong command
				require("fs").writeFile("./pingpong.json",JSON.stringify(pingpong,null,4), null);
				bot.sendMessage(msg.channel,"created command " + name);
			}
		}
	},
	"delcmd": {
		usage: "<name>",
		description: "Deletes a 'ping pong' command.",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift();
			if(!name){
				bot.sendMessage(msg.channel,"!delcmd " + this.usage + "\n" + this.description);
			} else if(commands[name] || name === "help"){
				bot.sendMessage(msg.channel,"deleting reserved commands is not allowed!");
			} else {
				delete pingpong[name.toLowerCase()];
				//now save the new pingpong file
				require("fs").writeFile("./pingpong.json",JSON.stringify(pingpong,null,4), null);
				bot.sendMessage(msg.channel,"deleted command " + name);
			}
		}
	},
	"rule": {
		usage: "<name>",
		description: "Prints out a 'rule' created by the admins.",
		adminlvl: 1,
		process: function(bot,msg,suffix) {
			var name = suffix.toLowerCase();
			if(!name){
				bot.sendMessage(msg.channel,"!rule " + this.usage + "\n" + this.description);
			} else if(commands[name] || name === "help"){
				bot.sendMessage(msg.channel,"Standard commands aren't rules.");
			} else {
				var ruleTxt = rules[name];
				if (!ruleTxt) {
					bot.sendMessage(msg.channel, msg.author + " Sorry, I don't know that rule.");
					console.log(msg.author.username + " tried rule " + suffix);
				} else {
					bot.sendMessage(msg.channel, "Internet rule " + suffix + ": " + ruleTxt);
					console.log("sent rule " + name);
				}
			}
		}
	},
	"saverule": {
		usage: "<name> <actual command>",
		description: "Creates simple 'rule' commands. Useful for keyword triggers",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift().toLowerCase();
			if(!name){
				bot.sendMessage(msg.channel,"!saverule " + this.usage + "\n" + this.description);
			} else if(commands[name] || name === "help"){
				bot.sendMessage(msg.channel,"overwriting commands with rules is not allowed!");
			} else {
				var command = args.join(" ");
				rules[name] = command;
				//now save the new rule command
				require("fs").writeFile("./rules.json",JSON.stringify(rules,null,4), null);
				bot.sendMessage(msg.channel,"created rule " + name);
			}
		}
	},
	"delrule": {
		usage: "<name>",
		description: "Deletes a 'rule' command.",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var args = suffix.split(" ");
			var name = args.shift();
			if(!name){
				bot.sendMessage(msg.channel,"!delrule " + this.usage + "\n" + this.description);
			} else if(commands[name] || name === "help"){
				bot.sendMessage(msg.channel,"deleting reserved commands is not allowed!");
			} else {
				delete rules[name.toLowerCase()];
				//now save the new rules file
				require("fs").writeFile("./rules.json",JSON.stringify(rules,null,4), null);
				bot.sendMessage(msg.channel,"deleted rule " + name);
			}
		}
	},
	"addlevel": {
		usage: "<username>",
		description: "Adds a level to the user's admin level. Needed for some commands.",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var myAdminLvl = admins[msg.author.username];
			var otherAdminLvl = admins[suffix];
			var otherAdmin;
			if (!otherAdminLvl) {
				otherAdminLvl = 0
			}
			for (var i = 0; i < bot.users.length; i++) {
				if (bot.users[i].username == suffix) {
					otherAdmin = bot.users[i].username;
				}
			}
			if (otherAdmin && myAdminLvl > otherAdminLvl + 1) {
				admins[otherAdmin] = otherAdminLvl + 1;
				//now save the new admin file
				require("fs").writeFile("./admins.json",JSON.stringify(admins,null,4), null);
				bot.sendMessage(msg.channel,"added admin " + otherAdmin + ": " + admins[otherAdmin]);
			} else {
				bot.sendMessage(msg.channel, suffix + " can't be promoted any further by you or doesn't exist");
			}
		}
	},
	"droplevel": {
		usage: "<username>",
		description: "Removes a level from the user's admin level. Needed for some commands.",
		adminlvl: 3,
		process: function(bot,msg,suffix) {
			var myAdminLvl = admins[msg.author.username];
			var otherAdminLvl = admins[suffix];
			var otherAdmin;
			if (otherAdminLvl > 0) {
				for (var i = 0; i < bot.users.length; i++) {
					if (bot.users[i].username == suffix) {
						otherAdmin = bot.users[i].username;
					}
				}
				if (otherAdmin && myAdminLvl > otherAdminLvl) {
					admins[otherAdmin] = otherAdminLvl - 1;
					//now save the new admin file
					require("fs").writeFile("./admins.json",JSON.stringify(admins,null,4), null);
					bot.sendMessage(msg.channel,"dropped admin " + otherAdmin + ": " + admins[otherAdmin]);
				}
			} else {
				bot.sendMessage(msg.channel,suffix + " at level 0 already or doesn't exist.")
			}
		}
	},
	"quit": {
		description: "Forces the bot offline. Takes no arguments.",
		adminlvl: 4,
		process: function(bot,msg,suffix) {
			if (suffix) {
				bot.sendMessage(msg.channel, msg.sender+" Wait, what am I quitting?");
			} else {
				bot.sendMessage(msg.channel, "(\u256F°\u25A1°\uFF09\u256F\uFE35 \u253B\u2501\u253B SO FSCKING DONE. I'M OUT.");
				console.log("Quit-ed by " +msg.sender.username);
				bot.logout();
			}
		}
	}
}

module.exports = commands;
