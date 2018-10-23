module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    const random = Math.random();

    if (random >= 0.9) { // die
      await userEntry.removePocket(Math.floor(userEntry.props.pocket)).save();
      return `Although it got you a lot of internet points and karma, you ended up dying from the tidepod you ate.\nYou lost **all of your coins**.`;
    } else if (random >= 0.3) { // hospital
      await userEntry.removePocket(Math.floor(userEntry.props.pocket / 4)).save();
      return `What are you thinking?! Eating a tidepod is just dumb and stupid. You end up sitting in a hospital bed on death's door, costing you around ${Math.floor(userEntry.props.pocket / 4)} coins.`;
    } else { // fine
      Memer.redis.set(`activeitems-${msg.author.id}-tidepod`, 5, 'EX', 60 * 60 * 24);
      return 'You eat a tidepod and somehow live to see the benefits. You gained a **5% multiplier** for **24 hours**!';
    }
  }
};
