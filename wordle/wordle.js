const current = {
    row: 0,
    col: 0,
    word: '',
    curHint: '',
    win: false,
    loss: false,
};


const startGame = async () => {
    //draw boxes, start over button, and add event listeners to dark mode and instructions
    drawBoxes();
    drawStartOverButton();
    toggleDarkMode();
    toggleInstructions();
    //disable start over button during loading
    const startOverButton = document.getElementById('start-over');
    startOverButton.classList.add('disabled');
    startOverButton.textContent = 'Loading...';
    const dict = await getDict();
    //re-enable start over button after loading
    startOverButton.classList.remove('disabled');
    startOverButton.textContent = 'Start Over';
    //add cursor
    addCursor();
    //get a current word and hint
    const wordHint = getWord(dict);
    current.word = wordHint[0].toLowerCase();
    current.curHint = wordHint[1];
    //add event listener to start over button
    startOver(dict);
    //add create hint div and add event listener to hint button
    createHint(current.curHint);
    toggleHint();
    //take key input
    takeKeyInput();

}

//returns array of json constaining the words and hints
const getDict = async () => {
    const res = await fetch("https://api.masoudkf.com/v1/wordle", {
        headers: {
        "x-api-key": "sw0Tr2othT1AyTQtNDUE06LqMckbTiKWaVYhuirv",
        },
    });

    let json = await res.json();
    let dict = json.dictionary;
    return dict;
}

//Creates all of the boxes in the grid on screen
function drawBoxes() {
    const game = document.getElementById('game');

    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.id = 'grid';

    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 4; j++){
            const box = document.createElement('div');
            box.className = 'box';
            box.id = `box${i}${j}`;
            grid.appendChild(box);
        }
    }
    game.appendChild(grid);
}

//draws startover button
function drawStartOverButton (){
    const game = document.getElementById('game');

    let startOverButton = document.createElement('div');
    startOverButton.id = 'start-over';
    startOverButton.textContent = 'Start Over'

    game.appendChild(startOverButton);
}

//adds event listener to dark mode button
function toggleDarkMode() {
    const darkMode = document.getElementById('dark-mode-button');
    darkMode.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
}

//adds event listener to instructions button
function toggleInstructions() {
    const instructionButton = document.getElementById('instructions');
    const instructions = document.getElementById('instruction-page')
    const splitScreen = document.getElementById('split-screen');
    const game = document.getElementById('game');
    instructionButton.addEventListener('click', function() {
        instructions.classList.toggle('hidden');
        splitScreen.classList.toggle('center');
        splitScreen.classList.toggle('left-side');
        game.classList.toggle('split-screen');
    });
}

//creates the hint element
function createHint(curHint) {
    let hint = document.createElement('div');
    hint.id='hint';
    hint.innerHTML = `<p><i>Hint: </i> ${curHint}</p>`;
    hint.classList.add('hidden');
    
    const footer = document.getElementById('footer');
    document.body.insertBefore(hint, footer);
}

//toggles visability of the hint element
function toggleHint() {
    const hintButton = document.getElementById('hint-button');
    hintButton.addEventListener('click', function() {
        const hint = document.getElementById('hint');
        hint.classList.toggle('hidden');
    });
}

//adds event listener to start over button
function startOver(dict) {
    const startOverButton = document.getElementById('start-over');
    startOverButton.addEventListener('click', function() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const box = document.getElementById(`box${i}${j}`);
                box.textContent = '';
                box.classList.remove('correct', 'not-in', 'wrong-place', 'cursor')
            }
        }
        //reset current
        current.row = 0;
        current.col = 0;
        //redraw cursor
        addCursor();
        let hint = document.getElementById('hint');
        document.body.removeChild(hint);
        const wordHint = getWord(dict);
        current.word = wordHint[0].toLowerCase();
        current.curHint = wordHint[1];
        createHint(current.curHint);

        //if it was a win, remove win banner, hid win-gif and show grid
        if (current.win) {
            const winBanner = document.getElementById('win-banner');
            document.body.removeChild(winBanner);
            const grid = document.getElementById('grid');
            grid.classList.remove('hidden');
            const winGif = document.getElementById('win-gif');
            winGif.classList.add('hidden');
            current.win = false;
        }
        //remove loss banner
        else if (!current.win){
            const loseBanner = document.getElementById('loss');
            document.body.removeChild(loseBanner);
        }
        current.loss = false;
    });
}

