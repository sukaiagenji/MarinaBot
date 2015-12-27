var character, gender, age, height, weight, race, classType, hairLength, hairType, hairColor, eyesType, eyesColor, info, longDesc;
var ages = ["young", "seasoned", "middle-aged", "old", "ancient"];
var heights = ["short", "average", "tall"];
var weights = ["scrawny", "tiny", "average", "chubby", "overweight"];
var genders = ["male", "female"];
var races = ["human", "newman", "deuman", "cast"];
var classes = ["hunter", "fighter", "ranger", "gunner", "force", "techer", "braver", "bouncer"];
var hairLengths = ["long", "medium", "short", "bald"];
var hairTypes = ["curly", "straight", "wavey", "messy", "flowing", "spikey", "unkempt"];
var hairColors = ["black", "brown", "blonde", "red", "blue", "green", "purple", "orange", "white"];
var eyesTypes = ["piercing", "relaxed", "sharp", "focused", "conflicted", "sad", "happy", "twinkling", "worried", "empty"];
var eyesColors = ["black", "brown", "blue", "purple", "red", "green", "smokey", "sunny", "pink", "rainbow", "white"];
var currentAt = {};
var errorString = " I didn't quite get that. Try again.\n";

try {
	settings = require("../settings.json");
} catch(e) {
	//No settings file found. Terminating.
	console.log("Settings failed to load in character.js. " + e);
}

var charsFile = settings.botLocation + "/plugins/character.json";

try {
	character = require(settings.botLocation.toString() + "/plugins/character.json");
} catch(e) {
	console.log("Character set failed to load. " + e);
	character = {};
}

function onStart(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " Let's get started creating your character!!! :D");
	setTimeout(function () {
		bot.sendMessage(msg.channel, "For all questions, just answer with !! <answer>. Yes, the 2 exclamation marks are needed, and make sure there's a space between !! and <answer>, otherwise I won't understand you.");
	}, 1000);
	setTimeout(function () {
		bot.sendMessage(msg.channel, "So, Let's get going!!! Ready? !! yes or !! no");
	}, 2000);
	currentAt[msg.author.id] = "start";
}

function onGender(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " Alright! First, are you !! male or !! female?");
	currentAt[msg.author.id] = "gender";
}

function onRace(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " is definitely a " + character[msg.author.id].gender + " name. But I can't tell what you are.\nAre you...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(races)); }, 500);
	currentAt[msg.author.id] = "race";
}

function onAge(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " So, you're " + character[msg.author.id].race + ". Well, how about your age?\nYou can be...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(ages)); }, 500);
	currentAt[msg.author.id] = "age";
}

function onHeight(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " Great! You're " + character[msg.author.id].age + ". Next, how tall are you?\nYou can be...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(heights)); }, 500);
	currentAt[msg.author.id] = "height";
}

function onWeight(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " I've got you in at " + character[msg.author.id].height + ". Tell me, how much do you weight?\nYou can be...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(weights)); }, 500);
	currentAt[msg.author.id] = "weight";
}

function onClass(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " You are " + character[msg.author.id].weight + "? OK. What is your Class?\nYou can be...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(classes)); }, 500);
	currentAt[msg.author.id] = "class";
}

function onHairLength(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " You've become a " + character[msg.author.id].classType + "!!! Now, hair. How long is your hair?\nIt can be...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(hairLengths)); }, 500);
	currentAt[msg.author.id] = "hairlength";
}

function onHairType(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " I like " + character[msg.author.id].hairLength + ". But what style?\nPick from...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(hairTypes)); }, 500);
	currentAt[msg.author.id] = "hairtype";
}

function onHairColor(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " Alright, " + character[msg.author.id].hairType + ". What color is your hair?\nTry...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(hairColors)); }, 500);
	currentAt[msg.author.id] = "haircolor";
}

function onEyesType(bot,msg,suffix) {
	if (character[msg.author.id].hairLength == "bald") {
		bot.sendMessage(msg.channel, msg.author + " Bald is completely fine. On to your eyes. What kind of eyes do you have?\nYou can have...");
		setTimeout(function () { bot.sendMessage(msg.channel, callArray(eyesTypes)); }, 500);
		currentAt[msg.author.id] = "eyestype";
	} else {
		bot.sendMessage(msg.channel, msg.author + " That " + character[msg.author.id].hairColor + " looks nice. You still need eyes.\nWhat type?");
		setTimeout(function () { bot.sendMessage(msg.channel, callArray(eyesTypes)); }, 500);
		currentAt[msg.author.id] = "eyestype";
	}
}

function onEyesColor(bot,msg,suffix) {
	bot.sendMessage(msg.channel, msg.author + " Almost done, " + character[msg.author.id].eyesType + "-eyes. What color are your eyes?\nChoose...");
	setTimeout(function () { bot.sendMessage(msg.channel, callArray(eyesColors)); }, 500);
	currentAt[msg.author.id] = "eyescolor";
}

