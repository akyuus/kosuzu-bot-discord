const { error } = require('console');
const { ReactionUserManager } = require('discord.js');
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
const { token } = require('./auth.json');

const client = new CommandoClient({
    commandPrefix: '🔔',
    owner: '142907937084407808'
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['image', 'Image Posting']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag} (${client.user.id})`);
    console.log("Servers:");
    Array.from(client.guilds.cache.values()).forEach((guild) => {
        console.log(` - ${guild.name}`);
    });
    client.user.setActivity('with youma books', {type: 'PLAYING'});
});

module.exports = {client};

client.on(error, console.error);

/*
client.on('messageReactionAdd', (messageReaction, user) => {
    if(user.id === client.user.id) {
        return;
    }
    let watched = client.registry.commands.get('kosuzu').watchedIds;
    
});
*/

client.login(token);
