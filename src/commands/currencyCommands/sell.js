const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, Currency, userEntry }) => {
    const item = Currency.search(msg.args.args[0]) || Currency.search(msg.args.gather());
    const quantity = Number(msg.args.args[1]) || 1;
    if (!item) {
      return 'what are you thinking tbh that item isn\'t even in the shop';
    }
    if (quantity < 1) {
      return 'Are you stupid you can\'t sell less than 1 of something lol';
    }
    if (!userEntry.hasInventoryItem(item.id)) {
      return 'you don\'t own this item lol';
    }
    if (userEntry.props.inventory[item.id] < quantity) {
      return `Don't try to swindle me, you only have ${userEntry.props.inventory[item.id]} of this item.`;
    }

    await addCD();
    userEntry.removeInventoryItem(item.id, quantity);
    // Sell an item for a third of what it's worth unless it's a collectable
    const worth = Math.floor((item.cost / (item.type !== Currency.ItemTypes.COLLECTABLE ? 3 : 1.66)) * quantity);
    await userEntry.addPocket(worth).save();

    return {
      author:
        {
          name: 'Successful sale',
          icon_url: msg.author.dynamicAvatarURL()
        },
      description: `You successfully sold ${quantity} **${item.name}**${quantity !== 1 ? '\'s' : ''} and gained \`${worth} coin${worth !== 1 ? 's' : ''}\``,
      color: 16740419
    };
  },
  {
    triggers: ['sell'],
    description: 'Sell one of your items',
    cooldown: 5e3,
    donorCD: 3e3,
    perms: ['embedLinks']
  }
);
