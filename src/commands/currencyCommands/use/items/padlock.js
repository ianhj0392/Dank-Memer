module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    Memer.redis.set(`activeitems-${msg.author.id}-padlock`, true);
    return 'Your pocket now has a padlock on it. Anyone who tries to steal from you will automatically fail, however this is only a one-time use.';
  }
};
