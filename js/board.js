
/**
 * Board visualization and configuration
 */

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

// Elements
const boardVisualization = document.getElementById('boardVisualization');
const colorSelector = document.getElementById('colorSelector');
const colorModal = document.getElementById('colorModal');
const colorsList = document.getElementById('colorsList');
const boardLength = document.getElementById('boardLength');
const boardWidth = document.getElementById('boardWidth');
const boardThickness = document.getElementById('boardThickness');
const rotateBoardButton = document.getElementById('rotateBoardButton');
const borderTop = document.getElementById('borderTop');
const borderRight = document.getElementById('borderRight');
const borderBottom = document.getElementById('borderBottom');
const borderLeft = document.getElementById('borderLeft');
const drilling = document.getElementById('drilling');
const quantity = document.getElementById('quantity');
const addToBasketButton = document.getElementById('addToBasketButton');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Render initial board
    renderBoard();
    
    // Load colors
    loadColors();
    
    // Setup event listeners
    setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Open color modal
    colorSelector.addEventListener('click', () => {
        colorModal.classList.add('show');
    });
    
    // Close color modal on X button
    colorModal.querySelector('.close-button').addEventListener('click', () => {
        colorModal.classList.remove('show');
    });
    
    // Close color modal when clicking outside
    colorModal.addEventListener('click', (e) => {
        if (e.target === colorModal) {
            colorModal.classList.remove('show');
        }
    });
    
    // Dimension inputs
    boardLength.addEventListener('change', () => {
        boardState.length = parseInt(boardLength.value, 10) || 800;
        renderBoard();
    });
    
    boardWidth.addEventListener('change', () => {
        boardState.width = parseInt(boardWidth.value, 10) || 600;
        renderBoard();
    });
    
    boardThickness.addEventListener('change', () => {
        boardState.thickness = parseInt(boardThickness.value, 10) || 18;
        renderBoard();
    });
    
    // Rotate board
    rotateBoardButton.addEventListener('click', () => {
        // Swap length and width
        const temp = boardState.length;
        boardState.length = boardState.width;
        boardState.width = temp;
        
        // Update input fields
        boardLength.value = boardState.length;
        boardWidth.value = boardState.width;
        
        // Toggle rotation animation flag
        boardState.rotated = !boardState.rotated;
        
        // Render board with updated dimensions
        renderBoard();
    });
    
    // Border checkboxes
    borderTop.addEventListener('change', () => {
        boardState.borders.top = borderTop.checked;
        renderBoard();
    });
    
    borderRight.addEventListener('change', () => {
        boardState.borders.right = borderRight.checked;
        renderBoard();
    });
    
    borderBottom.addEventListener('change', () => {
        boardState.borders.bottom = borderBottom.checked;
        renderBoard();
    });
    
    borderLeft.addEventListener('change', () => {
        boardState.borders.left = borderLeft.checked;
        renderBoard();
    });
    
    // Drilling checkbox
    drilling.addEventListener('change', () => {
        boardState.drilling = drilling.checked;
        renderBoard();
    });
    
    // Add to basket
    addToBasketButton.addEventListener('click', addToBasket);
}

/**
 * Load colors from API or mock data
 */
function loadColors() {
    colorsList.innerHTML = '<div class="color-loader">Nalaganje barv...</div>';
    
    DataService.getColors()
        .then(colors => {
            renderColorsList(colors.filter(color => color.active));
        })
        .catch(error => {
            console.error('Error loading colors:', error);
            colorsList.innerHTML = '<div class="color-loader">Napaka pri nalaganju barv.</div>';
        });
}

/**
 * Render colors list in modal
 * 
 * @param {Array} colors - Array of color objects
 */
