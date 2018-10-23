const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, args }) => {
    if (isNaN(args[0])) return 'Your server id will be a number';
    let mathyStuff = Math.floor(args[0] / 4194304) % Memer.config.sharder.shardCount;
    let exists = await Memer.IPC.fetchGuild(args[0]);
    if (!exists) return `That is either not a valid server id, or that shard is not currently online.\nThat being said, according to that id it's on **shard ${mathyStuff}**`;
    return `That server is on shard ${mathyStuff}`;
  }, {
    triggers: ['whatshard'],
    usage: '{command} <server id>',
    description: 'See what shard your server is on',
    missingArgs: 'Hi there, to use this command you need to use `whatshard <server id>`.\nTo get your server id, follow these instructions: https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-'
  }
);
