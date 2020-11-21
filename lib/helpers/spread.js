'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
//作用是配合axios.all一起使用，例如：
//axios.all([getUserAccount(), getUserPermissions()])
//   .then(axios.spread(function (acct, perms) {
//     // 两个请求现在都执行完成
//   }));
//理解要点如下：
//callback是一个有多个参数的函数
//spread()返回一个函数（wrap）,该返回的函数作为.then()函数的第一个参数,
//当wrap函数被.then回调执行时，会被传入结果数组，在wrap函数的内部，将该结果数组的元素作为参数回调执行回调函数（callback）
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};
