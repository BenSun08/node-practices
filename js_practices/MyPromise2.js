/**
 * step1: use an array to store handlers to support asynchronous execution
 * step2: return a new promise instance in then method to support chaining
 * step3: when chaining, you can return a pomise instance or just value
 * 
 * step 4: modification: 
 *    a: remove duplicated if-else, which used to judge the Promise status
 *    b: transfer the 'then' judgement into one function, 
 *       make the resolve function can accept Promise instance as parameter
 */
module.exports = class MyPromise {
  constructor(handler) {
    this.status = 'PENDING'
    this.value = undefined
    this.handlers = []

    this.handle = (handler) => {
      if(this.status === 'PENDING') {
        this.handlers.push(handler)
      } else if(this.status === 'FULLFILLED') {
        handler.onFullfilled(this.value)
      } else if(this.status === 'REJECTED') {
        handler.onRejected(this.value)
      }
    }

    const getThen = (value) => {
      if(typeof value === 'object' || typeof value === 'function') {
        const then = value.then
        if(typeof then === 'function') {
          return then
        } 
      } 
      return null
    }



    const fullfill = (value) => {
      this.status = 'FULLFILLED'
      this.value = value
      this.handlers.forEach(this.handle)
    }

    const reject = (reason) => {
      this.status = 'REJECTED'
      this.value = reason
      this.handlers.forEach(this.handle)
    }

    const doResolve = (fn, onResolved, onRejected) => {
      let done = false  // to make sure onResolved and onRejected only call once,
                        // like the case in the static method: all()
      try {
        fn(value => {
          if(done) return
          done = true
          onResolved(value)
        }, reason => {
          if(done) return
          done = true
          onRejected(reason)
        })
      } catch (reason) {
        onRejected(reason)
      }
    }

    const resolve = (value) => {
      try {
        const then = getThen(value)
          if(then) {
          doResolve(then.bind(value), resolve, reject)
          return
        }
        fullfill(value)
      } catch (reason) {
        reject(reason)
      }
    }

    doResolve(handler, resolve, reject)
  }

  static resolve(value) {
    return new MyPromise((resolve, reject) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(value)
    })
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      try {
        const len = promises.length
        let fullfilledCount = 0
        const fullfilledVals = new Array(len)
        for(let i = 0; i < len; i++) {
          MyPromise.resolve(promises[i]).then(val => {
            fullfilledCount++
            fullfilledVals[i] = val
            if(fullfilledCount === len) {
              resolve(fullfilledVals)
            }
          }).catch(reason => {
            reject(reason)
          })
        }
      } catch(reason) {
        reject(reason)
      }
    })
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
    })
  }

  catch(onRejected) {
    this.then(() => {}, onRejected)
  }
}