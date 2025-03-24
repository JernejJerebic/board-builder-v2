
document.addEventListener('DOMContentLoaded', function() {
    // Initialize board state
    const boardState = {
        color: null,
        length: 800,
        width: 600,
        thickness: 18,
        borders: {
            top: false,
            right: false,
            bottom: false,
            left: false
        },
        drilling: false,
        rotated: false
    };
    
    // Get the board container
    const boardContainer = document.getElementById('boardVisualization');
    
    // Create initial board visualization
    renderBoard();
    
    // Function to render the board
    function renderBoard() {
        const boardHTML = `
            <div class="board-visualization-container">
                <div class="board ${boardState.rotated ? 'board-rotated' : ''}" 
                     style="width: ${boardState.rotated ? boardState.width : boardState.length}px; 
                            height: ${boardState.rotated ? boardState.length : boardState.width}px; 
                            background-color: ${boardState.color ? boardState.color.htmlColor : '#d2b48c'};">
                    
                    ${renderBorders()}
                    ${boardState.drilling ? renderDrilling() : ''}
                </div>
                <div class="board-info mt-4">
                    <div class="text-sm text-gray-500">Dimenzije: ${boardState.length} x ${boardState.width} mm</div>
                    <div class="text-sm text-gray-500">Debelina: ${boardState.thickness} mm</div>
                    ${boardState.color ? `<div class="text-sm text-gray-500">Material: ${boardState.color.title}</div>` : ''}
                </div>
            </div>
        `;
        
        boardContainer.innerHTML = boardHTML;
    }
    
    // Function to render borders
    function renderBorders() {
        let bordersHTML = '';
        
        if (boardState.borders.top) {
            bordersHTML += `<div class="border border-top" style="top: 0; left: 0; right: 0; height: 5px;"></div>`;
        }
        
        if (boardState.borders.right) {
            bordersHTML += `<div class="border border-right" style="top: 0; right: 0; bottom: 0; width: 5px;"></div>`;
        }
        
        if (boardState.borders.bottom) {
            bordersHTML += `<div class="border border-bottom" style="bottom: 0; left: 0; right: 0; height: 5px;"></div>`;
        }
        
        if (boardState.borders.left) {
            bordersHTML += `<div class="border border-left" style="top: 0; left: 0; bottom: 0; width: 5px;"></div>`;
        }
        
        return bordersHTML;
    }
    
    // Function to render drilling hole (always visible at the top)
    function renderDrilling() {
        return `<div class="board-drill" style="top: 10px; left: 50%;"></div>`;
    }
    
    // Create a global function to update the board state from outside
    window.updateBoardVisualization = function(newState) {
        // Update only provided properties
        Object.keys(newState).forEach(key => {
            if (key === 'borders') {
                Object.keys(newState.borders).forEach(border => {
                    boardState.borders[border] = newState.borders[border];
                });
            } else {
                boardState[key] = newState[key];
            }
        });
        
        // Re-render the board
        renderBoard();
    };
});
