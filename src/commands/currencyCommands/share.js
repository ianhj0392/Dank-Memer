const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, addCD, userEntry }) => {
    let args = msg.args.args;
    let given;
    let user;
    if (Number(args[0])) {
      given = msg.args.nextArgument();
      user = msg.args.resolveUser(true);
    } else {
      given = args[1];
      user = msg.args.resolveUser();
    }
    if (!user) {
      return 'who r u giving coins to, dumb';
    }
    if (!given || !Number.isInteger(Number(given)) || isNaN(given)) {
      return 'you have to to actually share a number, dummy. Not ur dumb feelings';
    }
    given = Number(given);
    let giverCoins = userEntry;
    let takerCoins = await Memer.db.getUser(user.id);

    if (given > giverCoins.props.pocket) {
      return `You only have ${giverCoins.props.pocket} coins, you can't share that many`;
    }
    if (given < 1) {
      return 'You can\'t share 0 coins you dumb';
    }

    await addCD();
    await takerCoins.addPocket(given).save();
    await userEntry.removePocket(given).save();
    return `You gave ${user.username} ${given.toLocaleString()} coins, now you have ${giverCoins.props.pocket.toLocaleString()} and they've got ${takerCoins.props.pocket.toLocaleString()}`;
  },
  {
    triggers: ['share', 'give'],
    cooldown: 1e3,
    donorCD: 1e3,
    description: 'share some coins with someone',
    missingArgs: 'You need to choose who to share with and how many coins dummy'
  }
);
