/**
 * step1: use an array to store handlers to support asynchronous execution
 * step2: return a new promise instance in then method to support chaining
 * step3: when chaining, you can return a pomise instance or just value
 */
module.exports = class MyPromise {
  constructor(handler) {
    this.status = 'PENDING'
    this.value = undefined
    this.resolveHandlers = [] // store handlers to support asynchronous execution
    this.rejectHandlers = []

    const resolve = (value) => {
      this.status = 'FULLFILLED'
      this.value = value
      this.resolveHandlers.forEach(fn => fn(this.value))
    }

    const reject = (error) => {
      this.status = 'REJECTED'
      this.value = error
      this.rejectHandlers.forEach(fn => fn(this.value))
    }

    try {
      handler(resolve, reject)
    } catch(e) {
      reject(e) // *** remember handling errors
    }
  }

  then(onFullfilled, onRejected) {
    return new MyPromise((resolve, reject) => { // return a promise instance to support chaining
      if(this.status === 'PENDING') {
        this.resolveHandlers.push((value) => {
          try {
            const fullfilledFromLastPromise = onFullfilled(value)
            if(fullfilledFromLastPromise instanceof MyPromise) {
              fullfilledFromLastPromise.then(resolve, reject)
            } else {
              resolve(fullfilledFromLastPromise)
            }
          } catch(e) {
            reject(e)
          }
        })

        onRejected && this.rejectHandlers.push((value) => {
          try {
            const rejectedFromLastPromise = onRejected(value)
            if(rejectedFromLastPromise instanceof MyPromise) {
              rejectedFromLastPromise.then((resolve, reject))
            } else {
              reject(rejectedFromLastPromise)
            }
          } catch(e) {
            reject(e)
          }
        })
      }

      // if the the promise is already resolved or rejected, 
      // run the handler immediately
      if(this.status === 'FULLFILLED') {
        try {
          const fullfilledFromLastPromise = onFullfilled(this.value)
          if(fullfilledFromLastPromise instanceof MyPromise) {
            fullfilledFromLastPromise.then(resolve, reject)
          } else {
            resolve(fullfilledFromLastPromise)
          }
        } catch(e) {
          reject(e)
        }
      }

      if(onRejected && this.status === 'REJECTED') {
        try {
          const rejectedFromLastPromise =  onRejected(this.value)
          if(rejectedFromLastPromise instanceof MyPromise) {
            rejectedFromLastPromise.then(resolve, reject)
          } else {
            reject(rejectedFromLastPromise)
          }
        } catch(e) {
          reject(e)
        }
      }
    })
  }
}