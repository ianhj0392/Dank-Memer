const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, Currency, userEntry, guildEntry }) => {
    const user = msg.args.resolveUser(true) || msg.author;
    if (user && user.id !== msg.author.id) {
      userEntry = await Memer.db.getUser(user.id);
    }
    const experience = userEntry.props.experience;
    const level = userEntry.props.level;
    Memer.log(((experience / (Math.ceil(experience / 100) * 100 - experience)) * 1.6) / 10);
    return {
      author:
          {
            name: `${user.username}'s profile`,
            icon_url: user.dynamicAvatarURL()
          },
      color: 3927039,
      fields: [
        {
          name: 'Level',
          value: `**${level}**\n[${'□'.repeat(((Math.ceil(level / 100) * 100 - level) / 10) / 4).padStart(10, '■')}](https://dankmemer.lol)`,
          inline: true
        },
        {
          name: 'Experience',
          value: `**${experience}**\n[${'□'.repeat((Math.ceil(experience / 100) * 100 - experience) / 10).padStart(10, '■')}](https://dankmemer.lol)`,
          inline: true
        },
        {
          name: 'Inventory',
          value: `\`${Object.keys(userEntry.props.inventory).filter(i => userEntry.props.inventory[i] > 0).length}\` items (${Object.values(userEntry.props.inventory).reduce((acc, cur) => acc + cur)} total) worth \`${Object.keys(userEntry.props.inventory)
            .map(i => Currency.items[i] ? Currency.items[i].cost || 0 : 0)
            .reduce((acc, cur) => acc + cur)}\` coins`,
          inline: false
        }
      ]
    };
  },
  {
    triggers: ['profile', 'level'],
    cooldown: 5e3,
    donorCD: 3e3,
    perms: ['embedLinks']
  }
);
