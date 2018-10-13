module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    const amount = Math.round(Memer.randomNumber(1, 5));
    Memer.redis.set(`activeitems-${msg.author.id}-spinner`, amount, 'EX', 60 * 10);
    msg.channel.createMessage('Spinning your fidget spinner...');
    await Memer.sleep(1 * amount);
    return `Your fidget spinner span for ${amount} minutes, granting you a ${amount}% multiplier boost for **10 minutes**!`;
  }
};
