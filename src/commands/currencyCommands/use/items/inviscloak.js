module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    Memer.redis.set(`activeitems-${msg.author.id}-inviscloak`, true, 'EX', 60 * 60 * 6);
    return 'Just like that, you vanish to the world.';
  }
};
