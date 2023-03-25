// matrix for the bingo board
let matrix = [
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,true,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false]
]

// table
let table = document.getElementById('bingo-table')
// table headers
let headers = table.getElementsByTagName('th')
// table cells
let cells = table.getElementsByTagName('td')

// to show alerts if player has reached bingo
let alerted = false

// function to check for bingo from a set of rows and a set of columns
function checkBingo(posX,posY){
    let trueX = 0
    let trueY = 0
    for(i = 0; i < matrix.length; i++){
        if(matrix[i][posY]){
            trueX += 1
        }
        if(matrix[posX][i]){
            trueY += 1
        }
    }
    return [trueX == 5,trueY ==5]
}

// check diagonals
function checkDiagonalBingo(){
    let true1 = 0
    let true2 = 0
    for(i=0;i<matrix.length;i++){
        if (matrix[i][i]){            
            true1 += 1
        }
        if (matrix[i][(i-4)*-1]){
            true2 += 1
        }
    }
    return [true1 == 5,true2 ==5]
}

// function to check for bingo from all of cells
function checkNumOfBingo(){
    let numOfBingo = 0
    let b = [false,false]
    for(var i = 0; i < matrix.length; i++){
        b = checkBingo(i,i)
        numOfBingo+= (1 * b[0]) + (1 * b[1])
    }
    b = checkDiagonalBingo()
    numOfBingo+= (1 * b[0]) + (1 * b[1])
    return numOfBingo
}

// write value to matrix
function write(row,col){
    var value = true
    if(matrix[row][col]){
        value = false
    }
    matrix[row][col] = value
}

// write and display bingo
function writeBingo(total){
    if(total > 0){
        let selectedBingo = 0
        for(i=0; i < headers.length - 1; i++){
            if(selectedBingo < total){
                headers[i].classList.add('bingo')
                selectedBingo += 1
            } else {
                headers[i].classList.remove('bingo')
            }
        }
    } else {
        headers[0].classList.remove('bingo')
    }
    if(total == 12){
        bingoAudio()
    }else if(!alerted && total >= 5){
        alerted = true
        
        // lock bingo boxes
        // for (var i = 0; i < cells.length; i++){
        //     var cell = cells[i]
        //     cell.onclick = null
        // }
        
        startConfetti()
        bingoAudio()
        // alert("BINGO!!!")
    } else if(total < 5 && alerted){
        alerted = false
    }
}

// add onclick listener
function cellAddOnClick(cell){
    cell.onclick = null
    cell.onclick = function(){
            
        var cellIndex = this.cellIndex
        var rowIndex = this.parentNode.rowIndex -1
        
        write(rowIndex,cellIndex)
        if(rowIndex === 2 && cellIndex === 2){
            this.classList.add('active')
        } else {
            
            if(matrix[rowIndex][cellIndex]){
                this.classList.add('active')
            } else {
                this.classList.remove('active')
            }
        }

        writeBingo(checkNumOfBingo())
        
    }
}

// Load data and add on click listener for each cells
function initialize(){
    shuffle(bingoData)
    relocateFreeSpace()
    for (var i = 0; i < cells.length; i++){
        var cell = cells[i]
        try{
            cell.innerHTML = bingoData[i]
        } catch(e){
            console.warn('No bingo template found')
        }
        
        cellAddOnClick(cell)
    }

}

// reset the bingo card
function resetBingo(){
    let k = 0
    for(i = 0; i < matrix.length; i++){
        for(j = 0; j < matrix[i].length; j++){
            if (i ===2 && j ===2){
                matrix[i][j] = true
            } else {
                matrix[i][j] = false
                cells[k].classList.remove('active')
            }
            
            k++
        }
        headers[i].classList.remove('bingo')
    }
    initialize()
    stopConfetti()
    writeBingo(checkNumOfBingo())
}

// play audio randomly
function bingoAudio(){
    let filenames = ["bingo.mp3","bingo2.mp3","bingo3.mp3","bingo4.mp3"]
    let idx = Math.floor(Math.random() * filenames.length);

    var audio = new Audio(`./audio/${filenames[idx]}`);
    audio.play();
}

// Shuffle array, algorithm taken from https://stackoverflow.com/a/2450976/12209523
function shuffle(array) {
    let currentIndex = array.length,  randomIndex
  
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }
  
}

// move freespace to the center in a shuffled array
function relocateFreeSpace(){
    let freespaceCurrentLoc = 0

    loop1:
    for (i=0;i<bingoData.length;i++){
            if(bingoData[i] === ""){
                freespaceCurrentLoc = [i]
                break loop1
            }
    }

    bingoData[freespaceCurrentLoc] = bingoData[12]
    bingoData[12] = ""
}