const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, addCD, userEntry }) => {
    if (Date.now() - userEntry.props.streak.time > 172800000) { // 24 hours, 2 days because one-day cooldown
      userEntry.resetStreak();
    } else {
      userEntry.updateStreak();
    }

    let coinsEarned = 250;
    const streakBonus = Math.round((0.02 * coinsEarned) * (userEntry.props.streak.streak - (userEntry.props.streak.streak ? 1 : 0)));
    if (userEntry.props.streak.streak > 0) {
      coinsEarned = coinsEarned + streakBonus;
    }
    if (userEntry.props.streak.time === 0) {
      userEntry.update({ streak: { time: Date.now() } });
    }
    await userEntry.addPocket(coinsEarned).save();
    await addCD();

    return {
      title: `Here are your daily coins, ${msg.author.username}`,
      description: `**${coinsEarned} coins** were placed in your pocket.\n\nYou can get another 250 coins by voting! ([Click Here](https://discordbots.org/bot/memes/vote) and [here](https://discordbotlist.com/bots/270904126974590976))`,
      thumbnail: {url: 'http://www.dank-memer-is-lots-of.fun/coin.png'},
      footer: {text: `Streak: ${(userEntry.props.streak.streak - 1) < 0 ? 0 : userEntry.props.streak.streak - 1} days (+${streakBonus} coins)`}
    };
  },
  {
    triggers: ['daily', '24hr'],
    cooldown: 864e5,
    donorCD: 864e5,
    cooldownMessage: 'I\'m not made of money dude, wait ',
    description: 'Get your daily injection of meme coins'
  }
);
