const GenericCommand = require('../../models/GenericCommand');

module.exports = new GenericCommand(
  async ({ Memer, msg, addCD, userEntry }) => {
    let data = await Memer.http.get('https://opentdb.com/api.php')
      .query({ amount: 1, type: 'multiple', encode: 'url3986' });
    let trivia = data.body.results[0];
    let time = 10 * 1000;
    let worth = 0;

    const difficulty = decodeURIComponent(trivia.difficulty);
    let answers = trivia.incorrect_answers;
    answers.push(trivia.correct_answer);
    answers = answers.map(m => { return decodeURIComponent(m); });
    answers.sort((a, b) => { // sort the answers in abc order to prevent the correct answer from being in the same spot each time
      let answerA = a.toLowerCase();
      let answerB = b.toLowerCase();
      if (answerA < answerB) { return -1; }
      if (answerA > answerB) { return 1; }
      return 0;
    });
    let front = answers.map(m => `${answers.indexOf(m) + 1}) *${m}*`).join('\n');

    // Time/reward determination
    if (difficulty === 'easy') {
      time = 10 * 1000;
      worth = 2;
    } else if (difficulty === 'medium') {
      time = 15 * 1000;
      worth = 4;
    } else { // hard
      time = 20 * 1000;
      worth = 8;
    }

    msg.channel.createMessage({ embed: {
      author:
          {
            name: `${msg.author.username}'s trivia question`,
            icon_url: msg.author.dynamicAvatarURL()
          },
      color: Memer.randomColor(),
      description: `**${decodeURIComponent(trivia.question)}**\n*You have ${time / 1000} seconds to answer.*\n\n` + front,
      fields: [
        // { name: 'Choices', value: answers.join('\n'), inline: false },
        { name: 'Worth', value: `\`${worth} ${worth === 1 ? 'coin' : 'coins'}\``, inline: true },
        // TODO: trivia leaderboards
        { name: 'Difficulty', value: `\`${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}\``, inline: true },
        { name: 'Category', value: `\`${decodeURIComponent(trivia.category)}\``, inline: true }
      ],
      footer: { text: 'You can use the number or the word to answer!' }
    }});

    const choice = await Memer.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, time);

    if (!choice) {
      return 'You did not answer in time, what the heck dude/lady (I do not judge or assume ok)';
    }

    await addCD();
    if (choice.content.toLowerCase().includes(decodeURIComponent(trivia.correct_answer).toLowerCase()) ||
      Number(choice.content) === answers.indexOf(decodeURIComponent(trivia.correct_answer)) + 1) {
      await userEntry.addPocket(worth).save();
      return `correct, nice. You earned **${worth}** coins`;
    } else {
      return `no idiot, the correct answer was \`${decodeURIComponent(trivia.correct_answer)}\``;
    }
  },
  {
    triggers: ['trivia'],
    cooldown: 25 * 1000,
    donorCD: 20 * 1000,
    description: 'Answer some trivia for a chance to win some coins.'
  }
);
