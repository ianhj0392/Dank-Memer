const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, args, guildEntry }) => {
    if (!msg.member.permission.has('manageGuild') && !Memer.config.options.developers.includes(msg.author.id)) {
      return 'You are not authorized to use this command. You must have `Manage Server` to disable commands.';
    }

    if (!args[0]) {
      return { content: `Specify a command to disable, or multiple.\n\nExample: \`${guildEntry.props.prefix} disable meme trigger shitsound\` or \`${guildEntry.props.prefix} disable meme\`
      \nYou can also disable categories by specifying the category name, for example: \`${guildEntry.props.prefix} disable nsfw\``,
      reply: true };
    }
    const categories = Memer.cmds.map(c => c.category.split(' ')[1].toLowerCase());
    const invalid = args.filter(cmd => (!Memer.cmds.has(cmd.toLowerCase()) && !Memer.cmds.has(Memer.aliases.get(cmd.toLowerCase())) && !categories.includes(cmd)) || ['disable', 'enable'].includes(cmd));
    if (invalid.length) {
      return { content: `The following commands or categories are invalid: \n\n${invalid.map(cmd => `\`${cmd.toLowerCase()}\``).join(', ')}\n\nPlease make sure all of your commands or categories are valid (case-sensitive!) and try again.`, reply: true };
    }

    args = Memer.removeDuplicates(args
      .map(cmd => {
        return (Memer.cmds.has(cmd.toLowerCase()) || !Memer.cmds.has(Memer.aliases.get(cmd.toLowerCase())) || { props: { triggers: [cmd] } }).props.triggers[0];
      }));

    const alreadyDisabled = args.filter(cmd => guildEntry.props.disabledCommands.includes(cmd) || guildEntry.props.disabledCategories.includes(cmd));
    if (alreadyDisabled[0]) {
      return `These commands/categories are already disabled:\n\n${alreadyDisabled.map(c => `\`${c}\``).join(', ')}\n\nHow tf do you plan to disable stuff that's already disabled??`;
    }

    const categoriesToDisable = args.filter(a => categories.includes(a));
    const commandsToDisable = args.filter(a => !categories.includes(a));
    if (categoriesToDisable[0]) {
      guildEntry.disableCategories(categoriesToDisable);
    }
    if (commandsToDisable[0]) {
      guildEntry.disableCommands(commandsToDisable);
    }

    await guildEntry.save();

    return `The following commands/categories have been disabled successfully:\n\n${args.map(cmd => `\`${cmd}\``).join(', ')}`;
  }, {
    triggers: ['disable'],
    description: 'Use this command to disable commands or categories you do not wish for your server to use'
  }
);
