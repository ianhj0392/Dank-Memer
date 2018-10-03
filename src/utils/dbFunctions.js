/** @typedef {import("../models/GenericCommand").Memer} Memer */

const User = require('../models/UserEntry');
const Guild = require('../models/GuildEntry');

class DatabaseFunctions {
  /**
   *  @param {Memer} Memer The Memer instance
   */
  constructor (Memer) {
    /** @type {Memer} The Memer instance */
    this.client = Memer;
  }

  async deleteGuild (id) {
    return this.client.r.table('guilds')
      .get(id)
      .delete()
      .run();
  }

  async getDevSubscribers () {
    return this.client.r.table('updates')
      .run();
  }

  async updateDevSubscriber (guildID, channelID) {
    return this.client.r.table('updates')
      .insert({
        id: guildID,
        channelID
      }, { conflict: 'update' })
      .run();
  }

  async deleteDevSubscriber (guildID) {
    return this.client.r.table('updates')
      .get(guildID)
      .delete()
      .run();
  }

  async updateCooldowns (command, userID, isGlobalPremiumGuild) {
    const pCommand = this.client.cmds.find(c => c.props.triggers.includes(command.toLowerCase()));
    if (!pCommand) {
      return;
    }
    const isDonor = isGlobalPremiumGuild || await this.checkDonor(userID);
    let cooldown;
    if (isDonor) {
      cooldown = pCommand.props.donorCD;
    } else {
      cooldown = pCommand.props.cooldown;
    }
    const profile = await this.getCooldowns(userID, cooldown > 20000 ? 'db' : false);
    if (!profile) {
      return this.createCooldowns(command, userID, isGlobalPremiumGuild);
    }
    if (profile.cooldowns.some(cmd => cmd[command])) {
      profile.cooldowns.forEach(cmd => {
        if (cmd[command]) {
          cmd[command] = Date.now() + cooldown;
        }
      });
    } else {
      profile.cooldowns.push({ [command]: Date.now() + cooldown });
    }
    if (cooldown <= 20000) {
      return this.client.cooldowns.set(userID, { id: userID, cooldowns: profile.cooldowns });
    }
    return this.client.r.table('cooldowns')
      .insert({ id: userID, cooldowns: profile.cooldowns }, { conflict: 'update' });
  }

  async createCooldowns (command, userID, isGlobalPremiumGuild) {
    const pCommand = this.client.cmds.find(c => c.props.triggers.includes(command.toLowerCase()));
    if (!pCommand) {
      return;
    }
    const isDonor = isGlobalPremiumGuild || await this.checkDonor(userID);
    const cooldown = isDonor ? pCommand.props.donorCD : pCommand.props.cooldown;
    if (cooldown < 20000) {
      return this.client.cooldowns.set(userID, { id: userID, cooldowns: [ { [command]: Date.now() + cooldown } ] });
    } else {
      return this.client.r.table('cooldowns')
        .insert({ id: userID, cooldowns: [ { [command]: Date.now() + cooldown } ] });
    }
  }

  async getCooldowns (userID, type) {
    let all = type === 'all';
    if (all || type !== 'db') {
      const cooldown = this.client.cooldowns.get(userID) || {
        cooldowns: [],
        id: userID
      };
      if (!all) {
        return cooldown;
      } else {
        all = cooldown;
      }
    }
    return this.client.r.table('cooldowns')
      .get(userID)
      .run()
      .then(cd => {
        if (all) {
          all.cooldowns = all.cooldowns.concat(cd ? cd.cooldowns : []);
          return all;
        }
        return cd;
      });
  }

  async deleteCooldowns (userID) {
    this.client.cooldowns.delete(userID);
    return this.client.r.table('cooldowns')
      .get(userID)
      .delete()
      .run();
  }

