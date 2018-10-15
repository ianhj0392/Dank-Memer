/** @typedef {import('../../../../models/GenericCommand').FunctionParams} FunctionParams */

module.exports = {
  help: 'rollingrestart',
  /** @param {FunctionParams} */
  fn: async ({ Memer, msg }) => {
    if (!Memer.config.options.owners.includes(msg.author.id)) {
      return 'Woah now, only my "Owners" can do this';
    }
    const m = await msg.channel.createMessage(`Are you sure about this? \`y\`/\`n\``);

    const choice = await Memer.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 5e4);
    if (!choice || choice.content.toLowerCase() !== 'y') {
      m.edit('whew, dodged a bullet');
      return;
    }
    Memer.IPC.rollingRestart();
    return `Rolling restart started`;
  }
};
