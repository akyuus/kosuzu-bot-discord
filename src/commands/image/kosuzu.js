const { DiscordAPIError, MessageEmbed } = require('discord.js');
const { Command, CommandoMessage } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const main = require('../../main.js'); 

module.exports = class KosuzuCommand extends Command {
    
    constructor(client) {
        super(client, {
            name: 'kosuzu',
            group: 'image',
            memberName: 'kosuzu',
            description: 'Sends a random image from the Kosuzu collection.'
        });

        this.watchedIds = {};
        client.on('messageReactionAdd', (messageReaction, user) => {
            if(user.id === client.user.id) {
                return;
            }
            if(!this.watchedIds[messageReaction.message.id]) {
                return;
            }

            let imageObject = this.watchedIds[messageReaction.message.id];

            if(messageReaction.emoji.name === '➡️') {
                imageObject['curr'] = imageObject['curr']+1;
                if(imageObject['curr'] === imageObject['length']+1) {
                    imageObject['curr'] = imageObject['length'];
                    return;
                }
                let reversesplit = imageObject['file'].split("/").reverse();
                let filename = reversesplit[0];
                let re = /[0-9]-/;
                filename = filename.replace(re, `${imageObject['curr']}-`);
                reversesplit[0] = filename;
                reversesplit = reversesplit.reverse();
                imageObject['file'] = reversesplit.join('/');                let newembed = new MessageEmbed()
                .setColor('#f24724')
                .attachFiles([imageObject['file']])
                .setImage(`attachment://${filename}`);
                messageReaction.message.embed(newembed)
                .then(async msg => {
                    this.watchedIds[msg.id] = {file: imageObject['file'], curr: imageObject['curr'], length: imageObject['length']};
                    await msg.react('➡️');
                    delete this.watchedIds[messageReaction.message.id];
                })
                .catch(console.error);
            }
        });
    }

    /**
     * 
     * @param {CommandoMessage} message
     * @returns Returns a filename of the kosuzu. 
     */
    kosuzu(message) {
        let filenames = fs.readdirSync(path.join(__dirname, 'Kosuzus'));
        let filename = filenames[Math.floor(Math.random()*filenames.length)];
        if(!filename.includes("-")) {
            return [path.join(__dirname, "Kosuzus/", filename)];
        }
        else {
            let returnList = [];
            let hyphenIndex = filename.indexOf("-");
            let range = parseInt(filename.substring(hyphenIndex+1, hyphenIndex+2));
            
            for(let i = 1; i <= range; i++) {
                returnList.push(path.join(__dirname, "Kosuzus/", `${filename.substring(0, hyphenIndex-1)}${i}-${range}.png`));
            }

            return returnList;
        }

    }

    async run(message) {
        let filenames = this.kosuzu(message);
        if(!filenames[0].substring(filenames[0].length-9).includes("-")) {
            let rawname = filenames[0].split("/").reverse()[0];
            let embed = new MessageEmbed()
            .attachFiles([filenames[0]])
            .setColor('#f24724')
            .setImage(`attachment://${rawname}`);
            return message.embed(embed);
        }

        else {
            let rawname = filenames[0].split("/").reverse()[0];
            let embed = new MessageEmbed()
            .attachFiles([filenames[0]])
            .setColor('#f24724')
            .setImage(`attachment://${rawname}`);
            let sent = await message.embed(embed);
            await sent.react('➡️');
            this.watchedIds[sent.id] = {file: filenames[0], curr: 1, length: filenames.length};
            const filter = (reaction, user) => false;
            sent.awaitReactions(filter, { time: 120000 })
            .then(collected => {
                delete this.watchedIds[sent.id];
            })
            .catch(console.error);
            return sent;
        }
    }

}
