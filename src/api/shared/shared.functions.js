import boardGame from "../model/board";
import game_settings from "../../config/config";

export default {
  prepareBoard(begin = "") {
    /*
        Game is just starting now. Create an empty board now and define winning rows/lines

        @input begin: String. if empty, we are just starting the game. Else, current structure is passed from user
        */

    const dimension = game_settings.dimension; // will be 3 by 3 by default. board is always square.

    if (begin == "" || (begin != "" && boardGame.moves_made == 0)) {
      boardGame.board = [];
      for (let i = 0; i < dimension; i++) {
        let game = [];

        for (var j = 0; j < dimension; j++) {
          game.push(" ");
        }

        boardGame.board.push(game);
      }
      boardGame.moves_made = 0;
    }
  },

  makeInitialMove() {
    /*
        Called only if Server makes the first move. Best move is to start at center
        */

    const board_kind = parseInt(game_settings.dimension / 2);

    boardGame.board[board_kind][board_kind] = game_settings.server;
    boardGame.moves_made = 1;
  },

  checkWinner(board, player) {
    // check horizontal rows first
    let winning_count = 0;
    for (let looper = 0; looper < game_settings.dimension; looper++) {
      winning_count = 0;
      for (
        let inner_looper = 0;
        inner_looper < game_settings.dimension;
        inner_looper++
      ) {
        if (board[looper][inner_looper] == player) {
          winning_count++;
        }
      }
      if (winning_count == game_settings.dimension) {
        return player;
      }
    }

    // vertical victory

    for (let looper = 0; looper < game_settings.dimension; looper++) {
      const values = board.map(function(value, index) {
        return value[looper];
      }); //returns x x x etc for each column
      const player_moves = values.filter(val => {
        return val == player;
      });
      if (player_moves.length == game_settings.dimension) {
        return player;
      }
    }

    // check diagonal winning: top to bottom
    winning_count = 0;
    for (let looper = 0; looper < game_settings.dimension; looper++) {
      if (board[looper][looper] == player) {
        winning_count++;
      }
    }

    if (winning_count == game_settings.dimension) {
      return player;
    }

    // check bottom to top diagonal
    winning_count = 0;

    for (let looper = game_settings.dimension - 1; looper >= 0; looper--) {
      if (board[looper][game_settings.dimension - looper - 1] == player) {
        winning_count++;
      }
    }

    if (winning_count == game_settings.dimension) {
      return player;
    }

    return false;
  },

  copyBoard(board) {
    /*
     create a copy of the given board. to not modify the original board we create a new board
     by looping its values and recreating the new board

     */
    let boardCopy = [];
    for (let looper = 0; looper < 3; looper++) {
      let c = [];
      for (let inner_looper = 0; inner_looper < 3; inner_looper++) {
        c.push(board[looper][inner_looper]);
      }
      boardCopy.push(c);
    }

    return boardCopy;
  },

  squareFree(board, x, y) {
    /*
       In the given board, is the square [x,y] free?
       */

    const val = board[x][y].trim();
    if (val == "") {
      return true;
    }
    return false;
  },

  freeCorner() {
    /*
     return one free corner if possible from the original board we are playing in.
     There are always 4 corners only

     Returns [x,y] if found else False
     */

    const board_corners = [
      [0, 0],
      [0, game_settings.dimension - 1],
      [game_settings.dimension - 1, 0],
      [game_settings.dimension - 1, game_settings.dimension - 1]
    ];
    for (let looper = 0; looper < 4; looper++) {
      if (
        this.squareFree(
          boardGame.board,
          board_corners[looper][0],
          board_corners[looper][1]
        )
      ) {
        return board_corners[looper];
      }
    }
    return false;
  },

  freeEdge() {
    /*
     return one of the free edges, which are squares that are not corners nor the center, of the real board

     return [x,y] of a free edge or false
     */

    for (let looper = 0; looper < game_settings.dimension; looper++) {
      for (
        let inner_looper = 1;
        inner_looper < game_settings.dimension - 1;
        inner_looper++
      ) {
        if (this.squareFree(boardGame.board, looper, inner_looper)) {
          return [looper, inner_looper];
        }
      }
    }
    return false;
  },

  canWin(player_letter) {
    /*
    Can the passed player win the game possibly by moving to any of the free squares?
    
    @input player_letter: who is playing? Note this could be stimulated as well.Computer can pretend to be
    the player and see if any moves can give the opponent a chance to win?

    @output: if player can win, return the [x,y] of the square that will win the game. else false
    */

    for (let looper = 0; looper < game_settings.dimension; looper++) {
      for (
        let inner_looper = 0;
        inner_looper < game_settings.dimension;
        inner_looper++
      ) {
        // duplicate the game board now
        let copiedBoard = this.copyBoard(boardGame.board);

        if (this.squareFree(copiedBoard, looper, inner_looper) == true) {
          // square is free. fill it up and see if it can be won

          copiedBoard[looper][inner_looper] = player_letter;

          if (this.checkWinner(copiedBoard, player_letter)) {
            // yes.
            return [looper, inner_looper];
          }
        }
      }
    }
    return false;
  },

  gameOver() {
    /*
      Is the game over? i.e. no more moves possible?
      */
    const squares = game_settings.dimension * game_settings.dimension;

    if (boardGame.moves_made === squares) {
      // all moves made. no need to check
      return true;
    }

    return false;
  },

  makeAMove(structure) {
    /*
    Player Makes a move.

    @input structure: String. oox x (o o x space x)
    

    Rules:
        a square can be filled only once
        structure must be 9 in length (3 x 3)
        maximum moves is also 9
        winning can happen before all slots are filled
        entered data must be o for player
        only one move is allowed at once

    

    */

    let reply = { status: 400, text: "" };

    let row_index = -1; // referst to x of boardgame
    let row_col = -1; // refers to y of boardgame

    const squares = game_settings.dimension * game_settings.dimension;

    // game stalled? Move out
    if (this.gameOver()) {
      // all moves made. no need to check
      reply.text = "Game over! It i a tie";
    } else {
      let structures = [...structure];

      // data should be correct format,
      if (structures.length != squares) {
        reply.text = "Incorrect dimension given";
      } else {
        // passed data is correct length wise
        const current_structure = [].concat.apply([], boardGame.board);

        // what was modified?
        let modified = [];
        for (let looper = 0; looper < current_structure.length; looper++) {
          if (
            structures[looper] == game_settings.player &&
            structures[looper] != current_structure[looper]
          ) {
            // changed.
            modified.push(looper);
          }
        }

        // how many changes were made? It should be only ONE
        const modified_len = modified.length;
        if (modified_len == 0) {
          // no change
          reply.text = "You did not make a move";
        } else if (modified_len > 1) {
          reply.text = "You must make only one move";
        } else {
          // player played only one move. Check if the move is valid first i.e. square must be free

          if (modified[0] < game_settings.dimension) {
            // modified in first row
            row_col = modified[0];
            row_index = 0;
          } else {
            // look from 2nd row (index 1 row) and after
            row_index = parseInt(modified[0] / game_settings.dimension);
            row_col = modified[0] % game_settings.dimension;
          }

          // is it occupied or not?
          if (!this.squareFree(boardGame.board, row_index, row_col)) {
            reply.text = "Illegal move...occupied square";
          } else {
            //not occupied so save it now
            boardGame.board[row_index][row_col] = game_settings.player;
            boardGame.moves_made = boardGame.moves_made + 1;

            // did player win the game?
            let winner = this.checkWinner(
              boardGame.board,
              game_settings.player
            );

            if (winner) {
              reply.text = `${winner} has won the game!`;
              return reply;
            }

            // player didnt win the game. Game over?

            if (this.gameOver()) {
              reply.text = "Game over! it is a tie!";
              return reply;
            }
            // computer can make a move

            this.makeComputerMove();
            // possible computer won?
            winner = this.checkWinner(boardGame.board, game_settings.server);
            if (winner) {
              reply.text = `${winner} has won the game!`;
              return reply;
            }
            // last computer move was the last possible move?
            if (this.gameOver()) {
              reply.text = "Game over! it is a tie!";
              return reply;
            }

            // continue playing

            reply.status = 200;
          }
        }
      }
    }
    return reply;
  },

  makeComputerMove() {
    /*
       Make a move by the computer.
       */

    // can opponent win?
    let moveTo = this.canWin(game_settings.player);

    if (moveTo) {
      // he can. block the move
      boardGame.board[moveTo[0]][moveTo[1]] = game_settings.server;
      return true;
    }
    // can we win it?
    moveTo = this.canWin(game_settings.server);

    if (moveTo) {
      // we can win this
      boardGame.board[moveTo[0]][moveTo[1]] = game_settings.server;
      return true;
    }

    // reached here. Niether of us can win the game. occupy the corners if we can find

    const corner = this.freeCorner();
    if (corner) {
      boardGame.board[corner[0]][corner[1]] = game_settings.server;
      return true;
    }

    // we couldn't find the corners. how about the center?

    const loc = parseInt(game_settings.dimension / 2);
    if (this.squareFree(boardGame.board, loc, loc)) {
      boardGame.board[loc][loc] = game_settings.server;
      return true;
    }

    // center is taken so lets try edges

    const edge = this.freeEdge();

    boardGame.board[edge[0]][edge[1]] = game_settings.server;

    return true;
  }
};
