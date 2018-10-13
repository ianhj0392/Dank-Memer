const GenericCurrencyCommand = require('../../models/GenericCurrencyCommand');
let min = 500;

const dmStolenUser = async (Memer, user, msg, worth) => {
  if (!user.bot) {
    try {
      const channel = await Memer.bot.getDMChannel(user.id);
      await channel.createMessage(`**${msg.author.username}#${msg.author.discriminator}** has stolen **${worth.toLocaleString()}** coins from you!`);
    } catch (err) {
      await msg.channel.createMessage(`${user.mention}, **${msg.author.username}#${msg.author.discriminator}** just stole **${worth.toLocaleString()}** coins from you!`);
    }
  }
};

module.exports = new GenericCurrencyCommand(
  async ({ Memer, msg, args, addCD, userEntry, donor }) => {
    let user = msg.args.resolveUser(true);
    if (!user) {
      return 'try running the command again, but this time actually mention someone to steal from';
    }
    if (msg.author.id === user.id) {
      return 'hey stupid, seems pretty dumb to steal from urself';
    }
    let perp = userEntry;
    let victim = await Memer.db.getUser(user.id);
    let perpCoins = perp.props.pocket;
    let victimCoins = victim.props.pocket;
    donor = donor ? donor.donorAmount : 0;
    if (perpCoins < min) {
      return `You need at least ${min} coins to try and rob someone.`;
    }
    if (victimCoins < min) {
      return `The victim doesn't have at least ${min} coins, not worth it man`;
    }
    if (donor < 5) { // $1-$4 gets 5% shields
      victimCoins = victimCoins - (victimCoins * 0.05);
    } else if (donor < 10 && donor > 4) { // $5-$9 gets 25% shields
      victimCoins = victimCoins - (victimCoins * 0.25);
    } else if (donor < 15 && donor > 9) { // $10-$14 gets 60% shields
      victimCoins = victimCoins - (victimCoins * 0.6);
    } else if (donor < 20 && donor > 14) { // $15-$19 gets 80% shields
      victimCoins = victimCoins - (victimCoins * 0.8);
    } else if (donor > 19) { // $20+ gets 95% shields
      victimCoins = victimCoins - (victimCoins * 0.95);
    }
    await addCD();

    // Items
    if (victim.getActiveItems().includes('padlock')) {
      await perp.removePocket(Math.round(min / 2)).save();
      return `You try to steal from ${user.username} only to notice that they've got a massive padlock on their pocket! You didn't bring your bolt cutters with you, and ended up getting caught by the police, losing **${Math.round(min / 2)}** coins.`;
    }

    await Memer.redis.get(`sand-effect-${msg.author.id}`)
      .then(res => {
        res = JSON.parse(res) || undefined;
        if (res && res.perpetrator === user.id) {
          return `${user.username} is a cheeky bastard and has thrown sand directly into your precious eyeballs! You can't steal from them right now.`;
        }
      });

    let stealingOdds = Memer.randomNumber(1, 100);
    let worth;
    let message;
    if (stealingOdds <= 60) { // fail section
      let punish;
      if ((perpCoins * 0.05) < 500) {
        punish = 500;
      } else {
        punish = perpCoins * 0.05;
      }
      await perp.removePocket(Math.round(punish)).save();
      await victim.addPocket(Math.round(punish)).save();
      return `You were caught! You paid the person you stole from **${Math.round(punish)}** coins.`;
    } else if (stealingOdds > 60 && stealingOdds <= 80) { // 30% payout
      worth = Math.round(victimCoins * 0.3);
      message = `You managed to steal a small amount before leaving! 💸\nYour payout was **${worth.toLocaleString()}** coins.`;
    } else if (stealingOdds > 80 && stealingOdds <= 90) { // 50% payout
      worth = Math.round(victimCoins * 0.5);
      message = `You managed to steal a large amount before leaving! 💰\nYour payout was **${worth.toLocaleString()}** coins.`;
    } else { // full theft
      worth = Math.round(victimCoins);
      message = `You managed to steal a TON before leaving! 🤑\nYour payout was **${worth.toLocaleString()}** coins.`;
    }
    Memer.redis.set(`stolen-${user.id}`, JSON.stringify({ amount: worth, stealer: perp.id }), 'EX', 120);
    await perp.addPocket(worth).save();
    await victim.removePocket(worth).save();
    await dmStolenUser(Memer, user, msg, worth);
    return message;
  },
  {
    triggers: ['steal', 'rob', 'ripoff'],
    cooldown: 5 * 60 * 1000,
    donorCD: 3 * 60 * 1000,
    perms: ['embedLinks'],
    description: 'Take your chances at stealing from users. Warning, you will lose money if you get caught!',
    cooldownMessage: 'Woahhh there, you need some time to plan your next hit. Wait ',
    missingArgs: 'You need to tag someone to steal from'
  }
);
