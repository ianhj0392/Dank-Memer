const { GenericCommand } = require('../../models/');

module.exports = new GenericCommand(
  async ({ Memer, msg }) => {
    let guild = msg.channel.guild;
    let owner = Memer.bot.users.get(guild.ownerID);
    const creation = new Date(guild.createdAt);
    return {
      title: `${guild.name} - ${guild.id}`,
      thumbnail: { url: guild.iconURL },
      fields: [
        { name: 'Created at', value: creation.toDateString(), inline: true },
        { name: 'Server Owner', value: owner.username + '#' + owner.discriminator, inline: true },
        { name: 'Members', value: `${guild.memberCount} (${guild.members.filter(user => user.bot).length} bots)`, inline: true },
        { name: 'Emotes', value: guild.emojis.length, inline: true },
        { name: 'Icon URL', value: `[Click Here](${guild.iconURL})`, inline: true },
        { name: 'Region', value: guild.region, inline: true },
        { name: 'Server Roles', value: guild.roles.map(r => r.name).join(', '), inline: true }
      ],
      footer: { text: 'Use serverconf to see guild settings' }
    };
  }, {
    triggers: ['serverinfo', 'si'],
    usage: '{command}',
    description: 'See info about this server'
  }
);
