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
        fields: [
          { name: notification.title,
            value: notification.message }
        ],
        timestamp: new Date(notification.timestamp)
      };
    } else if (action === 'dismiss') {
    } else {
      for (let notif in notifications) {
        fields.push(`**${Number(notif) + 1}.** **\`${notifications[notif].title}\`**\n${notifications[notif].message}\n`);
      }

      return Memer.paginationMenu(!fields.length ? ['No notifications, sad :cry:'] : fields, {
        type: 'Notifications',
        embed: {
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
