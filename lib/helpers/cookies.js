'use strict';

var utils = require('./../utils');

module.exports = (
  //判断是不是标准的浏览器环境，标准的浏览器环境支持cookie
  utils.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      //document.cookie的详细使用可以看这篇博客 https://www.cnblogs.com/PopularProdigal/p/7495226.html
      return {
        write: function write(name, value, expires, path, domain, secure) {
          //字符串数组,元素的形式是'key=value'
          var cookie = [];
          //依次向cookie数组中添加元素。
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },
        //读取指定名称的cookie值
        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },
        //移除cookie的方法就是让这个cookie过期，重写该cookie的过期时间即可。
        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })():

    // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);
