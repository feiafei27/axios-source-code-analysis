'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

//为这个函数生成的对象添加一个标识性的属性
//供 isCancel 函数使用
Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;
