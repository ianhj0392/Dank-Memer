const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, Currency, userEntry }) => {
    const page = Number(msg.args.nextArgument) || 1;
    const shopItems = Currency.shop;
    const items = [];
    for (let item of Object.values(shopItems)) {
      items.push(`**${item.name}** ─ *ID* \`${item.id}\` ─ ${item.type.charAt(0).toUpperCase()}${item.type.slice(1)}\n`);
    }

    if (items < 1) {
      return 'You suck, you have nothing. You can use `pls shop` to see what\'s in store though';
    }
    return Memer.paginationMenu(items, {
      type: 'Current items in the shop',
      embed: {
        title: `Meme Shop`,
        description: 'alright dog this is what we\'ve got in store today'
      },
      pageLength: 7
    }, page);
  },
  {
    triggers: ['shop', 'store'],
    cooldown: 5e3,
    donorCD: 3e3,
    perms: ['embedLinks']
  }
);
