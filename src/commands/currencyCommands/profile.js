const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, Currency, userEntry, guildEntry }) => {
    const user = msg.args.resolveUser(true) || msg.author;
    if (user && user.id !== msg.author.id) {
      userEntry = await Memer.db.getUser(user.id);
    }
    const experience = userEntry.props.experience || 0;
    const level = userEntry.props.level || 0;
    Memer.log(userEntry.props);
    return {
      author:
          {
            name: `${user.username}'s profile`,
            icon_url: user.dynamicAvatarURL()
          },
      color: 3927039,
      description: userEntry.props.title || '', // title
      fields: [
        {
          name: 'Level',
          value: `**${level}**\n[${'■'.repeat(((level * 100) / 100) / 4).padEnd(10, '□')}](https://www.youtube.com/watch?v=Cna9OLn20Ac)`,
          inline: true
        },
        {
          name: 'Experience',
          value: `**${experience}**\n[${'□'.repeat((Math.ceil(experience / 100) * 100 - experience) / 10).padStart(10, '■')}](https://www.youtube.com/watch?v=lXMskKTw3Bc)`,
          inline: true
        },
        {
          name: 'Inventory',
          value: 'no', /* Object.values(userEntry.props.inventory).length
            ? `\`${Object.keys(userEntry.props.inventory).filter(i => userEntry.props.inventory[i] > 0).length}\` items (${
              Object.values(userEntry.props.inventory).reduce((acc, cur) => acc + cur)} total) worth \`${Object.keys(userEntry.props.inventory)
              .map(i => Currency.items[i] ? Currency.items[i].cost * userEntry.props.inventory[i] || 0 : 0)
              .reduce((acc, cur) => (acc + cur))}\` coins` : '0 items worth 0 coins' */
          inline: false
        }
      ]
    };
  },
  {
    triggers: ['profile', 'level'],
    description: 'Check out your profile or see another users',
    cooldown: 5e3,
    donorCD: 3e3,
    perms: ['embedLinks']
  }
);
