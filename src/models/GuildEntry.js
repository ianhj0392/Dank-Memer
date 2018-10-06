/** @typedef {import("../models/GenericCommand").Memer} Memer */

/** @typedef {Object} GuildData
 * @prop {String} id The ID of the guild
 * @prop {String} prefix The prefix for this guild
 * @prop {String} modlog The ID of the modlog channel set on this guild, empty if not set
 * @prop {Array<String>} disabledCategories An array of disabled command categories on this guild
 * @prop {Array<String>} disabledCommands An array of disabled commands on this guild
 * @prop {Array<String>} enabledCommands An array of commands enabled on this guild, overrides the disabled categories
 * @prop {Object} autoResponse The autoresponse settings
 * @prop {Boolean} autoResponse.dad Whether dad mode is enabled
 * @prop {Boolean} autoResponse.ree Whether auto responses to "ree+" are enabled
 * @prop {Boolean} autoResponse.nou Whether auto responses to "no u+" are enabled
 * @prop {Boolean} autoResponse.sec Whether auto responses to "sec", "one sec" and "one second" are enabled
 * @prop {Boolean} swearFilter Whether the swear filter is enabled
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
    if (typeof object !== 'object' || Array.isArray(object)) {
      throw new Error(`Expected type object, received type ${typeof object}`);
    }
    this._changes = this._client.deepMerge(this._changes, object);
    return this;
  }

  /**
   *
   * @param {String} prefix The new prefix to use
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  setPrefix (prefix) {
    if (typeof prefix !== 'string') {
      throw new Error(`Expected type string, received type ${typeof prefix}`);
    }
    this.props.prefix = prefix;
    this.update({ prefix });
    return this;
  }

  /**
   * Sets a new mod log channel
   * @param {String} id The ID of the channel to use
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  setModlogChannel (id) {
    if (typeof id !== 'string') {
      throw new Error(`Expected type string, received type ${typeof id}`);
    }
    this.props.modlog = id;
    this.update({ modlog: id });
    return this;
  }

  /**
   * Toggles the swear filter
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  toggleSwearFilter () {
    this.props.swearFilter = !this.props.swearFilter;
    this.update({ swearFilter: !this.props.swearFilter });
    return this;
  }

  /**
   * Toggles the given autoresponse
   * @param {String} type The autoresponse to toggle, can be either `nou`, `sec`, `dad` or `ree`
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  toggleAutoResponse (type) {
    if (typeof type !== 'string') {
      throw new Error(`Expected type string, received type ${typeof type}`);
    }
    this.props.autoResponse[type] = !this.props.autoResponse[type];
    this.update({ autoResponse: this._client.r.row('autoResponse').default(this._client.db.getDefaultGuild().autoResponse).merge({ [type]: this.props.autoResponse[type] }) });
    return this;
  }

  /**
   * Reset the prefix of this guild to the default one set in the bot config
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  resetPrefix () {
    this.props.prefix = this._client.config.options.prefix;
    this.update({ prefix: this._client.config.options.prefix });
    return this;
  }

  /**
   * Disable a command category
   * @param {String} category The category to disable
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  disableCategory (category) {
    if (typeof category !== 'string') {
      throw new Error(`Expected type string, received type ${typeof category}`);
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
    if (typeof command !== 'string') {
      throw new Error(`Expected type string, received type ${typeof command}`);
    }
    this.props.disabledCommands.push(command);
    this.update({ disabledCommands: this._client.r.row('disabledCommands').default([]).append(command) });
    return this;
  }

  /**
   * Disable multiple command categories
   * @param {Array<String>} categories An array of categories to disable
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  disableCategories (categories) {
    if (!categories) {
      throw new Error('Missing mandatory "categories" argument');
    }
    this.props.disabledCategories = this.props.disabledCategories.concat(categories);
    this.update({ disabledCategories: this._client.r.row('disabledCategories').default([]).setUnion(categories) });
    return this;
  }

  /**
   * Disable multiple commands, the built query will also remove the disabled commands from `enabledCommands` if necessary
   * @param {Array<String>} commands An array of commands to disable
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  disableCommands (commands) {
    if (!commands) {
      throw new Error('Missing mandatory "commands" argument');
    }
    this.props.disabledCommands = this.props.disabledCommands.concat(commands);
    this.update({
      disabledCommands: this._client.r.row('disabledCommands').default([]).setUnion(commands),
      enabledCommands: this._client.r.row('enabledCommands').default([]).difference(this._client.r.row('disabledCommands').default([]).setUnion(commands))
    });
    return this;
  }

  /**
   * Enable multiple commands, the built query will also remove the disabled commands from `disabledCommands` if necessary
   * @param {Array<String>} commands An array of commands to enable
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  enableCommands (commands) {
    if (!commands) {
      throw new Error('Missing mandatory "commands" argument');
    }
    this.props.enabledCommands = this.props.enabledCommands.concat(commands);
    this.update({
      enabledCommands: this._client.r.row('enabledCommands').default([]).setUnion(commands),
      disabledCommands: this._client.r.row('disabledCommands').default([]).difference(this._client.r.row('enabledCommands').default([]).setUnion(commands))
    });
    return this;
  }

  /**
   * Enable multiple categories, effectively removes the given categories from `disabledCategories`
   * @param {Array<String>} categories An array of categories to enable
   * @returns {GuildEntry} The guild entry, so calls can be chained
   */
  enableCategories (categories) {
    if (!categories) {
      throw new Error('Missing mandatory "categories" argument');
    }
    this.props.disabledCategories = this.props.disabledCategories.filter(c => !c.includes(categories));
    this.update({ disabledCategories: this._client.r.row('disabledCategories').default([]).difference(categories) });
    return this;
  }

  /**
   * Saves the guild into the database
   * @returns {Promise<GuildEntry>} The freshly updated entry
   */
  async save () {
    return this._client.r.table('guilds')
      .insert(this._client.r.table('guilds').get(this.props.id).default(this._client.db.getDefaultGuild(this.props.id)).merge(this._changes), { conflict: 'update', returnChanges: 'always' }).run()
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
