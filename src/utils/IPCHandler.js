/** @typedef {import('../models/GenericCommand').Memer} Memer
 * @typedef {import('eris').Guild} Guild
 * @typedef {import('eris').User} User
 * @typedef {import('eris').TextChannel} TextChannel
 * @typedef {import('eris').VoiceChannel} VoiceChannel
 * @typedef {import('eris').CategoryChannel} CategoryChannel
 * @typedef {import('eris').AnyGuildChannel} AnyGuildChannel
 * @typedef {import('eris').Member} Member
 * @typedef {import('eris').Role} Role
 * @typedef {import('eris').JSON}
*/

/** @typedef {Object} ConvertedProperties
 * @prop {Array<Role>} roles An array of roles on this guild
 * @prop {Array<Member>} members An array of members on this guild
 * @prop {Array<AnyGuildChannel>} channels An array of channels on this guild
 */

/** @typedef {Guild & ConvertedProperties} StringifiedGuild */

/** @typedef {Object} ClusterStats
 * @prop {Number} cluster The ID of the cluster
 * @prop {Number} shards The amount of shards on this cluster
 * @prop {Number} guilds The total amount of guilds across all clusters
 * @prop {Number} ram The RSS RAM usage of this cluster (in MB)
 * @prop {Number} voice The amount of voice connections on this cluster
 * @prop {Number} uptime The uptime of this cluster in milliseconds
 * @prop {Number} exclusiveGuilds The amount of guilds on this cluster
 * @prop {Number} largeGuilds The amount of large guilds on this cluster (250+ members)
 */

/** @typedef {Object} MessageResponses
 * @prop {String} type The type of the response
 * @prop {String} id The ID of the original message this response is replying to
 * @prop {Number} clusterID The ID of the cluster this response is from
 * @prop {*} [data] The data this cluster responded with, can be `undefined`
 */

class IPCHandler {
  /**
    * @param {Memer} client The Memer instance
    */
  constructor (client) {
    /** @type {Map} A map of the current ongoing requests */
    this.requests = new Map();
    /** @type {Memer} The Memer instance */
    this.client = client;
    this._handleIncomingMessage = this._handleIncomingMessage.bind(this);
    this.client.ipc.register('memerIPC', this._handleIncomingMessage);
    this._idsGenerated = 0;
  }

  /**
     * Returns a new unique ID
     *
     * @readonly
     * @memberof IPCHandler
     * @type {String}
     */
  get uid () {
    return `${Date.now()}-${process.pid}-${this._idsGenerated++}`;
  }

  /**
    *
    *
    * @param {String} type The request type
    * @param {*} data Additional data about the request
    * @param {Boolean} [resolveResponses=false] Whether the responses that made it in time should be resolved if the timeout is reached (`undefined` is resolved otherwise), defaults to `false`
    * @returns {Promise<*>}
    * @memberof IPCHandler
    * @private
    */
  _createRequest (type, data, resolveResponses = false) {
    return new Promise((resolve, reject) => {
      const id = this.uid;
      this.requests.set(id, {
        responses: [],
        resolve,
        reject
      });
      this.client.ipc.broadcast('memerIPC', {
        type,
        id,
        clusterID: this.client.clusterID,
        data,
        timeout: setTimeout(() => {
          const request = this.requests.get(id);
          if (request) {
            request.resolve(resolveResponses ? request.responses : undefined);
            this.requests.delete(id);
          }
        }, 1000 * 10)
      });
    });
  }

  /**
   *
   *
   * @param {Object} message The IPC message to reply to
   * @param {String} type The type of the reply
   * @param {*} data Additional data to reply with
   * @private
   * @memberof IPCHandler
   */
  _replyTo (message, type, data) {
    this.client.ipc.sendTo(message.clusterID, 'memerIPC', {
      type,
      id: message.id,
      clusterID: this.client.clusterID,
      data: data
    });
  }

  /**
    *
    *
    * @param {String} id The ID of the guild to fetch
    * @returns {Promise<StringifiedGuild>}
    * @memberof IPCHandler
    */
  async fetchGuild (id) {
    if (this.client.bot.guilds.has(id)) {
      let guild = this.client.bot.guilds.get(id);
      const members = Array.from(guild.members.values());
      const roles = Array.from(guild.roles.values());
      const channels = Array.from(guild.members.values());
      guild = {
        ...guild,
        members,
        roles,
        channels
      };
      return this.toJSON(guild);
    }
    return this._createRequest('fetchGuild', id);
  }

  /**
    *
    *
    * @param {String} id The ID of the user to fetch
    * @returns {Promise<User>}
    * @memberof IPCHandler
    */
  async fetchUser (id) {
    if (this.client.bot.users.has(id)) {
      return this.client.bot.users.get(id).toJSON();
    }
    return this._createRequest('fetchUser', id);
  }

  /**
    *
    *
    * @param {String} id The ID of the channel to fetch
    * @returns {Promise<AnyGuildChannel>}
    * @memberof IPCHandler
    */
  async fetchChannel (id) {
    let channel;
    let channelGuild = this.client.bot.guilds.get(this.client.bot.channelGuildMap[id]);
    if (channelGuild) {
      channel = channelGuild.channels.get(id);
    }
    if (channel) {
      return this.toJSON(channel);
    }
    return this._createRequest('fetchChannel', id);
  }

