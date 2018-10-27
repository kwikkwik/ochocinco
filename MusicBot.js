const { Client, Util, RichEmbed } = require('discord.js');
const { prefix } = require('./config.json');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const opus = require("node-opus");
const gyp = require("node-gyp");
const fs = require('fs')


const client = new Client({ disableEveryone: true });

const youtube = new YouTube(process.env.YT_API);

const queue = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log(`${client.user.tag} Yo this ready!`));

client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => { // eslint-disable-line
	var message = msg;
	
	if (message.channel.type === 'dm') return;
	
	var DEFAULTPREFIX = '^'
	
	var {body} = await superagent
        .get("https://master-bot-social.glitch.me/prefixes")
	
	if (!body[message.guild.id]) {
        body[message.guild.id] = {
            prefixes: DEFAULTPREFIX
        };
    }
	const PREFIX = body[message.guild.id].prefixes
	
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(PREFIX)) return undefined;
	
	if (!message.guild) return;

  if (cooldown.has(message.author.id)) {
    return;// message.reply("Please wait **`5 Seconds`** cooldown...").then(m => m.delete(5000));
  }
 // if (!message.member.hasPermission("ADMINISTRATOR")) {
    cooldown.add(message.author.id);
 // }
	    setTimeout(() => {
        commandcooldown.delete(message.author.id);
    }, 2000); //2000 ms = 2 detik\
	
	client.user.setActivity('', {type: 'STREAMING'});

	const args = msg.content.split(' ');
	
	const searchString = args.slice(1).join(' ');
	
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)
	

	if (command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send({ embed: { description: 'I\'m sorry but you need to be in a voice channel to play music!'}});
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send({ embed: { description: 'I cannot connect to your voice channel, make sure I have the proper permissions!'}});
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send({ embed: { description: 'I cannot speak in this voice channel, make sure I have the proper permissions!'}});
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return msg.channel.send({ embed: { description: `✅ Playlist: **${playlist.title}** has been added to the queue!`}});
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					
 var selectembed = new RichEmbed()
 .setColor('RANDOM') 
 .setTitle('Song selection')
 .setDescription(`${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}`) 
 .setFooter('Please provide a value to select one of the search results ranging from 1-10') 
 
let msgtoDelete = await msg.channel.send({ embed: selectembed})
					
					
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 30000,
							errors: ['time']
						});
            msgtoDelete.delete();
					} catch (err) {
						console.error(err);
						const noPick = new RichEmbed()
            .setDescription("No or invalid value entered, cancelling video selection.")
            .setColor('RANDOM')
            msg.channel.send({embed: noPick});
            msgtoDelete.delete()
            return;
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);

				} catch (err) {
					console.error(err);
					return msg.channel.send('🆘 I could not obtain any search results.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'skip') {
		if (!msg.member.voiceChannel) return msg.channel.send({ embed: { description: 'You are not in a voice channel!'}});
		if (!serverQueue) return msg.channel.send({ embed: { description: 'There is nothing playing that I could skip for you.'}});
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === 'stop') {
		if (!msg.member.voiceChannel) return msg.channel.send({ embed: { description: 'You are not in a voice channel!'}});
		if (!serverQueue) return msg.channel.send({ embed: { description: 'There is nothing playing that I could stop for you.'}});
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		return msg.channel.send({ embed: { color: 0xef090, description: 'The music has stopped and I has left the voice channel!'}});
	} else if (command === 'volume') {

			if (!msg.member.voiceChannel) return msg.channel.send({ embed: { description: 'You are not in a voice channel!'}});
		if (!serverQueue) return msg.channel.send({ embed: { description: 'There is nothing playing.'}});
    var botRoleColorSync = msg.guild.member(client.user).highestRole.color;
		if (!args[1]) return msg.channel.send({embed: { color: 0x32ffe7,  description: `The current volume is: **${serverQueue.volume}**%`}});
		serverQueue.volume = args[1];
    if (args[1] > 100) return msg.channel.send({ embed: { description: `${msg.author} Volume limit is 100%, please do not hurt yourself!`}});
    serverQueue.volume = args[1];
    if (args[1] > 100) return !serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 100) +
    msg.channel.send({ embed: { description: `${msg.author} Volume limit is 100%, please do not hurt yourself!`}});
 
    if (args[1] < 101) return serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 100) + msg.channel.send({ embed: { description: `I set the volume to: __**${args[1]}**%__`}});

 
	} else if (command === 'np') {
    
    if(!serverQueue) return msg.channel.send({ embed: { color: 0x1D82B6, description:'There is nothing playing'}});
  const duration = (serverQueue.songs[0].duration.minutes*60000) + ((serverQueue.songs[0].duration.seconds%60000)*1000);
  const persentase = serverQueue.connection.dispatcher.time/duration;
  const curentDurationMinute = Math.floor(serverQueue.connection.dispatcher.time/60000) < 10 ? `0${Math.floor(serverQueue.connection.dispatcher.time/60000)}` : Math.floor(serverQueue.connection.dispatcher.time/60000);
  const currentDurationSeconds = Math.floor((serverQueue.connection.dispatcher.time%60000)/1000) < 10 ? `0${Math.floor((serverQueue.connection.dispatcher.time%60000)/1000)}` : Math.floor((serverQueue.connection.dispatcher.time%60000)/1000);
  const endDurationMinute = serverQueue.songs[0].duration.minutes < 10 ? `0${serverQueue.songs[0].duration.minutes}` : serverQueue.songs[0].duration.minutes;
  const endDurationSeconds = serverQueue.songs[0].duration.seconds < 10 ? `0${serverQueue.songs[0].duration.seconds}` : serverQueue.songs[0].duration.seconds;
  
  const emb = new RichEmbed()
  .setColor('RANDOM')
  .setAuthor(serverQueue.songs[0].author.tag, serverQueue.songs[0].author.avatarURL)
  .setTitle(serverQueue.songs[0].title)
  .setURL(serverQueue.songs[0].url)
  .setThumbnail(serverQueue.songs[0].thumbnail)
  .setDescription(`▶ ${progressBar(persentase)} \`[${curentDurationMinute}:${currentDurationSeconds} - ${endDurationMinute}:${endDurationSeconds}]\`🔊`);
  
  return msg.channel.send('🎶 **Now playing...**', { embed: emb});
};

