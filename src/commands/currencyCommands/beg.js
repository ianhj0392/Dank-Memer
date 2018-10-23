const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, addCD, userEntry }) => {
    await addCD();
    const prompt = await msg.channel.createMessage('Hm, let me think...');
    await Memer.sleep(1000);
    await prompt.edit('Hm, let me think... <:feelsthinkman:397488376728780800>');
    await Memer.sleep(2000);
    if (Math.random() >= 0.5) {
      await userEntry.addPocket(1).save();
      await prompt.edit('Ok sure, have a coin.');
    } else {
      await prompt.edit('Nah, no coin for you.');
    }
  },
  {
    triggers: ['beg'],
    cooldown: 30 * 1000,
    donorCD: 20 * 1000,
    cooldownMessage: 'Stop begging so much, it makes you look like a little baby.\nYou can have more coins in ',
    description: 'haha ur poor so you have to beg for coins lmaoooo'
  }
);