  /**
   * Broadcast the given event to all clusters, uses eris-sharder's IPC
   *
   * @param {String} event The name of the event to broadcast
   * @param {Object} [data={}] Additional data to broadcast, defaults to `{}`
   * @returns {void}
   * @memberof IPCHandler
   */
  broadcast (event, data = {}) {
    this.client.ipc.broadcast(event, data);
  }

  /**
   * Register a callback for the given IPC event
   *
   * @param {String} event The name of the event to listen to
   * @param {Function} callback The callback function, a `message` argument may be passed to it, this argument being the additional data emitted along with the event
   * @returns {void}
   * @memberof IPCHandler
   */
  register (event, callback) {
    this.client.ipc.register(event, callback);
  }

  /**
   *
   *
   * @param {String} code The code to evaluate, `Memer` may be used in the code, it is a reference to the `Memer` instance on the cluster on which it is evaluated
   * @returns {Promise<Array<MessageResponses>>} An array containing responses of each cluster
   * @memberof IPCHandler
   */
  async broadcastEval (code) {
    return this._createRequest('eval', code, true);
  }

  /**
     * Called every time the message event is fired on the process
     * @param {Object} message - The message
     * @private
     * @returns {void}
     */
  async _handleIncomingMessage (message) {
    const request = this.requests.get(message.id);
    if (!request && message.type.startsWith('requested')) {
      return;
    }
    request.responses.push(message);
    switch (message.type) {
      case 'fetchGuild':
        let guild = this.client.bot.guilds.get(message.data);
        if (guild) {
          const members = Array.from(guild.members.values());
          const roles = Array.from(guild.roles.values());
          const channels = Array.from(guild.members.values());
          guild = {
            ...guild,
            members,
            roles,
            channels
          };
        }
        this._replyTo(message, 'requestedGuild', guild ? guild.toJSON() : undefined);
        break;

      case 'requestedGuild':
        if (this._allClustersAnswered(message.id) || message.data) {
          request.resolve(message.data);
          clearTimeout(request.timeout);
          return this.requests.delete(message.id);
        }
        break;

      case 'fetchUser':
        let user = this.client.bot.users.get(message.data);
        this._replyTo(message, 'requestedUser', user ? user.toJSON() : user);
        break;

      case 'requestedUser':
        if (this._allClustersAnswered(message.id) || message.data) {
          request.resolve(message.data);
          clearTimeout(request.timeout);
          return this.requests.delete(message.id);
        }
        break;

      case 'fetchChannel':
        let channel;
        let channelGuild = this.client.bot.guilds.get(this.client.bot.channelGuildMap[message.data]);
        if (channelGuild) {
          channel = channelGuild.channels.get(message.data);
        }
        this._replyTo(message, 'requestedChannel', channel ? channel.toJSON() : channel);
        break;

      case 'requestedChannel':
        if (this._allClustersAnswered(message.id) || message.data) {
          request.resolve(message.data);
          clearTimeout(request.timeout);
          return this.requests.delete(message.id);
        }
        break;

      case 'eval':
        const result = await this._eval(this.client, message.data);
        this._replyTo(message, 'evalResult', result);
        break;

      case 'evalResult':
        if (!request) {
          return;
        }
        if (this._allClustersAnswered(message.id)) {
          request.resolve(request.responses);
          clearTimeout(request.timeout);
          return this.requests.delete(message.id);
        }
    }
    if (process.argv.includes('--dev')) {
      this.client.log(`[IPCHandler] - Received the message ${message.type} from cluster ${message.clusterID}: ${JSON.stringify(message, null, 2)}`);
    }
  }

  /**
    * Check if all the active clusters responded to a request
    * @param {String} id - The ID of the request to check if all the clusters answered to
    * @returns {Boolean} Whether all the clusters responded to the request
    * @private
    */
  _allClustersAnswered (id) {
    return this.requests.get(id).responses.length >= this.client.config.sharder.clusters;
  }

  /**
   *
   *
   * @param {Memer} Memer The Memer instance
   * @param {String} input The code to evaluate
   * @returns {Promise<String>} The error message, or `Success`
   * @memberof IPCHandler
   */
  async _eval (Memer, input) {
    const asynchr = input.includes('return') || input.includes('await');
    let error;
    try {
      await eval(asynchr ? `(async()=>{${input}})();` : input) // eslint-disable-line
    } catch (err) {
      error = err.message;
      Memer.log(err, 'error');
    }
    return error || 'Success';
  }

  /**
   * Makes the given object stringifiable by JSON.stringify() (converting types if necessary)
   * @param {Object} object The object to make stringifiable
   * @returns {Object} The given object, but stringifiable
   */
  toJSON (object) {
    const base = {};
    for (const key in object) {
      if (!base.hasOwnProperty(key) && object.hasOwnProperty(key) && !key.startsWith('_')) {
        if (!object[key]) {
          base[key] = object[key];
        } else if (object[key] instanceof Set) {
          base[key] = Array.from(object[key]);
        } else if (object[key] instanceof Map) {
          base[key] = Array.from(object[key].values());
        } else if (typeof object[key].toJSON === 'function') {
          base[key] = object[key].toJSON();
        } else {
          base[key] = object[key];
        }
      }
    }
    return base;
  }
}

module.exports = IPCHandler;
