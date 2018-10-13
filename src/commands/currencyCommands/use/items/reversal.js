module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    const stolen = await Memer.redis.get(`stolen-${msg.author.id}`)
      .then(res => res ? JSON.parse(res) : undefined);
    if (!stolen) {
      msg.channel.createMessage('You haven\'t been stolen from by anybody within the last **2 minutes**.');
      return false;
    } else {
      const stealer = Memer.db.getUser(stolen.stealer);
      if (stealer.props.pocket < stolen.worth) {
        msg.channel.createMessage('damn unlucky, the criminal got away and I wasn\'t able to revert the money back.');
        return false;
      }
      userEntry.addPocket(stolen.worth);
      await stealer.removePocket(stolen.worth).save();
      return 'Nice one, you\'ve reversed time and got your money back from that steal';
    }
  }
};
