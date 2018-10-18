const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

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

    // Items
    if (await userEntry.isItemActive('inviscloak')) {
      return 'You\'ve got your invisibility cloak equipped! The dealer can\'t see you and you can\'t gamble right now';
    }

    await addCD();
    let blahblah = Math.random();

    if (blahblah > 0.95) {
      let winAmount = Math.random() + 0.8;
      let random = Math.round(Math.random());
      winAmount = winAmount + random;
      let winnings = Math.round(bet * winAmount);
      winnings = winnings + Math.round(winnings * (multi / 100));
      if (winnings === bet) {
        return 'You broke even. This means you\'re lucky I think?';
      }

      await userEntry.addPocket(winnings).save();
      return `You won **${winnings.toLocaleString()}** coins. \n**Multiplier**: ${multi}% | **Percent of bet won**: ${winnings.toFixed(2) * 100}%`;
    } else if (blahblah > 0.65) {
      let winAmount = Math.random() + 0.4;
      let winnings = Math.round(bet * winAmount);
      winnings = winnings + Math.round(winnings * (multi / 100));
      if (winnings === bet) {
        return 'You broke even. This means you\'re lucky I think?';
      }
      await userEntry.addPocket(winnings).save();
      return `You won **${winnings.toLocaleString()}** coins. \n**Multiplier**: ${multi}% | **Percent of bet won**: ${winAmount.toFixed(2) * 100}%`;
    } else {
      await userEntry.removePocket(bet).save();
      return `You lost **${Number(bet).toLocaleString()}** coins.`;
    }
  },
  {
    triggers: ['gamble', 'bet'],
    cooldown: 5 * 1000,
    donorCD: 2 * 1000,
    description: 'Take your chances at gambling. Warning, I am very good at stealing your money.',
    cooldownMessage: 'If I let you bet whenever you wanted, you\'d be a lot more poor. Wait ',
    missingArgs: 'You gotta gamble some of ur coins bro, `pls gamble #/all/half` for example, dummy'
  }
);
