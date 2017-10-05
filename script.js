var canvas = document.getElementsByTagName('canvas')[0];
var context = canvas.getContext('2d');

var points = new Array();
var showCursor = false;
var drawingActived = false
var mouseX, mouseY, temp;
var angle = 0;
var size = canvas.width * 0.9 / 2;

var settings = {
  'wheel-speed': 5,
  'wheel-direction': true,
  'line-color': 'black',
  'line-width': 3,
};

var colors = {
  black : [ 25, 25, 25 ],
  white : [ 225, 225, 225 ],
  red : [ 237, 28, 36 ],  
  orange : [ 253, 181, 21 ],
  yellow : [ 255, 242, 0 ],
  green : [ 88, 185, 71 ],
  blue : [ 0, 88, 162 ],
  purple : [ 192, 82, 158 ],
};

var center = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

updateUI('add-colors');
updateUI('current-speed');
updateUI('current-direction');
updateUI('current-color');
updateUI('current-width');

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

animate();

/* Main functions */
function animate() {
  angle += settings['wheel-speed'] * (settings['wheel-direction'] ? 1 : -1);

  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = 'grey';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(center.x, center.x, size, 0, 2 * Math.PI);
  context.stroke();
  context.closePath();

  context.lineJoin = 'round';

  if(points.length != 0) {
    for(p of points) {
      if(p.length == 0) continue;

      context.beginPath();
      context.strokeStyle = getColor(p[0][1]);
      context.lineWidth = p[0][0];

      temp = rotatePointAroundOrigin(center.x, center.y, p[0][0], p[0][1], degreesToRadian(angle - p[0][2]))
      context.moveTo(temp.x, temp.y);

      for(var d = 1; d < p.length; d++) {
        temp = rotatePointAroundOrigin(center.x, center.y, p[d][0], p[d][1], degreesToRadian(angle - p[d][2]));
        context.lineTo(temp.x, temp.y);
      }

      context.stroke();
      context.closePath();
    }
  }

  if(drawingActived && pointInCircle(center.x, center.y, mouseX, mouseY, size)) {
    var last = points[points.length-1];
    if(!(last[last.length-1][0] == mouseX && last[last.length-1][1] == mouseY && last[last.length-1][2] == angle)) {
      points[points.length-1].push([ mouseX, mouseY, angle ]);
    }
  }

  if(showCursor && mouseX != undefined) {
    context.beginPath();
    context.fillStyle = getColor(settings['line-color']);
    context.arc(mouseX, mouseY, settings['line-width'] * 5 / 2, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
  }

  requestAnimFrame(animate);
}

function startDrawing(e) {
  updateMousePosition(e);
  if(pointInCircle(center.x, center.y, mouseX, mouseY, size)) {
    drawingActived = true;
    points.push([]);
    points[points.length - 1].push([settings['line-width'] * 5, settings['line-color']]);
  }
}

function stopDrawing() {
  drawingActived = false;
}

function draw(e) {
  updateMousePosition(e);
  if(drawingActived) {
    if(!pointInCircle(center.x, center.y, mouseX, mouseY, size)) {
      drawingActived = false;
    }
    else {
      var last = points[points.length-1];
      if(last[last.length-1][0] == mouseX && last[last.length-1][1] == mouseY && last[last.length-1][2] == angle)
        return;

      last.push([ mouseX, mouseY, angle ]);
    }
  }
}

function changeColor(newColor) {
  settings['line-color'] = newColor;
  updateUI('current-color');
}

function toggleDirection() {
  settings['wheel-direction'] = !settings['wheel-direction'];
  updateUI('current-direction');
}

function setSpeed() {
  switch(this.id) {
    case 'speed-increase':
      settings['wheel-speed']++;
      break;
    case 'speed-decrease':
      if(settings['wheel-speed'] == 0) return;
      settings['wheel-speed']--;
      break;
    case 'speed-stop':
      settings['wheel-speed'] = 0;
      break;
  }
  updateUI('current-speed');  
}

function setWidth() {
  switch(this.id) {
    case 'width-increase':
      settings['line-width']++;
      break;
    case 'width-decrease':
      if(settings['line-width'] == 1) return;
      settings['line-width']--;
      break;
  }
  updateUI('current-width');
}

function undo() {
  points.pop();
}

function clearall() {
  while(points.length != 0) points.pop();
}

function download() {
  this.href = canvas.toDataURL();
  this.download = 'pottery-wheel.png';
}

/* UI-related functions */
function getColor(which) {
  return 'rgb(' + colors[which][0] + ', ' + colors[which][1] + ', ' + colors[which][2] + ')';
}

function updateUI(element) {
  switch(element) {
    case 'current-speed':
      document.getElementById('current-speed').innerHTML = settings['wheel-speed'];
      break;
    case 'current-direction':
      document.getElementById('current-direction').innerHTML = settings['wheel-direction'] ? 'clockwise': 'anti-clockwise';
      break;
    case 'current-color':
      var html = '';
      html += '<span style="color: ' + getColor(settings['line-color']) + ';">';
      html += settings['line-color'];
      html += '</span>';
      document.getElementById('current-color').innerHTML = html;
      break;
    case 'current-width':
      document.getElementById('current-width').innerHTML = settings['line-width'];
      break;
    case 'add-colors':
      var html = '';
      for(c in colors) {
        html += '<input type="button" style="background-color: ' + getColor(c) + '" onclick="changeColor(\'' + c+ '\')"> ';
        if(c == 'orange') html+= '<br>';
      }
      document.getElementById('colors').innerHTML = html;
      break;
  }
}

/* Event handlers */
document.getElementById('direction-reverse').addEventListener('click', toggleDirection, false);
document.getElementById('speed-increase').addEventListener('click', setSpeed, false);
document.getElementById('speed-decrease').addEventListener('click', setSpeed, false);
document.getElementById('speed-stop').addEventListener('click', setSpeed, false);
document.getElementById('width-increase').addEventListener('click', setWidth, false);
document.getElementById('width-decrease').addEventListener('click', setWidth, false);
document.getElementById('undo').addEventListener('click', undo, false);
document.getElementById('clearall').addEventListener('click', clearall, false);
document.getElementById('download').addEventListener('click', download, false);

canvas.addEventListener('mouseenter', function() { showCursor = true; }, false);
canvas.addEventListener('mouseleave', function() { showCursor = false; }, false);

canvas.addEventListener('mousedown', startDrawing, false);
canvas.addEventListener('mouseup', stopDrawing, false);
canvas.addEventListener('mousemove', draw, false);

canvas.addEventListener('touchstart', startDrawing, false);
canvas.addEventListener('touchend', stopDrawing, false);
canvas.addEventListener('touchmove', draw, false);

/* Helper functions */
function updateMousePosition(e) {
  var rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  if(isNaN(mouseX)) mouseX = e.touches[0].clientX - rect.left;
  if(isNaN(mouseY)) mouseY = e.touches[0].clientY - rect.top;
}

function pointInCircle(x, y, cx, cy, radius) {
  var distsq = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
  return distsq <= radius;
}

function degreesToRadian(d) {
  return d * Math.PI / 180;
}

function rotatePointAroundOrigin(ox, oy, px, py, theta) {
  return {
    x: Math.cos(theta) * (px - ox) - Math.sin(theta) * (py - oy) + ox,
    y: Math.sin(theta) * (px - ox) + Math.cos(theta) * (py - oy) + oy
  };
}
