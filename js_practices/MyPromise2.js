/**
 * step1: use an array to store handlers to support asynchronous execution
 * step2: return a new promise instance in then method to support chaining
 * step3: when chaining, you can return a pomise instance or just value
 * 
 * step 4: modification: 
 *    a: remove duplicated if-else
 *    b: transfer the 'then' judgement into one function
 */
module.exports = class MyPromise {
  constructor(handler) {
    this.status = 'PENDING'
    this.value = undefined
    this.handlers = []

    this.resolveHandlers = [] // store handlers to support asynchronous execution
    this.rejectHandlers = []

    this.handle = (handler) => {
      if(this.status === 'PENDING') {
        this.handlers.push(handler)
      } else if(this.status === 'FULLFILLED') {
        handler.onFullfilled(this.value)
      } else if(this.status === 'REJECTED') {
        handler.onRejected(this.value)
      }
    }

    const getThen(value) {
      if(typeof value === 'object' || typeof value === 'function') {
        const then = value.then
        if(typeof then === 'function') {
          return then
        } 
      } 
      return null
    }


    const resolve = (value) => {
      this.status = 'FULLFILLED'
      this.value = value
      this.handlers.forEach(this.handle)
    }

    const reject = (reason) => {
      this.status = 'REJECTED'
      this.value = reason
      this.handlers.forEach(this.handle)
    }

    try {
      handler(resolve, reject)
    } catch(reason) {
      reject(reason) // *** remember handling errors
    }
  }

  then(onFullfilled, onRejected) {
    const _this = this;
    return new MyPromise((resolve, reject) => { // return a promise instance to support chaining
      const fullFilledHandler = (value) => {
        try {
          resolve(onFullfilled(value))
        } catch (reason) {
          reject(reason)
        }
      }

      const rejectedHandler = (value) => {
        try {
          resolve(onRejected(value))
        } catch (reason) {
          reject(reason)
        }
      }

      _this.handle({ onFullfilled: fullFilledHandler, onRejected: rejectedHandler })


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