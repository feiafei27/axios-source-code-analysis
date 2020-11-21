'use strict';

var utils = require('./utils');
var normalizeHeaderName = require('./helpers/normalizeHeaderName');

//默认的Content-Type类型
var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

//如果请求头中的Content-Type字段没有设置的情况下，设置该字段为指定的值
function setContentTypeIfUnset(headers, value) {
  //headers不是undefined，headers中的Content-Type是undefined的情况下,
  //设置请求头中的Content-Type值为value
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

//根据当前的环境返回相应的请求适配器
function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // 浏览器的环境下，返回'./adapters/xhr'请求适配器
    adapter = require('./adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // Node的环境下，返回'./adapters/http'请求适配器
    adapter = require('./adapters/http');
  }
  return adapter;
}

//主要的操作对象，最后会将这个对象暴露出去
var defaults = {
  //根据当前的环境返回默认的请求适配器
  adapter: getDefaultAdapter(),
  //请求data, headers类型转换函数数组
  //传入data和headers，对data和headers进行整形，返回data
  transformRequest: [function transformRequest(data, headers) {
    //对请求头中的headers名称进行规范化
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      // 判断是不是Node中的Stream
      utils.isStream(data) ||
      utils.isFile(data) ||
      // 判断是否是二进制
      utils.isBlob(data)
    ) {
      // 如果是以上类型的数据，直接 return，不用整形
      return data;
    }
    // 如果是二进制数组的视图，那么return该视图的buffer，也就是返回该实体的二进制数组
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    // 判断是不是 URLSearchParams 对象
    if (utils.isURLSearchParams(data)) {
      //将请求头的Content-Type设置为application/x-www-form-urlencoded;charset=utf-8;
      //这种编码方式的编码形式是 ‘k1=v1&k2=v2&k3=v3’;
      //URLSearchParams的 toString 方法返回的字符串也是 ‘k1=v1&k2=v2&k3=v3’ 这种形式的；
      //URLSearchParams的详细用法，可以百度；
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    //判断是否是对象类型
    if (utils.isObject(data)) {
      //将请求头的Content-Type设置为application/json;charset=utf-8;
      //这种编码方式的编码形式是 ‘{k1:v1,k2:v2,k3:v3,k4:v4}’;
      //使用JSON.stringify()方法，将对象转换成json字符串
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],
  //响应转换函数列表
  transformResponse: [function transformResponse(data) {
    //如果传入的data是string类型的话，尝试转换成json。如果转换成败的话，也不进行额外的处理，直接返回传入的data
    //如果传入的data不是string类型的话，直接return.
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  //xsrf攻击的详细信息，可查看：https://www.jianshu.com/p/0e52c58cf93f
  //博客中与本库有关的部分是：
  //Token解决方案：将服务端动态生成的 Token 加入到自定义 http 请求头参数中
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  //判断相应是否成功的依据函数，默认情况是响应的状态 status >= 200 && status < 300 时，则判定该响应成功.
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

// defaults.headers中的内容
// defaults.headers = {
//   common: {
//     'Accept': 'application/json, text/plain, */*'
//   },
//   delete:{},
//   get:{},
//   head:{},
//   post:{
//     'Content-Type': 'application/x-www-form-urlencoded'
//   },
//   put:{
//     'Content-Type': 'application/x-www-form-urlencoded'
//   },
//   patch:{
//     'Content-Type': 'application/x-www-form-urlencoded'
//   }
// };

//对外暴露defaults对象
module.exports = defaults;
