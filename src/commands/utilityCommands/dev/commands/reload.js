/** @typedef {import("../../../../models/GenericCommand").FunctionParams} FunctionParams */

module.exports = {
  help: 'reload [all | commands | config | command [command|all] | category [command category] | models | utils | events]',
  /** @param {FunctionParams} */
  fn: async ({ Memer, msg, args }) => {
    if (['category', 'command', 'commands', 'all', 'models', 'events', 'utils', 'config'].includes(args[0])) {
      const m = await msg.channel.createMessage(`confirm spicy reload? \`y\`/\`n\``);

      const choice = await Memer.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 5e4);
      if (!choice || choice.content.toLowerCase() !== 'y') {
        m.edit('whew, dodged a bullet');
        return;
      }
    } else {
      return '`reload all` Reloads everything, including the main class\n' +
      '`reload commands` Reloads all commands, also the only way to reload dev commands\n' +
      '`reload config` Reloads the config, secrets and package files\n' +
      '`reload command [command]` Reloads the given command, doesn\'t work with dev commands\n' +
      '`reload category [category]` Reloads the given command category, use like `reload utility` (doesn\'t work with dev category)\n' +
      '`reload models` Reloads models, though due to their nature, the files that requires them (like commands) needs to be reloaded too\n' +
      '`reload utils` Reloads utils, except `redisClient`, this one may be reloaded with `all`\n' +
      '`reload events` Reloads event listeners, (`src/handlers`)';
    }

    const type = msg.args.nextArgument(false).toLowerCase();
    switch (type) {
      case 'category':
        try {
          const category = msg.args.nextArgument(false).toLowerCase();
          if (!category) {
            return `You gotta specify a category to reload stupid`;
          }
          Memer.IPC.broadcast('reloadCommands', { category });
          return `Reloaded command category ${category}`;
        } catch (err) {
          return `We had a hecking error: \n\`\`\`${err.stack || err.message || err}\`\`\``;
        }
      case 'command':
        try {
          const command = msg.args.nextArgument(false).toLowerCase();
          Memer.IPC.broadcast('reloadCommands', command === 'all' ? {} : { command });
          return `Reloaded ${command === 'all' ? 'all commands' : (command + ' command')}`;
        } catch (err) {
          return `We had a hecking error: \n\`\`\`${err.stack || err.message || err}\`\`\``;
        }
      case 'events':
        try {
          Memer.IPC.broadcast('reloadListeners', {});
          return `Reloaded all event listeners`;
        } catch (err) {
          return `We had a hecking error: \n\`\`\`${err.stack || err.message || err}\`\`\``;
        }
      case 'commands':
        try {
          Memer.IPC.broadcast('reloadCommands', {});
          return `Reloaded all commands`;
        } catch (err) {
          return `We had a hecking error: \n\`\`\`${err.stack || err.message || err}\`\`\``;
        }
      case 'all':
        try {
          await msg.channel.createMessage(`Preserve connections to lavalink/redis/rethink...? \`y\`/\`n\``);
          let choice = await Memer.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 5e4);
          choice = (!choice || choice.content.toLowerCase() === 'y');
          Memer.IPC.broadcast('reloadAll', { preserveConnections: choice });
          return `Reloaded welp everything`;
        } catch (err) {
          return `We had a hecking error: \n\`\`\`${err.stack || err.message || err}\`\`\``;
        }
      case 'config':
        try {
          Memer.IPC.broadcast('reloadConfig', {});
          return `Reloaded config`;
        } catch (err) {
          return `We had a hecking error: \n\`\`\`${err.stack || err.message || err}\`\`\``;
        }
      case 'utils':
        try {
          Memer.IPC.broadcast('reloadUtils', {});
          return `Reloaded utils`;
        } catch (err) {
          return `We had a hecking error: \n\`\`\`${err.stack || err.message || err}\`\`\``;
        }
      case 'models':
        try {
          Memer.IPC.broadcast('reloadModels', {});
          return `Reloaded models`;
        } catch (err) {
          return `We had a hecking error: \n\`\`\`${err.stack || err.message || err}\`\`\``;
        }
    }
  }
};
