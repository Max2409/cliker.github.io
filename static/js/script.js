// Initial number of plots
let numPlots = 4;

// Function to add a new plot
function addPlot() {
    if (numPlots < 8) {
        numPlots++;
        let newPlot = document.createElement('div');
        newPlot.classList.add('plot');
        newPlot.setAttribute('id', `plot${numPlots}`);
        document.querySelector('.farm').appendChild(newPlot);
    }
}

// Add event listener for the "Add Plot" button
document.getElementById('addPlotButton').addEventListener('click', addPlot);
