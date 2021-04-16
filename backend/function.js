let size = [0, 0]; let width, height;
function setSize() {
  let u = undefined; // alias for shorter code
  if (width !== u) { size[0] = width; width = u; }
  if (height !== u) { size[1] = height; height = u; }
  console.log(`Size set to ${size[0]}x${size[1]}`);
}
setSize(width=5, height=7); // logs 'Size set to 5x7'
setSize(height=1, width=3); // logs 'Size set to 3x1'
setSize(height=4)           // logs 'Size set to 3x4'
setSize(width=5)            // logs 'Size set to 5x4'
setSize()                   // logs 'Size set to 5x4'
