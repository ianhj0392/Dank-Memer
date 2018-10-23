const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, Currency, userEntry, guildEntry }) => {
    const page = Number(msg.args.nextArgument()) || 1;
    const user = msg.args.resolveUser() || msg.author;
    if (user && user.id !== msg.author.id) {
      userEntry = await Memer.db.getUser(user.id);
    }
    const userItems = userEntry.props.inventory;
    const items = [];
    for (const i in userItems) {
      const item = Currency.items[i];
      if (item && userEntry.hasInventoryItem(i)) {
        items.push(`${Currency.emoji[item.id]} **${item.name}** ─ ${userItems[i]}\n*ID* \`${item.id}\` ─ ${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}\n`);
      }
    }

    if (items < 1) {
      return `You suck, you have nothing. You can use \`${guildEntry.props.prefix} shop\` to see what's in store though`;
    }
    return Memer.paginationMenu(items, {
      type: 'Owned Items',
      embed: {
        author:
          {
            name: `${user.username}'s inventory`,
            icon_url: user.dynamicAvatarURL()
          },
        color: 7964363
      },
      pageLength: 5
    }, page);
  },
  {
    triggers: ['inventory', 'inv'],
    cooldown: 5e3,
    donorCD: 3e3,
    perms: ['embedLinks']
  }
);
