/** @typedef {import('./GenericCommand').CommandProps} CommandProps */

const GenericCommand = require('./GenericCommand');

module.exports = class GenericCurrencyCommand {
  /**
   * Creates a new instance of GenericCurrencyCommand
   * @param {CommandProps} cmdProps - The command properties
   */
  constructor (fn, cmdProps) {
    this.fn = fn;
    this.cmdProps = cmdProps;
  }

  async run ({ Memer, msg, addCD, args, userEntry, donor, guildEntry, isGlobalPremiumGuild }) {
    if (this.props.requiresPremium && !await Memer.db.checkPremiumGuild(msg.channel.guild.id)) {
      return 'This command is only available on **Premium** servers.\nTo learn more about how to redeem a premium server, visit our Patreon https://www.patreon.com/dankmemerbot';
    }

    const formula = ((Math.round(Memer.calcMultiplier(Memer, msg.author, userEntry.props, null /* TODO: need donor object here */, msg, isGlobalPremiumGuild) / 10)) * Math.floor(Memer.randomNumber(1, 2)));
    const experience = await userEntry.addExperience(formula).save();

    for (const level in Memer.levels) {
      if (experience >= level.exp) {
        userEntry.setLevel(Math.floor(level.exp / 100));
        // Perform rewards
        for (const { reward, value } in Object.values(level.reward)) {
          switch (reward) {
            case 'coins':
              userEntry.addPocket(value);
              break;
            case 'multiplier':
              // TODO: add multiplier case
              break;
            case 'items':
              for (const item in value) {
                userEntry.addInventoryItem(item.id);
              }
              break;
            case 'title':
              // TODO: add title case
              break;
          }
        }
      }
    }

    await addCD();
    return this.fn({ Memer, msg, args, addCD, userEntry, donor, guildEntry });
  }

  get props () {
    return new GenericCommand(
      this.fn,
      Object.assign({
        cooldown: 2000,
        donorCD: 500
      }, this.cmdProps)
    ).props;
  }
};
