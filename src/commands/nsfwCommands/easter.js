const { GenericMediaCommand } = require('../../models/');

module.exports = new GenericMediaCommand({
  triggers: ['easter'],
  description: 'Easter based porn',
  isNSFW: true,

  title: 'Easter NSFW',
  message: 'Free nudes thanks to boobbot & tom <3',
  JSONKey: 'url',
  donorOnly: true,
  reqURL: 'https://boob.bot/api/v2/img/easter',
  tokenKey: 'boobbot'
});
