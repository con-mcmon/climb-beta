function toPx(num) {
  return num + 'px';
}

function percentToPx(x, y, imageWidth, imageHeight) {
  return {
    x: (x / 100) * imageWidth,
    y: (y / 100) * imageHeight
  }
}

function pxToPercent(x, y, imageWidth, imageHeight) {
  return {
    x: (x / imageWidth) * 100,
    y: (y / imageHeight) * 100
  }
}

export { toPx, percentToPx, pxToPercent };
