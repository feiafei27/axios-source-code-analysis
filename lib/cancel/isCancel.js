'use strict';
//判断对象是不是通过 new Cancel() 生成的
module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};
