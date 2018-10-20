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
    const formula = ((Math.round(await Memer.calcMultiplier(Memer, msg.author, userEntry.props /* TODO: change from .props to userEntry on it's own */, donor, msg, isGlobalPremiumGuild) / 10)) * Math.floor(Memer.randomNumber(1, 2)));
    const experience = await userEntry.addExperience(formula).save().then(a => a.props.experience);
    for (const o in Currency.levels) {
      let level = Currency.levels[o];
      const levelnum = Math.floor(level.exp / 100);
      if (experience >= level.exp && userEntry.props.level < levelnum && Math.floor(experience / 100) === levelnum) {
        userEntry.setLevel(levelnum);
        // Perform rewards
        const randquote = [`Awesome job, ${msg.author.username}.`, `Great stuff ${msg.author.username}.`, `Great work ${msg.author.username}.`, `You're on fire ${msg.author.username}.`];
        userEntry.sendNotification('level', 'Level up!', `${Memer.randomInArray(randquote)} Congratulations on reaching level ${levelnum}!`);
        for (const [ reward, value ] of Object.entries(level.reward)) {
          switch (reward) {
            case 'coins':
              userEntry.addPocket(value);
              break;
            case 'multiplier':
              userEntry.addMultiplier(value);
              break;
            case 'items':
              for (const item of value) {
                for (const [ id, amount ] of Object.entries(item)) {
                  userEntry.addInventoryItem(id, amount);
                }
              }
              break;
            case 'title':
              userEntry.setTitle(value);
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
