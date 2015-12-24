try {
	rules = require("./rules.json");
} catch(e) {
	rules = {};
	console.log("Rules file not found. " + e);
}

expFuncs = {};

expCmds = {
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
	}
}

module.exports = [expFuncs, expCmds];
