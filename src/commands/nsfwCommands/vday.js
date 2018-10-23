const { GenericMediaCommand } = require('../../models/');

module.exports = new GenericMediaCommand({
  triggers: ['vday'],
  description: 'vday based pron',
  isNSFW: true,

  title: 'V-day NSFW',
  message: 'Free nudes thanks to boobbot & tom <3',
  JSONKey: 'url',
  donorOnly: true,
  reqURL: 'https://boob.bot/api/v2/img/vday',
  tokenKey: 'boobbot'
});
