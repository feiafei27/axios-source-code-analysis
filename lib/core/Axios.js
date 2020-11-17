'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  //过滤器对象
  this.interceptors = {
    //请求过滤器对象
    request: new InterceptorManager(),
    //响应过滤器对象
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  // request有两种使用方法：
  // 1: axios(config)
  // 2: axios(url[, config])
  // 下面的代码对配置进行统一化的处理,处理完成的配置都是{url:'xxx',...}形式的了。
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  //将每次发请求个性化的配置和默认配置进行合并
  config = mergeConfig(this.defaults, config);

  // Set config.method
  //对方法的处理
  if (config.method) {
    //将请求方法都规范成小写
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    //如果没有指定方法，而defaults中有默认的方法，就使用该方法
    config.method = this.defaults.method.toLowerCase();
  } else {
    //如果以上情况都没有指定方法，就是用 get
    config.method = 'get';
  }

  // Hook up interceptors middleware
  //对过滤器功能的处理，chain是过滤器函数的数组，过滤器就是一个个函数，
  //两个函数一组，一个是成功的函数，一个是失败的函数
  //dispatchRequest是处理实际请求的函数，他也在过滤器函数中，
  var chain = [dispatchRequest, undefined];

  //下面两处代码把请求的过滤器函数和响应的过滤器函数遍历添加到chain数组中
  //添加完最终的效果如下：
  //[
  // request[1].success,request[1].fail,request[0].success,request[0].fail,
  // dispatchRequest, undefined,
  // response[0].success,response[0].fail,response[1].success,response[1].fail
  //]
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  //下面就是最为精髓的地方了，通过一个promise链，串联起 请求过滤器，请求处理函数，响应过滤器
  //首先创建一个成功的promise，且value是config
  var promise = Promise.resolve(config);

  // 1.首先是请求的过滤器函数,请求过滤器函数的特点是传参是config，返回也是config，由于promise的特点，
  // 返回的config会被包装成成功的promise，
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

//通过Axios生成的对象有defaults,interceptors两个属性，
//通过Axios生成的对象原型链上有'request','getUri','delete', 'get', 'head', 'options','post', 'put', 'patch'等一系列方法

module.exports = Axios;
