'use strict';

var isAbsoluteURL = require('../helpers/isAbsoluteURL');
var combineURLs = require('../helpers/combineURLs');

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
//该函数的用法是这样的：var fullPath = buildFullPath(config.baseURL, config.url);
//就是将config.baseURL和config.url拼接起来
module.exports = function buildFullPath(baseURL, requestedURL) {
  //当用户配置了baseURL，且requestedURL不是绝对URL的时候
  //使用combineURLs对两者进行拼接
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  //否则直接return requestedURL
  return requestedURL;
};
