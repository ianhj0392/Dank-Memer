/** @typedef {import("../../../../models/GenericCommand").FunctionParams} FunctionParams */

module.exports = {
  help: 'reload [all | commands | config | command [command|all] | category [command category] | models | utils]',
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
      return 'reload [all | commands | config | command [command|all] | category [command category] | models | utils]';
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
