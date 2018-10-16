
const config = require('./config.json');
const secrets = require('./secrets.json');
const { Master: Sharder } = require('eris-sharder');
const { post } = require('./utils/http');
const r = require('rethinkdbdash')();
const masterProcess = require('cluster');

// Initiate Eris-Sharder

const master = new Sharder(secrets.bot.token, config.sharder.path, {
  stats: true,
  name: config.sharder.name || 'Dank Memer',
  webhooks: config.sharder.webhooks,
  clientOptions: config.eris.clientOptions,
  shards: config.sharder.shardCount || 1,
  statsInterval: config.statsInterval || 1e4,
  clusters: config.sharder.clusters || undefined,
  guildsPerShard: config.sharder.guildsPerShard
});

// Record bot stats every x seconds/minutes to the database

master.on('stats', res => {
  r.table('stats')
    .insert({ id: 1, stats: res }, { conflict: 'update' })
    .run();

  // TODO: Post stats to endpoint on the webserver
});

if (master.isMaster()) {
  masterProcess.on('message', (worker, msg) => {
    msg = msg || {};
    if (msg.type === 'restartCluster') {
      master.restartCluster({ id: msg.data }, 13);
    }
  });
}

// Delete stats data on SIGINT to help prevent problems with some commands

process.on('SIGINT', async () => { // TODO: See if this still needs to happen after disabling automatic db wipes on pls lb/rich/ulb
  await r.table('stats')
    .get(1)
    .delete()
    .run()
    .catch(() => {});

  process.exit();
});

// Post guild count to each bot list api

if (master.isMaster() && !config.options.dev) {
  setInterval(async () => {
    const { stats: { guilds } } = await r.table('stats')
      .get(1)
      .run();

    for (const botlist of secrets.botlists) {
      post(botlist.url)
        .set('Authorization', botlist.token)
        .send({
          [`server${botlist.url.includes('carbonitex') ? '' : '_'}count`]: guilds, // TODO: Does carbon still not allow underscore?
          key: botlist.token
        })
        .end();
    }
  }, 60 * 60 * 1000);
}

(async () => {
  if (master.isMaster()) {
    const redis = await require('./utils/redisClient.js')(config.redis);
    const changesStream = await r.table('users').changes({ squash: true, includeInitial: false, includeTypes: true }).run();
    changesStream.on('data', data => {
      const pipeline = redis.pipeline();
      if (data.type === 'remove') {
        pipeline.zrem('pocket-leaderboard', data.old_val.id);
        pipeline.zrem('pls-leaderboard', data.old_val.id);
        pipeline.exec()
          .catch(console.error);
      } else {
        pipeline.zadd('pocket-leaderboard', data.new_val.pocket, data.new_val.id);
        pipeline.zadd('pls-leaderboard', data.new_val.pls, data.new_val.id);
        pipeline.exec()
          .catch(console.error);
      }
    });
  }
})();
