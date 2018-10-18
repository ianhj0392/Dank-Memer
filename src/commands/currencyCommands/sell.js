const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, Currency, userEntry }) => {
    const query = msg.args.args[0];
    const quantity = msg.args.args[1] || 1;
    if (!Currency.shop[query]) {
      return 'what are you thinking tbh that item isn\'t even in the shop';
    }
    if (quantity < 1) {
      return 'Are you stupid you can\'t sell less than 1 of something lol';
    }
    if (!userEntry.hasInventoryItem(query)) {
      return 'you don\'t own this item lol';
    }

    await addCD();
    const item = Currency.shop[query];
    await userEntry.removeInventoryItem(item.id, quantity);
    // Sell an item for a third of what it's worth
    const worth = Math.floor((item.cost / item.type === Currency.ItemTypes.COLLECTABLE ? 3 : 1.66) * quantity);
    await userEntry.addPocket(worth).save();

    return {
      author:
        {
          name: 'Successful sale',
          icon_url: msg.author.dynamicAvatarURL()
        },
      description: `You successfully sold ${quantity} **${item.name}**${quantity !== 1 ? '\'s' : ''} and gained \`${worth} coin${worth !== 1 ? '\'s' : ''}\``,
      color: 16740419
    };
  },
  {
    triggers: ['sell'],
    cooldown: 5e3,
    donorCD: 3e3,
    perms: ['embedLinks']
  }
);
