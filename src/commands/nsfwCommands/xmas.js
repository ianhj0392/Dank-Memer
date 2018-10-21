const { GenericMediaCommand } = require('../../models/');

module.exports = new GenericMediaCommand({
  triggers: ['xmas'],
  description: 'christmas themed pron',
  isNSFW: true,

  title: 'XMAS NSFW',
  message: 'Free nudes thanks to boobbot & tom <3',
  JSONKey: 'url',
  donorOnly: true,
  reqURL: 'https://boob.bot/api/v2/img/xmas',
  tokenKey: 'boobbot'
});
