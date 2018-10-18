const { GenericCurrencyCommand } = require('../../../models/');
const items = require('./items');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, userEntry, donor, Currency, isGlobalPremiumGuild }) => {
    const item = Currency.items[msg.args.nextArgument()];
    if (!item) {
      return 'That item doesn\'t even exist what are you doing';
    }
    if (!userEntry.hasInventoryItem(item.id)) {
      return 'You don\'t own this item??';
    }
    if (!item.consumable) {
      return 'You can\'t use this item :thinking:';
    }
    if (await userEntry.isItemActive(item.id)) {
      return 'You can\'t use this item, you\'ve already used it and it\'s active right now!';
    }
    if (item.type === Currency.ItemTypes.BOX) {
      const emoji = item.id === 'normie' ? ':wastebasket:' : item.id === 'meme' ? ':stars:' : ':trident:';
      const boxmessage = await msg.channel.createMessage(`${emoji} Opening a ${item.name}... ${emoji}`);
      await Memer.sleep(2500);

      const coins = Math.floor(Memer.randomNumber(item.coins.min, item.coins.max));
      userEntry.addPocket(coins);
      const rewardchance = Math.random() > item.reward.chance;
      const [itemid, amount] = Object.entries(Memer.randomInArray(item.reward.items))[0];
      if (rewardchance) {
        userEntry.addInventoryItem(itemid, amount);
      }

      await userEntry.removeInventoryItem(item.id).save();
      return boxmessage.edit({ content: `good stuff, you got a solid **${coins}** coins${rewardchance ? ` and \`${amount} ${Currency.items[itemid].name}${amount !== 1 ? '\'s' : ''}\`` : ''} from your ${item.name.toLowerCase()}`, reply: true });
    }

    const consume = items[item.id].fn({ Memer, msg, userEntry, donor, Currency, isGlobalPremiumGuild });
    if (consume) {
      await userEntry.removeInventoryItem(item.id).save();
    }
    return consume;
  }, {
    triggers: ['use', 'consume'],
    usage: '{command} [item]',
    description: 'Use a super cool consumable item'
  }
);
