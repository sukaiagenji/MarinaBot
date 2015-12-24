var aliases, admins, pingpong;

try {
	aliases = require("./alias.json");
} catch(e) {
	aliases = {};
}

try {
	admins = require("./plugins/admins.json");
} catch(e) {
	admins = {};
}

try {
	pingpong = require("./pingpong.json");
} catch(e) {
	pingpong = {};
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
    "myid": {
        description: "returns the user id of the sender",
        process: function(bot,msg){bot.sendMessage(msg.channel,msg.author.id);}
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
	}
}

module.exports = commands;
