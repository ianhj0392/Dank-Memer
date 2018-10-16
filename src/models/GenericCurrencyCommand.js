/** @typedef {import('./GenericCommand').CommandProps} CommandProps */

const { Currency, GenericCommand } = require('.');

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
    const formula = ((Math.round(await Memer.calcMultiplier(Memer, msg.author, userEntry.props, null, msg, isGlobalPremiumGuild) / 10)) * Math.floor(Memer.randomNumber(1, 2)));
    const experience = await userEntry.addExperience(formula).save().then(a => a.props.experience);
    for (const o in Currency.levels) {
      let level = Currency.levels[o];
      if (experience >= level.exp) {
        userEntry.setLevel(Math.floor(level.exp / 100));
        // Perform rewards
        for (const { reward, value } in Object.values(level.reward)) {
          switch (reward) {
            case 'coins':
              userEntry.addPocket(value);
              break;
            case 'multiplier':
              // userEntry.addMultiplier() - multi already exists, need to make function for it
              break;
            case 'items':
              for (const item in value) {
                userEntry.addInventoryItem(item.id, value[item]);
              }
              break;
            case 'title':
              // TODO: add title case - need to implement `profile` command first or similar
              break;
          }
        }
        await userEntry.save();
      }
    }

    return this.fn({ Memer, msg, args, addCD, Currency, userEntry, donor, guildEntry });
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
