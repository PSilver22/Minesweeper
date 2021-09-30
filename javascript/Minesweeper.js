function main() {
	let setup = false;
	let game;

	while (!setup) {
		let difficulty = prompt("Input difficulty: (1, 2, 3)");
		
		setup = true;

		// set the specific settings for each difficulty
		switch (difficulty) {
			// easy
			case '1':
				game = new GameWindow(9, 9, 10);
				break;

			// medium
			case '2':
				game = new GameWindow(16, 16, 40);
				break;

			// hard
			case '3':
				game = new GameWindow(30, 16, 99);
				break;

			// if not a legal input.
			default:
				setup = false;
				alert("ERROR: Please input 1, 2, or 3");
		}
	}

	return game;
}