board2 = [["", "x", "x"], ["o", "", ""], ["o", "", ""]];

function canwin() {
  var rows = 3;
  for (var i = 0; i < rows; i++) {
    var values = 0;
    for (var j = 0; j < rows; j++) {
      if (board2[i][j] == "x") {
        values++;
      }
    }
    if (values == rows - 1) {
      console.log("won on row ", i);
    }
  }
}

canwin();

winning_blocks = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 1], [2, 2]], // diagonal top to bottom
  [[2, 0], [1, 1], [0, 2]] // diagonal bottom to top
];

// +xxo++o++

function copyBoard(board) {
  // create a copy of the given board. to note modify the original board we create a new board
  var boardCopy = [];
  for (var looper = 0; looper < 3; looper++) {
    var c = [];
    for (var inner_looper = 0; inner_looper < 3; inner_looper++) {
      c.push(board[looper][inner_looper]);
    }
    boardCopy.push(c);
  }

  return boardCopy;
}

function checkWinner(board) {
  // at least certain moves must be made before winning can happen
  var rows = 3;
  var total_winning_blocks = winning_blocks.length;
  for (var i = 0; i < total_winning_blocks - 1; i++) {
    var block = winning_blocks[i]; //  [[0, 0], [0, 1], [0, 2]],, which will be equal to rows length

    values = [];
    for (var j = 0; j < rows; j++) {
      // block[j] is an array itels
      // board = [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]];
      // [[0, 0], [0, 1], [0, 2]],
      //  [[1, 0], [1, 1], [1, 2]],
      values.push(board[block[j][0]][j]);
    }

    if (values.every((val, i, arr) => val === arr[0])) {
      return values[0];
    } // true
  }
}

function squareFree(board, x, y) {
  var val = board[x][y].trim();
  if (val == "") {
    return true;
  }
  return false;
}

function freeCorner() {
  // return one free corner if possible
  var rows = 3;

  var board_corners = [
    [0, 0],
    [0, rows - 1],
    [rows - 1, 0],
    [rows - 1, rows - 1]
  ];
  for (var looper = 0; looper < 4; looper++) {
    if (
      squareFree(board2, board_corners[looper][0], board_corners[looper][1])
    ) {
      return board_corners[looper];
    }
  }
}

function freeEdge() {
  // return one of the free edges
  var rows = 3;

  var board_edges = [];
  for (var looper = 0; looper < rows; looper++) {
    for (var inner_looper = 1; inner_looper < rows - 1; inner_looper++) {
      if (squareFree(board2, looper, inner_looper)) {
        return [looper, inner_looper];
      }
    }
  }
}

function canWin(player_letter, pc_letter, user_letter) {
  for (var looper = 0; looper < 3; looper++) {
    // duplicate the board now
    copiedBoard = copyBoard(board2);
    for (var inner_looper = 0; inner_looper < 3; inner_looper++) {
      if (squareFree(copiedBoard, looper, inner_looper) == true) {
        copiedBoard[looper][inner_looper] = player_letter;
        //can computer win this thing?
        if (checkWinner(copiedBoard)) {
          // yes. we can win this thing
          return [looper, inner_looper];
        }
      }
    }
  }
}

function getComputerMove() {
  // can we win the game? each square is possible

  // block opponent

  var moveTo = canWin("x", "o", "x");

  if (moveTo != "undefined") {
    board2[moveTo[0]][moveTo[1]] = "o";
    return true;
  }
  // can we win it
  var moveTo = canWin("o", "o", "x");
  if (moveTo != "undefined") {
    board2[moveTo[0]][moveTo[1]] = "o";
    return true;
  }

  // reached here. Niether of us can win the game. occupy the corners if we can find

  var corner = freeCorner();
  if (corner != "undefined") {
    board2[corner[0]][corner[1]] = "o";
    return true;
  }

  // we couldn't find the corners. how about the center?

  var loc = parseInt(game_settings.dimension / 2);

  if (squareFree(board2, loc, loc)) {
    board2[loc][loc] = loc;
    return true;
  }

  // center is taken.

  var edge = freeEdge();

  board2[edge[0]][edge[1]] = "o";

  return true;
}

// getComputerMove();

// console.log(board2);
