const { Message, DiscordAPIError, MessageEmbed } = require('discord.js');
const { Command, CommandoMessage } = require('discord.js-commando');
const fs = require('fs');
const { url } = require('inspector');
const path = require('path');
const main = require('../../main.js'); 
const config = require('dotenv').config();
const { dbclient } = require('../../db.js');

module.exports = class KosuzuCommand extends Command {
    
    constructor(client) {
        super(client, {
            name: 'kosuzu',
            group: 'image',
            memberName: 'kosuzu',
            description: 'Sends a random image from the Kosuzu collection.'
        });

    }

    /**
     * 
     * @param {CommandoMessage} message
     * @returns Returns a list of urls for a random Kosuzu. 
     */
    async kosuzu(message) {
        let res, series_res, url, name, chapter;
        let urlArray = [];
        let returnobj = {
            chapter: null,
            urls: urlArray
        };

        const text = 'SELECT * FROM images OFFSET floor(random() * (SELECT COUNT(*) FROM images)) LIMIT 1';
        const series_text = `SELECT * FROM images I, seriesinfo S WHERE I.name=$1 AND I.id=S.id ORDER BY num`;
        
        try {
            res = await dbclient.query(text);
            returnobj.chapter = res.rows[0].chapter;
        }
        catch (err) {
            console.log(err.stack);
        }

        if(res.rows[0].series) {
            name = res.rows[0].name;
            series_res = await dbclient.query(series_text, [name]);
            series_res.rows.forEach(async (row) => {
                url = row.url;
                console.log(url);
                urlArray.push(url);
            });

            return returnobj;
            }
        else {
            urlArray.push(res.rows[0].url);
            return returnobj;
        }
    }

    /**
     * 
     * @param {Message} message 
     */
    async run(message) {
        const filter = (reaction, user) => {
            return (reaction.emoji.name === '➡️' || reaction.emoji.name === '⬅️') && user.id === message.author.id;
        };

        let { chapter, urls } = await this.kosuzu(message);
        let counter = 0;
        let embed = new MessageEmbed()
        .setColor('#f24724')
        .setImage(urls[0]);

        console.log(urls);
        if(chapter) {
            embed.setTitle(`Forbidden Scrollery Chapter ${chapter}`);
        }

        let sent = await message.embed(embed);

        if(urls.length > 1) {
            
            await sent.react('⬅️');
            await sent.react('➡️');

            const collector = sent.createReactionCollector(filter, { time: 60000 });

            collector.on('collect', async (reaction, user) => {

                if(reaction.emoji.name === '⬅️') {
                    counter = (counter - 1 + urls.length) % urls.length;
                    embed.setImage(urls[counter]);
                    await sent.edit(undefined, embed);
                }
                else {
                    counter = (counter + 1) % urls.length;
                    embed.setImage(urls[counter]);
                    await sent.edit(undefined, embed);
                }
            });
        }

        return sent;
    }

}
