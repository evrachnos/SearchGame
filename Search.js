//////////////////////////////////////////////////////////////////////////////
// SEARCH GAME
/////////////////////////////////////////////////////////////////////////////


var c,
    xsize = 50, ysize = 50, xspace = 10,
    ypos = 300, yTop, yMax = 100, xpos = 30, delay, 
    align = 15, xStep, yStep, i, j, next, jTarget, pos, tpos, copyCell, indexMove, startLoop,
    N,
    array, coord,
    xdistance, arrowLen, defaultColour = "rgba(0,0,255,0.3)", varColour = "rgba(0,0,255,0.6)", varName,
    comparisonFlag, done, indexAlign = 20, indexStr, colourStr, comparisons, lbound, ubound, mid, found, count, lineNumber,

    INCREASING = 0, DECREASING = 1, 
    order = INCREASING;

var oldX, oldY, oldX2, oldY2, jprev, jnext, myCanvas, ss, mouseX, mouseY;
var timer;
var temp, timesDelay = 0, timesDelayLimit = 8, yoffset = 15, loopData, sortData;
var editor;

/////////////////////////////////////////////////////////////////////////
//    CODE DATA
/////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////
function Item() {
    var x = 0, y = 0, value = 0, colour = defaultColour, visible=false;
}

function init() {
    // control data

    N = 16;

    // graphics data
    xdistance = xsize+xspace;
    arrowLen = 2 * ysize / 3;

    // data
    array = new Array(N + 2);
    for (var i = 1; i <= N; i++) {
        array[i] = new Item();
        array[i].x = xpos + (i - 1) * xdistance;
        array[i].y = ypos;
        array[i].colour = defaultColour;
        array[i].value = i * 4;
    }
    array[0] = new Item();     // used as key in search
    array[0].x = array[N/2].x;
    array[0].y = yMax;
    array[0].value = 56;
    array[0].colour = varColour;
    varName = "Ζητούμενο";
    array[N+1] = new Item();        // used as temp

    RandomizeArray(array, N);

    comparisons = 0;
    mouseX = 0;
    mouseY = 0;
    mycanvas = document.getElementById('canvas');
    mycanvas.onmousedown = function () { return false; };
    mycanvas.addEventListener('mousedown', function (evt) {
        var mousePos = getMousePosition(evt);
        mouseX = mousePos.x;
        mouseY = mousePos.y;
        i = getIndex(mouseX, mouseY);
        if (i > 0 && !done)  playme(i);
    }
    , false);

    // view
    c = document.getElementById('canvas').getContext('2d');
    c.strokeStyle = "rgb(0,0,150)";
    c.lineWidth = 5;
    drawCanvas();
}

function RandomizeArray(array, N) {
    for (var i = 1; i <= N; i++)
        array[i].value = Math.floor(Math.random() * 100 + 1);
    var index = Math.floor(Math.random() * 16 + 1);
    array[0].value = array[index].value;
    sortArray(array, N);
}

function sortArray(array, N) {
    var temp;
    for (var i = 2; i <= N; i++)
        for (var j = N; j >= i; j--)
            if (array[j].value < array[j - 1].value) {
                temp = array[j].value;
                array[j].value = array[j - 1].value;
                array[j - 1].value = temp;
            }
}

function getMousePosition(event) {
    var x = new Number();
    var y = new Number();
    var canvas = document.getElementById("canvas");

    if (event.x != undefined && event.y != undefined) {
        x = event.x;
        y = event.y;
    }
    else // Firefox method to get the position
    {
        x = event.clientX + document.body.scrollLeft +
              document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop +
              document.documentElement.scrollTop;
    }
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    var mouseX = x, mouseY = y;
    return {
        x: mouseX, y: mouseY
    };
}

