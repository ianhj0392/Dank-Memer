const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({Memer, msg, guildEntry}) => {
    const enabledCommands = guildEntry.props.enabledCommands.filter(cmd => guildEntry.props.disabledCategories.includes(Memer.cmds.find(c => c.props.triggers.includes(cmd)).category.split(' ')[1].toLowerCase()));
    return {
      author:
        { name: `Server Config for ${msg.channel.guild.name}`,
          icon_url: msg.channel.guild.iconURL
        },
      fields: [
        {
          name: 'Prefix',
          value: guildEntry.props.prefix,
          inline: true
        },
        {
          name: 'Modlog Channel',
          value: guildEntry.props.modlog || 'No modlog channel set',
          inline: true
        },
        {
          name: 'Disabled Commands',
          value: guildEntry.props.disabledCommands.map(cmd => `\`${cmd}\``).join(', ') || 'No disabled commands',
          inline: true
        },
        {
          name: 'Disabled Categories',
          value: guildEntry.props.disabledCategories.map(cmd => `\`${cmd}\``).join(', ') || 'No disabled categories',
          inline: true
        },
        {
          name: 'Enabled Commands',
          value: enabledCommands.map(c => `\`${c}\``).join(', ') || 'No overriding enabled commands',
          inline: true
        },
        {
          name: 'Whitelisted Roles',
          value: guildEntry.props.whitelistRoles.map(r => `<@&${r}>`).join(', ') || 'Everyone is whitelisted',
          inline: true
        }
      ]
    };
  },
  {
    triggers: ['serverconf', 'conf'],
    description: 'show your server configuration'
  }
);
