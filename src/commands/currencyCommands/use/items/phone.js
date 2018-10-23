module.exports = {
  fn: async ({ Memer, msg, Currency, userEntry }) => {
    const Crash = (reason) => {
      return `beep boop bap phone has stopped working\n${reason}`;
    };
    msg.channel.createMessage(`**memePhone** running *memeOS v${Memer.package.version}* -- What do you want to do today?\n\`s\` ■  **Send a text message to somebody**\n\`e\` ■  **Exit**`);
    let prompt = await Memer.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 30e3);
    if (!prompt) {
      return Crash('You didn\'t provide a response in time.');
    }
    if (prompt.content.toLowerCase() === 's') {
      msg.channel.createMessage('Who are we sending this message to? You have 30 seconds to respond with a valid user.');
      let inputuser = await Memer.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 30e3);
      if (!inputuser) {
        return Crash('You didn\'t provide a response in time or the response was not valid.');
      }
      msg.args.args = [inputuser.content];
      const user = msg.args.resolveUser();
      const userDB = await Memer.db.getUser(user.id);

      msg.channel.createMessage('What do you want the message content to be? You have 30 seconds to respond with a valid message.');
      let message = await Memer.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 30e3);
      if (!message) {
        return Crash('You didn\'t provide a response in time or the response was not valid.');
      }

      userDB.sendNotification('sms', `New text message from ${msg.author.username}`, message.content);
      await userDB.save();
      return `Successfully sent your text message to ${user.username}!`;
    } else if (prompt.content.toLowerCase() === 'e') {
      return 'memePhone is now shutting down.';
    } else {
      return Crash('You didn\'t provide a valid response!');
    }
  }
};
