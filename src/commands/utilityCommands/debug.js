const os = require('os');
const GenericCommand = require('../../models/GenericCommand');
// const { promisify } = require('util')
// const exec = promisify(require('child_process').exec)
const getCPUUsage = async () => {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let [timeUsed0, timeIdle0, timeUsed1, timeIdle1] = new Array(4).fill(0);

  const cpu0 = os.cpus();
  await sleep(1000);
  const cpu1 = os.cpus();

  for (const cpu of cpu1) {
    timeUsed1 += (
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys
    );
    timeIdle1 += cpu.times.idle;
  }
  for (const cpu of cpu0) {
    timeUsed0 += (
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys
    );
    timeIdle0 += cpu.times.idle;
  }

  const totalUsed = timeUsed1 - timeUsed0;
  const totalIdle = timeIdle1 - timeIdle0;
  return (totalUsed / (totalUsed + totalIdle)) * 100;
};

module.exports = new GenericCommand(
  async ({ Memer, msg }) => {
    // const sfxCount = await exec('$(find /home/memer/Dank-Memer/src/assets/audio/custom/ -type f | wc -l)').catch(() => 0)
    // const sfxSize = await exec('$(du -sh /home/memer/Dank-Memer/src/assets/audio/custom/ | cut -f1)').catch(() => 0)
    const stats = await Memer.db.getStats();
    const clusterCount = stats.clusters.length;

    const CPUUsage = await getCPUUsage();
    let cached = await Memer.redis.keys('msg-*');
    cached = cached.length;
    let totalMem = `${(stats.totalRam / 1024).toFixed(2)}/${(os.totalmem() / 1073741824).toFixed(0)}`;
    let rss = (process.memoryUsage().rss / 1024 / 1024 / 1024).toFixed(2);
    let heap = (process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2);
    let avgCluster = ((stats.totalRam / 1024) / clusterCount).toFixed(2);
    return {
      footer: { text: `Version ${Memer.package.version}` },
      fields: [
        {
          name: 'Guilds',
          value: `**Total**: ${stats.guilds}\n` +
          `**Joined**: ${Memer.stats.guildsJoined}\n` +
          `**Left**: ${Memer.stats.guildsLeft}\n` +
          `**Large**: ${stats.largeGuilds}\n` +
          `**Exclusive**: ${stats.exclusiveGuilds}`,
          inline: true
        },
        {
          name: 'Messages and Users',
          value: `**Online**: ${stats.users}\n` +
          `**A.O.U.P.S**: ${(stats.users / stats.guilds).toFixed()}\n` +
          `**Messages**: ${Memer.stats.messages}\n` +
          `**Cached**: ${cached}\n` +
          `**Commands**: ${Memer.stats.commands}`,
          inline: true
        },
        {
          name: 'Performance',
          value: `**CPU**: ${CPUUsage.toFixed(0)}%\n` +
          `**Total Mem**: ${totalMem}gb\n` +
          `**Process RSS**: ${rss}gb\n` +
          `**Process Heap**: ${heap}gb\n` +
          `**Average Cluster**: ${avgCluster}gb`,
          inline: true
        }
      ]
    };
  }, {
    triggers: ['debug'],
    cooldown: 1e4,
    ownerOnly: true,
    description: 'Returns information and statistics about Dank Memer.',
    perms: ['embedLinks']
  }
);
