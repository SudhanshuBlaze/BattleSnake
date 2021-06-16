const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))


function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'SudhanshuBlaze',
    color: '#E80978',
    head: 'gamer',
    tail: 'flake'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  var gameData = request.body;

  console.log('START');
  response.status(200).send('ok')
}

function getNext(nextMove, currHead){
  let futureHead= {...currHead}

  if(nextMove==="up")
    futureHead.y=currHead.y+1;

  else if(nextMove==="down")
    futureHead.y=currHead.y-1;

  else if(nextMove==="left")
    futureHead.x=currHead.x-1;

  else if(nextMove==="right")
    futureHead.x=currHead.x+1;
		
  return futureHead;
}

function getNewPos(move,headCoord) {
  var newPos = {...headCoord}
  switch (move) {
    case 'up':
      newPos.y = headCoord.y + 1
      break
    case 'down':
      newPos.y = headCoord.y - 1
      break
    case 'left':
      newPos.x = headCoord.x - 1
      break
    case 'right':
      newPos.x = headCoord.x + 1
      break
  }
  return newPos
}

function avoidWalls(futureHead, height, width)
{
	if(futureHead.x<0 || futureHead.y<0 || 
	futureHead.x>=width || futureHead.y>=height){
		console.log("Hits Walls");
		return true;
	}
	else
		return false;
}

function avoidSnakes(futureHead, snakesBodies){

  	snakesBodies.forEach((snake)=>{
			snake.body.forEach((coord) =>{

				if(futureHead.x===coord.x && futureHead.y===coord.y){
					console.log("Hits Other snakes");
					return true;
				}
			})
		})
	return false;
}

function hitsSnake(newHeadPos, bodyCoords) {
  for (var i = 0; i < bodyCoords.length; ++i) {
    var bodyCoord = bodyCoords[i]
    if (newHeadPos.x === bodyCoord.x && newHeadPos.y === bodyCoord.y) {
      console.log("Hits snake")
      return true;
    }
  }
  return false;
}

function avoidItself(newHeadPos, myBody){

	myBody.forEach((coord)=>{

		if(newHeadPos.x== coord.x && newHeadPos.y== coord.y){
			console.log("Hits self");
			return true;
		}
	})
	return false;
}

function getSafeMoves(possibleMoves ,board, myBody){
  let safeMoves=[];

  possibleMoves.forEach((guess)=>{
    let guessCoord= getNext(guess ,myBody[0]);
		
		if (!avoidWalls(guessCoord, board.height, board.width) && 
				!avoidSnakes(guessCoord, board.snakes) && 
				!avoidItself(guessCoord, myBody) &&
				!hitsSnake(guessCoord, myBody)
				){
				safeMoves.push(guess);
		}
	});

  return safeMoves;
}


function handleMove(request, response) {
  const gameData = request.body
	let safeMoves=[];
  const possibleMoves = ['up', 'down', 'left', 'right']
  var myBody= gameData.you.body;
	console.log(myBody);

  safeMoves=getSafeMoves(possibleMoves ,gameData.board, myBody);

  let move="left"; //if safeMoves is empty then it will just return 'left'
  //randomly chooses from safeMoves
  console.log(safeMoves);

	if(safeMoves.length!=0){
    move= safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }
  
  console.log('MOVE: ' + move)

  response.status(200).send({
    move: move,
    shout: "Bring me Foood!!"
  })
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