  async getSpecificCooldown (command, userID, isDonor, isGlobalPremiumGuild) {
    const cooldown = isDonor || isGlobalPremiumGuild ? (command.donorCD || command.cooldown) : command.cooldown;
    const profile = cooldown < 20000 ? this.client.cooldowns.get(userID) : await this.client.r.table('cooldowns').get(userID).run();
    if (!profile) {
      return 1;
    }
    const cooldowns = profile.cooldowns.find(item => item[command.triggers[0]]);
    if (!cooldowns) {
      return 1;
    }
    return profile.cooldowns.find(item => item[command.triggers[0]])[command.triggers[0]];
  }

  async createBlock (id) {
    return this.client.r.table('blocked')
      .insert({ id })
      .run();
  }

  async removeBlock (id) {
    return this.client.r.table('blocked')
      .get(id)
      .delete()
      .run();
  }

  async checkBlocked (guildID, authorID = 1) {
    return this.client.r.table('blocked').filter(u => u('id').eq(guildID) || u('id').eq(authorID)).count().gt(0).run();
  }

  async addPls (guildID, userID) {
    let guild = await this.getPls(guildID);
    if (!guild) {
      return this.initPls(guildID);
    }
    guild.pls++;

    this.client.r.table('guildUsage')
      .insert(guild, { conflict: 'update' })
      .run();

    return this.client.r.table('users')
      .get(userID)
      .update({
        pls: this.client.r.row('pls').add(1)
      })
      .run();
  }

  async initPls (guildID) {
    return this.client.r.table('guildUsage')
      .insert({
        id: guildID,
        pls: 1
      })
      .run();
  }

  async deletePls (guildID) {
    return this.client.r.table('guildUsage')
      .get(guildID)
      .delete()
      .run();
  }

  async getPls (guildID) {
    let res = await this.client.r.table('guildUsage')
      .get(guildID)
      .run();
    if (!res) {
      this.initPls(guildID);
      return 0;
    }
    return res;
  }

  async topPls () {
    return this.client.r.table('guildUsage')
      .orderBy({index: this.client.r.desc('pls')})
      .limit(10)
      .run();
  }

  async topUsers () {
    return this.client.r.table('users')
      .orderBy({index: this.client.r.desc('pls')})
      .limit(15) // TODO: Make 10 along with other (top) functions
      .run();
  }

  async removeUser (userID) {
    return this.client.r.table('users')
      .get(userID)
      .delete()
      .run();
  }

  async topPocket () {
    return this.client.r.table('users')
      .orderBy({index: this.client.r.desc('pocket')})
      .limit(10)
      .run();
  }

  async topSpam () {
    return this.client.r.table('users')
      .orderBy({index: this.client.r.desc('spam')})
      .limit(10)
      .run();
  }

  async addDonor (id, donorAmount, donationDate, declineDate, patreonID) {
    return this.client.r.table('donors')
      .insert({
        id,
        donorAmount,
        guilds: [],
        guildRedeems: 0,
        firstDonationDate: donationDate || this.client.r.now(),
        declinedSince: declineDate || null,
        totalPaid: donorAmount,
        patreonID
      }, { conflict: 'update' })
      .run();
  }

  async getDonor (id) {
    return this.client.r.table('donors')
      .get(id)
      .default(false)
      .run();
  }

  async checkPremiumGuild (id) {
    return !!await this.client.r.table('donors')
      .filter(this.client.r.row('guilds').contains(id))
      .count();
  }

  async updateDonorGuild (id, guilds, guildRedeems) {
    return this.client.r.table('donors')
      .insert({
        id,
        guilds,
        guildRedeems
      }, { conflict: 'update' })
      .run();
  }

  async removeDonor (id) {
    return this.client.r.table('donors')
      .get(id)
      .delete()
      .run();
  }

  async findExpiredDonors () {
    return this.client.r.table('donors')
      .filter(this.client.r.row('declinedSince').lt(this.client.r.now().sub(30 * 24 * 60 * 60)))
      .run(); // only 1 month after decline date
  }

