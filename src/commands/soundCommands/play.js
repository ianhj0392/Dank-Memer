const GenericMusicCommand = require('../../models/GenericMusicCommand');
const linkRegEx = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g;

module.exports = new GenericMusicCommand(async ({ Memer, music, args, msg }) => {
  const { playlist, track, search, noResult, failed } = Memer.musicManager.loadTypes;
  if (!msg.member.voiceState.channelID) {
    return msg.reply('join a voice channel fam');
  }

  const newSession = !music.voiceChannel || false;
  if (!music.voiceChannel) {
    await music.join(msg.member.voiceState.channelID);
  }
  let response;
  const queryString = msg.args.gather();
  if (!queryString && music.queue[0] && newSession) {
    await music._play();
    return `Loaded \`${music.queue[0].info.title}\` from last session`;
  } else if (!queryString) {
    return 'look mate this isn\'t rocket science, enter a search query or link to play';
  }
  if (linkRegEx.test(queryString)) {
    if (!queryString.startsWith('https://www.youtube.com/') && !queryString.startsWith('https://soundcloud.com/')) {
      return 'ok look i don\'t support anything else than youtube and soundcloud';
    }
    response = await Memer.musicManager.loadTrack(queryString);
  } else {
    response = await Memer.musicManager.loadTrack(`ytsearch: ${encodeURIComponent(queryString)}`);
  }
  Memer.log(response);
  const { loadType, playlistInfo, tracks } = response;
  switch (loadType) {
    case track:
      await music.addSong(tracks[0], music.queue[0] && newSession);
      return `Queued \`${tracks[0].info.title}\``;
    case playlist:
      const promises = [];
      for (const song of tracks) promises.push(music.addSong(song, music.queue[0] && newSession));
      await Promise.all(promises);
      return `Queued **${tracks.length}** songs from **${playlistInfo.name}**, happy now? jeez`;
    case search:
      await music.addSong(tracks[0], music.queue[0] && newSession);
      return `Queued \`${tracks[0].info.title}\``;
    case noResult:
      return 'Unable to find any videos by that query, what are the odds. Pretty high if you are dumb I guess';
    case failed:
      return 'I couldn\'t load that song. This may be because the song has been claimed or it\'s private. How unlucky';
  }
}, {
  triggers: ['play', 'add'],
  requiresPremium: true,
  description: 'add a song to queue'
});
