/** @typedef {import('../models/GenericCommand').Memer} Memer
 * @typedef {import('eris').User} User
 * @typedef {import('eris').Message} Message
 * @typedef {import('eris').Member} Member
 * @typedef {import('eris').EmbedBase} EmbedBase
 * @typedef {import('../models/UserEntry').UserData} UserData
 * @typedef {import('../utils/dbFunctions').DonorData} DonorData
 */

const config = require('../config.json');
const Term = require('../../node_modules/rethinkdbdash/lib/term');

const errors = {

  // Voice related errors
  'Disconnected': `Discord fucked something up. 😠\n\nTo fix this, you have to got to server settings and change the voice region.\nIf it still doesn't work after that, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc1\`.`,

  'Voice connection timeout': `Discord fucked something up. 😠\n\nTo fix this, first try running \`pls stop\`.\nIf that doesn't work, you have to kick me and reinvite me back. I know, it is stupid. 🙄\nIf it still doesn't work after that, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc2\`.`,

  'Already encoding': `Something fucked up. 😠\n\nWe're pretty sure this error happens when you're running voice commands too quickly. So slow down 🙄\nIf it's still happening after a while, (<https://discord.gg/Wejhbd4>) and tell support it is error \`vc3\`.`,

  // Currency Errors
  'new_val': `Oopsy doopsy, we made a fucky wucky! 😊\n\nThis shouldn't happen to you again, and we are working semi-hard on fixing it. \nIf it DOES happen again, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`econ1\`.`,

  // Image Errors
  'Invalid character in header content': `Well heck, I didn't like some character you used for this command! 😠\n\nIf you used any "not normal" characters for this command, remove those and try again. \nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`img1\`.`,

  'socket hang up': `Looks like we just restarted our image server\n\nOnce it is done rebooting, this command will work again. Give it just a few seconds!\nIf it is still happening after multiple minutes, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`img2\`.`,

  // Discord Errors
  'DiscordRESTError [50001]: Missing Access': `Hey! For some reason I don't have permission to run that command. 😠\n\nMake sure you have given me the correct channel perms to run this command. \nIf it is still happening after messing with permissions, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis1\`.`,

  'Request timed out (>15000ms) on POST': `aggggghhhhhhhh discord is having connection issues 😠\n\nAll we can do is wait until they're better. Sorryyyyyy.\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis2\`.`,

  'DiscordRESTError [50013]: Missing Permissions': `Hey! For some reason I don't have permission to run that command. 😠\n\nMake sure you have given me the correct channel perms to run this command. \nIf it is still happening after messing with permissions, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis3\`.`,

  'Must be 2000 or fewer in length': `You included too many characters in that.\n\nI am only able to send 2k characters in one message, so please try again with less characters.\nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis4\`.`,

  'DiscordHTTPError: 500 INTERNAL SERVER ERROR on POST': `aggggghhhhhhhh discord is having connection issues 😠\n\nAll we can do is wait until they're better. Sorryyyyyy.\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`dis5\`.`,

  // Known Errors
  'Cannot read property \'triggers\' of undefined': `This command is currently under maintenance, sorry :(\n\nIt will work if you are spelling the command you are enabling/disabling correctly.\nIf it is still happening, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`bug1\`.`,

  '504 Gateway Timeout': `Look like the service we use for this command is giving us problems :(\n\nAll we can currently do is wait, sadly\nIf it is still happening after a few hours, join (<https://discord.gg/Wejhbd4>) and tell support it is error \`bug2\`.`,

  // Bug Hunting errors
  'DiscordRESTError [10003]: Unknown Channel': `Something broke!\n\nI am currently not sure why this bug is happening, but if you report this bug in the support server, you will get paid for it in meme coins.\nJoin (<https://discord.gg/Wejhbd4>) and tell support it is error \`hunt1\`.`
};

class MiscFunctions {
  errorMessages (e) {
    return errors[Object.keys(errors).find((error) => e.message.includes(error))] || false;
  }

  get intro () {
    return `Sup nerds. My name is **Dank Memer**.\n\nTo get started, send \`${config.options.prefix} help\`. All commands are run this way, for example, pls meme.\n\nIf you're interested in autoposting memes, nsfw, extra currency, and more... Check out our [PREMIUM SERVER](https://www.patreon.com/bePatron?c=362724) option or [check this out](https://github.com/Dank-Memer/Dank-Memer/wiki/Donor-Rewards) to read about all the powerups you can get!`;
  }

