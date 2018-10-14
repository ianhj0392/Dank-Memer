/** @typedef {import('../../../../models/GenericCommand').FunctionParams} FunctionParams */

module.exports = {
  help: 'broadcasteval <script>',
  /** @param {FunctionParams} */
  fn: async ({ Memer, msg, args }) => {
    if (!Memer.config.options.owners.includes(msg.author.id)) {
      return 'Woah now, only my "Owners" can do this';
    }
    const m = await msg.channel.createMessage('Ok this may take a few seconds so sit tight');
    const responses = await Memer.IPC.broadcastEval(args.join(' '));
    let res = '';
    for (let i = 1; i <= Memer.config.sharder.clusters; i++) {
      const clusterResponse = responses.find(r => r.clusterID === i);
      res += `[Cluster ${i}]: ${clusterResponse ? clusterResponse.data : 'timed out'}\n`;
    }
    m.edit(res);
    return `Broadcast eval done`;
  }
};
