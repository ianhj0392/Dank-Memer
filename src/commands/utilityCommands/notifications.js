const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, args, userEntry }) => {
    let fields = [];
    let action = msg.args.nextArgument();
    let value = msg.args.nextArgument();
    let notifications = userEntry.props.notifications;
    notifications = notifications.sort(n => n.type);

    if (action === 'view') {
      const notification = notifications[Number(value) - 1];
      if (!notification) {
        return 'That\'s not a valid notification :rage:';
      }
      return {
        description: `Grouped under \`${notification.type}\``,
        color: 10395294,
        fields: [
          { name: `${notification.title}`,
            value: notification.message }
        ],
        timestamp: new Date(notification.timestamp)
      };
    } else if (action === 'dismiss') {
      let index = value ? isNaN(Number(value) - 1) || !Number.isInteger(Number(value) - 1) ? value : Number(value) - 1 : null;
      userEntry.dismissNotification(index);
      await userEntry.save();
      return `Alright, removed ${value ? (Number.isInteger(index) ? `notification #${index}` : `any notifications grouped under ${index}`) : 'all notifications'}`;
    } else {
      for (let notif in notifications) {
        fields.push(`**${Number(notif) + 1}.** **\`${notifications[notif].title}\`**\n${notifications[notif].message}\n`);
      }

      return Memer.paginationMenu(!fields.length ? ['No notifications, sad :cry:'] : fields, {
        type: 'Notifications',
        embed: {
          color: 15022389
        },
        pageLength: 5
      }, action);
    }
  }, {
    triggers: ['notifications', 'notifs'],
    usage: '{command}',
    description: 'View your notifications'
  }
);
