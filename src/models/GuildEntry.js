/** @typedef {import("../models/GenericCommand").Memer} Memer */

/** @typedef {Object} GuildData
 * @prop {String} id The ID of the guild
 * @prop {String} prefix The prefix for this guild
 * @prop {String} modlog The ID of the modlog channel set on this guild, empty if not set
 * @prop {Array<String>} disabledCategories An array of disabled command categories on this guild
 * @prop {Array<String>} disabledCommands An array of disabled commands on this guild
 * @prop {Array<String>} enabledCommands An array of commands enabled on this guild, overrides the disabled categories
 */

/**
 * - An interface for guild entries, all methods except `update()` updates the data on this `GuildEntry` instance, and convert the changes into ReQL queries in the background
 * - The changes won't be saved unless `save()` is called
 * - If you want to return the updated data, it is recommended to use the `GuildEntry` instance returned by the `save()` method, as it is guaranteed to be what has been inserted into the database
 * - Changes directly done on `GuildEntry.props` **won't be saved**, the `update()` method should be used for changes that aren't covered by the other methods
 * - While chaining calls is possible, chaining calls that update the same value won't work as intended, as the query for this field will be overwritten
 */
class GuildEntry {
  /**
   *
   * @param {GuildData} guildData The guild entry
   * @param {Memer} Memer The Memer instance
   */
  constructor (guildData, Memer) {
    /** @type {GuildData} The entry's properties */
    this.props = { ...Memer.db.getDefaultGuild(guildData.id), ...guildData };
    /** @type {Memer} The Memer instance */
    this._client = Memer;
    this._changes = {};
  }

  /**
   * Manually update the guild entry with the given data, note that the changes won't be reflected in the object
   * @param {Object} object The data to update this guild with, rethink queries such as `r.row()` can be used in the object properties
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  update (object) {
    if (typeof object !== 'object') {
      throw new Error('Expected "object" parameter to be an object');
    }
    this._changes = this._client.deepMerge(this._changes, object);
    return this;
  }

  /**
   * Disable a command category
   * @param {String} category The category to disable
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  disableCategory (category) {
    if (!category) {
      throw new Error('Missing mandatory "category" argument');
    }
    this.props.disabledCategories.push(category);
    this.update({ disabledCategories: this._client.r.row('disabledCategories').default([]).append(category) });
    return this;
  }

  /**
   * Disable a command
   * @param {String} command The category to disable
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  disableCommand (command) {
    if (!command) {
      throw new Error('Missing mandatory "command" argument');
    }
    this.props.disabledCommands.push(command);
    this.update({ disabledCommands: this._client.r.row('disabledCommands').default([]).append(command) });
    return this;
  }

  /**
   * Saves the guild into the database
   * @returns {Promise<GuildEntry>} The freshly updated entry
   */
  async save () {
    return this._client.r.table('guilds')
      .insert(this._client.r.table('guilds').get(this.id).default(this._client.db.getDefaultGuild(this.id)).merge(this._changes), { conflict: 'update', returnChanges: 'always' }).run()
      .then(c => new GuildEntry(c.changes[0].new_val, this._client));
  }

  /**
   * Returns this entry but as JSON
   * @returns {String} This entry stringified
   */
  toJSON () {
    return JSON.stringify(this.props);
  }
}

module.exports = GuildEntry;
