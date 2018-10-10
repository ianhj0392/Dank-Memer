const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, userEntry }) => {
    const query = msg.args.args[0];
    const quantity = msg.args.args[1] || 1;
    if (!Memer.currency.shop[query]) {
      return 'what are you thinking tbh that item isn\'t even in the shop';
    }
    if (quantity < 1) {
      return 'Are you stupid you can\'t buy less than 1 of something lol';
    }
    if (quantity > 10) {
      return 'Look let\'s try and keep the quantity under 10 so the shop doesn\'t go out of business';
    }

    await addCD();
    const item = Memer.currency.shop[query];
    if (quantity > 1 && userEntry.props.pocket < (item.cost * quantity)) {
      return 'Far out, you don\'t have enough money to buy that much!!';
    }
    if (userEntry.props.pocket < item.cost) {
      return 'You don\'t have enough money to buy that item silly';
    }

    await userEntry.addInventoryItem(item, quantity);
    await userEntry.removePocket(Math.round(item.cost * quantity)).save();

    return {
      author:
        {
          name: 'Successful purchase',
          icon_url: msg.author.dynamicAvatarURL()
        },
      description: `You successfully bought ${quantity} **${item.name}**${quantity !== 1 ? '\'s' : ''} which cost you \`${Math.round(item.cost * quantity)} coins\``,
      color: 6732650
    };
  },
  {
    triggers: ['buy', 'purchase'],
    cooldown: 5e3,
    donorCD: 3e3,
    perms: ['embedLinks']
  }
);
