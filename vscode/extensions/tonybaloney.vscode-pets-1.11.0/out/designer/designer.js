"use strict";
var img = new Image();
img.crossOrigin = 'anonymous';
img.src = '../media/dog/black_idle_8fps.gif';
var canvas = document.getElementById('canvas');
var newCanvas = document.getElementById('new-canvas');
var ctx = canvas.getContext('2d');
var newCtx = newCanvas.getContext('2d');
class RGB {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}
class Substitution {
    constructor(original, new_) {
        this.original = original;
        this.new = new_;
    }
}
var substitutions = new Array();
img.onload = function () {
    ctx.drawImage(img, 0, 0);
    img.style.display = 'none';
    newCtx.drawImage(img, 0, 0);
    var uniqueColors = new Array();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var found = false;
        for (var j = 0; j < uniqueColors.length; j++) {
            if (uniqueColors[j].r === data[i] &&
                uniqueColors[j].g === data[i + 1] &&
                uniqueColors[j].b === data[i + 2]) {
                found = true;
                break;
            }
        }
        if (!found) {
            uniqueColors.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
        }
    }
    var subList = document.getElementById('substitutions-list');
    for (var i = 0; i < uniqueColors.length; i++) {
        var color = uniqueColors[i];
        var li = document.createElement('li');
        var original = document.createElement('div');
        original.style.backgroundColor = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        var newColor = document.createElement('input');
        newColor.type = 'color';
        newColor.value = rgbToHex(color.r, color.g, color.b);
        li.appendChild(original);
        li.appendChild(newColor);
        subList.appendChild(li);
        substitutions.push({ original: color, new: color });
    }
    drawImage();
};
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
const addSubstitutionButton = document.getElementById('add-substitution');
function drawImage() {
    var newCtx = newCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        for (var j = 0; j < substitutions.length; j++) {
            if (substitutions[j].original.r == data[i] &&
                substitutions[j].original.g == data[i + 1] &&
                substitutions[j].original.b == data[i + 2]) {
                data[i] = substitutions[j].new.r; // red
                data[i + 1] = substitutions[j].new.g; // green
                data[i + 2] = substitutions[j].new.b; // blue
            }
        }
    }
    newCtx.putImageData(imageData, 0, 0);
}
//# sourceMappingURL=designer.js.map