const GenericCommand = require('../../models/GenericCommand');
module.exports = new GenericCommand(
  async ({ Memer, msg }) => {
    let author = msg.author;
    let enemy = msg.args.resolveUser();
    if (!enemy) {
      return 'you need to provide a valid user ID or name to play against lol';
    }
    if (enemy.id === author.id) {
      return 'You can\'t play against urself dumbo';
    }
    if (enemy.bot) {
      return 'You can\'t play against bots, you\'ll never hear back from them u dummy';
    }
    let turn = author;
    let oppturn = enemy;
    let board = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    const positions = {
      a: 0,
      b: 1,
      c: 2
    };

    // Randomly select starting user
    if (Math.random() >= 0.50) {
      oppturn = [turn, turn = oppturn][0];
    }

    const performTurn = async (player, opponent, retry) => {
      msg.channel.createMessage(`${turn.mention}, where do you want to place your marker?\nType out \`a\`, \`b\` or \`c\` for the row, then \`1\`, \`2\` or \`3\` for the column. (eg. \`a1\` for top-left or \`b2\` for middle)`);
      let prompt = await Memer.MessageCollector.awaitMessage(msg.channel.id, player.id, 30e3);
      if (!prompt) {
        msg.channel.createMessage(`${player.username} didn't answer in time, what a noob. ${opponent.username} wins`);
      } else {
        let markers = prompt.content.toLowerCase().split('');
        let row = positions[markers[0]];
        let column = Number(markers[1]) - 1;

        if (row !== undefined && column) {
          if (board[row][column]) {
            msg.channel.createMessage(`that spot is already being occupied by ${oppturn.username}, don't be so greedy`);
            if (!retry) {
              return performTurn(player, opponent, !retry);
            } else {
              return false; // Skip turn if they keep messing up
            }
          } else if (board[row][column] === undefined) {
            msg.channel.createMessage(`ur an idiot, that spot doesn't even exist on the board :facepalm:`);
            if (!retry) {
              return performTurn(player, opponent, !retry);
            } else {
              return false; // Skip turn if they keep messing up
            }
          } else {
            return board[row].splice(column, 1, player);
          }
        } else if (prompt.content.toLowerCase() === 'end') {
          msg.channel.createMessage(`**${player.username}** has ended the game what a wimp`);
        } else {
          msg.channel.createMessage(`**${player.username}**, that's not a valid option lmao! Type out \`a\`, \`b\` or \`c\` for the row, then \`1\`, \`2\` or \`3\` for the column. (eg. \`a1\` for top-left or \`b2\` for middle)\n${retry ? 'The game has ended due to multiple invalid choices, god ur dumb' : ''}`);
          if (!retry) {
            return performTurn(player, opponent, true);
          }
        }
      }
    };

    const checkMatch = () => {
      for (let i in board) {
        // horizontal
        if (board[i][0] !== null && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
          return true;
        }
        // vertical
        if (board[0][i] !== null && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
          return true;
        }
        // downward diagonal
        if (board[0][0] !== null && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
          return true;
        }
        // upward diagonal
        if (board[2][0] !== null && board[2][0] === board[1][1] && board[1][1] === board[0][2]) {
          return true;
        }
      }
      return false;
    };

    const layoutBoard = (space) => {
      if (!space) {
        return '  :black_large_square:  ';
      } else {
        if (space === author) {
          return '  :x:  ';
        } else {
          return '  :o:  ';
        }
      }
    };

    const play = async () => {
      const move = await performTurn(turn, oppturn);
      if (move === undefined) {
        return;
      }
      if (!move) {
        oppturn = [turn, turn = oppturn][0];
        return play();
      }
      msg.channel.createMessage({ embed: {
        title: `Tic Tac Toe`,
        description: `**${oppturn.username} vs ${turn.username}**\n${board[0].map(layoutBoard).join(' ')}\n${board[1].map(layoutBoard).join(' ')}\n${board[2].map(layoutBoard).join(' ')}`,
        footer: { text: `${turn.username}'s turn` }
      }});
      if (!checkMatch()) {
        oppturn = [turn, turn = oppturn][0];
        return play();
      } else {
        msg.channel.createMessage(`yahoo good one ${turn.username}, you won!!! :sunglasses:`);
      }
    };
    play();
  },
  {
    triggers: ['tictactoe', 'ttt'],
    usage: '{command} [user]',
    description: 'Play a nice calm game of tic tac toe with your mates'
  }
);
