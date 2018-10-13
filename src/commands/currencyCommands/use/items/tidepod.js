module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    const random = Math.random();

    if (random > 0.2) { // no die
      Memer.redis.set(`activeitems-${msg.author.id}-tidepod`, 5, 'EX', 60 * 60 * 24);
      return 'You eat a tidepod and somehow live to see the benefits. You gained a **5% multiplier** for **24 hours**!';
    } else { // die
      await userEntry.removePocket(userEntry.props.pocket).save();
      return `Although it got you a lot of internet points and karma, you ended up dying from the tidepod you ate.\nYou lost **all of your coins**.`;
    }
  }
};
