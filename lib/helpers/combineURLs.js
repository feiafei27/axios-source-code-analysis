'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  // 如果relativeURL是undefined的话，直接返回baseURL，否则
  // 先将baseURL结尾处的'/'和relativeURL开头处的'/'符号去除掉，然后再用一个'/'将两者拼接起来
  // 例如baseURL = http://127.0.0.1/main/,relativeURL = /posts/detail，则拼接完成的
  // 完整的路由为 http://127.0.0.1/main/posts/detail
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};
