let img;
let shapeSelect;

// 3. Image Resolution (Sampling)
let sampleXSlider, sampleYSlider;
let sampleXInput, sampleYInput;

// 4. Display Spacing (Condensing)
let displayXSlider, displayYSlider;
let displayXInput, displayYInput;

let widthSlider, heightSlider;
let widthInput, heightInput;

let rotationSlider, rotationInput;
let thresholdCheckbox;

let saveBtn;

function setup() {
  let canvas = createCanvas(800, 800, 'svg');
  canvas.parent(document.body);

  let controls = select('#controls');

  // 1. Image Upload
  let imgGroup = createDiv('1. Upload Image').class('control-group');
  imgGroup.parent(controls);
  let imgUploader = createFileInput(handleImage);
  imgUploader.parent(imgGroup);

  // 2. Shape & Style Options
  let shapeGroup = createDiv('2. Shape & Style').class('control-group');
  shapeGroup.parent(controls);
  
  shapeSelect = createSelect();
  shapeSelect.option('Triangle (Mountain)');
  shapeSelect.option('Rectangle');
  shapeSelect.option('Circle');
  shapeSelect.parent(shapeGroup);
  shapeSelect.changed(() => redraw());

  let checkRow = createDiv('').class('checkbox-row');
  checkRow.parent(shapeGroup);
  thresholdCheckbox = createCheckbox(' Uniform Edge Size', false);
  thresholdCheckbox.parent(checkRow);
  thresholdCheckbox.changed(() => redraw());

  // 3. Image Resolution (Sample Spacing)
  let sampleGroup = createDiv('3. Resolution (Pixels)').class('control-group');
  sampleGroup.parent(controls);
  
  let sampleXRow = createDiv('Horiz (X):').class('slider-row');
  sampleXRow.parent(sampleGroup);
  sampleXSlider = createSlider(5, 100, 15, 1);
  sampleXSlider.parent(sampleXRow);
  sampleXInput = createInput('15', 'number');
  sampleXInput.parent(sampleXRow);
  syncControl(sampleXSlider, sampleXInput);
  
  let sampleYRow = createDiv('Vert (Y):').class('slider-row');
  sampleYRow.parent(sampleGroup);
  sampleYSlider = createSlider(5, 100, 15, 1);
  sampleYSlider.parent(sampleYRow);
  sampleYInput = createInput('15', 'number');
  sampleYInput.parent(sampleYRow);
  syncControl(sampleYSlider, sampleYInput);

  // 4. Display Spacing (Condense) - NEW!
  let displayGroup = createDiv('4. Display Spacing').class('control-group');
  displayGroup.parent(controls);
  
  let displayXRow = createDiv('Horiz (X):').class('slider-row');
  displayXRow.parent(displayGroup);
  displayXSlider = createSlider(1, 100, 15, 1);
  displayXSlider.parent(displayXRow);
  displayXInput = createInput('15', 'number');
  displayXInput.parent(displayXRow);
  syncControl(displayXSlider, displayXInput);
  
  let displayYRow = createDiv('Vert (Y):').class('slider-row');
  displayYRow.parent(displayGroup);
  displayYSlider = createSlider(1, 100, 15, 1);
  displayYSlider.parent(displayYRow);
  displayYInput = createInput('15', 'number');
  displayYInput.parent(displayYRow);
  syncControl(displayYSlider, displayYInput);

  // 5. Size Control
  let sizeGroup = createDiv('5. Pixel Size').class('control-group');
  sizeGroup.parent(controls);
  
  let widthRow = createDiv('Width (W):').class('slider-row');
  widthRow.parent(sizeGroup);
  widthSlider = createSlider(1, 100, 15, 1);
  widthSlider.parent(widthRow);
  widthInput = createInput('15', 'number');
  widthInput.parent(widthRow);
  syncControl(widthSlider, widthInput);
  
  let heightRow = createDiv('Height (H):').class('slider-row');
  heightRow.parent(sizeGroup);
  heightSlider = createSlider(1, 100, 15, 1);
  heightSlider.parent(heightRow);
  heightInput = createInput('15', 'number');
  heightInput.parent(heightRow);
  syncControl(heightSlider, heightInput);

  // 6. Rotation Angle
  let rotGroup = createDiv('6. Rotation Angle').class('control-group');
  rotGroup.parent(controls);
  
  let rotRow = createDiv('0~360 deg:').class('slider-row');
  rotRow.parent(rotGroup);
  rotationSlider = createSlider(0, 360, 0, 1);
  rotationSlider.parent(rotRow);
  rotationInput = createInput('0', 'number');
  rotationInput.parent(rotRow);
  syncControl(rotationSlider, rotationInput);

  // 7. Save SVG Button
  let btnGroup = createDiv('').class('control-group');
  btnGroup.style('background-color', 'transparent');
  btnGroup.style('border', 'none');
  btnGroup.parent(controls);
  saveBtn = createButton('Export as SVG');
  saveBtn.parent(btnGroup);
  saveBtn.mousePressed(exportSVG);

  noLoop();
}

