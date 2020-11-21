'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */

/**
 * buildURL的作用：Build a URL by appending params to the end
 * url参数：例如 http://127.0.0.1:80/index/post
 * params参数：例如
 * {
      name:"tom",
      age:20
   }
 * paramsSerializer：我们可以通过config.paramsSerializer自定义序列化函数，作用是将对象形式的params，
 * 转换成字符串形式，以便拼接到url后面，一般转换成"name=tom&age=20"这种形式，不过我们也可以自定义paramsSerializer
 * 进行个性化的转换。
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  //如果没有传参的话，直接return url
  if (!params) {
    return url;
  }

  var serializedParams;
  //如果我们自定义了paramsSerializer函数，那就使用这个函数进行params的转换
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  //如果没有自定义paramsSerializer函数，但params是URLSearchParams类型的对象的话,
  //直接toString，URLSearchParams的用法可以百度
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  //如果以上都不满足的话，那就手动的将params对象拼接成"k1=v1&k2=v2"这种形式
  } else {
    var parts = [];

    //对参数对象进行遍历
    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      //因为有可能出现params对象值是数组的情况，如果是数组的话，后面参数的形式就是"names=tom&names=jack&names=alice"
      //这种形式，也就是key是一样的。为了下面的代码能够进行统一化的处理，如果值不是数组的话，
      // 我们将其转换成单个元素的数组（val = [val]）
      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      //对值数组进行遍历，每次都往parts中push
      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    //使用'&'字符，将字符串数组元素拼接起来
    serializedParams = parts.join('&');
  }

  //如果 serializedParams 不是undefined的话，将其拼接到url后面
  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      //取url中'#'字符前面的部分
      url = url.slice(0, hashmarkIndex);
    }

    //首先判断url中有没有'?'字符
    //如果有的话，假设形式为 http://127.0.0.1:80/index?xxxx=xxxx，这种情况需要先在后面加一个'&'字符，然后再拼接上serializedParams
    //如果没有的话，假设形式为 http://127.0.0.1:80/index，这种情况需要先在后面加一个'?'字符，然后再拼接上serializedParams
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  //return 拼接完成的url
  return url;
};
