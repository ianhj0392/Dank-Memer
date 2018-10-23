const { GenericCommand } = require('../../models/');

module.exports = new GenericCommand(
  async ({ Memer }) => {
    return {
      title: 'Vote for Dank Memer',
      fields: [
        { name: 'Discord Bots', value: `https://discordbots.org/bot/270904126974590976/vote`, inline: true },
        { name: 'Discord Bot List', value: `https://discordbotlist.com/bots/270904126974590976/upvote`, inline: true }
      ],
      footer: { text: 'Thanks for your support!' }
    };
  }, {
    triggers: ['vote'],
    usage: '{command}',
    description: 'Get the links to vote for Dank Memer'
  }
);
