// src/index.ts
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var ConfigManager = /*#__PURE__*/ function() {
    "use strict";
    function ConfigManager() {
        _class_call_check(this, ConfigManager);
        _define_property(this, "globalConfig", {});
    }
    _create_class(ConfigManager, [
        {
            key: "setGlobalConfig",
            value: function setGlobalConfig(config) {
                this.globalConfig = _object_spread({}, this.globalConfig, config);
            }
        },
        {
            key: "getGlobalConfig",
            value: function getGlobalConfig() {
                return this.globalConfig;
            }
        },
        {
            key: "resetGlobalConfig",
            value: function resetGlobalConfig() {
                this.globalConfig = {};
            }
        }
    ], [
        {
            key: "getInstance",
            value: function getInstance() {
                if (!ConfigManager.instance) {
                    ConfigManager.instance = new ConfigManager();
                }
                return ConfigManager.instance;
            }
        }
    ]);
    return ConfigManager;
}();
_define_property(ConfigManager, "instance", void 0);
var FetchBuilder = /*#__PURE__*/ function() {
    "use strict";
    function FetchBuilder() {
        _class_call_check(this, FetchBuilder);
        _define_property(this, "config", {
            url: "",
            method: "GET",
            headers: {},
            responseType: "json",
            maxRetries: 3,
            retryDelay: 1000
        });
        _define_property(this, "requestInterceptors", []);
        _define_property(this, "responseInterceptors", []);
    }
    _create_class(FetchBuilder, [
        {
            key: "getEffectiveConfig",
            value: function getEffectiveConfig() {
                var globalConfig = ConfigManager.getInstance().getGlobalConfig();
                return _object_spread_props(_object_spread({}, globalConfig, this.config), {
                    headers: _object_spread({}, globalConfig === null || globalConfig === void 0 ? void 0 : globalConfig.headers, this.config.headers)
                });
            }
        },
        {
            key: "addRequestInterceptor",
            value: function addRequestInterceptor(interceptor) {
                this.requestInterceptors.push(interceptor);
                return this;
            }
        },
        {
            key: "addResponseInterceptor",
            value: function addResponseInterceptor(interceptor) {
                this.responseInterceptors.push(interceptor);
                return this;
            }
        },
        {
            key: "setUrl",
            value: function setUrl(url) {
                this.config.url = url;
                return this;
            }
        },
        {
            key: "setMethod",
            value: function setMethod(method) {
                this.config.method = method;
                return this;
            }
        },
        {
            key: "setHeaders",
            value: function setHeaders(headers) {
                this.config.headers = headers;
                return this;
            }
        },
        {
            key: "setBody",
            value: function setBody(body) {
                this.config.body = body;
                return this;
            }
        },
        {
            key: "setMaxRetries",
            value: function setMaxRetries(maxRetries) {
                this.config.maxRetries = maxRetries;
                return this;
            }
        },
        {
            key: "setRetryDelay",
            value: function setRetryDelay(retryDelay) {
                this.config.retryDelay = retryDelay;
                return this;
            }
        },
        {
            key: "backoff",
            value: function backoff(retryCount) {
                var _this = this;
                return _async_to_generator(function() {
                    var delay;
                    return _ts_generator(this, function(_state) {
                        delay = (_this.config.retryDelay || 1000) * Math.pow(2, retryCount);
                        return [
                            2,
                            new Promise(function(resolve) {
                                return setTimeout(resolve, delay);
                            })
                        ];
                    });
                })();
            }
        },
        {
            key: "parseResponse",
            value: function parseResponse(response) {
                var _this = this;
                return _async_to_generator(function() {
                    return _ts_generator(this, function(_state) {
                        switch(_this.config.responseType){
                            case "json":
                                return [
                                    2,
                                    response.json()
                                ];
                            case "text":
                                return [
                                    2,
                                    response.text()
                                ];
                            case "blob":
                                return [
                                    2,
                                    response.blob()
                                ];
                        }
                        return [
                            2
                        ];
                    });
                })();
            }
        },
        {
            key: "execute",
            value: function execute() {
                var _this = this;
                return _async_to_generator(function() {
                    var attempts, config, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, interceptor, maxRetries, controller, signal, options, response, parsedResponse, _iteratorNormalCompletion1, _didIteratorError1, _iteratorError1, _iterator1, _step1, interceptor1, error;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                attempts = 0;
                                config = _this.getEffectiveConfig();
                                _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                                try {
                                    for(_iterator = _this.requestInterceptors[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                                        interceptor = _step.value;
                                        config = interceptor(config);
                                    }
                                } catch (err) {
                                    _didIteratorError = true;
                                    _iteratorError = err;
                                } finally{
                                    try {
                                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                                            _iterator.return();
                                        }
                                    } finally{
                                        if (_didIteratorError) {
                                            throw _iteratorError;
                                        }
                                    }
                                }
                                maxRetries = _this.config.maxRetries || 0;
                                _state.label = 1;
                            case 1:
                                if (!(attempts <= maxRetries)) return [
                                    3,
                                    8
                                ];
                                _state.label = 2;
                            case 2:
                                _state.trys.push([
                                    2,
                                    5,
                                    ,
                                    7
                                ]);
                                controller = new AbortController();
                                signal = controller.signal;
                                options = {
                                    method: config.method,
                                    headers: config.headers,
                                    body: config.body ? JSON.stringify(config.body) : undefined,
                                    signal: signal
                                };
                                return [
                                    4,
                                    fetch(_this.config.url, options)
                                ];
                            case 3:
                                response = _state.sent();
                                if (!response.ok) {
                                    throw new Error("HTTP error: ".concat(response.statusText));
                                }
                                return [
                                    4,
                                    _this.parseResponse(response)
                                ];
                            case 4:
                                parsedResponse = _state.sent();
                                _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
                                try {
                                    for(_iterator1 = _this.responseInterceptors[Symbol.iterator](); !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                                        interceptor1 = _step1.value;
                                        parsedResponse = interceptor1(parsedResponse);
                                    }
                                } catch (err) {
                                    _didIteratorError1 = true;
                                    _iteratorError1 = err;
                                } finally{
                                    try {
                                        if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                                            _iterator1.return();
                                        }
                                    } finally{
                                        if (_didIteratorError1) {
                                            throw _iteratorError1;
                                        }
                                    }
                                }
                                return [
                                    2,
                                    [
                                        null,
                                        parsedResponse
                                    ]
                                ];
                            case 5:
                                error = _state.sent();
                                if (attempts >= maxRetries || error.name === "AbortError") {
                                    return [
                                        2,
                                        [
                                            error,
                                            null
                                        ]
                                    ];
                                }
                                attempts++;
                                return [
                                    4,
                                    _this.backoff(attempts)
                                ];
                            case 6:
                                _state.sent();
                                return [
                                    3,
                                    7
                                ];
                            case 7:
                                return [
                                    3,
                                    1
                                ];
                            case 8:
                                return [
                                    2,
                                    [
                                        new Error("Unknown error"),
                                        null
                                    ]
                                ];
                        }
                    });
                })();
            }
        }
    ]);
    return FetchBuilder;
}();
export { FetchBuilder, ConfigManager };


//# sourceMappingURL=index.js.map