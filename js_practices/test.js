const MyPromise = require('./MyPromise2')

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
  return res;
})

const promise2 = 66

const promise3 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(88)
  }, 5500)
})

MyPromise.all([promise, promise2, promise3]).then(value => {
    console.log(value)
  }).catch(reason => {
    console.log(reason)
  })