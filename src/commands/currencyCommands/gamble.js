const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, addCD, isGlobalPremiumGuild, Currency, donor, userEntry }) => {
    let user = msg.author;
    let multi = await Memer.calcMultiplier(Memer, user, userEntry, donor, msg, isGlobalPremiumGuild);
    let coins = userEntry.props.pocket;

    if (coins >= Currency.constants.MAX_SAFE_COMMAND_AMOUNT) {
      return 'You are too rich to gamble! Why don\'t you go and do something with your coins smh';
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

    const roll = {
      bot: Number(Math.floor(Math.random() * 12) + 1),
      user: Number(Math.floor(Math.random() * 12) + 1)
    };

    let winAmount = Math.random() + 0.4;
    let winnings = 0;

    if ((roll.user - 1) >= roll.bot) {
      // Accounts for multipliers
      winnings = Math.round(bet * winAmount);
      winnings = winnings + Math.round(winnings * (multi / 100));
      await userEntry.addPocket(winnings).save();
    } else {
      await userEntry.removePocket(bet).save();
    }

    msg.channel.createMessage({ embed: {
      author:
          {
            name: `${user.username}'s gambling game`,
            icon_url: user.dynamicAvatarURL()
          },
      color: 12216520,
      description: winnings
        ? `You won **${winnings.toLocaleString()}** coins. \n**Multiplier** ${multi}% | **Percent of bet won** ${(winnings / bet) * 100}%`
        : `You lost **${Number(bet).toLocaleString()}** coins.`,
      fields: [
        {
          name: msg.author.username,
          value: roll.user,
          inline: true
        },
        {
          name: Memer.bot.user.username,
          value: roll.bot,
          inline: true
        }
      ],
      footer: { text: !winnings ? 'Your number has to be at least 1 higher than your opponent.' : '' }
    }
    });
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
