const {GenericCommand} = require('../../models');

module.exports = new GenericCommand(
  async ({Memer, msg, args, guildEntry}) => {
    if (!msg.member.permission.has('manageGuild') && !Memer.config.options.developers.includes(msg.author.id)) {
      return 'You are not authorized to use this command. You must have `Manage Server` to manage the whitelist.';
    }

    if (!args[0]) {
      return {
        content: `*No first argument detected, entering monologue mode...*

Use this command with multiple sorts of secondary commands: 
Use \`${guildEntry.props.prefix} whitelist add Mr Memer\` to establish a whitelist and add the role with the name 'Mr Memer'
Use \`${guildEntry.props.prefix} whitelist remove Mr Memer\` to remove the role with the name 'Mr Memer' from the whitelist, no more memes for you!
Use \`${guildEntry.props.prefix} whitelist purge\` to remove the entire whitelist and *set everyone free*, raise anarchy, make a meme castle or whatever.`,
        reply: true
      };
    }

    let name;
    let role;

    if (args[0] === 'add' || args[0] === 'remove') {
      if (args.length < 2) {
        return {content: `I need the name of the role, dummy.`, reply: true};
      } else {
        name = args.slice(1).join(' ');
        role = msg.member.guild.roles.find(r => (r.name.toLowerCase() === name.toLowerCase()) || (r.id === name));

        if (!role) {
          return `No role found with name '${name}', check if you got punctuation alright, it's not case-sensitive.`;
        }
      }
    }

    let response;

    switch (args[0]) {
      case 'add':
        guildEntry.addWhitelistedRole(role.id);
        response = 'Added that role to the whitelist, welcome to the meme club, kids.';
        break;
      case 'remove':
        guildEntry.yeetWhitelistedRole(role.id);
        response = 'Yeeted that role out of the whitelist, if it was even in there.';
        break;
      case 'purge':
        guildEntry.purgeWhitelist();
        response = 'Alright m8, I purged the whole whitelist, all people are free to dab in #general now.';
        break;
      default:
        return {content: "Oi, that's not a valid command m8, you gotta use `add`, `remove`, or `purge`.", reply: true};
    }

    await guildEntry.save();
    return response;
  }, {
    triggers: ['whitelist'],
    description: 'Use this command to set and manage whitelisted roles of whomst\'ve can use commands'
  }
);
