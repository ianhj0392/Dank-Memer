/** @typedef {import('../models/genericCommand').Memer} Memer */

const Music = require('../models/Music');

class MusicManager {
  constructor (client) {
    /** @type {Memer} The Memer instance */
    this.client = client;
    this._map = new Map();
  }

  /**
   *
   * @param {String} id The ID of the guild to get the music player of
   * @returns {Music}
   */
  get (id) {
    let val = this._map.get(id);
    if (!val) {
      val = new Music(this.client, id);
      this._map.set(id, val);
    }
    return val;
  }

  get lavalink () {
    return this.client.bot.voiceConnections;
  }

  get firstAvailableNode () {
    return this.client.bot.voiceConnections.nodes.find(n => n.connected);
  }

  getRESTURL (node) {
    return `http://${node.host}:${this.client.config.lavalink.nodes.find(n => n.host === node.host).port}`;
  }

  async loadTrack (query, node = this.firstAvailableNode) {
    const result = await this.client.http.get(`${this.getRESTURL(node)}/loadtracks?identifier=${query}`, {headers: {'Authorization': node.password}}).end()
      .catch(err => {
        this.client.bot.emit('error', err);
        return false;
      });
    return result ? result.data : undefined;
  }
}

module.exports = (opts) => new MusicManager(opts);
