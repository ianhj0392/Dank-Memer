const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, guildEntry }) => {
    let perms = msg.channel.permissionsOf(msg.author.id);
    if (!perms.has('manageGuild')) {
      return 'lol you do not have manage server perms and you know it';
    }

    switch (msg.args.args[0].toLowerCase()) {
      case 'dadmode':
        await guildEntry.toggleAutoResponse('dad').save();
        if (guildEntry.props.autoResponse.dad) {
          return 'Dad mode has been enabled on this server. Try it out by saying "I\'m stupid".';
        } else {
          return 'Dad mode has been disabled on this server. Thanks for nothing, stupid.';
        }

      case 'ree':
        await guildEntry.toggleAutoResponse('ree').save();
        if (guildEntry.props.autoResponse.ree) {
          return 'REE mode has been enabled on this server. Try it out by saying "ree".';
        } else {
          return 'REE mode has been disabled on this server. Thanks for nothing, stupid.';
        }

      case 'sec':
        await guildEntry.toggleAutoResponse('sec').save();
        if (guildEntry.props.autoResponse.sec) {
          return 'Second mode has been enabled on this server. Try it out by saying "one second".';
        } else {
          return 'Second mode has been disabled on this server. Thanks for nothing, stupid.';
        }

      case 'nou':
        await guildEntry.toggleAutoResponse('nou').save();
        if (guildEntry.props.autoResponse.nou) {
          return 'NO U mode has been enabled on this server. Try it out by saying "no u".';
        } else {
          return 'NO U mode has been disabled on this server. Thanks for nothing, stupid.';
        }

      default:
        return 'You need to specify which autoresponse to turn off.\n`dadmode`, `ree`, `sec`, or `NoU`';
    }
  }, {
    triggers: ['autoresponse', 'ar'],
    usage: '{command} [autoreponse choice]',
    missingArgs: 'You need to specify which autoresponse to turn off.\n`dadmode`, `ree`, `sec`, or `NoU`',
    description: 'Decide whether to enable or disable certain autoresponses on this server'
  }
);