  get links () {
    return '[Official Twitter](https://twitter.com/dankmemerbot) - Sometimes win free stuff and get bot support\n[Patreon Page](https://www.patreon.com/dankmemerbot) - Help support the bot development, and get some sweet perks!\n[Invite Link](https://goo.gl/BPWvB9) - Add the bot to another server and meme around\n[Official Website](https://dankmemer.lol/) - See all the bot commands and learn more about the developers!';
  }

  /**
   * @returns {Number} A random color code
   */
  randomColor () {
    return Math.floor(Math.random() * 0xFFFFFF);
  }

  /**
   * @param {String} args The string to remove invites from
   * @returns {String} The given string, with invites replaced by `invite`
   */
  inviteRemoval (args) {
    let re = /discord(?:app\.com\/invite|\.gg)\/([a-z0-9]{1,16})/gi;
    const match = re.exec(args);
    if (match) {
      return args.replace(match[0], '`invite`');
    } else {
      return args;
    }
  }

  /**
   * @param {{embed: EmbedBase}} embed The embed object to turn into a regular string
   * @returns {String} String that contains all of the embed elements
   */
  unembedify (embed) {
    const em = embed.embed;
    let embedString = '';
    if (em.author) embedString += `**${em.author.name}**\n`;
    if (em.title) embedString += `**${em.title}**\n`;
    if (em.description) embedString += `${em.description}\n`;
    for (const field of em.fields || []) {
      embedString += `\n**${field.name}**\n${field.value}\n`;
    }
    if (em.footer) embedString += `\n${em.footer.text}`;
    return `${embed.content || ''}\n${(embedString || 'Empty embed')}`; // Returns a string
  }

  /**
   * @param {Memer} Memer The Memer instance
   * @param {User} user The user
   * @param {UserData} userDB The user database entry
   * @param {DonorData} [donor] The donor object, if any
   * @param {Message} msg The message
   * @returns {Number} The total multiplier for this user
   */
  calcMultiplier (Memer, user, userDB, donor, msg, isGlobalPremiumGuild) {
    // calculates total multiplier based on multiple variables
    let guildMember = msg.channel.guild.members.get(msg.author.id);
    let date = new Date(msg.timestamp);
    let day;
    let time;
    let total;
    total = userDB.upgrades ? userDB.upgrades.multi : 0;
    if (Memer.config.options.developers.includes(user.id)) {
      total += 5;
    }
    if (guildMember.game && guildMember.game.name.toLowerCase().includes('dank memer')) {
      total += 0.5;
    }
    if (msg.channel.guild.emojis.length >= 69) {
      if (msg.channel.guild.emojis.length === 69) {
        total += 0.5;
      }
      total += 0.5;
    }
    if (msg.channel.name.toLowerCase().includes('dank-memer')) {
      total += 0.5;
    }
    if (userDB.upvoted) {
      total += 0.5;
    }
    if (userDB.dblUpvoted) {
      total += 0.5;
    }
    if (msg.channel.guild.members.has('419254454169108480')) {
      total += 0.5;
    }
    if (donor || isGlobalPremiumGuild) {
      total += (donor || 20) * 0.5;
    }
    if (userDB.spam < 25) {
      total += 0.5;
    }
    if (userDB.streak.streak >= 15) {
      total += 0.5;
    }
    if (user.username.toLowerCase().includes('dank')) {
      total += 0.5;
    }
    if (msg.channel.guild.id === '470337009886429194') {
      total += 0.5;
    }
    if (date.getMinutes() === 20 && date.getHours() === 4) {
      total += 4.2;
      time = true;
    }
    if (date.getDay() === 20 && date.getMonth() === 4) {
      total += 4.2;
      day = true;
    }
    if (time && day) {
      total += 420;
    }
    return total;
  }

