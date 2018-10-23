const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, addCD, userEntry }) => {
    await userEntry.addPocket(1000).save();
    return 'I gave you 1000 coins, go test stuff for us can come back again in 1 minute for more';
  },
  {
    triggers: ['test', 'beta'],
    cooldown: 60 * 1000,
    donorCD: 30 * 1000,
    description: 'get some free coins to do stuff'
  }
);
