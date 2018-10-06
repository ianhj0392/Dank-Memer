const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, guildEntry }) => {
    let perms = msg.channel.permissionsOf(msg.author.id);
    if (!perms.has('banMembers')) {
      return 'lol you do not have ban members perms and you know it';
    }
    let channel = msg.args.resolveChannel(false, false);
    if (channel) {
      const old = guildEntry.props.modlog;
      await guildEntry.setModlogChannel(channel.id).save();
      if (!old) {
        return `Ok, your modlog channel is now <#${channel.id}> now have fun abusing your mod powers`;
      }
      return `Oi, mr person with mod perms.\nYour old modlog channel was <#${old}>, your updated modlog channel is <#${channel.id}>`;
    }
    await await guildEntry.setModlogChannel('').save();
    return `Ok since I did not detect a channel mention in this command, I'm gonna assume you wanted no modlog?\nMission accomplished I guess?`;
  }, {
    triggers: ['modlog'],
    usage: '{command} [#channel]',
    description: 'Mention a channel to set/update a modlog channel, say literally anything else and remove an existing modlog channel'
  }
);
