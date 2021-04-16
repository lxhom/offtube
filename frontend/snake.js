let dims = [10, 10];
let snakePos = [Math.floor(10*Math.random()), Math.floor(10*Math.random())];
let applePos = [Math.floor(10*Math.random()), Math.floor(10*Math.random())];
let snake = [snakePos];
let direction = [0,0];
direction[Math.floor(2*Math.random())] = Math.floor(2*Math.random())*2-1
let len = 5;
let frame = () => {
  let newPart = JSON.parse(JSON.stringify(snake[0]))
  newPart.forEach((v, i, a) => {
    a[i] += direction[i]
    if (a[i] >= dims[i]) a[i]=0;
    if (a[i] < 0) a[i]=dims[i]-1;
  })
  snake = [newPart, ...snake];
  if (newPart[0] === applePos[0] && newPart[1] === applePos[1]) {
    len++;
    applePos = [Math.floor(dims[0]*Math.random()), Math.floor(dims[1]*Math.random())];
  }
  while (snake.length > len) {
    snake.pop()
  }
  if (newPart[0] !== applePos[0]) {
    direction = [1, 0]
  } else {
    direction = [0, 1]
  }
  let field = [];
  for (let i = 0; i < dims[0]; i++) {
    let row = [];
    for (let j = 0; j < dims[1]; j++) {
      row.push("∙")
    }
    field.push(row)
  }
  snake.forEach(part => field[part[0]][part[1]] = "s")
  field[applePos[0]][applePos[1]] = "o"
  let out = "\n\n"
  field.forEach(row => out += row.join("") + "\n")

  console.log(out)
}
setInterval(frame, 250)