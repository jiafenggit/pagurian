/*
 * @fileOverview Service 模块,提供为api提供ajax方法
 * @author <a href="http://www.guoxiaoming.com">simon guo</a>
 * @version 0.1
 *
 */
define(function(require, exports, module) {

    function arrayToObject(arr) {
        var obj = {};
        for (var i = 0; i < arr.length; i++) {

            //把"带有."的属性名转化为对象
            var a = arr[i]['name'].split(".");

            _value = arr[i]['value'];

            if (typeof _value === "string") {
                _value = $.trim(_value);
            }

            if (a.length > 1) {
                obj[a[0]] = {};
                obj[a[0]][a[1]] = _value;
                continue;
            }

            obj[arr[i]['name']] = _value;
        }
        return obj;
    }


    var ajax = {

        options: {
            data: []
        },
        init: function(params) {

            this.options.data = [];
            if (Object.prototype.toString.call(params) == "[object Array]") {
                for (var i = 0; i < params.length; i++) {
                    params[i].value = encodeURIComponent(params[i].value);
                    this.options.data.push(params[i]);
                }
            } else {
                for (var i in params) {
                    if (typeof params[i] === "function") {
                        continue;
                    }

                    //如果是一个数组的，就设置多个值
                    if (typeof params[i] === "object") {
                        for (var j = 0; j < params[i].length; j++) {
                            this.options.data.push({
                                "name": i,
                                "value": encodeURIComponent(params[i][j])
                            });
                        }
                        continue;
                    }

                    this.options.data.push({
                        name: i,
                        value: encodeURIComponent(params[i])
                    });
                }
            }

            /*this.options.data.push({
                name: "_",
                value: '_' + (Math.random() * 1E18).toString(36).slice(0, 5).toUpperCase()
            });
            */

            return this;

        },
        send: function(type, url, params, callback) {

            var data = [];

            if (type === "get") {
                this.init(params);
                data = this.options.data;
            } else if (type == "post" || type == "put" || type == "patch") {
                data = $.toJSON({
                    data: arrayToObject(params)
                });
            }

            $.ajax({
                url: pagurian.path.api + url + ".json",
                type: type || "get",
                dataType: "json",
                data: data,
                timeout: 20000,
                contentType: 'application/json',
                success: function(data, textStatus, jqXHR) {
                    if ("function" == typeof callback) {
                        callback(data, textStatus, jqXHR);
                    };
                },
                error: function(jqXHR, textStatus, errorThrown) {

                    //TODO: 处理status， http status code，超时 408
                    //注意：如果发生了错误，错误信息（第二个参数）除了得到null之外，还可能 
                    //是"timeout", "error", "notmodified" 和 "parsererror"
                    //alert(textStatus + ":" + XMLHttpRequest.status);

                    var data = {
                        error: true
                    };
                    for (var v in jqXHR) {
                        if (typeof jqXHR[v] !== "function") {
                            data[v] = jqXHR[v];
                        }
                    }
                    if ("function" == typeof callback) {
                        callback({
                            code: jqXHR.status,
                            result: data
                        });
                    }
                }

            });

            return this;

        },
        request: function(type, url, params, callback) {

            this.send(type, url, params, callback);
            return this;
        }
    };

    module.exports = ajax;

});