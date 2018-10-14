const GenericCommand = require('../../models/GenericCommand');
const emojis = [':first_place:', ':second_place:', ':third_place:'];

module.exports = new GenericCommand(
  async ({Memer, msg}) => {
    let stats = await Memer.db.getStats();
    if (stats.clusters[stats.clusters.length - 1].uptime === 0) {
      return 'bot is still loading, hold ur horses damn';
    }
    const bigmeme = (id) => Memer.IPC.fetchGuild(id).then(g => g || { id });

    let pls = await Memer.db.topPls();
    let you = await Memer.db.getPls(msg.channel.guild.id);
    pls = await Promise.all(pls.map(async g => Object.assign(await bigmeme(g.id), { pls: g.pls })));
    return {
      title: 'Top 10 servers (Commands Ran)',
      description: pls.map((g, i) => `${emojis[i] || '👏'} ${g.pls.toLocaleString()} - ${g.name || 'LOL WHO DIS'}`).join('\n'),
      footer: { text: `Your server has ran ${you.pls} commands` }
    };
  },
  {
    triggers: ['leaderboard', 'lb'],
    cooldown: 1e4,
    description: 'See the top servers using dank memer'
  }
);
