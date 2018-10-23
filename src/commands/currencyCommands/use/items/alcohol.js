module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    const random = Math.random();

    if (random >= 0.9) { // die
      await userEntry.removePocket(Math.floor(userEntry.props.pocket / 3)).save();
      return `You got a little too drunk and had to go to the hospital due to alcohol poisoning.\nYou lost **${Math.floor(userEntry.props.pocket / 3)}** coins.`;
    } else { // fine
      Memer.redis.set(`activeitems-${msg.author.id}-alcohol`, true, 'EX', 60 * 60 * 12);
      return 'You down a good amount of alcohol and gain a **+200%** luck boost! Watch yourself though, you are more likely to be stolen from and you\'re more prone to lose coins.';
    }
  }
};