function onConfirm(bot,msg,suffix) {
	if (character[msg.author.id].hairLength != "bald") {
		bot.sendMessage(msg.channel, msg.author + " Just to be sure we have everything right, you are a " + character[msg.author.id].age + " aged, "
		+ character[msg.author.id].height + " height, " + character[msg.author.id].weight + " weighted " + character[msg.author.id].gender
		+ " " + character[msg.author.id].race + " " + character[msg.author.id].classType + " with " + character[msg.author.id].hairLength
		+ " " + character[msg.author.id].hairType + " " + character[msg.author.id].hairColor + " hair and " + character[msg.author.id].eyesType
		+ " " + character[msg.author.id].eyesColor + " eyes. Is that right? !! yes or !! no.")
	} else {
		bot.sendMessage(msg.channel, msg.author + " Just to be sure we have everything right, you are a " + character[msg.author.id].age + ", "
		+ character[msg.author.id].height + ", " + character[msg.author.id].weight + " weighted " + character[msg.author.id].gender
		+ " " + character[msg.author.id].race + " " + character[msg.author.id].classType + " with a bald head and " + character[msg.author.id].eyesType
		+ " " + character[msg.author.id].eyesColor + " eyes. Is that right? !! yes or !! no")
	}
	currentAt[msg.author.id] = "confirm";
}

function onCompleted(bot,msg,suffix) {
	require("fs").writeFile(charsFile,JSON.stringify(character,null,4), function (e) {
		if (e) {
			console.log("Error writing character.json: " + e);
			bot.sendMessage(msg.channel, msg.author + " There was a problem saving your character!!! D:");
		} else {
			bot.sendMessage(msg.channel, msg.author + " Your character file was saved!");
		}
	});
}

function callArray(array, obj) {
	info = "";
	for (var i = 0; i < array.length; i++) {
		info += "!! " + array[i] + "\t";
	}
	return info;
}

expFuncs = {
}