function syncControl(slider, inputField) {
  slider.input(() => {
    inputField.value(slider.value());
    redraw();
  });
  inputField.input(() => {
    let val = Number(inputField.value());
    slider.value(val);
    redraw();
  });
}

function handleImage(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      let aspect = img.width / img.height;
      resizeCanvas(800, 800 / aspect, 'svg');
      
      img.loadPixels(); 
      redraw();
    });
  } else {
    alert('Only image files are allowed.');
  }
}

function exportSVG() {
  if (!img) {
    alert('Please upload an image first.');
    return;
  }
  save("condensed_pixel_art.svg");
}

function draw() {
  clear();
  background(255);

  if (!img) {
    fill(100);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Please upload an image in section 1 to start.", width / 2, height / 2);
    return;
  }

  // 3. Sampling (Resolution)
  let sampleStepX = max(1, int(sampleXSlider.value())); 
  let sampleStepY = max(1, int(sampleYSlider.value())); 
  
  // 4. Drawing (Condensing)
  let displayStepX = max(1, int(displayXSlider.value())); 
  let displayStepY = max(1, int(displayYSlider.value())); 

  let baseW = int(widthSlider.value());
  let baseH = int(heightSlider.value());
  let angle = radians(rotationSlider.value());
  let selectedShape = shapeSelect.value();
  let useThreshold = thresholdCheckbox.checked(); 
  
  fill(0);
  noStroke();

  // Calculate total width/height to center the condensed artwork
  let totalCols = Math.ceil(width / sampleStepX);
  let totalRows = Math.ceil(height / sampleStepY);
  let totalDrawWidth = totalCols * displayStepX;
  let totalDrawHeight = totalRows * displayStepY;
  
  let offsetX = (width - totalDrawWidth) / 2;
  let offsetY = (height - totalDrawHeight) / 2;

  let gridY = 0;
  for (let y = 0; y < height; y += sampleStepY) {
    let gridX = 0;
    for (let x = 0; x < width; x += sampleStepX) {
      
      let imgX = floor(map(x, 0, width, 0, img.width));
      let imgY = floor(map(y, 0, height, 0, img.height));
      
      imgX = constrain(imgX, 0, img.width - 1);
      imgY = constrain(imgY, 0, img.height - 1);
      
      let index = (imgY * img.width + imgX) * 4;
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      
      let brightness = (r + g + b) / 3;
      
      let w = 0;
      let h = 0;

      if (useThreshold) {
        if (brightness < 128) {
          w = baseW * 1.2;
          h = baseH * 1.2;
        }
      } else {
        w = map(brightness, 0, 255, baseW * 1.2, 0);
        h = map(brightness, 0, 255, baseH * 1.2, 0);
      }

      if (w > 0.5 || h > 0.5) {
        push(); 
        
        // Calculate condensed drawing positions and center them
        let drawX = offsetX + (gridX * displayStepX);
        let drawY = offsetY + (gridY * displayStepY);

        translate(drawX + displayStepX / 2, drawY + displayStepY / 2);
        rotate(angle);

        if (selectedShape === 'Triangle (Mountain)') {
          let x1 = -w / 2;
          let y1 = h / 2;
          let x2 = w / 2;
          let y2 = h / 2;
          let x3 = 0;
          let y3 = -h / 2;
          triangle(x1, y1, x2, y2, x3, y3);
        } 
        else if (selectedShape === 'Rectangle') {
          rectMode(CENTER);
          rect(0, 0, w, h);
        } 
        else if (selectedShape === 'Circle') {
          ellipseMode(CENTER);
          ellipse(0, 0, w, h);
        }
        
        pop();
      }
      gridX++;
    }
    gridY++;
  }
}
