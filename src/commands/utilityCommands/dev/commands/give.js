module.exports = {
  help: 'Show user info',
  fn: async ({ Memer, args }) => {
    if (!args[0] && isNaN(args[0])) {
      return 'you need to give an id';
    }
    let id = args[0];
    let amount;
    if (args[1] && Number(args[1])) {
      amount = Number(args[1]);
    } else {
      amount = 1;
    }
    await Memer.r.table('users').get(id).default(Memer.db.getDefaultUser(id)).update({
      pocket: Memer.r.row('pocket').add(amount),
      won: Memer.r.row('pocket').add(amount)
    });
    return `<@${id}> (${id}) was given ${amount} coins.`;
  }
};
