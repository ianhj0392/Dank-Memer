const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, addCD, userEntry, guildEntry }) => {
    const amount = Number(msg.args.args[1]);
    if (msg.args.args[0]) {
      switch (msg.args.args[0].toLowerCase()) {
        case 'deposit':
          if (amount && amount <= userEntry.props.pocket) {
            if (amount + userEntry.props.userEntry.props.bank > 500 + ((userEntry.props.pls / 100) * 150)) {
              return `You can only hold ${Math.round(500 + ((userEntry.props.pls / 100) * 150))} coins in your bank right now. To hold more, use the bot more.`;
            }
            if (amount < 1 || !Number.isInteger(Number(amount))) {
              return 'Needs to be a whole number greater than 0';
            }
            await addCD();
            await userEntry.addBank(amount).save();
            return `${amount} coin${amount === 1 ? '' : 's'} deposited.`;
          } else {
            return `Your second argument should be a number and no more than what you have in your pocket (${userEntry.props.pocket})`;
          }
        case 'withdraw':
          if (amount && amount <= userEntry.props.bank) {
            if (amount < 1 || !Number.isInteger(Number(amount))) {
              return 'Needs to be a whole number greater than 0';
            }
            await addCD();
            await userEntry.removeBank(amount).save();
            return `${amount} coin${amount === 1 ? '' : 's'} withdrawn.`;
          } else {
            return `Your second argument should be a number and no more than what you have in your bank (${userEntry.props.bank})`;
          }
        default:
          return 'Hm, thats not how this command works, first argument should be deposit or withdraw';
      }
    } else {
      const { prefix } = guildEntry.props;
      return {
        title: `${msg.author.username}'s account:`,
        description: `**Current Balance**: ${userEntry.props.bank}/${Math.round(500 + ((userEntry.props.pls / 100) * 150))}\nYou can deposit coins with \`${prefix} bank deposit #\`\nYou can withdraw coins with \`${prefix} bank withdraw #\``,
        footer: { text: 'You can earn more vault space by using the bot more often' }
      };
    }
  },
  {
    triggers: ['userEntry.props.bank'],
    description: 'Check your account balance and make deposits or withdraws',
    perms: ['embedLinks']
  }
);
