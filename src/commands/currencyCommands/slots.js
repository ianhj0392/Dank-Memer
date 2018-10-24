const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

const slots = [
  { icon: '💔', multiplier: 1 },
  { icon: '💗', multiplier: 1.25 },
  { icon: '💛', multiplier: 1.5 },
  { icon: '💚', multiplier: 1.75 },
  { icon: '💙', multiplier: 2 },
  { icon: '💜', multiplier: 2.25 },
  { icon: '💖', multiplier: 2.5 },
  { icon: '💝', multiplier: 2.75 },
  { icon: '🔱', multiplier: 3 } ];

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, addCD, Currency, isGlobalPremiumGuild, donor, userEntry }) => {
    let user = msg.author;
    let multi = await Memer.calcMultiplier(Memer, user, userEntry, donor, msg, isGlobalPremiumGuild);
    let coins = userEntry.props.pocket;

    if (coins >= Currency.constants.MAX_SAFE_COMMAND_AMOUNT) {
      return 'You are too rich to use the slot machine! Why don\'t you go and do something with your coins smh';
    }

    let bet = msg.args.args[0];
    if (!bet) {
      return 'You need to bet something.';
    }
    if (isNaN(bet)) {
      if (bet === 'all') {
        bet = coins;
      } else if (bet === 'half') {
        bet = Math.round(coins / 2);
      } else {
        return 'You have to bet actual coins, dont try to break me.';
      }
    }
    if (bet < 1 || !Number.isInteger(Number(bet))) {
      return 'Needs to be a whole number greater than 0';
    }
    if (coins === 0) {
      return 'You have no coins.';
    }
    if (bet > coins) {
      return `You only have ${coins.toLocaleString()} coins, dont bluff me.`;
    }
    if (bet >= Currency.constants.MAX_SAFE_BET_AMOUNT) {
      return 'You can\'t bet this much at once!';
    }

    // Items
    if (await userEntry.isItemActive('inviscloak')) {
      return 'You\'ve got your invisibility cloak equipped! The dealer can\'t see you and you can\'t gamble right now';
    }

    await addCD();
    const generate = () => {
      return slots[Number(Math.floor(Math.random() * slots.length))];
    };
    const slotPositions = [generate(), generate(), generate()];

    let result = 0;
    const amount = slotPositions.filter((i, e) => slotPositions.indexOf(i) !== e);
    for (let i in amount) {
      if (amount.length > 1) {
        result = amount[i].multiplier * 2;
      } else if (amount.length > 0) {
        result = amount[i].multiplier;
      }
    }

    // Accounts for multipliers
    const payout = Math.floor(result ? Number(bet * result + ((bet * result) / 100) * result) : 0);
    let message = `**>** ${slotPositions[0].icon}    ${slotPositions[1].icon}    ${slotPositions[2].icon} **<**\n`;

    if (payout) {
      await userEntry.addPocket(payout).save();
    } else {
      await userEntry.removePocket(bet).save();
    }

    msg.channel.createMessage({ embed: {
      author:
          {
            name: `${user.username}'s slot machine`,
            icon_url: user.dynamicAvatarURL()
          },
      description: payout
        ? `You won **${payout.toLocaleString()}** coins. \n**Multiplier** ${multi}% | **Percent of bet won** ${Math.floor((payout / bet) * 100)}%`
        : `You lost **${Number(bet).toLocaleString()}** coins.`,
      fields: [
        {
          name: 'Outcome',
          value: message
        }
      ]
    }
    });
  },
  {
    triggers: ['slots', 'slotmachine'],
    cooldown: 5 * 1000,
    donorCD: 2 * 1000,
    description: 'Take your chances at a slot machine. Warning, I am very good at stealing your money.',
    cooldownMessage: 'If I let you bet whenever you wanted, you\'d be a lot more poor. Wait ',
    missingArgs: 'You gotta gamble some of ur coins bro, `pls gamble #/all/half` for example, dummy'
  }
);
