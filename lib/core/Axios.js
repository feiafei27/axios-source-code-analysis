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
  //默认配置对象
  this.defaults = instanceConfig;
  //拦截器管理对象
  this.interceptors = {
    //请求拦截器管理对象
    request: new InterceptorManager(),
    //响应拦截器管理对象
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
    //如果没有指定方法，而defaults中有默认的方法，就使用该方法作为请求的方法
    config.method = this.defaults.method.toLowerCase();
  } else {
    //如果以上情况都没有指定方法，就默认使用get
    config.method = 'get';
  }

  // Hook up interceptors middleware
  //对拦截器功能的处理，chain是拦截器函数的数组，拦截器就是一个个函数，
  //两个函数一组，一个是成功的函数，一个是失败的函数
  //dispatchRequest是处理实际请求的函数，他也在chain中，
  var chain = [dispatchRequest, undefined];

  //下面两处代码把请求的拦截器函数和响应的拦截器函数遍历添加到chain数组中
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

  //下面就是最为精髓的地方了，通过一个promise链，串联起 请求拦截器，请求处理函数，响应拦截器
  //首先创建一个成功的promise，且value是config配置对象
  var promise = Promise.resolve(config);

  // 1.首先是请求拦截器函数,请求拦截器函数的特点是传参是config，返回也是config，由于promise的特点，
  // 返回的config会被包装成成功的promise，以便执行下一个.then,下一个.then又会执行下一个请求拦截器函数，
  // 直至执行到请求处理函数，也就是 dispatchRequest
  // 2.当promise执行到 dispatchRequest 的时候，该函数的参数是上一个请求拦截器返回的config，该函数会获取指定的adapter，
  // adapter可能是lib/adapters/http.js或者lib/adapters/xhr.js或者是我们自定义的请求函数。将config传入adapter函数，
  // 执行真正的http请求。
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

//根据配置获取请求的url
Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
//添加指定请求方法对应的函数，是对request函数的一层封装.
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

//同上
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

//通过Axios生成的对象(new Axios())有defaults,interceptors两个属性，
//通过Axios生成的对象(new Axios())原型链上有'request','getUri','delete', 'get', 'head', 'options','post', 'put', 'patch'等一系列方法

module.exports = Axios;