expCmds = {
	"setup": {
		description: "Used to set up your character!",
		adminlvl: 2,
		process: function (bot,msg,suffix) {
			if (!character[msg.author.id]) {
				character[msg.author.id] = {};
				onStart(bot,msg,suffix);
			} else {
				bot.sendMessage(msg.channel, msg.author + " You've already set up your character!!! If you want to start over, try !delchar");
			}
		}
	},
	"!": {
		description: " ",
		adminlvl: 2,
		hidden: true,
		process: function(bot,msg,suffix) {
			var answer = suffix.toLowerCase().replace(/[^a-z]/gi,'');
			switch(currentAt[msg.author.id]) {
				case "start":
					if (answer == "yes") {
						onGender(bot,msg,suffix);
					} else {
						bot.sendMessage(msg.channel, msg.author + " Oh, OK. Just let me know when you're ready by saying !! yes");
					}
					break;
				case "gender":
					if (answer == "male") {
						character[msg.author.id].gender = "male";
						setTimeout(onRace(bot,msg,suffix), 1000);
					} else if (answer == "female") {
						character[msg.author.id].gender = "female";
						setTimeout(onRace(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + "!! male or !! female");
					}
					break;
				case "race":
					if (races.indexOf(answer) != -1) {
						character[msg.author.id].race = answer;
						setTimeout(onAge(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(races));
					}
					break;
				case "age":
					if (ages.indexOf(answer) != -1) {
						character[msg.author.id].age = answer;
						setTimeout(onHeight(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(ages));
					}
					break;
				case "height":
					if (heights.indexOf(answer) != -1) {
						character[msg.author.id].height = answer;
						setTimeout(onWeight(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(heights));
					}
					break;
				case "weight":
					if (weights.indexOf(answer) != -1) {
						character[msg.author.id].weight = answer;
						setTimeout(onClass(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(weights));
					}
					break;
				case "class":
					if (classes.indexOf(answer) != -1) {
						character[msg.author.id].classType = answer;
						setTimeout(onHairLength(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(classes));
					}
					break;
				case "hairlength":
					if (hairLengths.indexOf(answer) != -1) {
						character[msg.author.id].hairLength = answer;
						if (character[msg.author.id].hairLength == "bald") {
							character[msg.author.id].hairType = " ";
							character[msg.author.id].hairColor = " ";
							setTimeout(onEyesType(bot,msg,suffix), 1000);
						} else {
							setTimeout(onHairType(bot,msg,suffix), 1000);
						}
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(hairLengths));
					}
					break;
				case "hairtype":
					if (hairTypes.indexOf(answer) != -1) {
						character[msg.author.id].hairType = answer;
						setTimeout(onHairColor(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(hairTypes));
					}
					break;
				case "haircolor":
					if (hairColors.indexOf(answer) != -1) {
						character[msg.author.id].hairColor = answer;
						setTimeout(onEyesType(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(hairColors));
					}
					break;
				case "eyestype":
					if (eyesTypes.indexOf(answer) != -1) {
						character[msg.author.id].eyesType = answer;
						setTimeout(onEyesColor(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(eyesTypes));
					}
					break;
				case "eyescolor":
					if (eyesColors.indexOf(answer) != -1) {
						character[msg.author.id].eyesColor = answer;
						setTimeout(onConfirm(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + errorString + callArray(eyesColors));
					}
					break;
				case "confirm":
					if (answer == "yes") {
						onCompleted(bot,msg,suffix);
					} else if (answer == "no") {
						bot.sendMessage(msg.channel, msg.author + " Oh, OK. Let's just start over again.");
						setTimeout(onGender(bot,msg,suffix), 1000);
					} else {
						bot.sendMessage(msg.channel, msg.author + " I can't do anything unless you say !! yes or !! no");
					}
					break;
				default:
					bot.sendMessage(msg.channel, msg.author + " I'm not sure what you're trying, so I'm just ignoring it.");
			}			
		}
	},
	"look": {
		usage: "<username>",
		adminlvl: 2,
		description: "Used to look at someone, and see what they look like!",
		process: function (bot,msg,suffix) {
			var smallUser = suffix.toLowerCase()
			for (var i = 0; i < bot.users.length; i++) {
				if (bot.users[i].username.toLowerCase() == smallUser) {
					var whoIsee = { smallUser: bot.users[i].id };
				}
			}
			if (character[whoIsee.smallUser].longDesc) {
				bot.sendMessage(msg.channel, msg.author + " " + character[whoIsee.smallUser].longDesc);
			} else if (!whoIsee) {
				if (!suffix) {
					bot.sendMessage(msg.channel, msg.author + " What am I looking at?")
				} else {
					bot.sendMessage(msg.channel, msg.author + " I don't see " + suffix + " anywhere.");
				}
				return;
			} else if (!character[whoIsee.smallUser]) {
				bot.sendMessage(msg.channel, msg.author + " You see something, but the image is fuzzy. This person hasn't run !setup yet.");
			} else if (smallUser == msg.author.username.toLowerCase()) {
				bot.sendMessage(msg.channel, msg.author + " Looking at yourself is a little conceited...")				
			} else if (character[whoIsee.smallUser].hairLength != "bald") {
				bot.sendMessage(msg.channel, msg.author + " You see a "  + character[whoIsee.smallUser].age + " aged " + character[whoIsee.smallUser].height +
				" height, " + character[whoIsee.smallUser].weight + " built " + character[whoIsee.smallUser].gender + " " + character[whoIsee.smallUser].race +
				" looking at you with " + character[whoIsee.smallUser].eyesType + " " + character[whoIsee.smallUser].eyesColor +
				" eyes, " + character[whoIsee.smallUser].hairLength + " " + character[whoIsee.smallUser].hairType + " " + character[whoIsee.smallUser].hairColor +
				" hair, trained in the ways of the " + character[whoIsee.smallUser].classType + ".")
			} else {
				bot.sendMessage(msg.channel, msg.author + " You see a "  + character[whoIsee.smallUser].age + " aged " + character[whoIsee.smallUser].height +
				" height, " + character[whoIsee.smallUser].weight + " built " + character[whoIsee.smallUser].gender + " " + character[whoIsee.smallUser].race +
				" looking at you with " + character[whoIsee.smallUser].eyesType + " " + character[whoIsee.smallUser].eyesColor +
				" eyes, a " + character[whoIsee.smallUser].hairLength + " head, trained in the ways of the " + character[whoIsee.smallUser].classType + ".")
			}
		}
	},
	"delchar": {
		adminlvl: 2,
		description: "Used to delete your character file. WARNING: WILL DELETE WITHOUT CONFIRMATION.",
		process: function (bot,msg,suffix) {
			delete character[msg.author.id];
			require("fs").writeFile(charsFile,JSON.stringify(character,null,4), function (e) {
				if (e) {
					console.log("Error writing character.json: " + e);
					bot.sendMessage(msg.channel, msg.author + " There was a problem deleting your character!!! D:");
				} else {
					bot.sendMessage(msg.channel, msg.author + " Your character file was deleted!");
				}
			});
		}
	},
	"longdesc": {
		adminlvl: 3,
		description: "Used to create a better description of yourself.",
		hidden: true,
		process: function (bot,msg,suffix) {
			character[msg.author.id].longDesc = suffix;
			require("fs").writeFile(charsFile,JSON.stringify(character,null,4), function (e) {
				if (e) {
					console.log("Error writing character.json: " + e);
					bot.sendMessage(msg.channel, msg.author + " There was a problem saving your description!!! D:");
				} else {
					bot.sendMessage(msg.channel, msg.author + " Your description was saved!");
				}
			});
		}
	},
	"deldesc": {
		adminlvl: 3,
		description: "Used to delete your better description.",
		hidden: true,
		process: function (bot,msg,suffix) {
			delete character[msg.author.id].longDesc;
			require("fs").writeFile(charsFile,JSON.stringify(character,null,4), function (e) {
				if (e) {
					console.log("Error writing character.json: " + e);
					bot.sendMessage(msg.channel, msg.author + " There was a problem deleting your description!!! D:");
				} else {
					bot.sendMessage(msg.channel, msg.author + " Your description was deleted!");
				}
			});
		}
	}
}

module.exports = [ expFuncs, expCmds ];
