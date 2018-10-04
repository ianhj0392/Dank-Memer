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

  async run ({ Memer, msg, addCD, args }) {
    if (this.props.requiresPremium && !await Memer.db.checkPremiumGuild(msg.channel.guild.id)) {
      return 'This command is only available on **Premium** servers.\nTo learn more about how to redeem a premium server, visit our Patreon https://www.patreon.com/dankmemerbot';
    }

    await addCD();
    return this.fn({ Memer, msg, args, addCD });
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
