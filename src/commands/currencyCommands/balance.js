const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, addCD, userEntry }) => {
    let user = msg.args.resolveUser(true);
    if (user) {
      userEntry = await Memer.db.getUser(user.id);
    }
    const text = [user ? `Here is ${user.username}'s balance` : `Here is your balance, ${msg.author.username}`, user ? `**Their wallet**` : `**Your wallet**`];
    await addCD();
    return {
      title: text[0],
      description: `${text[1]}: ${userEntry.props.pocket.toLocaleString()} coins.\n**Bank Account**: ${userEntry.props.bank.toLocaleString()} coins`,
      thumbnail: {url: 'http://www.dank-memer-is-lots-of.fun/coin.png'},
      footer: { text: 'to see what upgrades they have, use the upgrades command' }
    };
  },
  {
    triggers: ['balance', 'bal', 'coins'],
    description: 'Check your coin balance, or someone elses',
    perms: ['embedLinks']
  }
);
