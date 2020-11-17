'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  //context可以理解成上下文
  //context对象有defaults,interceptors两个属性，
  //context对象原型链上有'request','getUri','delete', 'get', 'head', 'options','post', 'put', 'patch'等一系列方法
  var context = new Axios(defaultConfig);

  // bind函数
  // function bind(fn, thisArg) {
  //   return function wrap() {
  //     var args = new Array(arguments.length);
  //     for (var i = 0; i < args.length; i++) {
  //       args[i] = arguments[i];
  //     }
  //     return fn.apply(thisArg, args);
  //   };
  // };
  //instance就是该库最终导出的axios，instance是一个函数，
  //该函数就是上面bind函数返回的wrap函数。执行instance函数，最终底层执行的函数是Axios.prototype.request函数，
  //并且Axios.prototype.request执行中的this指向的是上面的context对象,参数是你执行instance函数时传入的参数
  //此时我们可以像下面这样执行axios发请求了：
  // 发送 POST 请求
  // axios({
  //   method: 'post',
  //   url: '/user/12345',
  //   data: {
  //     firstName: 'Fred',
  //     lastName: 'Flintstone'
  //   }
  // });
  var instance = bind(Axios.prototype.request, context);

  // function extend(a, b, thisArg) {
  //   forEach(b, function assignValue(val, key) {
  //     //绑定方法
  //     if (thisArg && typeof val === 'function') {
  //       a[key] = bind(val, thisArg);
  //       //绑定属性
  //     } else {
  //       a[key] = val;
  //     }
  //   });
  //   return a;
  // }
  //将Axios.prototype中的方法绑定到instance上面,并且方法中的this指向context（默认的上下文）
  //通过绑定方法，我们可以像下面这样执行axios发请求了：
  // axios.get('/user?ID=12345')
  // axios.get('/user', {
  //   params: {
  //     ID: 12345
  //   }
  // })
  // axios.post('/user', {
  //   firstName: 'Fred',
  //   lastName: 'Flintstone'
  // })
  utils.extend(instance, Axios.prototype, context);

  // 将context中的defaults,interceptors属性绑定到instance上面
  // 通过绑定属性，我们可以像下面这样使用拦截器了：
  // axios.interceptors.request.use(function (config) {
  //   // 在发送请求之前做些什么
  //   return config;
  // }, function (error) {
  //   // 对请求错误做些什么
  //   return Promise.reject(error);
  // });
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
//能够创建一个新的instance，他基于新的配置（上下文对象），
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
//为该库导出的axios添加一些方法，这些方法在我们通过create函数生成的instance中并不存在
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
// 对Promise.all()的简单封装
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
