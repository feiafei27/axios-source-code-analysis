'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
//函数作用是判断url是不是绝对的URL，所谓的绝对的URL和我们平时说的绝对路径是一样的，无论你当前所在的位置，你都能通过绝对的URL找到目标资源
//与绝对URL相对应的是相对URL，相对URL是根据你当前的位置，进而推导出目标资源的位置
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};