  async wipeExpiredDonors () {
    return this.client.r.table('donors')
      .filter(this.client.r.row('declinedSince').lt(this.client.r.now().sub(60 * 24 * 60 * 60))) // 2 months after decline date
      .delete({returnChanges: 'always'})
      .run()
      .then(d => d.changes.map(o => o.old_val));
  }

  async checkDonor (id) {
    return this.client.r.table('donors')
      .get(id)('donorAmount')
      .default(false)
      .run();
  }

  async checkGlobalPremiumGuild (id) {
    return this.client.r.table('donors')
      .filter(this.client.r.row('guilds').contains(id))
      .run()
      .then(results => results[0] && results[0].donorAmount >= 20);
  }

  async getStats () {
    return this.client.r.table('stats')
      .get(1)('stats')
      .run();
  }

  async addTag (id, name, text) {
    return this.client.r.table('tags')
      .insert({guild_id: id, name: name, text: text});
  }

  async getAllTags (id) {
    let tags = await this.client.r.table('tags')
      .getAll(id, {index: 'guild_id'});
    return tags;
  }

  async getTag (id, name) {
    let tags = await this.client.r.table('tags')
      .filter({name: name, guild_id: id})
      .run();
    return tags[0] || false;
  }

  async removeTag (id, name) {
    return this.client.r.table('tags')
      .filter({name: name, guild_id: id})
      .delete()
      .run();
  }

  async getAutomemeChannel (id) {
    let channel = await this.client.r.table('automeme')
      .get(id)
      .run();
    return channel || false;
  }

  async removeAutomemeChannel (id) {
    return this.client.r.table('automeme')
      .get(id)
      .delete()
      .run();
  }

  async allAutomemeChannels () {
    return this.client.r.table('automeme')
      .run();
  }

  async addAutomemeChannel (id, channelID, interval, webhookID, webhookToken) { // id = guild ID
    return this.client.r.table('automeme')
      .insert({id: id, channel: channelID, interval, webhookID, webhookToken}, { conflict: 'update' });
  }

  async getAutonsfwChannel (id) {
    let channel = await this.client.r.table('autonsfw')
      .get(id)
      .run();
    return channel || false;
  }

  async removeAutonsfwChannel (id) {
    return this.client.r.table('autonsfw')
      .get(id)
      .delete()
      .run();
  }

  async allAutonsfwChannels () {
    return this.client.r.table('autonsfw')
      .run();
  }

  async addAutonsfwChannel (id, channelID, interval, type, webhookID, webhookToken) { // id = guild ID
    return this.client.r.table('autonsfw')
      .insert({id, channel: channelID, interval, type, webhookID, webhookToken}, { conflict: 'update' })
      .run();
  }

  getDefaultUser (id) {
    return {
      id, // User id/rethink id
      pls: 1, // Total commands ran
      lastCmd: Date.now(), // Last command time
      lastRan: 'nothing', // Last command ran
      spam: 0, // Spam means 2 commands in less than 1s
      pocket: 0, // Coins not in bank account
      bank: 0, // Coins in bank account
      lost: 0, // Total coins lost
      won: 0, // Total coins won
      shared: 0, // Transferred to other players
      streak: {
        time: 0, // Time since last daily command
        streak: 0 // Total current streak
      },
      upvoted: false, // DBL voter status
      dblUpvoted: false // discordthis.clientlist.com voter status
    };
  }

  getDefaultGuild (id) {
    return {
      id,
      prefix: this.client.config.options.prefix,
      modlog: '',
      disabledCategories: [],
      disabledCommands: [],
      enabledCommands: []
    };
  }

  async getUser (id) {
    return this.client.r.table('users').get(id).default(this.getDefaultUser(id)).run().then(u => new User(u, this.client));
  }

  async getGuild (id) {
    return this.client.r.table('users').get(id).default(this.getDefaultGuild(id)).run().then(g => new Guild(g, this.client));
  }
}

module.exports = DatabaseFunctions;