//puts key in current box
function placeLetter(key) {
    const box = document.getElementById(`box${current.row}${current.col}`);
    box.textContent = key;
}

function takeKeyInput () {
    document.body.onkeydown = (e)   => {
        const key = e.key;
        //stops typing when game is over when loss
        if (current.win || current.loss)
            return;
        
        if (key === 'Backspace') {
            if (current.col > 0) {
                backspace();
            }
            else   
                return;
        }

        else if (isLetter(key)) {
            if (current.col < 4)
                placeLetter(key);
                removeCursor();
                current.col++;
                addCursor();
        }

        else if (key === 'Enter') {
            if (current.win || current.loss) {
                return;
            }
            if (current.col === 4) {
                checkWord();
            }
            else {
                window.alert("first complete the word")
            }
        }
        else if (key === 'Spacebar'){
            return;
        }
        else return;
    };
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function backspace() {
    //for anything less than full row
    if (current.col < 4) {
        const box = document.getElementById(`box${current.row}${current.col}`);
        //for full box
        if(box.textContent !== '') {
            box.textContent = '';
            if (current.col > 0){
                removeCursor();
                current.col--;
                addCursor();
            }
        }
        //for empty box (i.e., using backspace twice in a row)
        else{
            removeCursor();
            current.col--;
            addCursor();
            const box = document.getElementById(`box${current.row}${current.col}`);
            box.textContent = '';
        }
    }
    //for full row
    else {
        current.col--;
        addCursor();
        const box = document.getElementById(`box${current.row}${current.col}`);
        box.textContent = '';
    }
    
}

//function to get a random word from the loaded dictionary
function getWord(dict) {
    let randomIndex = Number.parseInt(Math.random() * dict.length)
    const word = dict[randomIndex].word;
    const hint = dict[randomIndex].hint;
    let wordHint = [word, hint];
    return wordHint;
}

//function to check the word
function checkWord() {
    let rowWord = '';
    for (let i = 0; i < 4; i++) {
        const box = document.getElementById(`box${current.row}${i}`);
        rowWord += box.textContent;
        rowWord = rowWord.toLowerCase();
    }
    //case if word is correct
    if (rowWord === current.word) 
        winGame();
    //else colour codes boxes
    else {
        for (let i = 0; i < 4; i++) {
            if (rowWord[i] === current.word[i]) {
                const box = document.getElementById(`box${current.row}${i}`);
                box.classList.add('correct');
            }
            else if (current.word.includes(rowWord[i]) && rowWord[i] !== current.word[i]) {
                const box = document.getElementById(`box${current.row}${i}`);
                box.classList.add('wrong-place');
            }
            else {
                const box = document.getElementById(`box${current.row}${i}`);
                box.classList.add('not-in');
            }
        }
        //either goes to next row or loses game
        if (current.row < 3) {
            current.col--;
            removeCursor();
            current.row++;
            current.col = 0;
            addCursor();
        }
        else {
            loseGame();
        }
    }
}

//displays the win banner
function winGame() {
    //set win status
    current.win = true;
    //display win banner
    const win = document.createElement('div')
    win.id = 'win-banner'
    win.innerHTML = `You guessed the word&nbsp<strong>${current.word.toUpperCase()}</strong>&nbspcorrectly!`
    const footer = document.getElementById('footer');
    document.body.insertBefore(win, footer);
    //hid boxes
    const grid = document.getElementById('grid');
    grid.classList.add('hidden');
    //show win gif
    let winGif = document.getElementById('win-gif');
    winGif.classList.remove('hidden'); 
}

//displays loss banner on the bottom of the screen
function loseGame() {
    current.loss = true;
    const lose = document.createElement('div')
    lose.id = 'loss'
    lose.innerHTML = `You missed the word&nbsp<strong>${current.word.toUpperCase()}</strong>&nbspand lost!`
    const footer = document.getElementById('footer');
    document.body.insertBefore(lose, footer);
}

//removes cursor border
function removeCursor() {
    const box = document.getElementById(`box${current.row}${current.col}`);
    box.classList.remove('cursor');
}

//adds cursor border
function addCursor() {
    const box = document.getElementById(`box${current.row}${current.col}`);
    box.classList.add('cursor');
}

startGame();    