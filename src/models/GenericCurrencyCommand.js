/** @typedef {import('./GenericCommand').CommandProps} CommandProps */

const { Currency, GenericCommand } = require('.');

module.exports = class GenericCurrencyCommand {
  /**
   * Creates a new instance of GenericCurrencyCommand
   * @param {import('./GenericCommand').CommandCallback} fn The function
   * @param {CommandProps} cmdProps - The command properties
   */
  constructor (fn, cmdProps) {
    this.fn = fn;
    this.cmdProps = cmdProps;
  }

  async run ({ Memer, msg, addCD, args, userEntry, donor, guildEntry, isGlobalPremiumGuild }) {
    const formula = ((Math.round(await Memer.calcMultiplier(Memer, msg.author, userEntry, donor, msg, isGlobalPremiumGuild) / 10)) * 1);
    const experience = Math.random() > 0.6 ? userEntry.addExperience(formula).props.experience : userEntry.props.experience;

    // Level will always go up in 10's, however level rewards will skip every second level
    if (userEntry.props.level !== Math.floor(experience / 100)) {
      const level = Math.floor(experience / 100);
      const rewlevel = Currency.levels[level];
      userEntry.setLevel(Math.floor(experience / 100));
      // Send notification on level up, rewards are handled separately
      const randquote = [`Awesome job, ${msg.author.username}.`, `Great stuff ${msg.author.username}.`, `Great work ${msg.author.username}.`, `You're on fire ${msg.author.username}.`];
      userEntry.sendNotification('level', 'Level up!', `${Memer.randomInArray(randquote)} Congratulations on reaching level ${level}!`);

      if (rewlevel && experience >= rewlevel.exp) {
        for (const [ reward, value ] of Object.entries(rewlevel.reward)) {
          switch (reward) {
            case 'coins':
              userEntry.addPocket(value);
              break;
            case 'multiplier':
              userEntry.setMultiplier(userEntry.props.upgrades.multi + value);
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
