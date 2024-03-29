function painter(canvas) {
  canvas.height = Math.min(
    500,
    window.innerHeight - (200 + (window.innerHeight % 20))
  );
  canvas.width = Math.min(700, window.innerWidth * 0.95);
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.graphUtil = new graphUtility();
  this.clearing = true;
  this.isLogPolar = false;
}

function graphUtility() {}

graphUtility.prototype.convertToCartesian = function (data, canvas) {
  cartesian = new Array(canvas.width);
  for (var i = 0; i < canvas.width; i += 1) {
    cartesian[i] = new Array(canvas.height);
  }
  var d = 0;
  for (var y = 0; y < canvas.height; y += 1) {
    for (var x = 0; x < canvas.width; x += 1) {
      cartesian[x][y] = new Array(4);
      cartesian[x][y][0] = data[d];
      cartesian[x][y][1] = data[d + 1];
      cartesian[x][y][2] = data[d + 2];
      cartesian[x][y][3] = data[d + 3];
      d += 4;
    }
  }
  return cartesian;
};

graphUtility.prototype.convertToImageData = function (cartesian, canvas) {
  var data = new Array();
  for (var y = 0; y < canvas.height; y += 1) {
    for (var x = 0; x < canvas.width; x += 1) {
      for (var i = 0; i < cartesian[x][y].length; i += 1) {
        data.push(cartesian[x][y][i]);
      }
    }
  }
  return data;
};

painter.prototype.animate = function () {
  this.animating = !this.animating;
  if (this.clearing) return;
  this.clearing = true;
  this.drawImage();
};

painter.prototype.getImageUrl = function () {
  const select = document.getElementById('select');
  switch (select.value) {
    case '1':
      return 'diamond.jpg';
    case '2':
      return 'japanese-pattern.png';
    case '3':
      return 'pattern.png';
    case '4':
    // Fall-through to default.
    default:
      return 'stripes.jpg';
  }
};

painter.prototype.drawImage = function () {
  if (!this.clearing) return;
  this.clearing = false;
  var img = new Image();
  img.src = this.getImageUrl();
  console.log('image', img.src);
  img.crossOrigin = 'anonymous';
  img.onload = function () {
    this.canvas.width = img.naturalWidth;
    this.canvas.height = img.naturalHeight;
    this.ctx.drawImage(img, 0, 0);
    img.style.display = 'none';
    if (this.isLogPolar) {
      var imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      var d = imageData.data;
      newData = this.logPolar(d);
      for (var i = 0; i < d.length; i += 4) {
        d[i] = newData[i];
        d[i + 1] = newData[i + 1];
        d[i + 2] = newData[i + 2];
        d[i + 3] = newData[i + 3];
      }
      this.ctx.putImageData(imageData, 0, 0);
    }
  }.bind(this);
};

painter.prototype.clear = function () {
  var imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
  d = imageData.data;
  for (var i = 0; i < d.length; i += 4) {
    d[i + 3] = 0;
  }
  this.ctx.putImageData(imageData, 0, 0);
};

painter.prototype.setClear = function () {
  this.clearing = true;
  this.clear();
};

painter.prototype.setLogPolar = function () {
  this.isLogPolar = !this.isLogPolar;
  if (this.clearing) return;
  this.clearing = true;
  this.drawImage();
};

painter.prototype.logPolar = function (data) {
  var d = data;
  var cartesianField = this.graphUtil.convertToCartesian(d, this.canvas);
  var newField = new Array(canvas.width);
  for (var i = 0; i < canvas.width; i += 1) {
    newField[i] = new Array(canvas.height);
    for (var j = 0; j < canvas.height; j += 1) {
      newField[i][j] = new Array(4);
    }
  }
  var midX = Math.floor(canvas.width / 2);
  var midY = Math.floor(canvas.height / 2);
  for (var i = 0; i < canvas.height; i += 1) {
    for (var j = 0; j < canvas.width; j += 1) {
      var r = Math.sqrt(Math.pow(j - midX, 2) + Math.pow(i - midY, 2));
      var theta = Math.atan((i - midY) / (j - midX));
      if (isNaN(theta)) continue;
      if (j < midX) theta += Math.PI;
      if (theta < 0) theta += 2 * Math.PI;
      var y = Math.round(theta * ((canvas.height - 1) / (2 * Math.PI)));
      var xScale =
        (canvas.width - 1) /
        Math.log(
          Math.sqrt(Math.pow(canvas.height, 2) + Math.pow(canvas.width, 2)) / 2
        );
      var x = Math.round(xScale * Math.log(r));
      for (var w = 0; w < newField[j][i].length; w++) {
        newField[j][i][w] = cartesianField[x][y][w];
      }
    }
  }
  return this.graphUtil.convertToImageData(newField, this.canvas);
};

canvas = document.getElementById('canvas');
myPainter = new painter(canvas);
var drawbtn = document.getElementById('drawbtn');
drawbtn.addEventListener('click', myPainter.drawImage.bind(myPainter));
var clearbtn = document.getElementById('clearbtn');
clearbtn.addEventListener('click', myPainter.setClear.bind(myPainter));
var logpolarbtn = document.getElementById('logpolarbtn');
logpolarbtn.addEventListener('click', myPainter.setLogPolar.bind(myPainter));

function downloadCanvas(link, canvasId, filename) {
  link.href = document.getElementById(canvasId).toDataURL();
  link.download = filename;
}

document.getElementById('download').addEventListener(
  'click',
  function () {
    downloadCanvas(this, 'canvas', 'canvas-download.png');
  },
  false
);