function renderColorsList(colors) {
    colorsList.innerHTML = '';
    
    colors.forEach(color => {
        const colorItem = document.createElement('div');
        colorItem.className = 'color-item';
        colorItem.dataset.colorId = color.id;
        
        let previewStyle = '';
        if (color.imageUrl) {
            previewStyle = `background-image: url(${color.imageUrl})`;
        } else {
            previewStyle = `background-color: ${color.htmlColor || '#d2b48c'}`;
        }
        
        colorItem.innerHTML = `
            <div class="color-preview-large" style="${previewStyle}"></div>
            <div class="color-details">
                <div class="color-title">${color.title}</div>
                <div class="color-price">${color.thickness}mm - €${color.priceWithVat.toFixed(2)}</div>
            </div>
        `;
        
        colorItem.addEventListener('click', () => {
            selectColor(color);
            colorModal.classList.remove('show');
        });
        
        colorsList.appendChild(colorItem);
    });
}

/**
 * Select a color
 * 
 * @param {Object} color - Color object
 */
function selectColor(color) {
    boardState.color = color;
    boardState.thickness = color.thickness;
    boardThickness.value = color.thickness;
    
    // Update the color selector button
    let previewHtml = '';
    if (color.imageUrl) {
        previewHtml = `<div class="color-preview" style="background-image: url(${color.imageUrl})"></div>`;
    } else {
        previewHtml = `<div class="color-preview" style="background-color: ${color.htmlColor || '#d2b48c'}"></div>`;
    }
    
    colorSelector.innerHTML = `
        <div class="button-text">
            <div style="display: flex; align-items: center; gap: 8px;">
                ${previewHtml}
                <span>${color.title} (${color.thickness}mm)</span>
            </div>
        </div>
        <span class="button-arrow">▼</span>
    `;
    
    renderBoard();
}

/**
 * Render the board visualization
 */
function renderBoard() {
    // Create base HTML for board visualization
    const boardHTML = `
        <div class="board-visualization-container">
            <div class="board ${boardState.rotated ? 'board-rotated' : ''}" 
                 style="width: ${boardState.rotated ? boardState.width : boardState.length}px; 
                        height: ${boardState.rotated ? boardState.length : boardState.width}px; 
                        background-color: ${boardState.color ? boardState.color.htmlColor : '#d2b48c'};">
                
                ${renderBorders()}
                ${boardState.drilling ? renderDrilling() : ''}
            </div>
            <div class="board-info">
                <div class="text-sm">Dimenzije: ${boardState.length} x ${boardState.width} mm</div>
                <div class="text-sm">Debelina: ${boardState.thickness} mm</div>
                ${boardState.color ? `<div class="text-sm">Material: ${boardState.color.title}</div>` : ''}
            </div>
        </div>
    `;
    
    boardVisualization.innerHTML = boardHTML;
}

/**
 * Render borders for the board
 * 
 * @returns {string} HTML for borders
 */
function renderBorders() {
    let bordersHTML = '';
    
    if (boardState.borders.top) {
        bordersHTML += `<div class="border" style="top: 0; left: 0; right: 0; height: 5px;"></div>`;
    }
    
    if (boardState.borders.right) {
        bordersHTML += `<div class="border" style="top: 0; right: 0; bottom: 0; width: 5px;"></div>`;
    }
    
    if (boardState.borders.bottom) {
        bordersHTML += `<div class="border" style="bottom: 0; left: 0; right: 0; height: 5px;"></div>`;
    }
    
    if (boardState.borders.left) {
        bordersHTML += `<div class="border" style="top: 0; left: 0; bottom: 0; width: 5px;"></div>`;
    }
    
    return bordersHTML;
}

/**
 * Render drilling hole
 * 
 * @returns {string} HTML for drilling
 */
function renderDrilling() {
    return `<div class="board-drill" style="top: 10px; left: 50%;"></div>`;
}

/**
 * Add current board to basket
 */
function addToBasket() {
    if (!boardState.color) {
        showToast('Prosimo, izberite barvo materiala.', 'error');
        return;
    }
    
    const productQuantity = parseInt(quantity.value, 10) || 1;
    
    const product = new Product({
        colorId: boardState.color.id,
        color: boardState.color,
        length: boardState.length,
        width: boardState.width,
        thickness: boardState.thickness,
        borders: { ...boardState.borders },
        drilling: boardState.drilling,
        quantity: productQuantity
    });
    
    // Add to basket (handled by basket.js)
    window.Basket.addItem(product);
    
    // Show success message
    showToast('Izdelek dodan v košarico.', 'success');
}
