module.exports = {
  help: 'who spammin',
  fn: async ({ Memer }) => {
    const bigmeme = (id) => Memer.IPC.fetchUser(id, 2000).then(u => u || { id });

    let pls = await Memer.db.topSpam();
    pls = await Promise.all(pls.map(async g => Object.assign(await bigmeme(g.id), { pls: g.spam })));
    return {
      title: 'Top 10 Spammers',
      description: pls.map((g) => `${g.pls.toLocaleString()} - ${g.username ? g.username + '#' + g.discriminator + ' ' + g.id : (Memer.db.removeUser(g.id) && 'LOL WHO DIS')}`).join('\n'),
      footer: { text: `fooking spammers` }
    };
  }
};
