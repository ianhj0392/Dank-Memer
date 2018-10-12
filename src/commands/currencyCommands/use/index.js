const { GenericCurrencyCommand } = require('../../../models/');
const items = require('./items');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, userEntry, donor, Currency, isGlobalPremiumGuild }) => {
    const item = Currency.items[msg.args.args[0]];
    if (!item) {
      return 'That item doesn\'t even exist what are you doing';
    }
    if (!userEntry.hasInventoryItem(item.id)) {
      return 'You don\'t own this item??';
    }
    if (!item.consumable) {
      return 'You can\'t use this item :thinking:';
    }
    if (item.type === Currency.ItemTypes.BOX) {
      const emoji = item.id === 'normie' ? ':wastebasket:' : item.id === 'meme' ? ':stars:' : ':trident:';
      msg.channel.createMessage(`${emoji} Opening a ${item.name}... ${emoji}`);
      await Memer.sleep(2500);

      const coins = Math.floor(Memer.randomNumber(item.rewards.coins.min, item.rewards.coins.max));
      const reward = Object.keys(Memer.randomInArray(item.rewards.items))[0];
      userEntry.addPocket(coins);
      userEntry.addInventoryItem(reward[0], reward[1]);

      await userEntry.removeInventoryItem(item.id).save();
      return `you got ${coins} coins wooow`;
    }

    const consume = items[item.id].fn({ Memer, msg, userEntry, donor, Currency, isGlobalPremiumGuild });
    if (consume) {
      await userEntry.removeInventoryItem(item.id).save();
    }
  }, {
    triggers: ['use', 'consume'],
    usage: '{command} [item]',
    description: 'Use a super cool consumable item'
  }
);
