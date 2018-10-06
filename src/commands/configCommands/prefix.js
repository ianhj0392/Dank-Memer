const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, args, addCD, guildEntry }) => {
    if (!msg.member.permission.has('manageGuild') && !Memer.config.options.developers.includes(msg.author.id)) {
      return 'You are not authorized to use this command. You must have `Manage Server` to change the prefix.';
    }

    if (!args[0]) {
      return `What do you want your new prefix to be?\n\nExample: \`${guildEntry.props.prefix} prefix plz\``;
    }
    if (args.join(' ').length > 32) {
      return `Your prefix can't be over 30 characters long. You're ${args.join(' ').length - 32} characters over the limit.`;
    }
    const newPrefix = args.join(' ').toLowerCase();
    if (guildEntry.props.prefix === newPrefix) {
      return `\`${guildEntry.props.prefix}\` is already your current prefix.`;
    }

    await guildEntry.setPrefix(newPrefix).save();
    await addCD();

    return {
      description: `Prefix successfully changed to \`${guildEntry.props.prefix}\`.`
    };
  }, {
    triggers: ['prefix'],
    usage: '{command} <prefix of your choice>',
    description: 'Change Dank Memer\'s prefix!',
    perms: ['embedLinks'],
    cooldown: 5e3
  }
);
