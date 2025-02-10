const svgContainer = SVG().addTo('#svg-container').size(500, 500);
const svgCodeEl = document.getElementById('svg-code');
const layersContainer = document.getElementById('layers-container');
const layerCountSelect = document.getElementById('layer-count');
const generateButton = document.getElementById('generate-button');
const toastEl = document.getElementById('toast');

const DEFAULT_LAYER_PROPERTIES = {
    shape: 'rectangle',
    visible: true,
    width: 100,
    height: 50,
    x: 0,
    y: 0,
    fillColor: '#f1f1f1',
    strokeColor: '#606060',
    strokeWidth: 1,
    strokeStyle: 'solid',
    zIndex: 1,
    opacity: 1,
    rotation: 0,
    radius: 0,
    points: [[0, 0], [50, 0], [25, 50]]
};

let layerProperties = {};
let currentLayerCount = 1;

function initializeLayers() {
    try {
        const existingControls = layersContainer.querySelectorAll('.layer-controls');
        existingControls.forEach(control => {
            const layer = parseInt(control.getAttribute('data-layer'));
            if (layer > currentLayerCount) {
                control.remove();
                delete layerProperties[layer];
            }
        });

        for (let i = 1; i <= currentLayerCount; i++) {
            let control = layersContainer.querySelector(`.layer-controls[data-layer="${i}"]`);
            if (!control) {
                addLayerControls(i);
            }
            if (!layerProperties[i]) {
                layerProperties[i] = { ...DEFAULT_LAYER_PROPERTIES, x: (i - 1) * 10, y: (i - 1) * 10, zIndex: i };
            }
        }

        updateSVG();
    } catch (error) {
        console.error('Error initializing layers:', error);
    }
}

function addLayerControls(layer) {
    const layerControl = document.createElement('div');
    layerControl.classList.add('layer-controls');
    layerControl.setAttribute('data-layer', layer);
    layerControl.innerHTML = `
        <h5>Layer ${layer}</h5>
        <div class="form-group">
            <label>Shape:
                <select class="shape" data-layer="${layer}">
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                </select>
            </label>
        </div>
        <div class="form-group">
            <label>Z-index:
                <input type="number" class="z-index" data-layer="${layer}" value="${layer}">
            </label>
        </div>
        <div class="form-group">
            <label><input type="checkbox" class="layer-visible" data-layer="${layer}" checked> Visible</label>
        </div>
        <div class="rectangle-circle-fields">
            <div class="form-group">
                <label>Width: <input type="number" class="width" data-layer="${layer}" value="100"></label>
            </div>
            <div class="form-group">
                <label>Height: <input type="number" class="height" data-layer="${layer}" value="50"></label>
            </div>
            <div class="form-group">
                <label>X pos: <input type="number" class="x-position" data-layer="${layer}" value="${(layer - 1) * 10}"></label>
            </div>
            <div class="form-group">
                <label>Y pos: <input type="number" class="y-position" data-layer="${layer}" value="${(layer - 1) * 10}"></label>
            </div>
            <div class="form-group">
                <label>Radius: <input type="number" class="radius" data-layer="${layer}" value="0"></label>
            </div>
        </div>
        <div class="circle-fields" style="display:none;">
            <div class="form-group">
                <label>Radius: <input type="number" class="radius" data-layer="${layer}" value="25"></label>
            </div>
            <div class="form-group">
                <label>Center X: <input type="number" class="x-position" data-layer="${layer}" value="${(layer - 1) * 10 + 50}"></label>
            </div>
            <div class="form-group">
                <label>Center Y: <input type="number" class="y-position" data-layer="${layer}" value="${(layer - 1) * 10 + 50}"></label>
            </div>
        </div>
        <div class="triangle-fields" style="display:none;">
            <div class="form-group">
                <label>Point 1 X: <input type="number" class="point1-x" data-layer="${layer}" value="0"></label>
                <label>Y: <input type="number" class="point1-y" data-layer="${layer}" value="0"></label>
            </div>
            <div class="form-group">
                <label>Point 2 X: <input type="number" class="point2-x" data-layer="${layer}" value="50"></label>
                <label>Y: <input type="number" class="point2-y" data-layer="${layer}" value="0"></label>
            </div>
            <div class="form-group">
                <label>Point 3 X: <input type="number" class="point3-x" data-layer="${layer}" value="25"></label>
                <label>Y: <input type="number" class="point3-y" data-layer="${layer}" value="50"></label>
            </div>
        </div>
        <div class="form-group">
            <label>Fill color: <input type="color" class="fill-color" data-layer="${layer}" value="#f1f1f1"></label>
        </div>
        <div class="form-group">
            <label>Border color: <input type="color" class="stroke-color" data-layer="${layer}" value="#606060"></label>
        </div>
        <div class="form-group">
            <label>Border width: <input type="number" class="stroke-width" data-layer="${layer}" value="1"></label>
        </div>
        <div class="form-group">
            <label>Border style:
                <select class="stroke-style" data-layer="${layer}">
                    <option value="solid">Solid</option>
                    <option value="dotted">Dotted</option>
                    <option value="dashed">Dashed</option>
                </select>
            </label>
        </div>
        <div class="form-group">
            <label>Opacity: <input type="number" step="0.1" min="0" max="1" class="opacity" data-layer="${layer}" value="1"></label>
        </div>
        <div class="form-group">
            <label>Rotation (deg): <input type="number" class="rotation" data-layer="${layer}" value="0"></label>
        </div>
    `;
    layersContainer.appendChild(layerControl);

    const shapeSelect = layerControl.querySelector('.shape');
    const rectangleCircleFields = layerControl.querySelector('.rectangle-circle-fields');
    const circleFields = layerControl.querySelector('.circle-fields');
    const triangleFields = layerControl.querySelector('.triangle-fields');

    function updateFieldsDisplay() {
        const shape = shapeSelect.value;
        rectangleCircleFields.style.display = shape === 'rectangle' ? '' : 'none';
        circleFields.style.display = shape === 'circle' ? '' : 'none';
        triangleFields.style.display = shape === 'triangle' ? '' : 'none';
    }

    shapeSelect.addEventListener('change', (e) => {
        const layer = e.target.getAttribute('data-layer');
        const shape = e.target.value;
        layerProperties[layer].shape = shape;
        updateFieldsDisplay();
        updateSVG();
    });

    updateFieldsDisplay();
    addEventListenersToLayer(layerControl);
}

