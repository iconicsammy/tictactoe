import SharedFunctions from "../shared/shared.functions";
import boardGame from "../model/board";

export default {
  play(req, res, next) {
    /*
        Player make a move.

      @input board: a query string in form of +oox
        
      if board is empty, Server makes the first move. Else, pick it from what is given.

        */

    const board = req.query.board || "";

    // if empty, make fisrt move by server
    let status = 400;
    let text = ""; // a text message such as game over ,if applicable

    // initiate the board first
    SharedFunctions.prepareBoard(board);

    if (board === "") {
      SharedFunctions.makeInitialMove();
      status = 200;
    } else {
      const result = SharedFunctions.makeAMove(board); // a dictionary status,text
      status = result.status;
      text = result.text;
    }

    console.log(status, text);

    var data = [].concat.apply([], boardGame.board);

    res.status(status).send(data.join(""));
  }
};
