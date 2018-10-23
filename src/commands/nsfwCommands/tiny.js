const { GenericMediaCommand } = require('../../models/');

module.exports = new GenericMediaCommand({
  triggers: ['tiny'],
  description: 'tiny porn?',
  isNSFW: true,

  title: 'Tiny NSFW',
  message: 'Free nudes thanks to boobbot & tom <3',
  JSONKey: 'url',
  donorOnly: true,
  reqURL: 'https://boob.bot/api/v2/img/tiny',
  tokenKey: 'boobbot'
});
