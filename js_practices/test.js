const MyPromise = require('./MyPromise')

const promise = new MyPromise((resolve, reject) => {
  let value = 1;
  setTimeout(() => {
    value = 2
    resolve(value)
  }, 1000)
}).then(res => {
  console.log('asynchronously finished',res)
  return 3;
}).then(res => {
  console.log('second promise', res)
  return new MyPromise((resolve) => {
    setTimeout(() => {
      resolve(4)
    }, 1000)
  })
}).then(res => {
  console.log('third promise', res)
})