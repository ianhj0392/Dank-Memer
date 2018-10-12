module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    const random = Memer.randomNumber();
    if (random < 30) {
      Memer.redis.set(`sand-effect-${msg.author.id}`, JSON.stringify({ perpetrator: msg.author.id }), 'EX', 60 * 60);
    } else {
      const user = msg.args.resolveUser();
      const sand = await Memer.redis.get(`sand-effect-${user.id}`)
        .then(res => res ? JSON.parse(res) : undefined);
      if (sand) {
        return 'This person already has sand in their eyes, no need to bully them further';
      }
      Memer.redis.set(`sand-effect-${user.id}`, JSON.stringify({ perpetrator: msg.author.id }), 'EX', 60 * 60);
    }
  }
};
