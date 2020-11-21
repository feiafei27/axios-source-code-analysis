'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  //关键代码,和xhr.js中的config.cancelToken.promise相对应
  this.promise = new Promise(function promiseExecutor(resolve) {
    //将resolve函数放到外面
    resolvePromise = resolve;
  });

  //this 指向的是 config.cancelToken对象
  var token = this;
  //执行传入的回调函数，将能够取消请求的函数作为参数传递进去，这样外部就可以拿到这个函数了
  //例如官方文档的例子：
  // const CancelToken = axios.CancelToken;
  // let cancel;
  //
  // axios.get('/user/12345', {
  //   cancelToken: new CancelToken(function executor(c) {
  //     // executor 函数接收一个 cancel 函数作为参数
  //     cancel = c;
  //   })
  // });
  //
  // cancel the request
  // cancel();
  executor(function cancel(message) {
    //如果config.cancelToken对象有reason这个属性的话，直接return，因为此时已经取消请求了，没必要再执行一遍
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    //如果config.cancelToken对象没有reason这个属性的话，那就为其添加这个属性。以此作为请求已经取消的标记。
    token.reason = new Cancel(message);
    //将config.cancelToken.promise这个promise的状态设置为成功，并且值为token.reason
    //这样的话xhr.js代码中的config.cancelToken.promise便会执行它的.then()函数,
    //执行成功的回调（onCanceled方法）,在这个方法中,回调用request.abort()，取消请求。
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  //如果这一个请求已经取消了的话，直接抛出错误，终止相关的行为
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    //c是能够取消请求的函数，在这里赋值给cancel
    cancel = c;
  });
  return {
    //CancelToken对象
    token: token,
    //能够取消请求的函数
    cancel: cancel
  };
};

module.exports = CancelToken;