function getIndex(x, y) {
    if (y > 355 || y < 295)
        return 0;
    else {
        x = x - 30;
        return Math.floor(x / xdistance) + 1;
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
////   MAIN INTERVAL FUNCTION
//////////////////////////////////////////////////////////////////////////////////////////////////////
function playme(i) {
    if (!array[i].visible)  comparisons++;
    printStatistics();
    if (array[i].value == array[0].value) {
        highlight(i);
        found = true;
    }
    else
        highlightAfter(i);
    array[i].visible = true;
    drawCell(i, array[i].x, array[i].y);
    if (found) {
        printResults();
        done = true;
    }
}

function printResults() {
    var text, x;
    c.font = "bold 18px Serif";
    if (comparisons<=4) {
        text = " Μπράβο τα κατάφερες  ";
        c.fillStyle = "rgb(0,150,0)";
        x = 800;
        c.fillText(text, x, yMax);
    }
    else {
        c.fillStyle = "rgb(150,0,0)";
        x = 600;
        text = "Μπράβο τα κατάφερες."
        c.fillText(text, x, yMax);
        text = "Μπορείς να το βρεις με λιγότερες προσπάθειες;";
        c.fillText(text, x, yMax + 20);
        text = "Θυμήσου ότι τα στοιχεία είναι σε αύξουσα σειρά";
        c.fillText(text, x, yMax + 40);
    }
}

function printStatistics() {
    c.clearRect(790, yMax-100, 200, 260);
    var text = " Προσπάθειες =  " + comparisons;
    c.font = "bold 20px Serif";
    c.fillStyle = "rgb(0,0,125)";
    c.fillText(text, 800, yMax - 50);
}


function start(s, editor) {
    init(s);
    drawMax();
    done = false;
    ss = s;
    found = false;
    comparisons = 0;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
////   GRAPHICAL FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////////////////////////

function drawCanvas() {
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    drawMax();
    for (var i = 1; i <= N; i++) {
        var x = xpos + (i - 1) * (xsize + xspace), y = ypos;
        drawCell(i, x, ypos);
        var text = i + "";
        c.font = "bold 14px Arial";
        c.fillStyle = "rgb(0,0,255)";
        if (i < 10)
            c.fillText(text, x + 1.2*align, y + ysize + indexAlign);
        else
            c.fillText(text, x + align, y + ysize + indexAlign);
        c.lineWidth = 5;
    }
}

function drawCell(i, x, y) {
    c.clearRect(x, y, xsize, ysize);
    c.strokeStyle = "rgb(0,0,150)";
    c.lineWidth = 3;
    c.fillStyle = array[i].colour;
    c.fillRect(x, y, xsize, ysize);
    c.strokeRect(x, y, xsize, ysize);
    var text = array[i].value + "";
    c.font = "bold 20px Arial";
    c.fillStyle = "rgb(0,0,125)";
    if (array[i].visible)
        if (array[i].value < 10)
            c.fillText(text, x + 18, y + 2*ysize/3);
        else
            c.fillText(text, x + 14, y + 2*ysize/3);
    c.lineWidth = 5;
    c.strokeStyle = "rgb(0,0,150)";
}

function drawMax() {
    var x = array[0].x, y = array[0].y;
    drawMax2(x, y);
}

function drawMax2(x, y) {
    c.clearRect(x, y, xsize, ysize);
    c.strokeStyle = "rgb(0,0,150)";
    c.lineWidth = 3;
    c.fillStyle = array[0].colour;
    c.fillRect(x, y, xsize, ysize);
    c.strokeRect(x, y, xsize, ysize);
    var text = array[0].value + "";
    c.font = "bold 20px Arial";
    c.fillStyle = "rgb(0,0,125)";
    if (array[0].value != -1)
        if (array[0].value < 10)
            c.fillText(text, x + 18, y + 2 * ysize / 3);
        else
            c.fillText(text, x + 14, y + 2 * ysize / 3);

    c.font = "bold 14px Arial";
    c.fillStyle = "rgb(0,0,150)";
    c.fillText(varName, x-12, y - indexAlign / 2);
    c.lineWidth = 5;
    c.strokeStyle = "rgb(0,0,150)";
}

function highlightAfter(index) {
    array[index].colour = "rgba(255,0,0,0.7)";
}

function highlight(index) {
    array[index].colour = "rgba(0,255,0,0.7)";
}

function markInactive(index) {
    array[index].colour = "rgba(100,100,100,0.8)";
}

function assignCell(k, l) {
    array[k].x = array[l].x;
    array[k].y = array[l].y;
    array[k].value = array[l].value;
    array[k].colour = array[l].colour;
}


