const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, userEntry }) => {
    const query = msg.args.args[0];
    const quantity = msg.args.args[1] || 1;
    if (!Memer.currency.shop[query]) {
      return 'what are you thinking tbh that item isn\'t even in the shop';
    }
    if (quantity < 1) {
      return 'Are you stupid you can\'t sell less than 1 of something lol';
    }

    await addCD();
    const item = Memer.currency.shop[query];
    await userEntry.removeInventoryItem(item);
    // Sell an item for a third of what it's worth
    await userEntry.addPocket(Math.floor((item.cost / 3) * quantity)).save();

    return {
      author:
        {
          name: 'Successful sale',
          icon_url: msg.author.dynamicAvatarURL()
        },
      description: `You successfully sold *${quantity}* **${item.name}**'s and gained ${Math.floor((item.cost / 3) * quantity)} coins\``,
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
