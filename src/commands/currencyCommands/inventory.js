const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, userEntry, guildEntry }) => {
    const page = Number(msg.args.nextArgument) || 1;
    const user = msg.args.resolveUser() || msg.author;
    const userItems = userEntry.props.inventory;
    const items = [];
    for (const i in userItems) {
      const item = Memer.currency.shop[i];
      if (userEntry.hasInventoryItem(i)) {
        items.push(`**${item.name}** ─ ${userItems[i]}\n*ID* \`${item.id}\` ─ ${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}\n`);
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
      pageLength: 7
    }, page);
  },
  {
    triggers: ['inventory', 'inv'],
    cooldown: 5e3,
    donorCD: 3e3,
    perms: ['embedLinks']
  }
);
