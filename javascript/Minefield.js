/*
any space can be an X representing a mine or a number representing the number of neighboring mines
*/
class Minefield {
	constructor(minefieldWidth, minefieldHeight, numOfMines) {
		this.width = minefieldWidth;
		this.height = minefieldHeight;
		this.numOfMines = numOfMines;
		this.remainingFlags = numOfMines;
		this.isRunning = true;

		// array of arrays in the form [mineRow, mineColumn]
		this.mineLocations = new Array(this.numOfMines);

		// Initialize the map matrix
		this.map = new Array(this.height);

		// set every space to 0
		for (let row = 0; row < this.height; ++row) {
			this.map[row] = new Array(this.width);
			for (let column = 0; column < this.width; ++column) {
				this.map[row][column] = {
					key: '0',
					isHidden: true,
					isFlagged: false
				};
			}
		}

		// assigns every tile on the map
		this.assignSpaces();
	}

	// gets the indecies of the areas around a given row, column. returns an array containing row, column pairs
	static getTileNeighbors(tileRow, tileColumn) {
		let neighbors = [
			[tileRow - 1, tileColumn], 
			[tileRow + 1, tileColumn],
			[tileRow, tileColumn - 1],
			[tileRow, tileColumn + 1],
			[tileRow + 1, tileColumn + 1],
			[tileRow + 1, tileColumn - 1],
			[tileRow - 1, tileColumn + 1],
			[tileRow - 1, tileColumn - 1]
		];

		return neighbors;
	}

	// assigns every tile an a number or bomb
	assignSpaces() {
		this.placeMines();
		this.assignDistanceToMines();
		return;
	}

	// places the bombs in random places on the map
	placeMines() {
		for (let count = 0; count < this.numOfMines; ++count) {
			// get random row and column
			let mineRow = Math.floor(Math.random() * this.height);
			let mineColumn = Math.floor(Math.random() * this.width);

			// if the random row and column is already a bomb, don't do anything
			if (this.map[mineRow][mineColumn].key === 'X') {
				--count;
			}
			
			else {
				// assign as bomb
				this.map[mineRow][mineColumn].key = 'X';

				// save the location of the mine
				this.mineLocations[count] = [mineRow, mineColumn];
			}
		}
	}

	// assigns the neighboring tiles to bombs a number based on the amount of bombs nearby
	assignDistanceToMines() {
		// loop through the bomb locations
		for (let mineIndex = 0; mineIndex < this.numOfMines; ++mineIndex) {
			let mineRow = this.mineLocations[mineIndex][0];
			let mineColumn = this.mineLocations[mineIndex][1];

			// get the neighbors of the tile
			let neighbors = Minefield.getTileNeighbors(mineRow, mineColumn);

			// loop through the neighbors
			for (let neighborIndex = 0; neighborIndex < neighbors.length; ++neighborIndex) {
				// check that the neighbor exists and isn't a mine
				let neighbor = neighbors[neighborIndex];
				if (this.isLegalIndex(...neighbor) && this.map[neighbor[0]][neighbor[1]].key !== 'X') {
					// add 1 to the character
					this.map[neighbor[0]][neighbor[1]].key = String(Number(this.map[neighbor[0]][neighbor[1]].key) + 1);
				}
			}
		}
	}

	log(showHidden) {
		// create a string with the board
		let message = "";
		for (let row = 0; row < this.height; ++row) {
			for (let column = 0; column < this.width; ++column) {
				let currentTile = this.map[row][column];
				if (showHidden || !currentTile.isHidden)
				{
					message = message + currentTile.key + ' ';
				}

				else {
					message = message + '#' + ' ';
				}
			}

			message = message + '\n';
		}

		// print the string
		console.log(message);
	}

	// checks if the given row, column are within the bounds of the map. True if in bounds, false otherwise
	isLegalIndex(row, column) {
		return row >= 0 && row < this.height && column >= 0 && column < this.width;
	}

	activateTile(row, column) {
		let tile = this.map[row][column];

		switch (tile.key) {
			// if the tile is a mine, show all the mines
			case 'X':
			{
				this.showMines();
				this.isRunning = false;
			}
			
			// if the tile is an empty space, show all of the empty  spaces that can be connected with the tile
			case '0':
			{
				this.fillOpenSpaces(row, column);
			}

			// If the tile is anything else, show the tile
			default:
			{
				this.map[row][column].isHidden = false;
			}
		}
	}

	// sets all mines to visible
	showMines() {
		for (let mineIndex = 0; mineIndex < this.numOfMines; ++mineIndex) {
			let currentMine = this.mineLocations[mineIndex];
			this.map[currentMine[0]][currentMine[1]].isHidden = false;
		}
	}

	fillOpenSpaces(startingRow, startingColumn) {
		let tileQueue = [];
		this.r_fillOpenSpaces(startingRow, startingColumn, tileQueue);
	}

	r_fillOpenSpaces(row, column, tileQueue) {
		this.map[row][column].isHidden = false;

		if (this.map[row][column].key === '0') {
			let neighbors = Minefield.getTileNeighbors(row, column); // get the neighbors of the current tile

			for (let neighborIndex = 0; neighborIndex < neighbors.length; ++neighborIndex) { // loop through neighbors
				let neighbor = neighbors[neighborIndex]; // save the current neighbor

				if (this.isLegalIndex(...neighbors[neighborIndex])) { // if the neighbor's index is in bounds
					if (this.map[neighbor[0]][neighbor[1]].isHidden) { // if the neighbor isn't hidden
						this.map[neighbor[0]][neighbor[1]].isHidden = false;
						tileQueue.push([neighbor[0], neighbor[1]]);
					}
				}
			}
		}

		// get the next tile from the queue
		if (tileQueue.length != 0) {
			this.r_fillOpenSpaces(...tileQueue.shift(), tileQueue);
		}
	}

	// places flag on the given row column
	toggleFlag(row, column) {
		// check if the index is legal
		if (this.isLegalIndex(row, column) && this.map[row][column].isHidden) {
			// check if the index is already flagged and if the number of flags remaining is good enough
			if (this.map[row][column].isFlagged && this.remainingFlags < this.numOfMines) {
				// flip the tile at the given index and update remaining flags
				this.map[row][column].isFlagged = false;
				++this.remainingFlags;
			}

			else if (!this.map[row][column].isFlagged && this.remainingFlags > 0) {
				// flip the tile at the given index and update remaining flags
				this.map[row][column].isFlagged = true;
				--this.remainingFlags;
			}
		}
	}

	// Checks if all the mines are flagged
	checkWinCondition() {
		let condition = true;

		// loop through tiles
		for (let row = 0; row < this.height; ++row) {
			for (let column = 0; column < this.width; ++column) {
				// if a bomb is not hidden nor flagged, the win condition is false
				if (this.map[row][column].key === 'X' && (!this.map[row][column].isHidden || !this.map[row][column].isFlagged))  {
					condition = false;
					break;
				}

				// else if any of the tiles are hidden, the win condition is false
				else if (this.map[row][column].key !== 'X' && this.map[row][column].isHidden) {
					condition = false;
					break;
				}
			}
		}

		return condition;
	}
}