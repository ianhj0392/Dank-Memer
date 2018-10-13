module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    const random = Memer.randomNumber();
    const user = msg.args.resolveUser();
    if (!user) {
      msg.channel.createMessage('You need to give a user to throw sand in their eyes');
      return false;
    }
    if (random < 30) {
      Memer.redis.set(`sand-effect-${msg.author.id}`, JSON.stringify({ perpetrator: user.id }), 'EX', 60 * 60 * 6);
      return `The wind wasn't blowing in your favor and you ended up getting sand in your OWN eyes, good going.\nYou can't steal from ${user.username} for another 6 hours.`;
    } else {
      const sand = await Memer.redis.get(`sand-effect-${user.id}`)
        .then(res => res ? JSON.parse(res) : undefined);
      if (sand) {
        msg.channel.createMessage('This person already has sand in their eyes, no need to bully them further');
        return false;
      }
      Memer.redis.set(`sand-effect-${user.id}`, JSON.stringify({ perpetrator: msg.author.id }), 'EX', 60 * 60 * 6);
      return `You pull out a bit of old, dirty sand from your pocket and blow it right into ${user.username}'s face.\n${user.username} has been blinded and they can't steal from you for another 6 hours.`;
    }
  }
};
