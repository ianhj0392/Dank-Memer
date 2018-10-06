const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, guildEntry }) => {
    if (!msg.member.permission.has('manageGuild') && !Memer.config.options.developers.includes(msg.author.id)) {
      return 'You are not authorized to use this command. You must have `Manage Server` to disable commands.';
    }

    await guildEntry.toggleSwearFilter().save();
    if (guildEntry.props.swearFilter) {
      msg.channel.createMessage('No more swear words in this christian server :sunglasses:');
    } else {
      msg.channel.createMessage('Swearing is now allowed :rage:');
    }
  }, {
    triggers: ['noswears', 'noswear', 'swearfilter', 'toggleswear'],
    usage: '{command}',
    description: 'NO SWEARS IN THIS CHRISTIAN SERVER'
  }
);
