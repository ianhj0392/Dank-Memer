const { GenericMediaCommand } = require('../../models/');

module.exports = new GenericMediaCommand({
  triggers: ['traps'],
  description: 'TRAPS!!!',
  isNSFW: true,

  title: 'Traps NSFW',
  message: 'Free nudes thanks to boobbot & tom <3',
  JSONKey: 'url',
  donorOnly: true,
  reqURL: 'https://boob.bot/api/v2/img/traps',
  tokenKey: 'boobbot'
});
