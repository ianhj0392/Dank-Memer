const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, args, guildEntry }) => {
    if (!msg.member.permission.has('manageGuild') && !Memer.config.options.developers.includes(msg.author.id)) {
      return 'You are not authorized to use this command. You must have `Manage Server` to enable commands.';
    }

    if (!args[0]) {
      return { content: `Specify a command/category to enable, or multiple.\n\nExample: \`${guildEntry.props.prefix} enable meme trigger shitsound\` or \`${guildEntry.props.prefix} enable meme\`
      \nYou can also enable categories by specifying the category name, for example: \`${guildEntry.props.prefix} enable nsfw\``,
      reply: true };
    }

    const categories = Memer.cmds.map(c => c.category.split(' ')[1].toLowerCase());
    if (args.some(cmd => !Memer.cmds.has(cmd.toLowerCase()) && !Memer.cmds.has(Memer.aliases.get(cmd.toLowerCase())) && !categories.includes(cmd))) {
      return `The following commands or categories are invalid: \n\n${args.filter(cmd => !Memer.cmds.find(c => c.props.triggers.includes(cmd)) && !categories.includes(cmd)).map(cmd => `\`${cmd}\``).join(', ')}\n\nPlease make sure all of your commands are valid and try again.`;
    }

    args = Memer.removeDuplicates(args
      .map(cmd => {
        return (Memer.cmds.has(cmd.toLowerCase()) || Memer.cmds.has(Memer.aliases.get(cmd.toLowerCase())) || { props: { triggers: [cmd] } }).props.triggers[0];
      }));

    const arentDisabled = args.filter(cmd => (!guildEntry.props.disabledCommands.includes(cmd) && !guildEntry.props.disabledCategories.includes(cmd)) ||
      (guildEntry.props.enabledCommands.includes(cmd)) ||
      ((Memer.cmds.has(cmd.toLowerCase()) || Memer.cmds.has(Memer.aliases.get(cmd.toLowerCase()))) && guildEntry.props.disabledCategories.includes((Memer.cmds.get(cmd.toLowerCase()) || Memer.cmds.get(Memer.aliases.get(cmd.toLowerCase()))).category)));
    if (arentDisabled[0]) {
      return `These commands/categories aren't disabled:\n\n${arentDisabled.map(c => `\`${c}\``).join(', ')}\n\nHow tf do you plan to enable already enabled stuff??`;
    }

    const categoriesToEnable = args.filter(a => categories.includes(a));
    const commandsToEnable = args.filter(a => !categories.includes(a));
    if (categoriesToEnable[0]) {
      guildEntry.enableCategories(categoriesToEnable);
    }
    if (commandsToEnable[0]) {
      guildEntry.enableCommands(commandsToEnable);
    }

    await guildEntry.save();

    return `The following commands/categories have been enabled successfully:\n\n${args.map(cmd => `\`${cmd}\``).join(', ')}`;
  }, {
    triggers: ['enable'],
    description: 'Use this command to enable disabled commands or categories.'
  }
);