function addEventListenersToLayer(layerControl) {
    layerControl.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', (e) => {
            const layer = e.target.getAttribute('data-layer');
            const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            const classList = e.target.classList;

            if (classList.contains('layer-visible')) {
                layerProperties[layer].visible = value;
            } else if (classList.contains('shape')) {
                layerProperties[layer].shape = value;
            } else if (classList.contains('width')) {
                layerProperties[layer].width = parseInt(value) || 0;
            } else if (classList.contains('height')) {
                layerProperties[layer].height = parseInt(value) || 0;
            } else if (classList.contains('x-position')) {
                layerProperties[layer].x = parseInt(value) || 0;
            } else if (classList.contains('y-position')) {
                layerProperties[layer].y = parseInt(value) || 0;
            } else if (classList.contains('radius')) {
                layerProperties[layer].radius = parseInt(value) || 0;
            } else if (classList.contains('point1-x')) {
                layerProperties[layer].points[0][0] = parseInt(value) || 0;
            } else if (classList.contains('point1-y')) {
                layerProperties[layer].points[0][1] = parseInt(value) || 0;
            } else if (classList.contains('point2-x')) {
                layerProperties[layer].points[1][0] = parseInt(value) || 0;
            } else if (classList.contains('point2-y')) {
                layerProperties[layer].points[1][1] = parseInt(value) || 0;
            } else if (classList.contains('point3-x')) {
                layerProperties[layer].points[2][0] = parseInt(value) || 0;
            } else if (classList.contains('point3-y')) {
                layerProperties[layer].points[2][1] = parseInt(value) || 0;
            } else if (classList.contains('fill-color')) {
                layerProperties[layer].fillColor = value;
            } else if (classList.contains('stroke-color')) {
                layerProperties[layer].strokeColor = value;
            } else if (classList.contains('stroke-width')) {
                layerProperties[layer].strokeWidth = parseInt(value) || 0;
            } else if (classList.contains('stroke-style')) {
                layerProperties[layer].strokeStyle = value;
            } else if (classList.contains('z-index')) {
                layerProperties[layer].zIndex = parseInt(value) || 0;
            } else if (classList.contains('opacity')) {
                layerProperties[layer].opacity = parseFloat(value) || 1;
            } else if (classList.contains('rotation')) {
                layerProperties[layer].rotation = parseFloat(value) || 0;
            }

            updateSVG();
        });
    });
}

function updateSVG() {
    svgContainer.clear();

    const layersArray = Object.keys(layerProperties).map(layer => ({
        layerNumber: layer,
        props: layerProperties[layer]
    })).sort((a, b) => a.props.zIndex - b.props.zIndex);

    layersArray.forEach(item => {
        const props = item.props;
        if (props.visible) {
            let element;
            if (props.shape === 'rectangle') {
                element = svgContainer.rect(props.width, props.height)
                    .move(props.x, props.y)
                    .radius(props.radius);
            } else if (props.shape === 'circle') {
                element = svgContainer.circle(props.radius * 2)
                    .move(props.x - props.radius, props.y - props.radius);
            } else if (props.shape === 'triangle') {
                const points = props.points.map(point => point.join(',')).join(' ');
                element = svgContainer.polygon(points);
            }

            if (element) {
                const centerX = props.x + (props.width || props.radius * 2) / 2;
                const centerY = props.y + (props.height || props.radius * 2) / 2;

                element.fill(props.fillColor)
                    .stroke({
                        color: props.strokeColor,
                        width: props.strokeWidth,
                        dasharray: getStrokeStyle(props.strokeStyle)
                    })
                    .opacity(props.opacity)
                    .rotate(props.rotation, centerX, centerY);
            }
        }
    });

    svgCodeEl.textContent = svgContainer.svg();
}

function getStrokeStyle(style) {
    switch (style) {
        case 'dotted':
            return '1,3';
        case 'dashed':
            return '5,5';
        default:
            return '';
    }
}

layerCountSelect.addEventListener('change', () => {
    currentLayerCount = parseInt(layerCountSelect.value);
    initializeLayers();
});

generateButton.addEventListener('click', () => {
    const svgCode = svgContainer.svg();
    navigator.clipboard.writeText(svgCode).then(() => {
        showToast('Successfully copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

function showToast(message) {
    toastEl.textContent = message;
    toastEl.className = 'toast show';
    setTimeout(() => {
        toastEl.className = toastEl.className.replace('show', '');
    }, 2000);
}

initializeLayers();
