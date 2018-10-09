const GenericCommand = require('../../models/GenericCommand');
module.exports = new GenericCommand(
  async ({ Memer, msg, addCD, donor, userEntry }) => {
    const multiplier = donor ? donor.donorAmount : 0;
    const winnings = Number(multiplier) * 1000;
    await addCD();
    await userEntry.addPocket(winnings).save();
    return {
      title: `${msg.author.username} has redeemed their monthly donor rewards!`,
      description: `You donated $${multiplier}, so you get ${winnings.toLocaleString()} coins!\nThank you for your support!`
    };
  },
  {
    triggers: ['redeem'],
    donorCD: 2592e6,
    donorOnly: true,
    cooldownMessage: 'You have to wait ',
    description: 'redeem your cool donor coins monthly'
  }
);
