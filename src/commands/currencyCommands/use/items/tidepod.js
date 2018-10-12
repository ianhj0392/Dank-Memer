module.exports = {
  fn: async ({ Memer, Currency, userEntry }) => {
    const random = Memer.random(0, 1);

    if (random > 0.2) { // no die
      // multiplier
    } else { // die
      await userEntry.removePocket(userEntry.props.pocket).save();
    }
  }
};
