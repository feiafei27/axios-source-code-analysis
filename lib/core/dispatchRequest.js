'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  // 对data和headers进行整形
  // 因为data中数据的编码类型要和headers中的Content-Type相对应，所以所以这里放在一起处理
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // 合并请求头信息，请求头信息的来源有三处：
  // 1：所有请求方法都需要当上的header信息
  // config.headers.common || {},
  // 2：特定请求方法需要带上的header信息
  // config.headers[config.method] || {},
  // 3：config.headers既包含我们传入的自定义的headers，也包含各个请求方法所对应的headers请求对象
  // config.headers
  config.headers = utils.merge(
    //所有请求方法都需要当上的header信息
    config.headers.common || {},
    //特定请求方法需要带上的header信息
    config.headers[config.method] || {},
    //config.headers既包含我们传入的自定义的headers，也包含各个请求方法所对应的headers请求对象
    config.headers
  );

  //由于config.headers包含各个请求方法所对应的headers请求对象，这些数据是多余的，要删除掉
  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  //获取实际发请求的adapter对象，我们也可以自己自定义adapter，只要我们自定义的config中有adapter这个请求方法就可以了，
  //如果我们没有写自定义的adapter的话，那就用默认的当前环境的adapter
  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    //请求成功返回了，在这里再检查一下是否执行了取消操作，如果有取消操作的话，直接抛出错误，不再执行下面的操作
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  },
  function onAdapterRejection(reason) {
    //判断adapter执行，其中的promise,reject的原因
    //如果reject的原因是取消请求所造成的话，直接return Promise.reject(reason);
    //如果reject的原因不是取消请求所造成的，是onerror，ontimeout所造成的话，return Promise.reject(reason);
    //之前，还是要判断一下我们有没有执行取消操作，如果执行了的话，就抛出Cancel的操作，
    // 这里我们能够看到，取消的优先级大于onerror，ontimeout
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};
