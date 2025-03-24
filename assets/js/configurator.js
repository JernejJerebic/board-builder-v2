
document.addEventListener('DOMContentLoaded', function() {
    // Get the configurator container
    const configuratorContainer = document.getElementById('boardConfigurator');
    
    // Initialize state
    let colors = [];
    let selectedColor = null;
    let length = 800;
    let width = 600;
    let thickness = 18;
    let borders = {
        top: false,
        right: false,
        bottom: false,
        left: false
    };
    let drilling = false;
    let quantity = 1;
    
    // Fetch colors from API
    fetchColors();
    
    // Function to fetch colors
    function fetchColors() {
        fetch('/api/colors/index.php')
            .then(response => response.json())
            .then(data => {
                colors = data.filter(color => color.active);
                renderConfigurator();
            })
            .catch(error => {
                console.error('Error fetching colors:', error);
                showToast('Napaka pri nalaganju barv', 'error');
            });
    }
    
    // Function to render the configurator
    function renderConfigurator() {
        const configuratorHTML = `
            <div class="card">
                <div class="card-header">
                    <h2 class="text-xl font-bold">Konfigurator plošče</h2>
                </div>
                <div class="card-body">
                    <div class="form-group">
                        <label class="form-label">Izberite material</label>
                        <div class="color-selector">
                            ${renderColorOptions()}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="length" class="form-label">Dolžina (mm)</label>
                        <input type="number" id="length" class="form-input" value="${length}" min="100" max="2000">
                    </div>
                    
                    <div class="form-group">
                        <label for="width" class="form-label">Širina (mm)</label>
                        <input type="number" id="width" class="form-input" value="${width}" min="100" max="2000">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Debelina</label>
                        <select id="thickness" class="form-select">
                            ${renderThicknessOptions()}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Robovi</label>
                        <div class="border-selector">
                            <button id="border-top" class="border-btn top ${borders.top ? 'active' : ''}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 3h18v2H3z"/></svg>
                            </button>
                            <button id="border-right" class="border-btn right ${borders.right ? 'active' : ''}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3h2v18h-2z"/></svg>
                            </button>
                            <button id="border-bottom" class="border-btn bottom ${borders.bottom ? 'active' : ''}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 19h18v2H3z"/></svg>
                            </button>
                            <button id="border-left" class="border-btn left ${borders.left ? 'active' : ''}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 3h2v18H3z"/></svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="flex items-center">
                            <input type="checkbox" id="drilling" class="mr-2" ${drilling ? 'checked' : ''}>
                            <label for="drilling" class="form-label m-0">Vrtanje (vedno na vrhu)</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="quantity" class="form-label">Količina</label>
                        <input type="number" id="quantity" class="form-input" value="${quantity}" min="1" max="100">
                    </div>
                    
                    <button id="add-to-basket" class="btn btn-primary w-full">Dodaj v košarico</button>
                </div>
            </div>
        `;
        
        configuratorContainer.innerHTML = configuratorHTML;
        
        // Add event listeners
        addEventListeners();
        
        // Update board visualization with initial values
        updateVisualization();
    }
    
    // Function to render color options
    function renderColorOptions() {
        if (colors.length === 0) {
            return '<div class="text-gray-500">Ni razpoložljivih barv</div>';
        }
        
        return colors.map(color => {
            const isSelected = selectedColor && selectedColor.id === color.id;
            return `
                <div class="color-item ${isSelected ? 'selected' : ''}" 
                     data-id="${color.id}" 
                     style="background-color: ${color.htmlColor};" 
                     title="${color.title}"></div>
            `;
        }).join('');
    }
    
    // Function to render thickness options
    function renderThicknessOptions() {
        // Get unique thickness values from available colors
        const thicknessValues = [...new Set(colors.map(color => color.thickness))];
        
        if (thicknessValues.length === 0) {
            return '<option value="18">18 mm</option>';
        }
        
        return thicknessValues.map(value => {
            return `<option value="${value}" ${value === thickness ? 'selected' : ''}>${value} mm</option>`;
        }).join('');
    }
    
    // Function to add event listeners
    function addEventListeners() {
        // Color selection
        document.querySelectorAll('.color-item').forEach(item => {
            item.addEventListener('click', function() {
                const colorId = this.getAttribute('data-id');
                selectedColor = colors.find(color => color.id === colorId);
                
                // Update thickness based on selected color
                if (selectedColor) {
                    thickness = selectedColor.thickness;
                    document.getElementById('thickness').value = thickness;
                }
                
                renderConfigurator();
            });
        });
        
        // Length input
        document.getElementById('length').addEventListener('change', function() {
            length = parseInt(this.value, 10) || 800;
            updateVisualization();
        });
        
        // Width input
        document.getElementById('width').addEventListener('change', function() {
            width = parseInt(this.value, 10) || 600;
            updateVisualization();
        });
        
        // Thickness select
        document.getElementById('thickness').addEventListener('change', function() {
            thickness = parseInt(this.value, 10);
            
            // Filter colors by selected thickness
            const availableColors = colors.filter(color => color.thickness === thickness);
            
            if (availableColors.length > 0 && (!selectedColor || selectedColor.thickness !== thickness)) {
                selectedColor = availableColors[0];
                renderConfigurator();
            }
            
            updateVisualization();
        });
        
        // Border buttons
        document.getElementById('border-top').addEventListener('click', function() {
            borders.top = !borders.top;
            this.classList.toggle('active');
            updateVisualization();
        });
        
        document.getElementById('border-right').addEventListener('click', function() {
            borders.right = !borders.right;
            this.classList.toggle('active');
            updateVisualization();
        });
        
        document.getElementById('border-bottom').addEventListener('click', function() {
            borders.bottom = !borders.bottom;
            this.classList.toggle('active');
            updateVisualization();
        });
        
        document.getElementById('border-left').addEventListener('click', function() {
            borders.left = !borders.left;
            this.classList.toggle('active');
            updateVisualization();
        });
        
        // Drilling checkbox
        document.getElementById('drilling').addEventListener('change', function() {
            drilling = this.checked;
            updateVisualization();
        });
        
        // Quantity input
        document.getElementById('quantity').addEventListener('change', function() {
            quantity = parseInt(this.value, 10) || 1;
        });
        
        // Add to basket button
        document.getElementById('add-to-basket').addEventListener('click', addToBasket);
    }
    
    // Function to update visualization
    function updateVisualization() {
        if (typeof window.updateBoardVisualization === 'function') {
            window.updateBoardVisualization({
                color: selectedColor,
                length: length,
                width: width,
                thickness: thickness,
                borders: borders,
                drilling: drilling
            });
        }
    }
    
    // Function to add current configuration to basket
    function addToBasket() {
        if (!selectedColor) {
            showToast('Izberite material', 'error');
            return;
        }
        
        // Calculate surface area in square meters
        const surfaceArea = (length * width) / 1000000;
        
        // Calculate price based on surface area and selected color
        const pricePerUnit = selectedColor.priceWithVat;
        
        // Count the number of borders
        const borderCount = Object.values(borders).filter(Boolean).length;
        
        // Add border cost - 2€ per border
        const borderCost = borderCount * 2;
        
        // Add drilling cost - 1€ per hole
        const drillingCost = drilling ? 1 : 0;
        
        // Calculate total price for one unit
        const unitPrice = (pricePerUnit * surfaceArea) + borderCost + drillingCost;
        
        // Calculate total price for the quantity
        const totalPrice = unitPrice * quantity;
        
        const product = {
            id: new Date().getTime().toString(), // Temporary ID
            colorId: selectedColor.id,
            colorTitle: selectedColor.title,
            colorHtml: selectedColor.htmlColor,
            length: length,
            width: width,
            thickness: thickness,
            surfaceArea: surfaceArea,
            borders: borders,
            drilling: drilling,
            quantity: quantity,
            pricePerUnit: unitPrice,
            totalPrice: totalPrice
        };
        
        // Add to basket
        window.addToBasket(product);
        
        showToast('Dodano v košarico', 'success');
    }
});
