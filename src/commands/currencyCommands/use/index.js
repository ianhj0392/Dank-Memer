const { GenericCurrencyCommand } = require('../../../models/');
const items = require('./items');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, userEntry, donor, Currency, isGlobalPremiumGuild }) => {
    const item = Currency.shop[msg.args.gather()];
    if (!item) {
      return 'That item doesn\'t even exist what are you doing';
    }
    if (userEntry.hasInventoryItem(item.id)) {
      return 'You don\'t own this item??';
    }
    if (!item.consumable) {
      return 'You can\'t use this item :thinking:';
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
