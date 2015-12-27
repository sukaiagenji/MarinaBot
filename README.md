# Discord is down???

Well, it seems Discord went down around 8amEST this morning. At least, for me. I'm not sure if anyone will remember this GitHub is here, but I'll be on PSO2 when I get up later, and I'll hope Discord is back up. I'll see everyone later!!!

# MarinaBot

MarinaBot is a Discord bot that uses discord.js. She is licensed under GPL for any and all usage, just be sure to include me and other contributors in any edits made, as I have.

#Installation
There are a few steps before you start using Marina for the first time. First, you must install node.js onto your system. A quick internet search for your operating system will show you how to do that. Then, you'll need to get discord.js. Just run<br>`npm install discord.js`<br>and everything will be set up for you. Finally, download and extract Marina to a folder, and move on to Setting up Marina!

#Setting up Marina
There are 8 settings you'll need to edit in settings.json, as well as auth.json. auth.json is self-explanatory. But the others.....

`discordjsLocation`<br>Simply the path to your discord.js installation. Hint: You're actually aiming for a folder.<br>
`botLocation`<br>Wherever the folder of your bot is. 2easy.<br>
`loginMessage`<br>Whatever you want your bot to say when it logs in, so that you know she's online! Leave blank for no login message.<br>
`gamePlaying`<br>If you want your bot to be "playing a game", simply enter a number. See discord.js/ref/gameMap.json for valid games.<br>
~~`PSO2Bot`<br>Marina was set to be a PSO2 EQ Alert Bot, so I kept this for reference.~~ No longer needed!!!<br>
`aiEnabled`<br>Marina can do AIML AI through PandoraBots!!! If you set this to true, she *must* have a botid set.<br>
`botid`<br>Simply the bot ID of the PandoraBot that you'll be using. I'll set instructions later, or just leave it.<br>
`aiRandomReply`<br>If you want Marina to randomly reply to guests, set this to true. She'll respond in any room!!!<br>
`aiIsolated`<br>If you don't want everyone spamming your chat with @s to your AI bot, make a text channel, and put the name here to isolate the AI @s.

#Usage
Be sure MarinaBot is already on your server (AKA joined) before anything else. Once she's joined, make sure to edit the auth.json and settings.json files to your liking, then simply run `node MarinaBot.js`. If everything has been set up correctly, you'll get a message with what files you're missing, and how many channels MarinaBot is serving.

#Advanced
Check out the commands.js file for things like adminlvl and command disabling. Simply.....<br>
adminlvl can be any number, from 0 to 99 for a total of 100 levels. Basically, the higher a person's adminlvl, the more they can do. I only needed 5 levels, so 4 was my highest number.<br>
Certain commands have a `disabled` variable. Setting a command's `disabled` to true removes the command from usage. ~~Best combined with plugin removal, or if you don't need certain commands, like `!checkeq`.~~ There are still some commands with "plugins", but just setting them with a `disabled` will work. My plugins, however, just need to be renamed from `*.js` to `*.somethingbesidesjs`.

TODO: Explain AI setup through PandoraBots.

#PSO2 EQ Alerts Status
As of now, MarinaBot will auto-alert for any PSO2 EQs and `!checkeq`, but won't do her other 2 commands `!previouseq`, or `!currenteq`. I also hope to include a calendar function for scheduled EQs, but that may be a little much for MarinaBot right now.

#Marina's Future
There's a LOT of functionality that I'm leaving out right now, such as the Google Image plugin, Wikipedia plugin, and others. I hope to add a few more items to settings.json and include the plugins, with an ability to disable them. ~~I'll also be adding back the ability to add commands on the fly, including full functionality. If you look at the commands.js file, you'll see what I mean.~~ SIMPLE PINGPONG COMMAND ADDITION FUNCTIONS ADDED BACK!!! ~~I also intend to add admin and superuser files so that only certain people can run certain commands. As of now, so long as MarinaBot has the ability, anyone, and I mean ANYONE, can add or delete a channel. Not good.~~ FIXED!!! Expect more fun things tomorrow!!!

#Marina's Past
If you've seen my previous version of Marina, she has definitely come a long way from a simple pingpong bot. I added many little things, like !rules and !symbols, and even the ever so wonderful "SHAKE SHAKE" that everyone enjoyed.

#TODO

~~I've still got a couple commands to work on, and I'm considering moving the PSO2 EQ Alert system into its own plugin. But that's for later. I haven't slept yet.~~ PSO2 EQ ALERTS PLUGIN IS NOW AVAILABLE!!! :D I'll also add `git` commands for downloading Marina, and how valuable `git` is for keeping your own bot up to date!!!
