/** @typedef {import('../models/genericCommand').Memer} Memer */

/**
 * @typedef {Object} LavalinkTrack
 * @property {Object} info Informations about the track
 * @property {String} info.identifier The unique identifier of the track, as defined by the provider (youtube, soundcloud..)
 * @property {Boolean} info.isSeekable Whether the use of the seek method is possible
 * @property {String} info.author The name of the author of the track
 * @property {Number} info.length The duration of the track in milliseconds
 * @property {Boolean} info.isStream Whether the track is a live-stream
 * @property {Number} info.position The current position of the player in the track, represented in milliseconds
 * @property {String} info.title The title of the track
 * @property {String} info.uri The URL to the track
 * @property {String} track Encoded string identifier for this track, meant to be sent to lavalink when requesting to play it
 */

const Music = require('../models/Music');

class MusicManager {
  constructor (client) {
    /** @type {Memer} The Memer instance */
    this.client = client;
    this._map = new Map();
    /** @type {{playlist: String, track: String, search: String, noResult: String, failed: String}} */
    this.loadTypes = {
      playlist: 'PLAYLIST_LOADED',
      track: 'TRACK_LOADED',
      search: 'SEARCH_RESULT',
      noResult: 'NO_MATCHES',
      failed: 'LOAD_FAILED'
    };
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

  /**
   *
   *
   * @param {String} query
   * @param {Object} [node=this.firstAvailableNode]
   * @returns {Promise<{loadType: String, playlistInfo: Object, tracks: Array<LavalinkTrack>}>}
   * @memberof MusicManager
   */
  async loadTrack (query, node = this.firstAvailableNode) {
    const result = await this.client.http.get(`${this.getRESTURL(node)}/loadtracks?identifier=${query}`, {headers: {'Authorization': node.password}}).end()
      .catch(err => {
        this.client.log(err, 'error');
        return { loadType: this.loadTypes.failed, playlistInfo: {}, tracks: [] };
      });
    return result ? result.body : { loadType: this.loadTypes.noResult, playlistInfo: {}, tracks: [] };
  }
}

module.exports = (opts) => new MusicManager(opts);
