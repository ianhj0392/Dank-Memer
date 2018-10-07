const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

const slots = [
  { icon: '💔', multiplier: 2.2 },
  { icon: '💗', multiplier: 2.4 },
  { icon: '💛', multiplier: 2.6 },
  { icon: '💚', multiplier: 2.8 },
  { icon: '💙', multiplier: 3.2 },
  { icon: '💜', multiplier: 3.5 },
  { icon: '💖', multiplier: 4 },
  { icon: '💝', multiplier: 5 },
  { icon: '🔱', multiplier: 8 } ];

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, addCD, isGlobalPremiumGuild, donor, userEntry }) => {
    let user = msg.author;
    let multi = await Memer.calcMultiplier(Memer, user, userEntry.props, donor ? donor.donorAmount : 0, msg, isGlobalPremiumGuild);
    let coins = userEntry.props.pocket;

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

    await addCD();
    const generate = () => {
      return slots[Number(Math.floor(Math.random() * slots.length))];
    };
    const slotPositions = [
      [generate(), generate(), generate()],
      [generate(), generate(), generate()],
      [generate(), generate(), generate()]
    ];
    await userEntry.removePocket(bet);

    let result = 0;
    const amount = (new Set(slotPositions[1])).size;
    for (let i in amount) {
      if (amount > 2) {
        result = amount[i].el.multiplier * 2;
      } else if (amount > 1) {
        result = amount[i].el.multiplier;
      }
    }
    result = Math.floor(result);
    const payout = result ? Number(bet * result) : 0;
    console.log(slotPositions[0][1].icon);
    let message = ` \`${slotPositions[0][0].icon}   ${slotPositions[0][1].icon}   ${slotPositions[0][2].icon}\`\n`;
    message += ` ${slotPositions[1][0].icon}    ${slotPositions[1][1].icon}    ${slotPositions[1][2].icon}\n`;
    message += ` \`${slotPositions[0][0].icon}   ${slotPositions[2][1].icon}   ${slotPositions[2][2].icon}\``;

    if (result) {
      await userEntry.addPocket(payout).save();
    } else {
      await userEntry.removePocket(bet).save();
    }

    return {
      author:
          {
            name: `${user.username}'s Slot Machine'`,
            icon_url: user.dynamicAvatarURL()
          },
      description: result
        ? `You won **${payout.toLocaleString()}** coins. \n**Multiplier**: ${multi}% | **Percent of bet won**: ${payout.toFixed(2) * 100}%`
        : `You lost **${Number(bet).toLocaleString()}** coins.`,
      fields: [
        {
          name: 'Outcome',
          value: message
        }
      ]
    };
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