function progressBar(percent){
	let num = Math.floor(percent*12);
	if(num === 1){
		return '🔘▬▬▬▬▬▬▬▬▬▬▬';
	}else if(num === 2){
		return '▬🔘▬▬▬▬▬▬▬▬▬▬';
	}else if(num === 3){
		return '▬▬🔘▬▬▬▬▬▬▬▬▬';
	}else if(num === 4){
		return '▬▬▬🔘▬▬▬▬▬▬▬▬';
	}else if(num === 5){
		return '▬▬▬▬🔘▬▬▬▬▬▬▬';
	}else if(num === 6){
		return '▬▬▬▬▬🔘▬▬▬▬▬▬';
	}else if(num === 7){
		return '▬▬▬▬▬▬🔘▬▬▬▬▬';
	}else if(num === 8){
		return '▬▬▬▬▬▬▬🔘▬▬▬▬';
	}else if(num === 9){
		return '▬▬▬▬▬▬▬▬🔘▬▬▬';
	}else if(num === 10){
		return '▬▬▬▬▬▬▬▬▬🔘▬▬';
	}else if(num === 11){
		return '▬▬▬▬▬▬▬▬▬▬🔘▬';
	}else if(num === 12){
		return '▬▬▬▬▬▬▬▬▬▬▬🔘';
	}else{
		return '🔘▬▬▬▬▬▬▬▬▬▬▬';
  } 
  
} if (command === 'queue') {
		if (!serverQueue) return msg.channel.send({ embed: { description: 'There is nothing playing.'}});
    let index = 0;
var queueembed = new RichEmbed() 

.setColor('RANDOM') 
.setTitle('Song queue') 
.setDescription(`${serverQueue.songs.map(song => `**${++index}.** ${song.title}`).join('\n')}`) 


return msg.channel.send(queueembed)
	} else if (command === 'pause') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send({ embed: { description: '⏸ Paused the music for you!'}});
		}
		return msg.channel.send({ embed: { description: 'There is nothing playing.'}});
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send({ embed: { description: '▶ Resumed the music for you!'}});
		}
		return msg.channel.send({ embed: { description: 'There is nothing playing.'}});
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	//console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`, 
		durationh: video.duration.hours,
		durationm: video.duration.minutes,
		durations: video.duration.seconds,
    duration: video.duration,   mamang: msg.member.voiceChannel.name, 
    meminta: msg.author,
    channel: msg.member.voiceChannel.name,
    author: msg.author};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 100,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send({ embed: { description: `I could not join the voice channel: ${error}`}});
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs) 
		if (playlist) return undefined;
  
    var add = new RichEmbed() 
    .setDescription(`**<:m_cek:500912712222507008> Added To Queue [${song.title}](${song.url}) \`[${require('./util.js').timeString(song.durationmm)}]\`**`)
    .setColor(0x06238B)
        
     return msg.channel.send(add);
	}
	return undefined;
}

function play(guild, song, msg) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);

	var play = new RichEmbed() 
	.addField(`<a:music:501670339567419413> Start playing`, `[${song.title}](${song.url})  \`[${require('./util.js').timeString(song.durationmm)}]\` [${song.author}]`)
	.setColor(0x06238B)
	serverQueue.textChannel.send(play).then(msg => {
        msg.delete(600000)
    });

}

client.on('message', async message => {
	const superagent = require("superagent");
  
	var DEFAULTPREFIX = '^'
	
	var {body} = await superagent
        .get("https://master-bot-social.glitch.me/prefixes")
	
	if (!body[message.guild.id]) {
        body[message.guild.id] = {
            prefixes: DEFAULTPREFIX
        };
    }
	var PREFIX = body[message.guild.id].prefixes
   // let prefix = prefixes[message.guild.id].prefixes;
    let msg = message.content.toLowerCase();
    let sender = message.author;
    let args = message.content.slice(PREFIX.length).trim().split(" ");
    let cmd = args.shift().toLowerCase();
  
    if (sender.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
    if (message.channel.type === 'dm') return;

    try {
        let commandFile = require(`./commands/${cmd}.js`);
        commandFile.run(client, message, args);
    } catch(e) {
        console.log(e.message);
    } finally {
        console.log(`${message.author.username} ran the command: ${cmd}`);
    }
});

client.login(process.env.BOT_TOKEN);
