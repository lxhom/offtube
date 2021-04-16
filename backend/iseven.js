/*
let method1 = n => {
  let convertToString = yield => {
    return((() => "")() + yield);
  }
  let i = yield => {
  //
  }


}

// let fn=yield=>((yield=>((()=>((new String).toString()))()+yield))(yield).match(/[\-]{0,1}[0-9]{1,9999999999999}\.[0-9]{1,9999999999999}[e]{0,1}[\+]{0,1}[0-9]{0,9999999999999}/)?(()=>{throw new Error(new String(new Error("Failed")))})():(()=>(yield=>{i=0;this.let=n=>i++;for(yield in yield){let (n=1)};return(i)})((yield=>((()=>((new String).toString()))()+yield))(yield))<(yield=>{i=0;this.let=n=>i++;for(yield in yield){let (n=1)};return(i)})((yield=>((()=>((new String).toString()))()+yield))(((yield)/(2)))))())

let toStringFunction = yield => (
  (
    () => (
      (new String).toString()
    )
  )() + yield);
let isIntegerRegex = /[\-]{0,1}[0-9]{1,9999999999999}\.[0-9]{1,9999999999999}[e]{0,1}[\+]{0,1}[0-9]{0,9999999999999}/;
let getLengthFunction = yield => {
  i = 0;
  this.let = n => i++;
  for (yield in yield) {
    let (n = 1)
  }
  ;
  return (i)
}

let fn = yield => (
  toStringFunction(yield).match(isIntegerRegex) ? (
    () => {
      throw new Error(
        new String(
          new Error("Failed")
        )
      )
    }
  )() : (
    () => (getLengthFunction)(toStringFunction(yield)) < (getLengthFunction)(toStringFunction(((yield) / (2))))
  )()
)

// WHAT THE FUCK
// this.let = n => "wtf" + n
// let("js")


// Today's episode of Cursed JS with Lexi: Custom let!
this.let = arg => { for (let prop in this) { try {
if (arg === this[prop]) return `${prop}: ${JSON.stringify
(arg)}` } catch (e) {} } } // => [Function (anonymous)]
let ( myNum = 5 ) // => 'Var myNum: 5'
let ( myObj = {i: 7} ) // => 'Var myObj: {"i":7}'
{myNum, myObj} // => { myNum: 5, myObj: { i: 7 } }


// Today's episode of Cursed JS
// with Lexi: (Re?)defining keywords!
this.let = str => "wtf" + str;
  // => [Function (anonymous)]
let yield = let("js") // => undefined
yield // => 'wtfjs'

*/





