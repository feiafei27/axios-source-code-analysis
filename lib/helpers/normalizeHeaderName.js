'use strict';

var utils = require('../utils');

//规范请求头中指定的Name
module.exports = function normalizeHeaderName(headers, normalizedName) {
  //遍历请求头对象
  utils.forEach(headers, function processHeader(value, name) {
    // 'Content-Type'和'content-type',这种情况的话，
    // 就将'content-type'删除，添加'Content-Type'，value不变
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};