  /**
   * @param {Memer} Memer The Memer instance
   * @param {User} user The user
   * @param {UserData} userDB The user database entry
   * @param {DonorData} [donor] The donor object, if any
   * @param {Message} msg The message
   * @returns {String} A list of all the active multipliers for this user
   */
  showMultiplier (Memer, user, userDB, donor, msg, isGlobalPremiumGuild) {
    // calculates total multiplier based on multiple variables
    let guildMember = msg.channel.guild.members.get(msg.author.id);
    let date = new Date(msg.timestamp);
    let time;
    let day;
    let count = 14;
    let end = {
      locked: 0,
      unlocked: { total: 0, list: [] },
      bought: userDB.upgrades ? userDB.upgrades.multi : 0
    };
    if (Memer.config.options.developers.includes(user.id)) {
      end.unlocked.total += 1;
      end.unlocked.list.push('[Developer](https://github.com/Dank-Memer/Dank-Memer)');
    }
    if (guildMember.game && guildMember.game.name.toLowerCase().includes('dank memer')) {
      end.unlocked.total += 1;
      end.unlocked.list.push('[Playing dank memer](http://your-stupidity.needs-to-s.top/c3342d.gif)');
    }
    if (msg.channel.guild.emojis.length === 69) {
      end.unlocked.total += 1;
      end.unlocked.list.push('69 emotes in the server');
    }
    if (msg.channel.name.toLowerCase() === ('dank-memer')) {
      end.unlocked.total += 1;
      end.unlocked.list.push('[Channel is dank-memer](http://your-stupidity.needs-to-s.top/9bf273.png)');
    }
    if (userDB.upvoted) {
      end.unlocked.total += 1;
      end.unlocked.list.push('[Voted for the bot](https://discordbots.org/bot/memes/vote)');
    }
    if (userDB.dblUpvoted) {
      end.unlocked.total += 1;
      end.unlocked.list.push('[Voted for the bot on DBL](https://discordbotlist.com/bots/270904126974590976)');
    }
    if (msg.channel.guild.members.has('419254454169108480')) {
      end.unlocked.total += 1;
      end.unlocked.list.push('Premium server');
    }
    if (donor) {
      end.unlocked.total += 1;
      end.unlocked.list.push('[Donor](https://www.patreon.com/dankmemerbot)');
    } else if (isGlobalPremiumGuild) {
      end.unlocked.total += 1;
      end.unlocked.list.push('On a premium guild redeemed by a 20$+ [donor](https://www.patreon.com/dankmemerbot)');
    }
    if (userDB.spam < 25) {
      end.unlocked.total += 1;
      end.unlocked.list.push('Doesn\'t spam the bot');
    }
    if (userDB.streak.streak >= 15) {
      end.unlocked.total += 1;
      end.unlocked.list.push('15+ daily streak');
    }
    if (user.username.toLowerCase().includes('dank')) {
      end.unlocked.total += 1;
      end.unlocked.list.push('Username is dank');
    }
    if (msg.channel.guild.id === '470337009886429194') {
      end.unlocked.total += 1;
      end.unlocked.list.push('In support server');
    }
    if (date.getMinutes() === 20 && date.getHours() === 4) {
      end.unlocked.total += 1;
      end.unlocked.list.push('4:20');
      time = true;
    }
    if (date.getDay() === 20 && date.getMonth() === 4) {
      end.unlocked.total += 1;
      end.unlocked.list.push('4/20');
      day = true;
    }
    if (time && day) {
      end.unlocked.total += 1;
      end.unlocked.list.push('4/20 + 4:20');
    }
    end.locked = count - end.unlocked.total;
    return end;
  }

