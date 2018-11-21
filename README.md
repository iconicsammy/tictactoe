# Tic Tac Toe API

## Getting Started

To let the computer make the first move, don't pass anything to the api i.e.

https://stictactoe.herokuapp.com/api/play/

or

https://stictactoe.herokuapp.com/api/play/?board

To make the first move, pass your move .e.g. to move to the first square:

https://stictactoe.herokuapp.com/api/play/?board=x++++++++

Note the game is 3 by 3 by default hence always you will need to pass 9 values always

### Responose

HTTP status 200 means continue playing, 400 means you can't
