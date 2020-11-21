'use strict';

/**
 * bind函数与Function.prototype.bind函数的作用一样，这里选择重写，是为了提高库的兼容性
 * bind函数的作用是返回一个新的函数（wrap），该函数内部真正执行的其实还是你传的第一个函数参数（fn），
 * 只不过fn函数中的this固定指向了第二个传参（thisArg）
 */
module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};
