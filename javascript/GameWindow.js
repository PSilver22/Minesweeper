class GameWindow {
	static tileSize;
	static numberedTiles;
	static flagTile;
	static bombTile;
	static hiddenTile;

	// given a string of the format "row,column", returns an array with [row, column]
	static getRowColumn(tagID) {
		let commaIndex = tagID.indexOf(",");

		// the row and column
		let row = Number(tagID.substring(0, commaIndex));
		let column = Number(tagID.substring(commaIndex + 1, tagID.length));

		return [row, column];
	}

	static pause(milliseconds) {
		let e = new Date().getTime() + milliseconds;
		while (new Date().getTime() <= e) {};
	}

	constructor(boardWidth, boardHeight, numOfMines) {
		GameWindow.tileSize = 16;

		// get all the image filepaths
		GameWindow.flagTile = "Minesweeper Sprites/flag tile.png"
		GameWindow.bombTile = "Minesweeper Sprites/bomb tile.png";
		GameWindow.hiddenTile = "Minesweeper Sprites/hidden tile.png";

		GameWindow.numberedTiles = new Array(9);
		for (let counter = 0; counter < 9; ++counter) {
			GameWindow.numberedTiles[counter] = `Minesweeper Sprites/${counter} tile.png`;
		}

		// create the board
		this.board = new Minefield(boardWidth, boardHeight, numOfMines);

		this.width = GameWindow.tileSize * boardWidth;
		this.height = GameWindow.tileSize * boardHeight + 50;

		this.flagTag = document.createElement("h1");
		this.flagTag.style.cssText = `position: absolute; top: -25px; left: 5px; color: red; font-size: 40px;`;
		this.updateRemainingFlags();

		// add the elements to the html
		document.body.appendChild(this.flagTag);

		// create the minefield
		this.createMinefield();
	}

	// updates the remaining flags
	updateRemainingFlags() {
		this.flagTag.innerText = this.board.remainingFlags;
	}

	// creates the minefield tags
	createMinefield() {
		// create buttons for each image
		for (let row = 0; row < this.board.height; ++row) {
			for (let column = 0; column < this.board.width; ++column) {
				// create the button element
				let button = document.createElement("input");

				//  add tags to the button 
				button.style.position = "absolute";
				button.style.top = `${50 + (row * GameWindow.tileSize)}px`;
				button.style.left = `${(column * GameWindow.tileSize)}px`;
				button.class = "tile";
				button.type = "image";
				button.id = `${row},${column}`;
				button.src = GameWindow.hiddenTile;

				button.addEventListener("click", () => {
					this.onLeftClick(button.id);
				});

				button.addEventListener("contextmenu", (e) => {
					e.preventDefault(); // disable the context menu
					this.onRightClick(button.id);
				});

				// add button to the html
				document.body.appendChild(button);
			}
		}
	}

	updateMinefield() {
		// loop through tiles in cells
		this.updateRemainingFlags();

		for (let row = 0; row < this.board.height; ++row) {
			for (let column = 0; column < this.board.width; ++column) {
				let imagePath;

				// if the curren tile is hidden
				if (this.board.map[row][column].isHidden) {
					// if it's a flag, set to a flag tile
					if (this.board.map[row][column].isFlagged) {
						imagePath = GameWindow.flagTile;
					}

					// if it's not a flag, set to hidden tile
					else {
						imagePath = GameWindow.hiddenTile;
					}
				}
				
				// if the file is not hidden
				else {
					// if it's a mine, set to bomb tile
					if (this.board.map[row][column].key === 'X') {
						imagePath = GameWindow.bombTile;
					}
					
					// if it's a numbered tile, set to specific numbered tile.
					else {
						imagePath = GameWindow.numberedTiles[Number(this.board.map[row][column].key)];
					}
				}

				// set the element to the path of the specific tile
				document.getElementById(`${row},${column}`).src = imagePath;
			}
		}
	}

	onLeftClick(tagID) {
		if (this.board.isRunning)
		{
			// get the index of the pressed button
			let buttonIndex = GameWindow.getRowColumn(tagID);

			// update the board
			this.board.activateTile(buttonIndex[0], buttonIndex[1]);
			this.updateMinefield();

			// if the board is not running, that means a mine was clicked.
			if (!this.board.isRunning) {
				this.displayLoss();
			}

			else if (this.board.checkWinCondition()) {
				this.board.isRunning = false;
				this.displayWin();
			}
		}
	}

	// displays win message
	displayWin() {
		this.flagTag.innerText = "You win!";
	}

	// displays loss message
	displayLoss() {
		this.flagTag.innerText = "You lost.";
	}

	onRightClick(tagID) {
		if (this.board.isRunning) {
			// get the index of the pressed button
			let buttonIndex = GameWindow.getRowColumn(tagID);

			// update the board
			this.board.toggleFlag(buttonIndex[0], buttonIndex[1]);
			this.updateMinefield();

			if (this.board.checkWinCondition()) {
				this.board.isRunning = false;
				this.displayWin();
			}
		}
	}

	updateNextMove() {
		this.board.doNextMove();

		this.updateMinefield();

		if (!this.board.isRunning) {
			this.displayLoss();
		}

		else if (this.board.checkWinCondition()) {
			this.board.isRunning = false;
			this.displayWin();
		}
	}

	solve() {
		if (this.board.isRunning) {
			this.updateNextMove();
		}
	}
}