  /**
   * @param {String} str The string to decode html entities from
   * @returns {String} The given string, with html entities decoded
   */
  decodeHtmlEntity (str) { // Found here: https://gist.github.com/CatTail/4174511
    return str.replace(/&#(\d+);/g, function (match, dec) {
      return String.fromCharCode(dec);
    });
  }

  /**
   * @param {Array} array The array to get a random element from
   * @returns {any} A random element that was in the given array
   */
  randomInArray (array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * If no minimum and maximum is passed, the range defaults to 0-100
   * @param {Number} [min] The minimum
   * @param {Number} [max] The maximum
   * @returns {Number} A random number between the given range
   */
  randomNumber (min, max) {
    if ((!min && min !== 0) || (!max && max !== 0)) {
      // Default 0-100 if no args passed
      min = 0;
      max = 100;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * @param {Number} ms The amount of milliseconds to wait
   * @returns {Promise<void>} An empty promise that will be resolved when the given ms are elapsed
   */
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * @param {Array} array The array to remove duplicates from
   * @returns {Array} The given array, with all (exact) duplicates removed
   */
  removeDuplicates (array) {
    return Array.from(new Set(array).values());
  }

  /**
   * Creates a codeblock from the given string and language
   * @param {String} str The text to put in the codeblock
   * @param {String} lang The language to use for this codeblock
   * @returns {String} A codeblock
   */
  codeblock (str, lang) {
    return `${'```'}${lang || ''}\n${str}\n${'```'}`;
  }

  /**
   * Get the highest role position of the given member
   * @param {Member} member
   * @returns {Number} The position of the member's highest role
   */
  getHighestRolePos (member) {
    return member.roles[0] ? member.guild.roles.filter(r => member.roles.includes(r.id)).sort((a, b) => b.position - a.position)[0].position : 0;
  }

  /**
   * @param {Number} time The time in seconds to parse
   * @returns {String} A string representing the given time, in dd:hh:mm:ss format, days and hours are removed if unnecessary
   */
  parseTime (time) {
    let fm = [
      Math.floor(time / 60 / 60 / 24), // DAYS
      Math.floor(time / 60 / 60) % 24, // HOURS
      Math.floor(time / 60) % 60, // MINUTES
      Math.floor(time % 60) // SECONDS
    ];
    if (!fm[1] && !fm[0]) {
      fm.splice(1, 1);
    }
    if (!fm[0]) {
      fm.splice(0, 1);
    }
    return fm.map(v => { return ((v < 10) ? '0' : '') + v; }).join(':');
  }

  async punish (Memer, id, type, reason, optionalBlock = true, optionalWipe = true) {
    if (!reason) {
      reason = 'No reason given.';
    }
    if (!type) {
      type = 'user';
    }
    let name;
    let object;
    if (type === 'user') {
      object = await Memer.IPC.fetchUser(id);
      if (!object) {
        name = 'not sure of the username...';
      } else {
        name = `${object.username}#${object.discriminator}`;
      }
    } else {
      object = await Memer.IPC.fetchGuild(id);
      if (!object) {
        name = 'not sure of the server name';
      } else {
        name = object.name;
      }
    }
    if (optionalBlock) {
      Memer.db.createBlock(id);
    }
    if (optionalWipe) {
      switch (type) {
        case 'user':
          await Memer.db.removeUser(id);
          break;
        case 'guild':
        case 'server':
          await Memer.db.deletePls(id);
          await Memer.db.deleteGuild(id);
          break;
      }
    }
    const channel = Memer.config.options.spamReportChannel || '397477232240754698';
    await Memer.bot.createMessage(channel, `The ${type} **${name}** (*${id}*) was blacklisted.\n**Reason**: ${reason}`);
  }

  /**
   * Creates an array of strings from a given string, each string being at most 2000 characters/the given limit
   * @param {String} text The text to create an array of "pages" from
   * @param {Number} [limit=2000] The limit of characters for a page, defaults to `2000`
   * @returns {Array<String>} The given text, paginated into an array according to the specified limit
   */
  paginate (text, limit = 2000) {
    const lines = text.split('\n');
    const pages = [];

    let chunk = '';

    for (const line of lines) {
      if (chunk.length + line.length > limit && chunk.length > 0) {
        pages.push(chunk);
        chunk = '';
      }

      if (line.length > limit) {
        const lineChunks = line.length / limit;

        for (let i = 0; i < lineChunks; i++) {
          const start = i * limit;
          const end = start + limit;
          pages.push(line.slice(start, end));
        }
      } else {
        chunk += `${line}\n`;
      }
    }

    if (chunk.length > 0) {
      pages.push(chunk);
    }

    return pages;
  }

  /**
   * Splits a given array into multiple arrays, each array being as big as the given size at most
   * @param {Array} array The array to split
   * @param {Number} size The maximum size of an array (or "page")
   * @returns {Array<Array>} An array of arrays
   */
  paginateArray (array, size) {
    let result = [];
    let j = 0;
    for (let i = 0; i < Math.ceil(array.length / (size || 10)); i++) {
      result.push(array.slice(j, j + (size || 10)));
      j = j + (size || 10);
    }
    return result;
  }

  /**
   * Performs a deep merge of the two given object, the behavior of this merge being the same as RethinkDB's `update`/`merge` methods
   * @param {Object} target - The object that should be updated with the source
   * @param {Object} source - The object that will be merged on the `target` object
   * @returns {Object} The merged object
   */
  deepMerge (target, source) {
    let destination = {};
    for (const key of Object.keys(target)) {
      destination[key] = typeof target[key] === 'object' ? { ...target[key] } : target[key];
    }

    for (const key of Object.keys(source)) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(source[key])) {
        destination[key] = source[key];
      } else {
        if (typeof source[key] !== 'object' || source[key] instanceof Term) {
          destination[key] = source[key];
        } else {
          destination[key] = this.deepMerge(target[key], source[key]);
        }
      }
    }
    return destination;
  }

  getRateTarget (msg, args) {
    let target = !args[0] || args[0].toLowerCase() === 'me'
      ? 'You are'
      : (
        msg.mentions[0]
          ? `${msg.mentions[0].nick || msg.mentions[0].username} is`
          : `${args.join(' ')} is`
      );
    return target;
  }
}

module.exports = MiscFunctions;
