var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (a) {
    var b = 0;
    return function () {
        return b < a.length
            ? {
                  done: !1,
                  value: a[b++],
              }
            : {
                  done: !0,
              };
    };
};
$jscomp.arrayIterator = function (a) {
    return {
        next: $jscomp.arrayIteratorImpl(a),
    };
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty =
    $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
        ? Object.defineProperty
        : function (a, b, c) {
              a != Array.prototype && a != Object.prototype && (a[b] = c.value);
          };
$jscomp.getGlobal = function (a) {
    return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
    $jscomp.initSymbol = function () {};
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};
$jscomp.Symbol = (function () {
    var a = 0;
    return function (b) {
        return $jscomp.SYMBOL_PREFIX + (b || "") + a++;
    };
})();
$jscomp.initSymbolIterator = function () {
    $jscomp.initSymbol();
    var a = $jscomp.global.Symbol.iterator;
    a || (a = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
    "function" != typeof Array.prototype[a] &&
        $jscomp.defineProperty(Array.prototype, a, {
            configurable: !0,
            writable: !0,
            value: function () {
                return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
            },
        });
    $jscomp.initSymbolIterator = function () {};
};
$jscomp.initSymbolAsyncIterator = function () {
    $jscomp.initSymbol();
    var a = $jscomp.global.Symbol.asyncIterator;
    a || (a = $jscomp.global.Symbol.asyncIterator = $jscomp.global.Symbol("asyncIterator"));
    $jscomp.initSymbolAsyncIterator = function () {};
};
$jscomp.iteratorPrototype = function (a) {
    $jscomp.initSymbolIterator();
    a = {
        next: a,
    };
    a[$jscomp.global.Symbol.iterator] = function () {
        return this;
    };
    return a;
};
$jscomp.findInternal = function (a, b, c) {
    a instanceof String && (a = String(a));
    for (var d = a.length, e = 0; e < d; e++) {
        var f = a[e];
        if (b.call(c, f, e, a))
            return {
                i: e,
                v: f,
            };
    }
    return {
        i: -1,
        v: void 0,
    };
};
$jscomp.polyfill = function (a, b, c, d) {
    if (b) {
        c = $jscomp.global;
        a = a.split(".");
        for (d = 0; d < a.length - 1; d++) {
            var e = a[d];
            e in c || (c[e] = {});
            c = c[e];
        }
        a = a[a.length - 1];
        d = c[a];
        b = b(d);
        b != d &&
            null != b &&
            $jscomp.defineProperty(c, a, {
                configurable: !0,
                writable: !0,
                value: b,
            });
    }
};
$jscomp.polyfill(
    "Array.prototype.find",
    function (a) {
        return a
            ? a
            : function (a, c) {
                  return $jscomp.findInternal(this, a, c).v;
              };
    },
    "es6",
    "es3"
);
$jscomp.owns = function (a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
};
$jscomp.assign =
    "function" == typeof Object.assign
        ? Object.assign
        : function (a, b) {
              for (var c = 1; c < arguments.length; c++) {
                  var d = arguments[c];
                  if (d) for (var e in d) $jscomp.owns(d, e) && (a[e] = d[e]);
              }
              return a;
          };
$jscomp.polyfill(
    "Object.assign",
    function (a) {
        return a || $jscomp.assign;
    },
    "es6",
    "es3"
);
$jscomp.makeIterator = function (a) {
    var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
    return b ? b.call(a) : $jscomp.arrayIterator(a);
};
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill(
    "Promise",
    function (a) {
        function b() {
            this.batch_ = null;
        }
        function c(a) {
            return a instanceof e
                ? a
                : new e(function (b, c) {
                      b(a);
                  });
        }
        if (a && !$jscomp.FORCE_POLYFILL_PROMISE) return a;
        b.prototype.asyncExecute = function (a) {
            null == this.batch_ && ((this.batch_ = []), this.asyncExecuteBatch_());
            this.batch_.push(a);
            return this;
        };
        b.prototype.asyncExecuteBatch_ = function () {
            var a = this;
            this.asyncExecuteFunction(function () {
                a.executeBatch_();
            });
        };
        var d = $jscomp.global.setTimeout;
        b.prototype.asyncExecuteFunction = function (a) {
            d(a, 0);
        };
        b.prototype.executeBatch_ = function () {
            for (; this.batch_ && this.batch_.length; ) {
                var a = this.batch_;
                this.batch_ = [];
                for (var b = 0; b < a.length; ++b) {
                    var c = a[b];
                    a[b] = null;
                    try {
                        c();
                    } catch (p) {
                        this.asyncThrow_(p);
                    }
                }
            }
            this.batch_ = null;
        };
        b.prototype.asyncThrow_ = function (a) {
            this.asyncExecuteFunction(function () {
                throw a;
            });
        };
        var e = function (a) {
            this.state_ = 0;
            this.result_ = void 0;
            this.onSettledCallbacks_ = [];
            var b = this.createResolveAndReject_();
            try {
                a(b.resolve, b.reject);
            } catch (k) {
                b.reject(k);
            }
        };
        e.prototype.createResolveAndReject_ = function () {
            function a(a) {
                return function (d) {
                    c || ((c = !0), a.call(b, d));
                };
            }
            var b = this,
                c = !1;
            return {
                resolve: a(this.resolveTo_),
                reject: a(this.reject_),
            };
        };
        e.prototype.resolveTo_ = function (a) {
            if (a === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
            else if (a instanceof e) this.settleSameAsPromise_(a);
            else {
                a: switch (typeof a) {
                    case "object":
                        var b = null != a;
                        break a;
                    case "function":
                        b = !0;
                        break a;
                    default:
                        b = !1;
                }
                b ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a);
            }
        };
        e.prototype.resolveToNonPromiseObj_ = function (a) {
            var b = void 0;
            try {
                b = a.then;
            } catch (k) {
                this.reject_(k);
                return;
            }
            "function" == typeof b ? this.settleSameAsThenable_(b, a) : this.fulfill_(a);
        };
        e.prototype.reject_ = function (a) {
            this.settle_(2, a);
        };
        e.prototype.fulfill_ = function (a) {
            this.settle_(1, a);
        };
        e.prototype.settle_ = function (a, b) {
            if (0 != this.state_) throw Error("Cannot settle(" + a + ", " + b + "): Promise already settled in state" + this.state_);
            this.state_ = a;
            this.result_ = b;
            this.executeOnSettledCallbacks_();
        };
        e.prototype.executeOnSettledCallbacks_ = function () {
            if (null != this.onSettledCallbacks_) {
                for (var a = 0; a < this.onSettledCallbacks_.length; ++a) f.asyncExecute(this.onSettledCallbacks_[a]);
                this.onSettledCallbacks_ = null;
            }
        };
        var f = new b();
        e.prototype.settleSameAsPromise_ = function (a) {
            var b = this.createResolveAndReject_();
            a.callWhenSettled_(b.resolve, b.reject);
        };
        e.prototype.settleSameAsThenable_ = function (a, b) {
            var c = this.createResolveAndReject_();
            try {
                a.call(b, c.resolve, c.reject);
            } catch (p) {
                c.reject(p);
            }
        };
        e.prototype.then = function (a, b) {
            function c(a, b) {
                return "function" == typeof a
                    ? function (b) {
                          try {
                              d(a(b));
                          } catch (B) {
                              f(B);
                          }
                      }
                    : b;
            }
            var d,
                f,
                n = new e(function (a, b) {
                    d = a;
                    f = b;
                });
            this.callWhenSettled_(c(a, d), c(b, f));
            return n;
        };
        e.prototype.catch = function (a) {
            return this.then(void 0, a);
        };
        e.prototype.callWhenSettled_ = function (a, b) {
            function c() {
                switch (d.state_) {
                    case 1:
                        a(d.result_);
                        break;
                    case 2:
                        b(d.result_);
                        break;
                    default:
                        throw Error("Unexpected state: " + d.state_);
                }
            }
            var d = this;
            null == this.onSettledCallbacks_ ? f.asyncExecute(c) : this.onSettledCallbacks_.push(c);
        };
        e.resolve = c;
        e.reject = function (a) {
            return new e(function (b, c) {
                c(a);
            });
        };
        e.race = function (a) {
            return new e(function (b, d) {
                for (var e = $jscomp.makeIterator(a), f = e.next(); !f.done; f = e.next()) c(f.value).callWhenSettled_(b, d);
            });
        };
        e.all = function (a) {
            var b = $jscomp.makeIterator(a),
                d = b.next();
            return d.done
                ? c([])
                : new e(function (a, e) {
                      function f(b) {
                          return function (c) {
                              h[b] = c;
                              g--;
                              0 == g && a(h);
                          };
                      }
                      var h = [],
                          g = 0;
                      do h.push(void 0), g++, c(d.value).callWhenSettled_(f(h.length - 1), e), (d = b.next());
                      while (!d.done);
                  });
        };
        return e;
    },
    "es6",
    "es3"
);
$jscomp.polyfill(
    "Array.prototype.fill",
    function (a) {
        return a
            ? a
            : function (a, c, d) {
                  var b = this.length || 0;
                  0 > c && (c = Math.max(0, b + c));
                  if (null == d || d > b) d = b;
                  d = Number(d);
                  0 > d && (d = Math.max(0, b + d));
                  for (c = Number(c || 0); c < d; c++) this[c] = a;
                  return this;
              };
    },
    "es6",
    "es3"
);
$jscomp.iteratorFromArray = function (a, b) {
    $jscomp.initSymbolIterator();
    a instanceof String && (a += "");
    var c = 0,
        d = {
            next: function () {
                if (c < a.length) {
                    var e = c++;
                    return {
                        value: b(e, a[e]),
                        done: !1,
                    };
                }
                d.next = function () {
                    return {
                        done: !0,
                        value: void 0,
                    };
                };
                return d.next();
            },
        };
    d[Symbol.iterator] = function () {
        return d;
    };
    return d;
};
$jscomp.polyfill(
    "Array.prototype.keys",
    function (a) {
        return a
            ? a
            : function () {
                  return $jscomp.iteratorFromArray(this, function (a) {
                      return a;
                  });
              };
    },
    "es6",
    "es3"
);
$jscomp.polyfill(
    "Array.from",
    function (a) {
        return a
            ? a
            : function (a, c, d) {
                  c =
                      null != c
                          ? c
                          : function (a) {
                                return a;
                            };
                  var b = [],
                      f = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
                  if ("function" == typeof f) {
                      a = f.call(a);
                      for (var g = 0; !(f = a.next()).done; ) b.push(c.call(d, f.value, g++));
                  } else for (f = a.length, g = 0; g < f; g++) b.push(c.call(d, a[g], g));
                  return b;
              };
    },
    "es6",
    "es3"
);
$jscomp.polyfill(
    "Object.is",
    function (a) {
        return a
            ? a
            : function (a, c) {
                  return a === c ? 0 !== a || 1 / a === 1 / c : a !== a && c !== c;
              };
    },
    "es6",
    "es3"
);
$jscomp.polyfill(
    "Array.prototype.includes",
    function (a) {
        return a
            ? a
            : function (a, c) {
                  var b = this;
                  b instanceof String && (b = String(b));
                  var e = b.length;
                  c = c || 0;
                  for (0 > c && (c = Math.max(c + e, 0)); c < e; c++) {
                      var f = b[c];
                      if (f === a || Object.is(f, a)) return !0;
                  }
                  return !1;
              };
    },
    "es7",
    "es3"
);
$jscomp.checkStringArgs = function (a, b, c) {
    if (null == a) throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
    if (b instanceof RegExp) throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
    return a + "";
};
$jscomp.polyfill(
    "String.prototype.includes",
    function (a) {
        return a
            ? a
            : function (a, c) {
                  return -1 !== $jscomp.checkStringArgs(this, a, "includes").indexOf(a, c || 0);
              };
    },
    "es6",
    "es3"
);
var WgUtil = {
        mouse: {},
        isDefined: function (a) {
            return "undefined" !== typeof a ? !0 : !1;
        },
        getLangText: function (a, b) {
            return WgLang[a] && WgLang[a][b] ? WgLang[a][b] : "??";
        },
        addOpt: function (a, b, c, d) {
            b = new Option(c, b);
            d ? (a.options[d] = b) : (a.options[a.options.length] = b);
        },
        optExist: function (a, b) {
            for (var c = 0; c < a.options.length; c++) if (a.options[c].value == b) return !0;
            return !1;
        },
        pridejOption: function (a, b) {
            for (var c = b.length, d = 0; d < a.length; d++)
                if (null != a.options[d] && a.options[d].selected) {
                    for (var e = !1, f = 0; f < c; f++)
                        if (null != b.options[f] && a.options[d].value == b.options[f].value) {
                            e = !0;
                            break;
                        }
                    1 != e && ((b.options[c] = new Option(a.options[d].text)), (b.options[c].value = a.options[d].value), c++);
                }
        },
        uberOption: function (a) {
            for (var b = a.options.length - 1; 0 <= b; b--) null != a.options[b] && 1 == a.options[b].selected && (a.options[b] = null);
        },
        selAll: function (a) {
            for (var b = 0; b < a.length; b++) a.options[b].selected = !0;
        },
        wgUserInfoWindow: function () {
            "undefined" != typeof jQuery &&
                $(".wgfcst-awginfo,.awginfo").click(function (a) {
                    a.preventDefault();
                    $("#awginfo-div").length || $("body").append("<div id='awginfo-div' style='position: absolute; z-index: 999; display: none; background-color: #FFFFFF; padding:7px; border: 1px solid #666666;width:400px'></div>");
                    var b = $(this).attr("wgwidth"),
                        c = $(this).attr("wgheight");
                    b && $("#awginfo-div").css("width", b);
                    c && $("#awginfo-div").css("height", c);
                    $("#awginfo-div")
                        .empty()
                        .load($(this).attr("href"), function () {
                            $("#awginfo-div").prepend('<img alt="close" style="float: right" src="img/close.gif"/>');
                        })
                        .css("left", a.pageX + 20)
                        .css("top", a.pageY - 100)
                        .show()
                        .click(function () {
                            $(this).hide();
                        });
                });
        },
        wgWindow: function (a) {
            if ("undefined" != typeof jQuery) {
                var b = {
                    close_icon: !0,
                    close: !1,
                    handle: !0,
                    handle_txt: "&nbsp;",
                    html: "",
                    width: "",
                    height: "",
                    mousepos: !1,
                    position: "",
                    padding: "5px",
                    id: "",
                };
                for (c in a) b[c] = a[c];
                b.mousepos && (b.position = "mouse");
                a = $('<img alt="close" style="float: right; cursor: pointer; margin: 1px 0px 0px 0px;" src="/int/img/close.gif"/>');
                var c = $('<div class="handle" style="background-color: #EAEAEA; padding: 2px 4px 1px 4px; cursor: move; border-bottom: 1px solid #666666; font-size: 11px;">' + b.handle_txt + "</div>");
                b.close_icon && c.prepend(a);
                var d = $('<div style="padding: ' + b.padding + '; position: relative;">' + b.html + "</div>"),
                    e = $('<div class="wgwindow"></div>'),
                    f = null;
                b.handle && (e.append(c), (f = ".handle"));
                e.append(d);
                $("body").append(e);
                e.drag("start", function () {
                    $(this).appendTo(this.parentNode);
                }).drag(
                    function (a, b) {
                        $(this).css({
                            top: b.offsetY,
                            left: b.offsetX,
                        });
                    },
                    {
                        handle: f,
                    }
                );
                b.close_icon &&
                    a.click(function () {
                        e.hide();
                    });
                "content" == b.close &&
                    (d.css("cursor", "crosshair"),
                    d.click(function () {
                        e.hide();
                    }));
                "" != b.width && d.width(b.width);
                "" != b.height && d.height(b.height);
                "" != b.id && e.attr("id", b.id);
                e.setContent = function (a) {
                    d.empty().append(a);
                };
                e.ajaxLoad = function (a, b) {
                    d.empty().load(a, b);
                };
                e.getContentDiv = function () {
                    return d;
                };
                e.close = function () {
                    e.hide();
                };
                e.remove = function () {
                    e.remove();
                };
                e.resetPos = function (a) {
                    a && (b.position = a);
                    "mouse" == b.position ? WgUtil.setMousePos(e) : "center" == b.position && WgUtil.setCenterPos(e);
                    WgUtil.fitBrowser(e);
                };
                e.stupidIe = function () {
                    $.browser.msie && 9 > parseFloat($.browser.version) && e.width(e.getContentDiv().width() + 6);
                };
                e.stupidIe();
                e.resetPos();
                return e;
            }
        },
        mouseTrack: function () {
            if (!this.mouse.eventset) {
                var a = this.mouse;
                a.eventset = !0;
                $(document).mousemove(function (b) {
                    a.x = b.pageX;
                    a.y = b.pageY;
                });
            }
        },
        getMousePos: function () {
            return this.mouse;
        },
        fitBrowser: function (a) {
            if ("undefined" != typeof jQuery) {
                a = $(a);
                var b = {},
                    c = $(window).scrollTop(),
                    d = $(window).scrollLeft(),
                    e = $(window).height(),
                    f = $(window).width(),
                    g = a.height(),
                    h = a.width(),
                    k = a.offset();
                b.top = k.top;
                b.left = k.left;
                b.top + g > c + e && (b.top = c + e - g - 10);
                b.top < c && (b.top = c + 10);
                b.left + h > d + f && (b.left = d + f - h - 10);
                b.left < d && (b.left = d + 10);
                a.css(b);
            }
        },
        setMousePos: function (a) {
            var b = WgUtil.getMousePos();
            b.eventset && a.css("top", b.y).css("left", b.x);
        },
        setCenterPos: function (a) {
            a.stupidIe();
            var b = $(window).height() / 2 - a.height() / 2 + $(window).scrollTop(),
                c = $(window).width() / 2 - a.width() / 2 + $(window).scrollLeft();
            a.css("top", b).css("left", c);
        },
        ibox: [],
        timer: [],
        timeron: !1,
        starttimer: function (a) {
            this.timeron || ((this.timer[a] = new Date()), (this.timer[a] = this.timer[a].getTime()), (this.timeron = !0));
        },
        stoptimer: function (a) {
            if (this.timeron) {
                var b = new Date().getTime() - this.timer[a];
                30000 < b && (b = 30000);
                1000 < b && (this.ibox[a] += b);
                this.iboxsave();
                this.timer[a] = 0;
                this.timeron = !1;
            }
        },
        iboxsave: function () {
            var a = new Date(),
                b = Math.floor(a.getTime() / 1000);
            a.setTime(a.getTime() + 1209600000);
            b += "/";
            for (i = 0; i < this.ibox.length; i++) 0 < this.ibox[i] && (b += i + "_" + this.ibox[i] + ";");
            b = b.substring(0, b.length - 1);
            document.cookie = "ibox=" + escape(b) + "; path=/; expires=" + a.toGMTString();
        },
        show: function (a) {
            document.getElementById(a).style.display = "block";
        },
        hide: function (a) {
            document.getElementById(a).style.display = "none";
        },
        toggle: function (a) {
            a = document.getElementById(a);
            a.style.display = "block" == a.style.display ? "none" : "block";
        },
        rangeArr_bak: function (a, b, c) {
            b = b || 1;
            c = c || 1;
            var d = [];
            for (a = a || 0; a <= b; a += c) d.push(a);
            return d;
        },
        rangeArr: function (a, b, c) {
            c = c || 1;
            var d = [];
            c.constructor != Array && (c = [[b, c]]);
            if (b > a) {
                d.push(a);
                for (var e = 0; e < c.length; e++)
                    for (var f = c[e][0]; a <= f; ) {
                        var g = Math.abs(c[e][1]);
                        if (a + g > f) break;
                        a += g;
                        if (a > b) return d;
                        d.push(a);
                    }
            } else if (b < a)
                for (d.push(a), e = 0; e < c.length; e++)
                    for (f = c[e][0]; a >= f; ) {
                        g = Math.abs(c[e][1]);
                        if (a - g < f) break;
                        a -= g;
                        if (a < b) return d;
                        d.push(a);
                    }
            return d;
        },
        updateObject: function (a, b) {
            b = this.deepCopy(b);
            if (a) for (var c in a) b[c] = a[c];
            return b;
        },
        setProperties: function (a, b, c) {
            b || (b = {});
            for (var d in c) a[d] = void 0 === b[d] ? c[d] : b[d];
            return a;
        },
        deepCopy: function (a, b) {
            b = b || {};
            for (var c in a) null != a[c] && "object" === typeof a[c] ? ((b[c] = a[c].constructor === Array ? [] : {}), this.deepCopy(a[c], b[c])) : (b[c] = a[c]);
            return b;
        },
        deg2rad: function (a) {
            return (a * Math.PI) / 180;
        },
        distance: function (a, b) {
            return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
        },
        distanceLatLon: function (a, b, c, d) {
            b -= d;
            a = Math.sin(WgUtil.deg2rad(a)) * Math.sin(WgUtil.deg2rad(c)) + Math.cos(WgUtil.deg2rad(a)) * Math.cos(WgUtil.deg2rad(c)) * Math.cos(WgUtil.deg2rad(b));
            a = Math.acos(a);
            return 6378 * a;
        },
        inArray: function (a, b) {
            return -1 < b.indexOf(a) ? !0 : !1;
        },
        arrayMax: function (a) {
            for (var b = -Number.MIN_VALUE, c = 0; c < a.length; c++) a[c] > b && (b = a[c]);
            return b;
        },
        arrayMin: function (a) {
            for (var b = Number.MAX_VALUE, c = 0; c < a.length; c++) a[c] < b && (b = a[c]);
            return b;
        },
        arrayUnique: function (a) {
            if (!a.length) return a;
            for (var b = [], c = 0; c < a.length; c++) WgUtil.inArray(a[c], b) || (b[b.length] = a[c]);
            return b;
        },
        googleMap: function (a, b) {
            $.ajax({
                url: "/int/ajax/ajax_gmap_loadlog.php",
                dataType: "json",
                data: {
                    url: window.location.href,
                },
                cache: !1,
            });
            return new google.maps.Map(document.getElementById(a), b);
        },
        round: function (a, b) {
            if (!b) return Math.round(a);
            b = Math.pow(10, b);
            return Math.round(a * b) / b;
        },
        hlaska: function (a, b, c, d) {
            d = WgUtil.updateObject(d, {
                remove: 0,
                css: "hlaska",
                css_error: "hlaska-err",
            });
            b = $('<div class="' + (c ? d.css_error : d.css) + '" style="margin: 0px;">' + b + "</div>");
            $("#" + a).append(b);
            d.remove &&
                b.delay(d.remove).fadeOut({
                    complete: function () {
                        this.remove();
                    },
                });
        },
        unitConvert: function (a, b, c) {
            if (isNaN(a) || !b || "" == b || b == c) return a;
            var d = (a = parseFloat(a));
            if (c)
                switch (c) {
                    case "knots":
                        d = a;
                        break;
                    case "ms":
                    case "msd":
                        d = a / 0.515277778;
                        break;
                    case "kmh":
                        d = a / 1.855;
                        break;
                    case "mph":
                        d = a / 1.152889994;
                        break;
                    case "bft":
                        0 < a && (d = 0);
                        1 <= a && (d = 0.6);
                        2 <= a && (d = 3);
                        3 <= a && (d = 7);
                        4 <= a && (d = 11);
                        5 <= a && (d = 16);
                        6 <= a && (d = 21);
                        7 <= a && (d = 27);
                        8 <= a && (d = 33);
                        9 <= a && (d = 40);
                        10 <= a && (d = 47);
                        11 <= a && (d = 55);
                        12 <= a && (d = 64);
                        break;
                    case "c":
                        d = a;
                        break;
                    case "f":
                        d = (5 * (a - 32)) / 9;
                        break;
                    case "m":
                        d = a;
                        break;
                    case "ft":
                        d = a / 3.28;
                }
            a = d;
            switch (b) {
                case "knots":
                    d = a;
                    break;
                case "ms":
                case "msd":
                    d = 0.515277778 * a;
                    break;
                case "kmh":
                    d = 1.855 * a;
                    break;
                case "mph":
                    d = 1.152889994 * a;
                    break;
                case "bft":
                    0 < a && (d = 0);
                    0.6 <= a && (d = 1);
                    3 <= a && (d = 2);
                    7 <= a && (d = 3);
                    11 <= a && (d = 4);
                    16 <= a && (d = 5);
                    21 <= a && (d = 6);
                    27 <= a && (d = 7);
                    33 <= a && (d = 8);
                    40 <= a && (d = 9);
                    47 <= a && (d = 10);
                    55 <= a && (d = 11);
                    64 <= a && (d = 12);
                    break;
                case "c":
                    d = a;
                    break;
                case "f":
                    d = (9 * a) / 5 + 32;
                    break;
                case "m":
                    d = a;
                    break;
                case "ft":
                    d = 3.28 * a;
            }
            return d;
        },
        supportsSVG: function () {
            return !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
        },
        isHttps: function () {
            return "https:" == window.location.protocol ? !0 : !1;
        },
        html5Banner: function (a) {
            var b = "/reklama/bannery/html5/" + a.dir + "/index.html",
                c =
                    "wgifr-" +
                    Math.random()
                        .toString(36)
                        .replace(/[^a-z0-9]+/g, "")
                        .substring(0, 16);
            document.write("<iframe id=" + c + ' style="margin:0;padding:0;border: none;width:' + a.w + "px;height:" + a.h + 'px;background-color:white;" src="" width=' + a.w + " height=" + a.h + "></iframe>");
            $(function () {
                var a = $("#" + c),
                    e = a.parent().data("bannid");
                a.attr("src", b);
                if (e) {
                    var f = "http://" + window.location.hostname + "/int/click.php?bannid=" + e;
                    a.load(function () {
                        var a = $(this.contentDocument).find("#link_url"),
                            b = a.attr("href");
                        a.attr("href", f + "&url=" + encodeURIComponent(b));
                        a.attr("target", "_top");
                    });
                }
            });
        },
    },
    WgLib = (function () {
        function a(a, b, c) {
            b = document.createElement("DIV");
            b.innerHTML = a;
            b.style.margin = "5px";
            b.style.textDecoration = "none";
            b.style.color = "#000000";
            b.style.backgroundColor = "#FFFFF0";
            b.style.font = "small Arial";
            b.style.fontWeight = "bold";
            b.style.border = "1px solid black";
            b.style.padding = "2px";
            b.style.textAlign = "center";
            b.style.cursor = "pointer";
            google.maps.event.addDomListener(b, "click", function () {
                c();
            });
            return b;
        }
        function b(a, b) {
            if (b) for (var c = 0; c < b.length; c++) WgUtil.addOpt(a, b[c][0], b[c][1], a.options.length);
        }
        function c(a, b) {
            return WgUtil.getLangText(a, b);
        }
        function d(a, b) {
            b || (b = function () {});
            navigator.geolocation && navigator.geolocation.getCurrentPosition(a, b);
        }
        function e() {
            var a = {};
            a.image = new google.maps.MarkerImage("/images/markers-v3/image.png", new google.maps.Size(29, 30), new google.maps.Point(0, 0), new google.maps.Point(15, 30));
            a.shadow = new google.maps.MarkerImage("/images/markers-v3/shadow.png", new google.maps.Size(47, 30), new google.maps.Point(0, 0), new google.maps.Point(15, 30));
            a.shape = {
                coord: [
                    20,
                    0,
                    23,
                    1,
                    24,
                    2,
                    26,
                    3,
                    27,
                    4,
                    27,
                    5,
                    28,
                    6,
                    28,
                    7,
                    24,
                    8,
                    25,
                    9,
                    25,
                    10,
                    26,
                    11,
                    26,
                    12,
                    26,
                    13,
                    26,
                    14,
                    25,
                    15,
                    25,
                    16,
                    25,
                    17,
                    24,
                    18,
                    23,
                    19,
                    22,
                    20,
                    20,
                    21,
                    19,
                    22,
                    18,
                    23,
                    17,
                    24,
                    16,
                    25,
                    15,
                    26,
                    15,
                    27,
                    15,
                    28,
                    14,
                    29,
                    14,
                    29,
                    13,
                    28,
                    13,
                    27,
                    12,
                    26,
                    11,
                    25,
                    11,
                    24,
                    9,
                    23,
                    8,
                    22,
                    7,
                    21,
                    5,
                    20,
                    3,
                    19,
                    2,
                    18,
                    1,
                    17,
                    0,
                    16,
                    0,
                    15,
                    0,
                    14,
                    4,
                    13,
                    3,
                    12,
                    3,
                    11,
                    2,
                    10,
                    2,
                    9,
                    2,
                    8,
                    2,
                    7,
                    3,
                    6,
                    3,
                    5,
                    4,
                    4,
                    4,
                    3,
                    5,
                    2,
                    7,
                    1,
                    9,
                    0,
                    20,
                    0,
                ],
                type: "poly",
            };
            return a;
        }
        var f = {};
        this.langdir = c("langdir", "dir");
        var g = function () {
                return "undefined" === typeof google || "undefined" === typeof google.maps ? !1 : !0;
            },
            h = function (a) {
                function d(d, e) {
                    var f = g.id_georegion.val();
                    e && e.id_georegion && (f = e.id_georegion);
                    $.getJSON(
                        "/int/ajax/wg_ajax_json_select.php",
                        {
                            q: "zeme",
                            id_georegion: f,
                            exist_spots: a.exist_spots,
                            id_model: a.id_model,
                        },
                        function (a) {
                            g.id_zeme[0].length = 0;
                            WgUtil.addOpt(g.id_zeme[0], -1, "--" + c("spotmenu", "sel_zeme") + "-- (" + a.count + " " + c("spotmenu", "num_zeme") + ")", 0);
                            WgUtil.addOpt(g.id_zeme[0], 0, "--" + c("spotmenu", "sel_all") + "--");
                            b(g.id_zeme[0], a.zeme);
                            WgUtil.isDefined(d) && (g.id_zeme[0].value = d);
                        }
                    );
                }
                function e(d, e) {
                    var f = g.id_region.val();
                    var k = g.id_zeme.val();
                    var p = g.id_georegion.val();
                    var m = h();
                    e && (e.id_region && (f = e.id_region), e.id_zeme && (k = e.id_zeme), e.id_georegion && (p = e.id_georegion));
                    $.getJSON(
                        "/int/ajax/wg_ajax_json_select.php",
                        {
                            q: "spots",
                            id_zeme: k,
                            id_region: f,
                            id_georegion: p,
                            cats: m,
                            id_cuser: a.id_cuser,
                            id_model: a.id_model,
                            special: a.special,
                            opt: a.opt,
                        },
                        function (a) {
                            g.id_spot[0].length = 0;
                            WgUtil.addOpt(g.id_spot[0], 0, "--" + c("spotmenu", "sel_spot") + "-- (" + a.count + " " + c("spotmenu", "num_spot") + ")", 0);
                            b(g.id_spot[0], a.spots);
                            WgUtil.isDefined(d) && (g.id_spot[0].value = d);
                            var e = Array(g.id_spot[0].length);
                            for (i = 0; i < e.length; i++) e[i] = new Option(g.id_spot[0][i].text, g.id_spot[0][i].value);
                            n = e;
                            q && q.addMapSpots(a.spots);
                        }
                    );
                }
                function f(a, d) {
                    var e = g.id_zeme.val();
                    var f = g.id_georegion.val();
                    d && (d.id_zeme && (e = d.id_zeme), d.id_georegion && (f = d.id_georegion));
                    $.getJSON(
                        "/int/ajax/wg_ajax_json_select.php",
                        {
                            q: "regions",
                            id_zeme: e,
                            id_georegion: f,
                        },
                        function (d) {
                            g.id_region[0].length = 0;
                            WgUtil.addOpt(g.id_region[0], 0, "--" + c("spotmenu", "sel_all") + "-- (" + d.count + " " + c("spotmenu", "num_reg") + ")", 0);
                            b(g.id_region[0], d.regions);
                            WgUtil.isDefined(a) && (g.id_region[0].value = a);
                        }
                    );
                }
                function h() {
                    for (var a = p.find(".typspots").find("input:checked"), b = [], c = 0; c < a.length; c++) b[c] = a[c].value;
                    return b.join("_");
                }
                var g = {},
                    n = [],
                    k = this,
                    p = $("#" + a.spot_select);
                this.id = a.spot_select;
                g.id_georegion = p.find(".id_georegion");
                g.id_zeme = p.find(".id_zeme");
                g.id_region = p.find(".id_region");
                g.id_spot = p.find(".id_spot");
                g.filter = p.find(".filter_search");
                g.refresh = p.find(".spot_refresh");
                WgUtil.isDefined(a.exist_spots) || (a.exist_spots = 1);
                WgUtil.isDefined(a.id_model) || (a.id_model = 0);
                WgUtil.isDefined(a.id_cuser) || (a.id_cuser = 0);
                WgUtil.isDefined(a.opt) || (a.opt = "");
                WgUtil.isDefined(a.special) || (a.special = "");
                if (WgUtil.isDefined(a.spotmap)) {
                    var q = a.spotmap;
                    q.setSpotSelect(this);
                }
                WgUtil.addOpt(g.id_zeme[0], 0, "--" + c("spotmenu", "sel_zeme") + "-- (0 " + c("spotmenu", "num_zeme") + ")");
                WgUtil.addOpt(g.id_region[0], 0, "--" + c("spotmenu", "sel_all") + "-- (0 " + c("spotmenu", "num_reg") + ")");
                WgUtil.addOpt(g.id_spot[0], 0, "--" + c("spotmenu", "sel_spot") + "-- (0 " + c("spotmenu", "num_spot") + ")");
                a.id_georegion && ((g.id_georegion[0].value = a.id_georegion), d(a.id_zeme, a), a.id_zeme && (f(a.id_region, a), e(a.id_spot, a)));
                g.id_georegion.change(function () {
                    g.id_region[0].length = 0;
                    g.id_spot[0].length = 0;
                    WgUtil.addOpt(g.id_region[0], 0, "--" + c("spotmenu", "sel_all") + "-- (0 " + c("spotmenu", "num_reg") + ")");
                    WgUtil.addOpt(g.id_spot[0], 0, "--" + c("spotmenu", "sel_spot") + "-- (0 " + c("spotmenu", "num_spot") + ")");
                    d();
                });
                g.id_zeme.change(function () {
                    f();
                    e();
                });
                g.id_region.change(function () {
                    e();
                });
                g.id_spot.change(function () {
                    var a = g.id_spot.val();
                    q && q.showMapSpot(a);
                });
                g.filter.length &&
                    g.filter.keyup(function () {
                        var a = g.id_spot[0];
                        a.options.length = 0;
                        var b = g.filter.val().toLowerCase();
                        for (i = 0; i < n.length; i++) if ("" == b || 0 <= n[i].text.toLowerCase().indexOf(b)) a.options[a.options.length] = n[i];
                    });
                g.refresh.length &&
                    g.refresh.click(function () {
                        q && q.deleteMarkers();
                        e();
                    });
                this.setMap = function (a) {
                    q = a;
                    q.setSpotSelect(k);
                };
                this.hideMap = function () {
                    q && q.hide();
                };
                this.selectSpot = function (a, b) {
                    WgUtil.optExist(g.id_spot[0], a) || (WgUtil.optExist(g.id_spot[0], -100) || WgUtil.addOpt(g.id_spot[0], -100, "--------------"), WgUtil.addOpt(g.id_spot[0], a, b));
                    g.id_spot[0].value = a;
                };
            },
            k = function (b) {
                function c() {
                    if (!this.mcoptions) {
                        var a = [45, 49, 60, 70, 80],
                            b = [34, 37, 45, 52, 60],
                            c = [];
                        for (i = 1; 5 >= i; ++i)
                            c.push({
                                url: "/images/wgmc" + i + ".png",
                                height: b[i - 1],
                                width: a[i - 1],
                            });
                        this.mcoptions = {
                            gridSize: 45,
                            maxZoom: 10,
                            styles: c,
                        };
                    }
                    return new MarkerClusterer(k, [], this.mcoptions);
                }
                function d() {
                    if (!k && g()) {
                        var b = {
                            zoom: 3,
                            center: new google.maps.LatLng(20, 0),
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                        };
                        k = WgUtil.googleMap(h.id, b);
                        b = a("Reset markers", k, n.resetMarkers);
                        b.index = 1;
                        k.controls[google.maps.ControlPosition.RIGHT_TOP].push(b);
                        z = c();
                        e.jqResize(".jqResize").mouseup(function () {
                            google.maps.event.trigger(k, "resize");
                        });
                    }
                }
                var e = $("#" + b),
                    f,
                    h = document.getElementById(b + "_gmap"),
                    n = this,
                    k,
                    X = {},
                    ea,
                    Y,
                    z,
                    Q = !1,
                    x = {};
                g() &&
                    (x = new google.maps.InfoWindow({
                        content: "",
                    }));
                this.id = b;
                this.setPosition = function () {
                    var a = e.offset(),
                        b = $(window).width() - a.left - 10;
                    a = $(window).height() - a.top - 10;
                    1200 < b && (b = 1200);
                    700 < a && (a = 700);
                    600 > b && (b = 600);
                    300 > a && (a = 300);
                    e.width(b);
                    e.height(a);
                    k && google.maps.event.trigger(k, "resize");
                };
                this.setToggleCheckbox = function (a) {
                    f = $("#" + a);
                    f.click(function () {
                        "checked" == f.attr("checked") ? (e.show(), n.setPosition(), d(), n.addMapSpots(ea)) : n.hide();
                    });
                };
                this.hide = function () {
                    f && f.attr("checked", !1);
                    e.hide();
                };
                this.isVisible = function () {
                    return e.is(":visible") ? !0 : !1;
                };
                this.addMapSpots = function (a) {
                    if (WgUtil.isDefined(a) && ((ea = a), k && n.isVisible())) {
                        for (var b = [], c, d = [], e = 0; e < a.length; e++) {
                            var f = {
                                id_spot: a[e][0],
                                spotname: a[e][1],
                                lat: a[e][2],
                                lon: a[e][3],
                            };
                            c = new google.maps.LatLng(f.lat, f.lon);
                            b.push(c);
                            if (!X[f.id_spot]) {
                                c = q(f, !1);
                                var g = Q
                                    ? Q(f, {
                                          spotselect: Y,
                                      })
                                    : p(f, {
                                          spotselect: Y,
                                      });
                                c.setInfoWindow({
                                    infowindow: x,
                                    map: k,
                                    content: g,
                                });
                                c.spotselect = Y;
                                c.setupClickEvent();
                                X[f.id_spot] = c;
                                X[f.id_spot].spotdef = a[e];
                                d.push(c);
                            }
                        }
                        z.addMarkers(d);
                        if (0 < b.length) {
                            a = new google.maps.LatLngBounds();
                            for (d = 0; d < b.length; d++) a.extend(b[d]);
                            k.fitBounds(a);
                        }
                    }
                };
                this.resetMarkers = function () {
                    n.isVisible() && (n.deleteMarkers(), n.addMapSpots(ea));
                };
                this.deleteMarkers = function () {
                    k && (z && z.clearMarkers(), (z = c()), (X = {}));
                };
                this.setSpots = function (a) {
                    ea = a;
                };
                this.setSpotSelect = function (a) {
                    Y = a;
                };
                this.showMapSpot = function (a) {
                    k && n.isVisible() && (a = X[a]) && (k.setCenter(a.getPosition()), 11 > k.getZoom() && k.setZoom(11), a.openInfoWindow());
                };
                this.setMarkerFunction = function (a) {
                    Q = a;
                };
            },
            p = function (a, b) {
                b || (b = {});
                if ($.isFunction(b.content_function)) var d = b.content_function(a);
                else
                    (d =
                        '<div style="font-family: arial !important;"><b>' +
                        a.spotname +
                        '</b><br/><br/>[<a  style="font-family: arial !important;" href="/' +
                        langdir +
                        "/index.php?sc=" +
                        a.id_spot +
                        '" target="_top">' +
                        c("gmap", "link_f") +
                        "</a>]"),
                        (d += ' [<a style="font-family: arial !important;" href="/' + langdir + "/historie.php?id_spot=" + a.id_spot + '" target="_top">' + c("gmap", "link_a") + "</a>]"),
                        (d += ' [<a style="font-family: arial !important;" href="/' + langdir + "/spot.php?id_spot=" + a.id_spot + '" target="_top">' + c("gmap", "link_d") + "</a>]"),
                        (d += "<br/><br/>"),
                        b.spotselect instanceof h && (d += '[<a style="font-family: arial !important;" href="javascript:WgLib.spotSelectHideMap(\'' + b.spotselect.id + "');\">" + c("gmap", "link_s") + "</a>] "),
                        (d += '[<a style="font-family: arial !important;" href="/' + langdir + "/nastaveni.php?cast=fspot&akce=new&odeslano=1&spotid=" + a.id_spot + '" target="_top">' + c("gmap", "link_add") + "</a>]</div>");
                return d;
            },
            q = function (a, b, c) {
                var d,
                    f = e();
                a.lat && a.lon && (d = new google.maps.LatLng(a.lat, a.lon));
                c || (c = {});
                c.icon || (c.icon = f.image);
                c.shadow || (c.shadow = f.shadow);
                c.shape || (c.shape = f.shape);
                WgUtil.isDefined(c.draggable) || (c.draggable = !1);
                d && (c.position = d);
                b && (c.map = b);
                var g = new google.maps.Marker(c);
                g.spot = a;
                g.spotselect = !1;
                g.openInfoWindow = function () {
                    g.iw.setContent(g.iwcontent);
                    g.iw.open(g.iwmap, g);
                };
                g.setInfoWindow = function (a) {
                    a.infowindow
                        ? (g.iw = a.infowindow)
                        : g.iw ||
                          (g.iw = new google.maps.InfoWindow({
                              content: "",
                          }));
                    a.content ? ($.isFunction(a.content) ? (g.iwcontent = a.content()) : (g.iwcontent = a.content)) : g.iwcontent || (g.iwcontent = p(g.spot));
                    a.map && (g.iwmap = a.map);
                };
                g.setupClickEvent = function () {
                    google.maps.event.addListener(g, "click", function () {
                        g.spotselect && g.spotselect.selectSpot(g.spot.id_spot, g.spot.spotname);
                        g.openInfoWindow();
                    });
                };
                return g;
            };
        this.wgCatsStr = function () {
            var a = "";
            for (i = 1; i <= idtyps.length; i++) 1 == idtyps[i] && (a += "_" + i);
            return "" != a ? a.substr(1) : "";
        };
        return {
            spotSelect: function (a) {
                a = new h(a);
                return (f[a.id] = a);
            },
            spotSelectHideMap: function (a) {
                f[a] && f[a].hideMap();
            },
            spotMap: function (a, b, c) {
                a = new k(a);
                a.setPosition();
                a.setToggleCheckbox(b);
                c && a.setMarkerFunction(c);
                return a;
            },
            mapIcon: function () {
                return e();
            },
            infoWindow: function (a, b) {
                a = p(a, b);
                return new google.maps.InfoWindow({
                    content: a,
                });
            },
            mapMarker: function (a, b, c) {
                return q(a, b, c);
            },
            mapControl: function (b, c, d) {
                return a(b, c, d);
            },
            myPosition: function (a, b) {
                d(a, b);
            },
        };
    })();
if (!WgLang) var WgLang = {};
var WgComplete = {
        qss: function (a, b) {
            var c = $("#" + a);
            a = {
                all: !1,
                favourite: !0,
                stations: !0,
                spots: !0,
                start_favourite: !0,
                custom: !0,
                start_custom: !0,
                start_last: 5,
                priority_sort: !0,
                min_chars: 3,
                delay: 300,
                max_height: 380,
                hint: WgUtil.getLangText("spotmenu", "qs_hint"),
                last_spots: [],
                favourite_spots: [],
                appendToSelector: "body",
                on_select: function (a) {},
                on_unselect: function () {},
                onActivate: function (a, b) {},
                onHide: function () {},
                onSearchStart: function () {},
                nearby_wg: 0,
                nearby_all: 0,
                nicescroll: !1,
                map: !1,
                optionalUnofficial: !1,
                myposition: !1,
                api_query: "autocomplete_ss",
            };
            var d = !1;
            b = $.extend({}, a, b);
            var e = null,
                f = {},
                g = "",
                h = {},
                k = this,
                p = !1,
                q = function (a, n) {
                    g = a = a.trim();
                    var k = a + "," + d;
                    n = function (a) {
                        WG.user.geoposition && (b.nearby_wg && (a.nearby_wg = b.nearby_wg), b.nearby_all && (a.nearby_all = b.nearby_all), (a.lat = WG.user.geoposition.coords.latitude), (a.lon = WG.user.geoposition.coords.longitude));
                        return a;
                    };
                    var p = 0;
                    a = a.split(/\s+/);
                    for (var t = 0; t < a.length; t++) a[t].length > p && (p = a[t].length);
                    if (p < b.min_chars)
                        if (e) m(e);
                        else {
                            var q = {
                                q: b.api_query,
                                type_info: !0,
                                my: 1,
                                all: 0,
                                latlon: 1,
                                favourite: b.start_favourite && b.favourite ? 1 : 0,
                                custom: b.start_custom && b.custom ? 1 : 0,
                                stations: b.stations ? 1 : 0,
                                spots: b.spots ? 1 : 0,
                                priority_sort: b.priority_sort ? 1 : 0,
                                last: b.start_last ? b.start_last : 0,
                                myposition: b.myposition ? 1 : 0,
                            };
                            b.last_spots.length && (q.last_ss = b.last_spots.join("_"));
                            b.favourite_spots.length && (q.favourite_ss = b.favourite_spots.join("_"));
                            q = n(q);
                            WG.qApi(
                                q,
                                function (a) {
                                    e = a.suggestions;
                                    m(e);
                                },
                                !1,
                                !1,
                                !1,
                                !1,
                                ["last_ss", "favourite_ss", "_mha"]
                            );
                        }
                    else
                        f[k]
                            ? m(f[k])
                            : ((q = {
                                  q: b.api_query,
                                  type_info: !0,
                                  all: b.all ? 1 : 0,
                                  latlon: 1,
                                  country: 1,
                                  favourite: b.favourite ? 1 : 0,
                                  custom: b.custom ? 1 : 0,
                                  stations: b.stations ? 1 : 0,
                                  spots: b.spots ? 1 : 0,
                                  priority_sort: b.priority_sort ? 1 : 0,
                                  query: c.val(),
                              }),
                              b.optionalUnofficial && !d && (q.all = 0),
                              (q = n(q)),
                              clearTimeout(h),
                              (h = setTimeout(function () {
                                  b.last_spots.length && (q.last_ss = b.last_spots.join("_"));
                                  b.favourite_spots.length && (q.favourite_ss = b.favourite_spots.join("_"));
                                  WG.qApi(
                                      q,
                                      function (a) {
                                          f[k] = a.suggestions;
                                          m(f[k]);
                                      },
                                      !1,
                                      !1,
                                      !1,
                                      !1,
                                      ["last_ss", "favourite_ss", "_mha"]
                                  );
                              }, b.delay)));
                };
            a = function (a) {
                p = !0;
            };
            b.on_select &&
                (a = function (a) {
                    p = !0;
                    k.cleanLastCache();
                    b.on_select(a);
                });
            var n = {
                deferRequestBy: 0,
                formatResult: function (a, c) {
                    c = WgComplete.formatResult(a, c);
                    var d = WG.ttStr(2604, 1, "windguru forecast", "search results", "67", "@@@"),
                        e = "",
                        f = "xw";
                    0 <= a.type.indexOf("W") && 0 <= a.type.indexOf("F") && (f = "xf");
                    0 <= a.type.indexOf("c") && (f = "xco");
                    0 <= a.type.indexOf("c") && 0 <= a.type.indexOf("F") && (f = "xcof");
                    0 <= a.type.indexOf("C") && (f = "xc");
                    0 <= a.type.indexOf("C") && 0 <= a.type.indexOf("F") && (f = "xcf");
                    0 <= a.type.indexOf("L") && (e += " autocomplete-lastspot");
                    0 <= a.type.indexOf("_") && (e += " autocomplete-gend");
                    0 <= a.type.indexOf("c") && (d = WG.ttStr(2605, 1, "user spot forecast (unofficial)", "search results", "67", "@@@"));
                    0 <= a.type.indexOf("C") && (d = WG.ttStr(2606, 1, "your custom spot forecast", "search results", "67", "@@@"));
                    a.s &&
                        ((d = WG.ttStr(2608, 1, "station", "search results", "67", "@@@")),
                        (f = "sc"),
                        0 <= a.type.indexOf("W") && ((f = "sw"), (d = WG.ttStr(2609, 1, "windguru station", "search results", "67", "@@@"))),
                        0 <= a.type.indexOf("F") && (f += "f"));
                    var g = a.type.indexOf("g");
                    0 <= g && (e += " autocomplete-g" + a.type.substring(g + 1, g + 2));
                    0 <= a.type.indexOf("_") && (e += " autocomplete-nextgroup");
                    g = b.width ? ' style="width:' + (b.width - 45) + 'px"' : "";
                    var h = "";
                    0 <= a.type.indexOf("M") && ((h = '<svg class="icon"><use xlink:href="#ico_spot_map"></use></svg> '), (e += " autocomplete-spot-m"));
                    return (
                        '<div class="autocomplete-suggestion-item autocomplete-spot-' +
                        f +
                        e +
                        '"><div class="autocomplete-suggestion-spot" ' +
                        g +
                        '><div class="suggestion-primary">' +
                        h +
                        c +
                        '</div><div class="suggestion-secondary">' +
                        d +
                        "</div></div></div>"
                    );
                },
                width: b.width,
                onSelect: a,
                autoSelectFirst: !0,
                maxHeight: b.max_height,
                lookupFilter: function () {
                    return !0;
                },
                preserveInput: !0,
                onActivate: b.onActivate,
                onSearchStart: b.onSearchStart,
                onHide: b.onHide,
                appendTo: b.appendToSelector,
            };
            WgComplete.smapmodal = WgComplete.mapModal();
            b.map &&
                ((n.onActivate = WG.debounce(function (a, b) {
                    p ? (p = !1) : WgComplete._selectSpotMap(a, b);
                }, 300)),
                (n.onHide = function () {
                    WgComplete.smapmodal.close();
                }));
            var m = function (a) {
                var e = WG.ttStr(0, 1, "include unofficial / custom spots?", "", "67", "@@@"),
                    f = !1,
                    g = !1;
                a.length || (g = !0);
                g &&
                    b.optionalUnofficial &&
                    !d &&
                    c.val() &&
                    ((a = [
                        {
                            type: "",
                            value: "Not found",
                        },
                    ]),
                    (e = WG.ttStr(0, 1, "Not found!", "", "67", "@@@") + " " + e),
                    (f = !0));
                n.lookup = a;
                a = c.autocompleteWG(n);
                c.autocompleteWG().getSuggestions(c.val());
                g = $(n.appendTo).find(".autocomplete-suggestions");
                b.optionalUnofficial &&
                    !d &&
                    c.val() &&
                    (f && g.empty(),
                    $('<div class="autocomplete-loadcustoms"><svg class="icon"><use xlink:href="#ico_search"></use></svg> ' + e + "</div>")
                        .on("click", function (a) {
                            d = !0;
                            q(c.val());
                        })
                        .appendTo(g));
                c.val() &&
                    $('<div class="autocomplete-loadcustoms"><svg class="icon"><use xlink:href="#ico_add"></use></svg> ' + WG.ttStr(2429, 1, "Add custom spot", "", "64", "@@@") + "</div>")
                        .on("click", WG.addCustomSpot)
                        .appendTo(g);
                if (b.map)
                    g.on("mouseleave", function () {
                        p = !0;
                        setTimeout(function () {
                            WgComplete.smapmodal.close();
                        }, 100);
                    });
                return a;
            };
            this.cleanLastCache = function () {
                e = null;
                f = {};
            };
            c.one("focus", function () {
                c.val("");
                q(c.val());
                c.on("focus", function () {
                    b.on_unselect();
                    c.val() || (d = !1);
                    q(c.val());
                });
                c.on("keyup", function (a) {
                    c.val() !== g && q(c.val());
                });
            });
            this.open = function () {
                c.focus();
            };
            this.isOpen = function () {
                return $(n.appendTo).find(".autocomplete-suggestions").is(":visible") ? !0 : !1;
            };
            this.suggest = function () {
                q(c.val());
            };
            this.close = function () {
                c.autocompleteWG("hide");
            };
            this.cacheClean = function () {
                e = null;
                f = {};
            };
            this.setLast = function (a) {
                b.last_spots = a;
                this.cacheClean();
            };
            this.setFavourite = function (a) {
                b.favourite_spots = a;
                this.cacheClean();
            };
            return this;
        },
        qspot: function (a, b) {
            b = $.extend({}, b);
            b.stations = !1;
            return WgComplete.qss(a, b);
        },
        qstation: function (a, b) {
            b = $.extend({}, b);
            b.stations = !0;
            b.spots = !1;
            b.custom = !1;
            b.favourite = !1;
            b.all = !1;
            return WgComplete.qss(a, b);
        },
        escapeRegExChars: function (a) {
            return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        formatResult: function (a, b) {
            b = b.split(" ");
            for (var c = [], d = 0; d < b.length; d++) c[d] = WgComplete.escapeRegExChars(b[d]);
            b = "(" + c.join("|") + ")";
            return a.value
                .replace(new RegExp(b, "gi"), "<strong>$1</strong>")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/&lt;(\/?strong)&gt;/g, "<$1>");
        },
        mapModal: function () {
            return new jBox("Modal", {
                overlay: !1,
                closeButton: !1,
                width: 300,
                height: 300,
                position: {
                    x: "right",
                    y: "top",
                },
                outside: "x",
                repositionOnOpen: !0,
                reposition: !0,
                addClass: "wgmodal",
                blockScroll: !1,
            });
        },
        _selectSpotMap: function (a, b, c, d) {
            c = WgComplete.smapmodal;
            d = WgComplete.sminimap;
            c && c.close();
            if (a.lat || a.lon) {
                d && d.remove();
                var e = $("#sminimap_spot");
                e[0] || (e = $('<div id="sminimap_spot" class="minimap"></div>').appendTo($("body")));
                WgComplete.sminimap = new WG.Map("sminimap_spot");
                d = WgComplete.sminimap;
                c.open({
                    target: b,
                });
                c.setContent(e);
                a = new WG.Spot({
                    spotname: a.value,
                    id_spot: a.data,
                    lat: a.lat,
                    lon: a.lon,
                });
                d.addLayerOSM();
                a.makeMarker();
                a.addToMap(d);
                d.map.setZoom(10);
                d.map.panTo([a.lat, a.lon]);
            }
        },
    },
    WgSvg = {};
WgSvg.Canvas = $class({
    constructor: function (a) {
        this._$div = a = a instanceof jQuery ? a : $("#" + a);
        a.removeClass("hasSVG");
        this.svg = a.svg("get");
        this.width = a.width();
        this.height = a.height();
    },
    extend: function (a, b, c, d) {},
    detach: function () {
        this._$detached_svg = this._$div.find("svg").detach();
    },
    attach: function () {
        this._$div.append(this._$detached_svg);
    },
});
WgSvg.Graph = $class({
    constructor: function (a, b, c) {
        this.canvas = a;
        this.svg = this.canvas.svg;
        this.x = {
            range: [],
            dif: [],
        };
        this.y = {
            range: [],
            dif: [],
        };
        this.setRange([0, 100], [0, 100]);
        this.invert = !1;
        this.min = -9999999999;
        this.max = 9999999999;
        this.ignore_keys = {};
        this.points = [];
        this.points_keys = [];
        this.okpoints = [];
        b || (b = {});
        this.position = b.position ? b.position : b.px_position ? [b.px_position[0] / a.width, b.px_position[1] / a.height] : [0, 0];
        this.dimensions = b.dimensions ? b.dimensions : b.px_dimensions ? [b.px_dimensions[0] / a.width, b.px_dimensions[1] / a.height] : [1, 1];
        this.px_padding = b.px_padding ? b.px_padding : b.padding ? b.px_padding : [b.padding[0] / a.height, b.padding[1] / a.width, b.padding[2] / a.height, b.padding[3] / a.width];
        this.pxpos = [this.position[0] * this.canvas.width + this.px_padding[3], this.position[1] * this.canvas.height + this.px_padding[2]];
        this.pxwidth = this.dimensions[0] * this.canvas.width - this.px_padding[3] - this.px_padding[1];
        this.pxheight = this.dimensions[1] * this.canvas.height - this.px_padding[0] - this.px_padding[2];
        c = c || {
            opacity: 1,
        };
        c.transform = "translate(" + this.pxpos[0] + " " + (this.canvas.height - this.pxheight - this.pxpos[1]) + ")";
        b.clip && ((a = "clp_" + Math.random().toString(36).substr(2, 16)), (this.group_clp = this.svg.clipPath(a)), this.svg.rect(this.group_clp, 0, 0, this.pxwidth, this.pxheight, 0, 0, {}), (c["clip-path"] = "url(#" + a + ")"));
        this.group = this.svg.group(c);
    },
    select: function (a) {
        return $(a, this.svg.root());
    },
    dom: function (a, b, c) {
        return this.svg.other(a, b, c);
    },
    simpleFilter: function (a, b, c) {
        var d = this._getDefs();
        a = this.dom(d, "filter", {
            id: a,
        });
        return this.dom(a, b, c);
    },
    _getDefs: function () {
        var a = this.select("defs");
        a.length || (a = this.svg.defs());
        return a;
    },
    GPoint: function (a, b, c, d, e, f) {
        this.point = [a, b];
        this.x = a;
        this.y = b;
        this.xval = c;
        this.val = d;
        this.print_val = e;
        this.data_index = f;
    },
    GPointGroup: function (a) {
        this.gpoints = a;
        var b = this;
        this.getPoints = function () {
            for (var a = [], d = 0; d < b.gpoints.length; d++) a[a.length] = b.gpoints[d].point;
            return a;
        };
        this.getFirst = function () {
            return b.gpoints[0];
        };
        this.getLast = function () {
            return b.gpoints[b.gpoints.length - 1];
        };
    },
    svgArrow: function () {
        this.svgarrow ||
            ((this.svgarrow = this.svg.createPath()),
            this.svgarrow
                .move(-5, -50)
                .line([
                    [5, -50],
                    [5, 10],
                    [30, 0],
                    [0, 50],
                    [-30, 0],
                    [-5, 10],
                ])
                .close());
        return this.svgarrow;
    },
    svgArrowS: function () {
        this.svgarrows ||
            ((this.svgarrows = this.svg.createPath()),
            this.svgarrows
                .move(0, -5)
                .line(0, 5)
                .move(3, 1)
                .line([
                    [0, 5],
                    [-3, 1],
                ]));
        return this.svgarrows;
    },
    getXY: function (a, b, c) {
        var d = 0;
        0 < (c || 0) % 2 && (d = 0.5);
        a = Math.round(((a - this.x.range[0]) / this.x.dif) * this.pxwidth) + d;
        b = this.invert ? Math.round(((b - this.y.range[0]) / this.y.dif) * this.pxheight) + d : Math.round(this.pxheight - ((b - this.y.range[0]) / this.y.dif) * this.pxheight) + d;
        isNaN(a) && (a = 0);
        isNaN(b) && (b = 0);
        return [a, b];
    },
    getGPointXY: function (a, b, c, d) {
        c = this.getXY(a, b, c);
        return new this.GPoint(c[0], c[1], a, b, b, d);
    },
    setInvert: function (a) {
        this.invert = a ? !0 : !1;
    },
    setRange: function (a, b) {
        this.setXRange(a[0], a[1]);
        this.setYRange(b[0], b[1]);
    },
    setXRange: function (a, b) {
        this.x.range = [a, b];
        this.x.dif = b - a;
    },
    setYRange: function (a, b) {
        this.y.range = [a, b];
        this.y.dif = b - a;
    },
    setFloatingYRange: function (a, b, c, d, e, f) {
        f = (e = e || 0) || 0;
        if (c - d > a) (f = d - f), (a = c + e);
        else {
            var g = (c + d) / 2;
            c < b + a / 2 && d > b - a / 2 ? ((f = b - a / 2 - f), (a = b + a / 2 + e)) : g > b ? ((f = c - a - f), (a = c + e)) : ((f = d - f), (a = d + a + e));
        }
        this.setYRange(f, a);
    },
    setLimits: function (a, b) {
        this.min = a;
        this.max = b;
    },
    setIgnore: function (a) {
        this.ignore_keys[a] = !0;
    },
    resetIgnore: function () {
        this.ignore_keys = [];
    },
    resetPoints: function () {
        this.points = [];
        this.points_keys = [];
        this.okpoints = [];
    },
    setXVals: function (a) {
        this.xvals = a;
    },
    linearGradientV: function (a, b) {
        for (var c = [], d, e = b.getColors(), f = this.getXY(0, e[0].value), g = this.getXY(0, e[e.length - 1].value), h = 0; h < e.length; h++)
            (d = parseFloat(e[h].value)), this.getXY(0, d), (c[h] = [(d - e[0].value) / (e[e.length - 1].value - e[0].value), b.getRGB(e[h].value) + "", 1]);
        b = this._getDefs();
        return this.svg.linearGradient(b, a, c, f[0], f[1], g[0], g[1], {
            gradientUnits: "userSpaceOnUse",
        });
    },
    linearGradientHD: function (a, b, c) {
        for (var d = [], e, f = this.getXY(this.xvals[0], 0), g = this.getXY(this.xvals[this.xvals.length - 1], 0), h = 0; h < this.xvals.length; h++)
            (e = parseFloat(a[h])), (d[h] = [(this.xvals[h] - this.xvals[0]) / (this.xvals[this.xvals.length - 1] - this.xvals[0]), c.getRGB(e) + "", 1]);
        a = this._getDefs();
        return this.svg.linearGradient(a, b, d, f[0], f[1], g[0], g[1], {
            gradientUnits: "userSpaceOnUse",
        });
    },
    bezierCtrlPoints: function (a, b, c, d, e, f, g, h, k) {
        var p = (a + c) / 2,
            q = (b + d) / 2,
            n = (c + e) / 2,
            m = (d + f) / 2;
        b = Math.sqrt((c - a) * (c - a) + (d - b) * (d - b));
        a = Math.sqrt((e - c) * (e - c) + (f - d) * (f - d));
        b /= b + a;
        a /= a + Math.sqrt((g - e) * (g - e) + (h - f) * (h - f));
        p += (n - p) * b;
        q += (m - q) * b;
        g = n + ((e + g) / 2 - n) * a;
        h = m + ((f + h) / 2 - m) * a;
        p = p + (n - p) * k + c - p;
        q = q + (m - q) * k + d - q;
        n = g + (n - g) * k + e - g;
        k = h + (m - h) * k + f - h;
        isNaN(p) && (p = c);
        isNaN(q) && (q = d);
        isNaN(n) && (n = e);
        isNaN(k) && (k = f);
        return [
            [p, q],
            [n, k],
        ];
    },
    getGPoints: function (a, b) {
        this.resetPoints();
        var c = [];
        b = b || {
            strokeWidth: 1,
        };
        for (var d = 0; d < this.xvals.length; d++) {
            var e = !1;
            if (a[d] < this.min || a[d] > this.max || this.ignore_keys[d]) e = !0;
            e || a[d] != parseFloat(a[d]) || (c[c.length] = this.getGPointXY(this.xvals[d], a[d], b.strokeWidth, d));
        }
        return c;
    },
    getGPointGroups: function (a, b, c) {
        this.resetPoints();
        c = WgUtil.updateObject(c, {
            max_x_diff: "auto",
            max_x_diff_n: 5,
        });
        a = this.getGPoints(a, b);
        b = !1;
        "auto" == c.max_x_diff ? (b = this._minXDiff() * c.max_x_diff_n) : !1 !== c.max_x_diff && (b = c.max_x_diff);
        if (!1 === b || 1 >= a.length) return [a];
        c = [];
        for (var d = [a[0]], e = 1; e < a.length; e++) a[e].xval - a[e - 1].xval > b && ((c[c.length] = new this.GPointGroup(d)), (d = [a[e]])), (d[d.length] = a[e]);
        c[c.length] = new this.GPointGroup(d);
        return c;
    },
    getCtrlPoints: function (a, b) {
        for (var c = a.length, d = [], e, f = 1; f < c - 2; f++)
            (e = this.bezierCtrlPoints(a[f - 1][0], a[f - 1][1], a[f][0], a[f][1], a[f + 1][0], a[f + 1][1], a[f + 2][0], a[f + 2][1], b)), (d[f + "_" + (f + 1)] = e[0]), (d[f + 1 + "_" + f] = e[1]);
        return d;
    },
    _lineSimple: function (a, b, c) {
        a = this.getGPointGroups(a, b, c);
        for (c = 0; c < a.length; c++) {
            var d = a[c].getPoints();
            this.svg.polyline(this.group, d, b);
        }
    },
    makePath: function (a, b, c, d) {
        c = this.svg.createPath();
        var e;
        if (2 > a.length) return c;
        0 < b && (e = this.getCtrlPoints(a, b));
        c.move(a[0][0], a[0][1]).line(a[1][0], a[1][1]);
        if (e) for (b = 1; b < a.length - 2; b++) c.curveC(e[b + "_" + (b + 1)][0], e[b + "_" + (b + 1)][1], e[b + 1 + "_" + b][0], e[b + 1 + "_" + b][1], a[b + 1][0], a[b + 1][1]);
        else for (b = 1; b < a.length - 2; b++) c.line(a[b + 1][0], a[b + 1][1]);
        c.line(a[a.length - 1][0], a[a.length - 1][1]);
        d && c.close();
        return c;
    },
    _minXDiff: function () {
        if (1 >= this.xvals.length) return !1;
        var a = this.xvals[1] - this.xvals[0];
        for (var b = 2; b < this.xvals.length; b++) this.xvals[b] - this.xvals[b - 1] < a && (a = this.xvals[b] - this.xvals[b - 1]);
        return a;
    },
    makePathsFromData: function (a, b, c, d) {
        d = WgUtil.updateObject(d, {
            max_x_diff: "auto",
            max_x_diff_n: 5,
        });
        var e = [];
        a = this.getGPointGroups(a, c, d);
        for (d = 0; d < a.length; d++)
            if (a[d].getPoints) {
                var f = a[d].getPoints();
                e[e.length] = this.makePath(f, b, c);
            }
        return e;
    },
    line: function (a, b, c, d) {
        c = WgUtil.updateObject(c, {
            fill: "none",
            stroke: "black",
            strokeWidth: 1,
        });
        b = b || 0;
        if (0 == b) this._lineSimple(a, c, d);
        else for (a = this.makePathsFromData(a, b, c, d), b = 0; b < a.length; b++) this.svg.path(this.group, a[b], c);
    },
    _areaSimple: function (a, b, c) {
        a = this.getGPointGroups(a, b, c);
        c = this.getXY(this.x.range[0], this.y.range[0], b.strokeWidth);
        for (var d = 0; d < a.length; d++) {
            var e = a[d].getPoints();
            e[e.length] = [e[e.length - 1][0], c[1]];
            e[e.length] = [e[0][0], c[1]];
            this.svg.polyline(this.group, e, b);
        }
    },
    area: function (a, b, c, d, e) {
        c = WgUtil.updateObject(c, {
            fill: "#aaaaaa",
            stroke: "#aaaaaa",
            strokeWidth: 1,
        });
        b = b || 0;
        if (0 == b) this._areaSimple(a, c, d);
        else
            for (a = this.getGPointGroups(a, c, d), e = void 0 !== e ? e : this.y.range[0], e = this.getGPointXY(this.x.range[0], e, c.strokeWidth), d = 0; d < a.length; d++)
                if (a[d].getPoints) {
                    var f = a[d].getPoints(),
                        g = a[d].getLast(),
                        h = a[d].getFirst();
                    f = this.makePath(f, b, c);
                    f.line(g.x, e.y);
                    f.line(h.x, e.y);
                    f.line(h.x, h.y);
                    this.svg.path(this.group, f, c);
                }
    },
    gridLineH: function (a, b) {
        b = WgUtil.updateObject(b, {
            fill: "none",
            stroke: "black",
            strokeWidth: 0.5,
            opacity: 0.2,
        });
        var c = this.getXY(this.x.range[0], a, b.strokeWidth);
        a = this.getXY(this.x.range[1], a, b.strokeWidth);
        this.svg.line(this.group, c[0], c[1], a[0], a[1], b);
    },
    gridLinesH: function (a, b) {
        b = WgUtil.updateObject(b, {
            fill: "none",
            stroke: "black",
            strokeWidth: 0.5,
            opacity: 0.2,
        });
        for (var c = 0; c < a.length; c++) a[c] > this.y.range[1] || a[c] < this.y.range[0] || this.gridLineH(a[c], b);
    },
    gridLineV: function (a, b) {
        b = WgUtil.updateObject(b, {
            fill: "none",
            stroke: "black",
            strokeWidth: 0.5,
            opacity: 0.2,
            "stroke-dasharray": "2,2",
        });
        var c = this.getXY(a, this.y.range[0], b.strokeWidth);
        a = this.getXY(a, this.y.range[1], b.strokeWidth);
        this.svg.line(this.group, c[0], c[1], a[0], a[1], b);
    },
    gridRect: function (a, b, c, d, e) {
        c = WgUtil.updateObject(c, {
            fill: "grey",
            stroke: "none",
            strokeWidth: 0,
            opacity: 0.2,
        });
        d = d || this.y.range[0];
        e = e || this.y.range[1];
        a = this.getXY(a, d, c.strokeWidth);
        b = this.getXY(b, e, c.strokeWidth);
        b[0] < a[0] || a[1] < b[1] || this.svg.rect(this.group, a[0], b[1], b[0] - a[0], a[1] - b[1], 0, 0, c);
    },
    gridRects: function (a, b) {
        b = WgUtil.updateObject(b, {
            fill: "grey",
            stroke: "none",
            strokeWidth: 0,
        });
        for (var c = 0; c < a.length; c++) this.gridRect(a[c][0], a[c][1], b);
    },
    gridLinesV: function (a, b) {
        b = WgUtil.updateObject(b, {
            fill: "none",
            stroke: "black",
            strokeWidth: 0.5,
            opacity: 0.2,
            "stroke-dasharray": "2,2",
        });
        for (var c = 0; c < a.length; c++) a[c] > this.x.range[1] || a[c] < this.x.range[0] || this.gridLineV(a[c], b);
    },
    texts: function (a, b, c) {
        c = WgUtil.updateObject(c, {
            "font-size": "10px",
            opacity: 1,
            "text-anchor": "middle",
        });
        b = WgUtil.updateObject(b, {
            ypos: this.y.range[1],
            skip: 0,
            offset_v: 2,
            offset_h: 0,
            hfit: 0,
        });
        for (var d, e = 0; e < a.length; e++) (d = this.getXY(this.xvals[e], b.ypos, c.strokeWidth)), this.svg.text(this.group, d[0] + b.offset_h, d[1] - b.offset_v, a[e], c);
    },
    text: function (a, b, c, d, e) {
        e = WgUtil.updateObject(e, {
            "font-size": "10px",
            opacity: 1,
            "text-anchor": "middle",
        });
        d = WgUtil.updateObject(d, {
            ypos: this.y.range[1],
            skip: 0,
            offset_v: 2,
            offset_h: 0,
            hfit: 0,
        });
        a = this.getXY(a, b, e.strokeWidth);
        d.hfit && (a[0] + d.hfit > this.pxwidth && (a[0] -= a[0] + d.hfit - this.pxwidth), 0 > a[0] - d.hfit && (a[0] += d.hfit - a[0]));
        this.svg.text(this.group, a[0] + d.offset_h, a[1] - d.offset_v, c, e);
    },
    grid: function (a, b, c, d) {
        d = WgUtil.updateObject(d, {
            fill: "none",
            stroke: "black",
            strokeWidth: 0.5,
            opacity: 0.08,
        });
        c = WgUtil.updateObject(c, {
            fill: "none",
            stroke: "black",
            strokeWidth: 0.5,
            opacity: 0.2,
        });
        if ("undefined" !== typeof b) for (var e = this.y.range[0]; e <= this.y.range[1]; e += b) e != this.y.range[0] && this.gridLineH(e, d);
        for (e = this.y.range[0]; e <= this.y.range[1]; e += a) e != this.y.range[0] && this.gridLineH(e, c);
    },
    legend: function (a, b, c, d, e, f, g) {
        a = WgUtil.updateObject(a, {
            fill: "none",
            stroke: "black",
            strokeWidth: 1,
            opacity: 0.2,
        });
        b = WgUtil.updateObject(b, {
            width: 20,
            left: 4,
            line_width: 25,
            line_left: 4,
            text_left: 26,
            text_offset: 3,
            desc_left: 26,
        });
        c = c || [];
        d = d || [];
        e = WgUtil.updateObject(e, {
            "font-size": "10px",
            opacity: 1,
            "text-anchor": "start",
        });
        f = f || "";
        g = WgUtil.updateObject(g, {
            "font-size": "10px",
            opacity: 1,
            "text-anchor": "middle",
        });
        var h = this.getXY(this.x.range[1], this.y.range[1], a.strokeWidth),
            k = this.getXY(0, this.y.range[0], a.strokeWidth);
        this.svg.rect(this.group, h[0] + b.left, h[1], b.width, Math.abs(k[1] - h[1]), 0, 0, a);
        for (k = 0; k < c.length; k++)
            c[k] > this.y.range[1] ||
                c[k] < this.y.range[0] ||
                ((h = this.getXY(this.x.range[1], c[k], a.strokeWidth)),
                this.svg.line(this.group, h[0] + b.line_left, h[1], h[0] + b.line_left + b.line_width, h[1], a),
                d[k] && this.svg.text(this.group, h[0] + b.text_left, h[1] - b.text_offset, "" + d[k], e));
        "" != f &&
            ((a = this.getXY(this.x.range[1], this.y.range[0] + (this.y.range[1] - this.y.range[0]) / 2, a.strokeWidth)),
            (b = this.svg.group(this.group, {
                transform: "translate(" + (a[0] + b.desc_left) + "," + a[1] + ") rotate(-90)",
            })),
            this.svg.text(b, 0, 0, f, g));
    },
    circles: function (a, b, c, d, e) {
        c = WgUtil.updateObject(c, {
            fill: "black",
            stroke: "none",
            strokeWidth: 0,
        });
        e = WgUtil.updateObject(e, {
            pxDistance: -1,
            numbers: {},
            round: 1,
            offset_v: -3,
            offset_h: 0,
        });
        b = b || 2;
        a = this.getGPoints(a, c);
        for (var f = {}, g = 0; g < a.length; g++)
            d && (c.fill = d.getRGB(a[g].val)),
                (-1 < e.pxDistance && f && this.pxDistance(a[g].x, a[g].y, f.x, f.y) < e.pxDistance) ||
                    (this.svg.circle(this.group, a[g].x, a[g].y, b, c),
                    e.numbers["font-size"] && ((f = Math.pow(10, e.round)), this.svg.text(this.group, a[g].x + e.offset_h, a[g].y - e.offset_v, e.print_vals ? e.print_vals[a[g].data_index] : "" + Math.round(a[g].val * f) / f, e.numbers)),
                    (f = a[g]));
    },
    rects: function (a, b, c, d, e, f) {
        d = WgUtil.updateObject(d, {
            fill: "black",
            stroke: "none",
            strokeWidth: 0,
        });
        f = WgUtil.updateObject(f, {
            fixed_v: !1,
        });
        a = this.getGPoints(a, d);
        for (var g = 0; g < a.length; g++)
            e && (d.fill = e.getRGB(a[g].val)), !1 !== f.fixed_v ? this.svg.rect(this.group, a[g].x - b / 2, f.fixed_v, b, c, 0, 0, d) : this.svg.rect(this.group, a[g].x - b / 2, a[g].y - c / 2, b, c, 0, 0, d);
    },
    bar: function (a, b, c, d) {
        c = WgUtil.updateObject(c, {
            fill: "#aaaaaa",
            stroke: "none",
            strokeWidth: 0,
        });
        b = b || 0.2;
        var e = 0;
        0 < c.strokeWidth % 2 && (e = 0.5);
        a = this.getGPoints(a, c);
        for (var f, g = (this.pxwidth / this.xvals.length) * (1 - b) - c.strokeWidth, h, k, p = g, q = 0; q < a.length; q++)
            (g = a[1] && a[1].x - a[0].x < p ? a[1].x - a[0].x - b : p),
                (k = Math.round(g)),
                (f = this.getXY(0, 0, c.strokeWidth)),
                (g = Math.round(a[q].x - g / 2) + e),
                (h = a[q].y),
                (f = Math.abs(f[1] - h)),
                this.invert && (h -= f),
                d && (c.fill = d.getRGB(a[q].val)),
                this.svg.rect(this.group, g, h, k, f, 0, 0, c);
    },
    numbers: function (a, b, c) {
        c = WgUtil.updateObject(c, {
            "font-size": "9px",
            opacity: 1,
            "text-anchor": "middle",
        });
        b = WgUtil.updateObject(b, {
            offset_v: 2,
            offset_h: 0,
            skip: 0,
            skip_start: 0,
            round: 0,
            margin_h: 3,
            margin_v: 3,
            fixed_v: !1,
            min_v: 0,
            precise: !1,
        });
        var d = Math.pow(10, b.round);
        a = this.getGPoints(a, c);
        var e = 0,
            f = 0;
        b.skip && (e = b.skip);
        b.skip_start && (f = b.skip);
        0 > e && (e = 0);
        0 > f && (f = 0);
        var g = 0,
            h = 0,
            k = 0,
            p = 0,
            q = 0;
        if (b.margin_h || b.margin_v) {
            p = "";
            for (var n = f; n < a.length; n += e + 1) {
                var m = b.print_vals ? b.print_vals[a[n].data_index] : "" + Math.round(a[n].val * d) / d;
                m.length > p.length && (p = m);
            }
            m = this.svg.text(this.group, 0, 0, p, c);
            var t = m.getBBox();
            p = t.width;
            q = t.height;
            m.remove && m.remove();
        }
        for (n = f; n < a.length; n += e + 1) {
            m = b.print_vals ? b.print_vals[a[n].data_index] : "" + Math.round(a[n].val * d) / d;
            var w = !0;
            f = a[n].x + b.offset_h;
            var B = a[n].y - b.offset_v;
            !1 !== b.fixed_v && (B = b.fixed_v);
            if ((b.margin_h || b.margin_v) && ca) {
                b.precise && ((t = ca.getBBox()), (k = t.width));
                t = B - q - h;
                var W = h - q - B;
                f - p / 2 - (g + k / 2) < b.margin_h && t < b.margin_v && W < b.margin_v && (w = !1);
            }
            if (w) {
                var ca = this.svg.text(this.group, f, B, m, c);
                g = f;
                h = B;
                k = p;
            }
        }
    },
    arrows: function (a, b, c) {
        if (a) {
            c = WgUtil.updateObject(c, {
                offset_v: 2,
                offset_h: 0,
                round: 0,
                min_distance: 8,
            });
            b = this.getGPoints(b);
            var d = this.svgArrow(),
                e = (skip_start = 0);
            c.skip && (e = c.skip);
            c.skip_start && (skip_start = c.skip);
            0 > e && (e = 0);
            0 > skip_start && (skip_start = 0);
            for (var f, g = skip_start; g < b.length; g += e + 1) {
                var h = a[g];
                if (h == parseFloat(h)) {
                    var k = !0;
                    c.min_distance && f && WgUtil.distance(b[g].point, f) < c.min_distance && (k = !1);
                    k &&
                        ((f = b[g].point),
                        (h = this.svg.group(this.group, {
                            transform: "translate(" + b[g].x + "," + (b[g].y - c.offset_v) + ") rotate(" + h + ",0,0) scale(0.12) ",
                        })),
                        this.svg.path(h, d, {
                            fill: "black",
                            strokeWidth: 0,
                        }));
                }
            }
        }
    },
    contourNumbers: function (a, b, c) {
        if (this.contour_bak) {
            b = WgUtil.updateObject(b, {
                "font-size": "9px",
                opacity: 0.35,
                "text-anchor": "middle",
            });
            a = WgUtil.updateObject(a, {
                offset_v: -3,
                offset_h: 0,
                px_spacing: 150,
                px_padding: 8,
                px_space: 13,
                skip: 0,
                round: 0,
            });
            for (var d, e = Math.pow(10, a.round), f, g = [], h, k, p, q = (ccntr = 0); q < this.contour_bak.length; q++)
                if (((h = this.contour_bak[q]), 0 == ccntr % (a.skip + 1))) {
                    d = c ? "" + c[h.level] : "" + Math.round(h.level * e) / e;
                    f = a.px_spacing;
                    for (var n = 0; n < h.pnts.length; n++)
                        if (((k = h.pnts[n]), !(k[0] < a.px_padding || k[0] > this.pxwidth - a.px_padding || k[1] < a.px_padding || k[1] > this.pxheight - a.px_padding))) {
                            0 < n && (f += WgUtil.distance(k, h.pnts[n - 1]));
                            var m;
                            if (!(m = f < a.px_spacing) && (m = 0 < a.px_space))
                                a: {
                                    m = k;
                                    for (var t = Math.round(m[0] / a.px_space), w = Math.round(m[1] / a.px_space), B = -1; 1 >= B; B++)
                                        for (var W = -1; 1 >= W; W++)
                                            if (((p = t + B + "_" + (w + W)), g[p])) {
                                                b: {
                                                    var ca = k;
                                                    p = g[p];
                                                    for (var J = 0; J < p.length; J++)
                                                        if (WgUtil.distance(ca, p[J]) < a.px_space) {
                                                            ca = !0;
                                                            break b;
                                                        }
                                                    ca = !1;
                                                }
                                                if (ca) {
                                                    m = !0;
                                                    break a;
                                                }
                                            }
                                    g[t + "_" + w] || (g[t + "_" + w] = []);
                                    g[t + "_" + w][g[t + "_" + w].length] = m;
                                    m = !1;
                                }
                            m || ((f = 0), this.svg.text(this.group, k[0] + a.offset_h, k[1] - a.offset_v, d, b));
                        }
                    ccntr++;
                }
        }
    },
    pxDistance: function (a, b, c, d) {
        return Math.sqrt(Math.pow(c - a, 2) + Math.pow(d - b, 2));
    },
    contours: function (a, b, c, d, e) {
        d = WgUtil.updateObject(d, {
            cliff: -999999,
            simplify: 0,
            smooth: 0,
        });
        e = WgUtil.updateObject(e, {
            fill: "none",
            stroke: "black",
            strokeWidth: 0.13,
        });
        if (b.length && (WG.timer("test", "contourstart..."), (a = WgUtil.deepCopy(a)))) {
            var f = a.x,
                g = a.y,
                h = a.z;
            if (!(3 > f.length || 3 > g.length)) {
                var k = h.length;
                for (a = 0; a < k; a++) h[a].push(d.cliff), h[a].unshift(d.cliff);
                var p = [];
                k = h[0].length;
                for (a = 0; a < k; a++) p[a] = d.cliff;
                h.push(p);
                h.unshift(p);
                f.push(f[f.length - 1] + (f[f.length - 1] - f[f.length - 2]));
                f.unshift(f[0] - (f[1] - f[0]));
                g.push(g[g.length - 1] + (g[g.length - 1] - g[g.length - 2]));
                g.unshift(g[0] - (g[1] - g[0]));
                a = new Conrec();
                WG.timer("test", "predconrec");
                a.contour(h, 0, f.length - 1, 0, g.length - 1, f, g, b.length, b);
                WG.timer("test", "poconrec");
                b = a.contourList();
                this.contour_bak = [];
                g = [];
                for (f = 0; f < b.length; f++) {
                    h = b[f];
                    b[f].pnts = [];
                    for (a = 0; a < h.length; a++) h.pnts[h.pnts.length] = this.getXY(h[a].x, h[a].y, 0);
                    h.area = this.polygonArea(h.pnts);
                    0 < h.area && (g[g.length] = h);
                }
                b = g;
                b.sort(function (a, b) {
                    return b.area - a.area;
                });
                for (f = 0; f < b.length; f++)
                    (h = b[f]), (a = 0 < d.simplify ? this.douglasPeucker(h.pnts, d.simplify) : h.pnts), (a = this.makePath(a, d.smooth)), a.close(), (g = c.getRGB(b[f].level)), (e.fill = g), this.svg.path(this.group, a, e);
                this.contour_bak = b;
            }
        }
    },
    polygonArea: function (a) {
        for (var b = 0, c, d, e = a.length, f = 0; f < e; f++) (c = a[f]), (d = f + 1 == e ? a[0] : a[f + 1]), (b = b + c[0] * (d[1] - c[1]) - c[1] * (d[0] - c[0]));
        return Math.abs(b / 2);
    },
    polygonPerimeter: function (a) {
        for (var b = 0, c, d, e = a.length, f = 0; f < e; f++) (c = a[f]), (d = f + 1 == e ? a[0] : a[f + 1]), (b += WgUtil.distance(c, d));
        return b;
    },
    barbs2d: function (a, b, c) {},
    arrows2d: function (a, b) {
        b = WgUtil.updateObject(b, {
            offset_v: 0,
            offset_h: 0,
            skip_x: 0,
            skip_y: 0,
            size_x: 6,
            size_y: 10,
        });
        var c = WgUtil.updateObject(c, {
            fill: "none",
            strokeWidth: 1,
            stroke: "black",
            opacity: 0.5,
        });
        if (a) {
            var d = a.x,
                e = a.y;
            if (a.z && !(0 > b.skip_x || 0 > b.skip_y)) {
                a = a.z;
                var f = this.svg.createPath();
                f.move(0, -0.5 * b.size_y)
                    .line(0, 0.5 * b.size_y)
                    .move(0.5 * b.size_x, 0.1 * b.size_y)
                    .line([
                        [0, 0.5 * b.size_y],
                        [-0.5 * b.size_x, 0.1 * b.size_y],
                    ]);
                for (var g = 0; g < a.length; g += b.skip_x + 1)
                    for (var h = 0; h < a[g].length; h += b.skip_y + 1) {
                        var k = a[g][h];
                        var p = this.getXY(d[g], e[h], c.strokeWidth);
                        k = this.svg.group(this.group, {
                            transform: "translate(" + p[0] + "," + (p[1] - b.offset_v) + ") rotate(" + k + ",0,0) ",
                        });
                        this.svg.path(k, f, c);
                    }
            }
        }
    },
    douglasPeucker: function (a, b) {
        for (var c = [], d = a.length, e = 0; e < d; e++)
            c[e] = {
                x: a[e][0],
                y: a[e][1],
            };
        c = (function (a, b) {
            var c = function (a, b) {
                    this.p1 = a;
                    this.p2 = b;
                    this.distanceToPoint = function (a) {
                        var b = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x),
                            c = this.p1.y - b * this.p1.x,
                            d = [];
                        0 != this.p2.x - this.p1.x && d.push(Math.abs(a.y - b * a.x - c) / Math.sqrt(Math.pow(b, 2) + 1));
                        d.push(Math.sqrt(Math.pow(a.x - this.p1.x, 2) + Math.pow(a.y - this.p1.y, 2)));
                        d.push(Math.sqrt(Math.pow(a.x - this.p2.x, 2) + Math.pow(a.y - this.p2.y, 2)));
                        return d.sort(function (a, b) {
                            return a - b;
                        })[0];
                    };
                },
                d = function (a, b) {
                    if (2 >= a.length) return [a[0]];
                    for (var e = [], f = new c(a[0], a[a.length - 1]), g = 0, h = 0, k = 1; k <= a.length - 2; k++) {
                        var p = f.distanceToPoint(a[k]);
                        p > g && ((g = p), (h = k));
                    }
                    g >= b ? ((g = a[h]), f.distanceToPoint(g, !0), (e = e.concat(d(a.slice(0, h + 1), b))), (e = e.concat(d(a.slice(h, a.length), b)))) : ((g = a[h]), f.distanceToPoint(g, !0), (e = [a[0]]));
                    return e;
                };
            b = d(a, b);
            b.push(a[a.length - 1]);
            return b;
        })(c, b);
        d = c.length;
        a = [];
        for (e = 0; e < d; e++) a[e] = [c[e].x, c[e].y];
        return a;
    },
});
var WG = {
    _debug: !1,
    api_path: "/int/iapi.php",
    api_hostname: window.location.hostname,
    getApi: function (a) {
        return "https://" + this.api_hostname + this.api_path;
    },
    log: function (a) {
        this._debug && console.log.apply(this, arguments);
    },
    logTime: function (a) {
        this._debug && console.time("TIMING: " + a);
    },
    logTimeEnd: function (a) {
        this._debug && console.timeEnd("TIMING: " + a);
    },
    _cache: {},
    _timers: {},
    _get: {},
    _superuser: !1,
    _ads: {
        allow_personal_ads: !1,
    },
    TOUCHDEVICE: "ontouchstart" in window ? !0 : !1,
    isTouchDevice: function () {
        return !!("ontouchstart" in window);
    },
    HIDDENSCROLL: Modernizr.hiddenscroll ? !0 : !1,
    isNativeDate: function () {
        return Modernizr.inputtypes.date && Modernizr.touchevents && -1 === navigator.appVersion.indexOf("Win") && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
    },
    isIos: function () {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },
    isAndroid: function () {
        return /(android)/i.test(navigator.userAgent);
    },
    isRunningiOSStandalone: function () {
        return window.navigator.standalone;
    },
    isRunningAndroidStandalone: function () {
        return window.matchMedia("(display-mode: standalone)").matches;
    },
    isRunningStandalone: function () {
        return WG.isRunningiOSStandalone() || WG.isRunningAndroidStandalone();
    },
    jqueryVersion: function () {
        return $.fn.jquery;
    },
    user: {},
    global: {},
    LNG: {},
    conf: {
        map: {},
        user: {},
    },
    cdn: "",
    dirNum: function (a) {
        var b;
        0 <= a && (b = 0);
        11.25 <= a && (b = 1);
        33.75 <= a && (b = 2);
        56.25 <= a && (b = 3);
        78.75 <= a && (b = 4);
        101.25 <= a && (b = 5);
        123.75 <= a && (b = 6);
        146.25 <= a && (b = 7);
        168.75 <= a && (b = 8);
        191.25 <= a && (b = 9);
        213.75 <= a && (b = 10);
        236.25 <= a && (b = 11);
        258.75 <= a && (b = 12);
        281.25 <= a && (b = 13);
        303.75 <= a && (b = 14);
        326.25 <= a && (b = 15);
        348.75 <= a && (b = 0);
        return b;
    },
    clone: function (a) {
        return Object.assign({}, a);
    },
    deepClone: function (a) {
        return JSON.parse(JSON.stringify(a));
    },
    getCDNsource: function (a) {
        return WG.cdn ? WG.cdn + a : a;
    },
    svgArrowInline: function (a) {
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 100 100"><g transform="rotate(' +
            (180 + parseInt(a)) +
            ',50,50) translate(0,5)"><path d="m50,0 -20,30 16,-3 -3,63 14,0 -3,-63 16,3 -20,-30z" fill="black" stroke-width="0"></path></g></svg>'
        );
    },
    svgWgLogoInline: function (a, b, c) {
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 800 550"><g transform="translate(-0.8843987,-231.09524)"><path stroke="' +
            (b || "#000") +
            '" stroke-dasharray="none" stroke-miterlimit="4" stroke-width="' +
            (void 0 !== c ? c : "25") +
            '" fill="' +
            (a || "#1a1a1a") +
            '" d="M429.69,236.87c-169.12-9.19-323.91,64.35-347.89,182.09-42.909,210.67,302.57,297.78,471.42,207.79-65.4,118.95-343.75,106.42-547.34-40.72,215.85,285.78,671.44,216.7,714.08,7.38,42.63-209.31-302.57-297.78-471.42-207.79,65.4-118.95,343.76-106.63,547.34,40.51-94.43-125.03-234.65-182.12-366.19-189.26z"/></g></svg>'
        );
    },
    svgWgMarkerInline: function (a, b, c, d) {
        a =
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 450 430"><g transform="matrix(0.98888889,0,0,0.99132865,225,-340.0014)"><path fill="#000" stroke="#000" stroke-width="5" stroke-dasharray="none" stroke-miterlimit="4" d="m-410,532-73.61-127.5,147.2,0z" transform="matrix(0.67923558,0,0,0.86310473,278.48659,312.87415)"/><path stroke="' +
            (b || "#000") +
            '" stroke-dasharray="none" fill="' +
            (a || "#000") +
            '" stroke-width="' +
            (void 0 !== c ? c : "10") +
            '" d="M-185,467c-20.1,130.8,180,175,275,115-35,75-195,75-315-10,130,170,390,115,410-15s-180-175-275-115c35-75,195-75,315,10-130-170-390-115-410,15z" /></g>';
        d && (a += '<path stroke-width=".5701" fill="#ffea00" d="m397.2 332.7-80.93-51.88-80.69 52.33 24.29-93.04-74.68-60.6 95.98-5.611 34.53-89.77 35.01 89.61 96.06 5.08-74.4 61z"/>');
        return a + "</svg>";
    },
    svgWgStationInline: function (a, b, c, d, e) {
        var f;
        d = f = "";
        null !== e && (d = ' opacity="' + e + '"');
        e = "#ffffff";
        null !== a && (e = WgColors.wind.getRGB(a));
        null !== b && (f = '<g transform="rotate(' + b + ',600,182)"><path d="m601,781-200-292,160,89.2-30-337,140,0-30,337,160-89.2z" stroke-linecap="round" stroke-miterlimit="4" stroke-width="0" stroke="#000" fill="#000"/></g>');
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><g transform="translate(0,419)"' +
            d +
            ">" +
            f +
            '<g><path stroke-linejoin="round" d="M630-113c-169-10-324,70.4-348,199-43,230,302,325,471,227-65,130-343,116-547-45,216,312,671,237,714,8,42-228-303-325-471-226,65-130,343-116,547,44.2-95-136-235-199-366-207z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-width="15" fill="' +
            e +
            '"/><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="180px" y="245" x="600" fill="#000000">' +
            c +
            "</text></g></g></svg>"
        );
    },
    svgLwStationInline: function (a, b, c, d, e) {
        var f;
        d = f = "";
        null !== e && (d = ' opacity="' + e + '"');
        e = "#ffffff";
        null !== a && (e = WgColors.wind.getRGB(a));
        null !== b && (f = '<g transform="rotate(' + b + ',600,182)"><path d="m601,781-200-292,160,89.2-30-337,140,0-30,337,160-89.2z" stroke-linecap="round" stroke-miterlimit="4" stroke-width="0" stroke="#000" fill="#000"/></g>');
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><g transform="translate(0,419)"' +
            d +
            ">" +
            f +
            '<g><circle cx="600" cy="181" r="280" stroke="black" stroke-width="18" fill="' +
            e +
            '" /><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="180px" y="245" x="600" fill="#000000">' +
            c +
            "</text></g></g></svg>"
        );
    },
    svgWgStationInlineSimple: function (a, b, c) {
        var d = "";
        null !== c && (d = ' opacity="' + c + '"');
        c = "#ffffff";
        null !== a && (c = WgColors.wind.getRGB(a));
        return (
            '<svg height="100%" width="100%" version="1.1" viewBox="0 0 805 604.48305"><g transform="translate(-198.5,121.33693) scale(1 0.9)"' +
            d +
            '><g><path stroke-linejoin="round" d="M630-113c-169-10-324,70.4-348,199-43,230,302,325,471,227-65,130-343,116-547-45,216,312,671,237,714,8,42-228-303-325-471-226,65-130,343-116,547,44.2-95-136-235-199-366-207z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-width="15" fill="' +
            c +
            '"/><text font-size="180px" text-anchor="middle" xml:space="preserve" y="245" x="600" font-weight="normal" fill="#000000">' +
            b +
            "</text></g></g></svg>"
        );
    },
    svgLwStationInlineSimple: function (a, b, c) {
        c = "#ffffff";
        null !== a && (c = WgColors.wind.getRGB(a));
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><circle cx="600" cy="181" r="280" stroke="black" stroke-width="18" fill="' +
            c +
            '" /><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="180px" y="245" x="600" fill="#000000">' +
            b +
            "</text></svg>"
        );
    },
    svgWgStationClusterInline: function (a, b, c, d) {
        var e = "#FFFFFF";
        void 0 !== a && (e = WgColors.wind.getRGB(a));
        a = void 0 !== c ? WgColors.wind.getRGB(c) : e;
        d = void 0 !== d ? WgColors.wind.getRGB(d) : e;
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><g stroke-dasharray="none" stroke="#000" stroke-miterlimit="4" fill="#0FF"><g transform="matrix(1.2707362,0,0,1.2983767,-1159.5311,370.36006)" stroke-width="1.29944348"><path opacity="0.5" stroke-linejoin="round" d="m1420-168c-198-11.7-380,82.6-408,234-50.5,270,354,381,553,266-76.3,153-403,136-642-52.8,254,366,788,278,838,9.39,50-267-360-381-550-265,76.3-153,403-136,642,51.9-112-160-276-234-430-243z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-width="5" fill="' +
            a +
            '"/></g><g transform="matrix(1.0875495,0,0,1.1112053,-903.59603,405.74641)" stroke-width="3.85553479"><path opacity="0.7" stroke-linejoin="round" d="m1420-168c-198-11.7-380,82.6-408,234-50.5,270,354,381,553,266-76.3,153-403,136-642-52.8,254,366,788,278,838,9.39,50-267-360-381-550-265,76.3-153,403-136,642,51.9-112-160-276-234-430-243z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-width="8" fill="' +
            e +
            '"/></g><path stroke-linejoin="round" d="M629,286c-177-10-339,76-364,213-45,247,316,348,493,243-68,140-359,125-573-48,226,336,703,254,748,9,44-244-317-348-493-242,68-139,359-124,570,47-97-145-243-213-381-221z" fill-rule="nonzero" stroke-linecap="round" stroke-width="10"  fill="' +
            d +
            '"/><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="180px" y="650" x="600" fill="#000000">' +
            b +
            "</text></g></svg>"
        );
    },
    svgLwStationClusterInline: function (a, b, c, d) {
        var e = "#FFFFFF";
        void 0 !== a && (e = WgColors.wind.getRGB(a));
        a = void 0 !== c ? WgColors.wind.getRGB(c) : e;
        d = void 0 !== d ? WgColors.wind.getRGB(d) : e;
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><circle opacity="0.5" cx="600" cy="600" r="430" stroke="black" stroke-width="13" fill="' +
            a +
            '" /><circle opacity="0.7" cx="600" cy="600" r="350" stroke="black" stroke-width="15" fill="' +
            e +
            '" /><circle cx="600" cy="600" r="270" stroke="black" stroke-width="18" fill="' +
            d +
            '" /><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="180px" y="650" x="600" fill="#000000">' +
            b +
            "</text></svg>"
        );
    },
    svgWgClusterInline: function (a, b, c, d) {
        c = c || 180;
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><g stroke-dasharray="none" stroke="#000" stroke-miterlimit="4" fill="#0FF"><g transform="matrix(1.2707362,0,0,1.2983767,-1159.5311,370.36006)" stroke-width="1.29944348"><path opacity="0.5" stroke-linejoin="round" d="m1420-168c-198-11.7-380,82.6-408,234-50.5,270,354,381,553,266-76.3,153-403,136-642-52.8,254,366,788,278,838,9.39,50-267-360-381-550-265,76.3-153,403-136,642,51.9-112-160-276-234-430-243z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-width="5" fill="' +
            a +
            '"/></g><g transform="matrix(1.0875495,0,0,1.1112053,-903.59603,405.74641)" stroke-width="3.85553479"><path opacity="0.7" stroke-linejoin="round" d="m1420-168c-198-11.7-380,82.6-408,234-50.5,270,354,381,553,266-76.3,153-403,136-642-52.8,254,366,788,278,838,9.39,50-267-360-381-550-265,76.3-153,403-136,642,51.9-112-160-276-234-430-243z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-width="8" fill="' +
            a +
            '"/></g><path stroke-linejoin="round" d="M629,286c-177-10-339,76-364,213-45,247,316,348,493,243-68,140-359,125-573-48,226,336,703,254,748,9,44-244-317-348-493-242,68-139,359-124,570,47-97-145-243-213-381-221z" fill-rule="nonzero" stroke-linecap="round" stroke-width="10"  fill="' +
            a +
            '"/><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="' +
            c +
            '" y="' +
            (660 + (c - 180) / 2) +
            '" x="600" fill="#000000" stroke="' +
            (d || "#000") +
            '">' +
            b +
            "</text></g></svg>"
        );
    },
    svgWgSimpleClusterInline: function (a, b, c, d) {
        c = c || 180;
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><g stroke-dasharray="none" stroke="none" stroke-miterlimit="4" fill="#0FF"><g transform="matrix(1.0875495,0,0,1.1112053,-903.59603,405.74641)" stroke-width="3.85553479"><path opacity="0.3" stroke-linejoin="round" d="m1420-168c-198-11.7-380,82.6-408,234-50.5,270,354,381,553,266-76.3,153-403,136-642-52.8,254,366,788,278,838,9.39,50-267-360-381-550-265,76.3-153,403-136,642,51.9-112-160-276-234-430-243z" fill-rule="nonzero" stroke="none" stroke-linecap="round" stroke-miterlimit="4" stroke-width="8" fill="' +
            a +
            '"/></g><path stroke-linejoin="round" d="M629,286c-177-10-339,76-364,213-45,247,316,348,493,243-68,140-359,125-573-48,226,336,703,254,748,9,44-244-317-348-493-242,68-139,359-124,570,47-97-145-243-213-381-221z" fill-rule="nonzero" stroke-linecap="round" stroke-width="10"  fill="' +
            a +
            '"/><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="' +
            c +
            '" y="' +
            (660 + (c - 180) / 2) +
            '" x="600" style="stroke: none; fill: ' +
            (d || "#000") +
            '">' +
            b +
            "</text></g></svg>"
        );
    },
    svgCloseButton: function () {
        return '<svg viewBox="0 0 24 24"><path d="M22.2,4c0,0,0.5,0.6,0,1.1l-6.8,6.8l6.9,6.9c0.5,0.5,0,1.1,0,1.1L20,22.3c0,0-0.6,0.5-1.1,0L12,15.4l-6.9,6.9c-0.5,0.5-1.1,0-1.1,0L1.7,20c0,0-0.5-0.6,0-1.1L8.6,12L1.7,5.1C1.2,4.6,1.7,4,1.7,4L4,1.7c0,0,0.6-0.5,1.1,0L12,8.5l6.8-6.8c0.5-0.5,1.1,0,1.1,0L22.2,4z"></path></svg>';
    },
    htmlCloseButton: function (a) {
        return '<div class="close-button ' + (a || "") + '">' + WG.svgCloseButton() + "</div>";
    },
    logout: function (a) {
        WG.user.logout();
    },
    loginRequired: function (a, b) {
        WG._TMP_afterLoginFn =
            a ||
            function () {
                location.reload();
            };
        WG.modalForm(
            {
                form_url: "/forms/login.php",
                api_data: {
                    q: "wg_login",
                },
                callback: function (a, b) {
                    b.close();
                    WG._TMP_afterLoginFn(a.data.pro);
                    WG._TMP_afterLoginFn = function () {};
                },
            },
            {
                title: (b ? "PRO " : "") + "Login required!",
            }
        );
    },
    checkUser: function (a, b, c) {
        c = c || !1;
        WG.qApi(
            {
                q: "current_user",
            },
            function (d) {
                d.id_user && d.login ? (c ? (d.pro ? a(!0) : b()) : a(d)) : b();
            },
            !0
        );
    },
    addCustomSpot: function (a, b) {
        var c = function () {
            var c = WG.modalForm(
                {
                    form_url: "/forms/custom_spot.php?id_spot=0&lat=" + a + "&lon=" + b,
                    api_data: {
                        q: "edit_custom_spot",
                        id_spot: 0,
                    },
                    callback: function () {
                        WG.loadAjaxContent("/settings.php?formid=set_spot_custom", "hcenter vcenter");
                        c.close();
                    },
                    callback_delay: 500,
                },
                {
                    title: "New custom spot",
                }
            );
        };
        WG.checkUser(
            function () {
                c();
            },
            function () {
                WG.loginRequired(c);
            }
        );
    },
    notice: function (a, b) {
        a = {
            content: a,
            autoClose: 3000,
            attributes: {
                x: "right",
                y: "top",
            },
            stack: !0,
            color: "red",
            target: $("body"),
        };
        b = $.extend({}, a, b);
        new jBox("Notice", b);
    },
    loadModels: function (a, b) {
        var c = this,
            d = {
                q: "model_info_full",
            };
        b && (d.virtual = 1);
        WG._superuser || (d.WGCACHEABLE = 120);
        WG.qApi(
            d,
            function (b) {
                var d = {},
                    e;
                for (e in b) d[e] = new WG.Model(b[e]);
                c.models = d;
                a && a(d);
            },
            !0
        );
    },
    loadMapModels: function (a) {
        var b = this,
            c = {
                q: "model_info_full",
            };
        WG._superuser || (c.WGCACHEABLE = 120);
        WG.qApi(
            c,
            function (c) {
                var d = {},
                    f;
                for (f in c) d[f] = new WG.MapModel(c[f]);
                b.mapmodels = d;
                a && a(d);
            },
            !0
        );
    },
    apiStore: function (a) {
        this._api_store = a ? !0 : !1;
    },
    apiOffline: function (a) {
        this._api_offline = a ? !0 : !1;
    },
    apiP: function (a, b, c) {
        c = c || {};
        c.post = !0;
        WG.apiG(a, b, c);
    },
    apiG: function (a, b, c) {
        c = c || {};
        var d = c.cache || !1,
            e = c.refresh || !1,
            f = c.msg_target || !1,
            g = c.msg_delay || !1,
            h = c.storage_param_ignore || [];
        c.post = c.post ? !0 : !1;
        WG.qApi(a, b, d, e, f, g, h, c.post, c);
    },
    qApiPost: function (a, b, c, d, e, f, g, h) {
        WG.qApi(a, b, c, d, e, f, g, !0, h);
    },
    qApi: function (a, b, c, d, e, f, g, h, k) {
        k = $.extend(
            {},
            {
                spinner: !0,
            },
            k
        );
        var cache_key = "qApi:" + JSON.stringify(a),
            q;
        e && (q = e instanceof jQuery ? e : $(e));
        d && delete WG._cache[cache_key];
        if (c && b && WG._cache[cache_key]) b(JSON.parse(WG._cache[cache_key])), WG.log("get cache: " + cache_key);
        else {
            $.param(a);
            d = WG.parseUrl(this.getApi(a));
            var n = d.search ? d.search.substr(1) : "";
            $.each(a, function (a, b) {
                null === b && (b = "");
                "undefined" == typeof b && (b = "");
                n += (n ? "&" : "") + a + "=" + b;
            });
            window.md5 && n && ((d = WG._get_mha(n)), (n += "&_mha=" + d), (a._mha = d));
            if (WG._api_offline) {
                if (WG._api_store && WG.storage)
                    return (
                        WG.log("GET KEY:" + cache_key),
                        WG.storage.getApi(
                            a,
                            function (a) {
                                b && (WG.log("GET ITEM:"), WG.log(a), a ? b(a) : (WG.loadFailThrottled(), k.spinner && WG.spinnerOff()));
                            },
                            g
                        )
                    );
            } else
                return $.ajax({
                    dataType: "json",
                    url: k.api ? k.api : this.getApi(a),
                    data: a,
                    type: h ? "POST" : "GET",
                    success: function (d) {
                        d ||
                            (d = {
                                return: "error",
                                message: "API error!",
                            });
                        q && d.message && WG.message(d.message, "error" == d["return"] ? !0 : !1, q, f);
                        var e = !1;
                        d["return"] && "error" == d["return"] && (e = !0);
                        k.spinner && WG.spinnerOff();
                        b && b(d, e);
                        if (e) return !1;
                        c && ((WG._cache[cache_key] = JSON.stringify(d)), WG.log("set cache: " + p));
                        WG._api_store && WG.storage && WG.storage.setApi(a, d, !1, g);
                    },
                }).fail(function () {
                    WG.loadFailThrottled();
                    k.spinner && WG.spinnerOff();
                });
        }
    },
    message: function (a, b, c, d) {
        c || (c = []);
        c.visible ||
            (c.visible = function () {
                return !0;
            });
        if (c.length && c.visible()) {
            var e = $('<div style="display:none" class="form-hlaska' + (b ? " error" : "") + '">' + a + "</div>");
            c.empty().append(e.fadeIn(100));
            d &&
                setTimeout(function () {
                    e.remove();
                }, d);
            e.on("click", function (a) {
                e.remove();
                a.preventDefault();
            });
        } else
            WG.notice(a, {
                autoClose: d,
                color: b ? "red" : "green",
            });
    },
    timer: function (a, b) {
        var c = new Date().getTime();
        this._timers[a] ? (this._debug && WG.log("[" + a + "]: " + (c - this._timers[a][0]) + " ms (total: " + (c - this._timers[a][1]) + ")" + (b ? " " + b : "")), (this._timers[a][0] = c)) : (this._timers[a] = [c, c]);
    },
    settings: {
        wj: "knots",
        tj: "c",
        waj: "m",
        odh: 3,
        doh: 22,
        fhourrs: 240,
        wrap: 999,
    },
    getMaxWidth: function (a, b) {
        a = $(window).width() - 2 * a;
        return a > b ? b : a;
    },
    getMaxHeight: function (a, b) {
        b = b || $(window).height();
        a = $(window).height() - 2 * a;
        return a > b ? b : a;
    },
    getOptimalHeight: function (a, b, c) {
        var d = $(window).height();
        a = parseInt((d * a) / 100);
        return a > c ? c : a < b ? b : a;
    },
    modalForm: function (a, b) {
        var c = {
            ok_close: !0,
            max_width: null,
            max_height: null,
            padding_h: 0,
            padding_v: 0,
            title: "&nbsp;",
            callback: function (a, b) {
                WG.log(b);
                b.close();
            },
        };
        $.extend(c, a);
        var d;
        a = {
            title: c.clicked ? $(c.clicked).data("title") : c.title,
            overlay: !0,
            closeButton: "title",
            maxHeight: this.getMaxHeight(16),
            maxWidth: this.getMaxWidth(0),
            reposition: !0,
            closeOnEsc: !0,
            blockScroll: !0,
            fixed: !0,
            closeOnClick: "overlay",
            onOpen: function () {
                d = $(window).scrollTop();
                this.toFront();
            },
            onClose: function () {
                setTimeout(function () {
                    $(window).scrollTop(d);
                }, 10);
            },
            onCloseComplete: function () {
                this.destroy();
            },
        };
        $.extend(a, b);
        return this.form(c, a);
    },
    windowForm: function (a, b) {
        b = $.extend(
            {
                draggable: "title",
                overlay: !1,
            },
            b
        );
        return this.modalForm(a, b);
    },
    inlineForm: function (a) {
        return this.form(a, !1);
    },
    _get_mha: function (a) {
        return md5("wgsec-" + a).substr(-18, 8);
    },
    formErrorShow: function (a, b, c) {
        WG.formErrorHide(a, b);
        var d = a.find("[name='" + b + "']");
        d.parent().addClass("input-error");
        a.find("label[for='" + b + "']").addClass("input-error");
        c && d.after('<div class="form-info error">' + c + "</div>");
    },
    formErrorHide: function (a, b) {
        a = a.find("[name='" + b + "']");
        a.parent().removeClass("input-error");
        a.parent().find(".form-info.error").remove();
    },
    allFormClose: function () {
        if (WG._all_form_jbox) {
            for (var a = 0; a < WG._all_form_jbox.length; a++) WG._all_form_jbox[a].close();
            WG._all_form_jbox = [];
        }
    },
    form: function (a, b) {
        var c = this,
            d = a.clicked || null,
            e = d ? $(d) : null,
            f;
        d && e.data("setdata") && (f = WG[e.data("setdata")]);
        var g = {
            clicked: d,
            form_id: null,
            form_url: null,
            form_url_data: {},
            api_data: {
                q: d ? e.data("q") : "",
            },
            api: this.getApi(),
            reply_target: !0,
            reply_close: !1,
            ok_hlaska: !0,
            onLoaded: function (a) {},
            callback: function (a) {
                WG.log(a);
            },
            callback_delay: 0,
        };
        $.extend(g, a);
        WG.gae("Form", "open", g.api_data.q);
        var h = function (a, b, c) {
            if (b || g.ok_hlaska)
                c
                    ? WG.message(a, b, c, g.reply_close)
                    : WG.notice(a, {
                          autoClose: g.reply_close,
                          color: b ? "red" : "green",
                      });
        };
        c.files = {};
        var k = function (a) {
                c.files[a.target.name] = a.target.files;
            },
            p = function (a, b) {
                a.find("input[type=file]").on("change", k);
                var d = a.find("input[type=file]").length;
                f &&
                    a.find("[name]").each(function () {
                        var a = $(this),
                            b = f[this.name];
                        this.name in f && a.val(b);
                    });
                a.find(".modal-confirm").jBox("Confirm", {
                    confirmButton: "OK",
                    blockScroll: !1,
                });
                WG.makeModalForms(a.find(".modal-form"));
                a.submit(function (e) {
                    e.preventDefault();
                    var f = a.find('input[type="submit"],button[type="submit"]');
                    f.prop("disabled", !0);
                    var k = a.find(".target-hlaska");
                    (g.reply_target && k.length) || (k = !1);
                    var n = new FormData();
                    e = a.serializeArray();
                    var p = "";
                    $.each(e, function (a, b) {
                        n.append(b.name, b.value);
                        p += "&" + b.name + "=" + b.value;
                    });
                    $.each(g.api_data, function (a, b) {
                        n.append(a, b);
                        p += "&" + a + "=" + b;
                    });
                    0 < d &&
                        $.each(c.files, function (a, b) {
                            $.each(b, function (b, c) {
                                n.append(a, c);
                            });
                        });
                    e = p ? p.substr(1) : "";
                    var m = WG.parseUrl(g.api);
                    m.search && (e = m.search.substr(1) + "&" + e);
                    window.md5 && e && ((m = WG._get_mha(e)), (e += "&_mha=" + m), n.append("_mha", m));
                    $.ajax({
                        url: g.api,
                        type: "POST",
                        data: n,
                        cache: !1,
                        dataType: "json",
                        processData: !1,
                        contentType: !1,
                        success: function (c, d, e) {
                            if (c["return"])
                                if ((a.find("label").removeClass("input-error"), a.find(".form-info.error").remove(), "error" == c["return"])) {
                                    if (c.errors) for (var n in c.errors) WG.formErrorShow(a, n, c.errors[n]);
                                    WG.gae("Form", "error", g.api_data.q);
                                    h(c.message, !0, k);
                                    $(window).trigger("resize");
                                    f.prop("disabled", !1);
                                } else {
                                    if ("OK" == c["return"]) {
                                        var p = g.callback;
                                        (d = $(g.clicked).data("callback")) && (p = window.WG[d]);
                                        h(c.message, !1, k);
                                        f.prop("disabled", !1);
                                        setTimeout(function () {
                                            WG.gaec(
                                                function () {
                                                    p(c, b);
                                                },
                                                "Form",
                                                "OK",
                                                g.api_data.q
                                            );
                                        }, g.callback_delay);
                                    }
                                }
                            else h("API error", !0, k);
                        },
                        error: function (a, b, c) {
                            WG.log("ERRORS: " + b);
                            h(WG.loadFailMessage(), !0, k);
                            f.prop("disabled", !1);
                        },
                    });
                });
            };
        if (b) {
            var q = new jBox("Modal", b);
            $(window).on("resize", function () {
                q.content && (q.content.css("max-height", WG.getMaxHeight(20)), q.position());
            });
        }
        var n = function (a, b) {
            b && (b.setContent(a), b.open());
            g.onLoaded(a);
            p(a, b);
            return b;
        };
        var m = g.form_id ? $("#" + g.form_id) : $('<form class="wg-form"></form>');
        q && (WG._all_form_jbox || (WG._all_form_jbox = []), WG._all_form_jbox.push(q));
        if ("" == $.trim(m.html())) {
            var t = g.form_url;
            !t && g.clicked && ((t = $(g.clicked).attr("href")) || (t = $(d).data("href")), (a = WG.baseURL ? WG.baseURL : ""), "http" != t.substr(0, 4) && (t = a + t));
            WG.spinnerOn();
            q.reloadForm = function () {
                $.get(t, g.form_url_data, function (a) {
                    m.empty().html(a);
                    q = n(m, q);
                });
            };
            $.get(t, g.form_url_data, function (a) {
                m.empty().html(a);
                WG.spinnerOff();
                return n(m, q);
            }).fail(function () {
                WG.loadFailThrottled();
                WG.spinnerOff();
            });
            return q;
        }
        return n(m, q);
    },
    fnWithTimeout: function (a, b) {
        var c = !1;
        setTimeout(function () {
            c || a();
        }, b || 1000);
        return function () {
            c || ((c = !0), a());
        };
    },
    formCheckReply: function (a, b, c, d) {
        a.find("label").removeClass("input-error");
        a.find(".form-info.error").remove();
        if ("error" == b["return"]) {
            if (b.errors) for (var e in b.errors) WG.formErrorShow(a, e, b.errors[e]);
            $(window).trigger("resize");
            d && d();
            return !1;
        }
        return "OK" == b["return"] ? (c && c(), !0) : !1;
    },
    formFieldError: function (a, b) {
        a.parent().addClass("input-error");
        a.next(".form-info").remove();
        b && a.after('<div class="form-info error">' + b + "</div>");
    },
    formFieldOK: function (a) {
        a.parent().removeClass("input-error");
        a.next(".form-info").remove();
    },
    confirm: function (a, b) {
        var c = new jBox("Confirm", {
            confirmButton: "OK",
            blockScroll: !1,
            content: b || "Are you sure?",
            _onOpen: function () {
                this.submitButton.on("click", function () {
                    a && a();
                    c.destroy();
                });
            },
        });
        c.open();
    },
    colorSelect: function (a, b, c, d) {
        var e = {
            title: WG.ttStr(3619, 2, "Select colors", "", "66", "@@@"),
            modal: !1,
        };
        d = $.extend(e, d);
        var f = WG.windowForm(
            {
                form_url: "/forms/user_colors_selector.php?colors=" + a + "&maps=" + (b ? 1 : 0),
                onLoaded: function (d) {
                    WG.log("loaded", d);
                    d.find(".paleta-select").on("click", function () {
                        var d = $(this).data("id");
                        WG.loadPalette(d, a, b, c);
                        f.close();
                        WG.user.id_user &&
                            WG.qApi(
                                {
                                    q: "select_palette",
                                    id: d,
                                    maps: b ? 1 : 0,
                                },
                                function () {},
                                !1,
                                !1,
                                "#user_color_select_msg",
                                2000
                            );
                    });
                    d.find(".paleta-delete").on("click", function () {
                        var a = $(this).data("id");
                        WG.confirm(function () {
                            WG.qApi(
                                {
                                    q: "remove_palette",
                                    id: a,
                                },
                                function () {
                                    f.reloadForm();
                                },
                                !1,
                                !1,
                                "#user_color_select_msg"
                            );
                        });
                    });
                    d.find(".paleta-edit").on("click", function () {
                        var a = $(this).data("id"),
                            c = WG.windowForm({
                                form_url: "/forms/edit_colors.php?id_load=" + a + "&maps=" + (b ? 1 : 0),
                                api_data: {
                                    q: "edit_palette",
                                    id: a,
                                },
                                title: WG.ttStr(3620, 2, "Edit colors", "", "66", "@@@"),
                                callback: function (a, b) {
                                    c.close();
                                    f.reloadForm();
                                },
                            });
                    });
                    d.find(".paleta-add").on("click", function () {
                        var a = $(this).data("id"),
                            c = WG.windowForm({
                                form_url: "/forms/edit_colors.php?new=1&id_load=" + a + "&maps=" + (b ? 1 : 0),
                                api_data: {
                                    q: "add_palette",
                                    id_src: a,
                                },
                                title: WG.ttStr(3621, 2, "Add color palette", "", "66", "@@@"),
                                callback: function (a, b) {
                                    c.close();
                                    f.reloadForm();
                                },
                            });
                    });
                },
                callback: function (a, b) {
                    c && c();
                },
                callback_delay: 100,
            },
            d
        );
    },
    modalSpotSelect: function (a, b) {
        var c = $('<label><input type="search" placeholder="' + WG.ttStr(3274, 1, "search spot...", "", "67", "@@@") + '" name="modalsearchspot" id="modalsearchspot"></label>'),
            d,
            e = this,
            f = new jBox("Modal", {
                title: "Spot select",
                overlay: !0,
                closeButton: "title",
                maxHeight: this.getMaxHeight(20),
                width: this.getMaxWidth(5, 500),
                reposition: !0,
                content: c,
                repositionOnContent: !0,
                onOpen: function () {
                    f.toFront();
                    d = WgComplete.qspot("modalsearchspot", {
                        all: !0,
                        max_height: e.getMaxHeight(10) / 2 - 50,
                        on_select: function (b) {
                            $("#modalsearchspot").blur();
                            b.data && a(b.data);
                            f.close();
                        },
                        optionalUnofficial: !0,
                    });
                    b &&
                        setTimeout(function () {
                            d.open();
                        }, 100);
                },
                onCloseComplete: function () {
                    d.close();
                    this.destroy();
                },
            });
        f.open();
    },
    modalStationSelect: function (a, b) {
        var c = $('<label><input type="search" placeholder="' + WG.ttStr(3275, 1, "search station...", "", "67", "@@@") + '" name="modalsearchstation" id="modalsearchstation"></label>'),
            d,
            e = this,
            f = new jBox("Modal", {
                title: "Station select",
                overlay: !0,
                closeButton: "title",
                maxHeight: this.getMaxHeight(20),
                width: this.getMaxWidth(5, 500),
                reposition: !0,
                content: c,
                repositionOnContent: !0,
                onOpen: function () {
                    f.toFront();
                    d = WgComplete.qstation("modalsearchstation", {
                        all: !0,
                        max_height: e.getMaxHeight(10) / 2 - 50,
                        on_select: function (b) {
                            $("#modalsearchstation").blur();
                            b.data && a(b.data);
                            f.close();
                        },
                        optionalUnofficial: !0,
                    });
                    b &&
                        setTimeout(function () {
                            d.open();
                        }, 100);
                },
                onCloseComplete: function () {
                    d.close();
                    this.destroy();
                },
            });
        f.open();
    },
    modalSpotModelSelect: function (a, b, c) {
        this.modalSpotSelect(function (b) {
            WG.log(b);
            var d = new WG.Spot({
                id_spot: b,
            });
            d.load(function () {
                d.modalModelSelect(function (b) {
                    a(d, b);
                }, c);
            });
        }, b);
    },
    modalSelect: function (a, b, c, d) {
        d = $.extend(
            {
                multi: !1,
                selected: [],
                groups: {},
            },
            d
        );
        for (var e = $("<div>"), f = 0; f < b.length; f++) {
            var g = b[f][0],
                h = b[f][1];
            if (d.multi) {
                var k = "";
                d.groups[g] && (k = ' data-group="' + d.groups[g] + '"');
                g =
                    0 <= d.selected.indexOf(g)
                        ? $('<button class="wide multibutton akce selected" data-id="' + g + '"' + k + '><svg class="icon inbutton-left"><use xlink:href="#ico_ok"></use></svg>' + h + "</button><br>")
                        : $('<button class="wide multibutton" data-id="' + g + '"' + k + '><svg class="icon inbutton-left"><use xlink:href="#ico_cancel"></use></svg>' + h + "</button><br>");
                g.click(function () {
                    var a = $(this),
                        b = a.find(".icon");
                    a.hasClass("selected")
                        ? (a.removeClass("akce selected"), b.replaceWith('<svg class="icon inbutton-left"><use xlink:href="#ico_cancel"></use></svg>'))
                        : (a.addClass("akce selected"),
                          b.replaceWith('<svg class="icon inbutton-left"><use xlink:href="#ico_ok"></use></svg>'),
                          $.isEmptyObject(d.groups) ||
                              ((a = a.data("group")),
                              e
                                  .find(".multibutton")
                                  .filter(':not([data-group="' + a + '"])')
                                  .removeClass("akce selected")
                                  .find(".icon")
                                  .replaceWith('<svg class="icon inbutton-left"><use xlink:href="#ico_cancel"></use></svg>')));
                });
            } else
                (g = $('<button class="wide" data-id="' + g + '">' + h + "</button><br>")),
                    g.click(function () {
                        var a = $(this).data("id");
                        c(a, p);
                        p.close();
                    });
            e.append(g);
        }
        d.multi &&
            ((b = $('<button class="wide akce" style="margin-top:10px;">OK</button>')),
            e.append(b),
            b.click(function () {
                var a = [];
                e.find(".selected").each(function () {
                    var b = $(this).data("id");
                    a[a.length] = b;
                });
                c(a, p);
                p.close();
            }));
        var p = new jBox("Modal", {
            title: a,
            overlay: !0,
            closeButton: "title",
            maxHeight: this.getMaxHeight(20),
            maxWidth: this.getMaxWidth(0),
            reposition: !0,
            content: e,
            repositionOnContent: !0,
            onCloseComplete: function () {
                this.destroy();
            },
        });
        p.open();
        p.toFront();
    },
    modalApiSelect: function (a, b, c) {
        $("");
        WG.qApi(b, function (b) {
            WG.modalSelect(a, b, c);
        });
    },
    makeModalForms: function (a, b) {
        b =
            b ||
            function (a, b) {
                b.close();
                location.reload();
            };
        if (a.length)
            a.off("click").on("click", function (a) {
                a.preventDefault();
                a = 500;
                "close" == $(this).data("ok") &&
                    ((b = function (a, b) {
                        b.close();
                    }),
                    (a = 2000));
                WG.modalForm(
                    {
                        clicked: this,
                        form_url_data: $(this).data("vars"),
                        reply_close: !1,
                        callback: b,
                        callback_delay: a,
                    },
                    {
                        overlay: !0,
                    }
                );
            });
    },
    timeout: function (a, b) {
        var c,
            d,
            e = Math.round(new Date().getTime()),
            f = this;
        this._runFn = function () {
            e = Math.round(new Date().getTime());
            a();
            WG.log("FN RUN! (" + new Date() + ")");
            f._start();
        };
        this._start = function () {
            clearTimeout(c);
            c = setTimeout(function () {
                f._runFn();
            }, b);
        };
        this.pause = function () {
            clearTimeout(c);
            new Date().getTime();
        };
        this.resume = function () {
            var a = this;
            clearTimeout(c);
            var f = Math.round(new Date().getTime());
            f - e < b
                ? (clearTimeout(d),
                  (d = setTimeout(function () {
                      a._runFn();
                  }, b - (f - e))))
                : a._runFn();
        };
        this.stop = function () {
            clearTimeout(c);
            clearTimeout(d);
            WG.log("Timeout STOP! (" + new Date() + ")");
        };
        b && f._start();
        return this;
    },
    getGetVar: function (a) {
        a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        a = new RegExp("[\\?&]" + a + "=([^&#]*)").exec(location.search);
        return null === a ? "" : decodeURIComponent(a[1].replace(/\+/g, " "));
    },
    addLastCookie: function (a, b, c, d) {
        d = $.extend(
            {
                expires: 1825,
                path: "/",
            },
            d
        );
        c = c || 10;
        var e = $.cookie(a) || "",
            f = [];
        b && (e = b + "_" + e);
        e && (f = e.split("_"));
        f = WgUtil.arrayUnique(f);
        f.length > c && f.splice(c, f.length - c);
        if (!f) return !1;
        e = f.join("_");
        return $.cookie(a, e, d);
    },
    getUID: function (a) {
        WG._uid_index = WG._uid_index || 0;
        WG._uid_index++;
        return (a || "uid") + WG._uid_index;
    },
    debounce: function (a, b, c) {
        var d;
        return function () {
            var e = this,
                f = arguments,
                g = c && !d;
            clearTimeout(d);
            d = setTimeout(function () {
                d = null;
                c || a.apply(e, f);
            }, b);
            g && a.apply(e, f);
        };
    },
    throttle: function (a, b, c) {
        var d,
            e,
            f,
            g = null,
            h = 0;
        c || (c = {});
        var k = function () {
            h = !1 === c.leading ? 0 : Date.now();
            g = null;
            f = a.apply(d, e);
            g || (d = e = null);
        };
        return function () {
            var p = Date.now();
            h || !1 !== c.leading || (h = p);
            var q = b - (p - h);
            d = this;
            e = arguments;
            0 >= q || q > b ? (g && (clearTimeout(g), (g = null)), (h = p), (f = a.apply(d, e)), g || (d = e = null)) : g || !1 === c.trailing || (g = setTimeout(k, q));
            return f;
        };
    },
    ajaxDataTable: function (a, b) {
        var c = {
                id_sloupce_minule: "",
                id_sloupce: "",
                smer: "ASC",
                rows: 0,
                showrows: 0,
                start: 0,
                src: "",
                form_id: null,
                _csv: 0,
                callback: function () {},
            },
            d = $("#" + a),
            e = d.find("table").first();
        e[0] &&
            ((c.id_sloupce_minule = e.data("id_sloupce_minule")),
            (c.id_sloupce = e.data("id_sloupce")),
            (c.rows = e.data("rows")),
            (c.showrows = e.data("showrows")),
            (c.smer = e.data("smer")),
            (c.start = e.data("start")),
            (c.src = e.data("src")),
            (c.form_id = e.data("form_id")));
        $.extend(c, b);
        c.target_id = a;
        if (c.src) {
            if (c.form_id) for (a = $("#" + c.form_id).serializeArray(), b = 0; b < a.length; b++) c[a[b].name] = a[b].value;
            c.callback && d.data("callback", c.callback);
            d.addClass("spinner").css("position", "relative");
            a = !1;
            c._csv && ((a = !0), (c._csv = 0));
            $.post(c.src, c, function (a) {
                d.removeClass("spinner");
                d.empty().html(a);
                c.form_id && d.find("table").first().data("form_id", c.form_id);
                c.callback();
            }).fail(function () {
                d.removeClass("spinner");
                WG.message(WG.loadFailMessage(), !0, d);
            });
            a && ((a = $("#csv_target")), a[0] || ((a = $('<div id="csv_target">')), $("body").append(a)), (c._csv = 1), a.load(c.src + "?FORCEMASTER", c, function () {}));
        }
    },
    ajaxDataTablePage: function (a, b) {
        var c = $("#" + a)
            .find("table")
            .first()
            .data("showrows");
        WG.ajaxDataTable(a, {
            start: c * (b - 1),
        });
    },
    ajaxDataTableCSV: function (a) {
        WG.ajaxDataTable(a, {
            _csv: 1,
        });
    },
    latlonFcst: function (a, b) {
        var c = function (c) {
            c ? WG.loadAjaxContent("/?lat=" + a + "&lon=" + b) : (WG.gae("LatLon forecast", "no PRO!"), WG.message("You must be PRO user to use this feature!", !0));
        };
        WG.checkUser(
            function (a) {
                c(a);
            },
            function () {
                WG.loginRequired(c, !0);
            },
            !0
        );
    },
    proOnly: function (a, b) {
        (b = b || "") && (b = " (" + b + ")");
        WG.window({
            src: "/snippets/pro_only.php" + (a ? "?msg_id=" + a : ""),
            title: "PRO users only",
        });
        WG.gae("popup", "open", "pro only" + b);
    },
    timezoneStr: function (a, b) {
        b = moment.tz.zone(b).parse(a) / 60;
        a.format("dd D. HH[h]");
        a = a.format("z");
        if (0 == a.indexOf("GMT+") || 0 == a.indexOf("GMT-")) (a = -1 * b), (a = "UTC" + (0 <= a ? "+" + a : a));
        return a;
    },
    fbRun: function (a) {
        a = a || function () {};
        WG._fb_loaded
            ? a()
            : ((window.fbAsyncInit = function () {
                  FB.init({
                      appId: "1464510160505909",
                      cookie: !0,
                      xfbml: !0,
                      version: "v3.2",
                  });
                  WG._fb_loaded = !0;
                  a();
              }),
              (function (a, c, d) {
                  var b = a.getElementsByTagName(c)[0];
                  a.getElementById(d) || ((a = a.createElement(c)), (a.id = d), (a.src = "//connect.facebook.net/en_US/sdk.js"), b.parentNode.insertBefore(a, b));
              })(document, "script", "facebook-jssdk"));
    },
    googleRun: function (a) {
        WG._google_loaded
            ? a()
            : $.getScript("https://apis.google.com/js/platform.js", function () {
                  gapi.load("auth2", function () {
                      gapi.auth2.init({
                          client_id: "902500120979-b876d301np6vmv1hlcu9kn1rvgg8097o.apps.googleusercontent.com",
                          scope: "profile",
                      });
                      WG._google_loaded = !0;
                      a();
                  });
              });
    },
    arrayUnique: function (a) {
        for (var b = [], c = 0, d = a.length; c < d; c++) -1 === b.indexOf(a[c]) && "" !== a[c] && b.push(a[c]);
        return b;
    },
    sleep: function (a) {
        var b = new Date();
        do var c = new Date();
        while (c - b < a);
    },
    cookieTest: function (a, b) {
        $.cookie("wg_test_cookie", "1", {
            expires: 1,
        });
        $.ajax("/cookie_test.php", {
            success: function (c) {
                "1" == c ? a() : b();
            },
        });
    },
    gae: function (a, b, c, d, e) {
        window.ga && ga("send", "event", a, b, c, d, e);
    },
    gaec: function (a, b, c, d, e, f) {
        window.ga ? (f || (f = {}), (f.hitCallback = WG.fnWithTimeout(a)), ga("send", "event", b, c, d, e, f)) : a();
    },
    gap: function (a) {
        window.ga && (ga("set", "location", location.href), ga("set", "page", a), ga("send", "pageview"));
    },
    isNumeric: function (a) {
        return !isNaN(parseFloat(a)) && isFinite(a);
    },
    round: function (a, b) {
        b = Math.pow(10, b);
        return Math.round(a * b) / b;
    },
    getLocation: function (a, b) {
        b =
            b ||
            function (a) {
                a || WG.message("Geolocation is not supported by this browser.", !0);
                switch (a.code) {
                    case a.TIMEOUT:
                        WG.message("" + WG.ttStr(3278, 1, "The request to get user location timed out.", "", "67", "@@@"), !0);
                        break;
                    case a.UNKNOWN_ERROR:
                        WG.message("" + WG.ttStr(3279, 1, "An unknown error occurred.", "", "67", "@@@"), !0);
                }
            };
        navigator.geolocation ? (WG.log(navigator.geolocation), navigator.geolocation.getCurrentPosition(a, b)) : b();
    },
    getLangText: function (a, b, c) {
        void 0 === c && (c = "??");
        return WgLang[a] && WgLang[a][b] ? WgLang[a][b] : c;
    },
    ttStr: function (a, b, c) {
        return a ? WG.LNG[a] || c : c;
    },
    translate: function (a, b) {
        WG.trwindow
            ? (WG.trwindow.load("/forms/trans_edit_online.php?id_tt=" + a), WG.trwindow.setTitle("Translate ID:" + a))
            : (WG.trwindow = new WG.Window({
                  title: "Translate ID:" + a,
                  src: "/forms/trans_edit_online.php?id_tt=" + a,
                  zIndex: 99999,
                  adjustPosition: !0,
                  repositionOnContent: !1,
                  position: {
                      x: 100,
                      y: $(window).scrollTop() + 100,
                  },
                  onClose: function () {
                      WG.trwindow = null;
                  },
                  target: $("body"),
              }));
    },
    ttt: function (a) {
        3 == window.event.which && (WG.translate($(a).data("id_tt"), $(a)), window.event.stopPropagation());
    },
    countProperties: function (a) {
        var b = 0,
            c;
        for (c in a) a.hasOwnProperty(c) && b++;
        return b;
    },
    resolution_bak: function () {
        function a() {
            return "undefined" == typeof window ? 0 : +window.devicePixelRatio || Math.sqrt(screen.deviceXDPI * screen.deviceYDPI) / b.dpi || 0;
        }
        var b = {
            dpi: 96,
            dpcm: 96 / 2.54,
        };
        return {
            dppx: a(),
            dpi: a() * b.dpi,
            dpcm: a() * b.dpcm,
            zoom: document.documentElement.clientWidth / window.innerWidth,
        };
    },
    viewportWidth: function (a) {
        if (!a && this._viewportWidth) return this._viewportWidth;
        this._viewportWidth = $(window).width();
        return $(window).width();
    },
    resolution: function () {
        function a() {
            return "undefined" == typeof window ? 0 : +window.devicePixelRatio || Math.sqrt(screen.deviceXDPI * screen.deviceYDPI) / b.dpi || 0;
        }
        var b = {
                dpi: 96,
                dpcm: 96 / 2.54,
            },
            c = a(),
            d = a() * b.dpi,
            e = a() * b.dpcm,
            f = document.documentElement.clientWidth / window.innerWidth,
            g = $(window).width();
        var h = screen.height > screen.width ? screen.width : screen.height;
        return {
            dppx: c,
            dpi: d,
            dpcm: e,
            zoom: f,
            viewportWidth: g,
            deviceWidth: h,
            vertical: screen.height > screen.width,
        };
    },
    goToUrl: function (a, b) {
        window.location.assign(a);
    },
    spinnerOn: function (a, b) {
        b = b ? '<div class="spinner-desc-wrap"><div class="spinner-desc">' + b + "</div></div>" : "";
        a = a ? $(a) : $("body");
        if (!a._$spinner) return (a[0]._$spinner = $('<div class="spinner">' + b + "</div>")), a.append(a[0]._$spinner), a[0]._$spinner;
    },
    spinnerOff: function (a) {
        a = a ? $(a) : $("body");
        a[0]._$spinner && a[0]._$spinner.remove();
    },
    getGet: function () {
        var a = {};
        location.search &&
            location.search
                .substr(1)
                .split("&")
                .forEach(function (b) {
                    var c = b.split("=");
                    b = c[0];
                    c = c[1] && decodeURIComponent(c[1]);
                    (a[b] = a[b] || []).push(c);
                });
        return a;
    },
    parseUrl: function (a) {
        var b = document.createElement("a");
        b.href = a;
        return b;
    },
    ajaxify: function (a, b) {
        a.find("a[data-ajax='1']")
            .off("click")
            .on("click", function (a) {
                a.preventDefault();
                a = $(this).attr("href");
                var c = $(this).data("addclass"),
                    e = $(this).data("showurl");
                WG.loadAjaxContent(a, c, b, e);
            });
    },
    loadAjaxContent: function (a, b, c, d) {
        var e = this._nopush ? !0 : !1;
        c || (c = $("#main-page"));
        var f = WG.parseUrl(a);
        WG.stopAutoUpdates();
        WG.spinnerOn();
        $("body").trigger("click");
        $.get(a + (f.search ? "&" : "?") + "ajax=1", function (f, h, k) {
            $("#main-page-content").empty();
            $("footer").show();
            $("body").removeClass("max");
            $("#main-page-content").html(f);
            WG.scrollUp();
            $(".subsection").addClass("hide");
            c.removeClass();
            c.addClass("subsection content " + (b ? b : ""));
            WG.spinnerOff();
            WG.contentActions(c);
            WG.pushState(
                {
                    fn: "loadAjaxContent",
                    args: [a, b],
                    nopush: e,
                },
                "Windguru",
                d ? d : a
            );
            document.title = "Windguru";
            f = WG.parseUrl(a);
            WG.gap(f.pathname + f.search);
            WG.tssDefault();
        }).fail(WG.loadFail);
    },
    loadJS: function (a, b) {
        var c = $.Deferred(),
            d = [],
            e = [];
        if (a instanceof Array) for (var f = 0; f < a.length; f++) e.push(a[f]);
        else e.push(a);
        b && c.then(b);
        for (
            b = {
                $jscomp$loop$prop$i$0$20: 0,
            };
            b.$jscomp$loop$prop$i$0$20 < e.length;
            b = {
                $jscomp$loop$prop$i$0$20: b.$jscomp$loop$prop$i$0$20,
            },
                b.$jscomp$loop$prop$i$0$20++
        )
            if (((f = "DLOADED_" + a[b.$jscomp$loop$prop$i$0$20].replace(/\W/g, "_")), (d[b.$jscomp$loop$prop$i$0$20] = $.Deferred()), $("#" + f)[0])) d[b.$jscomp$loop$prop$i$0$20].resolve();
            else {
                var g = document.createElement("script");
                g.src = a[b.$jscomp$loop$prop$i$0$20];
                g.id = f;
                g.onload = (function (a) {
                    return function () {
                        d[a.$jscomp$loop$prop$i$0$20].resolve();
                    };
                })(b);
                g.onerror = (function (a) {
                    return function () {
                        d[a.$jscomp$loop$prop$i$0$20].reject();
                    };
                })(b);
                document.head.appendChild(g);
                d[b.$jscomp$loop$prop$i$0$20].fail(function () {
                    WG.loadFail();
                    $(g).remove();
                });
            }
        $.when.apply($, d).then(function () {
            c.resolve();
        });
        return c;
    },
    tssDefault: function () {
        WG._touchSideSwipe &&
            WG._touchSideSwipe.tssSet({
                sideHookWidth: 23,
            });
    },
    tssNarrow: function () {
        WG._touchSideSwipe &&
            WG._touchSideSwipe.tssSet({
                sideHookWidth: 15,
            });
    },
    loadFail: function (a, b, c) {
        WG.spinnerOff();
        WG.notice(WG.loadFailMessage(), 1);
    },
    loadFailMessage: function () {
        var a = "Request failed...";
        navigator.onLine || (a = "" + WG.ttStr(3280, 1, "Error. Internet connection problem?", "", "67", "@@@"));
        return a;
    },
    scrollUpOnLoad: function () {
        window.addEventListener(
            "load",
            function (a) {
                setTimeout(function () {
                    WG.scrollUp();
                }, 1);
                WG.scrollUp();
            },
            !1
        );
    },
    scrollUp: function () {
        window.scrollTo(0, 0);
    },
    stopLiveStations: function () {
        WG.log("trigger: WG:hide");
        $(".spot-live-div").trigger("WG:hide");
    },
    startLiveStations: function () {
        WG.log("trigger: WG:show");
        $(".spot-live-div").trigger("WG:show");
    },
    stopAutoUpdates: function () {
        WG.log("trigger: WG:stop");
        $(window).trigger("WG:stop");
    },
    tooltips: function (a) {
        WG.TOUCHDEVICE ||
            a.find(".tooltip").jBox("Tooltip", {
                appendTo: a,
            });
        a.find(".tooltip-touch.warning").jBox("Tooltip", {
            addClass: "warning",
            appendTo: a,
        });
        a.find(".tooltip-touch:not(.warning)").jBox("Tooltip", {
            appendTo: a,
        });
    },
    contentActions: function (a) {
        a || (a = $("body"));
        WG.logTime("contentActions " + a[0].id);
        a.find(".sm").not(".sm-up").smartmenus({
            subIndicators: !1,
            showTimeout: 0,
        });
        a.find(".sm-up").smartmenus({
            subIndicators: !1,
            showTimeout: 0,
            bottomToTopSubMenus: !0,
        });
        WG.tooltips(a);
        WG.makeModalForms(a.find(".modal-form"));
        a.find(".toggle-details")
            .off("click")
            .on("click", function () {
                $(this).parent().parent().find(".spot-details").toggleClass("on");
            });
        a.find(".close-ads")
            .off("click")
            .on("click", function () {
                a.find(".reklama").fadeOut(1000, function () {
                    $(window).trigger("WG:tabresize");
                });
                WG.gae("popup", "open", "close ads");
                setTimeout(function () {
                    WG.window({
                        src: "/snippets/closeads.php",
                        onClose: function () {
                            a.find(".reklama").fadeIn(1000);
                            $(window).trigger("WG:tabresize");
                        },
                    });
                }, 3000);
            });
        WG.ajaxify(a, $("#main-page"), WG.contentActions);
        WG.logTimeEnd("contentActions " + a[0].id);
    },
    pushState: function (a, b, c) {
        a &&
            !a.nopush &&
            ((b = b || "Windguru"),
            WG.log("WG.pushState()"),
            WG._history_last_fn == a.fn && WG._history_last_url == c
                ? WG.log("SAME! return...")
                : (WG.log("NEW HISTORY: " + a.fn + " url:" + c),
                  (WG._history_last_fn = a.fn),
                  (WG._history_last_url = c),
                  WG._history_notfirst ? window.history.pushState(a, b, c) : window.history.replaceState(a, b, c),
                  (WG._history_notfirst = !0)));
    },
    uuid: function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (a) {
            var b = (16 * Math.random()) | 0;
            return ("x" == a ? b : (b & 3) | 8).toString(16);
        });
    },
    addSvgIcons: function (a) {
        var b = $("#svgicons");
        b.legth ||
            ((b = $('<div id="svgicons"></div>')),
            b.load(a, function () {
                $("body").prepend(b);
            }));
    },
    checkDragging: function (a) {
        return $(a).closest(".dragscroll").hasClass("dragging") ? !0 : !1;
    },
    arrayRemove: function (a, b) {
        var c = !1;
        b = a.indexOf(b);
        return -1 != b ? ((c = a.splice(b, 1)), c[0]) : c;
    },
    colorBrightness: function (a, b, c) {
        return Math.sqrt(a * a * 0.241 + b * b * 0.691 + c * c * 0.068);
    },
    hexToRgb: function (a) {
        return (a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a))
            ? {
                  r: parseInt(a[1], 16),
                  g: parseInt(a[2], 16),
                  b: parseInt(a[3], 16),
              }
            : null;
    },
    saveLocalStorage: function (a, b) {
        return WG._localStorage ? ((a = "string" == typeof a ? a : JSON.stringify(a)), WG._localStorage.setItem(a, JSON.stringify(b)), !0) : !1;
    },
    loadLocalStorage: function (a) {
        if (WG._localStorage) {
            if (((a = "string" == typeof a ? a : JSON.stringify(a)), (a = WG._localStorage.getItem(a)))) return JSON.parse(a);
        } else return !1;
    },
    consentWindow: function (a, b) {
        b && (window.__cmp ? window.__cmp("showGUI", null, function (a) {}) : location.reload());
    },
    consentWindowWG: function (a, b) {
        if ((!WG.user.consent_timestamp && !WG._consent_ads_now) || b) {
            WG.consentMoreInfo = function () {
                $(".consent-hidden").show();
                $(".consent-more-hide").hide();
                $(window).trigger("resize");
            };
            var c = "Consent required",
                d = "title",
                e = !1,
                f = function (b) {
                    var f = WG.windowForm(
                        {
                            form_url: b,
                            api_data: {
                                q: "consent_save",
                            },
                            callback: function () {
                                f.close();
                                a && a();
                            },
                            onLoaded: function (a) {
                                WG.log("loaded", a);
                                a.find("#butt_consent_psads_ok").on("click", function () {
                                    WG.gae("Consent personalized ads", "yes");
                                    a.find("#allow_personal_ads").val(1);
                                    WG.ads.allow_personal_ads = !0;
                                    WG.user.allow_personal_ads = !0;
                                    WG._consent_ads_now = !0;
                                    a.submit();
                                });
                                a.find("#butt_consent_psads_no").on("click", function () {
                                    WG.gae("Consent personalized ads", "no");
                                    a.find("#allow_personal_ads").val(0);
                                    WG.ads.allow_personal_ads = !1;
                                    WG.user.allow_personal_ads = !1;
                                    WG._consent_ads_now = !0;
                                    a.submit();
                                });
                                a.find("#butt_consent_psads_pro").on("click", function () {
                                    WG.gae("Consent personalized ads", "go PRO");
                                    a.find("#allow_personal_ads").val(0);
                                    WG.ads.allow_personal_ads = !1;
                                    WG.user.allow_personal_ads = !1;
                                    WG._consent_ads_now = !0;
                                    a.submit();
                                    setTimeout(function () {
                                        location.assign("/settings.php?formid=set_pro&click=addpro");
                                    }, 1500);
                                });
                            },
                            callback_delay: 500,
                        },
                        {
                            title: c,
                            closeOnClick: e,
                            closeButton: d,
                        }
                    );
                };
            b
                ? ((c = "Privacy settings"), (d = "title"), (e = !1), f("/forms/consent-update.php"))
                : WG.cookieTest(
                      function () {
                          WG.consent_new ? f("/forms/consent.php") : WG.consentWindowCookies(a);
                      },
                      function () {
                          WG.ads.allow_personal_ads = !1;
                          WG.gae("Consent personalized ads", "no (no cookies)");
                          WG.consentWindowCookies(a);
                          a && a();
                      }
                  );
        } else (WG.ads.allow_personal_ads = WG.user.allow_personal_ads ? !0 : !1), a && a();
    },
    throttleActions: function (a, b) {
        function c() {
            if (d < a.length) {
                var b = d++;
                return Promise.resolve((0, a[b])())
                    .then(function (a) {
                        e[b] = a;
                    })
                    .then(c);
            }
        }
        for (var d = 0, e = Array(a.length), f = []; d < b && d < a.length; ) f.push(c());
        return Promise.all(f).then(function () {
            return e;
        });
    },
    consentWindowCookies: function (a) {
        window.cookieconsent_options = {
            learnMore: "More info",
            domain: "windguru.cz",
            expiryDays: 3650,
            message: "This website uses cookies to work properly, collect statistics and serve advertising.",
            theme: "/css/src/cookie-consent.css",
            link: "https://www.windguru.cz/help.php?sec=privacy",
        };
        $("head").append('<script language="JavaScript" type="text/javascript" src="/js/min/cookieconsent.min.js"></script>\n');
        a && a();
    },
    getPalette: function (a, b) {
        var c = new WgPalette([
            [0, 255, 255, 255],
            [100, 100, 100, 10],
        ]);
        return b ? (WG.ColorsMaps[a] ? WG.ColorsMaps[a] : c) : WG.Colors[a] ? WG.Colors[a] : c;
    },
    getMapsPalette: function (a) {
        return WG.getPalette(a, !0);
    },
    setPalette: function (a, b, c, d) {
        c ? (WG.ColorsMaps[a] = b) : (WG.Colors[a] = b);
        d && d();
    },
    setMapsPalette: function (a, b) {
        WG.setPalette(a, b, !0);
    },
    loadPalette: function (a, b, c, d) {
        return WG.qApi(
            {
                q: "get_palette",
                id: a,
            },
            function (a) {
                var e = new WgPalette();
                e.importDef(a.def);
                WG.setPalette(b, e, c, d);
            }
        );
    },
    experimental: function () {
        return WG._experimental ? !0 : !1;
    },
};
WG.loadFailThrottled = WG.throttle(WG.loadFail, 3000);
WG._localStorage = !1;
try {
    localStorage.getItem && (WG._localStorage = localStorage);
} catch (a) {}
var WgPalette = function (a) {
    function b(a) {
        try {
            if ("string" === typeof a || a instanceof String) a = JSON.parse(a);
            if (a) {
                h = [];
                for (var b = 0; b < a.length; b++) c(a[b]);
                h.sort(f);
            }
        } catch (q) {
            WG.notice("Palette import failed");
        }
    }
    function c(a) {
        2 == a.length
            ? h.push({
                  value: parseFloat(a[0]),
                  r: a[1][0],
                  g: a[1][1],
                  b: a[1][2],
                  a: a[1][3] / 255,
              })
            : "value" in a && "r" in a
            ? h.push({
                  value: parseFloat(a.value),
                  r: a.r,
                  g: a.g,
                  b: a.b,
                  a: "a" in a ? a.a : 1,
              })
            : h.push({
                  value: parseFloat(a[0]),
                  r: a[1],
                  g: a[2],
                  b: a[3],
                  a: 4 < a.length ? parseFloat(a[4]) : 1,
              });
    }
    function d(a) {
        a = "" + parseFloat(a);
        -1 == a.indexOf(".") && (a += ".");
        return a;
    }
    function e(a) {
        a = parseFloat(a);
        var b = {
            r: 255,
            g: 255,
            b: 255,
            a: 1,
        };
        if (!h || isNaN(a)) return b;
        if (a >= h[h.length - 1].value) return Object.assign({}, h[h.length - 1]);
        if (a <= h[0].value) return Object.assign({}, h[0]);
        for (b = 0; b <= h.length - 2; b++)
            if (a >= h[b].value && a <= h[b + 1].value) {
                var c = h[b];
                var d = h[b + 1];
                var e = (a - h[b].value) / (h[b + 1].value - h[b].value);
                break;
            }
        return (b = {
            r: Math.round(c.r + e * (d.r - c.r)),
            g: Math.round(c.g + e * (d.g - c.g)),
            b: Math.round(c.b + e * (d.b - c.b)),
            a: (1000 * (c.a + e * (d.a - c.a))) / 1000,
        });
    }
    function f(a, b) {
        return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
    }
    this._def = a;
    var g = this,
        h = [];
    a && b(a);
    this.importDef = b;
    this.getColors = function () {
        for (var a = [], b = 0; b < h.length; b++)
            a.push({
                value: h[b].value,
                r: h[b].r,
                g: h[b].g,
                b: h[b].b,
                a: h[b].a,
            });
        return a;
    };
    this.getJSON = function (a) {
        a = a ? "\n" : "";
        for (var b = "[" + a, c = 0; c < h.length; c++) b += "[" + h[c].value + "," + h[c].r + "," + h[c].g + "," + h[c].b + "," + h[c].a + "]" + (c < h.length - 1 ? "," : "") + a;
        return b + "]";
    };
    this.addColor = function (a) {
        c(a);
        h.sort(f);
    };
    this.removeColor = function (a) {
        return Object.assign({}, h.splice(a, 1)[0]);
    };
    this.setVal = function (a, b) {
        h[a].value = b;
        h.sort(f);
    };
    this.getColor = function (a) {
        a = e(a);
        return {
            r: Math.round(a.r),
            g: Math.round(a.g),
            b: Math.round(a.b),
            a: Math.round(1000 * a.a) / 1000,
        };
    };
    this.getRGB = function (a) {
        var b = e(a);
        a = Math.round(b.r).toString(16);
        var c = Math.round(b.g).toString(16);
        b = Math.round(b.b).toString(16);
        2 > a.length && (a = "0" + a);
        2 > c.length && (c = "0" + c);
        2 > b.length && (b = "0" + b);
        return ("#" + a + c + b).toUpperCase();
    };
    this.getRGBA = function (a, b) {
        a = e(a);
        var c = a.a;
        "undefined" !== typeof b && (c = b);
        return "rgba(" + Math.round(a.r) + "," + Math.round(a.g) + "," + Math.round(a.b) + "," + Math.round(1000 * c) / 1000 + ")";
    };
    this.getBrightness = function (a) {
        a = e(a);
        return WG.colorBrightness(a.r, a.g, a.b);
    };
    this.gradient = function (a, b, c) {
        c = "linear-gradient(to " + (c || "bottom");
        b -= a;
        for (var d, e = 0; e < h.length; e++) (d = Math.round(((h[e].value - a) / b) * 100)), (c += ", " + this.getRGBA(h[e].value) + " " + d + "%");
        return c;
    };
    this.shaderColorsDef = function (a, b) {
        a = a || "colors";
        b = b || "steps";
        var c = "float " + b + "[" + (h.length + 2) + "];\n";
        c += "vec4 " + a + "[" + (h.length + 2) + "];\n";
        var e = h[0];
        c += b + "[0] = " + d(h[0].value) + "; ";
        c += a + "[0] = vec4(" + d(e.r / 255) + "," + d(e.g / 255) + "," + d(e.b / 255) + "," + d(e.a) + ");\n";
        for (var f = 0; f < h.length; f++) (e = h[f]), (c += b + "[" + (f + 1) + "] = " + d(h[f].value) + "; "), (c += a + "[" + (f + 1) + "] = vec4(" + d(e.r / 255) + "," + d(e.g / 255) + "," + d(e.b / 255) + "," + d(e.a) + ");\n");
        e = h[h.length - 1];
        c += b + "[" + (f + 1) + "] = " + d(h[h.length - 1].value) + "; ";
        return (c += a + "[" + (f + 1) + "] = vec4(" + d(e.r / 255) + "," + d(e.g / 255) + "," + d(e.b / 255) + "," + d(e.a) + ");\n");
    };
    this.shaderColors = function () {
        for (var a = [], b = 0; b < h.length; b++) {
            var c = h[b];
            a.push(d(c.r / 255));
            a.push(d(c.g / 255));
            a.push(d(c.b / 255));
            a.push(d(c.a));
        }
        return new Float32Array(a);
    };
    this.shaderColorFn = function (a, b, c) {
        b = b || "colors";
        c = c || "steps";
        a = "vec4 " + (a || "colorAtValue") + "(const float value) {\n" + g.shaderColorsDef(b, c) + "vec4 ret = " + b + "[0];\n";
        return (a += "for (int i=0; i < " + h.length + "; i++) {\nret = mix(ret, " + b + "[i+1], smoothstep(steps[i], " + c + "[i+1], value));\nif(value < " + c + "[i]) break;\n}\nreturn ret;\n}\n");
    };
};
WG.Colors = WG.Colors || [];
WG.Colors.wind = new WgPalette([
    [0, 255, 255, 255],
    [5, 255, 255, 255],
    [8.9, 103, 247, 241],
    [13.5, 0, 255, 0],
    [18.8, 255, 240, 0],
    [24.7, 255, 50, 44],
    [31.7, 255, 10, 200],
    [38, 255, 0, 255],
    [45, 150, 50, 255],
    [60, 60, 60, 255],
    [70, 0, 0, 255],
]);
WG.Colors.temp = new WgPalette([
    [-25, 80, 255, 220],
    [-15, 171, 190, 255],
    [0, 255, 255, 255],
    [10, 255, 255, 100],
    [20, 255, 170, 0],
    [30, 255, 50, 50],
    [35, 255, 0, 110],
    [40, 255, 0, 160],
]);
WG.Colors.cloud = new WgPalette([
    [0, 255, 255, 255],
    [100, 135, 135, 135],
]);
WG.Colors.precip = new WgPalette([
    [0, 255, 255, 255],
    [9, 115, 115, 255],
]);
WG.Colors.precip1 = new WgPalette([
    [0, 255, 255, 255],
    [3, 115, 115, 255],
]);
WG.Colors.htsgw = new WgPalette([
    [0, 255, 255, 255, 1],
    [0.3, 255, 255, 255, 1],
    [3, 122, 131, 255, 1],
    [5, 173, 90, 201, 1],
    [8, 255, 80, 100, 1],
    [15, 255, 200, 100, 1],
]);
WG.Colors.perpw = new WgPalette([
    [0, 255, 255, 255],
    [10, 255, 255, 255],
    [20, 252, 81, 81],
]);
WG.Colors.press = new WgPalette([
    [0, 80, 255, 220],
    [900, 80, 255, 220],
    [1000, 255, 255, 255],
    [1070, 115, 115, 255],
    [1200, 115, 115, 255],
]);
WG.Colors.rh = new WgPalette([
    [0, 171, 190, 255],
    [50, 255, 255, 255],
    [100, 255, 255, 0],
]);
WG.Colors.gustiness = new WgPalette([
    [0, 0, 255, 0],
    [5, 0, 255, 0],
    [30, 255, 255, 0],
    [100, 255, 0, 0],
    [200, 255, 0, 100],
]);
WG.Colors.press_maps = new WgPalette([
    [800, 0, 43, 255],
    [936, 39, 94, 245],
    [980, 5, 218, 255],
    [992, 113, 232, 250],
    [1012, 255, 255, 255],
    [1036, 250, 103, 103],
    [1052, 250, 32, 32],
    [1200, 255, 13, 13],
]);
WG.Colors.press_maps_contours = new WgPalette([
    [800, 0, 0, 255],
    [996, 40, 40, 210],
    [1012, 61, 61, 61],
    [1024, 210, 40, 40],
    [1200, 255, 0, 0],
]);
WG.Colors.isobars = new WgPalette([
    [800, 0, 0, 255],
    [996, 40, 40, 210],
    [1012, 61, 61, 61],
    [1024, 210, 40, 40],
    [1200, 255, 0, 0],
]);
WG.Colors.cloud_inverse = new WgPalette([
    [0, 69, 69, 71],
    [100, 255, 255, 255],
]);
WG.Colors.precip_img = new WgPalette([
    [0, 255, 255, 255, 0],
    [0.25, 255, 255, 255, 1],
    [0.5, 200, 200, 255, 1],
    [1, 128, 128, 255],
    [4, 128, 255, 128],
    [8, 255, 255, 0],
    [16, 255, 148, 148],
    [50, 255, 0, 0],
]);
WG.Colors.precip_img1 = new WgPalette([
    [0, 255, 255, 255, 0],
    [0.1, 128, 128, 255, 0],
    [0.16, 128, 128, 255, 0.5],
    [0.33, 128, 128, 255, 1],
    [1.33, 128, 255, 128],
    [2.67, 255, 255, 0],
    [5.33, 255, 148, 148],
    [16.6, 255, 0, 0],
]);
WG.Colors.particles = new WgPalette([
    [0, 80, 80, 80, 0],
    [3, 80, 80, 80, 0.5],
    [6, 80, 80, 80, 0.8],
    [12, 80, 80, 80, 1],
    [30, 90, 50, 90, 1],
]);
WG.Colors.wparticles = new WgPalette([
    [0, 30, 30, 80, 0],
    [0.3, 30, 30, 80, 0],
    [1, 30, 30, 80, 1],
    [12, 30, 30, 80, 1],
]);
WG.Colors.barbs = new WgPalette([
    [2, 0, 0, 0, 0],
    [5, 0, 0, 0, 0.3],
    [10, 0, 0, 0, 1],
]);
WG.Colors.mix = new WgPalette([
    [0, 255, 0, 0, 1],
    [50, 255, 255, 255, 1],
    [100, 0, 255, 0, 1],
]);
WG.Colors.wpower = new WgPalette([
    [0, 255, 255, 255, 0],
    [100, 28, 236, 255, 1],
    [300, 71, 126, 255, 1],
    [500, 215, 5, 238, 1],
    [1000, 255, 0, 64, 1],
    [5000, 255, 140, 0, 1],
    [10000, 255, 244, 25, 1],
    [15000, 239, 242, 157, 1],
]);
WG.Colors.tide = new WgPalette([
    [-300, 255, 0, 120, 1],
    [-200, 255, 0, 100, 1],
    [-100, 255, 0, 40, 1],
    [-80, 255, 20, 40, 1],
    [0, 255, 255, 255, 1],
    [80, 40, 255, 20, 1],
    [100, 40, 255, 0, 1],
    [200, 100, 255, 0, 1],
    [300, 120, 255, 0, 1],
]);
WG.ColorsMaps = WG.clone(WG.Colors);
WgColors = WG.Colors;
WG.Model = $class({
    constructor: function (a) {
        $.extend(this, {}, a);
        this._init();
    },
    _init: function () {
        this.initdate && (this.init = moment.utc(this.initdate + "Z"));
        this.initdate_prev && (this.init_prev = moment.utc(this.initdate_prev + "Z"));
        this.lat && this.lon && "undefined" !== typeof L && (this.bounds = L.latLngBounds([this.lat[0], this.lon[0]], [this.lat[1], this.lon[1]]));
    },
    load: function (a) {
        var b = this;
        WG.qApi(
            {
                q: "load_maps_info",
                id_model: b.id_model,
            },
            function (c) {
                if (!c[b.id_model]) return !1;
                $.extend(b, c[b.id_model]);
                b._init();
                a && a(b);
            }
        );
    },
    hrRound: function (a) {
        for (var b = 0; b < this.hours.length; b++) {
            var c = this.hours[b];
            if (c >= a) return 0 < b ? (c - a < a - this.hours[b - 1] ? c : this.hours[b - 1]) : c;
        }
        return this.hours[this.hours.length - 1];
    },
    hrFloor: function (a) {
        for (var b = 0; b < this.hours.length; b++) {
            var c = this.hours[b];
            if (c >= a) return 0 < b ? this.hours[b - 1] : c;
        }
        return this.hours[0];
    },
    nextHour: function (a, b) {
        if (b) return this.hrRound(a + b);
        for (b = 0; b < this.hours.length; b++) {
            var c = this.hours[b];
            if (c > a) return c;
        }
        return this.hours[this.hours.length - 1];
    },
    prevHour: function (a, b) {
        if (b) return this.hrRound(a - b);
        for (b = this.hours.length - 1; b >= this.hours[0]; b--) {
            var c = this.hours[b];
            if (c < a) return c;
        }
        return this.hours[0];
    },
    getHrRaw: function (a) {
        this.initstamp_prev && a >= this.hr_end_main + this.hr_step && (a += this.initstamp / 3600 - this.initstamp_prev / 3600);
        return a;
    },
    getHrRawStr: function (a) {
        a = "" + this.getHrRaw(a);
        3 > a.length && (a = "0" + a);
        3 > a.length && (a = "0" + a);
        return a;
    },
    _moment2hr: function (a, b) {
        if (!b) return this.hours[0];
        a || (a = moment.utc());
        b = b.clone();
        for (var c = this.hr_start; b.isBefore(a) && c < this.hr_end; ) b.add(this.hr_step, "hour"), (c += this.hr_step);
        return c;
    },
    moment2hr: function (a) {
        return this._moment2hr(a, this.init);
    },
    coverageWindow: function (a) {
        this.infoWindow();
    },
    infoWindow: function (a, b, c) {
        a = a || "/snippets/model_information.php";
        c = c || WG.ttStr(0, 2, "Model information", "", "63", "@@@");
        b = b || "&map_w=" + WG.getMaxWidth(40, 1000) + "&map_h=" + WG.getMaxHeight(150, 1000);
        WG._model_iw
            ? WG._model_cw.load(a + "?model=" + this.id_model + b)
            : (WG._model_iw = new WG.Window({
                  title: c,
                  src: a + "?model=" + this.id_model + b,
                  onClose: function () {
                      WG._model_iw = null;
                  },
              }));
    },
});
WG.Model.sortFn = function (a, b) {
    return a.resolution > b.resolution ? -1 : a.resolution < b.resolution ? 1 : a.longname.localeCompare(b.longname);
};
WG.Model.infoWindow = function (a) {
    new WG.Model({
        id_model: a,
    }).infoWindow();
};
WG.MapModel = $class({
    Extends: WG.Model,
    constructor: function (a) {
        WG.Model.call(this, a);
    },
    _init: function () {
        WG.MapModel._superClass._init.call(this);
        this.initdate_img && (this.init_img = moment.utc(this.initdate_img + "Z"));
        this.initdate_img_prev && (this.init_img_prev = moment.utc(this.initdate_img_prev + "Z"));
        this.lat &&
            this.lon &&
            "undefined" !== typeof L &&
            (-85.051128779806 > this.lat[0] && (this.lat[0] = -85.051128779806), 85.051128779806 < this.lat[1] && (this.lat[1] = 85.051128779806), (this.bounds = L.latLngBounds([this.lat[0], this.lon[0]], [this.lat[1], this.lon[1]])));
    },
    load: function (a) {
        var b = this;
        WG.qApi(
            {
                q: "load_maps_info",
                id_model: b.id_model,
            },
            function (c) {
                if (!c[b.id_model]) return !1;
                $.extend(b, c[b.id_model]);
                b._init();
                a && a(b);
            }
        );
    },
    currentMapHour: function () {
        var a = this.initdate_img.clone(),
            b = this.hr_start;
        a.add(b, "hour");
        for (var c = moment.utc(); a.isBefore(c) && b < this.hr_end; ) a.add(this.hr_step, "hour"), (b += this.hr_step);
        return b;
    },
    moment2hr: function (a) {
        return this._moment2hr(a, this.init_img);
    },
    getHrRaw: function (a) {
        this.tiledir_prev && a >= this.init_prev_hr_start && (a += this.initstamp_img / 3600 - this.initstamp_img_prev / 3600);
        return a;
    },
    getTileDir: function (a) {
        var b = this.map_server,
            c = this.tiledir;
        this.tiledir_prev && a >= this.init_prev_hr_start && (c = this.tiledir_prev);
        return b + "/tiles/" + c;
    },
    getMapsJson: function (a) {
        return this.getTileDir(a) + "/all_" + this.getHrRawStr(a) + ".json";
    },
    getMaskUrl: function (a) {
        a = this.map_server;
        return a + "/model/" + this.model + "/mask.png";
    },
    getMap: function (a) {
        for (var b = 0; b < this.maps.length; b++) if (this.maps[b].id == a) return $.extend({}, this.maps[b]);
        return !1;
    },
    mapFileExists: function (a) {
        for (var b = 0; b < this.maps.length; b++) for (var c = this.maps[b], d = 0; d < c.files.length; d++) if (c.files[d] == a) return !0;
        return !1;
    },
    mapExists: function (a, b) {
        for (var c = 0; c < this.maps.length; c++) {
            if (b && this.maps[c].id.substr(0, b) == a.substr(0, b)) return this.maps[c].id;
            if (this.maps[c].id == a) return a;
        }
        return !1;
    },
    isTiled: function () {
        return this.zoom_data_tiles.length ? !0 : !1;
    },
    loadMask: function (a) {
        var b = $.Deferred();
        this.gdal_mask
            ? (this.mask = new WG.DataImage("mask", {
                  lat: {
                      min: this.lat[0],
                      max: this.lat[1],
                  },
                  lon: {
                      min: this.lon[0],
                      max: this.lon[1],
                  },
              }))
                  .load(this.getMaskUrl(a))
                  .then(function () {
                      b.resolve();
                  })
            : ((this.mask = !1), b.resolve());
        return b;
    },
    getDataImage: function (a, b, c) {},
    getDataImageTile: function (a, b, c, d) {},
});
WG.Window = $class({
    constructor: function (a) {
        var b = this,
            c = {
                title: "&nbsp;",
                draggable: "title",
                overlay: !1,
                closeButton: "title",
                addClass: "wgmodal-padding",
                maxHeight: WG.getMaxHeight(20),
                maxWidth: WG.getMaxWidth(0),
                fitScreen: !1,
                ajaxify: $("#main-page"),
                closeOnEsc: !0,
                blockScroll: !1,
                fixed: !0,
                closeOnClick: "overlay",
                outside: "x",
                adjustPosition: !0,
                onLoad: function () {},
                onClose: function () {},
                onCloseComplete: function () {
                    this.destroy();
                },
            };
        a.target &&
            !a.position &&
            (a.position = {
                x: "right",
                y: "top",
            });
        a = $.extend({}, c, a);
        a.fixed && (a.addClass += " wg-fixed");
        this.jbox = new jBox("Modal", a);
        this.jbox.open();
        WG._all_form_jbox || (WG._all_form_jbox = []);
        WG._all_form_jbox.push(this.jbox);
        WG._all_windows || (WG._all_windows = {});
        WG._all_wg_windows || (WG._all_wg_windows = {});
        WG._all_windows[this.jbox.id] = this.jbox;
        WG._all_wg_windows[this.jbox.id] = this;
        this.close = function () {
            b.jbox.destroy();
        };
        this.getContent$ = function () {
            return b.jbox.content;
        };
        this.toFront = function () {
            b.jbox.toFront();
        };
        this.load = function (c) {
            var d = WG.parseUrl(c);
            c = c + (d.search ? "&" : "?") + "windowId=" + b.jbox.id;
            WG.log(c);
            $.get(c, function (c) {
                b.jbox.setContent(c);
                b.jbox.content.find("button.close").on("click", function () {
                    b.jbox.close();
                });
                c = b.jbox.content.find("div[data-window-title]");
                c.length && b.setTitle(c.data("window-title"));
                a.onLoad(b);
                a.fitScreen &&
                    setTimeout(function () {
                        b.fitWindow(!1, !1, !0);
                        $(window).on(
                            "resize",
                            WG.debounce(function () {
                                WG.log("fitWindow");
                                b.fitWindow(!1, !1, !0);
                            }, 100)
                        );
                    }, 150);
                a.ajaxify && WG.ajaxify(b.jbox.content, a.ajaxify);
            });
        };
        this.fitWindow = function (a, b, c) {
            this.jbox.fitWindow(a, b, c);
        };
        this.setTitle = function (a) {
            b.jbox.setTitle(a);
        };
        a.src && this.load(a.src);
    },
});
WG.Window.closeById = function (a) {
    a && WG._all_windows[a] && WG._all_windows[a].close();
};
WG.window = function (a) {
    return new WG.Window(a);
};
WG.Spot = $class({
    constructor: function (a) {
        $.extend(
            this,
            {
                id_spot: 0,
                spotname: "Unknown spot",
                id_country: 0,
                country: "Unknown",
                lat: 0,
                lon: 0,
                alt: 0,
                tz: "UTC",
                sunrise: "??:??",
                sunset: "??:??",
                models: [],
                tide: null,
                marker: {},
                link_text: null,
            },
            a
        );
        this.marker = {};
    },
    load: function (a, b) {
        var c = this;
        b = b || {};
        var d = {
                q: "spot",
                id_spot: c.id_spot,
            },
            e;
        for (e in b) d[e] = b[e];
        WG.qApi(d, function (b) {
            if (!b.id_spot) return !1;
            $.extend(c, b);
            a && a();
        });
    },
    makeMarker: function (a) {
        a = $.extend(
            {
                popup: !0,
            },
            a
        );
        var b = this.getIcon(a);
        this.marker = L.marker([this.lat, this.lon], {
            icon: b,
            draggable: !1,
            zIndexOffset: 1000,
            spot: this,
        });
        a.popup && this.updatePopUp();
        return this.marker;
    },
    addToMap: function (a) {
        this.marker && (this.marker.addTo(a.map), (a.WG_layers["spot_" + this.id_spot] = this.marker));
    },
    removeFromMap: function (a) {
        this.marker && a.map.removeLayer(this.marker);
    },
    getIcon: function (a) {
        a = $.extend(
            {
                size: 28,
                fill: "#000",
                stroke: "#000",
                strokeWidth: 10,
                favourite: !1,
            },
            a
        );
        this.isFavourite() && (a.favourite = !0);
        return L.divIcon({
            className: "",
            iconSize: [a.size, a.size],
            popupAnchor: [0, Math.round(-a.size + a.size / 10)],
            iconAnchor: [Math.round(a.size / 2), a.size],
            html: WG.svgWgMarkerInline(a.fill, a.stroke, a.strokeWidth, a.favourite),
        });
    },
    getIconStandard: function (a) {
        a = $.extend(
            {
                size: 28,
                fill: "#2076C8",
                stroke: "#2076C8",
                strokeWidth: 10,
                favourite: !1,
            },
            a
        );
        this.isCustom() && ((a.fill = "#00B415"), (a.stroke = "#00B415"));
        return this.getIcon(a);
    },
    getFullName: function () {
        var a = this.spotname;
        this.id_country && (a = this.country + " - " + this.spotname);
        return a;
    },
    updateMarker: function () {
        this.marker.setIcon(this.getIcon());
        this.updatePopUp();
    },
    getPopUpHtml: function () {
        var a = this,
            b = $("<div>");
        var c = '<div class="title">' + this.spotname + "</div>";
        c += '<ul class="sm sm-simple sm-simple-vertical sm-vertical">';
        if (a.id_spot)
            (c += '<li><a class="showfcst">' + WG.ttStr(2430, 1, "Show forecast", "", "67", "@@@") + "</a></li>"),
                a.tide && (c += '<li><a class="showtide">' + WG.ttStr(0, 1, "Show tide (model)", "", "67", "@@@") + "</a></li>"),
                (c += '<li><a class="setfavo">' + WG.ttStr(2433, 1, "Add to favorites", "", "67", "@@@") + "</a></li>");
        else {
            var d = a.lat + "," + a.lon;
            c += '<li><a href="javascript:WG.addCustomSpot(' + d + ');">' + WG.ttStr(2429, 1, "Add custom spot", "", "64", "@@@") + "</a></li>";
            c +=
                '<li><a class="" href="javascript:WG.latlonFcst(' +
                d +
                ');">' +
                WG.ttStr(2430, 1, "Show forecast", "", "64", "@@@") +
                " <i>(" +
                WG.ttStr(2431, 1, "PRO only", "available to PRO users only...", "64", "@@@") +
                ")</i></a></li>";
            a.tide && (c += '<li><a class="showtide">' + WG.ttStr(0, 1, "Show tide", "", "67", "@@@") + "</a></li>");
        }
        b.html(c + "</ul>");
        b.on("click", ".showfcst", function () {
            a.openSpot();
        });
        b.on("click", ".setfavo", function () {
            WG.user.addFavourite(a.id_spot, WG.reloadFavourites || function () {});
        });
        b.on("click", ".showtide", function () {
            a.tideExplorer();
        });
        return b[0];
    },
    updatePopUp: function () {
        this.marker.unbindPopup();
        this.marker.bindPopup(this.getPopUpHtml(), {
            className: "wg-map-popup",
        });
    },
    openPopUp: function () {
        this.marker.openPopup();
    },
    openSpot: function () {
        this.id_spot && (WG.showForecastSpot ? WG.showForecastSpot(this.id_spot) : window.open("/?s=" + this.id_spot, "_top"));
    },
    isFavourite: function () {
        if (WG.user) {
            if (!WG.user.isFavourite) return !1;
            if (WG.user.isFavourite(this.id_spot)) return !0;
        }
        return !1;
    },
    isCustom: function (a) {
        if (this.id_user && WG.user)
            if (void 0 === a || a) {
                if (this.id_user == WG.user.id_user) return !0;
            } else if (169 != this.id_user && 2 != this.id_user) return !0;
        return !1;
    },
    setFavourite: function (a, b, c, d) {
        if (WG.user.id_user) {
            var e = a ? "add_f_spot" : "remove_f_spot";
            d = d || 2000;
            WG.qApi(
                {
                    q: e,
                    id_spot: this.id_spot,
                },
                function (a) {
                    WG.message(a.message, "error" == a["return"] ? !0 : !1, c, d);
                    WG.gae("Quick Form", "error" == a["return"] ? "error" : "OK", e);
                    b && b(a);
                }
            );
        } else
            a ? (WG.user.addFavourite(this.id_spot), WG.message("Favourite spot added", !1, c, d)) : (WG.user.removeFavourite(this.id_spot), WG.message("Favourite spot removed", !1, c, d)),
                (a = {
                    return: "OK",
                    favourite: a ? 1 : 0,
                }),
                b && b(a);
    },
    modalModelSelect: function (a, b) {
        b = $.extend(
            {
                multi: !1,
                free: !1,
                virtual: !1,
                selected: [],
                groups: "",
            },
            b
        );
        var c = this;
        WG.loadModels(function (d) {
            for (var e = [], f = {}, g = 0; g < c.models.length; g++) {
                var h = d[c.models[g]];
                !h || (b.free && h.pro) || ((e[e.length] = [h.id_model, h.model_name]), "weather_waves" == b.groups && (f[h.id_model] = h.wave ? "wave" : "weather"));
            }
            b.groups = f;
            f = "Select model";
            b.multi && (f = "Select models");
            WG.modalSelect(
                f,
                e,
                function (c) {
                    if (b.multi) {
                        for (var e = [], f = 0; f < c.length; f++) e[e.length] = d[c[f]];
                        a(e);
                    } else a(d[c]);
                },
                b
            );
        }, b.virtual);
    },
    calcTide: function (a, b, c) {
        var d = this.tidePredictor();
        return d
            ? d.getTimelinePrediction({
                  start: a.toDate(),
                  end: b.toDate(),
                  timeFidelity: c,
              })
            : !1;
    },
    tidePredictor: function () {
        if (!this.tide) return !1;
        var a = this.tide,
            b = [],
            c;
        for (c in a)
            b.push({
                phase_GMT: a[c][1],
                amplitude: a[c][0],
                name: c,
            });
        return tidePredictor(b, {
            phaseKey: "phase_GMT",
        });
    },
    tideAvailable: function () {
        if (!this.tide) return !1;
        var a = this.tide,
            b;
        for (b in a) if (0 < a[b][0]) return !0;
        return !1;
    },
    calcTideExtremes: function (a, b, c) {
        var d = this.tidePredictor();
        return d
            ? d.getExtremesPrediction({
                  start: a.toDate(),
                  end: b.toDate(),
                  timeFidelity: c,
              })
            : !1;
    },
    calcTideForFcst: function (a, b, c) {
        c = c || 300;
        var d = a.clone().subtract(1, "days").hour(0).minute(0).second(0).millisecond(0),
            e = d.clone();
        e.add(12, "days");
        var f,
            g = "" + Math.round(100 * this.lat) + "," + Math.round(100 * this.lon) + "," + c,
            h = WG.Spot._TIDE_CACHE;
        if ((f = h[g]) && f[0].time.getTime() <= a.valueOf() && f[f.length - 1].time.getTime() >= b.valueOf()) {
            c = [];
            for (d = 0; d < f.length; d++)
                if (!(f[d].time.getTime() < a.valueOf())) {
                    if (f[d].time.getTime() > b.valueOf()) break;
                    c.push(f[d]);
                }
            WG.log("Tide cached! reuse...");
            return c;
        }
        WG.log("Tide NOT cached! calc...");
        f = this.calcTide(d, e, c);
        h[g] = f;
        c = [];
        for (d = 0; d < f.length; d++)
            if (!(f[d].time.getTime() < a.valueOf())) {
                if (f[d].time.getTime() > b.valueOf()) break;
                c.push(f[d]);
            }
        return c;
    },
    tide2Levels: function (a, b, c, d) {
        for (var e = [], f = 0, g = 0, h = [], k = [], p = 0, q = 0, n = [], m = 0; m < a.length; m++) {
            var t = a[m].level,
                w = a[m].time.getTime();
            if (!(w < b.valueOf())) {
                if (w > c.valueOf()) break;
                g = t > g ? t : g;
                f = t < f ? t : f;
                var B = !1;
                0 < m &&
                    m < a.length - 1 &&
                    (a[m - 1].level < t && a[m + 1].level < t && 0 < t && (1 < a[m].hour - q || !q) && (h.push(a[m]), (a[m].high = !0), (q = a[m].hour), (B = !0)),
                    a[m - 1].level > t && a[m + 1].level > t && 0 > t && (1 < a[m].hour - p || !p) && (k.push(a[m]), (a[m].low = !0), (p = a[m].hour), (B = !0)));
                (m % d && !B) || (n.push(w / 1000), e.push(t));
            }
        }
        return {
            levels: e,
            epochs: n,
            highs: h,
            lows: k,
            range: [f, g],
        };
    },
    tideLevels: function (a, b, c, d) {
        c = this.calcTide(a, b, c);
        return this.tide2Levels(c, a, b, d);
    },
    addLastCookie: function () {},
    tideExplorer: function () {
        var a = this,
            b = function () {
                WG.TideSpot._explorer && WG.TideSpot._explorer.close();
                var b = new WG.Window({
                    title: WG.ttStr(0, 2, "Tide explorer", "", "63", "@@@") + '<span class="w480-hide">: ' + a.spotname + "</span>",
                    addClass: "wgmodal-nopadding",
                    fixed: !0,
                    outside: !1,
                    height: WG.getMaxHeight(70),
                    width: 600 < $(window).width() ? WG.getMaxWidth(20, 1100) : WG.getMaxWidth(),
                    target: $("body"),
                    position: {
                        x: "left",
                        y: 72,
                    },
                    src: "/ajax/ajax_tide_explorer.php?id_spot=" + a.id_spot + "&lat=" + a.lat + "&lon=" + a.lon,
                });
                WG.TideSpot._explorer = b;
            };
        this.id_spot
            ? this.load(function () {
                  a.isCustom(!1)
                      ? WG.checkUser(
                            function (a) {
                                b(a);
                            },
                            function () {
                                WG.proOnly(1, "tide");
                            },
                            !0
                        )
                      : b();
              })
            : WG.checkUser(
                  function (a) {
                      b();
                  },
                  function () {
                      WG.proOnly(1, "tide");
                  },
                  !0
              );
    },
    setTideConstituents: function (a) {
        WG.Spot._TIDE_CACHE = [];
        this.tide = a;
    },
    tideGraph: function (a, b, c) {
        var d = a.width(),
            e = a.height();
        a.width(d).height(e).css("background-color", "#FFFFFF !important");
        a.svg();
        var f = new WgSvg.Canvas(a);
        f.svg.rect(0, 0, d, e, 0, 0, {
            fill: "#FFFFFF",
            strokeWidth: 0,
        });
        this._tide_sg = d = new WgSvg.Graph(f, {
            px_position: [0, 0],
            px_dimensions: [d, e],
            px_padding: [0, 30, 0, 0],
        });
        this.graphHours(d, b, c, {
            year: !0,
        });
        WG.logTime("tide calc");
        e = this.tideLevels(b, c, 300, 3);
        WG.logTimeEnd("tide calc", e.range);
        WG.log("tide min/max", e.range);
        f = e.range;
        f[0] *= 1.2;
        f[1] *= 1.3;
        -60 < f[0] && (f[0] = -60);
        60 > f[1] && (f[1] = 60);
        d.setXVals(e.epochs);
        d.setRange([b.unix(), c.unix()], f);
        d.gridLinesH([-400, -300, -200, -100, -50, 0, 50, 100, 200, 300, 400]);
        a = "TIDEgradient" + a.attr("id");
        d.linearGradientV(a, WgColors.tide);
        d.legend(
            {
                fill: "url(#" + a + ")",
                stroke: "#EAEAEA",
                strokeWidth: 1,
                opacity: 1,
            },
            {
                width: 5,
                left: 5,
                line_width: 20,
                line_left: 0,
                text_left: 12,
                text_offset: 3,
                desc_left: 10,
            },
            [-400, -300, -200, -100, -50, 0, 50, 100, 200, 300, 400],
            [-4, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4],
            {
                "font-size": "10px",
                opacity: 1,
                "text-anchor": "left",
            },
            "Level (m)"
        );
        d.area(
            e.levels,
            0.5,
            {
                fill: "url(#" + a + ")",
                stroke: "none",
                opacity: 0.5,
            },
            {},
            0
        );
        this.graphTideLine(d, b, c, e);
        this.graphTideLabels(d, b, c, e);
        return d;
    },
    calcTideLevel: function (a) {
        var b = this.tidePredictor();
        return b
            ? b.getWaterLevelAtTime({
                  time: a.toDate(),
              })
            : !1;
    },
    graphTideLine: function (a, b, c, d, e) {
        e = e || {
            strokeWidth: 1.5,
        };
        a.setXVals(d.epochs);
        a.line(d.levels, 0.5, e);
    },
    graphTideLabels: function (a, b, c, d) {
        a.setXVals(d.epochs);
        for (b = 0; b < d.highs.length; b++) {
            c = d.highs[b].level;
            var e = d.highs[b].time;
            e = moment(e);
            e.tz(this.tzid);
            a.text(
                d.highs[b].time.getTime() / 1000,
                c,
                e.format("HH:mm"),
                {
                    offset_v: 13,
                },
                {
                    "font-size": "11.5px",
                    "font-weight": "bold",
                }
            );
            a.text(d.highs[b].time.getTime() / 1000, c, (0 < d.highs[b].level ? "+" : "") + WG.round(d.highs[b].level, 0) + " cm", {});
        }
        for (b = 0; b < d.lows.length; b++)
            (c = d.lows[b].level),
                (e = d.lows[b].time),
                (e = moment(e)),
                e.tz(this.tzid),
                a.text(
                    d.lows[b].time.getTime() / 1000,
                    c,
                    e.format("HH:mm"),
                    {
                        offset_v: -23,
                    },
                    {
                        "font-size": "11.5px",
                        "font-weight": "bold",
                    }
                ),
                a.text(d.lows[b].time.getTime() / 1000, c, WG.round(d.lows[b].level, 0) + " cm", {
                    offset_v: -12,
                });
    },
    graphHours: function (a, b, c, d) {
        d = $.extend(
            {
                hours_major: [0],
                hours_minor: [3, 6, 9, 12, 15, 18, 21],
                hours_label: [0, 6, 12, 18],
                year: !1,
            },
            d
        );
        a.setXRange(b.unix(), c.unix());
        var e = [],
            f = [],
            g = [],
            h = [],
            k = [],
            p = [],
            q = b.clone();
        for (q.tz(this.tzid); q.isBefore(c); ) {
            var n = q.hour();
            -1 < $.inArray(n, d.hours_major) && (e[e.length] = q.unix());
            -1 < $.inArray(n, d.hours_minor) && (f[f.length] = q.unix());
            -1 < $.inArray(n, d.hours_label) && ((k[k.length] = q.unix()), (p[p.length] = q.format("H") + "h"));
            12 == n && ((g[g.length] = q.unix()), (h[h.length] = WG.getLangText("weekday", q.format("d")) + " " + (d.year ? q.format("D.M. Y") : q.format("D.M."))));
            q.add(1, "hours");
        }
        d = this.sunset.split(":");
        n = this.sunrise.split(":");
        b = b.clone().tz(this.tzid).subtract(1, "day");
        for (q = [b.clone().hour(d[0]).minute(d[1]), b.clone().add(1, "day").hour(n[0]).minute(n[1])]; b.isBefore(c); )
            (b = q[1].clone()),
                (q = [b.clone().hour(d[0]).minute(d[1]), b.clone().add(1, "day").hour(n[0]).minute(n[1])]),
                a.gridRect(q[0].unix(), q[1].unix(), {
                    fill: "#000088",
                    stroke: "none",
                    strokeWidth: 0,
                    opacity: 0.05,
                });
        a.gridLinesV(f, {
            strokeWidth: 0.5,
            opacity: 0.1,
            "stroke-dasharray": "2,2",
        });
        a.gridLinesV(e, {
            strokeWidth: 1,
            opacity: 0.3,
        });
        a.setXVals(g);
        a.texts(
            h,
            {
                ypos: a.y.range[1],
                skip: 0,
                offset_v: -12,
                offset_h: 0,
            },
            {
                "font-size": "11px",
            }
        );
        a.setXVals(k);
        a.texts(
            p,
            {
                ypos: a.y.range[1],
                skip: 0,
                offset_v: -25,
                offset_h: 0,
            },
            {
                "font-size": "10px",
                opacity: 0.5,
            }
        );
    },
});
WG.Spot._TIDE_CACHE = [];
WG.TideSpot = $class({
    Extends: WG.Spot,
    constructor: function (a) {
        WG.Spot.call(this, a);
        this._HARMBASESPOT = !0;
    },
    getIcon: function (a) {
        a = $.extend(
            {
                size: 15,
                className: "tide-div-icon",
            },
            a
        );
        return L.divIcon({
            className: "tide-div-icon",
            iconSize: [a.size, a.size],
        });
    },
    getIconStandard: function (a) {
        return this.getIcon(a);
    },
    getPopUpHtml: function () {
        var a = this,
            b = $("<div>");
        var c = '<div class="title">' + this.spotname + "</div>";
        c = c + '<ul class="sm sm-simple sm-simple-vertical sm-vertical">' + ('<li><a class="showtide">' + WG.ttStr(0, 1, "Show tide (measured)", "", "67", "@@@") + "</a></li>");
        b.html(c + "</ul>");
        b.on("click", ".showfcst", function () {
            a.openSpot();
        });
        b.on("click", ".showtide", function () {
            a.tideExplorer();
        });
        return b[0];
    },
    tideExplorer: function () {
        WG.TideSpot._explorer && WG.TideSpot._explorer.close();
        var a = new WG.Window({
            title: WG.ttStr(0, 2, "Tide explorer", "", "63", "@@@") + '<span class="w480-hide">: ' + this.spotname + "</span>",
            addClass: "wgmodal-nopadding",
            fixed: !0,
            outside: !1,
            height: WG.getMaxHeight(70),
            width: 600 < $(window).width() ? WG.getMaxWidth(20, 1100) : WG.getMaxWidth(),
            target: $("body"),
            position: {
                x: "left",
                y: 72,
            },
            src: "/ajax/ajax_tide_explorer.php?harmbase_id=" + this.harmbase_id + "&lat=" + this.lat + "&lon=" + this.lon,
        });
        WG.TideSpot._explorer = a;
    },
});
WG.User = $class({
    constructor: function (a) {
        $.extend(
            this,
            {
                id_user: 0,
                pro: !1,
                username: "",
                geoposition: null,
                favourite: [],
                custom: [],
                last: [],
                login_md5: "",
                wj: "knots",
                tj: "c",
                waj: "m",
                odh: 3,
                doh: 22,
                fhours: 240,
                wrap: 40,
                fcm: !1,
            },
            a
        );
        this.marker = {};
    },
    setProperties: function (a) {
        $.extend(this, a);
    },
    loadCurrent: function (a) {
        var b = this;
        WG.qApi(
            {
                q: "user_load_current",
            },
            function (c) {
                $.extend(b, c);
                a && a();
            }
        );
    },
    login: function (a, b, c, d) {
        var e = this;
        WG.qApi(
            {
                q: "wg_login",
                username: a,
                password: b,
            },
            function (a) {
                a.data && ((e._login_md5 = a.data.login_md5), (e.id_user = a.data.id_user));
                "OK" == a.return ? c && c(a) : d && d(a);
            }
        );
    },
    loginWindow: function () {
        WG.modalForm(
            {
                form_url: "/forms/login.php",
                api_data: {
                    q: "wg_login",
                },
                callback: function (a, b) {
                    b.close();
                    "OK" == a.return && location.assign("/");
                },
                callback_delay: 100,
            },
            {
                title: "Login",
            }
        );
    },
    logout: function (a) {
        a = 1;
        $.get(WG.getApi() + "?q=wg_logout" + (a ? "&full=1" : ""), function (a) {
            location.assign("/");
        });
    },
    remove: function (a, b) {
        a =
            a ||
            function () {
                location.assign("/");
            };
        WG.qApi(
            {
                q: "user_remove",
            },
            function (b) {
                "OK" == b.return && a && a(b);
            },
            !1,
            !1,
            b
        );
    },
    fbMe: function () {
        WG.log("Welcome!  Fetching your information.... ");
        FB.api(
            "/me",
            {
                fields: "id,first_name,last_name,email,picture",
            },
            function (a) {
                WG.log("Successful login for: " + a.first_name);
                WG.log(a);
            }
        );
    },
    setFavourite: function (a, b, c) {
        b ? this.addFavourite(a, c) : this.removeFavourite(a, c);
    },
    favouriteIcon: function (a, b, c) {
        var d = !1;
        a = "" + a;
        -1 != this.favourite.indexOf(a) && (d = !0);
        a = $('<a class="favourite-ss tooltip ' + b + " " + (d ? "yellow" : "") + '" data-ss="' + a + '" data-favourite="0" title="Add or remove favourite"><svg class="icon"><use xlink:href="#ico_favourite"></use></svg></a>');
        this.favouriteIconActions(a, c);
        return a;
    },
    favouriteIconActions: function (a, b) {
        var c = this,
            d = a.data("ss");
        !b && WG.reloadFavourites && (b = WG.reloadFavourites);
        a.on("click", function (a) {
            a.stopPropagation();
            a = $(this);
            var e = $('.favourite-ss[data-ss="' + d + '"]');
            a.hasClass("yellow")
                ? c.removeFavourite(d, function () {
                      WG.arrayRemove(c.favourite, d);
                      e.removeClass("yellow");
                      b && b(d, !1);
                  })
                : c.addFavourite(d, function () {
                      WG.arrayRemove(c.favourite, d);
                      c.favourite.unshift(d);
                      e.addClass("yellow");
                      b && b(d, !0);
                  });
        });
    },
    isFavourite: function (a) {
        return -1 != this.favourite.indexOf(a) || -1 != this.favourite.indexOf("" + a) ? !0 : !1;
    },
    isCustom: function (a) {
        return -1 != this.custom.indexOf(a) || -1 != this.custom.indexOf("" + a) ? !0 : !1;
    },
    addFavourite: function (a, b) {
        function c() {
            WG.arrayRemove(d.favourite, a);
            d.favourite.unshift(a);
            d.favourite.splice(50);
            d.store();
            WG.spotCompleteReset && WG.spotCompleteReset();
            b && b();
        }
        if (a) {
            a = "" + a;
            var d = this;
            this.id_user
                ? WG.qApi(
                      {
                          q: "favourite_add",
                          ss: a,
                      },
                      function (a) {
                          WG.message(a.message, "error" == a["return"] ? !0 : !1);
                          "OK" == a.return && c();
                      }
                  )
                : (c(), WG.message("Favourite spot added", !1));
        }
    },
    removeFavourite: function (a, b) {
        function c() {
            WG.arrayRemove(d.favourite, a);
            d.store();
            WG.spotCompleteReset && WG.spotCompleteReset();
            b && b();
        }
        if (a) {
            a = "" + a;
            var d = this;
            this.id_user
                ? WG.qApi(
                      {
                          q: "favourite_remove",
                          ss: a,
                      },
                      function (a) {
                          WG.message(a.message, "error" == a["return"] ? !0 : !1);
                          "OK" == a.return && c();
                      }
                  )
                : (c(), WG.message("Favourite spot removed", !1));
        }
    },
    syncServerFavourites: function (a, b) {
        if (!a.length) return b(), !0;
        WG.qApiPost(
            {
                q: "sync_favourites",
                favourites: a,
            },
            function (a) {
                b && b(a);
            }
        );
    },
    addLast: function (a, b) {
        a && ((b = b || 10), (a = "" + a), WG.arrayRemove(this.last, a), this.last.unshift(a), this.last.splice(b), this.store(), WG.spotCompleteReset && WG.spotCompleteReset());
    },
    getLastIdSpot: function () {
        if (!this.last) return !1;
        for (var a = 0; a < this.last.length; a++) {
            var b = this.last[a];
            if ($.isNumeric(b)) return parseInt(b);
        }
        return !1;
    },
    getLastIdStation: function () {
        if (!this.last) return !1;
        for (var a = 0; a < this.last.length; a++) {
            var b = this.last[a];
            if ("s" == b.substr(0, 1)) return parseInt(b, 1);
        }
        return !1;
    },
    hasFavouriteStation: function (a) {
        return -1 != this.favourite.indexOf("s" + a) ? !0 : !1;
    },
    hasFavouriteSpot: function (a) {
        return -1 != this.favourite.indexOf("" + a) ? !0 : !1;
    },
    fcstOptions: function (a) {
        a.wj = this.wj;
        a.tj = this.tj;
        a.waj = this.waj;
        a.odh = this.odh;
        a.doh = this.doh;
        a.fhours = this.fhours;
        a.wrap = this.wrap;
        a.vt = this.vt;
        a.cellsize = this.cellsize;
        return a;
    },
    store: function (a) {
        WG.storage && WG.storage.setWg("user", this, a);
    },
});
WG.Station = $class({
    constructor: function (a) {
        $.extend(
            this,
            {
                id_station: 0,
                id_spot: 0,
                wg: !1,
                spotname: "Unknown spot",
                name: "Unknown WG Station",
                lat: 0,
                lon: 0,
                weather: {},
                marker: {},
                wj: "knots",
                tj: "c",
                link: "/station/",
                link_text: null,
                logo: null,
                url: null,
                onclick: null,
                popup: !0,
                seconds_alive: 0,
                dead_fade: [10800, 172800],
                favourite: !1,
                iconstyle: "wg",
            },
            a
        );
        this.marker = null;
    },
    load: function (a, b, c) {
        var d = this;
        a = a || this.id_station;
        c = c || !1;
        WG.qApi(
            {
                q: "station",
                id_station: a,
                weather: c,
            },
            function (a) {
                if (!a.id_station) return !1;
                d.id_station = a.id_station;
                d.wg = a.wg;
                d.lat = a.lat;
                d.lon = a.lon;
                d.spotname = a.spotname;
                d.id_spot = a.id_spot;
                d.name = a.name;
                d.seconds_alive = a.seconds_alive || null;
                d.logo = a.logo || null;
                d.url = a.url || null;
                d.favourite = a.favourite ? !0 : !1;
                c && d.setWeather(a.weather);
                b && b();
            }
        );
    },
    loadWeather: function (a) {
        var b = this;
        WG.qApi(
            {
                q: "station_data_current",
                id_station: this.id_station,
            },
            function (c) {
                if (!c.unixtime) return !1;
                b.setWeather(c);
                a && a();
            }
        );
    },
    setWeather: function (a) {
        this.weather = a;
        this.updateMarker();
    },
    switchWindUnits: function (a) {
        this.wj != a && ((this.wj = a), this.updateMarker());
    },
    switchTempUnits: function (a) {
        this.tj != a && ((this.tj = a), this.updateMarker());
    },
    makeMarker: function () {
        var a = this.getIcon(),
            b = this;
        this.marker = L.marker([this.lat, this.lon], {
            icon: a,
            draggable: !1,
            zIndexOffset: 1000,
            station: this,
        });
        if (b.onclick)
            this.marker.on("click", function () {
                b.onclick(b);
            });
        else this.updatePopUp();
        return this.marker;
    },
    addToMap: function (a) {
        this.marker && this.marker.addTo(a.map);
    },
    getIcon: function () {
        var a = [60, 60];
        2 <= window.devicePixelRatio && (a = [50, 50]);
        return L.divIcon({
            className: "",
            iconSize: a,
            html: this.getLogo(),
        });
    },
    getLogo: function (a) {
        var b = {
            dir: !0,
        };
        $.extend(b, a);
        a = "";
        var c = this.weather.wind_avg,
            d = this.weather.wind_max,
            e = this.weather.wind_direction;
        WgUtil.getLangText("units", this.wj);
        var f = null;
        this.seconds_alive > this.dead_fade[0] && ((f = 0), this.seconds_alive < this.dead_fade[1] && (f = (this.dead_fade[1] - this.seconds_alive) / (this.dead_fade[1] - this.dead_fade[0])));
        this.weather.time_string && (f = null);
        null !== c && (a = WgUtil.round(WgUtil.unitConvert(c, this.wj), 1));
        return b.dir ? ("wg" == this.iconstyle ? WG.svgWgStationInline(c, e, a, d, f) : WG.svgLwStationInline(c, e, a, d, f)) : "wg" == this.iconstyle ? WG.svgWgStationInlineSimple(c, a, f) : WG.svgLwStationInlineSimple(c, a, f);
    },
    getWindAvg: function () {
        return void 0 !== this.weather.wind_avg && null !== this.weather.wind_avg ? this.weather.wind_avg : null;
    },
    getWindAvgColor: function (a) {
        var b = void 0 !== a ? "#ffffff" : "rgba(255,255,255," + a + ")";
        null !== this.weather.wind_avg && (b = void 0 !== a ? WgColors.wind.getRGBA(this.weather.wind_avg, a) : WgColors.wind.getRGB(this.weather.wind_avg));
        return b;
    },
    divLogo: function (a, b) {
        var c = this,
            d = {
                refresh_seconds: 60,
                load: !1,
                dir: !0,
            };
        $.extend(d, b);
        $div = $(a);
        $div[0] &&
            (this.id_station
                ? d.load
                    ? ((d.load = !1),
                      this.load(
                          this.id_station,
                          function () {
                              $div.empty().append(
                                  c.getLogo({
                                      dir: d.dir,
                                  })
                              );
                              d.refresh_seconds &&
                                  setTimeout(function () {
                                      c.divLogo(a, d);
                                  }, 1000 * d.refresh_seconds);
                          },
                          !0
                      ))
                    : this.loadWeather(function () {
                          $div.empty().append(
                              c.getLogo({
                                  dir: d.dir,
                              })
                          );
                          d.refresh_seconds &&
                              setTimeout(function () {
                                  c.divLogo(a, d);
                              }, 1000 * d.refresh_seconds);
                      })
                : $div.empty().append(WG.svgWgStationInlineSimple(0, "", 1)));
    },
    getFullName: function () {
        var a = this.spotname;
        this.name && (a += a.length ? ", " + this.name : this.name);
        return a;
    },
    updateMarker: function () {
        if (!this.marker) return !1;
        this.marker.setIcon(this.getIcon());
        this.updatePopUp();
        return !0;
    },
    getPopUpHtml: function () {
        var a = "",
            b = this.spotname,
            c = WgUtil.getLangText("units", this.wj),
            d = WgUtil.getLangText("units", this.tj);
        this.name && (b += ", " + this.name);
        a = this.link ? a + ('<div><div class="title"><a href="' + this.link + this.id_station + '">' + b + "</a></div>") : a + b;
        if (this.weather) {
            this.link && (a += '<a href="' + this.link + this.id_station + '">');
            a += "<div class='wgs-map-marker-weather'>";
            b = this.weather.wind_avg;
            var e = this.weather.wind_direction,
                f = WG.dirNum(e);
            null !== b &&
                ((a += "<div style='background-color:" + WgColors.wind.getRGB(b) + "' class='wgs-map-wind_avg'>" + WgUtil.round(WgUtil.unitConvert(b, this.wj), 1) + " " + c),
                null !== e && (a += " " + WgUtil.getLangText("dir", f) + "&nbsp;" + Math.round(e) + "&deg;"),
                (a += "</div>"));
            b = this.weather.wind_max;
            null !== b && (a += "<div style='background-color:" + WgColors.wind.getRGB(b) + "' class='wgs-map-wind_max'>Max: " + WgUtil.round(WgUtil.unitConvert(b, this.wj), 1) + " " + c + "</div>");
            b = this.weather.wind_min;
            null !== b && (a += "<div style='background-color:" + WgColors.wind.getRGB(b) + "' class='wgs-map-wind_min'>Min: " + WgUtil.round(WgUtil.unitConvert(b, this.wj), 1) + " " + c + "</div>");
            b = this.weather.temperature;
            null !== b && (a += "<div style='background-color:" + WgColors.temp.getRGB(b) + "' class='wgs-map-temperature'>Temp: " + WgUtil.round(WgUtil.unitConvert(b, this.tj), 1) + " " + d + "</div>");
            b = this.weather.rh;
            null !== b && (a += "<div style='background-color:" + WgColors.rh.getRGB(b) + "' class='wgs-map-rh'>RH: " + WgUtil.round(WgUtil.unitConvert(b, this.tj)) + "%</div>");
            (b = this.weather.time_string) && (a += "<div class='wgs-map-temperature'>At " + b + "</div>");
            a += "</div>";
            this.link && (a += "</a>");
        }
        return a + "</div>";
    },
    updatePopUp: function () {
        this.popup &&
            !this.onlick &&
            (this.marker.unbindPopup(),
            this.marker.bindPopup(this.getPopUpHtml(), {
                className: "wg-map-popup",
            }));
    },
    openPopUp: function () {
        this.marker.openPopUp();
    },
    addLastCookie: function () {
        WG.qApi({
            q: "station_add_last",
            id_station: this.id_station,
        });
    },
    windGraph: function (a, b) {
        a = $.extend(
            {
                wj: this.wj,
                tj: this.tj,
            },
            a
        );
        a.id_station = this.id_station;
        a = new WG.Station.WindGraph(a, b);
        a.draw();
        return a;
    },
    tmpRhGraph: function (a, b) {
        a = $.extend(
            {
                wj: this.wj,
                tj: this.tj,
            },
            a
        );
        a.id_station = this.id_station;
        a = new WG.Station.TempGraph(a, b);
        a.draw();
        return a;
    },
    statusGraph: function (a, b) {
        a.id_station = this.id_station;
        a = new WG.Station.StatusGraph(a, b);
        a.draw();
        return a;
    },
    setFavouriteIconActions: function (a) {
        var b = this;
        a.off("click").on("click", function () {
            var a = $(this);
            b.setFavourite(!a.hasClass("yellow"), function (c) {
                "OK" == c["return"] && (a.data("favourite", b.favourite ? 0 : 1), c.favourite ? a.addClass("yellow") : a.removeClass("yellow"));
            });
        });
    },
    setFavourite: function (a, b, c, d) {
        if (WG.user.id_user) {
            var e = a ? "add_f_station" : "remove_f_station";
            d = d || 2000;
            WG.qApi(
                {
                    q: e,
                    id_station: this.id_station,
                },
                function (a) {
                    WG.message(a.message, "error" == a["return"] ? !0 : !1, c, d);
                    WG.gae("Quick Form", "error" == a["return"] ? "error" : "OK", e);
                    b && b(a);
                }
            );
        } else
            a ? (WG.user.addFavourite("s" + this.id_station), WG.message("Favourite station added", !1, c, d)) : (WG.user.removeFavourite("s" + this.id_station), WG.message("Favourite station removed", !1, c, d)),
                (a = {
                    return: "OK",
                    favourite: a ? 1 : 0,
                }),
                b && b(a);
    },
});
WG.Station.stationsWindAvg = function (a) {
    for (var b = 0, c = 0, d = 0; d < a.length; d++) {
        var e = a[d].getWindAvg();
        null !== e && (b++, (c += e));
    }
    return b ? c / b : null;
};
WG.StationGroup = $class({
    constructor: function (a) {
        $.extend(
            this,
            {
                lat: null,
                lon: null,
                km: null,
                wj: "knots",
                tj: "c",
            },
            a
        );
        this.stations = [];
    },
    getLogo: function (a) {
        $.extend(
            {
                dir: !0,
            },
            a
        );
    },
    load: function (a) {
        var b = this;
        WG.qApi(
            {
                q: "stations_nearby",
                lat: b.lat,
                lon: b.lon,
                km: b.km,
            },
            function (c) {
                b.stations = [];
                for (var d = 0; d < c.length; d++) {
                    var e = c[d];
                    b.stations[d] = new WG.Station({
                        id_station: e.id_station,
                        lat: e.lat,
                        lon: e.lon,
                        spotname: e.spotname,
                        name: e.name,
                        logo: e.logo,
                        url: e.url,
                        wj: b.wj,
                        tj: b.tj,
                        weather: {
                            wind_avg: e.wind_avg,
                            temperature: e.temperature,
                        },
                        distance: e.distance,
                    });
                }
                a && a();
            }
        );
    },
    getWindAvg: function () {
        for (var a = 0, b = 0, c = 0; c < this.stations.length; c++) {
            var d = this.stations[c].getWindAvg();
            null !== d && (a++, (b += d));
        }
        return a ? b / a : null;
    },
    divLogo: function (a, b) {
        var c = this,
            d = {
                refresh_seconds: 30,
                callback: null,
            };
        $.extend(d, b);
        var e = $(a);
        if (e[0]) {
            var f = new WG.Station({
                    wj: this.wj,
                    tj: this.tj,
                }),
                g = function () {
                    c.load(function () {
                        c.stations.length
                            ? ((f.weather.wind_avg = c.getWindAvg()),
                              e.empty().append(
                                  f.getLogo({
                                      dir: !1,
                                  })
                              ),
                              d.callback && d.callback())
                            : h && h.stop();
                    });
                };
            $(a).on("WG:hide", function () {
                h && h.pause();
            });
            $(a).on("WG:show", function () {
                h && h.resume();
            });
            g();
            var h = new WG.timeout(function () {
                g();
            }, 1000 * d.refresh_seconds);
        }
    },
});
WG.LiveGroup = $class({
    constructor: function (a) {
        $.extend(
            this,
            {
                $div: null,
                lat: null,
                lon: null,
                km: null,
                wj: "knots",
                tj: "c",
                refresh_seconds: 30,
                click: function () {},
                click_name: function () {},
                km_sort_wind: 10,
                except_id: null,
                graph_width: 350,
            },
            a
        );
        this.stations = [];
        a = $(window).width();
        480 >= a && (this.graph_width = a);
    },
    resetNiceScroll: function () {},
    run: function () {
        var a = this,
            b = a.$div;
        b &&
            WG.qApi(
                {
                    q: "live_stations",
                    lat: WG.round(a.lat, 3),
                    lon: WG.round(a.lon, 3),
                    km_sort_wind: a.km_sort_wind,
                    except_id: a.except_id,
                    WGCACHEABLE: 30,
                },
                function (c) {
                    a.stations = [];
                    if (c.length) {
                        a.$div.removeClass("hidden");
                        for (var d = 0; d < c.length; d++) {
                            var e = c[d];
                            a.stations[d] = new WG.Station({
                                id_station: e.id_station,
                                lat: e.lat,
                                lon: e.lon,
                                spotname: e.spotname,
                                name: e.name,
                                icon: e.icon,
                                logo: e.logo,
                                url: e.url,
                                wj: a.wj,
                                tj: a.tj,
                                border: e.border,
                                ad_version: e.ad_version,
                                weather: {
                                    wind_avg: e.wind_avg,
                                    wind_direction: e.wind_direction,
                                    temperature: e.temperature,
                                },
                                distance: e.distance,
                            });
                        }
                        c = !1;
                        var f = $('<div class="live-wrap"></div>');
                        b.append(f);
                        f.append('<div class="live-legend">Live Wind</div>');
                        1 < a.stations.length &&
                            (f.append('<div class="live-more"><svg class="down icon"><use xlink:href="#ico_down"></use></svg><svg class="up icon"><use xlink:href="#ico_up"></use></svg></div>'),
                            b.find(".live-more").on("click", function (a) {
                                b.toggleClass("full");
                            }));
                        var g = !1;
                        for (d = 0; d < a.stations.length; d++) {
                            e = a.stations[d];
                            var h = WgUtil.round(WgUtil.unitConvert(e.weather.wind_avg, a.wj), 1);
                            isNaN(h) && (h = "?");
                            var k = e.name,
                                p = e.spotname;
                            k || (k = e.spotname);
                            if (!e.id_station && 0 > e.weather.wind_avg) {
                                var q = b.parent().next().find(".obal").data("id");
                                q.length && ((q = "wg_fcst_tab_data_" + (1 + parseInt(q.substr(-1)))), window[q] && (q = window[q].fcst[window[q].id_model].WINDSPD)) && (e.weather.wind_avg = Math.max(q[2], q[3], q[4]));
                            }
                            q = "";
                            e.icon && (q = '<div class="live-td live-logo"><img src="' + e.icon + '"></div>');
                            e.id_station
                                ? ((c = !0),
                                  (k = $(
                                      '<div data-id_station="' +
                                          e.id_station +
                                          '" class="live-station" style="width: ' +
                                          a.graph_width +
                                          '"><div class="live-graph" style="' +
                                          a.gradientStyle(e) +
                                          '"></div><div class="live-desc">' +
                                          q +
                                          '<div class="live-td live-name"><div class="live-name-1">' +
                                          k +
                                          '</div><div class="live-name-2">' +
                                          p +
                                          '</div><div class="live-name-km">(' +
                                          e.distance +
                                          ' km)</div></div><div class="live-td live-current"></div></div></div>'
                                  )))
                                : (k = $(
                                      '<div class="live-station"><div class="live-graph" style="' +
                                          a.gradientStyle(e) +
                                          '"></div><div class="live-desc' +
                                          (e.border ? " border" : "") +
                                          '"><div class="live-td live-logo-ad">&nbsp;&nbsp;<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ico_get_listed"></use></svg></div><div class="live-td  live-text ad">' +
                                          k +
                                          '</div><div class="live-td live-station-icons ' +
                                          (1 == a.stations.length ? "one" : "") +
                                          '"></div></div></div>'
                                  ));
                            e.distance > a.km_sort_wind &&
                                !g &&
                                0 < d &&
                                ((g = !0),
                                f.append(
                                    '<div class="live-nearby"><span class="nowide">' +
                                        WG.ttStr(2610, 1, "More<br>stations", "", "80", "@@@") +
                                        ':</span><span class="wide">' +
                                        WG.ttStr(2434, 1, "More stations", "", "80", "@@@") +
                                        ":</span></div>"
                                ));
                            f.append(k);
                            e.id_station
                                ? k
                                      .find(".live-current")
                                      .empty()
                                      .append(WgS.svgArrowInline(e.weather.wind_direction))
                                      .append(h + " " + WgUtil.getLangText("units", a.wj))
                                : k.find(".live-station-icons").empty().append('<img src="https://beta.windguru.net/img/StationLogo.svg">');
                            h = WG.HIDDENSCROLL ? "click" : "utap.tap";
                            p = k.find(".live-graph");
                            p.width();
                            if (e.id_station)
                                k.find(".live-current,.live-logo").on(h, function (b) {
                                    var c = $(this).parent().parent().data("id_station");
                                    WG.gaec(
                                        function () {
                                            a.click(c);
                                        },
                                        "Station",
                                        "click mini",
                                        c
                                    );
                                }),
                                    k.find(".live-name").on(h, function (b) {
                                        b = $(this).parent().parent().data("id_station");
                                        WG.gae("Station", "click mini name", b);
                                        a.click_name(b);
                                    }),
                                    new WG.Station.WindGraphMini(
                                        {
                                            opacity: 0.12,
                                            wj: WG.user.wj,
                                            id_station: e.id_station,
                                            hours: 3,
                                            avg_minutes: 5,
                                            width: a.graph_width,
                                        },
                                        p
                                    ).draw();
                            else
                                k.find(".live-desc").on(
                                    h,
                                    (function (a) {
                                        return function () {
                                            WG.gaec(
                                                function () {
                                                    location.assign(a.url);
                                                },
                                                "Station",
                                                "click add banner",
                                                a.ad_version
                                            );
                                        };
                                    })(e)
                                );
                        }
                        b.on("WG:hide", function () {
                            WG.log("LiveGroup div hide event received");
                            n && n.pause();
                        });
                        b.on("WG:show", function () {
                            WG.log("LiveGroup div show event received");
                            n && n.resume();
                        });
                        $(window).on("WG:stop", function () {
                            n && n.stop();
                        });
                        if (c)
                            var n = new WG.timeout(function () {
                                a.update();
                            }, 1000 * a.refresh_seconds);
                    }
                }
            );
    },
    gradientStyle: function (a) {
        var b = a.getWindAvgColor(1),
            c = a.getWindAvgColor(0.1);
        a = a.getWindAvgColor();
        a = a.substr(1);
        return (
            "background: -moz-linear-gradient(left, " +
            c +
            " 0%, " +
            c +
            " 60%, " +
            b +
            " 80%, " +
            b +
            " 100%); background: -webkit-linear-gradient(left, " +
            c +
            " 0%," +
            c +
            " 60%," +
            b +
            " 80%," +
            b +
            " 100%); background: linear-gradient(to right, " +
            c +
            " 0%," +
            c +
            " 60%," +
            b +
            " 80%," +
            b +
            " 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00" +
            a +
            "', endColorstr='#" +
            a +
            "',GradientType=1 );"
        );
    },
    update: function () {
        WG.log("LiveGroup update!");
        var a = this,
            b = a.$div;
        b &&
            WG.qApi(
                {
                    q: "live_update",
                    lat: WG.round(a.lat, 3),
                    lon: WG.round(a.lon, 3),
                    WGCACHEABLE: 30,
                },
                function (c) {
                    if (c.length)
                        for (var d = 0; d < c.length; d++) {
                            var e = c[d];
                            e = new WG.Station({
                                id_station: e.id_station,
                                wj: a.wj,
                                tj: a.tj,
                                weather: {
                                    wind_avg: e.wind_avg,
                                    wind_direction: e.wind_direction,
                                    temperature: e.temperature,
                                },
                            });
                            if (e.id_station) {
                                var f = WgUtil.round(WgUtil.unitConvert(e.weather.wind_avg, a.wj), 1);
                                isNaN(f) && (f = "?");
                                var g = b.find('*[data-id_station="' + e.id_station + '"]');
                                g.find(".live-current")
                                    .empty()
                                    .append(WgS.svgArrowInline(e.weather.wind_direction))
                                    .append(f + " " + WgUtil.getLangText("units", a.wj));
                                g.find(".live-graph").attr("style", a.gradientStyle(e));
                            }
                        }
                }
            );
    },
});
WG.Station.Current = $class({
    constructor: function (a, b) {
        this.$div = b ? (b instanceof jQuery ? b : jQuery("#" + b)) : jQuery("#" + this.divid);
        this.id_station = a.id_station || 0;
        this.wj = a.wj || "knots";
        this.tj = a.tj || "c";
        this.date_format = a.date_format || "Y-m-d H:i:s T";
        this.tmprh = void 0 === a.tmprh ? !0 : a.tmprh;
        this.auto_update = void 0 === a.auto_update ? !0 : a.auto_update;
        this.station_data = this.timeout = null;
    },
    draw: function () {
        this.clearAutoUpdate();
        var a = this.station_data,
            b = this;
        if (a) {
            if (null !== a.wind_direction) {
                b.$div.find(".wgs_wind_dir").show();
                var c = WgUtil.round(a.wind_direction),
                    d = WgS.dirNum(c);
                e = b.$div.find(".wgs_wind_dir_value");
                cdn = b.$div.find(".wgs_wind_dir_numvalue");
                e.empty().append(WgUtil.getLangText("dir", d));
                cdn.empty().append(c + "&deg;");
                var e = b.$div.find(".wgs_wind_dir_arrow");
                e.empty().append(WgS.svgArrowInline(c));
            } else b.$div.find(".wgs_wind_dir").hide();
            c = WgUtil.getLangText("units", this.wj);
            d = WgUtil.getLangText("units", this.tj);
            null !== a.datetime && $(".wgs_last_time").empty().append(a.datetime);
            null !== a.wind_avg
                ? (b.$div.find(".wgs_wind_avg").show(),
                  (e = WgUtil.round(WgUtil.unitConvert(a.wind_avg, this.wj), 1)),
                  b.$div
                      .find(".wgs_wind_avg_value")
                      .empty()
                      .append("" + e),
                  b.$div.find(".wgs_wind_avg_color").css("background-color", WgColors.wind.getRGB(a.wind_avg)))
                : b.$div.find(".wgs_wind_avg").hide();
            null !== a.wind_max
                ? (b.$div.find(".wgs_wind_max").show(),
                  (e = WgUtil.round(WgUtil.unitConvert(a.wind_max, this.wj), 1)),
                  b.$div
                      .find(".wgs_wind_max_value")
                      .empty()
                      .append("" + e),
                  b.$div.find(".wgs_wind_max_color").css("background-color", WgColors.wind.getRGB(a.wind_max)))
                : b.$div.find(".wgs_wind_max").hide();
            null !== a.wind_min
                ? (b.$div.find(".wgs_wind_min").show(),
                  (e = WgUtil.round(WgUtil.unitConvert(a.wind_min, this.wj), 1)),
                  b.$div
                      .find(".wgs_wind_min_value")
                      .empty()
                      .append("" + e),
                  b.$div.find(".wgs_wind_min_color").css("background-color", WgColors.wind.getRGB(a.wind_min)))
                : b.$div.find(".wgs_wind_min").hide();
            null !== a.temperature
                ? (b.$div.find(".wgs_temp").show(),
                  (e = WgUtil.round(a.temperature, 1)),
                  "f" == this.tj && (e = WgUtil.round(WgUtil.unitConvert(a.temperature, this.tj))),
                  b.$div
                      .find(".wgs_temp_value")
                      .empty()
                      .append("" + e),
                  b.$div.find(".wgs_temp_color").css("background-color", WgColors.temp.getRGB(a.temperature)))
                : b.$div.find(".wgs_temp").hide();
            null !== a.rh
                ? (b.$div.find(".wgs_rh").show(),
                  (e = WgUtil.round(a.rh)),
                  b.$div
                      .find(".wgs_rh_value")
                      .empty()
                      .append("" + e + "%"),
                  b.$div.find(".wgs_rh_color").css("background-color", WgColors.rh.getRGB(a.rh)))
                : b.$div.find(".wgs_rh").hide();
            b.$div.find(".wgs_wind_units").empty().append(c);
            b.$div.find(".wgs_temp_units").empty().append(d);
            this.auto_update && this.startAutoUpdate();
        } else
            this.loadData(function (a) {
                b.station_data = a;
                b.draw();
            });
    },
    redraw: function () {
        this.station_data = null;
        this.draw();
    },
    setWindUnits: function (a) {
        this.wj = a;
    },
    setTempUnits: function (a) {
        this.tj = a;
    },
    switchWindUnits: function (a) {
        this.wj != a && (this.setWindUnits(a), this.draw());
    },
    switchTempUnits: function (a) {
        this.tj != a && (this.setTempUnits(a), this.draw());
    },
    startAutoUpdate: function () {
        var a = this;
        this.timeout = setTimeout(function () {
            a.redraw();
        }, 20000);
        $(window).on("WG:stop", function () {
            a.stopAutoUpdate();
        });
    },
    clearAutoUpdate: function () {
        this.timeout && clearTimeout(this.timeout);
    },
    stopAutoUpdate: function () {
        this.auto_update = !1;
        this.clearAutoUpdate();
    },
    loadData: function (a) {
        WG.qApi(
            {
                q: "station_data_current",
                id_station: this.id_station,
                date_format: this.date_format,
            },
            function (b) {
                a(b);
            }
        );
    },
});
WG.Station.Graph = $class({
    constructor: function (a, b) {
        this.conf = a;
        this.id_station = a.id_station || 0;
        b ? (b instanceof jQuery ? ((this.divid = b.attr("id")), (this.div = b)) : ((this.divid = a.divid), (this.div = jQuery("#" + b)))) : ((this.divid = a.divid), (this.div = jQuery("#" + this.divid)));
        this._setWidth();
        this.div.addClass("wgs-graph no-user-select");
        this.buttonid = a.buttonid;
        this.button = jQuery("#" + this.buttonid);
        a.no_drag_info || this.div.append('<div  class="wgs-graphdraginfo"><div>&lt;&lt; ' + WG.ttStr(2435, 1, "drag to navigate", "", "80", "@@@") + " &gt;&gt;</div></div>");
        this.hours = a.hours || this.get_default_hours(this.width);
        this.back_hours = a.back_hours || 0;
        this.sunrise = a.sunrise || "06:00";
        this.sunset = a.sunset || "18:00";
        this.wj = a.wj || "knots";
        this.tj = a.tj || "c";
        this.auto_update = void 0 === a.auto_update ? !0 : a.auto_update;
        this.station_data = this.timeout = null;
        this.updateZoomParameters();
        this.uuid = WG.uuid();
    },
    _setWidth: function () {
        this.width = this.conf.width || this.div.width();
    },
    destroy: function () {
        this.clearAutoUpdate();
        this.div.empty();
    },
    get_default_hours: function (a) {
        var b = 6;
        700 < a && (b = 12);
        1200 < a && (b = 24);
        return b;
    },
    get_hours: function () {
        return this.hours;
    },
    get_back_hours: function () {
        return this.back_hours;
    },
    moveEnable: function () {
        WgS.infoEvents(this);
        this.conf.move_enable && WgS.moveEvents(this);
    },
    clickGoWg: function () {
        var a = this;
        jQuery(this.div).css("cursor", "pointer");
        jQuery(this.div).on("click", function () {
            window.open("http://station.windguru.cz/?id=" + a.id_station, "_top");
        });
    },
    drawHours: function (a, b) {
        var c = {
            day_night: 720 > this.hours ? !0 : !1,
        };
        $.extend(c, b);
        b = new Date();
        var d = new Date(),
            e = new Date(),
            f = new Date(),
            g = this.station_data.tzoffset || 0;
        b.setTime(1000 * (this.startstamp + g));
        d.setTime(1000 * (this.endstamp + g));
        a.setXRange(b.getTime(), d.getTime());
        g = [];
        var h = [],
            k = [],
            p = [],
            q = [],
            n = [],
            m = new Date();
        m.setTime(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate(), -12, 0, 0));
        for (var t = m.getTime(); t <= d.getTime(); t += 3600000 * this.hours_major) g[g.length] = t;
        for (t = m.getTime(); t <= d.getTime(); t += 3600000 * this.hours_minor) e.setTime(t), (h[h.length] = t);
        for (t = m.getTime(); t <= d.getTime(); t += 3600000 * this.hours_label) {
            e.setTime(t);
            var w = e.getUTCHours();
            var B = e.getUTCMinutes();
            q[q.length] = t;
            1 > this.hours_label ? (10 > B && (B = "0" + B), (n[n.length] = "" + w + ":" + B)) : (n[n.length] = "" + w + "h");
        }
        B = 24;
        36 > this.hours && (B = 6);
        for (t = m.getTime(); t <= d.getTime(); t += this.date_step * B * 3600000)
            if ((e.setTime(t), (w = e.getUTCHours()), 12 == w || 6 == w || 18 == w))
                (k[k.length] = t),
                    (m = p.length),
                    (p[m] =
                        720 < this.hours
                            ? e.getUTCDate() + "." + (e.getUTCMonth() + 1) + "."
                            : 720 < this.hours
                            ? e.getUTCDate() + "." + (e.getUTCMonth() + 1) + "."
                            : WgUtil.getLangText("weekday", e.getUTCDay()) + " " + e.getUTCDate() + "." + (e.getUTCMonth() + 1) + "."),
                    e.getUTCFullYear() != f.getUTCFullYear() && (p[m] += " " + (e.getUTCFullYear() - 2000));
        if (c.day_night) {
            c = [];
            e = new Date();
            f = new Date();
            m = new Date();
            m.setTime(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate(), 0, 0, 0));
            e.setTime(m.getTime() - 86400000);
            f.setTime(d.getTime());
            t = this.sunrise.split(":");
            m = parseFloat(t[0]) + parseFloat(t[1]) / 60;
            t = this.sunset.split(":");
            w = parseFloat(t[0]) + parseFloat(t[1]) / 60;
            for (t = e.getTime(); t <= f.getTime(); t += 86400000) (e = [t + 3600000 * w, t + 86400000 + 3600000 * m]), e[0] < b.getTime() && (e[0] = b.getTime()), e[1] > d.getTime() && (e[1] = d.getTime()), (c[c.length] = [e[0], e[1]]);
            a.gridRects(c, {
                fill: "#000088",
                stroke: "none",
                strokeWidth: 0,
                opacity: 0.05,
            });
        }
        a.gridLinesV(h, {
            strokeWidth: 0.5,
            opacity: 0.1,
            "stroke-dasharray": "2,2",
        });
        a.gridLinesV(g, {
            strokeWidth: 1,
            opacity: 0.3,
        });
        a.setXVals(k);
        a.texts(
            p,
            {
                ypos: a.y.range[1],
                skip: 0,
                offset_v: -10,
                offset_h: 0,
            },
            {
                "font-size": "11px",
            }
        );
        a.setXVals(q);
        a.texts(
            n,
            {
                ypos: a.y.range[1],
                skip: 0,
                offset_v: -20,
                offset_h: 0,
            },
            {
                "font-size": "10px",
                opacity: 0.5,
            }
        );
    },
    initEmpty: function () {
        this.div.width("150px").height("50px").css("background-color", "#FFFFFF").show();
        var a = this.div.parent();
        a && a.width("150px").height("50px").show().css("overflow", "visible").css("border", "none");
    },
    init: function () {
        this.div.show();
        this.width = this.conf.width || this.div.width();
        this.height = this.conf.height || this.div.height();
        this.div.width(this.width);
        this.div.height(this.height);
        this.div.find("svg").remove();
        this.div.svg();
        this.div.css("overflow", "hidden");
        this.div.css({
            left: 0,
        });
        var a = new WgSvg.Canvas(this.div);
        a.svg.clear();
        this.conf.move_enable
            ? a.svg.configure({
                  viewBox: "0 0 " + this.width + " " + this.height,
                  width: "300%",
                  height: "100%",
              })
            : a.svg.configure({
                  viewBox: "0 0 " + this.width + " " + this.height,
                  width: "100%",
                  height: "100%",
              });
        a.svg.rect(0, 0, this.width, this.height, 0, 0, {
            fill: "#FFFFFF",
            strokeWidth: 0,
        });
        this.updateTimeRange();
        if (!this.station_data.unixtime)
            return (
                a.svg.text(this.width / 2, this.height / 2, "No data...", {
                    "font-size": "15px",
                    opacity: 1,
                    "text-anchor": "middle",
                }),
                a
            );
        this.num_skip = Math.round(this.station_data.unixtime.length / (this.width / 15) - 1);
        return a;
    },
    updateTimeRange: function () {
        this.station_data &&
            (this.station_data.unixtime
                ? ((this.startstamp = this.station_data.unixtime[0]), (this.endstamp = this.station_data.unixtime[this.station_data.unixtime.length - 1]))
                : ((this.startstamp = this.station_data.startstamp), (this.endstamp = this.station_data.endstamp)),
            this.station_data.startstamp && this.station_data.startstamp < this.startstamp && (this.startstamp = this.station_data.startstamp),
            this.station_data.endstamp && this.station_data.endstamp > this.endstamp && (this.endstamp = this.station_data.endstamp));
    },
    updateZoomParameters: function () {
        this._setWidth();
        this.avg_minutes = 10;
        this.hours_major = 1;
        this.hours_label = this.hours_minor = 0.5;
        var a = this.width - 38;
        this.avg_minutes = Math.round((60 * this.hours) / (a / 10));
        var b = [0.1666667, 0.25, 0.5, 1, 2, 3, 6, 12, 24, 48, 336],
            c = this.hours / (a / 50),
            d = this.hours / (a / 40),
            e = this.hours / (a / 40);
        this.date_step = Math.floor(((this.hours / 24) * 100) / a);
        1 > this.date_step && (this.date_step = 1);
        for (a = b.length; 0 <= a; a--) c < b[a] && (this.hours_major = b[a]), d < b[a] && (this.hours_minor = b[a]), e < b[a] && (this.hours_label = b[a]);
        1 > this.hours_major && (this.hours_major = 1);
    },
    loadData: function (a) {
        var b = this;
        WG.qApi(
            {
                q: "station_data_last",
                id_station: this.id_station,
                hours: this.hours,
                avg_minutes: this.avg_minutes,
                back_hours: this.back_hours,
                graph_info: 1,
            },
            function (c) {
                c.sunrise && (b.sunrise = c.sunrise);
                c.sunset && (b.sunset = c.sunset);
                a(c);
            }
        );
    },
    loadDataStatus: function (a) {
        var b = this;
        jQuery(".wgs-graph_out").append('<img class="loading" style="position:absolute;top:50%;left:50%;margin-left:-8px;margin-top:-8px;" src="/images/loading.gif"/>');
        WG.qApi(
            {
                q: "station_data_status_last",
                id_station: this.id_station,
                hours: this.hours,
                avg_minutes: this.avg_minutes,
                back_hours: this.back_hours,
                graph_info: 1,
            },
            function (c) {
                c.sunrise && (b.sunrise = c.sunrise);
                c.sunset && (b.sunset = c.sunset);
                a(c);
                jQuery(".loading").remove();
            }
        );
    },
    setHours: function (a) {
        0 >= a && (a = 1);
        this.hours = a;
        this.updateZoomParameters();
    },
    setWindUnits: function (a) {
        this.wj = a;
    },
    setTempUnits: function (a) {
        this.tj = a;
    },
    setBackHours: function (a) {
        0 >= a && (a = 0);
        this.back_hours = a;
    },
    switchWindUnits: function (a) {
        this.wj != a && (this.setWindUnits(a), this.draw());
    },
    switchTempUnits: function (a) {
        this.tj != a && (this.setTempUnits(a), this.draw());
    },
    switchHours: function (a) {
        var b = this.hours;
        this.setHours(a);
        b != a && this.redraw();
    },
    redraw: function () {
        this.station_data = null;
        this.draw();
    },
    goBack: function (a) {
        a = a || this.hours;
        this.back_hours += a;
        this.redraw();
    },
    goForward: function (a) {
        a = a || this.hours;
        0 >= this.back_hours || ((this.back_hours -= a), 0 > this.back_hours && (this.back_hours = 0), this.redraw());
    },
    goDate: function (a) {
        var b = moment();
        this.setBackHours(b.diff(a, "hours"));
        this.redraw();
    },
    startAutoUpdate: function () {
        var a = this,
            b = 30000 * this.avg_minutes;
        30000 > b && (b = 30000);
        this.timeout = setTimeout(function () {
            a.redraw();
        }, b);
        $(window).on("WG:stop", function () {
            a.stopAutoUpdate();
        });
    },
    clearAutoUpdate: function () {
        this.timeout && clearTimeout(this.timeout);
    },
    stopAutoUpdate: function () {
        this.auto_update = !1;
        this.clearAutoUpdate();
    },
    show: function () {
        this.div.show();
        this.div.parent().show();
        this.button.addClass(this.button_class_on);
    },
    hide: function () {
        this.div.hide();
        this.div.parent().hide();
        this.button.removeClass(this.button_class_on);
    },
    isVisible: function () {
        return this.div.is(":visible") ? !0 : !1;
    },
    toggle: function () {
        this.isVisible() ? this.hide() : this.show();
    },
    bindButton: function (a, b) {
        this.button = jQuery("#" + a);
        this.button_class_on = b;
    },
});
WG.Station.WindGraph = $class({
    Extends: WG.Station.Graph,
    constructor: function (a, b) {
        WG.Station.Graph.call(this, a, b);
        this.range = a.range || "auto";
        this.gustiness = !1 === a.gustiness ? !1 : !0;
    },
    getAutoMax: function (a, b, c) {
        a = WgUtil.arrayMax(this.station_data[a]);
        return a + 3 < b ? b : a > c ? c : a + 3;
    },
    drawLegend: function (a) {
        var b = 30;
        a.setYRange(0, b);
        "auto" == this.range &&
            (this.station_data.wind_max || this.station_data.wind_avg) &&
            (this.station_data.wind_avg && a.setYRange(0, (b = this.getAutoMax("wind_avg", b, 150))), this.station_data.wind_max && a.setYRange(0, this.getAutoMax("wind_max", b, 200)));
        a.gridLinesH([0.6, 3, 7, 11, 16, 21, 27, 33, 40, 47, 55, 64]);
        a.setXRange(0, 0);
        b = "WINDSPDgradient" + this.uuid;
        a.linearGradientV(b, WgColors.wind);
        a.setXRange(this.startstamp, this.endstamp);
        var c = WgUtil.getLangText("units", this.wj);
        a.legend(
            {
                fill: "url(#" + b + ")",
                stroke: "#EAEAEA",
                strokeWidth: 1,
                opacity: 1,
            },
            {
                width: 5,
                left: 5,
                line_width: 20,
                line_left: 0,
                text_left: 12,
                text_offset: 3,
                desc_left: 33,
            },
            [0.6, 3, 7, 11, 16, 21, 27, 33, 40, 47, 55, 64],
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            {
                "font-size": "10px",
                opacity: 1,
                "text-anchor": "left",
            },
            "Beaufort / " + c
        );
    },
    draw: function () {
        this.clearAutoUpdate();
        if (this.width) {
            var a = this.station_data,
                b = this;
            if (a)
                if ("error" == a["return"]) this.initEmpty(), WgS.drawError(this.div, a.error_message);
                else {
                    var c = this.init();
                    c = new WgSvg.Graph(c, {
                        px_position: [0, 0],
                        px_dimensions: [this.width, this.height],
                        px_padding: [0, 38, 10, 0],
                    });
                    this.drawHours(c);
                    this.drawLegend(c);
                    var d = "WINDSPDgradient" + this.uuid;
                    c.setXVals(a.unixtime);
                    if (a.wind_max) {
                        c.area(a.wind_max, 0.7, {
                            fill: "url(#" + d + ")",
                            stroke: "none",
                            opacity: 0.5,
                        });
                        c.line(a.wind_max, 0.7, {
                            strokeWidth: 1,
                            "stroke-dasharray": "2,2",
                            opacity: 0.5,
                        });
                        var e = WgS.printValues(a.wind_max, this.wj);
                        c.numbers(
                            a.wind_max,
                            {
                                offset_v: 4,
                                print_vals: e,
                                margin_h: 10,
                                margin_v: 3,
                            },
                            {
                                opacity: 0.5,
                            }
                        );
                    }
                    a.wind_avg &&
                        (c.area(a.wind_avg, 0.7, {
                            fill: "url(#" + d + ")",
                            stroke: "none",
                            opacity: 0.8,
                        }),
                        c.line(a.wind_avg, 0.7, {
                            strokeWidth: 1.5,
                        }));
                    a.wind_min &&
                        c.line(a.wind_min, 0.7, {
                            strokeWidth: 1,
                            "stroke-dasharray": "2,2",
                            opacity: 0.8,
                        });
                    a.wind_avg &&
                        ((e = WgS.printValues(a.wind_avg, this.wj)),
                        c.numbers(
                            a.wind_avg,
                            {
                                offset_v: -12,
                                print_vals: e,
                                margin_h: 8,
                                margin_v: 2,
                            },
                            {
                                "font-size": "10px",
                            }
                        ),
                        c.arrows(a.wind_direction, a.wind_avg, {
                            offset_v: -18,
                            offset_h: 0,
                            round: 0,
                            min_distance: 13,
                        }));
                    if (this.gustiness && a.gustiness) {
                        c.setYRange(0, 100);
                        c.setLimits(0, 9999999);
                        for (d = 0; d < a.unixtime.length; d++) 5 > a.wind_avg[d] && (a.gustiness[d] = -1);
                        c.rects(
                            a.gustiness,
                            Math.round(c.pxwidth / ((this.endstamp - this.startstamp) / (60 * this.avg_minutes))) + 1,
                            20,
                            {
                                fill: "none",
                                stroke: "none",
                                strokeWidth: 0,
                            },
                            WgColors.gustiness,
                            {
                                fixed_v: c.pxheight - 3,
                            }
                        );
                        c.numbers(a.gustiness, {
                            offset_v: 0,
                            margin_h: 12,
                            margin_v: 1,
                            fixed_v: c.pxheight + 7,
                        });
                        a = c.svg.group(c.group, {
                            transform: "translate(" + (c.pxwidth + 34) + "," + (c.pxheight + 6) + ") rotate(-90)",
                        });
                        c.svg.text(a, 0, 0, "Gustiness (%)", {
                            "font-size": "10px",
                            opacity: 1,
                            "text-anchor": "left",
                        });
                    }
                    this.show();
                    this.moveEnable();
                    this.auto_update && this.startAutoUpdate();
                }
            else
                this.loadData(function (a) {
                    b.station_data = a;
                    b.draw();
                });
        }
    },
});
WG.Station.WindGraphMini = $class({
    Extends: WG.Station.WindGraph,
    constructor: function (a, b) {
        a = $.extend(
            {
                color: "#000",
                opacity: 0.3,
                no_drag_info: !0,
                hours: 3,
                back_hours: 0,
            },
            a
        );
        WG.Station.Graph.call(this, a, b);
        this.range = a.range || "auto";
        this.gustiness = !1;
    },
    loadData: function (a) {
        this.conf.avg_minutes && (this.avg_minutes = this.conf.avg_minutes);
        WG.qApi(
            {
                q: "station_data_last",
                id_station: this.id_station,
                hours: this.hours,
                avg_minutes: this.avg_minutes,
                back_hours: this.back_hours,
                vars: "wind_avg",
                graph_info: 0,
                WGCACHEABLE: Math.round((60 * this.avg_minutes) / 2),
            },
            function (b) {
                a(b);
            }
        );
    },
    init: function () {
        this.div.show();
        this.width = this.conf.width || this.div.width();
        this.height = this.conf.height || this.div.height();
        this.div.find("svg").remove();
        this.div.svg();
        this.div.css("overflow", "hidden");
        this.div.css({
            left: 0,
        });
        var a = new WgSvg.Canvas(this.div);
        a.svg.clear();
        a.svg.configure({
            viewBox: "0 0 " + this.width + " " + this.height,
            width: "100%",
            height: "100%",
        });
        this.updateTimeRange();
        if (!this.station_data.unixtime) return a;
        this.num_skip = Math.round(this.station_data.unixtime.length / (this.width / 15) - 1);
        return a;
    },
    draw: function () {
        this.clearAutoUpdate();
        if (this.width) {
            var a = this.station_data,
                b = this;
            if (a)
                if ("error" == a["return"]) this.initEmpty(), WgS.drawError(this.div, a.error_message);
                else {
                    var c = this.init();
                    c = new WgSvg.Graph(c, {
                        px_position: [0, 0],
                        px_dimensions: [this.width, this.height],
                        px_padding: [0, 0, 0, 0],
                    });
                    c.setYRange(0, 40);
                    c.setYRange(0, this.getAutoMax("wind_avg", 30, 80));
                    c.setXRange(this.startstamp, this.endstamp);
                    a.wind_avg &&
                        (c.setXVals(a.unixtime),
                        a.wind_avg &&
                            c.area(a.wind_avg, 0.7, {
                                fill: this.conf.color,
                                stroke: "none",
                                opacity: this.conf.opacity,
                            }),
                        this.show(),
                        this.auto_update && this.startAutoUpdate());
                }
            else
                this.loadData(function (a) {
                    a.wind_avg && ((b.station_data = a), b.draw());
                });
        }
    },
});
WG.Station.TmpRhGraph = $class({
    Extends: WG.Station.Graph,
    constructor: function (a, b) {
        WG.Station.Graph.call(this, a, b);
    },
    drawLegend: function (a) {
        var b = this.station_data;
        a.setYRange(0, 25);
        b.wind_avg && WgS.fcstFloatingRange(a, this.station_data.temperature, 10, 30, 5, 5);
        a.gridLinesH([-20, -15, -10, 0, 5, 10, 15, 20, 25, 30, 35, 40]);
        b = "TMPgradient" + this.uuid;
        a.setXRange(0, 0);
        a.linearGradientV(b, WgColors.temp);
        a.setXRange(this.startstamp, this.endstamp);
        var c = " (°C)";
        "f" == this.tj && (c = " (°F)");
        a.legend(
            {
                fill: "url(#" + b + ")",
                stroke: "#EAEAEA",
                strokeWidth: 1,
                opacity: 1,
            },
            {
                width: 5,
                left: 5,
                line_width: 20,
                line_left: 0,
                text_left: 12,
                text_offset: 3,
                desc_left: 33,
            },
            [-20, -15, -10, 0, 5, 10, 15, 20, 25, 30, 35, 40],
            [-20, -15, -10, "0", 5, 10, 15, 20, 25, 30, 35, 40],
            {
                "font-size": "10px",
                opacity: 1,
                "text-anchor": "left",
            },
            "Temperature" + c
        );
    },
    draw: function () {
        this.clearAutoUpdate();
        if (this.width) {
            var a = this.station_data,
                b = this;
            if (b.station_data)
                if ("error" == a["return"]) this.initEmpty(), WgS.drawError(this.div, a.error_message);
                else {
                    var c = this.init();
                    c = new WgSvg.Graph(c, {
                        px_position: [0, 0],
                        px_dimensions: [this.width, this.height],
                        px_padding: [0, 38, 0, 0],
                    });
                    this.drawHours(c);
                    this.drawLegend(c);
                    c.setXVals(a.unixtime);
                    a.rh &&
                        (c.setRange([this.startstamp, this.endstamp], [0, 120]),
                        c.line(a.rh, 0.8, {
                            stroke: "#00c600",
                            strokeWidth: 1.5,
                        }),
                        c.numbers(
                            a.rh,
                            {
                                offset_v: -11,
                                margin_h: 20,
                                margin_v: 3,
                            },
                            {
                                fill: "#00c600",
                            }
                        ));
                    a.mslp &&
                        (c.setRange([this.startstamp, this.endstamp], [0, 120]),
                        c.line(a.mslp, 0.8, {
                            stroke: "#3344ff",
                            strokeWidth: 1.5,
                        }),
                        c.numbers(
                            a.mslp,
                            {
                                offset_v: -11,
                                margin_h: 10,
                                margin_v: 3,
                            },
                            {
                                fill: "#3344ff",
                            }
                        ));
                    a.temperature && WgS.fcstFloatingRange(c, a.temperature, 10, 30, 5, 5);
                    c.gridLinesH([-20, -15, -10, 0, 5, 10, 15, 20, 25, 30, 35, 40]);
                    var d = "TMPgradient" + this.uuid;
                    c.setXRange(this.startstamp, this.endstamp);
                    a.temperature &&
                        (c.line(a.temperature, 0.8),
                        c.circles(a.temperature, 7, {
                            fill: "url(#" + d + ")",
                            stroke: "none",
                            strokeWidth: 0.8,
                        }),
                        (d = WgS.printValues(a.temperature, this.tj)),
                        c.numbers(a.temperature, {
                            offset_v: -4,
                            print_vals: d,
                            margin_h: 3,
                            margin_v: 1,
                        }));
                    this.show();
                    this.moveEnable();
                    this.auto_update && this.startAutoUpdate();
                }
            else
                this.loadData(function (a) {
                    b.station_data = a;
                    b.draw();
                });
        }
    },
});
WG.Station.StatusGraph = $class({
    Extends: WG.Station.Graph,
    constructor: function (a, b) {
        a = $.extend(
            {
                display: ["rssi", "lqi", "bat", "sig"],
            },
            a
        );
        WG.Station.Graph.call(this, a, b);
    },
    draw: function () {
        this.clearAutoUpdate();
        if (this.width) {
            var a = this.station_data,
                b = this;
            if (b.station_data)
                if ("error" == a["return"]) this.initEmpty(), WgS.drawError(this.div, a.error_message);
                else {
                    var c = this.init();
                    c = new WgSvg.Graph(c, {
                        px_position: [0, 0],
                        px_dimensions: [this.width, this.height],
                        px_padding: [0, 0, 0, 0],
                    });
                    this.drawHours(c, {});
                    c.setXVals(a.unixtime);
                    a.lqi &&
                        -1 < jQuery.inArray("lqi", this.conf.display) &&
                        (c.setRange([this.startstamp, this.endstamp], [20, 80]),
                        c.line(a.lqi, 0.8, {
                            stroke: "#bbbbbb",
                            strokeWidth: 1.5,
                        }),
                        c.numbers(
                            a.lqi,
                            {
                                offset_v: -11,
                                margin_h: 10,
                                margin_v: 3,
                            },
                            {
                                fill: "#bbbbbb",
                            }
                        ));
                    a.rssi &&
                        -1 < jQuery.inArray("rssi", this.conf.display) &&
                        (c.setRange([this.startstamp, this.endstamp], [-110, -20]),
                        c.line(a.rssi, 0.8, {
                            stroke: "#3344ff",
                            strokeWidth: 1.5,
                        }),
                        c.numbers(
                            a.rssi,
                            {
                                offset_v: -11,
                                margin_h: 10,
                                margin_v: 3,
                            },
                            {
                                fill: "#3344ff",
                            }
                        ),
                        c.gridLineH(-90, {
                            strokeWidth: 1,
                            opacity: 1,
                            stroke: "#3344ff",
                            "stroke-dasharray": "6,4",
                        }),
                        c.text(
                            this.startstamp,
                            -90,
                            "minimum recommended RSSI",
                            {
                                offset_h: 2,
                            },
                            {
                                "text-anchor": "start",
                                fill: "#3344ff",
                            }
                        ),
                        c.gridLineH(-100, {
                            strokeWidth: 1,
                            opacity: 1,
                            stroke: "#3344ff",
                            "stroke-dasharray": "3,3",
                        }),
                        c.text(
                            this.startstamp,
                            -100,
                            "critical RSSI",
                            {
                                offset_h: 2,
                            },
                            {
                                "text-anchor": "start",
                                fill: "#3344ff",
                            }
                        ));
                    if (a.sig && -1 < jQuery.inArray("sig", this.conf.display)) {
                        c.setRange([this.startstamp, this.endstamp], [-5, 120]);
                        c.line(a.sig, 0.8, {
                            stroke: "#00c600",
                            strokeWidth: 1.5,
                        });
                        var d = (function (a) {
                            for (var b = [], c = 0; c < a.length; c++) b[c] = a[c] + "%";
                            return b;
                        })(a.sig);
                        c.numbers(
                            a.sig,
                            {
                                offset_v: -11,
                                margin_h: 20,
                                margin_v: 3,
                                print_vals: d,
                            },
                            {
                                fill: "#00c600",
                            }
                        );
                    }
                    a.bat &&
                        -1 < jQuery.inArray("bat", this.conf.display) &&
                        (c.setRange([this.startstamp, this.endstamp], [0, 110]),
                        c.line(a.bat, 0.8, {
                            stroke: "#ff4444",
                            strokeWidth: 1.5,
                        }),
                        (d = (function (a) {
                            for (var b = [], c = 0; c < a.length; c++) b[c] = a[c] + "%";
                            return b;
                        })(a.bat)),
                        c.numbers(
                            a.bat,
                            {
                                offset_v: -11,
                                margin_h: 10,
                                margin_v: 3,
                                print_vals: d,
                            },
                            {
                                fill: "#ff4444",
                            }
                        ));
                    this.show();
                    this.moveEnable();
                    this.auto_update && this.startAutoUpdate();
                }
            else
                this.loadDataStatus(function (a) {
                    b.station_data = a;
                    b.draw();
                });
        }
    },
});
WG.Station.Display = $class({
    constructor: function (a) {
        var b = this;
        a = $.extend(
            {},
            {
                graph: "graph",
                map: "map",
                show: "wind",
                currentdata: !0,
                wj: "knots",
                tj: "c",
                id_station: 0,
                id_station_default: 33,
                hours: null,
                width: null,
                height: null,
                last: 10,
                move_enable: !0,
                switch_station: function (a) {
                    window.open(location.pathname + "?id=" + a, "_self");
                },
                link_station: function (a) {
                    return location.pathname + "?id=" + a;
                },
                click_station: function (a) {
                    b.runStation(a);
                },
                callback: function () {},
            },
            a
        );
        30 < a.last && (a.last = 30);
        this.options = a;
        this.wj = jQuery.cookie("wj") || a.wj;
        this.tj = jQuery.cookie("tj") || a.tj;
        this.back_hours = 0;
        this.hours = a.hours;
        this.id_station = a.id_station;
        this.$graph = jQuery("#" + this.options.graph);
        this.$map = jQuery("#" + this.options.map);
        this.$search = jQuery("#" + this.options.search);
        this.active = this.options.show;
        (this._svg = WgUtil.supportsSVG())
            ? this.id_station
                ? this._makeStation(this.id_station, function () {
                      b._runStation(b.station);
                      b.setActAll();
                      b.options.callback && b.options.callback();
                  })
                : this.showMap()
            : (this.$graph.append("<div class='unsupported'>Your browser can't display this website properly, I am sorry. Please upgrade your browser.</div>"), this.$graph.show());
    },
    _makeStation: function (a, b) {
        this.station = new WG.Station(a);
        this.id_station = a;
        this.station.load(a, function () {
            b && b();
        });
    },
    _runStation: function (a, b) {
        this.runStation(a, b);
        "wind" === this.active && this.showWind();
        "temp" === this.active && this.showTemp();
        "map" === this.active && this.showMap();
    },
    runStation: function (a, b) {
        this._stopStation();
        this.station = a;
        this.id_station = a.id_station;
        this.station.id_station &&
            (this.station &&
                (jQuery(".wgs_station_name").empty().html(this.station.getFullName()),
                this.station.logo
                    ? (jQuery(".wgs_logo")
                          .attr("src", window.location.protocol + "//www.windguru.cz/reklama/bannery/directory/" + this.station.logo)
                          .show(),
                      jQuery(".wgs_spot_guru").show())
                    : (jQuery(".wgs_logo").attr("src", "").hide(), jQuery(".wgs_spot_guru").hide()),
                this.station.url ? jQuery(".wgs_url").attr("href", this.station.url) : jQuery(".wgs_url").attr("href", "#")),
            this.options.currentdata && this._currentData());
        b && b();
    },
    _stopStation: function () {
        this.current_data && this.current_data.stopAutoUpdate();
        this.graph && this.graph.stopAutoUpdate();
    },
    _currentData: function (a) {
        this.current_data = new WG.Station.Current(
            {
                id_station: this.id_station,
                wj: this.wj,
                tj: this.tj,
            },
            jQuery("#spot-data")
        );
        this.current_data.draw();
    },
    switchWindUnits: function (a) {
        a !== this.wj &&
            ((this.wj = a),
            this._setAct("wj", this.wj),
            this.options.graph && this.$graph.is(":visible") && this.graph.switchWindUnits(this.wj),
            this.options.currentdata && this.current_data.switchWindUnits(a),
            this.options.map && this.$map.is(":visible") && this.map.switchWindUnits(a),
            jQuery.cookie("wj", a, {
                expires: 365,
                path: "/",
            }));
    },
    switchTempUnits: function (a) {
        a !== this.tj &&
            ((this.tj = a),
            this._setAct("tj", this.tj),
            this.options.graph && this.$graph.is(":visible") && this.graph.switchTempUnits(this.wj),
            this.options.currentdata && this.current_data.switchTempUnits(a),
            this.options.map && this.$map.is(":visible") && this.map.switchTempUnits(a),
            jQuery.cookie("tj", a, {
                expires: 365,
                path: "/",
            }));
    },
    switchHours: function (a) {
        a !== this.hours && ((this.hours = a), this._setAct("hours", this.hours), this.options.graph && this.graph.switchHours(this.hours));
    },
    goDate: function (a) {
        this.graph.goDate(a);
    },
    setActAll: function () {
        this._setAct("hours", this.hours);
        this._setAct("wj", this.wj);
        this._setAct("tj", this.tj);
        this._setAct("graphtype", this.active);
        ("wind" != this.active && "temp" != this.active) || this._setAct("view", "graph");
        "map" == this.active && this._setAct("view", "map");
    },
    _setAct: function (a, b) {
        this._selClassData("wgs_set_" + a).removeClass("act");
        this._selClassData("wgs_set_" + a, a, b).addClass("act");
    },
    showWind: function () {
        this._showGraph(WG.Station.WindGraph, "wind");
    },
    showTemp: function () {
        this._showGraph(WG.Station.TmpRhGraph, "temp");
    },
    showGraph: function () {
        "wind" === this.active && this.showWind();
        "temp" === this.active && this.showTemp();
    },
    refreshGraph: function (a) {
        this.refreshtimeout && clearTimeout(this.refreshtimeout);
        var b = this;
        if ("wind" == b.active || "temp" == b.active)
            this.refreshtimeout = setTimeout(function () {
                b.graph.updateZoomParameters();
                a ? b.graph.redraw() : b.graph.draw();
            }, 100);
    },
    _showGraph: function (a, b) {
        var c = this;
        this.station
            ? this.$graph.length &&
              (this._setAct("graphtype", b),
              this._setAct("view", "graph"),
              this.$graph.is(":visible") || this.$graph.show(),
              this.map && this.map.refreshWeatherOff(),
              (this.active = b),
              this.$map.hide(),
              this.graph && ((this.back_hours = this.graph.get_back_hours()), this.graph.destroy()),
              (this.graph = new a({
                  divid: this.options.graph,
                  wj: this.wj,
                  tj: this.tj,
                  hours: this.hours,
                  back_hours: this.back_hours,
                  id_station: this.station.id_station,
                  move_enable: this.options.move_enable,
              })),
              this.graph.draw(),
              (this.hours = this.graph.hours))
            : this._makeStation(this.options.id_station_default, function () {
                  c.runStation(c.station);
                  c._showGraph(a, b);
              });
    },
    showMap: function () {
        if (this.$map.length) {
            this.$map.is(":visible") || this.$map.show();
            this.$graph.hide();
            this.active = "map";
            this._setAct("view", "map");
            var a = [45, 10],
                b = 3;
            this.station && ((a = [this.station.lat, this.station.lon]), (b = 7));
            this.map
                ? this.station && this.map.focusStation(this.station)
                : (this.map = new WG.Map(this.options.map, {
                      center: a,
                      zoom: b,
                      id_station: this.id_station,
                      wj: this.wj,
                      tj: this.tj,
                      link_station: this.options.link_station,
                      click_station: this.options.click_station,
                  }));
            this.map.refreshWeatherOn();
        }
    },
    _selClassData: function (a, b, c) {
        a = jQuery("." + a);
        b &&
            (a = a.filter(function (a, e) {
                return $(this).data(b) == c;
            }));
        return a;
    },
});
var WgS = {
    printValues: function (a, b) {
        for (var c = [], d, e = 0; e < a.length; e++) (d = WgUtil.unitConvert(a[e], b)), (c[e] = "msd" == b ? "" + WgUtil.round(d, 1) : "" + WgUtil.round(d, 0));
        return c;
    },
    fcstFloatingRange: function (a, b, c, d, e, f) {
        var g = WgUtil.arrayMax(b);
        b = WgUtil.arrayMin(b);
        a.setFloatingYRange(c, d, g, b, e, f);
    },
    dirNum: function (a) {
        var b;
        0 <= a && (b = 0);
        11.25 <= a && (b = 1);
        33.75 <= a && (b = 2);
        56.25 <= a && (b = 3);
        78.75 <= a && (b = 4);
        101.25 <= a && (b = 5);
        123.75 <= a && (b = 6);
        146.25 <= a && (b = 7);
        168.75 <= a && (b = 8);
        191.25 <= a && (b = 9);
        213.75 <= a && (b = 10);
        236.25 <= a && (b = 11);
        258.75 <= a && (b = 12);
        281.25 <= a && (b = 13);
        303.75 <= a && (b = 14);
        326.25 <= a && (b = 15);
        348.75 <= a && (b = 0);
        return b;
    },
    svgArrowInline: function (a) {
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 100 100"><g transform="rotate(' +
            (180 + a) +
            ',50,50) translate(0,5)"><path d="m50,0 -20,30 16,-3 -3,63 14,0 -3,-63 16,3 -20,-30z" fill="black" stroke-width="0"></path></g></svg>'
        );
    },
    svgWgLogoInline: function (a) {
        a || (a = "#1a1a1a");
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 800 550"><g transform="translate(-0.8843987,-231.09524)"><path stroke="#000" stroke-dasharray="none" stroke-miterlimit="4" stroke-width="25" fill="' +
            a +
            '" d="M429.69,236.87c-169.12-9.19-323.91,64.35-347.89,182.09-42.909,210.67,302.57,297.78,471.42,207.79-65.4,118.95-343.75,106.42-547.34-40.72,215.85,285.78,671.44,216.7,714.08,7.38,42.63-209.31-302.57-297.78-471.42-207.79,65.4-118.95,343.76-106.63,547.34,40.51-94.43-125.03-234.65-182.12-366.19-189.26z"/></g></svg>'
        );
    },
    svgWgStationInline: function (a, b, c, d, e) {
        var f = "";
        null !== e && (f = ' opacity="' + e + '"');
        e = "#ffffff";
        var g = "#000";
        null !== a && (e = WgColors.wind.getRGB(a));
        null !== d && WgColors.wind.getRGB(d);
        a = "#000";
        null === b && (a = g = "none");
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><g transform="translate(0,419)"' +
            f +
            '><g transform="rotate(' +
            b +
            ',600,182)"><path d="m601,781-200-292,160,89.2-30-337,140,0-30,337,160-89.2z" stroke-linecap="round" stroke-miterlimit="4" stroke-width="0" stroke="' +
            g +
            '" fill="' +
            a +
            '"/></g><g><path stroke-linejoin="round" d="M630-113c-169-10-324,70.4-348,199-43,230,302,325,471,227-65,130-343,116-547-45,216,312,671,237,714,8,42-228-303-325-471-226,65-130,343-116,547,44.2-95-136-235-199-366-207z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-dasharray="none" stroke-width="15" fill="' +
            e +
            '"/><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="180px" y="250" x="600" fill="#000000">' +
            c +
            "</text></g></g></svg>"
        );
    },
    svgWgClusterInline: function (a, b, c, d) {
        var e = "#FFFFFF";
        null !== a && (e = WgColors.wind.getRGB(a));
        null !== c && WgColors.wind.getRGB(c);
        null !== d && WgColors.wind.getRGB(d);
        return (
            '<svg version="1.1" width="100%" height="100%" viewBox="0 0 1200 1200"><g stroke-dasharray="none" stroke="#000" stroke-miterlimit="4" fill="#0FF"><g transform="matrix(1.2707362,0,0,1.2983767,-1159.5311,370.36006)" stroke-width="1.29944348"><path opacity="0.5" stroke-linejoin="round" d="m1420-168c-198-11.7-380,82.6-408,234-50.5,270,354,381,553,266-76.3,153-403,136-642-52.8,254,366,788,278,838,9.39,50-267-360-381-550-265,76.3-153,403-136,642,51.9-112-160-276-234-430-243z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-width="5" fill="' +
            e +
            '"/></g><g transform="matrix(1.0875495,0,0,1.1112053,-903.59603,405.74641)" stroke-width="3.85553479"><path opacity="0.7" stroke-linejoin="round" d="m1420-168c-198-11.7-380,82.6-408,234-50.5,270,354,381,553,266-76.3,153-403,136-642-52.8,254,366,788,278,838,9.39,50-267-360-381-550-265,76.3-153,403-136,642,51.9-112-160-276-234-430-243z" fill-rule="nonzero" stroke="#000" stroke-linecap="round" stroke-miterlimit="4" stroke-width="8" fill="' +
            e +
            '"/></g><path stroke-linejoin="round" d="M629,286c-177-10-339,76-364,213-45,247,316,348,493,243-68,140-359,125-573-48,226,336,703,254,748,9,44-244-317-348-493-242,68-139,359-124,570,47-97-145-243-213-381-221z" fill-rule="nonzero" stroke-linecap="round" stroke-width="10"  fill="' +
            e +
            '"/><text text-anchor="middle" font-weight="normal" xml:space="preserve" font-size="180px" y="650" x="600" fill="#000000">' +
            b +
            "</text></g></svg>"
        );
    },
    moveEvents: function (a) {
        var b = a.div.find("svg");
        a.div.scrollLeft(a.width);
        var c = a.width,
            d = Math.round((c - 38) * (a.get_back_hours() / a.get_hours()));
        b.on("movestart", function (b) {
            ((b.distX > b.distY && b.distX < -b.distY) || (b.distX < b.distY && b.distX > -b.distY)) && b.preventDefault();
            a.clearAutoUpdate();
        })
            .bind("move", function (b) {
                b.distX < -d ? b.preventDefault() : a.div.scrollLeft(a.width - b.distX);
            })
            .bind("moveend", function (b) {
                var d = Math.abs(Math.round((b.distX / (c - 38)) * 100 * a.get_hours()) / 100);
                50 < b.distX ? a.goBack(d) : -50 > b.distX && 0 < a.get_back_hours() ? a.goForward(d) : (a.div.scrollLeft(a.width), a.startAutoUpdate());
            });
    },
    infoEvents: function (a) {
        var b = function () {
            a.div.find("svg").unbind("mouseover", b);
            a.div.find(".wgs-graphdraginfo").fadeTo(500, 0.2).delay(2000).fadeOut(500);
        };
        a.div.find("svg").on("mouseover", b);
    },
    drawError: function (a, b) {
        a.empty().append("<div style='border:1px solid red;color:red; padding:5px;'>" + WG.ttStr(2436, 1, "Error", "", "80", "@@@") + "! <br/>(" + b + ")</div>");
    },
};
WG.Map = $class({
    constructor: function (a, b) {
        var c = this,
            d = {
                center: L.latLng(48.3, 8.6),
                zoom: 5,
                minZoom: 3,
                maxZoom: 18,
                lockZoom: !1,
                zoomControl: !0,
                locateControl: !1,
                worldCopyJump: !0,
                keyboard: !1,
                attributionControl: !1,
                attributionPosition: "bottomleft",
                zoomControlPosition: "topleft",
                zoomSnap: 0.25,
                zoomDelta: 0.5,
                fadeAnimation: !1,
                maxBounds: L.latLngBounds([-85, -360], [85, 360]),
                maxBoundsViscosity: 1,
                push_history: !0,
                set_minimap_zoom: !1,
                tap: !0,
            };
        WG.user.geoposition && (d.center = L.latLng(WG.user.geoposition.coords.latitude, WG.user.geoposition.coords.longitude));
        this.WG_options = $.extend({}, d, b);
        this.WG_options.lockZoom && ((this.WG_options.minZoom = this.WG_options.zoom), (this.WG_options.maxZoom = this.WG_options.zoom), (this.WG_options.zoomControl = !1));
        b = WG.clone(this.WG_options);
        b.zoomControl = !1;
        a instanceof jQuery ? ((this.$ = a), this.$.attr("id") || ((a = WG.uuid()), this.$.attr("id", a))) : (this.$ = $("#" + a));
        this.map = L.map(a, b);
        this.map._WGMap = this;
        c.map.on("zoomend", function () {
            c.map.fire("move");
        });
        this.divid = a;
        this.WG_lastspot = {};
        this.WG_layers = {};
        this._baselayers = {};
        this._controls = {};
        L.control
            .attribution({
                position: this.WG_options.attributionPosition,
                prefix: !1,
            })
            .addTo(this.map);
        this.WG_options.zoomControl &&
            !WG.TOUCH &&
            L.control
                .zoom({
                    position: this.WG_options.zoomControlPosition,
                })
                .addTo(this.map);
        this.WG_options.locateControl && this.addLocateControl();
    },
    addLocateControl: function (a) {
        var b = this;
        new WG.Map.LocateControl({
            icon: "wg-locate-icon",
            circleStyle: {
                color: "#286ec3",
                fillColor: "#286ec3",
                fillOpacity: 0.1,
                weight: 1,
                opacity: 0.5,
            },
            keepCurrentZoomLevel: !0,
            onLocate: function (a) {
                var c = !1;
                b._locateMarker || ((b._locateMarker = b.pointMarker()), (c = !0));
                var e = b._locateMarker;
                e.setLatLng(a);
                e.addTo(b.map);
                e.setPopupContent(e.getPopUpHtml(e.getLatLng(), WG.ttStr(1765, 2, "My position", "", "64", "@@@")));
                c && e.openPopup();
                $(e._popup._closeButton).on("click", function () {
                    b.map.removeLayer(e);
                });
                return e;
            },
        }).addTo(b.map);
    },
    setBaseMap: function (a) {
        a = a || "cdb";
        this.removeBaseLayers(a);
        this.map.invalidateSize(!1);
        "cdb" == a ? this.addLayerPositronVector() : "osm" == a && this.addLayerOSM();
    },
    addLayerOSM: function (a) {
        return this.addLayerTopo(a);
    },
    addLayerTopo: function (a) {
        a = a || 1;
        this.map.invalidateSize(!1);
        if (this.WG_layers.osm) return this.WG_layers.osm;
        this.WG_layers.osm = L.tileLayer("https://api.maptiler.com/maps/topo/256/{z}/{x}/{y}.png?key=H0CVk3ugbArAT7R16QhB", {
            attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            opacity: a,
            crossorigin: !0,
        }).addTo(this.map);
        return (this._baselayers.osm = this.WG_layers.osm);
    },
    addLayerCartoDB: function (a) {
        return this.addLayerPositron(a);
    },
    addLayerPositron: function (a) {
        a = a || 1;
        this.map.invalidateSize(!1);
        if (this.WG_layers.cdb) return this.WG_layers.cdb;
        this.WG_layers.cdb = L.tileLayer("https://api.maptiler.com/maps/positron/256/{z}/{x}/{y}.png?key=H0CVk3ugbArAT7R16QhB", {
            attribution: ' © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            opacity: a,
            crossorigin: !0,
        }).addTo(this.map);
        return (this._baselayers.cdb = this.WG_layers.cdb);
    },
    addLayerPositronVector: function (a) {
        a = a || 1;
        if (this.WG_layers.cdb) return this.WG_layers.cdb._update(), this.WG_layers.cdb;
        this.WG_layers.cdb = L.mapboxGL({
            attribution: ' © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
            accessToken: "not-needed",
            opacity: a,
            style: "https://api.maptiler.com/maps/positron/style.json?key=qIrAM6kXLBc3O7OoUAUK",
        }).addTo(this.map);
        this.WG_layers.cdb._update();
        return (this._baselayers.cdb = this.WG_layers.cdb);
    },
    addLayerWGVector: function (a, b, c) {
        a = a || 1;
        b = b || "https://www.windguru.net/basemaps/wgmap/style.json";
        if (this.WG_layers.wgmap) {
            if (this.WG_layers.wgmap._style == b && this.WG_layers.wgmap._zindex === c) return this.WG_layers.wgmap;
            this.WG_layers.wgmap.remove();
        }
        a = this.WG_layers.wgmap = L.mapboxGL({
            attribution: ' © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
            accessToken: "not-needed",
            opacity: a,
            style: b,
            updateInterval: 12,
        }).addTo(this.map);
        c && $(a._glContainer).css("z-index", c);
        a._style = b;
        a._zindex = c;
        return (this._baselayers.wgmap = a);
    },
    addForecast: function (a) {
        var b = this,
            c = "particles";
        "b" == WG.user.wv && (c = "barbs");
        "a" == WG.user.wv && (c = "arrows");
        a = $.extend(
            {},
            {
                id_model: 3,
                hr: null,
                param: "m_windspd",
                param_option: c,
                opacity: 1,
            },
            a
        );
        WG.log("addForecast, options:", a);
        b._model_cache || (b._model_cache = []);
        WG.mapmodels || WG.loadMapModels();
        b._model_cache[a.id_model]
            ? b.addFcstLayer(b._model_cache[a.id_model], a)
            : new WG.MapModel({
                  id_model: a.id_model,
              }).load(function (c) {
                  b._model_cache[a.id_model] = c;
                  b.addFcstLayer(c, a);
              });
    },
    addFcstLayer: function (a, b) {
        b.set_time ? (b.hr = a.moment2hr(b.set_time)) : null === b.hr && (b.hr = a.moment2hr(null));
        "tcdc_apcp1" == b.param && 0 > a.params.indexOf(b.param) && (b.param = "tcdc_apcp3");
        "tcdc_apcp3" == b.param && 0 > a.params.indexOf(b.param) && (b.param = "tcdc_apcp1");
        var c = b.center || this.map.getCenter(),
            d = b.zoom || this.map.getZoom(),
            e = d,
            f = a.zoom[1],
            g = a.zoom[0];
        this.WG_options.lockZoom ||
            ((this.map.options.maxZoom = 18),
            (this.map.options.minZoom = 1),
            !0 === b.set_max_zoom ? (d = f) : b.set_max_zoom && (d = f > b.set_max_zoom ? b.set_max_zoom : f),
            d > f && (d = f),
            d < g && (d = g),
            this.isBetaParam(b.param) &&
                ((d = e), b.set_minimap_zoom && ((d = !0 === b.set_minimap_zoom ? a.minimap_zoom[1] : b.set_minimap_zoom), d < a.minimap_zoom[0] && (d = a.minimap_zoom[0]), d > a.minimap_zoom[2] && (d = a.minimap_zoom[2]))));
        this.map.setView(c, d, {
            reset: !0,
        });
        c = this.map.getBounds();
        e = L.latLngBounds([a.lat[0], a.lon[0]], [a.lat[1], a.lon[1]]);
        c &&
            e &&
            !c.intersects(e) &&
            ((c = e.getCenter()),
            this.map.setView(c, d, {
                reset: !0,
            }));
        if (this.isBetaParam(b.param)) {
            void 0 !== WG.data_png_server && (b.server = WG.data_png_server);
            d = b.param_option.split(",");
            b.param_options = [];
            for (c = 0; c < d.length; c++) b.param_options[d[c]] = !0;
            d = a.zoom_data_tiles.length ? new WG.TiledFcstAnimation(a, b) : new WG.FcstAnimation(a, b);
            this._animation_buttons(!0);
            this.forecast = d;
            this.addLayerWGVector(1, a.wave ? "https://www.windguru.net/basemaps/wgmap/style_wave.json" : "https://www.windguru.net/basemaps/wgmap/style.json");
        } else (this.forecast = d = new WG.FcstLayer(a, b)), this._animation_buttons(!1);
        d.add(this);
        this.setWindowTitle && this.setWindowTitle(d.getWindowTitle());
        this.isBetaParam(b.param) ? this.WG_options.lockZoom || this.map.setMinZoom(3) : this.WG_options.lockZoom || ((this.map.options.maxZoom = f), (this.map.options.minZoom = g));
        this.pushHistoryUrlOnly("/map", "Windguru forecast maps", 0);
    },
    addTideLayer: function (a) {
        this.tide_layer = a = new WG.TideLayer(a);
        var b = this.map.getCenter(),
            c = this.map.getZoom();
        this.map.setView(b, c, {
            reset: !0,
        });
        a.add(this);
    },
    isBetaParam: function (a) {
        return "m_" == a.substr(0, 2) ? !0 : !1;
    },
    _animation_buttons: function (a) {
        a ? $("#play").removeClass("hide") : $(".animation_icon").addClass("hide");
    },
    _animation_button_play: function (a) {
        a ? ($("#play").addClass("hide"), $("#pause").removeClass("hide")) : ($("#pause").addClass("hide"), $("#play").removeClass("hide"));
    },
    pickTimezone: function (a, b) {
        var c = this;
        if (b) {
            var d = new jBox("Notice", {
                content: "Click the map anywhere to select a timezone",
                autoClose: 3000,
                position: {
                    x: "center",
                    y: "center",
                },
                stack: !0,
                color: "yellow",
                target: $("#wgmap"),
            });
            d.open();
        }
        $("#wgmap").css("cursor", "crosshair");
        c.clickPointDisable();
        c.map.once("click", function (b) {
            $("#wgmap").css("cursor", "auto");
            d && d.destroy();
            c.clickPointEnable({
                tzselect: !0,
            });
            c.getTimezoneLatLon(b.latlng.lat, b.latlng.lng, a);
        });
    },
    getTimezoneLatLon: function (a, b, c) {
        WG.qApi(
            {
                q: "get_timezone",
                lat: a,
                lon: b,
            },
            function (a) {
                if (a.timezoneId) var b = a.timezoneId;
                else a.rawOffset ? ((b = -1 * a.rawOffset), (b = "Etc/GMT" + (0 > b ? b : "+" + b))) : (b = "UTC");
                WG.log("tzpick!", a, b);
                c && c(b);
            }
        );
    },
    setTimezone: function (a) {
        this.forecast && ((this.forecast.options.timezone = a), this.forecast.updateTimeMenu(this));
    },
    removeForecast: function (a) {
        this.forecast && this.forecast.remove(a);
    },
    removeForecasts: function () {
        this.forecast && (this.forecast.remove(), delete this.forecast);
        $("#wgmap").removeClass("has-timeslider");
    },
    getCurrentHour: function () {
        return this.forecast ? this.forecast.getHrRound() : 0;
    },
    getMapTime: function () {
        var a = moment();
        if (this.forecast && this.forecast.wgmodel.init_img) {
            var b = this.forecast.getHrRound();
            a = this.forecast.wgmodel.init_img.clone().add(b, "hour").tz(this.forecast.options.timezone);
        }
        WG.log("getMapTime: initstr, hr, ret", this.forecast.wgmodel.initdate_img, b, a.format());
        return a;
    },
    showForecast: function (a) {
        a = $.extend(
            {},
            {
                time_slider_control: !0,
            },
            a
        );
        this.show();
        this.forecast ? this.updateForecast(a) : (this.removeLayers(), this.removeControls(), this.addForecast(a));
        this.clickPointEnable({
            tzselect: !0,
        });
        this.stopPushHistory();
        WG.log(a);
        WG.log(this.forecast);
        return "/map/?" + this._getUrlVars();
    },
    updateForecast: function (a) {
        a = a || {};
        var b = !1;
        WG.log("updateForecast, options:", a);
        if (this.forecast) {
            var c = this.forecast.options;
            delete c.set_time;
            for (var d in a) a[d] !== c[d] && (b = !0);
        }
        a.id_model && (b = !0);
        !this.WG_layers.forecast && this.forecast && (b = !0);
        if (b) return (c.center = this.map.getCenter()), (c.zoom = this.map.getZoom()), $.extend(c, a), c.hr || "tcdc_apcp3" != c.param || (c.hr = 3), this.removeForecast(this.isBetaParam(c.param)), this.addForecast(c), c;
    },
    addSpots: function (a) {
        a = new WG.Map.SpotsLayer(a);
        this.WG_layers.spots = a.markerClusterGroup;
        a.addSpots(this.map);
    },
    addTideSpots: function (a) {
        a = new WG.Map.TideSpotsLayer(a);
        this.WG_layers.spots_tide = a.markerClusterGroup;
        a.addSpots(this.map);
    },
    addStations: function (a) {
        a = new WG.Map.StationsLayer(a);
        this.WG_layers.stations = a.markerClusterGroup;
        a.addStations(this.map);
    },
    showSpots: function (a, b) {
        a = a || {};
        this.show();
        this.removeLayers(["cdb"]);
        this.removeControls();
        this._setMinMaxZoom();
        this.addLayerPositronVector();
        this.typeControl("spot_map", "Spots");
        this.clickPointEnable({
            tzselect: !1,
        });
        this.addSpots(a);
        a.center && a.zoom ? this.mapSetView(a.center, a.zoom) : a.spot && this.mapSetView([a.spot.lat, a.spot.lon], 13);
        this.map.getCenter();
        b && (WG.pushState({}, "Windguru spot map", "/map/spot/?" + this._getUrlVars()), this.replaceHistoryUrlOnly("/map/spot", "Windguru spot map"));
        return "/map/spot/?" + this._getUrlVars();
    },
    showTide: function (a, b) {
        a = a || {};
        this.show();
        this.removeLayers();
        this.removeControls();
        this._setMinMaxZoom();
        this.addLayerWGVector(1, "https://www.windguru.net/basemaps/wgmap/style_wave.json", 2);
        this.typeControl("tide", "Tides");
        this.addTideSpots(a);
        this.addTideLayer();
        a.center && a.zoom ? this.mapSetView(a.center, a.zoom) : a.spot && this.mapSetView([a.spot.lat, a.spot.lon], 13);
        this.map.getCenter();
        b && (WG.pushState({}, "Windguru tide map", "/map/tide/?" + this._getUrlVars()), this.replaceHistoryUrlOnly("/map/tide", "Windguru tide map"));
        return "/map/tide/?" + this._getUrlVars();
    },
    showStations: function (a, b) {
        a = a || {};
        this.show();
        this.removeLayers(["cdb"]);
        this.removeControls();
        this._setMinMaxZoom();
        this.addLayerPositronVector();
        this.typeControl("station_map", "Stations");
        this.clickPointEnable({
            tzselect: !1,
        });
        this.addStations(a);
        a.center && a.zoom ? this.mapSetView(a.center, a.zoom) : a.station && this.mapSetView([a.station.lat, a.station.lon], 13);
        b && (WG.pushState({}, "Windguru stations map", "/map/station/?" + this._getUrlVars()), this.replaceHistoryUrlOnly("/map/station", "Windguru stations map"));
        return "/map/station/?" + this._getUrlVars();
    },
    removeControls: function () {
        for (var a in this._controls) this._controls[a].remove();
    },
    hideTimeMenu: function () {
        $("#timeslider-menu-wrapper").hide();
        $("#wgmap-time-menu").hide();
        $(".step_bar").hide();
    },
    _getUrlVars: function () {
        var a = this.map.getCenter(),
            b = this.map.getZoom();
        return "lat=" + a.lat + "&lon=" + a.lng + "&zoom=" + b;
    },
    _setMinMaxZoom: function () {
        this.map.options.maxZoom = this.WG_options.maxZoom;
        this.map.options.minZoom = this.WG_options.minZoom;
    },
    show: function () {
        this.$.show();
        this.map.invalidateSize(!1);
        this.WG_layers.stations && this.WG_layers.stations.refreshWeatherOn();
    },
    hide: function () {
        this.$.hide();
        this.WG_layers.stations && this.WG_layers.stations.refreshWeatherOff();
    },
    maximize: function () {
        this.$.width("100%").height('calc(~"100% - 60px")');
    },
    removeLayers: function (a) {
        a = a || [];
        for (var b in this.WG_layers) -1 != $.inArray(b, a) ? WG.log("KEEP " + a) : (this.map.removeLayer(this.WG_layers[b]), delete this.WG_layers[b], this._baselayers[b] && delete this._baselayers[b]);
        this.tide_layer && this.tide_layer.remove();
    },
    removeBaseLayers: function (a) {
        a = a || [];
        for (var b in this._baselayers) -1 == $.inArray(b, a) && (this.map.removeLayer(this._baselayers[b]), delete this._baselayers[b], this.WG_layers[b] && delete this.WG_layers[b]);
    },
    remove: function () {
        this.removeLayers();
        this.map.remove();
    },
    _clickPointMake: function (a) {
        var b = this,
            c = this.map,
            d = b.clickmarker;
        d.setLatLng(a.latlng);
        d.addTo(c);
        d.setPopupContent(d.getPopUpHtml(d.getLatLng())).openPopup();
        $(d._popup._closeButton).on("click", function () {
            c.removeLayer(b.clickmarker);
        });
    },
    clickPointEnable: function (a) {
        this.clickPointDisable();
        this.clickmarker || (this.clickmarker = this.pointMarker(a));
        this.map.on("click", this._clickPointMake, this);
    },
    clickPointDisable: function () {
        this.clickmarker && (this.map.removeLayer(this.clickmarker), delete this.clickmarker);
        this.map.off("click", this._clickPointMake, this);
    },
    pointMarker: function (a) {
        a = $.extend(
            {
                tzselect: !1,
                tzfunction: function () {},
                tide: !1,
                add_custom: !0,
                forecast: !0,
            },
            a
        );
        var b = this,
            c = new WG.Spot(),
            d = L.marker([0, 0], {
                icon: c.getIconStandard(),
                draggable: !0,
                zIndexOffset: 1000,
            });
        d.getPopUpHtml = function (c, f) {
            var e = c.lat + "," + c.lng;
            f = f || "Lat: " + L.Util.formatNum(c.lat, 4) + " Lon: " + L.Util.formatNum(c.lng, 4);
            var h = new WG.Spot({
                    lat: c.lat,
                    lon: c.lng,
                    spotname: f,
                }),
                k = $("<div>");
            f = '<div class="title">' + f + '</div><ul class="sm sm-simple sm-simple-vertical sm-vertical">';
            a.add_custom && (f += '<li><a href="javascript:WG.addCustomSpot(' + e + ');">' + WG.ttStr(2429, 1, "Add custom spot", "", "64", "@@@") + "</a></li>");
            a.forecast &&
                (f +=
                    '<li><a class="" href="javascript:WG.latlonFcst(' +
                    e +
                    ');">' +
                    WG.ttStr(2430, 1, "Show forecast", "", "64", "@@@") +
                    " <i>(" +
                    WG.ttStr(2431, 1, "PRO only", "available to PRO users only...", "64", "@@@") +
                    ")</i></a></li>");
            a.tide && (f += '<li><a class="showtide">' + WG.ttStr(0, 1, "Show tide (model)", "", "64", "@@@") + " <i>(" + WG.ttStr(2431, 1, "PRO only", "available to PRO users only...", "64", "@@@") + ")</i></a></li>");
            a.tzselect && (f += '<li><a class="tzsel">' + WG.ttStr(2432, 1, "Set map timezone", "", "64", "@@@") + "</a></li>");
            k.html(f + "</ul>");
            k.on("click", ".tzsel", function () {
                b.getTimezoneLatLon(c.lat, c.lng, function (c) {
                    b.setTimezone(c);
                    b.map.removeLayer(d);
                    a.tzfunction && a.tzfunction(c);
                });
            });
            k.on("click", ".showtide", function () {
                h.tideExplorer();
            });
            return k[0];
        };
        d.bindPopup(d.getPopUpHtml(d.getLatLng()), {
            className: "wg-map-popup",
        });
        d.on("dragend", function (a) {
            d.setPopupContent(d.getPopUpHtml(d.getLatLng())).openPopup();
        });
        return d;
    },
    setTimezoneLatLon: function (a, b, c) {
        var d = this;
        WG.qApi(
            {
                q: "get_timezone",
                lat: a,
                lon: b,
            },
            function (a) {
                a.timezoneId ? d.setTimezone(a.timezoneId) : a.rawOffset ? ((a = -1 * a.rawOffset), d.setTimezone("Etc/GMT" + (0 > a ? a : "+" + a))) : d.setTimezone(a.timezoneId);
                c && c();
            }
        );
    },
    stopPushHistory: function () {
        this._mapchangefn && this.map.off("moveend", this._mapchangefn);
    },
    pushHistory: function (a, b, c, d) {
        var e = this;
        d = d || 0;
        this.WG_options.push_history &&
            (e.stopPushHistory(),
            setTimeout(function () {
                e._mapchangefn = WG.debounce(function (d) {
                    d = e.map.getCenter();
                    var f = e.map.getZoom();
                    WG.log("map: " + b + "/?lat=" + d.lat + "&lon=" + d.lng + "&zoom=" + f);
                    WG.pushState(
                        {
                            fn: a,
                        },
                        c,
                        b + "/?lat=" + d.lat + "&lon=" + d.lng + "&zoom=" + f
                    );
                }, 1000);
                e.map.on("moveend", e._mapchangefn);
            }, d));
    },
    replaceHistoryUrlOnly: function (a, b, c) {
        var d = this;
        c = c || 0;
        this.WG_options.push_history &&
            (d.stopPushHistory(),
            setTimeout(function () {
                d._mapchangefn = WG.debounce(function (c) {
                    c = d.map.getCenter();
                    var e = d.map.getZoom();
                    WG.log("map: " + a + "/?lat=" + c.lat + "&lon=" + c.lng + "&zoom=" + e);
                    window.history.replaceState({}, b, a + "/?lat=" + c.lat + "&lon=" + c.lng + "&zoom=" + e);
                }, 1000);
                d.map.on("moveend", d._mapchangefn);
            }, c));
    },
    pushHistoryUrlOnly: function (a, b, c) {
        var d = this;
        c = c || 0;
        this.WG_options.push_history &&
            (d.stopPushHistory(),
            setTimeout(function () {
                d._mapchangefn = WG.debounce(function (c) {
                    c = d.map.getCenter();
                    var e = d.map.getZoom();
                    WG.log("map: " + a + "/?lat=" + c.lat + "&lon=" + c.lng + "&zoom=" + e);
                    WG.pushState(window.history.state, b, a + "/?lat=" + c.lat + "&lon=" + c.lng + "&zoom=" + e);
                }, 1000);
                d.map.on("moveend", d._mapchangefn);
            }, c));
    },
    mapSetViewUrl: function () {
        var a = this,
            b = WG.getGet();
        b.lat && b.lon && b.zoom
            ? a.map.setView([b.lat[0], b.lon[0]], b.zoom[0], {
                  animate: !1,
              })
            : a._geolocation_checked ||
              WG.getLocation(function (b) {
                  var c = b.coords.latitude;
                  b = b.coords.longitude;
                  a._geolocation_checked = !0;
                  a.map.setView([c, b], a.map.getZoom(), {
                      animate: !1,
                  });
              });
    },
    mapSetView: function (a, b) {
        this.map.setView(a, b, {
            animate: !1,
        });
    },
    typeControl: function (a, b) {
        var c = this;
        this._controls.map_type && this._controls.map_type.remove();
        var d = $(
            '<ul class="sm sm-simple sm-simple-vertical sm-vertical"><li><a data-fn="showForecast" href="javascript:void(0);"><svg class="icon"><use xlink:href="#ico_wind"></use></svg> Forecasts</a></li><li><a data-fn="showSpots" href="javascript:void(0);"><svg class="icon"><use xlink:href="#ico_spot_map"></use></svg> Spots</a></li><li><a data-fn="showStations" href="javascript:void(0);"><svg class="icon"><use xlink:href="#ico_station_map"></use></svg> Stations</a></li><li><a data-fn="showTide" href="javascript:void(0);"><svg class="icon"><use xlink:href="#ico_tide"></use></svg> Tides</a></li></ul>'
        );
        d.find("a").on("click", function () {
            var a = $(this).data("fn");
            a && (c.removeLayers(["cdb"]), c.removeForecasts(), c[a]());
        });
        this._controls.map_type = new WG.WgJboxControl({
            text: b,
            icon: "ico_" + a,
            position: "bottomright",
            title: "Select map",
            content: d,
        }).addTo(c.map);
    },
});
WG.Map.latLngBounds_pxsize = function (a, b) {
    var c = a.latLngToLayerPoint(b.getNorthWest());
    return a.latLngToLayerPoint(b.getSouthEast()).subtract(c);
};
WG.Map.latLngBounds_latLng2pxpoint = function (a, b, c) {
    b = a.latLngToLayerPoint(b.getNorthWest());
    return a.latLngToLayerPoint(c).subtract(b);
};
WG.Map.latLngBounds_pxpoint2latLng = function (a, b, c) {
    b = a.latLngToLayerPoint(b.getNorthWest()).add(c);
    return a.layerPointToLatLng(b);
};
WG.Map.LocateControl = L.Control.Locate.extend({
    _drawMarker: function () {
        L.Control.Locate.prototype._drawMarker.call(this);
        this.options.onLocate && (this._locateControlMarker = this.options.onLocate(this._event.latlng));
    },
    _removeMarker: function () {
        L.Control.Locate.prototype._removeMarker.call(this);
        this._locateControlMarker && this._map.removeLayer(this._locateControlMarker);
    },
    onAdd: function (a) {
        a = L.Control.Locate.prototype.onAdd.call(this, a);
        $(a).addClass("leaflet-wg-control").find(".wg-locate-icon").empty().append('<svg class="icon"><use xlink:href="#ico_spot_map"></use></svg>');
        return a;
    },
});
WG.FSControl = L.Control.extend({
    options: {
        clickfn: function () {},
        position: "topright",
    },
    initialize: function (a) {
        L.Util.setOptions(this, a);
        L.Control.prototype.initialize.call(this, a);
    },
    onAdd: function (a) {
        a = $('<div class="leaflet-wg-control"><a href="javascript:void(0);"><svg class="icon inmap"><use xlink:href="#ico_maximize"></use></svg></a></div>');
        a.find("a").on("click", this.options.clickfn);
        return a[0];
    },
});
WG.WgControl = L.Control.extend({
    options: {
        click: function () {},
        position: "bottomright",
        text: "",
        icon: "",
        css: "",
    },
    initialize: function (a) {
        L.Util.setOptions(this, a);
        L.Control.prototype.initialize.call(this, a);
    },
    onAdd: function (a) {
        a = this.options;
        var b = $('<div class="leaflet-wg-control ' + a.css + '"><a href="javascript:void(0);">' + (a.icon ? '<svg class="icon inmap"><use xlink:href="#' + a.icon + '"></use></svg> ' : "") + a.text + "</a></div>");
        b.find("a").on("click", a.click);
        b.on("mouseover", function (a) {
            a.stopPropagation();
        });
        return b[0];
    },
});
WG.WgJboxControl = L.Control.extend({
    options: {
        position: "bottomright",
        text: "",
        icon: "",
        title: "&nbsp",
        content: "",
        close_others: !0,
        guide: "",
        guide_priority: 1,
        click: function () {},
        jbox_options: {
            position: {
                x: "center",
                y: "top",
            },
            outside: "y",
            pointer: !0,
            adjustPosition: !0,
            reposition: !0,
            overlay: !1,
            repositionOnOpen: !0,
            repositionOnContent: !1,
            addClass: "wgmodal wg-fixed wg-control-jbox",
            onOpen: function () {},
            onClose: function () {},
            onCloseComplete: function () {},
            blockScroll: !1,
            zIndex: 11100,
        },
    },
    initialize: function (a) {
        L.Util.setOptions(this, a);
        L.Control.prototype.initialize.call(this, a);
        this._jbox = null;
        this._was_open = !1;
    },
    onAdd: function (a) {
        var b = this;
        a = this.options;
        var c = $(
            '<div class="leaflet-wg-control' +
                (a.guide ? " wg-guide wg-guide-maps" : "") +
                '"' +
                (a.guide ? ' data-guide-priority="' + a.guide_priority + '" data-guide-src="' + a.guide + '"' : "") +
                '><a href="javascript:void(0);">' +
                (a.icon ? '<svg class="icon inmap"><use xlink:href="#' + a.icon + '"></use></svg> ' : "") +
                a.text +
                "</a></div>"
        );
        b._target = c.find("a");
        this._jbox ||
            ((this._jbox = a.jbox_options.title = a.title),
            (a.jbox_options.content = a.content),
            (a.jbox_options.onClose = function (a) {
                b._was_open = !1;
            }),
            (this._jbox = new jBox("Modal", a.jbox_options)));
        c.find("a").on("click", function (a) {
            a.stopPropagation();
            b.isOpen() ? b.close() : (b.options.click(b), b.open());
        });
        c.on("mouseover", function (a) {
            a.stopPropagation();
        });
        return c[0];
    },
    onRemove: function () {
        if (this._jbox) {
            var a = this.isOpen();
            this._jbox.destroy();
            this._was_open = a;
        }
    },
    setContent: function (a) {
        this._jbox && this._jbox.setContent(a);
    },
    jboxResize: function (a) {
        a = a || 80;
        var b = this._jbox,
            c = function () {
                b.content && (b.content.css("max-height", WG.getMaxHeight(a)), b.position());
            };
        $(window).on("resize", c);
        c();
    },
    open: function () {
        var a;
        if ((a = this._map._WGMap) && this.options.close_others) {
            a = a._controls || {};
            for (var b in a) a[b].close && a[b].close();
        }
        this._jbox.open({
            target: this._target,
        });
        this.jboxResize();
    },
    close: function () {
        this._jbox.close();
    },
    isOpen: function () {
        return this._jbox ? (this._jbox.isOpen ? !0 : !1) : !1;
    },
    wasOpen: function () {
        return this._was_open ? !0 : !1;
    },
});
WG.Map.MarkersLayer = $class({
    Mixins: L.ILayer,
    constructor: function (a) {
        this.options = $.extend(
            {},
            {
                maxClusterRadius: 40,
            },
            a
        );
        this.markers = this.makeClusterGroup();
    },
    makeClusterGroup: function () {
        return L.markerClusterGroup({
            maxClusterRadius: this.options.maxClusterRadius,
            iconCreateFunction: function (a) {
                a = a.getAllChildMarkers();
                return new L.DivIcon({
                    className: "",
                    iconSize: [60, 60],
                    html: WG.svgWgClusterInline("#DDD", a.length),
                });
            },
        });
    },
    onAdd: function (a) {
        a.addLayer(this.markers);
    },
    onRemove: function (a) {
        a.removeLayer(this.markers);
    },
    draw: function () {},
    redraw: function () {
        this.draw();
    },
});
WG.Map.StationsLayer = $class({
    constructor: function (a) {
        var b = this;
        this.stations = [];
        this.station_ids = {};
        this.weather_refresh_timeout = null;
        a = $.extend(
            {},
            {
                wj: "knots",
                tj: "c",
                link: "/station/",
                refresh_weather: 20000,
                maxClusterRadius: 40,
                seconds_alive: 172800,
                dead_fade: [10800, 172800],
                onclick_detail: function (a) {
                    WG.showStation && WG.showStation(a);
                },
                onclick: function (a) {
                    var c, e;
                    WG.station_windows || (WG.station_windows = []);
                    if (!WG.station_windows[a.id_station]) {
                        var f = $(window).width();
                        WG.station_windows[a.id_station] = new WG.Window({
                            title: "" + a.getFullName(),
                            minWidth: 400 > f ? f : 400,
                            addClass: "wgmodal",
                            attach: "#wgmap",
                            src: "/snippets/station_detail.htm",
                            target: $(a.marker._icon),
                            onLoad: function (d) {
                                e = new WG.Station.Current(
                                    {
                                        id_station: a.id_station,
                                        wj: WG.user.wj,
                                        tj: WG.user.tj,
                                    },
                                    d.getContent$().find(".spot-data")
                                );
                                e.draw();
                                d.fitWindow();
                                c = a.windGraph(
                                    {
                                        hours: 1,
                                    },
                                    d.getContent$().find(".spot-graph")
                                );
                                d.fitWindow();
                                d.toFront();
                                d.getContent$().on("click", function () {
                                    WG.station_windows[a.id_station].close();
                                    b.options.onclick_detail(a);
                                });
                            },
                            onClose: function () {
                                c.stopAutoUpdate();
                                e.stopAutoUpdate();
                                delete WG.station_windows[a.id_station];
                            },
                        });
                    }
                },
                popup: !1,
                iconstyle: "wg",
            },
            a
        );
        a.iconCreateFunction = function (b) {
            for (var c = b.getAllChildMarkers(), e = (b = 0), f, g, h = 0; h < c.length; h++) {
                var k = c[h].options.station.weather.wind_avg;
                null !== k && (void 0 === g && (g = k), void 0 === f && (f = k), (b += k), e++, (f = f < k ? k : f), (g = g > k ? k : g));
            }
            c = 0;
            h = "";
            e && ((c = b / e), (h = WgUtil.round(WgUtil.unitConvert(f, a.wj), 1)));
            b = WG.svgLwStationClusterInline;
            "wg" == a.iconstyle && (b = WG.svgWgStationClusterInline);
            e = [60, 60];
            2 <= window.devicePixelRatio && (e = [50, 50]);
            return new L.DivIcon({
                className: "",
                iconSize: e,
                html: b(c, h, g, f),
            });
        };
        this.options = a;
        this.markerClusterGroup = L.markerClusterGroup(a);
    },
    focusStation: function (a) {},
    setWindUnits: function (a) {
        this.wj = a;
    },
    setTempUnits: function (a) {
        this.tj = a;
    },
    switchWindUnits: function (a) {
        if (this.wj != a) {
            this.setWindUnits(a);
            for (var b = 0; b < this.stations.length; b++) this.stations[b].switchWindUnits(a);
        }
    },
    switchTempUnits: function (a) {
        if (this.tj != a) {
            this.setTempUnits(a);
            for (var b = 0; b < this.stations.length; b++) this.stations[b].switchTempUnits(a);
        }
    },
    addStations: function (a) {
        var b = this;
        this.loadStations(function () {
            for (var c = 0; c < b.stations.length; c++) {
                var d = b.stations[c].makeMarker({
                    link_text: b.options.link_text,
                    open: !1,
                    onclick: b.options.onclick,
                });
                b.markerClusterGroup.addLayer(d);
            }
            a.addLayer(b.markerClusterGroup);
            b.refreshWeatherOn();
        });
    },
    updateStation: function (a, b) {
        this.station_ids[a] && this.station_ids[a].setWeather(b);
    },
    openPopUp: function (a) {
        (a = this.getStation(a)) && a.openPopUp();
        return a;
    },
    getStation: function (a) {
        return this.station_ids[a];
    },
    refreshWeather: function (a, b) {
        var c = this;
        b = b || Math.round((1.5 * this.options.refresh_weather) / 1000);
        this.loadWeatherUpdate(b, function () {
            a &&
                (c.weather_refresh_timeout && clearTimeout(c.weather_refresh_timeout),
                (c.weather_refresh_timeout = setTimeout(function () {
                    c.refreshWeather(a);
                }, a)));
            c.markerClusterGroup.refreshClusters();
        });
    },
    refreshWeatherOff: function () {
        this.weather_refresh_timeout && clearTimeout(this.weather_refresh_timeout);
        this._refresh_stopped = Math.round(new Date().getTime() / 1000);
    },
    refreshWeatherOn: function () {
        var a = this;
        if (this.options.refresh_weather) {
            $(window).on("WG:stop", function () {
                a.refreshWeatherOff();
            });
            var b = this._refresh_stopped || 0,
                c = 60;
            b && (c = Math.round((2 * this.options.refresh_weather + new Date().getTime()) / 1000) - b);
            this.refreshWeather(this.options.refresh_weather, c);
        }
    },
    loadWeatherUpdate: function (a, b) {
        var c = this;
        jQuery.getJSON(
            WG.getApi(),
            {
                q: "station_list_weather",
                id_type: 0,
                seconds: a,
                WGCACHEABLE: 30,
            },
            function (a) {
                for (var d = 0; d < a.length; d++) {
                    var f = a[d];
                    c.updateStation(f.id_station, f.weather);
                }
                b && b();
            }
        );
    },
    loadStations: function (a) {
        var b = this;
        WG.qApi(
            {
                q: "station_list",
                id_type: 0,
                seconds: 1800,
                seconds_alive: b.options.seconds_alive,
                WGCACHEABLE: 30,
            },
            function (c) {
                b.stations = [];
                for (var d = 0; d < c.length; d++) {
                    var e = c[d];
                    b.stations[d] = new WG.Station({
                        id_station: e.id_station,
                        id_spot: e.id_spot,
                        wg: e.wg,
                        spotname: e.spotname,
                        name: e.name,
                        link: b.options.link,
                        lat: e.lat,
                        lon: e.lon,
                        weather: e.weather,
                        wj: b.options.wj,
                        tj: b.options.tj,
                        seconds_alive: e.seconds_alive,
                        dead_fade: b.options.dead_fade,
                        popup: b.options.popup,
                        onclick: b.options.onclick,
                        iconstyle: b.options.iconstyle,
                    });
                    b.station_ids[e.id_station] = b.stations[d];
                }
                a && a(b.stations);
            }
        );
    },
});
WG.Map.SpotsLayer = $class({
    clusterColors: new WgPalette([
        [0, 255, 255, 255],
        [6, 255, 255, 255],
        [18, 103, 247, 241],
        [90, 45, 124, 250],
        [164, 200, 0, 250],
        [200, 250, 0, 133],
    ]),
    constructor: function (a) {
        this.options = $.extend(
            this.options,
            {
                maxClusterRadius: 80,
                open: null,
                tide: !1,
            },
            a
        );
        this.spots = [];
        this.spot_ids = {};
        this.markerClusterGroup = this.makeClusterGroup();
    },
    makeClusterGroup: function () {
        var a = this,
            b = new PruneClusterForLeaflet();
        b.PrepareLeafletMarker = function (a, b) {
            a.setIcon(b.getIconStandard({}));
            a.getPopup()
                ? a.setPopupContent(b.getPopUpHtml())
                : (a.bindPopup(b.getPopUpHtml(), {
                      className: "wg-map-popup",
                  }),
                  a.on("click", function (a) {
                      this.openPopup();
                  }));
        };
        b.BuildLeafletClusterIcon = function (b) {
            return a.clusterIcon(b.population);
        };
        b.Cluster.Size = a.options.maxClusterRadius;
        return b;
    },
    clusterIcon: function (a) {
        return new L.divIcon({
            className: "cluster-div-icon",
            iconSize: [25, 25],
            html: '<span class="population">' + a + "</span>",
        });
    },
    focusSpot: function (a) {},
    addSpots: function (a) {
        var b = this;
        this.loadSpots(function () {
            for (var c = 0; c < b.spots.length; c++) {
                var d = new PruneCluster.Marker(b.spots[c].lat, b.spots[c].lon);
                b.markerClusterGroup.RegisterMarker(d);
                d.data = b.spots[c];
            }
            a.addLayer(b.markerClusterGroup);
            b.options.open && ((c = b.spot_ids[b.options.open]), b.makeMarker(c), c.addToMap(a), c.marker.openPopup());
        }, !0);
    },
    makeMarker: function (a) {
        a.makeMarker();
    },
    openPopUp: function (a) {
        return this.getSpot(a);
    },
    getSpot: function (a) {
        return this.spot_ids[a];
    },
    loadSpots: function (a, b) {
        var c = this;
        if (b && WG._cache.spots) (c.spots = WG._cache.spots), (c.spot_ids = WG._cache.spot_ids), a && a();
        else {
            c.spots = [];
            var d = moment.utc();
            $.ajax({
                url: "https://www.windguru.net/json/spots.js?" + d.format("YYYYMMDDHH"),
                dataType: "jsonp",
                jsonp: !1,
                jsonpCallback: "wgSpotsLoad",
                cache: !0,
                success: function (d) {
                    for (var e = 0; e < d.count; e++) {
                        var g = d.spots[e];
                        c.spots[e] = new WG.Spot({
                            id_spot: g[0],
                            spotname: g[1],
                            lat: g[2],
                            lon: g[3],
                        });
                        c.spot_ids[c.spots[e].id_spot] = c.spots[e];
                    }
                    WG.user.id_user
                        ? WG.qApi(
                              {
                                  q: "spots",
                                  opt: "simplemap",
                                  id_user: WG.user.id_user,
                                  expires: 300,
                                  WGCACHEABLE: !0,
                              },
                              function (d) {
                                  for (var e = 0; e < d.count; e++) {
                                      var f = d.spots[e],
                                          g = c.spots.length;
                                      f = new WG.Spot({
                                          id_spot: f[0],
                                          id_user: WG.user.id_user,
                                          spotname: f[1],
                                          lat: f[2],
                                          lon: f[3],
                                      });
                                      c.spots[g] = f;
                                      c.spot_ids[c.spots[g].id_spot] = c.spots[g];
                                  }
                                  b && ((WG._cache.spots = c.spots), (WG._cache.spot_ids = c.spot_ids));
                                  a && a();
                              },
                              !0
                          )
                        : (b && ((WG._cache.spots = c.spots), (WG._cache.spot_ids = c.spot_ids)), a && a());
                },
            });
        }
    },
});
WG.Map.TideSpotsLayer = $class({
    Extends: WG.Map.SpotsLayer,
    clusterColors: new WgPalette([
        [0, 255, 255, 255],
        [6, 255, 255, 255],
        [18, 103, 247, 241],
        [90, 45, 124, 250],
        [164, 200, 0, 250],
        [200, 250, 0, 133],
    ]),
    constructor: function (a) {
        this.options = $.extend(
            this.options,
            {
                maxClusterRadius: 50,
                open: null,
                tide: !1,
            },
            a
        );
        this.spots = [];
        this.harmbase_spots = [];
        this.spot_ids = {};
        this.markerClusterGroup = this.makeClusterGroup();
    },
    clusterIcon: function (a) {
        return new L.divIcon({
            className: "cluster-div-icon",
            iconSize: [25, 25],
            html: '<span class="population">' + a + "</span>",
        });
    },
    loadSpots: function (a, b) {
        var c = this;
        b && WG._cache.spots_tide && WG._cache.harmbase_spots
            ? ((c.spots = WG._cache.spots_tide), (c.harmbase_spots = WG._cache.harmbase_spots), (c.spot_ids = WG._cache.spot_ids), a && a())
            : ((c.spots = []),
              WG.qApi(
                  {
                      q: "spots",
                      opt: "simplemapuser",
                      tide: 1,
                      id_user_cache: WG.user.id_user,
                      expires: 300,
                      WGCACHEABLE: !0,
                  },
                  function (d) {
                      for (var e = 0; e < d.count; e++) {
                          var f = d.spots[e],
                              g = c.spots.length;
                          f = new WG.Spot({
                              id_spot: f[0],
                              id_user: f[4],
                              spotname: f[1],
                              lat: f[2],
                              lon: f[3],
                              tide: !0,
                          });
                          c.spots[g] = f;
                          c.spot_ids[c.spots[g].id_spot] = c.spots[g];
                      }
                      WG.apiG(
                          {
                              q: "tides_harmbase_all",
                              expires: 3600,
                              WGCACHEABLE: !0,
                          },
                          function (d) {
                              for (var e = 0; e < d.length; e++) {
                                  var f = d[e];
                                  f = new WG.TideSpot({
                                      spotname: f[1],
                                      lat: f[2],
                                      lon: f[3],
                                      harmbase_id: f[0],
                                      tz: f[4],
                                  });
                                  c.harmbase_spots.push(f);
                                  c.spots.push(f);
                              }
                              b && ((WG._cache.harmbase_spots = c.harmbase_spots), (WG._cache.spots_tide = c.spots), (WG._cache.spot_ids = c.spot_ids));
                              a && a();
                          }
                      );
                  },
                  !0
              ));
    },
});
WG.FcstLayer = $class({
    constructor: function (a, b) {
        b = $.extend(
            {},
            {
                param: "windspd",
                hr: 0,
                tile_server: "https://{s}.windguru.net",
                opacity: 1,
                timezone: "UTC",
                time_slider_control: !1,
            },
            b
        );
        a = this.wgmodel = a;
        this.options = b;
        "tmp" == b.param && (b.param = "t2m");
        var c = a.tiledir,
            d = b.hr;
        a.tiledir_prev && b.hr >= a.init_prev_hr_start && ((c = a.tiledir_prev), (d = b.hr + (a.initstamp_img / 3600 - a.initstamp_img_prev / 3600)));
        this.layer = new L.TileLayer(b.tile_server + "/tiles/" + c + "/" + d + "/" + b.param + "/{z}/{x}/{y}.jpg", {
            subdomains: "abcd",
            opacity: b.opacity,
            minZoom: a.zoom[0],
            maxZoom: a.zoom[1],
            errorTileUrl: "https://www.windguru.cz/img/windguru_maps_nodata.png",
            bounds: L.latLngBounds([a.lat[0], a.lon[0]], [a.lat[1], a.lon[1]]),
        });
    },
    add: function (a) {
        this._fcst_map = a;
        this.layer.addTo(a.map);
        this.keyboardShortcuts();
        this._fcst_map.WG_layers.forecast = this.layer;
    },
    remove: function (a) {
        this._fcst_map && (this._fcst_map.map.removeLayer(this.layer), this._fcst_map.removeLayers(a ? ["wgmap"] : []));
    },
    keyboardShortutsClear: function () {
        $(document).unbind("keydown.maps." + this._fcst_map.divid);
    },
    keyboardShortcuts: function () {
        var a = this,
            b = $(document);
        b.unbind("keydown.maps.all");
        b.bind("keydown.maps.all", "right", function (b) {
            b.preventDefault();
            a.nextHr();
        });
        b.bind("keydown.maps.all", "shift+right", function (b) {
            b.preventDefault();
            a.nextHr(6);
        });
        b.bind("keydown.maps.all", "alt+right", function (b) {
            b.preventDefault();
            a.nextHr(3);
        });
        b.bind("keydown.maps.all", "down", function (b) {
            b.preventDefault();
            a.nextHr(24);
        });
        b.bind("keydown.maps.all", "left", function (b) {
            b.preventDefault();
            a.prevHr();
        });
        b.bind("keydown.maps.all", "shift+left", function (b) {
            b.preventDefault();
            a.prevHr(6);
        });
        b.bind("keydown.maps.all", "alt+left", function (b) {
            b.preventDefault();
            a.prevHr(3);
        });
        b.bind("keydown.maps.all", "up", function (b) {
            b.preventDefault();
            a.prevHr(24);
        });
        b.bind("keydown.maps.all", "space", function (b) {
            b.preventDefault();
            a.play && $("#timeslider-menu-wrapper").is(":visible") && (a._running ? a.stop() : a.play());
        });
    },
    updateFcstModelMenu: function (a, b) {
        this.getModel();
        var c = $("#wgmap-model-menu");
        c.empty();
        var d = [],
            e;
        for (e in a) d[d.length] = a[e];
        d.sort(WG.Model.sortFn);
        for (e = 0; e < d.length; e++) {
            var f = d[e];
            f.bounds.intersects(b.map.getBounds()) && f.maps && c.append('<li><a data-id="' + f.id_model + '" data-pro="' + f.pro + '" href="javascript:void(0);">' + f.longname + "</a></li>");
        }
        c.find("a").on("click", function () {
            var c = $(this).data("id");
            $(this).data("pro") && !WG.user.pro
                ? WG.FcstLayer.mapProOnly(a[c])
                : b.updateForecast({
                      id_model: c,
                      set_time: b.getMapTime(),
                      animation: !1,
                  });
        });
    },
    getWindowTitle: function () {
        var a = this.getModel(),
            b = a.init_img;
        a.tiledir_prev && this.options.hr >= a.init_prev_hr_start && (b = a.init_img_prev);
        var c = a.init_img.clone().add(this.options.hr, "hours").tz(this.options.timezone),
            d = c.format("dd D. HH[h]");
        c = WG.timezoneStr(c, this.options.timezone);
        return "<b>" + a.model_name + '</b> <span class="mobile-hide">(init: ' + b.format("D.M. HH") + " UTC) </span>@ <b>" + d + " " + c + "</b>";
    },
    updateTimeMenu: function (a, b, c) {
        function d(a) {
            a = g.init_img.clone().add(a, "hours").tz(f.options.timezone);
            var b = WG.timezoneStr(a, f.options.timezone);
            return a.format("dd D. M. HH[h] ") + b;
        }
        if (this.options.time_slider_control) {
            c = $.extend(
                {},
                {
                    smooth: !1,
                    slideFn: function () {},
                    slideEndFn: function () {},
                },
                c
            );
            b = b || this.options.hr;
            var e = $("#wgmap-page");
            $("#timeslider-menu-wrapper").show();
            $("#wgmap-time-menu").show();
            $(".step_bar").show();
            var f = this,
                g = f.getModel();
            $("#wgmap-page")
                .find(".prevhr")
                .off()
                .on("click", function () {
                    f.prevHr();
                });
            $("#wgmap-page")
                .find(".nexthr")
                .off()
                .on("click", function () {
                    f.nextHr();
                });
            e.find("#play")
                .off()
                .on("click", function () {
                    f.play();
                });
            e.find("#pause")
                .off()
                .on("click", function () {
                    f.stop();
                });
            $("#picktz")
                .off()
                .on("click", function () {
                    a.pickTimezone(function (b) {
                        a.setTimezone(b);
                    }, !0);
                });
            e.find(".settz")
                .off()
                .on("click", function () {
                    var b = $(this).data("tz");
                    a.setTimezone(b);
                });
            if (g.init_img) {
                var h = g.init_img.clone().add(b, "hours").tz(f.options.timezone),
                    k = moment.tz.zone(this.options.timezone).parse(moment.utc(g.initdate_img + "Z")) / 60,
                    p = h.format("dd D. HH[h]");
                h = WG.timezoneStr(h, this.options.timezone);
                e.find(".currdate")
                    .empty()
                    .append(p + " " + h);
                p = function (a, b) {
                    a = g.init_img.clone().add(a, "hours").tz(f.options.timezone);
                    return 0 !== a.get("minute") ? 0 : 12 == a.get("hour") ? 2 : 0 == a.get("hour") ? 1 : 0;
                };
                h = {
                    to: function (a) {
                        a = g.init_img.clone().add(a, "hours").tz(f.options.timezone);
                        return 12 == a.get("hour") ? a.format("dd") : "";
                    },
                };
                for (var q = e.find("#timeslider-menu"), n = [], m = 0; m < g.hours.length; m++) {
                    var t = g.hours[m] + k;
                    t < g.hr_start || t > g.hr_end || (n[n.length] = t);
                }
                q[0] &&
                    (a._time_slider && a._time_slider.destroy(),
                    (b = noUiSlider.create(e.find("#timeslider-menu")[0], {
                        start: b,
                        range: {
                            min: g.hr_start,
                            max: g.hr_end,
                        },
                        pips: {
                            mode: "values",
                            values: n,
                            density: 1,
                            filter: p,
                            format: h,
                        },
                        tooltips: wNumb({
                            edit: function (a) {
                                return d(a);
                            },
                        }),
                    })),
                    b.on("click", function () {
                        f.stop && f.stop();
                    }),
                    b.on("change", function (a) {
                        a = this.get();
                        c.smooth ? f.setHr(parseFloat(a)) : f.setHr(g.hrRound(parseFloat(a)));
                        c.slideEndFn && (c.slideEndFn(parseFloat(a)), e.find(".currdate").empty().append(d(a)));
                    }),
                    b.on("slide", function () {
                        e.find(".timeslider-tooltip").show();
                        var a = this.get();
                        c.slideFn && (c.slideFn(parseFloat(a)), e.find(".currdate").empty().append(d(a)));
                    }),
                    b.on("set", function () {
                        var a = this.get();
                        e.find(".timeslider-tooltip").hide();
                        e.find(".currdate").empty().append(d(a));
                    }),
                    (a._time_slider = b));
                a.$.addClass("has-timeslider");
            }
        }
    },
    onRemove: function (a) {
        WG.FcstLayer._superClass.onRemove.call(this, a);
        this.clearAllEventListeners();
        this.keyboardShortutsClear();
    },
    nextHr: function (a) {
        this._fcst_map.updateForecast({
            hr: this.wgmodel.nextHour(this.options.hr, a),
            model: this.wgmodel,
            animation: !1,
            set_max_zoom: !1,
        });
    },
    play: function () {
        var a = this.options.hr,
            b = this._fcst_map.forecast;
        if (b) {
            if (b instanceof WG.FcstAnimation) {
                if (b.timeout) {
                    b.stop();
                    return;
                }
                if (b._ready) {
                    b.start(b.getHr());
                    return;
                }
            }
            this.wgmodel.zoom_data_tiles.length
                ? WG.notice("Not available...")
                : "m_windspd" != this.options.param
                ? WG.notice("Not available...")
                : this._fcst_map.updateForecast({
                      hr: a,
                      model: this.wgmodel,
                      set_max_zoom: !1,
                      animation: !0,
                      param: "m_windspd",
                  });
        }
    },
    prevHr: function (a) {
        this._fcst_map.updateForecast({
            hr: this.wgmodel.prevHour(this.options.hr, a),
            model: this.wgmodel,
            animation: !1,
            set_max_zoom: !1,
        });
    },
    setHr: function (a) {
        this._fcst_map.updateForecast({
            hr: a,
            model: this.wgmodel,
            animation: !1,
            set_max_zoom: !1,
        });
    },
    getHrRound: function () {
        return this.options.hr;
    },
    getModel: function () {
        return this.wgmodel;
    },
});
WG.TideLayer = $class({
    Extends: WG.FcstLayer,
    constructor: function (a) {
        this.options = a = $.extend(
            {},
            {
                param: "windspd",
                hr: 0,
                tile_server: "https://{s}.windguru.net",
                opacity: 1,
                timezone: "UTC",
                time_slider_control: !1,
            },
            a
        );
    },
    add: function (a) {
        var b = this;
        b._fcst_map = a;
        var c = "m2 k1 s2 o1 m4 n2 m6 p1 k2".split(" ");
        $.getJSON("/model/fes2014/datatile/stats.json", function (d) {
            WG.log(d);
            var e = {
                files: {},
                vars: {},
                lat: {
                    min: -90,
                    max: 90,
                },
                lon: {
                    min: -180,
                    max: 180,
                },
            };
            c.forEach(function (a) {
                var b = d[a],
                    c = a.toUpperCase();
                e.files[a] = {
                    r: c,
                };
                e.vars[c] = {
                    min: b[0],
                    max: b[1],
                };
            });
            WG.log(e);
            var f = "png";
            Modernizr.webplossless && (f = "webp");
            f = new WG.WeatherTileLayer({
                render: !1,
                zoomOffset: -1,
                tileSize: 512,
                tileSize_di: 256,
                dir: "https://www.windguru.net/model/fes2014/datatile",
                quality: f,
                hr: "",
                param: "m2",
                files: c,
                glfn: "GLTide",
                colors: ["tide"],
                info: e,
                model: null,
                subdomains: "abcd",
                minZoom: 1,
                maxNativeZoom: 5,
                maxZoom: 15,
                attribution: '&copy; <a href="http://www.windguru.cz">Windguru</a> FES2014',
                bounds: L.latLngBounds([
                    [-90, -180],
                    [90, 180],
                ]),
            });
            f.addTo(a.map);
            b.layer = new WG.TideOverlayTiled(f, a.map.getBounds(), {
                glfn: "GLTide",
                files: c,
                textures: c,
                colors: ["tide"],
                zIndex: 1,
                opacity: 0.8,
            }).addTo(a.map);
            moment();
            f = moment();
            b.layer.setMoment(f);
            b.layer.wgl.render();
            var g = moment.tz.guess(),
                h = moment().tz(g).startOf("day"),
                k = h.clone().add(6, "days");
            g = moment().tz(g);
            h.clone().add(1, "days");
            a.$.addClass("has-timeslider");
            $("#timescroll-menu-wrapper").addClass("on");
            b._fcst_map.WG_layers.tide_forecast = b.layer;
            b.tscroll = new WG.TimeScroller({
                from: h,
                to: k,
                init: g,
                step_width: 30,
                $target: $("#timescroll"),
                onScroll: function (a) {
                    requestAnimationFrame(function () {
                        b.render(a);
                    });
                },
            });
            b.render(f);
            $("#play_tide").on("click", function () {
                b.play();
            });
            $("#pause_tide").on("click", function () {
                b.stop();
            });
            b.picker && b.picker.destroy();
            b.picker = new Pikaday({
                field: document.getElementById("date_tide_hidden"),
                trigger: document.getElementById("date_tide"),
                onSelect: function () {
                    var a = this.getMoment(),
                        c = b.tscroll.get().tz();
                    a.tz(c).hour(12);
                    b.tscroll.redrawInfiniteScroller(a);
                    b.layer.setStartMoment(a);
                    b.layer.setMoment(a);
                },
            });
            $("#timescroll")
                .find(".currenttime")
                .off("click")
                .on("click", function () {
                    WG.log("CLICKED CURRENTIME!");
                    b._fcst_map.pickTimezone(function (a) {
                        b.tscroll.setTz(a);
                    }, !0);
                    return !1;
                });
            a.clickPointEnable({
                tzselect: !0,
                tzfunction: function (a) {
                    b.tscroll.setTz(a);
                },
                forecast: !1,
                add_custom: !1,
                tide: !0,
            });
            a._controls.help = new WG.WgControl({
                text: "",
                icon: "ico_help",
                position: "bottomright",
                css: "help-control",
                click: function (a) {
                    a.stopPropagation();
                    WG.showGuideTideMaps();
                },
            }).addTo(a.map);
        });
    },
    remove: function (a) {
        this._fcst_map &&
            ($("#wgmap").removeClass("has-timeslider"), $("#timescroll-menu-wrapper").removeClass("on"), $("#play_tide").off("click"), $("#pause_tide").off("click"), this.tscroll.scrollEventsOff(), this.picker && this.picker.destroy());
    },
    render: function (a) {
        this.layer.setMoment(a);
        this.layer.wgl.render();
    },
    play: function (a) {
        function b() {
            c._timeout = requestAnimationFrame(function () {
                var f = moment().valueOf() - e.valueOf();
                f = d.clone().add(f * a, "ms");
                c.render(f);
                c.tscroll.set(f);
                b();
            });
        }
        a = a || 2000;
        var c = this,
            d = c.tscroll.get(),
            e = moment();
        c.tscroll.debug();
        $("#timescroll").one("click mousedown touchstart", function () {
            c.stop();
        });
        b();
        $("#play_tide").addClass("hide");
        $("#pause_tide").removeClass("hide");
    },
    stop: function () {
        this._timeout && cancelAnimationFrame(this._timeout);
        $("#pause_tide").addClass("hide");
        $("#play_tide").removeClass("hide");
    },
});
WG.FcstLayer.mapProOnly = function (a) {
    WG.window({
        src: "/snippets/map_pro_only.php?id_model=" + a.id_model,
        title: "PRO users only",
    });
    WG.gae("popup", "open", "map pro only");
};
WG.AniStep = $class({
    constructor: function (a, b, c) {
        this.fcstAnimation = a;
        this.nr = b;
        this.hr = c;
        this.json = null;
        this.ready = $.Deferred();
        this._ready = !1;
        this._di_arr = [];
    },
    loadName: function (a) {
        var b = this,
            c = this.fcstAnimation,
            d = $.Deferred();
        this.loadJson().then(function () {
            var e = {};
            e.ani_frame = b.nr;
            b._di_arr[a] = new WG.DataImage(a, b.json, e);
            b._di_arr[a].load(c.wgmodel.getTileDir(b.hr) + "/" + a + "_" + c.wgmodel.getHrRawStr(b.hr) + "." + c.options.quality).then(function () {
                d.resolve();
            });
        });
        return d;
    },
    load: function () {
        if (this.fcstAnimation._error || this._ready) return this.ready;
        for (var a = this.fcstAnimation.map_options.files, b = this, c = [], d = 0; d < a.length; d++) c[d] = this.loadName(a[d]);
        $.when.apply($, c).then(function () {
            b._ready = !0;
            b.ready.resolve();
        });
        return this.ready;
    },
    isReady: function () {
        return this._ready;
    },
    loadJson: function () {
        var a = this,
            b = $.Deferred();
        if (a.json) return b.resolve(), b;
        var c = this.fcstAnimation.wgmodel.getMapsJson(this.hr);
        $.getJSON(c, function (c) {
            a.json = c;
            b.resolve();
        });
        return b;
    },
    anyDataImage: function () {
        var a = Object.keys(this._di_arr)[0];
        return this._di_arr[a];
    },
});
WG.AniStepTiled = $class({
    Extends: WG.AniStep,
    constructor: function (a, b, c) {
        this.fcstAnimation = a;
        this.nr = b;
        this.hr = c;
        this.json = null;
        this.ready = $.Deferred();
        this._ready = !1;
        this.wtl = null;
        this.wtl_ready = $.Deferred();
        this._di_arr = [];
        this._di_arr_tiles = [];
    },
    reset: function () {
        this.ready = $.Deferred();
        this._ready = !1;
        this._di_arr_tiles = [];
    },
    _cutvis: function () {
        for (var a = this.fcstAnimation._wtl, b = 0; b < a.files.length; b++) {
            var c = a.files[b];
            this._di_arr[c] = a.cutVisible(c, this._di_arr_tiles[c], !0);
        }
    },
    load: function (a, b) {
        function c(a, b, c) {
            var d = $.Deferred(),
                f = new WG.DataImage(b, e.json, {});
            f.load(a);
            e._di_arr_tiles[b] || (e._di_arr_tiles[b] = []);
            e._di_arr_tiles[b][c] = f;
            f.whenReady(function () {
                d.resolve();
            });
            return d;
        }
        var d = this.fcstAnimation;
        if (d._error || this._ready) return this.ready;
        var e = this;
        d = this.fcstAnimation;
        var f = d._wtl,
            g = d._fcst_map.map,
            h = this.hr;
        f.model.getTileDir(h);
        f.model.getHrRaw(h);
        var k = [];
        e.loadJson().then(function () {
            for (var p = 0; p < f.files.length; p++)
                for (var q = f.files[p], n = f.tileVisible(q, g), m = 0; m < n.length; m++)
                    for (var t = 0; t < n[m].length; t++) {
                        var w = n[m][t];
                        if (f.validFile(w.file_x, w.file_y)) {
                            var B = f.diArrKey(w.tile_x, w.tile_y);
                            w = f.model.getTileDir(h) + "/datatile/" + f.model.getHrRaw(h) + "/" + q + "/" + w.file_z + "/" + w.file_x + "/" + w.file_y + "." + f.quality;
                            k.push(c(w, q, B));
                        }
                    }
            $.when.apply($, k).then(function () {
                e._cutvis();
                e._ready = !0;
                d._loads_done++;
                a &&
                    a
                        .find(".spinner-desc")
                        .empty()
                        .append(WG.ttStr(3655, 2, "Loading animation...", "", "64", "@@@") + " " + Math.round((100 * d._loads_done) / b) + "%");
                e.ready.resolve();
            });
        });
        return this.ready;
    },
    makeWtl: function () {
        var a = this,
            b = this.fcstAnimation,
            c = $.Deferred();
        if (b._error) return c;
        this.loadJson().then(function () {
            a.wtl = new WG.WeatherTileLayer({
                render: !1,
                dir: b.wgmodel.getTileDir(a.hr) + "/datatile/",
                quality: b.options.quality,
                hr: b.wgmodel.getHrRaw(a.hr),
                param: b.map_options.files[0],
                files: b.map_options.files,
                glfn: b.map_options.glfn,
                colors: b.map_options.colors,
                info: a.json,
                model: b.wgmodel,
                subdomains: "abcd",
                minZoom: 1,
                maxNativeZoom: b.wgmodel.zoom_data_tiles[1],
                maxZoom: 15,
                attribution: '&copy; <a href="http://www.windguru.cz">Windguru</a> ' + b.wgmodel.model_name,
                bounds: L.latLngBounds([b.wgmodel.lat[0], b.wgmodel.lon[0]], [b.wgmodel.lat[1], b.wgmodel.lon[1]]),
            });
            c.resolve();
        });
        return c;
    },
});
WG.DataImageAni = $class({
    constructor: function (a, b) {
        this._di_arr = b;
    },
});
WG.FcstAnimation = $class({
    Extends: WG.FcstLayer,
    constructor: function (a, b) {
        this.options = b = $.extend(
            {},
            {
                hr: 0,
                quality: "jpg",
                opacity: 1,
                timezone: "UTC",
                frame_speed: 500,
                mouse_data_throttle: 100,
                mouse_data_ani_throttle: 200,
                log_fps: !1,
                minZoom: 3,
                maxZoom: 12,
                preload: 5,
                map_type_control: !0,
                model_control: !0,
                options_control: !0,
                help_control: !0,
                options_speed: !0,
                guide: !1,
            },
            b
        );
        b = this.wgmodel = a;
        if (!b.mapExists(this.options.param)) {
            var c = b.mapExists(this.options.param, 6);
            c || (c = b.maps[0].id);
            this.options.param = c;
        }
        this._last_nr1 = this._last_nr0 = 0;
        this._ready = !1;
        this._aniSteps = [];
        for (var d = 0; d < b.hours.length; d++) (c = b.hours[d]), this._aniSteps.push(new WG.AniStep(this, this._aniSteps.length, c));
        (this.map_options = a.getMap(this.options.param))
            ? (this.options.param_options.isobars &&
                  b.mapFileExists("press") &&
                  (0 > this.map_options.files.indexOf("press") && this.map_options.files.push("press"),
                  (this.map_options.contours = {
                      texture: "press",
                      colors: "press_maps_contours",
                      col: "r",
                      opacity: 1,
                      step1: 1,
                      step2: 10,
                      thick1: 1,
                      thick2: 1.8,
                  })),
              (this.options.param_options.barbs || this.options.param_options.particles || this.options.param_options.arrows) && b.mapFileExists("wind") && 0 > this.map_options.files.indexOf("wind") && this.map_options.files.push("wind"))
            : (this._error = !0);
    },
    getRequired: function (a) {
        var b = this.hrFloor(this.getHr()),
            c = this.hr2nr(b);
        b = [];
        if (this.options.preload) for (b.push(c), a = a ? 2 : this.options.preload; b.length < a; ) c++, c >= this._aniSteps.length && (c = 0), b.push(c);
        else for (a = 0; a < this._aniSteps.length; a++) b.push(a);
        return b;
    },
    selectColors: function (a) {
        var b = this,
            c = b._fcst_map;
        WG.colorSelect(b._ani_overlay.options.colors[0], !0, function (a) {
            b._ani_overlay._init_wgl();
            b._ani_overlay.refresh();
            c._controls.options.close();
        });
    },
    loadRequired: function (a) {
        var b = this.hrFloor(this.getHr());
        this.hr2nr(b);
        var c = this,
            d = [],
            e = 0,
            f = $.Deferred();
        if (this.aniReady(b)) return f.resolve(), f;
        var g = this.getRequired();
        for (b = 0; b < g.length; b++) {
            var h = this._aniSteps[g[b]];
            h.isReady() ||
                ((c._loading = !0),
                (h = h.load()),
                h.then(function () {
                    e++;
                    a &&
                        a
                            .find(".spinner-desc")
                            .empty()
                            .append(WG.ttStr(3655, 2, "Loading animation...", "", "64", "@@@") + " " + Math.round((100 * e) / g.length) + "%");
                }),
                d.push(h));
        }
        d.length
            ? $.when.apply($, d).then(function () {
                  f.resolve();
                  c._loading = !1;
                  c.options.preload || (c._ready = !0);
                  c._ready = !0;
              })
            : (f.resolve(), c.options.preload || (c._ready = !0), (c._ready = !0));
        return f;
    },
    loadHr: function (a) {
        a = this._aniSteps[this.hr2nr(a)];
        return a.isReady() ? a.ready : a.load();
    },
    paramOptionsCheck: function () {
        this.wgmodel.wave && this.options.param_options.barbs && ((this.options.param_options.barbs = !1), (this.options.param_options.arrows = !0), (this.options.param_options.particles = !1));
    },
    add: function (a) {
        var b = this,
            c = a.map;
        b._map = c;
        b._fcst_map = a;
        var d = (b._hr_ani = b.options.hr),
            e = this.hr2nr(d);
        c.setMaxZoom(b.options.maxZoom);
        c.setMinZoom(b.options.minZoom);
        this.wgmodel.loadMask().then(function () {
            b.loadHr(d).then(function () {
                var d = b._aniSteps[e]._di_arr,
                    g = b._aniSteps[e].anyDataImage().getBounds();
                b.options.param_options.arrows ? (b.map_options.arrows = !0) : b.options.param_options.barbs && (b.map_options.barbs = !0);
                b.map_options.mask = b.wgmodel.mask;
                b._ani_overlay = new WG.WeatherOverlay(d, g, b.map_options);
                a.WG_layers.forecast = b._ani_overlay.addTo(c);
                if (b.options.param_options.particles && !b.wgmodel.wave) {
                    var h = new WG.ParticleOverlay(d, g, {
                        mask: b.wgmodel.mask,
                    });
                    h.addTo(c);
                    a.WG_layers.forecast_particles = h;
                }
                b.options.param_options.particles &&
                    b.wgmodel.wave &&
                    ((h = {
                        datafile: b.map_options.files[0],
                        dirfile: b.map_options.files[1],
                        speedFactor: 0.5,
                        dropRateBump: 0.04,
                        minSpeed: 4,
                        zIndex: -1,
                        colors: WG.getMapsPalette("wparticles"),
                    }),
                    b.wgmodel.mask && (h.mask = b.wgmodel.mask),
                    (h = new WG.ParticleOverlay(d, g, h)),
                    h.addTo(c),
                    (a.WG_layers.forecast_particles = h));
                b.zoomChanged();
                b._refresh();
                b.mouseData(!0);
                b.dataMarker(!0);
                b.pulseStepButtons();
                b.options.guide && ((b.options.guide = !1), WG.showGuideFcstMaps());
            });
        });
        b.paramOptionsCheck();
        b.controlsOn();
        b.aniEventsOn();
        $(window).on("WG:stop", this, this._on_wg_stop);
    },
    pulseStepButtons: function () {
        $(".step_bar").on("click", function () {
            var a = $(this);
            a.removeClass("click_pulse");
            a.width();
            a.addClass("click_pulse");
            setTimeout(function () {
                a.removeClass("click_pulse");
            }, 1000);
        });
    },
    controlsOn: function () {
        var a = this,
            b = a._fcst_map;
        a.updateTimeMenu();
        a.keyboardShortcuts();
        a = this;
        if (this.options.map_type_control) {
            var c = a.options.param.substr(2);
            b._controls.map_type && b._controls.map_type.remove();
            var d =
                '<ul class="sm sm-simple sm-simple-vertical sm-vertical"><li><a data-fn="showSpots" href="javascript:void(0);"><svg class="icon"><use xlink:href="#ico_spot_map"></use></svg> Spots</a></li><li><a data-fn="showStations" href="javascript:void(0);"><svg class="icon"><use xlink:href="#ico_station_map"></use></svg> Stations</a></li><li class="bottom-separator"><a data-fn="showTide" href="javascript:void(0);"><svg class="icon"><use xlink:href="#ico_tide"></use></svg> Tides</a></li>';
            for (var e = this.wgmodel.maps, f = 0; f < e.length; f++)
                d += '<li><a data-id="' + e[f].id + '" data-param_option="' + (e[f].option || "") + '" href="javascript:void(0);"><svg class="icon"><use xlink:href="#ico_' + e[f].icon + '"></use></svg> ' + e[f].name + "</a></li>";
            d = $(d + "</ul>");
            d.find("a").on("click", function () {
                var a = $(this).data("fn");
                if (a) b.removeLayers(["cdb"]), b.removeForecasts(), b[a]({}, !0);
                else if ((a = $(this).data("id"))) {
                    var c = $(this).data("param_option");
                    a.substr(2);
                    b.forecast
                        ? b.updateForecast({
                              param: a,
                              param_option: c,
                              set_time: b.getMapTime(),
                              animation: !1,
                          })
                        : b.showForecast({
                              param: a,
                              param_option: c,
                              set_time: b.getMapTime(),
                              animation: !1,
                          });
                }
            });
            b._controls.map_type = new WG.WgJboxControl({
                text: WgUtil.getLangText("maps", c),
                icon: "ico_" + WgUtil.getLangText("mapsi", c),
                position: "bottomright",
                title: WG.ttStr(3656, 2, "Select map", "", "64", "@@@"),
                content: d,
                guide: "fmaps-map-type.php",
                guide_priority: 1,
            }).addTo(a._map);
        }
        if (this.options.model_control) {
            var g = function () {
                var c = WG.mapmodels,
                    d = [],
                    e;
                for (e in c) d[d.length] = c[e];
                d.sort(WG.Model.sortFn);
                var f = '<ul class="sm sm-simple sm-simple-vertical sm-vertical">';
                for (e = 0; e < d.length; e++) {
                    var g = d[e];
                    g.bounds && g.bounds.intersects(a._map.getBounds()) && g.maps && (f += '<li><a data-id="' + g.id_model + '" data-pro="' + g.pro + '" href="javascript:void(0);">' + g.longname + "</a></li>");
                }
                d = $(f + "</ul>");
                d.find("a").on("click", function () {
                    var a = $(this).data("id");
                    $(this).data("pro") && !WG.user.pro
                        ? (b._controls.model.close(), WG.FcstLayer.mapProOnly(c[a]))
                        : b.updateForecast({
                              id_model: a,
                              set_time: b.getMapTime(),
                              animation: !1,
                          });
                });
                return d;
            };
            b._controls.model && b._controls.model.remove();
            b._controls.model = new WG.WgJboxControl({
                text: a.wgmodel.model_name,
                icon: "ico_model_selection",
                position: "bottomright",
                title: WG.ttStr(3657, 2, "Select model", "", "64", "@@@"),
                content: "",
                guide: "fmaps-model.php",
                guide_priority: 1,
                click: function (a) {
                    var b = g();
                    a.setContent(b);
                },
            }).addTo(a._map);
        }
        if (this.options.options_control) {
            var h = function () {
                var a = [];
                k.prop("checked") && a.push("particles");
                p.prop("checked") && a.push("barbs");
                n.prop("checked") && a.push("isobars");
                q.prop("checked") && a.push("arrows");
                b.updateForecast({
                    param_option: a.join(","),
                    set_time: b.getMapTime(),
                });
            };
            c = a.options.param_options;
            $.extend({}, c);
            a.wgmodel.wave
                ? ((d =
                      '<div class="wg-jbox-padding no-text-select"><form class="wg-form"><label class="onoff"><input type="checkbox" class="o-particles" name="particles" ' +
                      (c.particles ? "checked" : "") +
                      ' value="1"/><svg class="icon off"><use xlink:href="#ico_off"></use></svg><svg class="icon on"><use xlink:href="#ico_on_color"></use></svg> ' +
                      WG.ttStr(3658, 2, "Particles", "", "64", "@@@") +
                      "</label>"),
                  (d +=
                      '<label class="onoff"><input type="checkbox" class="o-arrows" name="arrows" ' +
                      (c.arrows ? "checked" : "") +
                      ' value="1"/><svg class="icon off"><use xlink:href="#ico_off"></use></svg><svg class="icon on"><use xlink:href="#ico_on_color"></use></svg> ' +
                      WG.ttStr(3659, 2, "Arrows", "", "64", "@@@") +
                      "</label>"))
                : ((d =
                      '<div class="wg-jbox-padding no-text-select"><form class="wg-form"><label class="onoff"><input type="checkbox" class="o-particles" name="particles" ' +
                      (c.particles ? "checked" : "") +
                      ' value="1"/><svg class="icon off"><use xlink:href="#ico_off"></use></svg><svg class="icon on"><use xlink:href="#ico_on_color"></use></svg> Wind particles</label><label class="onoff"><input type="checkbox" class="o-barbs" name="barbs" ' +
                      (c.barbs ? "checked" : "") +
                      ' value="1"/><svg class="icon off"><use xlink:href="#ico_off"></use></svg><svg class="icon on"><use xlink:href="#ico_on_color"></use></svg> ' +
                      WG.ttStr(3501, 2, "Wind barbs", "", "64", "@@@") +
                      "</label>"),
                  (d +=
                      '<label class="onoff"><input type="checkbox" class="o-arrows" name="arrows" ' +
                      (c.arrows ? "checked" : "") +
                      ' value="1"/><svg class="icon off"><use xlink:href="#ico_off"></use></svg><svg class="icon on"><use xlink:href="#ico_on_color"></use></svg> ' +
                      WG.ttStr(3660, 2, "Wind arrows", "", "64", "@@@") +
                      "</label>"));
            a.wgmodel.mapFileExists("press") &&
                (d +=
                    '<label class="onoff"><input type="checkbox" class="o-isobars" name="isobars" ' +
                    (c.isobars ? "checked" : "") +
                    ' value="1"/><svg class="icon off"><use xlink:href="#ico_off"></use></svg><svg class="icon on"><use xlink:href="#ico_on_color"></use></svg> ' +
                    WG.ttStr(3499, 2, "Isobars", "", "64", "@@@") +
                    "</label>");
            if (this.options.options_speed) {
                d += '<label class="">' + WG.ttStr(3661, 2, "Animation speed", "", "64", "@@@") + ':<br><select style="width: 150px" class="o-speed" name="speed">';
                c = [0.5, 1, 2, 3, 4, 5];
                for (f = 0; f < c.length; f++) d += '<option value="' + Math.round(1000 / c[f]) + '" ' + (Math.round(1000 / c[f]) == a.options.frame_speed ? "selected" : "") + ">" + c[f] + " frames/sec</option>";
                d += "</select></label>";
            }
            d +=
                '<button class="wide o-colors" style="margin-bottom: 0px;"><svg class="icon inbutton"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ico_edit"></use></svg> ' +
                WG.ttStr(3619, 2, "Select colors", "", "64", "@@@") +
                "</button>";
            d = $(d + "</form></div>");
            var k = d.find(".o-particles"),
                p = d.find(".o-barbs"),
                q = d.find(".o-arrows"),
                n = d.find(".o-isobars"),
                m = d.find(".o-speed");
            c = d.find(".o-colors");
            k.on("change", function () {
                p.prop("checked") && p.prop("checked", !1);
                q.prop("checked") && q.prop("checked", !1);
                h();
            });
            p.on("change", function () {
                k.prop("checked") && k.prop("checked", !1);
                q.prop("checked") && q.prop("checked", !1);
                h();
            });
            q.on("change", function () {
                p.prop("checked") && p.prop("checked", !1);
                k.prop("checked") && k.prop("checked", !1);
                h();
            });
            n.on("change", function () {
                h();
            });
            m.on("change", function () {
                a.setSpeed(m.val());
            });
            c.on("click", function () {
                a.selectColors(0);
                return !1;
            });
            b._controls.options = new WG.WgJboxControl({
                text: "Options",
                icon: "ico_options",
                position: "bottomright",
                title: "Map options",
                content: d,
                guide: "fmaps-options.php",
                guide_priority: 1,
            }).addTo(a._map);
        }
        this.options.help_control &&
            (b._controls.help = new WG.WgControl({
                text: "",
                icon: "ico_help",
                position: "bottomright",
                css: "help-control",
                click: function (a) {
                    a.stopPropagation();
                    WG.showGuideFcstMaps();
                },
            }).addTo(a._map));
    },
    controlsOff: function () {
        var a = this._fcst_map,
            b;
        for (b in a._controls) a._controls[b].remove();
        a.hideTimeMenu();
    },
    _on_wg_stop: function (a) {
        WG.log("WG:stop => WG.ParticleOverlay.stop();");
        a.data.stop();
    },
    zoomChanged: function () {
        var a = this.map_options.contours || !1;
        if (a) {
            var b = this._fcst_map.map.getZoom(),
                c = a.step1,
                d = a.step2;
            5 >= b && (c = 2 * a.step1);
            7 <= b && ((c = a.step1 / 2), (d = a.step2 / 2));
            this._ani_overlay && this._ani_overlay.setContourSteps(c, d);
        }
    },
    reset: function () {},
    aniEventsOn: function () {
        var a = this,
            b = this._fcst_map.map;
        this._event_zs = function () {
            a.stop();
        };
        this._event_ms = function () {
            a.stop(!0);
        };
        this._event_meze = function () {
            a.reset();
            a.zoomChanged();
        };
        b.on("zoomstart", a._event_zs, a);
        b.on("moveend zoomend", a._event_meze, a);
    },
    aniEventsOff: function () {
        var a = this._fcst_map.map;
        a.off("zoomstart", this._event_zs, this);
        a.off("movestart", this._event_ms, this);
        a.off("moveend zoomend", this._event_meze, this);
    },
    hr2nr: function (a) {
        var b = this._aniSteps;
        a = this.hrRound(a);
        for (var c = 0; c < b.length && !(parseInt(b[c].hr) >= a); c++);
        return c;
    },
    hrRound: function (a) {
        return this.wgmodel.hrRound(a);
    },
    hrFloor: function (a) {
        return this.wgmodel.hrFloor(a);
    },
    getStep: function (a) {
        return this._aniSteps[this.hr2nr(a)];
    },
    hr2nrmix: function (a) {
        var b = this._aniSteps;
        a = parseFloat(a);
        var c = this.hrFloor(a);
        c = this.hr2nr(c);
        var d = c + 1;
        d >= b.length ? ((d = c), (a = 0)) : (a = (a - b[c].hr) / (b[d].hr - b[c].hr));
        return [c, d, a];
    },
    stop: function (a) {
        this._move_stopped = a && this._running ? !0 : !1;
        this._running = !1;
        this.timeout && (cancelAnimationFrame(this.timeout), (this.timeout = !1), this._ani_overlay.wgl.logFpsStop());
        this.button_play(!1);
    },
    loadPause: function () {
        this.timeout && (cancelAnimationFrame(this.timeout), (this.timeout = !1), this._ani_overlay.wgl.logFpsStop());
    },
    play: function () {
        this.start(this.getHr());
    },
    mouseData: function (a) {
        if (!WG.isTouchDevice()) {
            var b = this._fcst_map.map;
            this._mouseMoveFn_throttle || (this._mouseMoveFn_throttle = WG.throttle(this._mouseMoveFn, this.options.mouse_data_throttle));
            WG._data_jbox ||
                ((WG._data_jbox = new jBox("Mouse", {
                    attach: this._fcst_map.$,
                    zIndex: 11000,
                    content: "Data",
                    position: {
                        x: "right",
                        y: "top",
                    },
                    offset: 10,
                    repositionOnContent: !1,
                })),
                (WG._data_jbox_close = function () {
                    setTimeout(function () {
                        WG._data_jbox.close();
                    }, 100);
                }),
                (WG._data_jbox_open = function () {
                    setTimeout(function () {
                        WG._data_jbox.open();
                    }, 100);
                }));
            var c = $("#" + this._fcst_map.$.attr("id"));
            a
                ? (b.on("mousemove", this._mouseMoveFn_throttle, this),
                  (this._aniDataProbe_fn = this._mouseMoveFn_throttle),
                  WG._data_jbox.open(),
                  c.css("cursor", "crosshair"),
                  c.on("mouseout", WG._data_jbox_close),
                  c.on("mouseover", WG._data_jbox_open))
                : (WG._data_jbox.close(), c.css("cursor", "auto"), c.off("mouseout", WG._data_jbox_close), c.off("mouseover", WG._data_jbox_open), b.off("mousemove", this._mouseMoveFn_throttle, this), (this._aniDataProbe_fn = !1));
        }
    },
    aniDataProbe: function () {
        this._aniDataProbe_fn &&
            this._aniDataProbe_fn(
                {
                    latlng: this.last_data_latlng,
                },
                !0
            );
    },
    mouseDataAni: function (a) {
        if (!WG.isTouchDevice()) {
            var b = this._fcst_map.map;
            this._mouseMoveFn_ani_throttle || (this._mouseMoveFn_ani_throttle = WG.throttle(this._mouseMoveFnAni, this.options.mouse_data_ani_throttle));
            if (a) b.on("mousemove", this._mouseMoveFn_ani_throttle, this);
            else b.off("mousemove", this._mouseMoveFn_ani_throttle, this);
        }
    },
    getDiArrDisplay: function () {
        return this._di_arr_display;
    },
    setDiArrDisplay: function (a) {
        this._di_arr_display = a;
    },
    getDataLatLng: function (a) {
        var b = this._fcst_map.map,
            c = [],
            d = this.getDiArrDisplay(),
            e;
        for (e in d) {
            var f = d[e].getDataLatLng(b, a, this.wgmodel.mask),
                g;
            for (g in f) c[g] = f[g];
        }
        return c;
    },
    getDataLatLngStr: function (a) {
        a = this.getDataLatLng(a);
        for (var b = "WINDSPD GUST WINDDIR TMP TCDC APCP APCP1 SLP HTSGW PERPW DIRPW SWELL1 SWPER1 SWDIR1 SWELL2 SWPER2 SWDIR2 WVHGT WVPER WVDIR".split(" "), c = "", d, e, f = 0; f < b.length; f++) {
            var g = b[f];
            if (-1 == a.indexOf(g) && !isNaN(a[g])) {
                var h = a[g],
                    k = !1;
                d = "";
                if ((e = WG.Var.getSetting("unit_type", g)))
                    (d = WG.Var.getSetting("unit_type_var", e)), (d = WG.user[d]), (h = WgUtil.unitConvert(h, d)), "msd" == d && (k = !0), (e = WgLang.units ? (WgLang.units[d] ? WgLang.units[d] : "") : ""), (d = e || d);
                d || (d = WG.Var.getSetting("unit_fixname", g));
                e = WG.Var.getSetting("precision", g) || 0;
                k && (e = 1);
                c = "GUST" == g ? c + ("(" + WG.round(h, e) + " " + d + ")<br>") : c + ("" + WG.round(h, e) + " " + d + "<br>");
            }
        }
        b = WG.Var.getSetting("unit_fixname", "PWEN");
        a.HTSGW && a.PERPW
            ? (c += "" + WG.Var.waveEnergy(a.HTSGW, a.PERPW) + " " + b + "<br>")
            : a.SWELL1 && a.SWPER1
            ? (c += "" + WG.Var.waveEnergy(a.SWELL1, a.SWPER1) + " " + b + "<br>")
            : a.SWELL2 && a.SWPER2
            ? (c += "" + WG.Var.waveEnergy(a.SWELL2, a.SWPER2) + " " + b + "<br>")
            : a.WVHGT && a.WVPER && (c += "" + WG.Var.waveEnergy(a.WVHGT, a.WVPER) + " " + b + "<br>");
        return c;
    },
    svgAimIcon: function () {
        return L.divIcon({
            className: "",
            iconSize: [25, 74],
            popupAnchor: [0, -10],
            tooltipAnchor: [10, -10],
            iconAnchor: [12, 12],
            html:
                '<svg version="1.1" y="0px" x="0px" viewBox="0 0 25 74">\n <circle stroke="#000" cy="12.331" cx="12.522" r="7.127" fill="none"/>\n <path d="m12.5 9.9927v-8.985" stroke="#000" stroke-linecap="round" fill="none"/>\n <path d="m2.5069 12.5h7.4862v0" stroke="#000" stroke-linecap="round" fill="none"/>\n <circle r="12" fill-rule="evenodd" fill-opacity=".25" stroke="#000" cy="61.5" cx="12.5" fill="#1a1a1a"/>\n <path d="m15.007 12.5h7.4862v0" stroke="#000" stroke-linecap="round" fill="none"/>\n <path d="m12.531 49-0.031-33.994v0" stroke="#000" stroke-linecap="round" fill="none"/>\n</svg>\n',
        });
    },
    _dataMarkerMake: function (a) {
        var b = this._fcst_map.map,
            c = this;
        if (!c._data_marker) {
            this._fcst_map.clickmarker && this._fcst_map.clickmarker.remove();
            var d = (c._data_marker = L.marker(a.latlng, {
                icon: c.svgAimIcon(),
                draggable: !0,
                zIndexOffset: 1000,
            }).addTo(b));
            d.bindTooltip("Data", {
                direction: "top",
                permanent: !0,
            }).openTooltip();
            a = WG.throttle(function () {
                if (c._data_marker) {
                    var a = c.getDataLatLngStr(c._data_marker.getLatLng());
                    c._data_marker.setTooltipContent(a);
                }
            }, 100);
            this._aniDataProbe_fn || (this._aniDataProbe_fn = a);
            a();
            d.on("drag", a);
            d.on("click", function () {
                d.remove();
                delete c._data_marker;
                c._aniDataProbe_fn = !1;
            });
        }
    },
    dataMarker: function (a) {
        if (WG.isTouchDevice()) {
            var b = this._fcst_map.map;
            a ? b.on("click", this._dataMarkerMake, this) : b.off("click", this._dataMarkerMake, this);
        }
    },
    _mouseMoveFn: function (a, b) {
        if (WG._data_jbox) {
            var c = this._fcst_map.map;
            (this.last_data_latlng && !b && c.distance(a.latlng, this.last_data_latlng) < (1000 * this.wgmodel.resolution) / 20) ||
                ((this.last_data_latlng = a.latlng), this.getDataLatLng(a.latlng), (a = this.getDataLatLngStr(a.latlng)), WG._data_jbox.setContent(a), a ? WG._data_jbox.open() : WG._data_jbox.close());
        }
    },
    _mouseMoveFnAni: function (a) {
        var b = this._fcst_map.map;
        if (this.isReady()) {
            if (this.last_data_ani_latlng && ((b = b.distance(a.latlng, this.last_data_ani_latlng)), b < (1000 * this.wgmodel.resolution) / 5)) {
                WG.log("DISTANCE _mouseMoveFnAni", b);
                return;
            }
            this.last_data_ani_latlng = a.latlng;
            return [];
        }
    },
    button_play: function (a) {
        a ? ($("#play").addClass("hide"), $("#pause").removeClass("hide")) : ($("#pause").addClass("hide"), $("#play").removeClass("hide"));
    },
    start: function (a) {
        var b = this;
        if (!this._error)
            if (this.aniReady(a)) this._storeHr(a), this.button_play(!0), (this._start_time = Date.now()), (this._start_hr = a), (this._last_nr = b.hr2nr(b.getHr())), b.draw(), this.options.log_fps && this._ani_overlay.wgl.logFps();
            else {
                var c = WG.spinnerOn(!1, "Loading animation...");
                this.loadRequired(c).then(function () {
                    WG.spinnerOff();
                    b.updateTimeMenu();
                    b.start(a);
                });
            }
    },
    setSpeed: function (a) {
        var b = this._running ? !0 : !1;
        this.stop();
        this.options.frame_speed = a;
        b && this.start(this.getHr());
    },
    draw: function () {
        var a = this,
            b = (Date.now() - this._start_time) / a.options.frame_speed + this._start_hr;
        b > this.wgmodel.hr_end
            ? (this.stop(),
              setTimeout(function () {
                  a.start(0);
              }, 3 * a.options.frame_speed))
            : (this._storeHr(b),
              (this._running = !0),
              (a.timeout = requestAnimationFrame(function () {
                  a._render(b);
                  var c = Math.round(b);
                  if (c != a._last_hr_bp) {
                      a._last_hr_bp = c;
                      if (!a.aniReady(c, !0)) {
                          a.loadPause();
                          c = WG.spinnerOn(!1);
                          a.loadRequired(c).then(function () {
                              WG.spinnerOff();
                              a._running && a.play();
                          });
                          return;
                      }
                      a.loadRequired();
                      a._fcst_map._time_slider && a._fcst_map._time_slider.set(b);
                  }
                  a.draw();
              })));
    },
    _render: function (a, b) {
        var c = this,
            d = c.hr2nrmix(a),
            e = d[0],
            f = d[1],
            g = d[2];
        a > this.wgmodel.hr_end && ((f = e = c._aniSteps.length - 1), (g = 1));
        c.timeout = requestAnimationFrame(function () {
            var a = c._aniSteps[e],
                d = c._aniSteps[f];
            if (!d.isReady()) {
                d = a;
                f = e;
                var p = d.hr;
                WG.log("render nr1 not ready! using nr0! hr use:", p);
            }
            a.isReady() || ((a = d), (e = f), (p = a.hr), WG.log("render nr0 not ready! using nr1! hr use:", p));
            if (d.isReady() && d.isReady()) {
                if (c._last_nr0 != e || c._last_nr1 != f || b) c.setDiArrDisplay(a._di_arr), c._ani_overlay.setMixDataImages(a._di_arr, d._di_arr), c.drawBP(e, f), (c._last_nr0 = e), (c._last_nr1 = f), c.aniDataProbe();
                c.mixBP(g);
                c._ani_overlay.render(g);
            } else WG.log("FATAL! render NOT READY!");
        });
    },
    _refresh: function () {
        this._render(this._hr_ani, !0);
    },
    updateTimeMenu: function () {
        var a = this,
            b = function () {},
            c = function () {};
        this._ready &&
            ((b = function (b) {
                a._render(b);
                a.button_play(!1);
            }),
            (c = function (b) {
                a.loadHr(b).then(function () {
                    a.setHr(b);
                    a.button_play(!1);
                });
            }));
        WG.FcstAnimation._superClass.updateTimeMenu.call(this, this._fcst_map, this._hr_ani, {
            smooth: !0,
            slideFn: b,
            slideEndFn: c,
        });
    },
    aniReady: function (a, b) {
        this.hr2nr(this.hrFloor(a));
        a = !0;
        var c = this.getRequired();
        b && (c = this.getRequired(!0));
        for (var d = 0; d < c.length; d++) (b = c[d]), this._aniSteps[b].isReady() || (a = !1);
        return a;
    },
    isReady: function (a) {
        if (void 0 === a) return this._ready;
        a = this.hr2nr(a);
        return this._aniSteps[a].isReady();
    },
    getHr: function () {
        return this._hr_ani;
    },
    getHrFloor: function () {
        return Math.floor(this._hr_ani);
    },
    getHrRound: function () {
        return Math.round(this._hr_ani);
    },
    setHr: function (a, b) {
        var c = this;
        this.stop();
        this._storeHr(a);
        c.isReady(a)
            ? (WG.log("setHR, afterload", a, b), c._render(a), c._fcst_map.setWindowTitle && c._fcst_map.setWindowTitle(c.getWindowTitle()))
            : (WG.log("setHR not ready", a),
              c.loadHr(a).then(function () {
                  c.setHr(a, !0);
              }));
    },
    _storeHr: function (a) {
        this._hr_ani = a;
        this.options.hr = this.hrRound(a);
    },
    nextHr: function (a) {
        this.stop();
        a = this.wgmodel.nextHour(this.getHrFloor(), a);
        this.setHr(a);
        this._fcst_map._time_slider && this._fcst_map._time_slider.set(a);
    },
    prevHr: function (a) {
        this.stop();
        a = this.wgmodel.prevHour(this.getHrFloor(), a);
        this.setHr(a);
        this._fcst_map._time_slider && this._fcst_map._time_slider.set(a);
    },
    drawBP: function (a, b) {
        var c = this._fcst_map.WG_layers.forecast_particles;
        c && this.options.param_options.particles && c.setDataImage(this._aniSteps[a]._di_arr, this._aniSteps[b]._di_arr);
    },
    mixBP: function (a) {
        var b = this._fcst_map.WG_layers.forecast_particles;
        b && this.options.param_options.particles && b.setMixVal(a);
    },
    remove: function (a) {
        WG.log("remove!", this._fcst_map.WG_layers);
        WG.spinnerOff();
        this._fcst_map &&
            (this.mouseData(!1),
            this.mouseDataAni(!1),
            this.stop(),
            this._windgl_frame && cancelAnimationFrame(this._windgl_frame),
            this._fcst_map._animation_button_play(!1),
            this._fcst_map._animation_buttons(!1),
            this._fcst_map.WG_layers.forecast_particles && this._fcst_map.WG_layers.forecast_particles.stopAnimation(),
            this._fcst_map.removeLayers(a ? ["wgmap", "cdb"] : []),
            this.aniEventsOff(),
            this.dataMarker(!1),
            this._data_marker && (this._data_marker.remove(), delete this._data_marker),
            WG._data_jbox && (WG._data_jbox.destroy(), delete WG._data_jbox),
            this.controlsOff(),
            $(window).on("WG:stop", this, this._on_wg_stop));
    },
});
WG.TiledFcstAnimation = $class({
    Extends: WG.FcstAnimation,
    constructor: function (a, b) {
        b = $.extend(
            {},
            {
                mouse_data_throttle: 100,
            },
            b
        );
        WG.FcstAnimation.call(this, a, b);
        this._wtl = null;
        a = this.wgmodel;
        this._aniSteps = [];
        for (b = 0; b < a.hours.length; b++) this._aniSteps.push(new WG.AniStepTiled(this, this._aniSteps.length, a.hours[b]));
    },
    add: function (a) {
        var b = this;
        b._fcst_map = a;
        var c = a.map;
        b._map = c;
        var d = (b._hr_ani = b.options.hr),
            e = this.hr2nr(d),
            f = this._aniSteps[e];
        b.paramOptionsCheck();
        this.wgmodel.loadMask().then(function () {
            b.loadHr(d).then(function () {
                var d = f.wtl;
                d.setRender(!1);
                d.addTo(c);
                a.WG_layers.forecast_tile_src = d;
                b._wtl = d;
                b.setDiArrDisplay(d._di_arr_display);
                b.wgmodel.mask && (b.map_options.mask = b.wgmodel.mask);
                b.options.param_options.arrows ? (b.map_options.arrows = !0) : b.options.param_options.barbs && (b.map_options.barbs = !0);
                b._ani_overlay = new WG.WeatherOverlayTiled(d, c.getBounds(), b.map_options);
                b._ani_overlay.addTo(c);
                b._fcst_map.WG_layers.forecast_ani = b._ani_overlay;
                if (b.options.param_options.particles && !b.wgmodel.wave) {
                    var e = {
                        datafile: "wind",
                    };
                    b.wgmodel.mask && (e.mask = b.wgmodel.mask);
                    e = new WG.ParticleOverlayTiled(d, c.getBounds(), e);
                    e.addTo(c);
                    a.WG_layers.forecast_particles = e;
                }
                b.options.param_options.particles &&
                    b.wgmodel.wave &&
                    ((e = {
                        datafile: b.map_options.files[0],
                        dirfile: b.map_options.files[0],
                        speedcolor: "r",
                        dircolor: "b",
                        speedFactor: 0.5,
                        dropRateBump: 0.04,
                        minSpeed: 4,
                        zIndex: -1,
                        colors: WG.getMapsPalette("wparticles"),
                    }),
                    b.wgmodel.mask && (e.mask = b.wgmodel.mask),
                    (e = new WG.ParticleOverlayTiled(d, c.getBounds(), e)),
                    e.addTo(c),
                    (a.WG_layers.forecast_particles = e));
                b.zoomChanged();
                b._refresh();
                setTimeout(function () {
                    b._ani_overlay.refresh();
                }, 100);
                b.mouseData(!0);
                b.dataMarker(!0);
                b.pulseStepButtons();
                b.options.guide && ((b.options.guide = !1), WG.showGuideFcstMaps());
            });
        });
        b.controlsOn();
        b.aniEventsOn();
        $(window).on("WG:stop", this, this._on_wg_stop);
    },
    aniEventsOn: function () {
        var a = this,
            b = this._fcst_map.map;
        this._event_zs = function () {
            a.stop();
        };
        this._event_ms = function () {
            a.stop(!0);
        };
        this._event_meze = function () {
            a.reset();
            a.zoomChanged();
        };
        b.on("zoomstart", a._event_zs, a);
        b.on("movestart", a._event_ms, a);
        b.on("moveend zoomend", a._event_meze, a);
    },
    remove: function (a) {
        this._fcst_map.map.off("moveend zoomend", this.reset, this);
        WG.TiledFcstAnimation._superClass.remove.call(this, a);
    },
    setHr: function (a, b) {
        var c = this;
        this.stop();
        this._storeHr(a);
        var d = c._fcst_map,
            e = d.map;
        b = this.hr2nr(a);
        var f = this._aniSteps[b];
        c.loadHr(a).then(function () {
            var a = d.WG_layers.forecast_tile_src;
            a && (e.removeLayer(a), a.setRender(!1));
            var b = f.wtl;
            b.setRender(!1);
            b.addTo(e);
            d.WG_layers.forecast_tile_src = b;
            c._wtl = b;
            c._ani_overlay &&
                c._ani_overlay.setSource(b).then(function () {
                    c._ani_overlay.draw();
                    c.setDiArrDisplay(b._di_arr_display);
                });
            c.options.param_options.particles && d.WG_layers.forecast_particles && d.WG_layers.forecast_particles.setSource(b).then(d.WG_layers.forecast_particles.draw());
            c._fcst_map.setWindowTitle && c._fcst_map.setWindowTitle(c.getWindowTitle());
        });
    },
    start: function (a) {
        this._error || WG.TiledFcstAnimation._superClass.start.call(this, a);
    },
    reset: function () {
        var a = !1;
        this._move_stopped && (a = !0);
        this.stop();
        this._ready = !1;
        for (var b = 0; b < this._aniSteps.length; b++) this._aniSteps[b].reset();
        this.updateTimeMenu();
        a ? this.play() : ((a = this.hrRound(this.getHrRound())), (this._wtl && a == this._wtl.hr) || this.setHr(a));
    },
    loadHr: function (a) {
        return this._aniSteps[this.hr2nr(a)].makeWtl();
    },
});
WG.rgToKts = function (a, b, c, d) {
    a = ((c[1] - c[0]) / 255) * (a - 1) + c[0];
    b = ((d[1] - d[0]) / 255) * (b - 1) + d[0];
    return Math.sqrt(a * a + b * b);
};
WG.rgToDeg = function (a, b, c, d) {
    a = (180 * Math.atan2(((c[1] - c[0]) / 255) * (a - 1) + c[0], ((d[1] - d[0]) / 255) * (b - 1) + d[0])) / Math.PI + 180;
    360 <= a && (a -= 360);
    return a;
};
WG.getColorIndicesForCoord = function (a, b, c) {
    a = 4 * b * c + 4 * a;
    return [a, a + 1, a + 2, a + 3];
};
WG.getPixelColor = function (a, b, c) {
    var d = a.data;
    a = WG.getColorIndicesForCoord(b, c, a.width);
    return [d[a[0]], d[a[1]], d[a[2]], d[a[3]]];
};
WG.GL = $class({
    constructor: function (a) {
        a = this.options = $.extend(
            {},
            {
                gl: null,
                offscreen: !1,
                scaling: 1,
                cut_px: 0,
                canvas: null,
            },
            a
        );
        this._log_timing = !1;
        this.height = this.width = 0;
        this.scaling = this.options.scaling;
        a.offscreen
            ? ((this.gl = this.getContext(WG.GL.canvas_off)), (this.canvas = WG.GL.canvas_off))
            : a.canvas
            ? ((this.gl = this.getContext(a.canvas)), (this.canvas = a.canvas))
            : ((this.gl = this.getContext(WG.GL.canvas)), (this.canvas = WG.GL.canvas));
        this._program = null;
        this.setTextureFilter("LINEAR");
    },
    vs: function () {
        return "\n            void main(void) {\n            }\n        ";
    },
    fs: function () {
        return "\n            void main(void) {\n                gl_FragColor = vec4(0.,0.,0.,1.);\n            }\n        ";
    },
    gl_extensions: function () {
        return "\n            #ifdef GL_OES_standard_derivatives\n            #extension GL_OES_standard_derivatives : enable\n            #endif\n        ";
    },
    getContext: function (a) {
        this.timeStart("webgl context");
        if (this.gl) return WG.log("getContext REUSE context..."), this.gl;
        if (a._gl_context_cached) return WG.log("getContext REUSE CACHED context..."), a._gl_context_cached;
        WG.log("getContext NEW context...");
        var b = a.getContext("webgl", {
            premultipliedAlpha: !1,
        });
        b ||
            (b = a.getContext("experimental-webgl", {
                premultipliedAlpha: !1,
            }));
        this.gl = b;
        b.disable(b.DEPTH_TEST);
        b.disable(b.STENCIL_TEST);
        this.timeEnd("webgl context");
        return (a._gl_context_cached = b);
    },
    program: function (a, b, c) {
        this.timeStart("program");
        c = this.gl;
        c.getExtension("OES_standard_derivatives");
        c.getExtension("OES_texture_float");
        c.getExtension("OES_texture_float_linear");
        var d = c.createProgram(),
            e = c.createShader(c.VERTEX_SHADER),
            f = c.createShader(c.FRAGMENT_SHADER);
        c.shaderSource(e, a);
        c.shaderSource(f, b);
        c.compileShader(e);
        c.compileShader(f);
        if (!c.getShaderParameter(e, c.COMPILE_STATUS)) return (a = c.getShaderInfoLog(e)), console.error(a), null;
        if (!c.getShaderParameter(f, c.COMPILE_STATUS)) return (a = c.getShaderInfoLog(f)), console.error(a), null;
        c.attachShader(d, e);
        c.attachShader(d, f);
        c.linkProgram(d);
        this.timeEnd("program");
        return d;
    },
    use: function (a) {
        this._program = a;
        this.gl.useProgram(a);
    },
    setTextureFilter: function (a) {
        this._texture_filter = this.gl[a || "LINEAR"];
    },
    newImageTexture: function (a) {
        var b = this.gl,
            c = this.newTexture(null, 1, 1, b.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255])),
            d = new Image(),
            e = b.getParameter(b.MAX_TEXTURE_IMAGE_UNITS) - 1;
        d.src = a;
        d.addEventListener("load", function () {
            b.activeTexture(b.TEXTURE0 + e);
            b.bindTexture(b.TEXTURE_2D, c);
            b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, b.RGBA, b.UNSIGNED_BYTE, d);
        });
        return c;
    },
    newTexture: function (a, b, c, d, e) {
        e = this.gl;
        d = d || e.UNSIGNED_BYTE;
        this.timeStart("createTexture");
        WG.log("newTexture()");
        var f = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS) - 1,
            g = e.createTexture();
        e.activeTexture(e.TEXTURE0 + f);
        e.bindTexture(e.TEXTURE_2D, g);
        a ? e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, a) : e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, b, c, 0, e.RGBA, d, null);
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, this._texture_filter);
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, this._texture_filter);
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE);
        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE);
        this.timeEnd("createTexture");
        return g;
    },
    activateTexture: function (a, b, c) {
        var d = this.gl;
        d.activeTexture(d.TEXTURE0 + b);
        d.bindTexture(d.TEXTURE_2D, a);
        c && this.uniformI(c, b);
    },
    newBuffer: function (a) {
        var b = this.gl,
            c = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, c);
        b.bufferData(b.ARRAY_BUFFER, a, b.STATIC_DRAW);
        return c;
    },
    render: function () {
        this.timeStart("render()");
        var a = this.gl;
        a.drawArrays(a.TRIANGLE_STRIP, 0, 4);
        this.timeEnd("render()");
        if (this._log_fps_on) {
            this._fps_filterStrength = 5;
            this._fps_filterStrength_fast = 2;
            var b = (a = Date.now()) - this._lastLoop;
            this._frameTime_fast += (b - this._frameTime_fast) / this._fps_filterStrength_fast;
            this._frameTime += (b - this._frameTime) / this._fps_filterStrength;
            this._lastLoop = a;
            this._frameCount++;
        }
    },
    fps: function () {
        if (!this._log_fps_on) return "fps log not started...";
        if (30 > this._frameCount) return "?";
        var a = this._fps_filterStrength * Math.log(2) * 40,
            b = (1000 / this._frameTime).toFixed(1);
        this._frameCount < a && (b = (1000 / this._frameTime_fast).toFixed(1));
        return b;
    },
    logFps: function (a) {
        this._lastLoop || (this._lastLoop = Date.now());
        this._frameTime || (this._frameTime = Date.now());
        this._frameTime_fast || (this._frameTime_fast = Date.now());
        this._frameCount || (this._frameCount = 0);
        this._log_fps_on = !0;
        var b = this;
        a = a || 500;
        this._log_fps_timout = setTimeout(function () {
            WG.log(b.fps() + " fps");
            b.logFps(a);
        }, a);
    },
    logFpsStop: function () {
        this._log_fps_timout && clearTimeout(this._log_fps_timout);
    },
    resize: function (a, b, c) {
        a = Math.round(a * this.scaling);
        b = Math.round(b * this.scaling);
        if (this.width != a || this.height != b || c)
            (c = this.gl),
                (this.width = c.viewportWidth = this.canvas.width = a),
                (this.height = c.viewportHeight = this.canvas.height = b),
                c.viewport(0, 0, c.drawingBufferWidth, c.drawingBufferHeight),
                c.clearColor(0.5, 0.5, 0.5, 0),
                c.enable(c.BLEND);
    },
    clear: function () {
        var a = this.gl;
        a.clear(a.DEPTH_BUFFER_BIT | a.COLOR_BUFFER_BIT);
    },
    imageData: function (a) {
        var b = this.canvas,
            c = this.options;
        if (a) {
            a.width = this.width;
            a.height = this.height;
            var d = a.getContext("2d");
            d.drawImage(b, 0, 0);
            return a;
        }
        this._ctx_target || ((a = L.DomUtil.create("canvas")), (this._ctx_target = a.getContext("2d")));
        d = this._ctx_target;
        a = d.canvas;
        a.width = b.width - 2 * c.cut_px;
        a.height = b.height - 2 * c.cut_px;
        d.drawImage(b, 0, 0);
        return d.getImageData(c.cut_px * c.scaling, c.cut_px * c.scaling, a.width - 2 * c.cut_px * c.scaling, a.height - 2 * c.cut_px * c.scaling);
    },
    floatStr: function (a) {
        a = "" + parseFloat(a);
        -1 == a.indexOf(".") && (a += ".");
        return a;
    },
    timeStart: function (a, b) {
        (this._log_timing || b) && WG.logTime(a || "WG.Gl timer");
    },
    timeEnd: function (a, b) {
        (this._log_timing || b) && WG.logTimeEnd(a || "WG.Gl timer");
    },
    uniformF: function (a, b, c) {
        var d = this.gl;
        c = c || this._program;
        a = d.getUniformLocation(c, a);
        Array.isArray(b) || (b = [b]);
        switch (b.length) {
            case 1:
                d.uniform1fv(a, b);
                break;
            case 2:
                d.uniform2fv(a, b);
                break;
            case 3:
                d.uniform3fv(a, b);
                break;
            case 4:
                d.uniform4fv(a, b);
        }
        return a;
    },
    uniformFArr: function (a, b, c) {
        var d = this.gl;
        c = c || this._program;
        a = d.getUniformLocation(c, a);
        Array.isArray(b) || (b = [b]);
        switch (b[0].length) {
            case 1:
                var e = "uniform1fv";
            case 2:
                e = "uniform2fv";
                break;
            case 3:
                e = "uniform3fv";
                break;
            case 4:
                e = "uniform4fv";
        }
        var f = [];
        b.forEach(function (a) {
            a.forEach(function (a) {
                f.push(a);
            });
        });
        return d[e](a, f);
    },
    uniformI: function (a, b, c) {
        var d = this.gl;
        c = c || this._program;
        a = d.getUniformLocation(c, a);
        Array.isArray(b) || (b = [b]);
        c = new Int32Array(b);
        switch (b.length) {
            case 1:
                d.uniform1iv(a, c);
                break;
            case 2:
                d.uniform2iv(a, c);
                break;
            case 3:
                d.uniform3iv(a, c);
                break;
            case 4:
                d.uniform4iv(a, c);
        }
        return a;
    },
    _void: function () {},
});
WG.GL.canvas_off = L.DomUtil.create("canvas", "WGGL-render-off");
WG.GL.canvas = L.DomUtil.create("canvas", "WGGL-render");
WG.GLColor = $class({
    Extends: WG.GL,
    constructor: function (a) {
        a = $.extend({}, {}, a);
        a.arrows = a.arrows ? 18 : !1;
        a.arrows_smooth = !0;
        a.barbs = a.barbs ? 20 : !1;
        a.barbs && a.arrows && (a.barbs = !1);
        WG.GL.call(this, a);
        this._textures = [];
        this.program_blur = this.program(this.vsFilter(), this.fsBlurTexture());
        this.program_main = this.program(this.vs(), this.fs());
        this.use(this.program_main);
        var b = this.gl;
        this.texbuf = this.newBuffer(new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]));
        this.texloc = b.getAttribLocation(this.program_main, "aTextureCoords");
        this.vbuf = this.newBuffer(new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]));
        this.vloc = b.getAttribLocation(this.program_main, "aVertexCoords");
        b.bindBuffer(b.ARRAY_BUFFER, this.texbuf);
        b.enableVertexAttribArray(this.texloc);
        b.vertexAttribPointer(this.texloc, 2, b.FLOAT, !1, 0, 0);
        b.bindBuffer(b.ARRAY_BUFFER, this.vbuf);
        b.enableVertexAttribArray(this.vloc);
        b.vertexAttribPointer(this.vloc, 2, b.FLOAT, !1, 0, 0);
        this.uniformF("mixVal", 0);
        this.uniformF("uTexOffset", [0, 1]);
        this.uniformF("uTexResize", [1, 1]);
        this.uniformF("uTexMaskOffset", [0, 0]);
        this.uniformF("uTexMaskResize", [1, 1]);
        this.uniformF("uCanvasRes", [this.gl.viewportWidth, this.gl.viewportHeight]);
        (b = this.options.contours) && this.contourStepVals(b.step1, b.step2);
        a.mask && this.textureMask(a.mask);
        this.options.arrows && this.activateTexture(this.newImageTexture("/img/arrow-scaled.png"), this.texName2Unit("arrow"), "uTexture_arrow");
        this.options.barbs && this.activateTexture(this.newImageTexture("/img/barbs.png"), this.texName2Unit("arrow"), "uTexture_arrow");
    },
    textureDataImage: function (a, b) {
        var c = this.gl,
            d = a.name;
        this.timeStart("textureDataImage");
        c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1);
        c.pixelStorei(c.UNPACK_COLORSPACE_CONVERSION_WEBGL, c.NONE);
        this.texture(a._img ? a._img : a.getImageData(), d, b, a.uid);
        this.uniformF("uRange_" + d + "_R_" + b, a.r_range);
        this.uniformF("uRange_" + d + "_G_" + b, a.g_range);
        this.uniformF("uRange_" + d + "_B_" + b, a.b_range);
        this.uniformF("uRangeCMIN_" + d + "_R_" + b, a.r_min ? a.r_min : 0);
        this.uniformF("uRangeCMIN_" + d + "_G_" + b, a.g_min ? a.g_min : 0);
        this.uniformF("uRangeCMIN_" + d + "_B_" + b, a.b_min ? a.b_min : 0);
        this.uniformF("uRange_" + d + "_RG_" + b, a.rg_range);
        this.uniformF("uRange_" + d + "_RGB_" + b, a.rgb_range);
        this.uniformF("uTexRes_" + d + "_" + b, [a.width, a.height]);
        this.uniformF("uRangeEXP_" + d + "_R_" + b, a.r_exp ? a.r_exp : 1);
        this.uniformF("uRangeEXP_" + d + "_G_" + b, a.g_exp ? a.g_exp : 1);
        this.uniformF("uRangeEXP_" + d + "_B_" + b, a.b_exp ? a.b_exp : 1);
        if ("SLP" == a.r_var) {
            if (-1 == c.getSupportedExtensions().indexOf("OES_texture_float_linear") || 16 > c.getParameter(c.MAX_TEXTURE_IMAGE_UNITS)) {
                WG.log("OES_texture_float_linear NOT SUPPORED...");
                this.timeEnd("textureDataImage");
                return;
            }
            this._textures[a.uid] = this.blurTexture(a, 2);
            b = this.texName2Unit(d, b);
            this.activateTexture(this._textures[a.uid], b);
        }
        this.timeEnd("textureDataImage");
    },
    blurTexture: function (a, b) {
        WG.log("SLP BLUR! " + a.uid);
        b = b || 1;
        this.use(this.program_blur);
        var c = this.gl,
            d = a.getImageData(),
            e = [],
            f = [];
        f.push(this.newTexture(null, a.width, a.height, c.FLOAT));
        e.push(c.createFramebuffer());
        f.push(this.newTexture(null, a.width, a.height, c.FLOAT));
        e.push(c.createFramebuffer());
        var g = this.newTexture(d);
        this.activateTexture(g, 14, "uTexture_blur");
        this.uniformF("uTexRes_blur", [d.width, d.height]);
        c.viewport(0, 0, a.width, a.height);
        c.bindBuffer(c.ARRAY_BUFFER, this.texbuf);
        c.enableVertexAttribArray(this.texloc);
        c.vertexAttribPointer(this.texloc, 2, c.FLOAT, !1, 0, 0);
        c.bindBuffer(c.ARRAY_BUFFER, this.vbuf);
        c.enableVertexAttribArray(this.vloc);
        c.vertexAttribPointer(this.vloc, 2, c.FLOAT, !1, 0, 0);
        for (a = 0; a < b; a++)
            (d = f[a % 2]),
                c.bindFramebuffer(c.FRAMEBUFFER, e[a % 2]),
                c.framebufferTexture2D(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0, c.TEXTURE_2D, d, 0),
                this.activateTexture(g, 14, "uTexture_blur"),
                c.drawArrays(c.TRIANGLE_STRIP, 0, 4),
                (g = d);
        WG.log("BLUR! " + b);
        c.bindFramebuffer(c.FRAMEBUFFER, null);
        this.use(this.program_main);
        c.viewport(0, 0, c.drawingBufferWidth, c.drawingBufferHeight);
        return g;
    },
    textureMask: function (a) {
        a = a.getImageData();
        this.activateTexture(this.newTexture(a), this.texName2Unit("mask"), "uTexture_mask");
        this.uniformF("uTexRes_mask", [a.width, a.height]);
    },
    texName2Unit: function (a, b) {
        void 0 !== b && (a += "_" + b);
        this._texture_units || ((this._texture_units = []), (this._texture_units_num = 0));
        if (this._texture_units[a]) return this._texture_units[a];
        this._texture_units[a] = this._texture_units_num;
        this._texture_units_num++;
        return this._texture_units[a];
    },
    clearTextureCache: function () {
        this._textures = [];
    },
    texture: function (a, b, c, d) {
        this.timeStart("texture TOTAL" + e);
        var e = this.texName2Unit(b, c);
        WG.log("_texture unit:" + e, b, c);
        this._textures[d] ? ((a = this._textures[d]), WG.log("REUSED Texture, unit:" + e, b, d)) : ((a = this.newTexture(a)), WG.log("NEW Texture, unit:" + e, b, d), (this._textures[d] = a));
        this.activateTexture(a, e, "uTexture_" + b + "_" + c);
        return a;
    },
    resize: function (a, b, c) {
        var d = Math.round(b * this.scaling);
        if (this.width != Math.round(a * this.scaling) || this.height != d || c) WG.GLColor._superClass.resize.call(this, a, b, c), this.uniformF("uCanvasRes", [a, b]), WG.log("uCanvasRes", a, b);
    },
    mixVal: function (a) {
        this.uniformF("mixVal", a);
    },
    texOffset: function (a, b) {
        this.uniformF("uTexOffset", [a, b]);
    },
    texResize: function (a, b) {
        this.uniformF("uTexResize", [a, b]);
        WG.log("texResize", a, b);
    },
    texMaskOffset: function (a, b) {
        this.uniformF("uTexMaskOffset", [a, b]);
        WG.log("texMaskOffset", a, b);
    },
    texMaskResize: function (a, b) {
        this.uniformF("uTexMaskResize", [a, b]);
        WG.log("texMaskResize", a, b);
    },
    contourStepVals: function (a, b) {
        this.uniformF("uContourStepVals", [a, b]);
    },
    setGeo: function (a, b) {
        this.uniformF("uLat", [a.getSouth(), a.getNorth()]);
        this.uniformF("uLon", [a.getWest(), a.getEast()]);
        this.uniformF("uEquator", b.y / this.height);
    },
    fsFilter: function () {
        return "\nprecision highp float;\n        \n// the texCoords passed in from the vertex shader.\nvarying vec2 vTextureCoords;\nuniform vec2 uTexRes;\nuniform sampler2D uImage;\nuniform float uKernel[9];\nuniform float uKernelWeight;\n\nvoid main() {\n   vec2 onePixel = vec2(1.0, 1.0) / uTexRes;\n   vec4 colorSum =\n       texture2D(uImage, vTextureCoords + onePixel * vec2(-1, -1)) * uKernel[0] +\n       texture2D(uImage, vTextureCoords + onePixel * vec2( 0, -1)) * uKernel[1] +\n       texture2D(uImage, vTextureCoords + onePixel * vec2( 1, -1)) * uKernel[2] +\n       texture2D(uImage, vTextureCoords + onePixel * vec2(-1,  0)) * uKernel[3] +\n       texture2D(uImage, vTextureCoords + onePixel * vec2( 0,  0)) * uKernel[4] +\n       texture2D(uImage, vTextureCoords + onePixel * vec2( 1,  0)) * uKernel[5] +\n       texture2D(uImage, vTextureCoords + onePixel * vec2(-1,  1)) * uKernel[6] +\n       texture2D(uImage, vTextureCoords + onePixel * vec2( 0,  1)) * uKernel[7] +\n       texture2D(uImage, vTextureCoords + onePixel * vec2( 1,  1)) * uKernel[8] ;\n   gl_FragColor = vec4((colorSum / uKernelWeight).rgb, 1);      \n";
    },
    vsFilter: function () {
        return "\n        attribute vec2 aVertexCoords;  \n        attribute vec2 aTextureCoords;  \n        varying vec2 vTextureCoords;  \n\n        void main(void) {  \t\n            gl_Position = vec4(aVertexCoords.x, -aVertexCoords.y, 0.0, 1.0);\n            vTextureCoords = aTextureCoords;\n        }        \n        ";
    },
    fsBlurTexture: function () {
        return "\nprecision highp float;\n        \n// the texCoords passed in from the vertex shader.\nvarying vec2 vTextureCoords;\nuniform vec2 uTexRes_blur;\nuniform sampler2D uTexture_blur;\n\nvec4 blur9(const vec2 uv, const sampler2D image, const vec2 resolution, const vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.3846153846) * direction;\n  vec2 off2 = vec2(3.2307692308) * direction;\n  color += texture2D(image, uv) * 0.2270270270;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;\n  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;\n  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;\n  return color;\n}\n        \nvoid main() {\n   gl_FragColor = blur9(vTextureCoords, uTexture_blur, uTexRes_blur, vec2(1.,0.));  \n}\n";
    },
    vs: function () {
        return "\nattribute vec2 aVertexCoords;  \nattribute vec2 aTextureCoords;  \nvarying vec2 vTextureCoords;  \nvarying vec2 vTextureCoordsMask;  \nvarying vec2 vVertexCoords;  \nuniform vec2 uTexOffset;\nuniform vec2 uTexResize;\nuniform vec2 uTexMaskOffset;\nuniform vec2 uTexMaskResize;\n\nvoid main(void) {  \t\n    gl_Position = vec4(aVertexCoords, 0.0, 1.0);\n        \n    vTextureCoords = aTextureCoords * uTexResize + uTexOffset;\n    vTextureCoordsMask = aTextureCoords * uTexMaskResize + uTexMaskOffset;\n    vVertexCoords = aTextureCoords;\n}        \n";
    },
    fnTexLookup: function () {
        return "\n        \nvec4 lookup_bil(const vec2 uv, const sampler2D texture, const vec2 res) {\n    //return texture2D(texture, uv); // faster\n        \n    vec2 px = 1.0 / res;\n    vec2 vc = (floor(uv * res)) * px;\n    vec2 f = fract(uv * res);\n    vec4 tl = texture2D(texture, vc);\n    vec4 tr = texture2D(texture, vc + vec2(px.x, 0));\n    vec4 bl = texture2D(texture, vc + vec2(0, px.y));\n    vec4 br = texture2D(texture, vc + px);\n    return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);\n}      \n        \nbool isnan( const float val ){ \n  return ( val < 0.0 || 0.0 < val || val == 0.0 ) ? false : true;\n}\n        \nfloat raw2val(const float raw, const vec2 range) {\n    return range.x + raw * (range.y - range.x);\n}        \n\nfloat raw2val16(const float r, const float g, const vec2 range) {\n    //    return range.x + g * (range.y - range.x);\n    float rx = r * 256.;\n    float gx = g * 256.;\n    return range.x + (( rx + gx * 256.) / 65535. ) * (range.y - range.x);\n}        \n        \nfloat col2val16(const vec4 col, const vec2 range) {\n    float rx = col.r * 256.;\n    float gx = col.g * 256.;\n    return range.x + (( rx + gx * 256.) / 65535. ) * (range.y - range.x);\n}        \n        \nfloat val2raw(const float val, const vec2 range) {\n    return (val - range.x) / (range.y - range.x);\n}   \n        \nfloat raw2val_exp(const float raw, const vec2 range, const float exponent, const float mincol ) {\n    float ret = (range.y - range.x) * pow((raw * 255. - mincol) / (255. - mincol), 1. / exponent) + range.x;\n    if(isnan(ret)) ret = (range.y - range.x) * pow(((raw + 0.01) * 255. - mincol) / (255. - mincol), 1. / exponent) + range.x;\n    return ret;\n}\n\nfloat normpdf(const float x, const float sigma)\n{\n\treturn 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;\n}\n\nvec4 blur2(const vec2 uv, const sampler2D texture, const vec2 res) { \n\n    vec4 c = texture2D(texture, uv / res);\n    //declare stuff\n    const int mSize = 5;\n    const int kSize = (mSize-1)/2;\n    float kernel[mSize];\n    vec4 final_colour = vec4(0.0);\n\n    //create the 1-D kernel\n    float sigma = 7.0;\n    float Z = 0.0;\n    for (int j = 0; j <= kSize; ++j)\n    {\n        kernel[kSize+j] = kernel[kSize-j] = normpdf(float(j), sigma);\n    }\n\n    //get the normalization factor (as the gaussian has been clamped)\n    for (int j = 0; j < mSize; ++j)\n    {\n        Z += kernel[j];\n    }\n\n    //read out the texels\n    for (int i=-kSize; i <= kSize; ++i)\n    {\n        for (int j=-kSize; j <= kSize; ++j)\n        {\n            final_colour += kernel[kSize+j]*kernel[kSize+i]*texture2D(texture, (uv+vec2(float(i),float(j))) / res);\n\n        }\n    }\n\n    return final_colour/(Z*Z);\n}\n\n        \nvec4 lookup_blur(const vec2 uv, const sampler2D texture, const vec2 res) {\n        \n    vec2 px = 1.0 / res;\n    \n    //const vec3 k = vec3(0.25, 0.125, 0.0625);\n    const vec3 k = vec3(0.130371, 0.115349, 0.102059);\n    //const vec3 k = vec3(0.111111,0.111111,0.111111);\n    \n    vec4 col = vec4(0.0);\n    col += texture2D(texture, uv + vec2(-px.x, -px.y))*k.z;\n    col += texture2D(texture, uv + vec2(         0.0, -px.y))*k.y;  \n    col += texture2D(texture, uv + vec2( px.x, -px.y))*k.z;\n\n    col += texture2D(texture, uv + vec2(-px.x,          0.0))*k.y;\n    col += texture2D(texture, uv + vec2(         0.0,          0.0))*k.x;   \n    col += texture2D(texture, uv + vec2( px.x,          0.0))*k.y;  \n\n    col += texture2D(texture, uv + vec2(-px.x, px.y))*k.z;\n    col += texture2D(texture, uv + vec2(         0.0, px.y))*k.y;   \n    col += texture2D(texture, uv + vec2( px.x, px.y))*k.z;\n        \n    return col;\n}       \n        \n        \nvec4 cubic(const float v){\n    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;\n    vec4 s = n * n * n;\n    float x = s.x;\n    float y = s.y - 4.0 * s.x;\n    float z = s.z - 4.0 * s.y + 6.0 * s.x;\n    float w = 6.0 - x - y - z;\n    return vec4(x, y, z, w) * (1.0/6.0);\n}\n\nvec4 lookup_bic(const vec2 uv, const sampler2D sampler, const vec2 res){\n\n   vec2 invTexSize = 1.0 / res ;\n   vec2 texCoords = uv * res - 0.5;\n\n    vec2 fxy = fract(texCoords);\n    texCoords -= fxy;\n\n    vec4 xcubic = cubic(fxy.x);\n    vec4 ycubic = cubic(fxy.y);\n\n    vec4 c = texCoords.xxyy + vec2 (-0.5, +1.5).xyxy;\n\n    vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);\n    vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;\n\n    offset *= invTexSize.xxyy;\n\n    vec4 sample0 = texture2D(sampler, offset.xz);\n    vec4 sample1 = texture2D(sampler, offset.yz);\n    vec4 sample2 = texture2D(sampler, offset.xw);\n    vec4 sample3 = texture2D(sampler, offset.yw);\n\n    float sx = s.x / (s.x + s.y);\n    float sy = s.z / (s.z + s.w);\n\n    return mix(\n       mix(sample3, sample2, sx), mix(sample1, sample0, sx)\n    , sy);\n}        \n        \n        \nconst vec4 BS_A = vec4( 3., -6.,   0.,  4. ) /  6.;\nconst vec4 BS_B = vec4(-1.,  6., -12.,  8. ) /  6.;\nvec4 powers( const float x ) { return vec4(x*x*x, x*x, x, 1.); }\n\nvec4 spline(const float x, const vec4 c0, const vec4 c1, const vec4 c2, const vec4 c3 ) {\n    return c0*dot( BS_B, powers(x + 1.)) + c1*dot( BS_A, powers(x )) + c2*dot( BS_A, powers(1. - x)) + c3*dot( BS_B, powers(2. - x));\n}\n\n#define SAM(a,b)  texture2D(tex, (i+vec2(a,b)+0.5)/res)\nvec4 lookup_bic2(const vec2 t, const sampler2D tex, const vec2 res) {\n    vec2 p = res*t - .5, f = fract(p), i = floor(p);\n    return spline( f.y, spline( f.x, SAM(-1,-1), SAM( 0,-1), SAM( 1,-1), SAM( 2,-1)),\n                        spline( f.x, SAM(-1, 0), SAM( 0, 0), SAM( 1, 0), SAM( 2, 0)),\n                        spline( f.x, SAM(-1, 1), SAM( 0, 1), SAM( 1, 1), SAM( 2, 1)),\n                        spline( f.x, SAM(-1, 2), SAM( 0, 2), SAM( 1, 2), SAM( 2, 2)));\n}\n       \n        ";
    },
    fnIsoline: function () {
        if (!this.options.contours) return "";
        var a = this.options.contours;
        return (
            "\n        \n#define SHARPNESS 0.5\n\nfloat iso_eval(const vec2 uv) {\n       \n    //vec4 col0 = lookup_blur(uv, uTexture_" +
            a.texture +
            "_0, uTexRes_" +
            a.texture +
            "_0); vec4 col1 = lookup_blur(uv, uTexture_" +
            a.texture +
            "_1, uTexRes_" +
            a.texture +
            "_1);      \n        \n    // rychla varianta, zubatejsi cary, ale prijatelne..    \n    //vec4 col0 = lookup_bil(uv, uTexture_" +
            a.texture +
            "_0, uTexRes_" +
            a.texture +
            "_0); vec4 col1 = lookup_bil(uv, uTexture_" +
            a.texture +
            "_1, uTexRes_" +
            a.texture +
            "_1);      \n        \n    // rychla bicubic zaoblene cary (ale na tabletu mizerne kvality, presnost float?)\n    vec4 col0 = lookup_bic(uv, uTexture_" +
            a.texture +
            "_0, uTexRes_" +
            a.texture +
            "_0); vec4 col1 = lookup_bic(uv, uTexture_" +
            a.texture +
            "_1, uTexRes_" +
            a.texture +
            "_1);      \n        \n    // pomala bicubic, nejlepsi kvalita ale na tabletu moc pomale\n    //vec4 col0 = lookup_bic2(uv, uTexture_" +
            a.texture +
            "_0, uTexRes_" +
            a.texture +
            "_0); vec4 col1 = lookup_bic2(uv, uTexture_" +
            a.texture +
            "_1, uTexRes_" +
            a.texture +
            "_1);      \n\n    return mix(raw2val(col0.r, uRange_" +
            a.texture +
            "_R_0), raw2val(col1.r, uRange_" +
            a.texture +
            "_R_1), mixVal);\n}    \n\nfloat iso_eval16(const vec2 uv) {\n    vec4 col0 = lookup_bic2(uv, uTexture_" +
            a.texture +
            "_0, uTexRes_" +
            a.texture +
            "_0); \n    vec4 col1 = lookup_bic2(uv, uTexture_" +
            a.texture +
            "_1, uTexRes_" +
            a.texture +
            "_1);\n    return mix( col2val16(col0, uRange_" +
            a.texture +
            "_RG_0), col2val16(col1, uRange_" +
            a.texture +
            "_RG_1), mixVal );\n}    \n\n\n        \nfloat isoline(float val, float lg, float ref, float pas, float tickness) {\n    float v = abs( mod(val - ref + pas *.5, pas) - pas *.5 ) / lg - .25 * (tickness - 2.9);\n    return smoothstep(.2 + 0.3 * SHARPNESS,.9 - 0.2 * SHARPNESS, v);\n}\n        \n        "
        );
    },
    fs_main_contour: function () {
        var a = "";
        if (this.options.contours) {
            a = this.options.contours;
            var b = a.colors;
            a =
                "\n        \n\tconst float thick1 = " +
                this.floatStr(a.thick1) +
                ";\n\tconst float thick2 = " +
                this.floatStr(a.thick2) +
                ";\n        //const float opacity = " +
                a.opacity +
                ';\n\n        vec2 uv = vTextureCoords;\n        float val = iso_eval(uv);\n            \n        float lg;\n\n        // bez fwidth dFdx... \n        #ifdef GL_OES_standard_derivatives\n            // pres dFdx.. (metodou pokus omyl pri "... lg - .25 * (tickness - 2.9);" v isoline())\n            lg = 3.0 * length(vec2(dFdx(val), dFdy(val))); \n        #else\n            vec3 delta = vec3(1./uCanvasRes.xy, 0); \n            lg = 1.4 * length( vec2(iso_eval(uv+delta.xz)-iso_eval(uv-delta.xz), iso_eval(uv+delta.zy)-iso_eval(uv-delta.zy)) );\n        #endif\n\n        vec4 isocol = get_color_' +
                b +
                "(val);\n\n        float k1 = isoline(val, lg, 0., uContourStepVals.x, thick1 );\n        col = mix(isocol, col, k1);\n\n        float k2 = isoline(val, lg, 0., uContourStepVals.y, thick2);\n        col = mix(isocol, col, k2);            \n        \n        \n        ";
        }
        return a;
    },
    fs_main_mask_hard: function () {
        var a = "";
        this.options.mask &&
            (a =
                "\n        \n        vec4 maskcolor = texture2D(uTexture_mask, vTextureCoordsMask);\n        if(maskcolor.r < 1.0 || vTextureCoordsMask.x < 0. || vTextureCoordsMask.x > 1. || vTextureCoordsMask.y < 0. || vTextureCoordsMask.y > 1.) {\n            gl_FragColor = vec4(0.,0.,0.,0.);\n            return;\n        } \n        \n        ");
        return a;
    },
    fs_main_mask: function () {
        var a = "";
        this.options.mask &&
            (a =
                "\n            if(vTextureCoordsMask.x < 0. || vTextureCoordsMask.x > 1. || vTextureCoordsMask.y < 0. || vTextureCoordsMask.y > 1.) {\n                gl_FragColor = vec4(0.,0.,0.,0.);\n                return;\n            } \n            else {\n                vec4 maskcolor_smooth = texture2D(uTexture_mask, vTextureCoordsMask);\n                //vec4 maskcolor_smooth = lookup_bil(vTextureCoordsMask, uTexture_mask, uTexRes_mask); \n                gl_FragColor.a = smoothstep(0.5,1.0,maskcolor_smooth.r);\n            }\n        \n        ");
        return a;
    },
    fs_init: function () {
        var a = this.options.textures;
        var b = "uniform sampler2D uTexture_mask;\n";
        for (var c = 0; c < a.length; c++)
            (b += "uniform sampler2D uTexture_" + a[c] + "_0;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_R_0;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_G_0;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_B_0;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_RG_0;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_RGB_0;\n"),
                (b += "uniform vec2 uTexRes_" + a[c] + "_0;\n"),
                (b += "uniform float uRangeCMIN_" + a[c] + "_R_0;\n"),
                (b += "uniform float uRangeCMIN_" + a[c] + "_G_0;\n"),
                (b += "uniform float uRangeCMIN_" + a[c] + "_B_0;\n"),
                (b += "uniform float uRangeEXP_" + a[c] + "_R_0;\n"),
                (b += "uniform float uRangeEXP_" + a[c] + "_G_0;\n"),
                (b += "uniform float uRangeEXP_" + a[c] + "_B_0;\n"),
                (b += "uniform sampler2D uTexture_" + a[c] + "_1;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_R_1;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_G_1;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_B_1;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_RG_1;\n"),
                (b += "uniform vec2 uRange_" + a[c] + "_RGB_1;\n"),
                (b += "uniform vec2 uTexRes_" + a[c] + "_1;\n"),
                (b += "uniform float uRangeCMIN_" + a[c] + "_R_1;\n"),
                (b += "uniform float uRangeCMIN_" + a[c] + "_G_1;\n"),
                (b += "uniform float uRangeCMIN_" + a[c] + "_B_1;\n"),
                (b += "uniform float uRangeEXP_" + a[c] + "_R_1;\n"),
                (b += "uniform float uRangeEXP_" + a[c] + "_G_1;\n"),
                (b += "uniform float uRangeEXP_" + a[c] + "_B_1;\n");
        return (
            "\n        precision highp float;\n\n        varying vec2 vTextureCoords;\n        varying vec2 vTextureCoordsMask;  \n        varying vec2 vVertexCoords;\n        uniform vec2 uTexRes_mask;\n\n        uniform float mixVal;\n\n        " +
            b +
            "        \n\n        uniform vec2 uTexOffset;\n        uniform vec2 uTexResize;\n        uniform vec2 uTexMaskOffset;\n        uniform vec2 uTexMaskResize;\n        uniform vec2 uCanvasRes;  \n        uniform vec2 uContourStepVals;\n        \n        uniform vec2 uLat;  \n        uniform vec2 uLon;  \n        uniform float uEquator;  \n        \n        uniform sampler2D uTexture_arrow;\n        #define M_PI 3.1415926535897932384626433832795\n        \n\n        "
        );
    },
    fs_colors: function () {
        var a = "";
        if (this.options.contours) {
            var b = this.options.contours.colors;
            -1 == this.options.colors.indexOf(b) && this.options.colors.push(b);
        }
        for (b = 0; b < this.options.colors.length; b++) {
            var c = WG.getMapsPalette(this.options.colors[b]),
                d = c.getColors();
            a += "uniform vec4 uColors_" + this.options.colors[b] + "[" + d.length + "];\n";
            a += "uniform float uColorSteps_" + this.options.colors[b] + "[" + d.length + "];\n";
            a += c.shaderColorFn("get_color_" + this.options.colors[b]);
        }
        return a;
    },
    fs_main_arrows: function (a) {
        if (!this.options.arrows) return "";
        var b = this.floatStr(this.options.arrows);
        return this.options.arrows_smooth
            ? "\n            \n                vec4 wind_0_a = lookup_bil(vTextureCoords, uTexture_wind_0, uTexRes_wind_0);\n                vec4 wind_1_a = lookup_bil(vTextureCoords, uTexture_wind_1, uTexRes_wind_1);\n                float u_kts_a = mix( raw2val(wind_0_a.r, uRange_wind_R_0), raw2val(wind_1_a.r, uRange_wind_R_1), mixVal);\n                float v_kts_a = mix( raw2val(wind_0_a.g, uRange_wind_G_0), raw2val(wind_1_a.g, uRange_wind_G_1), mixVal);\n            \n                float angle = atan(u_kts_a, v_kts_a);\n                " +
                  ("b" == a ? "float speed_a = mix( raw2val(wind_0_a.b, uRange_wind_B_0), raw2val(wind_1_a.b, uRange_wind_B_1), mixVal);" : "float speed_a = sqrt((u_kts_a * u_kts_a) + (v_kts_a * v_kts_a));") +
                  "\n\n                vec2 coord_offset = ( mod(vVertexCoords * uCanvasRes , " +
                  b +
                  ") / " +
                  b +
                  " ) - 0.5;\n\n                vec2 rot = vec2( sin(angle), cos(angle) );\n\n                vec2 rotatedPosition = vec2(\n                    coord_offset.x * rot.y + coord_offset.y * rot.x,\n                    coord_offset.y * rot.y - coord_offset.x * rot.x) + 0.5;        \n\n                vec4 arrow = texture2D(uTexture_arrow, rotatedPosition);\n            \n                //vec4 col_arrow = vec4(0.,0.,0.,0.8 ); // jen cerna (skoro)\n                vec4 col_arrow = vec4(col.rgb * 0.3, 1.0); // ztmavena barva vetru, asi lepsi...\n                col_arrow.a *= smoothstep(3.,10.,speed_a); // fade u slabeho vetru\n\n                col = mix(col, col_arrow, arrow.a * col_arrow.a);\n            "
            : "\n            vec2 center_box_coords = (floor( vVertexCoords * (uCanvasRes / " +
                  b +
                  ") + 1.0 ) / (uCanvasRes / " +
                  b +
                  ")) - (" +
                  b +
                  " / uCanvasRes) * 0.5; \n            center_box_coords = center_box_coords * uTexResize + uTexOffset;\n        \n            vec4 wind_0_a = lookup_bil(center_box_coords, uTexture_wind_0, uTexRes_wind_0);\n            vec4 wind_1_a = lookup_bil(center_box_coords, uTexture_wind_1, uTexRes_wind_1);\n\n            float u_kts_center = mix( raw2val(wind_0_a.r, uRange_wind_R_0), raw2val(wind_1_a.r, uRange_wind_R_1), mixVal);\n            float v_kts_center = mix( raw2val(wind_0_a.g, uRange_wind_G_0), raw2val(wind_1_a.g, uRange_wind_G_1), mixVal);\n\n            float center_angle = atan(u_kts_center, v_kts_center);\n            " +
                  ("b" == a ? "float speed_a = mix( raw2val(wind_0_a.b, uRange_wind_B_0), raw2val(wind_1_a.b, uRange_wind_B_1), mixVal);" : "float speed_a = sqrt((u_kts_center * u_kts_center) + (v_kts_center * v_kts_center));") +
                  "\n\n            vec2 coord_offset = ( mod(vVertexCoords * uCanvasRes , " +
                  b +
                  ") / " +
                  b +
                  " ) - 0.5;\n\n            vec2 rot = vec2( sin(center_angle), cos(center_angle) );\n\n            vec2 rotatedPosition = vec2(\n                coord_offset.x * rot.y + coord_offset.y * rot.x,\n                coord_offset.y * rot.y - coord_offset.x * rot.x) + 0.5;        \n\n            vec4 arrow = texture2D(uTexture_arrow, rotatedPosition);\n\n            //vec4 col_arrow = vec4(0.,0.,0.,0.8 ); // jen cerna (skoro)\n            vec4 col_arrow = vec4(col.rgb * 0.3, 1.0); // ztmavena barva vetru, asi lepsi...\n            col_arrow.a *= smoothstep(3.,10.,speed_a); // fade u slabeho vetru\n\n            col = mix(col, col_arrow, arrow.a * col_arrow.a);\n        ";
    },
    fs_main_barbs: function (a) {
        if (!this.options.barbs) return "";
        var b = this.floatStr(this.options.barbs);
        return (
            "\n            vec2 center_box_coords = (floor( vVertexCoords * (uCanvasRes / " +
            b +
            ") + 1.0 ) / (uCanvasRes / " +
            b +
            ")) - (" +
            b +
            " / uCanvasRes) * 0.5; \n            center_box_coords = center_box_coords * uTexResize + uTexOffset;\n        \n            vec4 wind_0_a = lookup_bil(center_box_coords, uTexture_wind_0, uTexRes_wind_0);\n            vec4 wind_1_a = lookup_bil(center_box_coords, uTexture_wind_1, uTexRes_wind_1);\n\n            float u_kts_center = mix( raw2val(wind_0_a.r, uRange_wind_R_0), raw2val(wind_1_a.r, uRange_wind_R_1), mixVal);\n            float v_kts_center = mix( raw2val(wind_0_a.g, uRange_wind_G_0), raw2val(wind_1_a.g, uRange_wind_G_1), mixVal);\n\n            float center_angle = atan(u_kts_center, v_kts_center);\n\n            " +
            ("b" == a ? "float speed_a = mix( raw2val(wind_0_a.b, uRange_wind_B_0), raw2val(wind_1_a.b, uRange_wind_B_1), mixVal);" : "float speed_a = sqrt((u_kts_center * u_kts_center) + (v_kts_center * v_kts_center));") +
            "\n\n            //vec2 grid = vec2(5.,2.); // 5 sloupcu 2 rady (tester atlas)\n            vec2 grid = vec2(10.,4.); // 10 sloupcu 4 rady (barbs atlas)\n\n            vec2 coord_offset = ( mod(vVertexCoords * uCanvasRes , " +
            b +
            ") / " +
            b +
            " ) - 0.5;\n        \n            //center_angle = 45. * M_PI / 180.;\n\n            vec2 rot = vec2( sin(center_angle), cos(center_angle) );\n            vec2 rotatedPosition = vec2(\n                coord_offset.x * rot.y + coord_offset.y * rot.x,\n                coord_offset.y * rot.y - coord_offset.x * rot.x) + vec2(0.5,0.5);  \n        \n            speed_a = clamp(speed_a,0.,175.); // viz nez 175 uzlu neumime rozume namalovat...\n        \n            float barb_row = (grid.y - 1.0) - floor((speed_a+2.5)/50.); // radek s barb, jsou po 50 uzlech, pocitam je odspoda proto (grid.y - 1.0) - ...\n            float barb_col = floor((mod(speed_a+2.5,50.))/5.); // sloupec s konkretni barb pro dany zbytek po deleni 50.\n        \n            vec2 barb_offset = vec2(barb_col, barb_row); // vyber barb dle rychlosti\n        \n            // na jizni polokouli otocim barb zrcadlove \n            if(center_box_coords.y > uEquator) { \n                rotatedPosition *= vec2(-1.,1.); barb_offset += vec2(1.,0.); \n            }\n        \n            rotatedPosition = 1./grid * (rotatedPosition + barb_offset);\n\n            vec4 arrow = texture2D(uTexture_arrow, rotatedPosition);\n            //vec4 arrow = lookup_bil(rotatedPosition, uTexture_arrow, vec2(1500.,600.));\n            float dist = length(coord_offset);\n            arrow.a *= smoothstep(0.5, 0.5, 1.-dist); // protoze rotujeme tak px ktery je dal nez polomer nebudem malovat (muze tam byt uz jina barb z texture atlasu)\n        \n            //vec4 col_arrow = vec4(0.,0.,0.,0.8 ); // jen cerna (skoro)\n            vec4 col_arrow = vec4(col.rgb * 0.3, 1.0); // ztmavena barva vetru, asi lepsi...\n            col_arrow.a *= smoothstep(3.,10.,speed_a); // fade u slabeho vetru\n            \n            col = mix(col, col_arrow, arrow.a * col_arrow.a); // OSTRA VERZE finalni verze barvy\n            //col = mix(col, arrow, arrow.a); // TEST! barvy kdyz testuju s testerem na zamereni textury\n            \n        "
        );
    },
    fs_main: function () {
        var a = this.options.textures[0];
        return (
            "\n\nvoid main(void) {\n        \n        float value = mix( \n            // default umoznime i exponencialni kodovani \n            raw2val_exp(lookup_bil(vTextureCoords, uTexture_" +
            a +
            "_0, uTexRes_" +
            a +
            "_0).r, uRange_" +
            a +
            "_R_0, uRangeEXP_" +
            a +
            "_R_0, uRangeCMIN_" +
            a +
            "_R_0 ), \n            raw2val_exp(lookup_bil(vTextureCoords, uTexture_" +
            a +
            "_1, uTexRes_" +
            a +
            "_1).r, uRange_" +
            a +
            "_R_1, uRangeEXP_" +
            a +
            "_R_1, uRangeCMIN_" +
            a +
            "_R_1 ), \n            mixVal\n        );\n        \n        vec4 col = get_color_" +
            this.options.colors[0] +
            "(value);\n        \n        " +
            this.fs_main_contour() +
            "\n        " +
            this.fs_main_arrows() +
            "\n        " +
            this.fs_main_barbs() +
            "\n\n        gl_FragColor = col; \n        \n        " +
            this.fs_main_mask() +
            "       \n\n        \n}\n"
        );
    },
    fs: function () {
        return "" + this.gl_extensions() + this.fs_init() + this.fs_colors() + this.fnTexLookup() + this.fnIsoline() + this.fs_main();
    },
});
WG.GLWindColor = $class({
    Extends: WG.GLColor,
    constructor: function (a) {
        WG.GLColor.call(this, a);
    },
    fs_main: function () {
        return (
            "\n\nvoid main(void) {\n\n        vec4 wind_0, wind_1;\n        \n        wind_0 = lookup_bil(vTextureCoords, uTexture_wind_0, uTexRes_wind_0);\n        wind_1 = lookup_bil(vTextureCoords, uTexture_wind_1, uTexRes_wind_1);\n        \n        float u_kts = mix( raw2val(wind_0.r, uRange_wind_R_0), raw2val(wind_1.r, uRange_wind_R_1), mixVal);\n        float v_kts = mix( raw2val(wind_0.g, uRange_wind_G_0), raw2val(wind_1.g, uRange_wind_G_1), mixVal);\n        \n        float speed = sqrt((u_kts * u_kts) + (v_kts * v_kts));\n        \n        vec4 col = get_color_" +
            this.options.colors[0] +
            "(speed);\n\n        " +
            this.fs_main_contour() +
            "\n        " +
            this.fs_main_arrows() +
            "\n        " +
            this.fs_main_barbs() +
            "\n        \n        gl_FragColor = col; \n\n        " +
            this.fs_main_mask() +
            "       \n        \n}\n"
        );
    },
});
WG.GLWindGustColor = $class({
    Extends: WG.GLWindColor,
    constructor: function (a) {
        WG.GLWindColor.call(this, a);
    },
    fs_main: function () {
        return (
            "\n\nvoid main(void) {\n        \n        vec4 wind_0, wind_1;\n        \n        wind_0 = lookup_bil(vTextureCoords, uTexture_wind_0, uTexRes_wind_0);\n        wind_1 = lookup_bil(vTextureCoords, uTexture_wind_1, uTexRes_wind_1);\n        \n        float speed = mix( raw2val(wind_0.b, uRange_wind_B_0), raw2val(wind_1.b, uRange_wind_B_1), mixVal);\n\n        vec4 col = get_color_" +
            this.options.colors[0] +
            "(speed);\n\n        " +
            this.fs_main_contour() +
            "\n        " +
            this.fs_main_arrows("b") +
            "\n        " +
            this.fs_main_barbs("b") +
            "\n\n        gl_FragColor = col; \n        \n        " +
            this.fs_main_mask() +
            "  \n        \n}\n"
        );
    },
});
WG.GLWaveColor = $class({
    Extends: WG.GLColor,
    constructor: function (a) {
        WG.GLColor.call(this, a);
    },
    fs_main_arrows: function () {
        if (!this.options.arrows) return "";
        var a = this.options.textures[0],
            b = this.floatStr(this.options.arrows);
        return (
            "\n            vec2 center_box_coords = (floor( vVertexCoords * (uCanvasRes / " +
            b +
            ") + 1.0 ) / (uCanvasRes / " +
            b +
            ")) - (" +
            b +
            " / uCanvasRes) * 0.5; \n            center_box_coords = center_box_coords * uTexResize + uTexOffset;\n        \n            vec4 col_0_a = lookup_bil(center_box_coords, uTexture_" +
            a +
            "_0, uTexRes_" +
            a +
            "_0);\n            vec4 col_1_a = lookup_bil(center_box_coords, uTexture_" +
            a +
            "_1, uTexRes_" +
            a +
            "_1);\n        \n            float center_angle = (mix( raw2val(col_0_a.b, uRange_" +
            a +
            "_B_0), raw2val(col_1_a.b, uRange_" +
            a +
            "_B_1), mixVal) + 180.) * M_PI / 180.;\n            float hgt_a = mix( raw2val(col_0_a.r, uRange_" +
            a +
            "_R_0), raw2val(col_1_a.r, uRange_" +
            a +
            "_R_1), mixVal);\n\n            vec2 coord_offset = ( mod(vVertexCoords * uCanvasRes , " +
            b +
            ") / " +
            b +
            " ) - 0.5;\n\n            vec2 rot = vec2( sin(center_angle), cos(center_angle) );\n\n            vec2 rotatedPosition = vec2(\n                coord_offset.x * rot.y + coord_offset.y * rot.x,\n                coord_offset.y * rot.y - coord_offset.x * rot.x) + 0.5;        \n\n            vec4 arrow = texture2D(uTexture_arrow, rotatedPosition);\n\n            //vec4 col_arrow = vec4(0.,0.,0.,0.8 ); // jen cerna (skoro)\n            vec4 col_arrow = vec4(col.rgb * 0.3, 1.0); // ztmavena puvodni barva, asi lepsi...\n            col_arrow.a *= smoothstep(0.2,0.5,hgt_a); // fade u malych vln\n            col = mix(col, col_arrow, arrow.a * col_arrow.a);\n        "
        );
    },
    fs_main: function () {
        var a = this.options.textures[0];
        return (
            "\n\nvoid main(void) {\n        \n        vec4 col_0 = lookup_bil(vTextureCoords, uTexture_" +
            a +
            "_0, uTexRes_" +
            a +
            "_0);\n        vec4 col_1 = lookup_bil(vTextureCoords, uTexture_" +
            a +
            "_1, uTexRes_" +
            a +
            "_1);\n        \n        // muze byt i exponencialne kodovano\n        float hgt = mix( raw2val_exp(col_0.r, uRange_" +
            a +
            "_R_0, uRangeEXP_" +
            a +
            "_R_0, uRangeCMIN_" +
            a +
            "_R_0 ), raw2val_exp(col_1.r, uRange_" +
            a +
            "_R_1, uRangeEXP_" +
            a +
            "_R_1, uRangeCMIN_" +
            a +
            "_R_1 ), mixVal);\n        \n        float per = mix( raw2val(col_0.g, uRange_" +
            a +
            "_G_0), raw2val(col_1.g, uRange_" +
            a +
            "_G_1), mixVal);\n        float dir = mix( raw2val(col_0.b, uRange_" +
            a +
            "_B_0), raw2val(col_1.b, uRange_" +
            a +
            "_B_1), mixVal);\n        \n        float value = " +
            (this.options.calc ? this.options.calc : "hgt") +
            ";\n        \n        vec4 col = get_color_" +
            this.options.colors[0] +
            "(value);\n        \n        " +
            this.fs_main_arrows() +
            "\n\n        gl_FragColor = col; \n        \n        " +
            this.fs_main_mask() +
            "  \n        \n}\n"
        );
    },
});
WG.GLWaveEnergyColor = $class({
    Extends: WG.GLWaveColor,
    constructor: function (a) {
        a.calc || (a.calc = "0.4906 * pow(hgt,2.0) * per * per");
        WG.GLWaveColor.call(this, a);
    },
});
WG.GLCloudsColor = $class({
    Extends: WG.GLColor,
    constructor: function (a) {
        WG.GLColor.call(this, a);
    },
    fs_main: function () {
        var a = this.options.textures[0],
            b = this.options.textures[1],
            c = this.options.colors[0],
            d = this.options.colors[1],
            e = "1.0";
        "apcp" == b && (e = "0.33");
        return (
            "\n\nvoid main(void) {\n        \n        \n        float value_cloud = mix( \n            raw2val(lookup_bil(vTextureCoords, uTexture_" +
            a +
            "_0, uTexRes_" +
            a +
            "_0).r, uRange_" +
            a +
            "_R_0), \n            raw2val(lookup_bil(vTextureCoords, uTexture_" +
            a +
            "_1, uTexRes_" +
            a +
            "_1).r, uRange_" +
            a +
            "_R_1), \n            mixVal\n        );        \n        \n        float value_precip = mix( \n            raw2val_exp(lookup_bil(vTextureCoords, uTexture_" +
            b +
            "_0, uTexRes_" +
            b +
            "_0).r, uRange_" +
            b +
            "_R_0, uRangeEXP_" +
            b +
            "_R_0, uRangeCMIN_" +
            b +
            "_R_0 ), \n            raw2val_exp(lookup_bil(vTextureCoords, uTexture_" +
            b +
            "_1, uTexRes_" +
            b +
            "_1).r, uRange_" +
            b +
            "_R_1, uRangeEXP_" +
            b +
            "_R_1, uRangeCMIN_" +
            b +
            "_R_1 ), \n            mixVal\n        );       \n        \n        vec4 col_p = get_color_" +
            d +
            "(value_precip * " +
            e +
            ");\n        vec4 col_c = get_color_" +
            c +
            "(value_cloud);\n        \n        vec4 col = mix(col_c, col_p, col_p.a);\n\n        " +
            this.fs_main_contour() +
            "\n        " +
            this.fs_main_arrows() +
            "\n        " +
            this.fs_main_barbs() +
            "\n        \n        gl_FragColor = col; \n        \n        " +
            this.fs_main_mask() +
            "       \n        \n}\n"
        );
    },
});
WG.GLCoverageColor = $class({
    Extends: WG.GLColor,
    constructor: function (a) {
        WG.GLColor.call(this, a);
    },
    fs_main: function () {
        var a = this.options.textures[0];
        return (
            "\n\nvoid main(void) {\n        \n        vec4 col_0 = lookup_bic(vTextureCoords, uTexture_" +
            a +
            "_0, uTexRes_" +
            a +
            "_0);\n        vec4 col_1 = lookup_bic(vTextureCoords, uTexture_" +
            a +
            "_1, uTexRes_" +
            a +
            "_1);\n\n        float value_topo = mix( \n            raw2val16(col_0.r, col_0.g, uRange_" +
            a +
            "_R_0), \n            raw2val16(col_1.r, col_1.g, uRange_" +
            a +
            "_R_1), \n            mixVal\n        );        \n        vec4 col = get_color_" +
            this.options.colors[0] +
            "(value_topo);\n        \n        vec4 colw = vec4(0.,0.,0.9,1.);\n\n        col = mix(colw,col,smoothstep(0.45,0.55,col_0.b));\n        \n        " +
            this.fs_main_contour() +
            "\n\n        col.a = smoothstep(0.5,0.9,col_0.a);\n\n        gl_FragColor = col; \n        \n        " +
            this.fs_main_mask() +
            "       \n}\n"
        );
    },
});
WG.GLCoverageColorNoLand = $class({
    Extends: WG.GLColor,
    constructor: function (a) {
        WG.GLColor.call(this, a);
    },
    fs_main: function () {
        var a = this.options.textures[0];
        return (
            "\n\nvoid main(void) {\n        \n        vec4 col_0 = lookup_bic(vTextureCoords, uTexture_" +
            a +
            "_0, uTexRes_" +
            a +
            "_0);\n        vec4 col_1 = lookup_bic(vTextureCoords, uTexture_" +
            a +
            "_1, uTexRes_" +
            a +
            "_1);\n        \n        float value_topo = mix( \n            raw2val16(col_0.r, col_0.g, uRange_" +
            a +
            "_R_0), \n            raw2val16(col_1.r, col_1.g, uRange_" +
            a +
            "_R_1), \n            mixVal\n        );        \n        \n        if(value_topo < 1.) value_topo = -10.;\n        \n        vec4 col = get_color_" +
            this.options.colors[0] +
            "(value_topo);\n        \n        " +
            this.fs_main_contour() +
            "\n\n        col.a = smoothstep(0.5,0.9,col_0.a);\n\n        gl_FragColor = col; \n        \n        " +
            this.fs_main_mask() +
            "       \n}\n"
        );
    },
});
WG.GLTide = $class({
    Extends: WG.GLColor,
    constructor: function (a) {
        a = $.extend({}, {}, a);
        WG.GL.call(this, a);
        this._textures = [];
        this.program_main = this.program(this.vs(), this.fs());
        this.use(this.program_main);
        a = this.gl;
        this.texbuf = this.newBuffer(new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]));
        this.texloc = a.getAttribLocation(this.program_main, "aTextureCoords");
        this.vbuf = this.newBuffer(new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]));
        this.vloc = a.getAttribLocation(this.program_main, "aVertexCoords");
        a.bindBuffer(a.ARRAY_BUFFER, this.texbuf);
        a.enableVertexAttribArray(this.texloc);
        a.vertexAttribPointer(this.texloc, 2, a.FLOAT, !1, 0, 0);
        a.bindBuffer(a.ARRAY_BUFFER, this.vbuf);
        a.enableVertexAttribArray(this.vloc);
        a.vertexAttribPointer(this.vloc, 2, a.FLOAT, !1, 0, 0);
        this.uniformF("mixVal", -1);
        this.uniformF("uTexOffset", [0, 1]);
        this.uniformF("uTexResize", [1, 1]);
        this.uniformF("uCanvasRes", [this.gl.viewportWidth, this.gl.viewportHeight]);
        WG.log(this.fs());
    },
    setConstants: function (a) {
        WG.log("constants", a);
        this.uniformFArr("uConstants", a);
    },
    setHour: function (a) {
        this.uniformF("uHour", a);
    },
    fs_init: function () {
        var a = this.options.textures;
        var b = "uniform sampler2D uTexture_mask;\n";
        for (var c = 0; c < a.length; c++) (b += "uniform sampler2D uTexture_" + a[c] + "_0;\n"), (b += "uniform vec2 uRange_" + a[c] + "_R_0;\n"), (b += "uniform vec2 uTexRes_" + a[c] + "_0;\n");
        return (
            "\n        precision highp float;\n\n        varying vec2 vTextureCoords;\n        varying vec2 vVertexCoords;\n\n        " +
            b +
            "        \n\n        uniform vec2 uTexOffset;\n        uniform vec2 uTexResize;\n        uniform vec2 uCanvasRes;  \n\n        #define M_PI 3.1415926535897932384626433832795\n        \n\n        "
        );
    },
    fs_main: function () {
        for (var a = this.options.textures, b = this.options.colors[0], c = "", d = 0; d < a.length; d++)
            c +=
                " \n            colc = lookup_bil(vTextureCoords, uTexture_" +
                a[d] +
                "_0, uTexRes_" +
                a[d] +
                "_0); \n            //colc = texture2D(uTexture_" +
                a[d] +
                "_0, vTextureCoords);\n            //amplitude = raw2val(colc.r, uRange_" +
                a[d] +
                "_R_0);\n            amplitude = raw2val_exp(colc.r, uRange_" +
                a[d] +
                "_R_0, 0.8, 0.);\n            phase_sin = raw2val(colc.g, vec2(-1.0,1.0));\n            phase_cos = raw2val(colc.b, vec2(-1.0,1.0));\n            phase = atan(phase_sin, phase_cos);\n            tide += (amplitude * uConstants[" +
                d +
                "].a * cos( uConstants[" +
                d +
                "].g * uHour + (uConstants[" +
                d +
                "].r + uConstants[" +
                d +
                "].b) - phase) );\n            \n            tide_before += (amplitude * uConstants[" +
                d +
                "].a * cos( uConstants[" +
                d +
                "].g * (uHour - 0.10) + (uConstants[" +
                d +
                "].r + uConstants[" +
                d +
                "].b) - phase) );\n            tide_after += (amplitude * uConstants[" +
                d +
                "].a * cos( uConstants[" +
                d +
                "].g * (uHour + 0.10) + (uConstants[" +
                d +
                "].r + uConstants[" +
                d +
                "].b) - phase) );\n            \n            \n            ";
        return (
            "\n\nuniform vec4 uConstants[32]; // vec4(speed, VO, f, u);\nuniform float uHour;        \n\n\nvoid main(void) {\n        \n        vec4 colc;\n        float amplitude;\n        float phase;\n        float phase_sin;\n        float phase_cos;\n        float phase_check;\n        vec4 colc_check;\n        float tide = 0.0;\n        float tide_before = 0.0;\n        float tide_after = 0.0;\n        \n        vec4 htide = vec4(0.0, 0.8, 0.0, 1.0);\n        vec4 ltide = vec4(0.8, 0.0, 0.0, 1.0);\n        \n        vec2 center_box_coords = (floor( vVertexCoords * (uCanvasRes / 4.0) + 1.0 ) / (uCanvasRes / 4.0)) - (4.0 / uCanvasRes) * 0.5; \n        center_box_coords = center_box_coords * uTexResize + uTexOffset;\n        \n        vec2 coord_offset = ( mod(vVertexCoords * uCanvasRes , 4.0) / 4.0 ) - 0.5;\n        \n        " +
            c +
            "\n        \n        vec4 col = get_color_" +
            b +
            "(tide);\n        \n        float maxdif = max(abs(tide - tide_after),abs(tide - tide_before));\n        \n        if(tide > tide_before && tide > tide_after && abs(tide) > 15.0) { // high tide\n            //col = mix(col,htide,smoothstep(0.0,1.0,avgdif/maxdif) );\n            col = mix(col,htide,smoothstep(0.25,0.20,0.8*length(coord_offset)) );\n        }\n        if(tide < tide_before && tide < tide_after && abs(tide) > 15.0) { // high tide\n            col = mix(col,ltide,smoothstep(0.25,0.20,0.75*length(coord_offset) ) );\n        }\n        \n        gl_FragColor = col; \n        \n}\n"
        );
    },
});
WG.DataImage = L.Evented.extend({
    options: {
        clean_wind: !1,
        resize: 1,
    },
    initialize: function (a, b, c) {
        L.Util.setOptions(this, c);
        var d = this;
        this._canvas = c = document.createElement("canvas");
        this._ctx = c.getContext("2d");
        this._json = this._imageData = null;
        this.name = a;
        this.resize = this.options.resize || 1;
        this._ready = !1;
        this.display_bounds = this.bounds = null;
        b && this.setJson(b);
        this.on("ready", function () {
            this.getUid();
            d._ready = !0;
        });
    },
    getUid: function () {
        this.uid = this._url ? this._url : WG.getUID("dataimage");
    },
    _complete: function (a) {
        var b = this._img.width,
            c = this._img.height;
        this.width = this._canvas.width = b;
        this.height = this._canvas.height = c;
        1 != this.options.resize
            ? ((b = Math.round(b * this.options.resize)),
              (c = Math.round(c * this.options.resize)),
              (this.width = this._canvas.width = b),
              (this.height = this._canvas.height = c),
              this._ctx.drawImage(this._img, 0, 0, this._img.width, this._img.height, 0, 0, b, c))
            : this._ctx.drawImage(this._img, 0, 0, this._img.width, this._img.height);
        this.size = L.point(this.width, this.height);
        a.resolve();
        this.fire("ready");
    },
    load: function (a) {
        return a instanceof ImageData ? this.loadImageData(a) : a instanceof Image ? this.loadImage(a) : this.loadUrl(a);
    },
    loadUrl: function (a) {
        var b = this,
            c = $.Deferred();
        this._ready = !1;
        this._img = new Image();
        this._img.crossOrigin = "Anonymous";
        this._img.onload = function () {
            b._complete(c);
        };
        this._img.onerror = function () {
            b.loadImageData(new ImageData(16, 16)).then(function () {
                b.width = b._canvas.width = 16;
                b.height = b._canvas.height = 16;
                b.size = L.point(b.width, b.height);
                c.resolve();
                b.fire("ready");
            });
        };
        this._url = this._img.src = a;
        return c;
    },
    loadImage: function (a) {
        var b = this,
            c = $.Deferred();
        this._ready = !1;
        this._img = a;
        this._img.complete
            ? b._complete(c)
            : (this._img.onload = function () {
                  b._complete(c);
              });
        return c;
    },
    loadImageData: function (a) {
        this._ready = !1;
        this.width = this._canvas.width = a.width;
        this.height = this._canvas.height = a.height;
        this.size = L.point(this.width, this.height);
        this._ctx.putImageData(a, 0, 0);
        this.fire("ready");
        a = $.Deferred();
        a.resolve();
        return a;
    },
    setJson: function (a) {
        this._json = a;
        this.bounds = L.latLngBounds([
            [a.lat.min, a.lon.min],
            [a.lat.max, a.lon.max],
        ]);
        this.display_bounds = L.latLngBounds([
            [a.lat.min, a.lon.min],
            [a.lat.max, a.lon.max],
        ]);
        if (a.files) {
            var b = a.files[this.name];
            a = a.vars;
            var c = {
                    r: 0,
                    g: 0,
                    b: 0,
                    rg: 0,
                    rgb: 0,
                },
                d;
            for (d in c)
                if (((this[d + "_var"] = null), (this[d + "_range"] = [0, 0]), (this[d + "_min"] = 1), (this[d + "_exp"] = 1), b && b[d])) {
                    c = this[d + "_var"] = b[d];
                    var e = a[c].min,
                        f = a[c].max;
                    this[d + "_min"] = a[c].mincolor || 0;
                    this[d + "_exp"] = a[c].exponent || 1;
                    if ("U-WINDSPD" == c || "V-WINDSPD" == c || "U-WINDSPDMAX" == c || "V-WINDSPDMAX" == c || "WINDSPD" == c || "GUST" == c) (e *= 1.9407), (f *= 1.9407);
                    "SLP" == c && ((e *= 0.01), (f *= 0.01));
                    this[d + "_range"] = [e, f];
                }
        }
    },
    getVarColor: function (a) {
        var b = this.json.files[this.name];
        return b.r == a ? "r" : b.g == a ? "g" : b.b == a ? "b" : !1;
    },
    getVarRange: function (a) {
        a = this.json.var[a];
        return [a.min, a.max];
    },
    whenReady: function (a) {
        if (this.isReady()) a();
        else this.on("ready", a);
    },
    isReady: function () {
        return this._ready;
    },
    getImageData: function (a, b, c, d) {
        a = a || 0;
        b = b || 0;
        c = c || this.width;
        d = d || this.height;
        return 0 == a && 0 == b && c == this.width && d == this.height ? (this._imageData || ((this._imageData = this._ctx.getImageData(a, b, c, d)), WG.log("getImageData ...")), this._imageData) : this._ctx.getImageData(a, b, c, d);
    },
    getBounds: function () {
        return this.bounds;
    },
    getDisplayBounds: function () {
        return this.display_bounds;
    },
    getImage: function () {
        return this._img;
    },
    getInfo: function () {
        return JSON.parse(JSON.stringify(this._json));
    },
    getPixelBounds: function (a, b) {
        b = b || this.bounds;
        var c = a.latLngToContainerPoint(b._southWest);
        a = a.latLngToContainerPoint(b._northEast);
        return L.bounds(c, a);
    },
    getPixelDataBounds: function (a) {
        var b = a.latLngToContainerPoint(this.bounds._southWest);
        a = a.latLngToContainerPoint(this.bounds._northEast);
        return L.bounds(b, a);
    },
    getPixelDataSize: function (a) {
        a = this.getPixelDataBounds(a);
        return a.max.subtract(a.min);
    },
    _color2value: function (a) {
        var b = [],
            c = {
                r: 0,
                g: 1,
                b: 2,
            },
            d;
        for (d in c)
            if (this[d + "_var"]) {
                var e = this[d + "_var"];
                var f = this[d + "_var"];
                var g = this[d + "_range"];
                var h = this._json.vars[f].exponent;
                f = this._json.vars[f].mincolor || 0;
                var k = a[c[d]] - 1;
                g = h ? (g[1] - g[0]) * Math.pow((k - f) / (255 - f), 1 / h) + g[0] : ((g[1] - g[0]) / 255) * k + g[0];
                b[e] = g;
            }
        return b;
    },
    _uv2speed: function (a, b) {
        return Math.sqrt(a * a + b * b);
    },
    _uv2deg: function (a, b) {
        a = (180 * Math.atan2(a, b)) / Math.PI + 180;
        360 <= a && (a -= 360);
        return a;
    },
    latLng2px: function (a, b, c) {
        if (!b || !a) return !1;
        b = WG.Map.latLngBounds_latLng2pxpoint(a, this.bounds, b);
        a = WG.Map.latLngBounds_pxsize(a, this.bounds);
        a = b.unscaleBy(a).scaleBy(L.point(this.width, this.height));
        c && (a = a.round());
        return a;
    },
    getDataLatLng: function (a, b, c) {
        if (!b || !a) return !1;
        if (c) {
            var d = c.latLng2px(a, b, !0);
            c = WG.getPixelColor(c.getImageData(), d.x, d.y);
            if (!c[0] || 250 > c[0]) return !1;
        }
        a = this.latLng2px(a, b, !0);
        b = this.getImageData();
        a = WG.getPixelColor(b, a.x, a.y);
        a = this._color2value(a);
        "U-WINDSPD" == this.r_var && "V-WINDSPD" == this.g_var && ((a.WINDSPD = this._uv2speed(a[this.r_var], a[this.g_var])), (a.WINDDIR = this._uv2deg(a[this.r_var], a[this.g_var])));
        return a;
    },
    getVisiblePixels: function (a, b) {
        b = b || this.bounds;
        if (!b.intersects(this.bounds))
            return (
                WG.log("cutSrcImage, outside!"),
                {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                }
            );
        b = this.getPixelBounds(a, b);
        a = this.getPixelDataBounds(a);
        var c = a.max.y - a.min.y,
            d = {
                x: 0 > b.min.x - a.min.x ? 0 : b.min.x - a.min.x,
                y: 0 > b.min.y - a.min.y ? 0 : b.min.y - a.min.y,
            };
        d.width = a.max.x - a.min.x - d.x;
        a.max.x > b.max.x && (d.width -= a.max.x - b.max.x);
        d.height = c - d.y;
        a.max.y > b.max.y && (d.height -= a.max.y - b.max.y);
        return d;
    },
    getDataScale: function (a, b) {
        a = this.getPixelDataBounds(a);
        return (this.width / (a.max.x - a.min.x)) * this.resize;
    },
    getVisiblePixelsData: function (a, b) {
        b = b || this.bounds;
        var c = this.getVisiblePixels(a, b);
        a = this.getDataScale(a, b);
        b = {
            x: Math.round(a * c.x),
            y: Math.round(a * c.y),
            width: Math.round(a * c.width),
            height: Math.round(a * c.height),
            pos_x: (a * c.x) / this.width,
            pos_y: (a * c.y) / this.height,
            scale_w: (a * c.width) / this.width,
            scale_h: (a * c.height) / this.height,
            screen_w: c.width,
            screen_h: c.height,
            scale: 1 / a,
        };
        WG.log("cut v data velikosti", c, a, b);
        return b;
    },
    cutBounds: function (a, b) {
        var c = this.getInfo();
        c.lat.min = a.getNorth();
        c.lat.max = a.getSouth();
        c.lon.min = a.getWest();
        c.lon.max = a.getEast();
        a = this.cutImageDataBounds(a, b);
        c = new WG.DataImage(this.name, c, this.options);
        c.load(a);
        return c;
    },
    cutImageDataBounds: function (a, b) {
        WG.logTime("cutImageDataBounds");
        a = this.getVisiblePixelsData(b, a);
        if (!a.width || !a.height) return null;
        a = this._ctx.getImageData(a.x, a.y, a.width, a.height);
        this.options.clean_wind && (a = this.cleanWindColorImageData(a));
        WG.logTimeEnd("cutImageDataBounds");
        return a;
    },
    imageData2Image: function (a) {
        var b = document.createElement("canvas"),
            c = b.getContext("2d");
        b.width = a.width;
        b.height = a.height;
        c.putImageData(a, 0, 0);
        a = new Image();
        a.src = b.toDataURL();
        return a;
    },
    cleanWindColorImageData: function (a) {
        var b = document.createElement("canvas").getContext("2d").createImageData(a.width, a.height);
        a = a.data;
        var c = b.data,
            d = this.r_range[0],
            e = this.g_range[0];
        d = Math.round(((0 - d) / (this.r_range[1] - d)) * 255);
        e = Math.round(((0 - e) / (this.g_range[1] - e)) * 255);
        for (var f, g, h = 0; h < a.length; h += 4) (f = a[h]), (g = a[h + 1]), (c[h] = a[h]), (c[h + 1] = a[h + 1]), (c[h + 2] = 0), (c[h + 3] = 255), 0 == f + g && ((c[h] = d), (c[h + 1] = e));
        return b;
    },
    windRange: function () {
        for (var a = this._imageData.data, b, c, d = 999999, e = 0, f = 0; f < a.length; f += 4) (b = a[f]), (c = a[f + 1]), (b = WG.rgToKts(b, c, this.r_range, this.g_range)), b > e && (e = b), b < d && (d = b);
        return [d, e];
    },
});
WG.WeatherTileLayer = L.GridLayer.extend({
    options: {
        render: !0,
        zoomOffset: -2,
        tileSize: 1024,
        tileSize_di: 256,
        opacity: 1,
        scaling: 1,
        quality: "jpg",
    },
    initialize: function (a) {
        this._imgs_loaded = [];
        this._di_arr_tiles = [];
        this._di_arr_display = [];
        this._zoom_offset = 0;
        L.Util.setOptions(this, this.options);
        L.Util.setOptions(this, a);
        this.options.zoomOffset && ((this._zoom_offset += this.options.zoomOffset), (this.options.maxNativeZoom -= this._zoom_offset));
        L.GridLayer.prototype.initialize.call(this, this.options);
        this.scaling = this.options.scaling;
        this._wgl = new WG[this.options.glfn]({
            scaling: this.options.scaling,
            offscreen: !0,
            mask: this.options.mask,
            colors: this.options.colors,
            textures: this.options.files,
        });
        a = this.options;
        this.model = a.model;
        this.dir = a.dir;
        this.hr = a.hr;
        this.param = a.param;
        this.files = a.files;
        this.quality = a.quality;
        this.info = a.info;
        this._render = a.render;
        this._valid_keys = [];
    },
    onAdd: function (a) {
        this._initContainer();
        this._levels = {};
        this._tiles = {};
        this._resetView();
        this._update();
    },
    setRender: function (a) {
        this._render = a;
    },
    coordsToPoint: function (a, b, c) {
        a = L.point(a, b);
        a.z = c;
        return a;
    },
    tileVisible: function (a, b, c) {
        function d(a, b, c, d) {
            var f = q.x;
            t[d] = [];
            var g = n.x,
                h = p - m.x;
            h > f && (h = f);
            var w = e.tile2file(g, a);
            h = {
                tile_x: g,
                tile_y: a,
                tile_z: k,
                file_x: w.x,
                file_y: w.y,
                file_z: w.z,
                x: m.x,
                y: b,
                z: k,
                width: h,
                height: c,
            };
            t[d].push(h);
            for (f -= h.width; p <= f; )
                g++,
                    (w = e.tile2file(g, a)),
                    (h = {
                        tile_x: g,
                        tile_y: a,
                        tile_z: k,
                        file_x: w.x,
                        file_y: w.y,
                        file_z: w.z,
                        x: 0,
                        y: b,
                        z: k,
                        width: p,
                        height: c,
                    }),
                    t[d].push(h),
                    (f -= h.width);
            0 < f &&
                (g++,
                (w = e.tile2file(g, a)),
                (h = {
                    tile_x: g,
                    tile_y: a,
                    tile_z: k,
                    file_x: w.x,
                    file_y: w.y,
                    file_z: w.z,
                    x: 0,
                    y: b,
                    z: k,
                    width: f,
                    height: c,
                }),
                t[d].push(h));
        }
        var e = this;
        if (!this.isLoaded()) return !1;
        if ((b = b || this._map)) {
            c = void 0 === c ? !0 : c;
            var f = f || e._di_arr_tiles[a];
            Object.keys(f);
            var g = b.getZoom();
            a = this.getTileSize();
            var h = this.options.tileSize_di / a.x,
                k = this._tileZoom || this._tileZoom_orig;
            k += this._zoom_offset;
            var p = this.options.tileSize_di;
            f = b.getZoomScale(g, k);
            a = 0;
            g = b.options.crs.scale(g - k) / (p * h);
            c && (a = Math.ceil(g));
            c = b.getSize();
            c = c.add([2 * a, 2 * a]);
            var q = c.divideBy(f).round();
            f = b.containerPointToLatLng([0 - a, 0 - a]);
            a = b.containerPointToLatLng([0 - a + c.x, 0 - a + c.y]);
            L.latLngBounds(f, a);
            c = this.latlngToTilePixel(b, f, this);
            var n = c[0],
                m = c[1];
            c = n.y;
            this.latlngToTilePixel(b, a, this);
            var t = [];
            b = 0;
            a = q.y;
            f = p - m.y;
            f > a && (f = a);
            d(n.y, m.y, f, b);
            for (a -= f; p <= a; ) b++, c++, d(c, 0, p, b), (a -= p);
            0 < a && (c++, b++, d(c, 0, a, b));
            return t;
        }
    },
    cutVisibleAll: function () {
        for (var a = 0; a < this.files.length; a++) this.cutVisible(this.files[a]);
    },
    diArrKey: function (a, b) {
        a = this.tile2file(a, b);
        return a.z + "_" + a.x + "_" + a.y;
    },
    validFile: function (a, b) {
        return -1 != this._valid_keys.indexOf(this.diArrKey(a, b));
    },
    tile2file: function (a, b) {
        var c = this._globalTileRange;
        a > c.max.x && (a = a - c.max.x - 1);
        a < c.min.x && (a = a + c.max.x + 1);
        c = this._tileZoom || this._tileZoom_orig;
        c += this._zoom_offset;
        return {
            x: a,
            y: b,
            z: c,
        };
    },
    cutVisible: function (a, b, c) {
        if (!this.isLoaded()) return !1;
        a = a || "wind";
        c = void 0 === c ? !0 : c;
        WG.logTime("cutVisible");
        var d = this._map;
        if (d) {
            b = b || this._di_arr_tiles[a];
            var e = Object.keys(b)[0];
            e = b[e];
            var f = d.getZoom(),
                g = this.getTileSize().x,
                h = this.options.tileSize_di / g,
                k = this._tileZoom || this._tileZoom_orig,
                p = k + this._zoom_offset;
            g = this.options.tileSize_di;
            var q = d.getZoomScale(f, p),
                n = 0;
            f = d.options.crs.scale(f - k - this._zoom_offset) / (this.options.tileSize_di * h);
            c && (n = Math.ceil(f));
            f = d.getSize();
            f = f.add([2 * n, 2 * n]);
            q = f.divideBy(q).round();
            d.containerPointToLatLng([0 - n, 0 - n]);
            d.containerPointToLatLng([0 - n + f.x, 0 - n + f.y]);
            if (b) {
                n = e.getInfo();
                a = this.tileVisible(a, d, c);
                c = 0;
                f = a[0][0];
                f = this.tilePx2latLng(f.tile_x, f.tile_y, p, f.x, f.y, g, d);
                h = a[a.length - 1];
                h = h[h.length - 1];
                d = this.tilePx2latLng(h.tile_x, h.tile_y, p, h.x + h.width, h.y + h.height, g, d);
                d = L.latLngBounds(f, d);
                g = document.createElement("canvas");
                g.width = q.x;
                g.height = q.y;
                q = g.getContext("2d");
                for (f = 0; f < a.length; f++) {
                    for (h = p = 0; h < a[f].length; h++) {
                        var m = a[f][h];
                        k = p;
                        var t = m,
                            w = this.diArrKey(t.tile_x, t.tile_y),
                            B = b[w];
                        B ? q.putImageData(B.getImageData(t.x, t.y, t.width, t.height), p, c) : WG.log("NO dataimage to join", w);
                        p = k + t.width;
                    }
                    c += m.height;
                }
                n.lat.min = d.getSouth();
                n.lat.max = d.getNorth();
                n.lon.min = d.getWest();
                n.lon.max = d.getEast();
                b = q.getImageData(0, 0, g.width, g.height);
                e = new WG.DataImage(e.name, n, {});
                e.load(b);
                WG.logTimeEnd("cutVisible");
                this._display_bounds = e.display_bounds = d;
                return (this._di_arr_display[e.name] = e);
            }
            WG.log("cutTiles NO SRC TILES!");
        }
    },
    getBoundsDisplay: function () {
        return this._display_bounds;
    },
    getDataImagesDisplay: function () {
        return this._di_arr_display;
    },
    isLoaded: function () {
        return !this.isLoading();
    },
    ready: function () {
        var a = $.Deferred();
        this.once("load", function () {
            a.resolve();
        });
        this.isLoaded() && a.resolve();
        return a;
    },
    setupVisible: function () {
        var a = this,
            b = $.Deferred();
        a.ready().then(function () {
            a.cutVisibleAll();
            b.resolve();
        });
        return b;
    },
    coords2url: function (a, b, c) {
        a = this.tile2file(a, b);
        return this.dir + this.hr + "/" + c + "/" + a.z + "/" + a.x + "/" + a.y + "." + this.quality;
    },
    createTile: function (a, b) {
        var c = this.scaling,
            d = this,
            e = L.DomUtil.create("canvas", "leaflet-tile"),
            f = this.getTileSize();
        e.width = f.x * c;
        e.height = f.y * c;
        this._tileZoom_orig = a.z;
        this.loadTileDataImages(a).then(function () {
            var c = e.getContext("2d"),
                f = d.diArrKey(a.x, a.y);
            d._valid_keys.push(f);
            f = d._di_arr_tiles[d.param][f];
            d._render && (d._wgl.textureDataImage(f, 0), d._wgl.resize(d.options.tileSize_di, d.options.tileSize_di), d._wgl.render(), c.putImageData(d._wgl.imageData(), 0, 0));
            d.debug && ((c.font = "20px Arial"), (c.fillStyle = "black"), (c.textAlign = "center"), c.fillText("x:" + a.x + " y:" + a.y + " z:" + a.z, e.width / 2, e.height / 2));
            e.dataImage = f;
            b(null, e);
        });
        return e;
    },
    loadTileDataImages: function (a) {
        function b(b) {
            var d = $.Deferred(),
                e = c.coords2url(a.x, a.y, b),
                f = new WG.DataImage(b, c.info);
            c._di_arr_tiles[b] || (c._di_arr_tiles[b] = []);
            var g = c.diArrKey(a.x, a.y);
            c._di_arr_tiles[b][g] = f;
            f.load(e).then(function () {
                d.resolve();
            });
            return d;
        }
        for (var c = this, d = $.Deferred(), e = [], f = 0; f < this.files.length; f++) e[f] = b(this.files[f]);
        $.when.apply($, e).then(function () {
            d.resolve();
        });
        return d;
    },
    latlngToTilePixel: function (a, b, c) {
        var d = a.options.crs,
            e = c._tileZoom || c._tileZoom_orig;
        e += this._zoom_offset;
        a = a.getPixelOrigin();
        c.getTileSize();
        c = d.latLngToPoint(b, e).floor();
        b = c.divideBy(256).floor();
        d = b.multiplyBy(256).subtract(a);
        a = c.subtract(a).subtract(d);
        return [b, a];
    },
    tile2lon: function (a, b) {
        return (a / Math.pow(2, b)) * 360 - 180;
    },
    tile2lat: function (a, b) {
        a = Math.PI - (2 * Math.PI * a) / Math.pow(2, b);
        return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(a) - Math.exp(-a)));
    },
    tilePx2latLng: function (a, b, c, d, e, f, g) {
        g = g || this._map;
        a = this.tile2lon(a, c);
        b = this.tile2lat(b, c);
        g = g.options.crs;
        d = g.latLngToPoint(L.latLng(b, a), c).add([d, e]);
        return g.pointToLatLng(d, c);
    },
    getBounds: function () {
        var a = this.info;
        return L.latLngBounds(L.latLng(a.lat.min, a.lon.min), L.latLng(a.lat.max, a.lon.max));
    },
});
WG.WeatherCanvasOverlay = L.ImageOverlay.extend({
    options: {
        opacity: 1,
        throttle: 50,
    },
    initialize: function (a, b, c) {
        L.Util.setOptions(this, c);
        L.ImageOverlay.prototype.initialize.call(this, null, b, c);
        this._mixval = 0;
        this._opacity_on = this.options.opacity;
        this._di_arr = [];
        b = window.devicePixelRatio || 1;
        2 < b && (b = 2);
        this.setDpr(b);
        this._source_ready = $.Deferred();
        this.setSource(a);
        this.update_throttled = this._update_throttled();
        return this._source_ready;
    },
    anyDataImage: function () {
        var a = Object.keys(this._di_arr)[0];
        return this._di_arr[a];
    },
    isReady: function () {
        return "resolved" == this._source_ready.state();
    },
    whenReady: function (a) {
        this.isReady() ? a() : this._source_ready.then(a);
    },
    onAdd: function (a) {
        L.ImageOverlay.prototype.onAdd.call(this, a);
        this._getCtx();
        this.refresh();
        this._map.on("moveend zoomend", this.refresh, this);
    },
    onRemove: function (a) {
        L.ImageOverlay.prototype.onRemove.call(this, a);
        this._map.off("moveend zoomend", this.refresh, this);
    },
    _initImage: function () {
        function a() {
            return !1;
        }
        this._image || (this._image = L.DomUtil.create("canvas"));
        var b = (this._canvas = this._image);
        L.DomUtil.addClass(b, "wg-canvas-overlay-gl");
        this._zoomAnimated && L.DomUtil.addClass(b, "leaflet-zoom-animated");
        this.options.className && L.DomUtil.addClass(b, this.options.className);
        b.onselectstart = a;
        b.onmousemove = a;
        this.options.zIndex && this._updateZIndex();
    },
    _update_throttled: function () {
        var a = this;
        return WG.throttle(function () {
            a.whenReady(function () {
                a._draw();
            });
        }, a.options.throttle);
    },
    draw: function () {
        this.update_throttled();
    },
    _draw: function () {},
    _getCtx: function () {
        this._ctx = this._canvas.getContext("2d");
    },
    setDpr: function (a) {
        this._dpr = a;
    },
    setBounds: function (a) {
        L.ImageOverlay.prototype.setBounds.call(this, a);
    },
    getSize: function () {
        if (this._map) return L.bounds(this._map.latLngToLayerPoint(this._bounds.getNorthWest()), this._map.latLngToLayerPoint(this._bounds.getSouthEast())).getSize();
    },
    _getSrcImageData: function (a) {
        return this._di_arr[a].getImageData();
    },
    setSource: function (a) {
        var b = this;
        this._source_ready = $.Deferred();
        var c = [];
        Array.isArray(a) || (a[a.name] = a);
        for (var d in a) {
            var e = $.Deferred();
            c.push(e);
            b._di_arr[d] = a[d];
            b._di_arr[d].whenReady(function () {
                e.resolve();
            });
        }
        $.when.apply($, c).then(function () {
            b._source_ready.resolve();
        });
        return this._source_ready;
    },
    setDataImage: function (a) {
        this._di_arr[a.name] = a;
    },
    setBoundsVisible: function () {
        if (this._map) {
            var a = this.anyDataImage();
            if (a) {
                var b = this._map.getBounds(),
                    c = a.bounds,
                    d = c.getNorthWest();
                c = c.getSouthEast();
                c.lat < b.getSouth() && (c.lat = b.getSouth());
                d.lat > b.getNorth() && (d.lat = b.getNorth());
                c.lng > b.getEast() && (c.lng = b.getEast());
                d.lng < b.getWest() && (d.lng = b.getWest());
                b = L.latLngBounds(d, c);
                this._cut = a.getVisiblePixelsData(this._map, b);
                if (this.options.mask) {
                    var e = this._map,
                        f = this.options.mask.bounds;
                    a = e.latLngToLayerPoint(f.getNorthWest());
                    f = e.latLngToLayerPoint(f.getSouthEast());
                    d = e.latLngToLayerPoint(d);
                    c = e.latLngToLayerPoint(c);
                    e = f.subtract(a);
                    c = c.subtract(d);
                    this._cut.mask_scale_w = c.x / e.x;
                    this._cut.mask_scale_h = c.y / e.y;
                    this._cut.mask_pos_x = (d.x - a.x) / e.x;
                    this._cut.mask_pos_y = (d.y - a.y) / e.y;
                }
                this.setBounds(b);
            }
        }
    },
    refresh: function () {
        this.setBoundsVisible();
        this.draw();
    },
    setImageData: function (a) {
        this._ctx.putImageData(a, 0, 0);
    },
});
WG.CanvasOverlayTiledMix = {
    setSource: function (a) {
        var b = $.Deferred();
        this._wtl = a;
        this._map && this.setBounds(this._map.getBounds());
        this._wtl.once("load", function () {
            b.resolve();
        });
        return b;
    },
    refresh: function () {
        this.draw();
    },
    anyDataImage: function () {
        var a = this._wtl._di_arr_display,
            b = Object.keys(a)[0];
        return a[b];
    },
    _update_throttled: function () {
        var a = this;
        return WG.debounce(function () {
            a._wtl.setupVisible().then(function () {
                a.setBoundsVisible();
                a.setDataImages(a._wtl.getDataImagesDisplay());
                a._draw();
            });
        }, a.options.throttle);
    },
};
WG.WeatherOverlay = WG.WeatherCanvasOverlay.extend({
    options: {
        zIndex: -2,
        opacity: 1,
        cache_gl: !0,
        scaling: 1,
        mask: !1,
        glfn: "GLColor",
    },
    initialize: function (a, b, c) {
        L.Util.setOptions(this, c);
        WG.WeatherCanvasOverlay.prototype.initialize.call(this, a, b, this.options);
        this._init_wgl();
        var d = this;
        this.whenReady(function () {
            for (var a in d._di_arr) d.setDataImage(d._di_arr[a]);
        });
    },
    _init_wgl: function () {
        this.wgl = new WG[this.options.glfn]({
            offscreen: !1,
            scaling: this.options.scaling,
            mask: this.options.mask,
            colors: this.options.colors,
            textures: this.options.files,
            contours: this.options.contours,
            arrows: this.options.arrows,
            barbs: this.options.barbs,
            canvas: this.options.canvas || !1,
        });
    },
    _initImage: function () {
        this.options.cache_gl && WG._canvas_overlay_cache && (this._image = WG._canvas_overlay_cache);
        this._image = this.wgl.canvas;
        WG.WeatherCanvasOverlay.prototype._initImage.call(this);
    },
    _draw: function () {
        this.render();
    },
    onRemove: function (a) {
        this.wgl.clear();
        WG.WeatherCanvasOverlay.prototype.onRemove.call(this, a);
    },
    setBoundsVisible: function () {
        if (this._map) {
            WG.WeatherCanvasOverlay.prototype.setBoundsVisible.call(this);
            var a = this._cut;
            this.setGeo();
            this.wgl.texOffset(a.pos_x, a.pos_y);
            this.wgl.texResize(a.scale_w, a.scale_h);
            this.wgl.texMaskOffset(a.mask_pos_x, a.mask_pos_y);
            this.wgl.texMaskResize(a.mask_scale_w, a.mask_scale_h);
        }
    },
    setBoundsOriginal: function () {
        WG.WeatherCanvasOverlay.prototype.setBoundsOriginal.call(this);
        this.setGeo();
        this.wgl.texOffset(0, 0);
        this.wgl.texResize(1, 1);
    },
    setGeo: function () {
        if (this._map) {
            var a = this.getBounds();
            this.wgl.setGeo(a, WG.Map.latLngBounds_latLng2pxpoint(this._map, a, [0, 0]));
        }
    },
    setDataImage: function (a) {
        WG.logTime("WeatherOverlay WebGl frame");
        this._di_arr[a.name] = a;
        this.wgl.textureDataImage(a, 0);
        this.wgl.render();
        WG.logTimeEnd("WeatherOverlay WebGl frame");
    },
    setMixDataImage: function (a, b) {
        if (a || b) {
            var c = b || a;
            this.wgl.textureDataImage(a || b, 0);
            this.wgl.textureDataImage(c, 1);
        }
    },
    setContourSteps: function (a, b) {
        this.wgl.contourStepVals(a, b);
    },
    setMixDataImages: function (a, b) {
        for (var c in a) this.wgl.textureDataImage(a[c], 0);
        for (c in b) this.wgl.textureDataImage(b[c], 1);
    },
    setDataImages: function (a) {
        for (var b in a) this.wgl.textureDataImage(a[b], 0), this.wgl.textureDataImage(a[b], 1);
    },
    render: function (a) {
        if (this._cut.width && this._cut.height) {
            var b = this.getSize();
            void 0 !== a && (this._mixval = a);
            b && (this.wgl.mixVal(this._mixval), this.wgl.resize(b.x, b.y), this.wgl.render(), this.setOpacity(this._opacity_on));
        }
    },
});
WG.WeatherOverlayTiled = WG.WeatherOverlay.extend({
    includes: WG.CanvasOverlayTiledMix,
    initialize: function (a, b, c) {
        this._wtl = null;
        WG.WeatherOverlay.prototype.initialize.call(this, a, b, c);
    },
    _draw: function () {
        this.render();
        this.setOpacity(this._opacity_on);
    },
});
WG.TideOverlayTiled = WG.WeatherOverlay.extend({
    includes: WG.CanvasOverlayTiledMix,
    initialize: function (a, b, c) {
        WG.WeatherOverlayTiled.prototype.initialize.call(this, a, b, c);
        var d = [];
        c.files.forEach(function (a) {
            a = a.toUpperCase();
            d.push({
                phase_GMT: 0,
                amplitude: 0,
                name: a,
            });
        });
        this._tp = tidePredictor(d, {
            phaseKey: "phase_GMT",
        });
        this.setStartMoment(moment());
    },
    setDataImages: function (a) {
        for (var b in a) this.wgl.textureDataImage(a[b], 0);
    },
    setStartMoment: function (a) {
        this._start_moment = a;
        var b = this._tp.getCalcConstants(a.toDate()),
            c = [];
        this.options.files.forEach(function (a) {
            a = a.toUpperCase();
            a = b[a];
            c.push([a.baseValue, a.baseSpeed, a.u, a.f]);
        });
        WG.log("tide constants", a.utc().format(), b, c);
        this.wgl.setConstants(c);
    },
    setMoment: function (a) {
        a.format();
        this._start_moment.format();
        a.unix();
        this._start_moment.unix();
        a = (a.unix() - this._start_moment.unix()) / 3600;
        this.wgl.setHour(a);
    },
});
WG.ParticleOverlay = WG.WeatherCanvasOverlay.extend({
    options: {
        numParticles: 60000,
        fadeOpacity: 0.95,
        speedFactor: 0.2,
        dropRate: 0.006,
        dropRateBump: 0.01,
        particleSize: 1.2,
        particleSizeSmooth: 0,
        smooth: 0,
        retina: !0,
        opacity: 0.8,
        colors: WG.getMapsPalette("particles"),
        throttle: 100,
        datafile: "wind",
        dirfile: "",
        dircol: "",
        mask: !1,
        zIndex: 1,
    },
    initialize: function (a, b, c) {
        L.Util.setOptions(this, c);
        WG.WeatherCanvasOverlay.prototype.initialize.call(this, a, b, this.options);
    },
    _initImage: function () {
        WG.ParticleOverlay._canvas || (WG.ParticleOverlay._canvas = L.DomUtil.create("canvas"));
        this._image = WG.ParticleOverlay._canvas;
        WG.WeatherCanvasOverlay.prototype._initImage.call(this);
    },
    _getCtx: function () {
        this._ctx = this._canvas.getContext("webgl", {
            antialiasing: !0,
        });
    },
    onAdd: function () {
        WG.WeatherCanvasOverlay.prototype.onAdd.call(this);
        this._map.on("movestart zoomstart", this.stopAnimation, this);
        $(window).on("WG:stop", this, this._on_wg_stop);
    },
    _on_wg_stop: function (a) {
        WG.log("WG:stop => WG.ParticleOverlay.stop();");
        a = a.data;
        a.clear();
        a.stopAnimation();
    },
    _draw: function () {
        this.stopAnimation();
        this.updateAnimation();
    },
    draw: function () {
        this.stopAnimation();
        this.update_throttled();
    },
    clear: function () {
        this._windgl && this._windgl.clear();
    },
    onRemove: function () {
        this.stopAnimation();
        this.clear();
        $(window).off("WG:stop", this, this._on_wg_stop);
        WG.WeatherCanvasOverlay.prototype.onRemove.call(this);
    },
    setDataImages: function (a) {
        this.setDataImage(a);
    },
    setMixVal: function (a) {
        this._windgl && this._windgl.setMixVal(a);
    },
    setDataImage: function (a, b) {
        var c = (this._di_arr[this.options.datafile] = a[this.options.datafile]),
            d = c;
        b && (d = b[this.options.datafile]);
        var e = (a = this._di_arr[this.options.dirfile] = a[this.options.dirfile]);
        b && (e = b[this.options.dirfile]);
        if (this._windgl) {
            b = this._windgl;
            var f = this._windData,
                g = this._windData_1,
                h = this._dirData,
                k = this._dirData_1;
            f.image = c._img ? c._img : c.getImageData();
            g.image = d._img ? d._img : d.getImageData();
            a && (h.image = a._img ? a._img : a.getImageData());
            e && (k.image = e._img ? e._img : e.getImageData());
            f.width = c.width;
            f.height = c.height;
            f.uMin = c.r_range[0];
            f.uMax = c.r_range[1];
            f.vMin = c.g_range[0];
            f.vMax = c.g_range[1];
            g.width = d.width;
            g.height = d.height;
            g.uMin = d.r_range[0];
            g.uMax = d.r_range[1];
            g.vMin = d.g_range[0];
            g.vMax = d.g_range[1];
            c = this._cut;
            b.texResize = [c.scale_w, c.scale_h];
            b.texOffset = [c.pos_x, c.pos_y];
            b.texMaskResize = [c.mask_scale_w, c.mask_scale_h];
            b.texMaskOffset = [c.mask_pos_x, c.mask_pos_y];
            this.options.mask && b.setMask(this.options.mask);
            b.setWind(f, f.image, g, g.image, h.image, k.image);
        }
    },
    stopAnimation: function () {
        this._windgl_frame && (cancelAnimationFrame(this._windgl_frame), (this._windgl_frame = null));
    },
    updateAnimation: function () {
        function a() {
            p.windData && p.draw();
            d._windgl_frame = requestAnimationFrame(a);
        }
        var b = this._getSrcImageData(this.options.datafile);
        if (b) {
            var c;
            this.options.dirfile && (c = this._getSrcImageData(this.options.dirfile));
            var d = this,
                e = this._canvas,
                f = this._di_arr[this.options.datafile],
                g = (this._windData = {});
            this._windData_1 = {};
            this._dirData = {};
            this._dirData_1 = {};
            var h = this._cut,
                k = 1;
            1 < this._dpr && (k = 1 + (this._dpr - 1) / 2);
            e.width = h.screen_w * k;
            e.height = h.screen_h * k;
            g.image = b;
            g.width = b.width;
            g.height = b.height;
            g.uMin = f.r_range[0];
            g.uMax = f.r_range[1];
            g.vMin = f.g_range[0];
            g.vMax = f.g_range[1];
            b = Math.floor((e.width * e.height) / k / 60);
            100000 < b && (b = 100000);
            WG.log("numParticles", b);
            e = "";
            this.options.dirfile && this.options.dirfile != this.options.datafile && (e = this.options.dirfile);
            d._windgl = new WindGL(d._ctx, {
                colors: d.options.colors,
                dirfile: e,
                speedcolor: this.options.speedcolor ? this.options.speedcolor : "",
                dircolor: this.options.dircolor ? this.options.dircolor : "",
            });
            var p = d._windgl;
            e = d.options;
            p.numParticles = b;
            p.fadeOpacity = e.fadeOpacity;
            p.speedFactor = e.speedFactor;
            p.dropRate = e.dropRate;
            p.dropRateBump = e.dropRateBump;
            p.particleSize = e.particleSize;
            p.particleSizeSmooth = e.particleSizeSmooth;
            p.minSpeed = e.minSpeed;
            b = this._cut;
            p.texResize = [b.scale_w, b.scale_h];
            p.texOffset = [b.pos_x, b.pos_y];
            p.texMaskResize = [b.mask_scale_w, b.mask_scale_h];
            p.texMaskOffset = [b.mask_pos_x, b.mask_pos_y];
            this.options.mask && this._windgl.setMask(this.options.mask);
            1 < this._dpr && ((p.particleSize = e.particleSize * (1 + (k - 1) / 2)), (p.particleSizeSmooth = e.particleSizeSmooth * (1 + (k - 1) / 2)), (p.speedFactor = e.speedFactor * k));
            p.setWind(g, g.image, g, g.image, c, c);
            p.resize();
            a();
            this.setOpacity(this._opacity_on);
        }
    },
});
WG.ParticleOverlayTiled = WG.ParticleOverlay.extend({
    includes: WG.CanvasOverlayTiledMix,
    initialize: function (a, b, c) {
        this._wtl = null;
        WG.ParticleOverlay.prototype.initialize.call(this, a, b, c);
    },
});
WG.Var = (function (a) {
    a = a || {};
    var b = {
        unit: {
            wind: "knots ms msd kmh mph bft".split(" "),
            temp: ["c", "f"],
            wave: ["m", "ft"],
            dir: ["arr", "num"],
        },
        current_units: {
            wind: "knots",
            temp: "c",
            wave: "m",
            dir: "arr",
        },
        unit_type: {
            WINDSPD: "wind",
            MWINDSPD: "wind",
            GUST: "wind",
            TMPE: "temp",
            TMP: "temp",
            WCHILL: "temp",
            HTSGW: "wave",
            SWELL1: "wave",
            SWELL2: "wave",
            WVHGT: "wave",
            SMER: "dir",
            WINDDIR: "dir",
            DIRPW: "dir",
            SWDIR1: "dir",
            SWDIR2: "dir",
            WVDIR: "dir",
        },
        unit_type_var: {
            wind: "wj",
            temp: "tj",
            wave: "waj",
            dir: "dj",
        },
        unit_fixname: {
            SLP: "hPa",
            WINDDIR: "&deg;",
            DIRPW: "&deg;",
            SWDIR1: "&deg;",
            SWDIR2: "&deg;",
            WVDIR: "&deg;",
            PERPW: "s",
            SWPER1: "s",
            SWPER2: "s",
            WVPER: "s",
            TCDC: "%",
            HCDC: "%",
            MCDC: "%",
            LCDC: "%",
            APCP1: "mm/1h",
            APCP: "mm/3h",
            PWEN: "kJ",
            SWEN1: "kJ",
            SWEN2: "kJ",
            WVEN: "kJ",
        },
        colors: {
            WINDSPD: "wind",
            MWINDSPD: "wind",
            GUST: "wind",
            TMPE: "temp",
            TMP: "temp",
            WCHILL: "temp",
            TCDC: "cloud",
            MCDC: "cloud",
            HCDC: "cloud",
            LCDC: "cloud",
            RH: "rh",
            SLP: "press",
            HTSGW: "htsgw",
            SWELL1: "htsgw",
            SWELL2: "htsgw",
            WVHGT: "htsgw",
            PERPW: "perpw",
            SWPER1: "perpw",
            SWPER2: "perpw",
            WVPER: "perpw",
            APCP: "precip",
            APCP1: "precip1",
            PWEN: "wpower",
            SWEN1: "wpower",
            SWEN2: "wpower",
            WVEN: "wpower",
        },
        minval: {
            TCDC: 5,
            MCDC: 5,
            HCDC: 5,
            LCDC: 5,
            HTSGW: 0.2,
            SWELL1: 0.2,
            SWELL2: 0.2,
            WVHGT: 0.1,
            APCP: 0.3,
            APCP1: 0.1,
        },
        minval_depend: {
            DIRPW: "HTSGW",
            SWDIR1: "SWELL1",
            SWDIR2: "SWELL2",
            WVDIR: "WVHGT",
            PERPW: "HTSGW",
            SWPER1: "SWELL1",
            SWPER2: "SWELL2",
            WVPER: "WVHGT",
        },
        minval_bgcolor_depend: {
            PERPW: 1,
            SWPER1: 1,
            SWPER2: 1,
            WVPER: 1,
        },
        bold: {
            HTSGW: 3,
            SWELL1: 3,
            SWELL2: 3,
            WVHGT: 3,
            PERPW: 10,
            SWPER1: 10,
            SWPER2: 10,
            WVPER: 10,
            WINDSPD: 11,
            MWINDSPD: 11,
            GUST: 11,
            PWEN: 1000,
            SWEN1: 1000,
            SWEN2: 1000,
            WVEN: 1000,
        },
        light_text_brightness: {
            WINDSPD: 100,
            MWINDSPD: 100,
            GUST: 100,
        },
        precision: {
            HTSGW: 1,
            SWELL1: 1,
            SWELL2: 1,
            WVHGT: 1,
            PERPW: 0,
            SWPER1: 0,
            SWPER2: 0,
            WVPER: 0,
            APCP: 1,
            APCP1: 1,
            WINDSPD: 0,
            GUST: 0,
            MWINDSPD: 0,
            WCHILL: 0,
            TMPE: 0,
            TMP: 0,
            WINDDIR: 0,
        },
        dir_average: {
            WINDDIR: "WINDSPD",
            DIRPW: "HTSGW",
            SWDIR1: "SWELL1",
            SWDIR2: "SWELL2",
            WVDIR: "WVHGT",
        },
    };
    a.getSettings = function () {
        return b;
    };
    a.getSetting = function (a, d) {
        return b[a] && b[a][d] ? b[a][d] : !1;
    };
    a.SDtoUV = function (a, b) {
        return [-a * Math.sin((Math.PI / 180) * b), -a * Math.cos((Math.PI / 180) * b)];
    };
    a.UVtoSD = function (a, b) {
        var c = Math.sqrt(a * a + b * b);
        a = (180 / Math.PI) * Math.atan2(-a, -b);
        0 > a && (a += 360);
        return [c, a];
    };
    a.waveEnergy = function (a, b) {
        return isNaN(a) || isNaN(b) ? null : Math.round(0.4906 * Math.pow(a, 2) * b * b);
    };
    a.degAvg = function (a, b) {
        for (var c = 0, d = 0, g = 0; g < a.length; g++) {
            var h = a[g];
            c += Math.sin((Math.PI / 180) * h);
            d += Math.cos((Math.PI / 180) * h);
        }
        a = (180 / Math.PI) * Math.atan2(c, d);
        !1 !== b && 0 > a && (a += 360);
        return a;
    };
    return a;
})();
WG.Fcst = (function () {
    function a() {
        return !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
    }
    function b(a) {
        WG.log("updateTimeText", a);
        var b = moment.utc(a);
        return moment.utc(a).local().format("D.M. HH:mm") + " (" + b.format("HH:mm z") + ")";
    }
    function c(a) {
        e.extend(
            this,
            {
                id_model: 0,
                initstr: null,
                id_spot: 0,
                lat: null,
                lon: null,
                alt: null,
                WGCACHEABLE: !1,
                cachefix: "",
                data: [],
            },
            a
        );
        var b = this;
        b.loaded = e.Deferred();
        b.uid = b.id_model + "|" + b.initstr + "|" + b.id_spot + "|" + b.lat + "|" + b.lon;
        b._idx = [];
        b._var_settings = WG.Var.getSettings();
        this.load = function () {
            if ("resolved" == b.loaded.state()) return b.loaded;
            var a = {},
                c = {
                    spinner: !1,
                };
            a.q = "forecast";
            a.id_model = b.id_model;
            a.initstr = b.initstr;
            b.id_spot
                ? ((a.id_spot = b.id_spot), b.WGCACHEABLE && ((a.WGCACHEABLE = b.WGCACHEABLE), (a.cachefix = b.cachefix), WG.forecast_api && (c.api = WG.forecast_api)))
                : ((a.lat = b.lat), (a.lon = b.lon), null !== b.alt && (a.alt = b.alt));
            WG.apiG(
                a,
                function (a) {
                    b.data = a;
                    WG.log("loaded uid " + b.uid);
                    a.wgmodel && (b.wgmodel = new WG.Model(a.wgmodel));
                    b.loaded.resolve();
                },
                c
            );
            return b.loaded;
        };
        this.toString = function () {
            var a = "ForecastData: id_model:" + b.id_model + ", initstr:" + b.initstr;
            return (a = b.id_spot ? a + (" id_spot: " + b.id_spot) : a + (", lat: " + b.lat + ", lon:" + b.lon));
        };
        this.copyDataPropsFrom = function (a, b) {
            for (var c = 0; c < b.length; c++) this.data[b[c]] = a.data[b[c]];
        };
        this.initstampIdx = function () {
            var a = this.data.fcst;
            this._idx = [];
            for (var b = 0; b < a.hours.length; b++) this._idx[a.initstamp + 3600 * a.hours[b]] = b;
        };
        b.loaded.then(function () {
            WG.log("loaded " + b);
        });
    }
    function d(d) {
        function h(a) {
            function b(a, b, c) {
                var d = a._idx[b],
                    f = a._idx[b + 3600],
                    g = a._idx[b + 7200],
                    aa = a._idx[b - 3600];
                b = a._idx[b - 7200];
                a = a.data.fcst;
                return 3 != a.hours[1] - a.hours[0]
                    ? null
                    : -1 < e.inArray(c, ["APCP1"])
                    ? E(a.APCP)
                        ? da(a.APCP[d])
                            ? a.APCP[d] / 3
                            : da(a.APCP[f])
                            ? a.APCP[f] / 3
                            : da(a.APCP[g])
                            ? a.APCP[g] / 3
                            : null
                        : null
                    : E(a[c])
                    ? -1 < e.inArray(c, ["TCDC", "MCDC", "LCDC", "HCDC"])
                        ? da(a[c][f])
                            ? a[c][f]
                            : da(a[c][g])
                            ? a[c][g]
                            : null
                        : da(a[c][f]) && da(a[c][b])
                        ? (2 / 3) * a[c][f] + (1 / 3) * a[c][b]
                        : da(a[c][g]) && da(a[c][aa])
                        ? (1 / 3) * a[c][g] + (2 / 3) * a[c][aa]
                        : null
                    : null;
            }
            function d(a, c, d) {
                for (var e = null, f = null, g = null, I = 0, O = h._var_settings.dir_average[a] ? !0 : !1, ma = {}, l = [], ib = [], C = [], m = 0; m < n.length; m++) {
                    var ka = n[m].data.fcst;
                    if (!n[m].wgmodel.wave) {
                        var p = aa[ka.id_model];
                        isNaN(p) && (p = 1);
                        var D = n[m]._idx[c];
                        "APCP1" != a || ka[a] || (ka[a] = []);
                        if (ka[a]) {
                            if (da(ka[a][D])) var t = ka[a][D];
                            else if (((t = b(n[m], c, a)), null === t)) continue;
                            ma[ka.id_model] = {};
                            if (O) {
                                var q = h._var_settings.dir_average[a];
                                if (da(ka[q][D])) D = ka[q][D];
                                else if (((D = b(n[m], c, q)), null === D)) continue;
                                t = WG.Var.SDtoUV(D, t);
                                f += p * t[0];
                                g += p * t[1];
                                ma[ka.id_model].val_u = t[0];
                                ma[ka.id_model].val_v = t[1];
                                p && (ib.push(t[0]), C.push(t[1]));
                            } else (e += p * t), (ma[ka.id_model].val = t), p && l.push(t);
                            ma[ka.id_model].wgt = p;
                            I += p;
                        }
                    }
                }
                if (!I) return null;
                for (var Na in ma) ma[Na].wgt /= I;
                c = {
                    data: ma,
                };
                O || ((c.stdev = ss.standardDeviation(l)), (c.count = l.length));
                k[a][d] = c;
                if (O) {
                    if (null !== f && null != g) return (a = WG.Var.UVtoSD(f / I, g / I)), a[1];
                } else if (null !== e) return e / I;
                return null !== f && null != g ? ((a = WG.Var.UVtoSD(f / I, g / I)), a[1]) : null;
            }
            var f = y.resWeights(a.res_sensitivity),
                g = y.initWeights(a.init_sensitivity),
                aa = {},
                h = new c({
                    id_model: 100,
                });
            h.copyDataPropsFrom(M[0], ["sunrise", "sunset", "tzid"]);
            for (var n = [], C = moment.utc(M[0].data.fcst.update_last), l = 0; l < M.length; l++)
                if (M[l].data.fcst) {
                    var m = M[l].id_model;
                    aa[m] = f[m] * g[m] * a.model_koef[m];
                    n.push(M[l]);
                    C = moment.max(C, moment.utc(M[l].data.fcst.update_last));
                }
            h.data.fcst = [];
            h.data.stat = [];
            a = h.data.fcst;
            var k = h.data.stat;
            a.hours = [];
            a.vars = [];
            WG.logTime("BLEND");
            var p = n[0].data.fcst.initstamp;
            g = n[0].data.fcst.initstamp;
            f = [];
            for (l = 0; l < n.length; l++) (m = n[l].data.fcst), m.initstamp < p && (p = m.initstamp), m.initstamp > g && (g = m.initstamp);
            a.initstamp = g;
            for (l = 0; l < n.length; l++) {
                m = n[l].data.fcst;
                var D = n[l].wgmodel;
                D.wave && (ja = n[l].data.fcst);
                n[l].initstampIdx();
                for (var t = 0; t < m.hours.length; t++) (p = m.initstamp + 3600 * m.hours[t]), p < g || (-1 == f.indexOf(p) && f.push(p));
                if (!D.wave) for (t = 0; t < m.vars.length; t++) -1 == a.vars.indexOf(m.vars[t]) && (a.vars.push(m.vars[t]), (a[m.vars[t]] = []));
            }
            -1 == a.vars.indexOf("APCP1") && (a.vars.push("APCP1"), (a.APCP1 = []));
            f = f.sort(function (a, b) {
                return a - b;
            });
            for (g = 0; g < f.length; g++) (p = f[g]), p < a.initstamp || a.hours.push((p - a.initstamp) / 3600);
            h.initstampIdx();
            WG.log("BLEND ForecastData", h);
            for (l = 0; l < a.vars.length; l++) k[a.vars[l]] = [];
            for (g = 0; g < f.length; g++) for (m = h._idx[f[g]], l = 0; l < a.vars.length; l++) a[a.vars[l]][m] = d(a.vars[l], f[g], m);
            a.model = "wg";
            a.model_longname = a.model_name = "WG";
            WG.log("BLEND fcst", a);
            WG.log("BLEND stat", k);
            WG.logTimeEnd("BLEND");
            h.data.fcst.update_last = C.local().format("YYYY-MM-DD HH:mm:ss");
            A = e.extend({}, h.data);
            return h;
        }
        function p(a, b) {
            if (!(2 > M.length)) {
                for (var c = 0; c < M.length; c++)
                    if (M[c].id_model == b) {
                        var d = M[c].data.fcst;
                        var e = M[c];
                        break;
                    }
                if (d) {
                    var f = d.initstamp / 3600 - l.initstamp / 3600;
                    b = [];
                    for (c = 0; c < l.hours.length; c++) {
                        b[c] = -1;
                        for (var g = 0; g < d.hours.length; g++)
                            if (d.hours[g] + f == l.hours[c]) {
                                b[c] = g;
                                break;
                            }
                    }
                    for (f = 0; f < d.vars.length; f++)
                        if (((g = d.vars[f]), !l.newvar))
                            for (l[g] = [], c = 0; c < l.hours.length; c++) {
                                l[g][c] = E(d[g][b[c]]) ? d[g][b[c]] : null;
                                var aa = !1;
                                a.wgmodel && e.wgmodel && e.wgmodel.hr_step > a.wgmodel.hr_step && (aa = !0);
                                if (aa && !da(l[g][c])) {
                                    aa = b[c + 1];
                                    var I = b[c + 2],
                                        h = b[c - 1],
                                        n = b[c - 2];
                                    if (!e.wgmodel.wave) {
                                        if (da(d[g][aa]) && da(d[g][n])) {
                                            l[g][c] = (2 / 3) * d[g][aa] + (1 / 3) * d[g][n];
                                            continue;
                                        }
                                        if (da(d[g][I]) && da(d[g][h])) {
                                            l[g][c] = (1 / 3) * d[g][I] + (2 / 3) * d[g][h];
                                            continue;
                                        }
                                    }
                                    da(d[g][h]) ? (l[g][c] = d[g][h]) : da(d[g][aa]) && (l[g][c] = d[g][aa]);
                                }
                            }
                }
            }
        }
        function q() {
            if (-1 < e.inArray("TMPE", U) && -1 == e.inArray("TMP", U) && !l.TMPE) {
                var a = U.indexOf("TMPE");
                U[a] = "TMP";
            }
        }
        function n() {
            if (!A.error) {
                Ja = jb();
                y.wrapped = Ja;
                WG.log("wrapped? " + y.wrapped);
                U = u.params;
                var a = e.inArray("MWINDSPD", U);
                -1 == a || u.modification ? ((l.modifikace = u.modification), (l.id_modifikace = u.id_modifikace)) : U.splice(a, 1);
                var b = Oa();
                a = 0;
                S = [];
                if (Ja) {
                    b = Math.ceil(b / 2);
                    qa();
                    for (var c = 0; c < l.hours.length; c++)
                        if ((!1 !== ra(c) && a++, a == b)) {
                            S[0] = [0, c + 1];
                            S[1] = [S[0][1], l.hours.length];
                            break;
                        }
                } else S[0] = [0, l.hours.length];
                for (var f in v.unit_type) Aa[v.unit_type[f]] = v.current_units[v.unit_type[f]];
                for (c = 0; c < U.length; c++) if (v.calculate[U[c]]) v.calculate[U[c]](l);
                ba();
                C();
                e(function () {
                    e(window).on(
                        "resize WG:tabresize",
                        WG.debounce(function () {
                            Ba();
                        }, 300)
                    );
                });
                f = "forecast";
                u.vt && (f = u.vt);
                if ("fcst_graph" == u.vt || 2 == u.vt) f = "fcst_graph";
                1 == u.vt && (f = "forecast");
                d.show && (f = d.show);
                (f && "forecasts" != f) || (f = "forecast");
                y.show(f, !1);
                WG.Fcst.forecasts[y.table_id] = y;
                d.callback && d.callback();
                if (d.blend)
                    F.find(".param.MIX").on("click", function () {
                        F.find(".mixparam").toggleClass("on");
                    });
            }
        }
        function m(a, b, c, d, f) {
            a = this.param = a;
            b = this.sada = b;
            var g = (this.id = P + "_" + b + "_" + a);
            this.rownr = 1;
            this.height = v.cell_height_default;
            this.width = 0;
            v.cell_height[a] && (this.height = v.cell_height[a]);
            this.position = [0, 0];
            var I = "param " + a;
            f && (I = "mixparam " + f);
            this.getHtml = function () {
                var b, e;
                var aa = '<tr id="' + g + '" class="' + I + '">';
                var h = r(a);
                var n = Z(a, h);
                qa();
                for (var O = c; O < d; O++)
                    if ((u.space_hr == l.hours[O] && (aa += ca()), !1 !== ra(O)))
                        if (v.special[a]) aa += v.special[a](O, f ? f : a);
                        else if (((palete = v.colors[a] ? v.colors[a] : ""), (b = N(O, a, palete)))) aa += b;
                        else {
                            b = e = l[a][O];
                            var ma = !1;
                            E(v.bold[a]) && b > v.bold[a] && (ma = !0);
                            h && (e = wa(b, h));
                            e = ia(e, n);
                            aa += J(O, a, e, WgColors[palete].getRGBA(b), ma ? "bold" : "", T(a, O));
                        }
                return aa + "</tr>";
            };
            this.getLegendHtml = function () {
                var b = "";
                var c = r(a);
                b += "<th>" + na("legend", a, "");
                c && (b += ' <span class="href switchunits" data-param="' + a + '" data-table_id="' + P + '">(' + na("units", c) + ")</span>");
                return b + "</th>";
            };
            this.getLegendHtmlTr = function () {
                var b = '<tr id="legend_' + g + '" class="' + I + '">';
                var c = r(a);
                b += "<td>" + na("legend", a, "");
                c && (b += ' <span class="href switchunits" data-param="' + a + '" data-table_id="' + P + '">(' + na("units", c) + ")</span>");
                return b + "</td></tr>";
            };
            this.getLegend$tr = function () {
                return e("#legend_" + g);
            };
            this.setRowNr = function (a) {
                this.rownr = a;
            };
            this.setRowHeight = function (a) {
                this.height = a;
            };
            this.setRowPosition = function (a) {
                this.position = a;
            };
            this.get$ = function () {
                return e("#" + this.id);
            };
        }
        function t() {
            var a = l.modifikace;
            if (!a) return !1;
            if (!E(l.SMERN) && E(l.WINDDIR)) {
                l.SMERN = [];
                for (var b = 0; b < l.hours.length; b++) {
                    var c = l.SMERN,
                        d = b,
                        e = void 0,
                        f = l.WINDDIR[b];
                    0 <= f && (e = 0);
                    11.25 <= f && (e = 1);
                    33.75 <= f && (e = 2);
                    56.25 <= f && (e = 3);
                    78.75 <= f && (e = 4);
                    101.25 <= f && (e = 5);
                    123.75 <= f && (e = 6);
                    146.25 <= f && (e = 7);
                    168.75 <= f && (e = 8);
                    191.25 <= f && (e = 9);
                    213.75 <= f && (e = 10);
                    236.25 <= f && (e = 11);
                    258.75 <= f && (e = 12);
                    281.25 <= f && (e = 13);
                    303.75 <= f && (e = 14);
                    326.25 <= f && (e = 15);
                    348.75 <= f && (e = 0);
                    c[d] = e;
                }
            }
            if (!E(l.WINDSPD) || !E(l.SMERN)) return !1;
            l.MWINDSPD = [];
            for (b = 0; b < l.hours.length; b++)
                if (a) {
                    c = l.MWINDSPD;
                    d = b;
                    e = a;
                    f = l.WINDSPD[b];
                    var g = l.SMERN[b];
                    e = oa(f) || oa(g) ? null : e.koef[g] * f;
                    c[d] = e;
                } else l.MWINDSPD[b] = null;
        }
        function w(a) {
            for (var b = -Number.MIN_VALUE, c = 1; c < l.hours.length; c++) oa(l[a][c]) || (l[a][c] > b && (b = l[a][c]));
            return b;
        }
        function B(a, b, c) {
            var d = -Number.MIN_VALUE,
                e = Number.MAX_VALUE;
            if (!a || !a.z) return [0, 0];
            for (var f = 0; f < a.z.length; f++) {
                var g = a.z[f];
                for (var I = 0; I < g.length; I++) (E(b) && a.y[I] < b) || (E(c) && a.y[I] > c) || (g[I] < e && (e = g[I]), g[I] > d && (d = g[I]));
            }
            return [e, d];
        }
        function W(a) {
            for (var b = Number.MAX_VALUE, c = 1; c < l.hours.length; c++) oa(l[a][c]) || (l[a][c] < b && (b = l[a][c]));
            return b;
        }
        function ca(a) {
            return J(0, "", a || "", "", "spacer");
        }
        function J(a, b, c, e, f, g, h) {
            h = h || "";
            var I = (b = a = ""),
                n = "";
            e && (I += "background-color:" + e);
            e = u.click_fname ? "onclick='" + u.click_fname + "(this);'" : "";
            g && (b = " data-x='" + JSON.stringify(g).replace(/'/g, "&apos;") + "' " + e);
            g && (f += " wgfcst-clickable");
            (f += "") && (a = ' class="' + f + '"');
            I && (n = ' style="' + I + '"');
            d.blend && (c += '<div class="mix"></div>');
            return "<td " + n + a + b + h + ">" + c + "</td>";
        }
        function X(a, b, c, d, e) {
            var f = "",
                g = "";
            e = e || {
                width: v.cell_width_default,
            };
            var I = "",
                h = "";
            b && (I += "background-color:" + b);
            e.width && (I += "width:" + e.width + "px !important;");
            d && (g = " data-x='" + JSON.stringify(d).replace(/'/g, "&apos;") + "' onclick='" + u.click_fname + "(this);'");
            d && (c += " wgfcst-clickable");
            c && (f = ' class="' + c + '"');
            I && (h = ' style="' + I + '"');
            return "<div " + h + f + g + ">" + a + "</div>";
        }
        function ea(a, b) {
            var c;
            if ((c = N(a, b, ""))) return c;
            c = l[b][a];
            c = 1000 < c ? ia(c / 1000, 1) + "k" : ia(c, -1);
            return J(a, b, c, "#FFFFFF", "", T(b, a));
        }
        function Y(a, b) {
            var c,
                d = "";
            if ((c = N(a, b, ""))) return c;
            l[b][a] > v.bold[b] && (d += "font-weight:bold !important; ");
            var e = l[b][a];
            c = ia(e, -1);
            1000 < e && (c = ia(e / 1000, 1) + "k");
            10000 < e && (c = ia(e / 1000, 0) + "k");
            return J(a, b, '<span style="' + d + '">' + c + "</span>", WgColors.wpower.getRGBA(l[b][a]), "", T(b, a));
        }
        function z(a, b, c) {
            var d,
                e = "";
            if ((d = N(a, b, v.colors[b], !1, !1, c))) return d;
            if (!E(l.PCPT)) return J(a, b, "-", "#FFFFFF", e, T(b, a));
            1 == l.PCPT[a] && (e += " snow");
            return J(a, b, la(l[b][a], b), WgColors[v.colors[b]].getRGBA(l[b][a]), e, T(c, a));
        }
        function Q(a, b, c) {
            if (x(a, b)) return J(a, b, "-", "#FFFFFF", "", T(b, a));
            if (E(v.minval_depend[b]) && l[v.minval_depend[b]][a] < v.minval[v.minval_depend[b]]) return J(a, b, "&nbsp;", "#FFFFFF", "", T(c || b, a));
            Z(b);
            var d = la(l[b][a], b);
            var e = Pa(d),
                f = "" + d;
            if ("num" == r(b)) return J(a, b, f + "&deg;", "#FFFFFF", "", T(c || b, a));
            g && u.svg_allow
                ? ((e =
                      '<svg version="1.1" class="arrow" viewBox="0 0 100 100"><g transform="rotate(' +
                      (180 + parseInt(d)) +
                      ',50,50) translate(0,5)"><path d="m50,0 -20,30 16,-3 -3,63 14,0 -3,-63 16,3 -20,-30z" fill="black" stroke-width="0"></path></g></svg>'),
                  (f = ""),
                  WgLang && (f = WgLang.dir[Pa(d)]),
                  (d = '<span title="' + f + " (" + d + '&deg;)">' + e + "</span>"))
                : (d =
                      '<img src="' +
                      u.path_img +
                      'sipka.png" class="sipka" style="transform:rotate(' +
                      f +
                      "deg);-webkit-transform:rotate(" +
                      f +
                      "deg);-moz-transform:rotate(" +
                      f +
                      "deg);-ms-transform:rotate(" +
                      f +
                      "deg);-o-transform:rotate(" +
                      f +
                      'deg);" title="' +
                      na("dir", e) +
                      " (" +
                      f +
                      '&deg;)" alt="' +
                      na("dir", e) +
                      '"/>');
            return J(a, b, d, "#FFFFFF", "", T(c || b, a));
        }
        function x(a, b) {
            return !E(l[b]) || oa(l[b][a]) ? !0 : !1;
        }
        function N(a, b, c, d, e, f) {
            if (x(a, b)) return J(a, b, "-", "#FFFFFF", d, T(f || b, a));
            c = c ? WgColors[c].getRGBA(l[b][a]) : "#FFFFFF";
            return E(v.minval[b]) && l[b][a] < v.minval[b]
                ? J(a, b, "&nbsp;", c, d, T(f || b, a))
                : E(v.minval_depend[b]) && E(l[v.minval_depend[b]]) && l[v.minval_depend[b]][a] < v.minval[v.minval_depend[b]]
                ? (v.minval_bgcolor_depend[b] && (c = "#FFFFFF"), J(a, b, "&nbsp;", c, d, T(f || b, a)))
                : !1;
        }
        function K(a, b, c, d, e, f) {
            if (x(a, b)) return X("-", "#FFFFFF", d, T(f || b, a));
            c = c ? WgColors[c].getRGBA(l[b][a]) : "#FFFFFF";
            return E(v.minval[b]) && l[b][a] < v.minval[b]
                ? X("&nbsp;", c, d, T(f || b, a))
                : E(v.minval_depend[b]) && E(l[v.minval_depend[b]]) && l[v.minval_depend[b]][a] < v.minval[v.minval_depend[b]]
                ? (v.minval_bgcolor_depend[b] && (c = "#FFFFFF"), X("&nbsp;", c, d, T(f || b, a)))
                : !1;
        }
        function T(a, b) {
            if (!u.fcst_maps) return !1;
            b = {
                id_model: A.id_model,
                id_spot: H.id_spot,
                spot: A.spot,
                initstr: l.initstr,
                hr: l.hours[b],
                center: [H.lat, H.lon],
                tzid: H.tzid,
                init_h: l.init_h,
                init_dm: l.init_dm,
                weekday: fa[b].day(),
                model_name: l.model_name,
            };
            d.var_map && (b.map = d.var_map[a] || "");
            return b.map ? b : !1;
        }
        function la(a, b) {
            return E(v.precision[b]) ? ia(a, v.precision[b]) : ia(a, 0);
        }
        function R(a) {
            if (a) {
                for (var b in a) u[b] = a[b];
                E(a.lang) && (Ca = a.lang);
                E(a.wj) && (v.current_units.wind = a.wj);
                E(a.tj) && (v.current_units.temp = a.tj);
                E(a.waj) && (v.current_units.wave = a.waj);
                u.odh = parseInt(u.odh);
                u.doh = parseInt(u.doh);
                u.fhours = parseInt(u.fhours);
                u.wrap = parseInt(u.wrap);
                u.limit1 = parseFloat(u.limit1);
                u.limit2 = parseFloat(u.limit2);
                u.limit3 = parseFloat(u.limit3);
                u.tlimit = parseFloat(u.tlimit);
            }
        }
        function r(a) {
            return E(v.unit_type[a]) ? Aa[v.unit_type[a]] : !1;
        }
        function Z(a, b) {
            var c = 0;
            E(v.precision[a]) && (c = v.precision[a]);
            b && E(v.precision_units[b]) && (c = v.precision_units[b]);
            return c;
        }
        function ba() {
            for (var a = [], b = 0; b < U.length; b++)
                if (v.nodatahide[U[b]]) {
                    a: {
                        var c = U[b];
                        if (E(l[c])) {
                            qa();
                            for (var d = 0; d < l.hours.length; d++)
                                if (!1 !== ra(d) && null !== l[c][d]) {
                                    c = !0;
                                    break a;
                                }
                        }
                        c = !1;
                    }
                    c && a.push(U[b]);
                } else a.push(U[b]);
            U = a;
            if (-1 < e.inArray("FLHGT", U) && E(l.FLHGT) && (1 == u.show_flhgt_opt || 2 == u.show_flhgt_opt)) {
                a = 999;
                1 == u.show_flhgt_opt && (a = 5);
                2 == u.show_flhgt_opt && (a = 0);
                var f;
                E(l.TMPE) ? (f = l.TMPE) : E(l.TMP) && (f = l.TMP);
                if (f) {
                    c = !1;
                    qa();
                    for (b = 0; b < l.hours.length; b++)
                        if (!1 !== ra(b) && null !== f[b] && f[b] < a) {
                            c = !0;
                            break;
                        }
                    c || WG.arrayRemove(U, "FLHGT");
                }
            }
        }
        function C() {
            V = [];
            for (var a = 0, b = 0, c = 0; c < S.length; c++) {
                ha[c] = [];
                for (var e = 0; e < U.length; e++) {
                    var f = new m(U[e], c, S[c][0], S[c][1]);
                    ha[c].push(f);
                    if (d.blend && d.blend.mix_range[U[e]]) {
                        var g = new m("MIXPARAM", c, S[c][0], S[c][1], U[e]);
                        ha[c].push(g);
                    }
                    V.push(f);
                    a++;
                    f.setRowNr(a);
                    f.setRowPosition([0, b]);
                    b += f.height + v.cell_hspace;
                }
            }
        }
        function D(a, b, c) {
            sa.empty();
            F.find(".table_legend").remove();
            v.menujs[a] && (v.menujs[a](sa, c), (Qa = a));
            sa.width("auto").height("auto");
            0 < F.find("tbody").length ? F.hasClass("remove") && (F.removeClass("remove"), Ba(!0)) : F.hasClass("remove") || (F.addClass("remove"), Ba(!0));
            F.find(".active").removeClass("active");
            F.find('*[data-name="' + a + '"]').addClass("active");
            b && F.find('*[data-name="' + b + '"]').addClass("active");
        }
        function G() {
            u.tide && (u.tide.style_orig || (u.tide.style_orig = u.tide.style), (u.tide.style = "full"), (u.tide.min = 0), n());
        }
        function ya(a, b, c) {
            for (var d = 0; d < b.length; d++) {
                var f = b[d],
                    g = c ? c.name : null,
                    h = f.force_name ? f.force_name : na("tab", f.name);
                f.icon && (h = f.icon + h);
                h = e('<a data-name="' + f.name + '">' + h + "</a>");
                var n = f["class"] ? e('<li class="' + f["class"] + '">') : e("<li>");
                n.append(h);
                if (f.menu) {
                    var I = e("<ul>");
                    n.append(I);
                    ya(I, f.menu, f);
                }
                a.append(n);
                if (v.fn[f.name])
                    h.on("click", function () {
                        var a = e(this).data("name");
                        v.fn[a]();
                    });
                if (v.menujs[f.name])
                    h.on("click", function () {
                        var a = e(this).data("name");
                        D(a, g);
                    });
            }
            return a;
        }
        function kb() {
            for (var a = Ka.init, b = l.hours, c = [], d = 0; d < b.length; d++) c.push(a.clone().add(b[d], "hours").tz(H.tzid));
            return c;
        }
        function lb() {
            for (var a = "", b = 0; b < S.length; b++) {
                a += '<table class="tabulka"><tbody>';
                if (u.date_compact) {
                    var c = S[b][0],
                        e = S[b][1],
                        f = null;
                    var g = '<tr id="' + P + "_" + b + '_days" class="tr_days">';
                    var h = [],
                        n = c,
                        C = 0;
                    qa();
                    for (var m = c; m < e; m++)
                        if (!1 !== ra(m)) {
                            null === f && (f = fa[m].day());
                            var k = fa[m].day();
                            f === k ? (C++, (h[m] = 0)) : ((h[n] = C), (C = 1), (f = k), (n = m));
                        }
                    h[n] = C;
                    WG.log("date spans", h);
                    qa();
                    for (m = c; m < e; m++)
                        !1 !== ra(m) &&
                            h[m] &&
                            ((k = fa[m].day()),
                            (c = 1 < h[m] ? ' colspan="' + h[m] + '"' : ""),
                            (f = na("weekday", k) + " " + fa[m].format("D.M.")),
                            c || (f = na("weekday", k)),
                            k != y._daycss_daynum && (y._daycss_d = 1 == y._daycss_d ? 2 : 1),
                            (y._daycss_daynum = k),
                            (g += J(m, "", f, "", "dayspan day" + y._daycss_d, "", c)));
                    a += g + "</tr>";
                    m = S[b][0];
                    e = S[b][1];
                    h = null;
                    g = '<tr id="' + P + "_" + b + '_hours" class="tr_hours">';
                    for (qa(); m < e; m++)
                        u.space_hr == l.hours[m] &&
                            (g += ca('<div class="tablemark"><div class="tablemark-init"> init: ' + l.init_prev_dm + " " + l.init_prev_h + ' UTC <svg class="icon dark"><use xlink:href="#ico_show_legend"></use></svg></div></div>')),
                            !1 !== ra(m) && (null === h && (h = fa[m].day()), (k = fa[m].day()), h !== k && (y._daycss_h = 1 == y._daycss_h ? 2 : 1), (g += J(m, "", fa[m].format("HH") + "h", "", "day" + y._daycss_h)), (h = k));
                    a += g + "</tr>";
                } else {
                    y._daycss = 1;
                    m = S[b][0];
                    e = S[b][1];
                    h = null;
                    g = '<tr id="' + P + "_" + b + '_dates" class="tr_dates">';
                    for (qa(); m < e; m++)
                        u.space_hr == l.hours[m] &&
                            (g += ca('<div class="tablemark"><div class="tablemark-init"> init: ' + l.init_prev_dm + " " + l.init_prev_h + ' UTC <svg class="icon dark"><use xlink:href="#ico_show_legend"></use></svg></div></div>')),
                            !1 !== ra(m) &&
                                (null === h && (h = fa[m].day()),
                                (k = fa[m].day()),
                                h !== k && (y._daycss = 1 == y._daycss ? 2 : 1),
                                (g += J(m, "", na("weekday", k) + "<br>" + fa[m].format("D") + ".<br>" + fa[m].format("HH") + "h", "", "day" + y._daycss)),
                                (h = k));
                    a += g + "</tr>";
                }
                for (g = 0; g < ha[b].length; g++) a += ha[b][g].getHtml();
                if (u.tide) {
                    g = S[b][0];
                    k = S[b][1];
                    e = b;
                    if (u.tide) {
                        moment.unix(l.initstamp);
                        moment.unix(l.initstamp + 3600 * l.hours[l.hours.length - 1]);
                        qa();
                        h = [];
                        for (m = []; g < k; g++) !1 !== ra(g) && (h.push(fa[g]), m.push(l.hours[g]));
                        k = [];
                        c = h[1].unix() - h[0].unix();
                        k.push({
                            start: h[0].unix() - c / 2,
                            end: h[1].unix() + c / 2,
                            step: c,
                            colspan: 1,
                            range: [h[0].format("DD,HH"), h[1].format("DD,HH")],
                        });
                        for (g = 1; g < h.length; g++)
                            (f = k[k.length - 1]),
                                (n = u.space_hr == m[g] ? !0 : !1),
                                (c = h[g].unix() - h[g - 1].unix()),
                                c != f.step || n
                                    ? (g < h.length - 1
                                          ? ((c = h[g + 1].unix() - h[g].unix()),
                                            k.push({
                                                start: h[g].unix() - c / 2,
                                                end: h[g + 1].unix() + c / 2,
                                                step: c,
                                                colspan: 1,
                                                range: [h[g].format("DD,HH"), h[g + 1].format("DD,HH")],
                                            }))
                                          : ((c = f.step),
                                            k.push({
                                                start: h[g].unix() - c / 2,
                                                end: h[g].unix() + c / 2,
                                                step: c,
                                                colspan: 1,
                                                range: [h[g].format("DD,HH"), h[g].format("DD,HH")],
                                            })),
                                      n && (k[k.length - 1].spacer = !0))
                                    : (f.colspan++, (f.end = h[g].unix() + f.step / 2), (f.range[1] = h[g].format("DD,HH")));
                        e = '<tr id="' + P + "_" + e + '_tides" class="tr_tides' + (d.full ? " full" : "") + '">';
                        for (g = 0; g < k.length; g++)
                            (h =
                                " data-tide='" +
                                JSON.stringify({
                                    start: k[g].start,
                                    end: k[g].end,
                                }) +
                                "' "),
                                k[g].spacer && (e += '<td class="spacer"></td>'),
                                (e += '<td class="tidediv" colspan="' + k[g].colspan + '"' + h + "></td>");
                        g = e + "</tr>";
                    } else g = "";
                    a += g;
                }
                a += "</tbody></table>";
            }
            return a;
        }
        function mb() {
            var a = "",
                b = "";
            a = u.tabs ? a + '<table class="table_legend"><tbody>' : a + '<table class="table_legend notabs"><tbody>';
            l.initstamp && l.init_d && l.init_h && ((b = "" + l.init_d + "<br>" + l.init_h + " UTC"), u.date_compact && (b = "" + l.init_d + " " + l.init_h + " UTC"));
            for (var c = 0; c < S.length; c++) {
                a += '<tr id="legend_' + P + "_" + c + '_dates">';
                var d = "";
                if (0 < c) a += "<td></td>";
                else {
                    var e = moment(l.update_last).local().format("D.M. HH:mm") + " " + moment.tz(moment.tz.guess()).format("z");
                    u.tabs
                        ? (b ? (d = "Init:<br>" + b) : l.update_last && (d = "Updated:<br>" + e + "</span>"), (a += '<td class="td-init"><span class="model-init">' + d + "</span></td>"))
                        : (b ? (d = "<br>" + b) : l.update_last && (d = "<br>" + e + "</span>"), (a += '<td class="td-init"><span class="model-init">' + l.model_name + d + "</span></td>"));
                }
                a += "</tr>";
                for (d = 0; d < ha[c].length; d++) a += ha[c][d].getLegendHtmlTr();
                a += '<tr id="legend_' + P + "_" + c + '_tides"><td>' + na("legend", "TIDE", "") + "</td></tr>";
            }
            return a + "</tbody></table>";
        }
        function nb(a) {
            var b = mb();
            F.prepend(b);
            b = lb();
            a[0].innerHTML = b;
            Da();
            pa();
            La();
            a = F.find(".tabulka");
            a.find("tr.tr_dates, tr.tr_days, tr.tr_hours")
                .off("click")
                .on("click", function () {
                    WG.checkDragging(this) || (u.hrstep_min++, 3 < u.hrstep_min && (u.hrstep_min = 1), n());
                });
            u.tide &&
                (u.tide.style_orig || (u.tide.style_orig = u.tide.style),
                (b = "tr.tr_tides, tr.RATING"),
                "separate" == u.tide.style_orig && (b = "tr.tr_tides"),
                a
                    .find(b)
                    .off("click")
                    .on("click", function () {
                        WG.checkDragging(this) || ((u.tide.style = "full" != u.tide.style ? "full" : u.tide.style_orig), n());
                    }));
            WG.Fcst.openFcstMap &&
                sa.find("table .wgfcst-clickable").click(function () {
                    if (!WG.checkDragging(this)) {
                        var a = e(this).data("x");
                        WG.Fcst.openFcstMap(a);
                    }
                });
            dragscroll.reset();
        }
        function pa(a) {
            a = function (a, b, c, d) {
                d || (d = b);
                fastdom.measure(function () {
                    var f = e("#" + b).outerHeight(!0);
                    c && (f += e("#" + c).outerHeight(!0));
                    f += a;
                    fastdom.mutate(function () {
                        e("#legend_" + d).height(f);
                    });
                });
            };
            for (var b = 0; b < S.length; b++) {
                var c = 0;
                0 < b && (c = 3);
                u.date_compact ? a(c, P + "_" + b + "_days", P + "_" + b + "_hours", P + "_" + b + "_dates") : a(c, P + "_" + b + "_dates");
                for (var d = 0; d < ha[b].length; d++) a(0, ha[b][d].id);
                u.tide && a(c, P + "_" + b + "_tides");
            }
        }
        function Ea(a) {
            var b = {};
            1 >= l.hours[1] - l.hours[0] && (b.hours_label = [0, 3, 6, 9, 12, 15, 18, 21]);
            var c = moment.unix(l.initstamp),
                d = moment.unix(l.initstamp + 3600 * l.hours[l.hours.length - 1]);
            ta.graphHours(a, c, d, b);
            return [c, d];
        }
        function Ra(a, b) {
            var c = v.csteps[b],
                d = Math.floor(wa(a[0], b));
            a = Math.ceil(wa(a[1], b));
            a = WgUtil.rangeArr(d, a, c);
            c = [];
            for (d = 0; d < a.length; d++) {
                var e = d;
                var f = void 0;
                var g = a[d],
                    h = b;
                WgUtil.inArray(h, v.unit.wind) ? (f = "knots") : WgUtil.inArray(h, v.unit.temp) ? (f = "c") : WgUtil.inArray(h, v.unit.wave) && (f = "m");
                f = wa(g, f, h);
                c[e] = f;
            }
            return c;
        }
        function Sa(a, b, c) {
            var d = [];
            b = Z(b, c);
            for (var e = 0; e < a.length; e++) d[a[e]] = ia(wa(a[e], c), b);
            return d;
        }
        function Fa(a, b) {
            a = a || 600;
            b = b || 300;
            var c = e("#nav-windguru");
            if (!c.length) return a;
            c = window.innerHeight - 2 * c.height();
            c < b && (c = b);
            c > a && (c = a);
            return c;
        }
        function Ma(a) {
            var b = e("#nav-windguru");
            if (b.length) {
                var c = e("html").scrollTop(),
                    d = c + b.height(),
                    f = F.offset().top;
                d = window.innerHeight - 2 * b.height() - (f - d);
                F.offset();
                b.height();
                d < a &&
                    ((a = c + (a - d)),
                    a > f && (a = f - b.height()),
                    e("html").animate(
                        {
                            scrollTop: a,
                        },
                        700
                    ));
            }
        }
        function Ta(b, c, d, f) {
            if (a()) {
                f = void 0 === f ? !0 : !1;
                var g = l.hours[0],
                    h = l.hours[l.hours.length - 1],
                    n = Ga(17, 23),
                    m = Fa();
                b.width(n).height(m).css("background-color", "#FFFFFF !important");
                b.svg();
                b = new WgSvg.Canvas(b);
                b.svg.rect(0, 0, n, m, 0, 0, {
                    fill: "#FFFFFF",
                    strokeWidth: 0,
                });
                var C = new WgSvg.Graph(
                    b,
                    {
                        px_position: [0, 0],
                        px_dimensions: [n, m],
                        px_padding: [30, 40, 0, 0],
                        clip: !0,
                    },
                    {
                        opacity: 1,
                    }
                );
                var k = [g, h],
                    O = [c, d];
                C.setRange(k, O);
                C.setRange(k, O);
                A.TMP_2d ||
                    ((k = {
                        id_spot: H.id_spot,
                        id_model: A.id_model,
                        q: "data_2d",
                        vars: ["TMP,0,5500"],
                        md5chk: A.md5chk,
                    }),
                    H.id_spot || ((k.lat = H.lat), (k.lon = H.lon)),
                    e.ajax({
                        url: WG.getApi(),
                        dataType: "json",
                        data: k,
                        async: !1,
                        success: function (a) {
                            A.TMP_2d = a;
                        },
                    }));
                O = B(A.TMP_2d.TMP, c, d + 1000);
                k = r("TMP");
                O = Ra(O, k);
                var I = !1;
                "knots" != k && (I = Sa(O, "TMP", k));
                C.contours(A.TMP_2d.TMP, O, WgColors.temp);
                C.contourNumbers(
                    {
                        px_spacing: 200,
                    },
                    {},
                    I
                );
                l.FLHGT &&
                    (C.setXVals(l.hours),
                    C.line(l.FLHGT, 0.6, {
                        stroke: "#0000FF",
                    }),
                    C.numbers(
                        l.FLHGT,
                        {
                            offset_v: 3,
                            skip: 1,
                        },
                        {
                            fill: "#0000FF",
                        }
                    ));
                C = new WgSvg.Graph(
                    b,
                    {
                        px_position: [0, 0],
                        px_dimensions: [n, m],
                        px_padding: [0, 40, 0, 0],
                    },
                    {
                        opacity: 1,
                    }
                );
                O = Ea(C);
                C = new WgSvg.Graph(b, {
                    px_position: [0, 0],
                    px_dimensions: [n, m],
                    px_padding: [30, 40, 0, 0],
                });
                C.setRange([g, h], [c, d]);
                ua(C, c, d, g, h);
                Ha(C, n, " ");
                f && Ma(m);
            } else Ia(b);
        }
        function Ua(b, c, d, f) {
            if (a()) {
                f = void 0 === f ? !0 : !1;
                var g = l.hours[0],
                    h = l.hours[l.hours.length - 1],
                    n = Ga(17, 23),
                    m = Fa();
                b.width(n).height(m).css("background-color", "#FFFFFF !important");
                b.svg();
                b = new WgSvg.Canvas(b);
                b.svg.rect(0, 0, n, m, 0, 0, {
                    fill: "#FFFFFF",
                    strokeWidth: 0,
                });
                var C = new WgSvg.Graph(
                    b,
                    {
                        px_position: [0, 0],
                        px_dimensions: [n, m],
                        px_padding: [30, 40, 0, 0],
                        clip: !0,
                    },
                    {
                        opacity: 1,
                    }
                );
                C.setRange([g, h], [c, d]);
                if (!A.WIND_2d) {
                    var k = {
                        id_spot: H.id_spot,
                        id_model: A.id_model,
                        q: "data_2d",
                        vars: ["WINDSPD,0,5500", "WINDDIR,0,5500,250"],
                        md5chk: A.md5chk,
                    };
                    H.id_spot || ((k.lat = H.lat), (k.lon = H.lon));
                    e.ajax({
                        url: WG.getApi(),
                        dataType: "json",
                        data: k,
                        async: !1,
                        success: function (a) {
                            A.WIND_2d = a;
                        },
                    });
                }
                if (A.WIND_2d.WINDSPD) {
                    var O = B(A.WIND_2d.WINDSPD, 0, d + 1000);
                    k = r("WINDSPD");
                    "bft" == k && (k = "knots");
                    O = Ra(O, k);
                    k = Sa(O, "WINDSPD", k);
                    C.contours(A.WIND_2d.WINDSPD, O, WgColors.wind);
                    C.contourNumbers(
                        {
                            px_spacing: 250,
                        },
                        {},
                        k
                    );
                    A.WIND_2d.WINDDIR && C.arrows2d(A.WIND_2d.WINDDIR);
                }
                C = new WgSvg.Graph(
                    b,
                    {
                        px_position: [0, 0],
                        px_dimensions: [n, m],
                        px_padding: [0, 40, 0, 0],
                    },
                    {
                        opacity: 1,
                    }
                );
                O = Ea(C);
                C = new WgSvg.Graph(b, {
                    px_position: [0, 0],
                    px_dimensions: [n, m],
                    px_padding: [30, 40, 0, 0],
                });
                C.setRange([g, h], [c, d]);
                ua(C, c, d, g, h);
                Ha(C, n, " ");
                f && Ma(m);
            } else Ia(b);
        }
        function ua(a, b, c, d, e) {
            var f = 100 * Math.round((c / 100 - b / 100) / 11);
            b = Math.round(b / f) * f;
            a.legend(
                {
                    fill: "none",
                    stroke: "#AAAAAA",
                    strokeWidth: 1,
                    opacity: 1,
                    "stroke-dasharray": "3,3",
                },
                {
                    width: 0,
                    left: 0,
                    line_width: 27,
                    line_left: 0,
                    text_left: 3,
                    text_offset: 3,
                    desc_left: 37,
                },
                WgUtil.rangeArr(b, c, f),
                WgUtil.rangeArr(b, c, f),
                {
                    "font-size": "10px",
                    opacity: 1,
                    "text-anchor": "start",
                },
                "Altitude (m)"
            );
            a.gridLinesH(WgUtil.rangeArr(b, c, f), {
                opacity: 0.3,
                "stroke-dasharray": "3,3",
            });
            c = Math.min(A.alt, A.model_alt);
            E(c) &&
                0 < c &&
                a.gridRect(
                    d,
                    e,
                    {
                        strokeWidth: 0,
                        opacity: 0.5,
                        fill: "#FFFFFF",
                    },
                    0,
                    c
                );
            oa(A.alt) ||
                (a.gridLineH(A.alt, {
                    strokeWidth: 1,
                    opacity: 1,
                    "stroke-dasharray": "3,3",
                }),
                a.text(
                    e,
                    A.alt,
                    "Alt: " + A.alt + " m",
                    {
                        offset_h: -2,
                    },
                    {
                        "text-anchor": "end",
                    }
                ));
            oa(A.model_alt) ||
                (a.gridLineH(A.model_alt, {
                    strokeWidth: 1,
                    opacity: 1,
                    stroke: "#AA0000",
                    "stroke-dasharray": "3,3",
                }),
                a.text(
                    d,
                    A.model_alt,
                    "model alt: " + A.model_alt + " m",
                    {
                        offset_h: 2,
                    },
                    {
                        "text-anchor": "start",
                        fill: "#AA0000",
                    }
                ));
        }
        function Va(a) {
            var b = 0,
                c = 0 + a;
            oa(A.alt) || ((b = A.alt), (c = A.alt + a));
            !oa(A.model_alt) && A.model_alt < b && (b = A.model_alt);
            return [b, c];
        }
        function Wa(a, b, c) {
            var d = Xa(b[0], b[1], 300, 3),
                e = d.range;
            -60 < e[0] && (e[0] = -60);
            60 > e[1] && (e[1] = 60);
            var f = a.px_padding;
            a = new WgSvg.Graph(a.canvas, {
                position: a.position,
                dimensions: a.dimensions,
                px_padding: [f[0] + 25, f[1], f[2] + 30, f[3]],
            });
            a.setXVals(d.epochs);
            a.setRange([b[0].unix(), b[1].unix()], e);
            c &&
                (a.gridLinesH([-400, -300, -200, -100, -50, 0, 50, 100, 200, 300, 400]),
                (b = "TIDEgradient" + P),
                a.linearGradientV(b, WgColors.tide),
                a.legend(
                    {
                        fill: "url(#" + b + ")",
                        stroke: "#EAEAEA",
                        strokeWidth: 1,
                        opacity: 1,
                    },
                    {
                        width: 5,
                        left: 5,
                        line_width: 20,
                        line_left: 0,
                        text_left: 12,
                        text_offset: 3,
                        desc_left: 10,
                    },
                    [-400, -300, -200, -100, -50, 0, 50, 100, 200, 300, 400],
                    [-4, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4],
                    {
                        "font-size": "10px",
                        opacity: 1,
                        "text-anchor": "left",
                    },
                    "Level (m)"
                ));
            a.line(d.levels, 0.5, {
                strokeWidth: 1,
                "stroke-dasharray": "2,2",
                stroke: "#7788FF",
            });
            b = {
                "font-size": "10px",
                "font-weight": "normal",
                fill: "#4444FF",
            };
            c = {
                "font-size": "9.5px",
                "font-weight": "normal",
                fill: "#4444FF",
            };
            for (e = 0; e < d.highs.length; e++) {
                f = d.highs[e].level;
                var g = d.highs[e].time;
                g = moment(g);
                g.tz(H.tzid);
                a.text(
                    d.highs[e].time.getTime() / 1000,
                    f,
                    g.format("HH:mm"),
                    {
                        offset_v: 13,
                    },
                    b
                );
                a.text(d.highs[e].time.getTime() / 1000, f, (0 < d.highs[e].level ? "+" : "") + ia(d.highs[e].level, 0) + " cm", {}, c);
            }
            for (e = 0; e < d.lows.length; e++)
                (f = d.lows[e].level),
                    (g = d.lows[e].time),
                    (g = moment(g)),
                    g.tz(H.tzid),
                    a.text(
                        d.lows[e].time.getTime() / 1000,
                        f,
                        g.format("HH:mm"),
                        {
                            offset_v: -23,
                        },
                        b
                    ),
                    a.text(
                        d.lows[e].time.getTime() / 1000,
                        f,
                        ia(d.lows[e].level, 0) + " cm",
                        {
                            offset_v: -12,
                        },
                        c
                    );
        }
        function La() {
            WG.log(F);
            if (u.tide && "none" != u.tide.style && ((!ta.isCustom(!1) && ta.id_spot) || WG.user.pro)) {
                var a = [0, 0];
                F.find(".tidediv").each(function () {
                    var b = e(this),
                        c = b.data();
                    WG.logTime("drawTableTides");
                    var d = moment.unix(c.tide.start),
                        f = moment.unix(c.tide.end),
                        g = Xa(d, f, 300, 3);
                    g.range[0] < a[0] && (a[0] = g.range[0]);
                    g.range[1] > a[1] && (a[1] = g.range[1]);
                    WG.log("tide count", d, f, g.levels.length);
                    WG.logTimeEnd("drawTableTides");
                    var h = e('<div class="tidefcst">').appendTo(b);
                    f = 44;
                    "full" == u.tide.style ? ((d = [25, 0, 25, 0]), (f = 150)) : "separate" == u.tide.style ? ((d = [12, 0, 12, 0]), (f = 50)) : (d = [2, 0, 2, 0]);
                    b = b.width();
                    h.width(b).height(f).css("background-color", "#FFFFFF !important");
                    h.svg();
                    h = new WgSvg.Canvas(h);
                    b = new WgSvg.Graph(h, {
                        px_position: [0, 0],
                        px_dimensions: [b, f],
                        px_padding: d,
                    });
                    d = g.range;
                    -60 < d[0] && (d[0] = -60);
                    60 > d[1] && (d[1] = 60);
                    b.setXVals(g.epochs);
                    b.setRange([c.tide.start, c.tide.end], d);
                    c = "TIDEgradient" + (P + (c.tide.full ? "f" : ""));
                    b.linearGradientV(c, WgColors.tide);
                    "compact" == u.tide.style
                        ? ((c = {
                              fill: "url(#" + c + ")",
                              stroke: "none",
                              opacity: 0.2,
                          }),
                          (d = {
                              strokeWidth: 1,
                              stroke: "#000000",
                              opacity: 0.2,
                          }))
                        : "separate" == u.tide.style
                        ? ((c = {
                              fill: "url(#" + c + ")",
                              stroke: "none",
                          }),
                          (d = {
                              strokeWidth: 1.1,
                              stroke: "#000000",
                          }))
                        : ((c = {
                              fill: "url(#" + c + ")",
                              stroke: "none",
                          }),
                          (d = {
                              strokeWidth: 1.3,
                              stroke: "#000000",
                          }));
                    b.area(g.levels, 0.5, c, {}, 0);
                    b.line(g.levels, 0.5, d);
                    if ("full" == u.tide.style) {
                        h = "#000000";
                        c = {
                            "font-size": "10px",
                            "font-weight": "bold",
                            fill: h,
                        };
                        h = {
                            "font-size": "9.5px",
                            "font-weight": "normal",
                            fill: h,
                        };
                        for (d = 0; d < g.highs.length; d++) {
                            f = g.highs[d].level;
                            var n = g.highs[d].time;
                            n = moment(n);
                            n.tz(H.tzid);
                            var m = g.highs[d].time.getTime() / 1000;
                            b.text(
                                m,
                                f,
                                n.format("HH:mm"),
                                {
                                    offset_v: 13,
                                    hfit: 15,
                                },
                                c
                            );
                            b.text(
                                m,
                                f,
                                (0 < g.highs[d].level ? "+" : "") + ia(g.highs[d].level, 0) + " cm",
                                {
                                    offset_v: 2,
                                    hfit: 20,
                                },
                                h
                            );
                        }
                        for (d = 0; d < g.lows.length; d++)
                            (f = g.lows[d].level),
                                (n = g.lows[d].time),
                                (n = moment(n)),
                                n.tz(H.tzid),
                                (m = g.lows[d].time.getTime() / 1000),
                                b.text(
                                    m,
                                    f,
                                    n.format("HH:mm"),
                                    {
                                        offset_v: -23,
                                        hfit: 15,
                                    },
                                    c
                                ),
                                b.text(
                                    m,
                                    f,
                                    ia(g.lows[d].level, 0) + " cm",
                                    {
                                        offset_v: -12,
                                        hfit: 20,
                                    },
                                    h
                                );
                    }
                    if ("separate" == u.tide.style) {
                        h = "#000000";
                        for (d = 0; d < g.highs.length; d++)
                            (f = g.highs[d].level),
                                (n = g.highs[d].time),
                                (n = moment(n)),
                                n.tz(H.tzid),
                                (m = g.highs[d].time.getTime() / 1000),
                                b.text(
                                    m,
                                    f,
                                    n.format("HH:mm"),
                                    {
                                        offset_v: 2,
                                        hfit: 15,
                                    },
                                    {
                                        "font-size": "9.5px",
                                        "font-weight": "normal",
                                        fill: h,
                                    }
                                );
                        for (d = 0; d < g.lows.length; d++)
                            (f = g.lows[d].level),
                                (n = g.lows[d].time),
                                (n = moment(n)),
                                n.tz(H.tzid),
                                (m = g.lows[d].time.getTime() / 1000),
                                b.text(
                                    m,
                                    f,
                                    n.format("HH:mm"),
                                    {
                                        offset_v: -12,
                                        hfit: 15,
                                    },
                                    {
                                        "font-size": "9.5px",
                                        "font-weight": "normal",
                                        fill: h,
                                    }
                                );
                    }
                });
                WG.log(a);
                u.tide.min && a[1] - a[0] < u.tide.min ? F.find(".tr_tides").hide() : "compact" == u.tide.style && F.find("tr.RATING").addClass("tideback");
            }
        }
        function Ga(a, b) {
            var c = F.parent().width() - Ya();
            a *= l.hours.length;
            a < c && (a = c);
            b *= l.hours.length;
            a > b && (a = b);
            return a;
        }
        function Xa(a, b, c, d) {
            c = ta.calcTideForFcst(a, b, c);
            return ta.tide2Levels(c, a, b, d);
        }
        function ob(a, b, c) {
            var d = e('<div class="graph_help">' + b + "</div>");
            a.append(d);
            d.on("click", function () {
                new WG.Window({
                    title: '<svg class="icon light"><use xlink:href="#ico_help"></use></svg>',
                    src: c,
                    target: d,
                });
            });
        }
        function Ha(a, b, c) {
            A.delayed &&
                a.svg.text(b / 2, 12, na("txt", "delayed_short"), {
                    "font-size": "11px",
                    "font-weight": "normal",
                    opacity: 1,
                    "text-anchor": "middle",
                    fill: "red",
                });
        }
        function xa(a) {
            var b = r(a),
                c = Z(a, b);
            "msd" == b && (c = 0);
            for (var d = [], e = 0; e < l[a].length; e++) (d[e] = b ? wa(l[a][e], b) : l[a][e]), (d[e] = ia(d[e], c));
            return d;
        }
        function pb() {
            if (u.tabs) {
                var a = e('<ul class="sm sm-simple wg-table-menu sm-wg-inline">'),
                    b = e('<div class="navig_table_classic">'),
                    c = l.model_name,
                    f = "";
                if (l.initstamp && l.init_d && l.init_h) f += '<span class="legend-tab-init"><br>' + l.init_d + " " + l.init_h + " UTC</span>";
                else if (l.update_last) {
                    var g = moment(l.update_last).local().format("D.M. HH:mm") + " " + moment.tz(moment.tz.guess()).format("z");
                    f += '<span class="legend-tab-init"><br>Updated: ' + g + "</span>";
                }
                b.append(
                    '<div class="nadlegend">' +
                        (d.blend ? '<svg class="icon size-l" style="position: relative; top: 1px;"><use xlink:href="#ico_wg"></use></svg> ' : "") +
                        l.model_name +
                        '</div><div class="legend-tab"><svg class="icon back-icon"><use xlink:href="#ico_show_legend"></use></svg>' +
                        (d.blend ? '<svg class="icon"><use xlink:href="#ico_wg"></use></svg> ' : "") +
                        c +
                        f +
                        "</div>"
                );
                b.append('<div class="navig_table_button"><i class="fa fa-navicon"></i></div>');
                b.append(a).prependTo(e("#wgtab-obal-" + P));
                ya(a, v.menu);
                WG.contentActions(a);
            }
        }
        function Da() {
            F.find(".table_legend, th, .legend-tab, .nadlegend, .lista")
                .off("click")
                .on("click", function (a) {
                    F.toggleClass("hide");
                    Ba(!0);
                });
            F.find(".table_legend .switchunits")
                .off("click")
                .on("click", function (a) {
                    var b = e(this).data("param");
                    a.stopPropagation();
                    y.switchUnits(b);
                });
        }
        function Ya() {
            if (!WG.AdSlot) return 0;
            var a = 0;
            if (F.next().hasClass("reklamy-za") && "right" == F.next().css("float")) {
                var b = new WG.AdSlot(F.next());
                a = b.width();
            }
            var c = F.prevAll(".obal");
            if (c.length) {
                c = e(c[0]);
                b = new WG.AdSlot(c.next(".reklamy-za"));
                b = b.height();
                var d = c.height();
                b && "right" == c.next().css("float") && b > d + 35 && ((b = new WG.AdSlot(c.next())), (a = b.width()), WG.log("VYSKA PREDCHOZI REKLAMY! " + a));
            }
            WG.log("getAdSize: " + a);
            return a;
        }
        function Ba(a) {
            var b = Ya(),
                c = F.parent().width();
            if (b) {
                c = F.parent().width();
                WG.log("resetResize " + F[0].id + " nohiding:" + a);
                var d = F.find(".table_legend"),
                    f = 0;
                d.length && (f = d.width() + 1);
                d = F.find(".tabulka tbody");
                d.length || ((d = sa.find("svg")), (f = 0));
                d.length || ((d = F.find(".sirkodiv")), (f = 0));
                WG.log("sirkodiv:" + d.width());
                WG.log("sirka legendy:" + f);
                d = d.width();
                WG.log("sirka_tabulky:" + d);
                b = b ? b + 10 : 0;
                c - b < d + f ? F.css("width", c - b) : F.css("width", "auto");
            }
            e(".wg-table-menu").removeClass("visiblemenu");
            a || (601 > c ? F.addClass("hide") : F.removeClass("hide"));
            e(window).trigger("WG:wgdirads-nicescroll");
            dragscroll.reset();
        }
        function Za(a, b) {
            var c = b.getHtml();
            e("#" + a.id).replaceWith(c);
            b.getLegend$tr().replaceWith(b.getLegendHtmlTr());
        }
        function na(a, b, c) {
            void 0 === c && (c = "??");
            return Ca[a] && Ca[a][b] ? Ca[a][b] : c;
        }
        function qa() {
            y._last_visible_unixh = 0;
        }
        function ra(a) {
            if (l.hours[a] > u.fhours) return !1;
            var b = fa[a].hour();
            if (b < u.odh || b > u.doh) return !1;
            y._last_visible_unixh || (y._last_visible_unixh = 0);
            a = fa[a].unix() / 3600;
            if (a - y._last_visible_unixh < u.hrstep_min) return !1;
            y._last_visible_unixh = a;
            return b;
        }
        function $a(a, b) {
            for (var c = 0; c < S.length; c++) {
                for (var d, f = 0; f < ha[c].length; f++) ha[c][f].param == a && ((d = new m(b, c, S[c][0], S[c][1])), e("#" + ha[c][f].id).after(d.getHtml()), e("#legend_" + ha[c][f].id).after(d.getLegendHtmlTr()));
                d && ha[c].splice(f, 0, d);
            }
            V = [];
            for (a = 0; a < S.length; a++) for (b = 0; b < ha[a].length; b++) V[V.length] = ha[a][b];
            Da();
            pa();
        }
        function ab(a) {
            for (var b = 0; b < V.length; b++) V[b].param == a && (e("#" + V[b].id).remove(), e("#legend_" + V[b].id).remove());
            a = V;
            for (b = 0; b < a.length; b++) e.inArray(b, a);
        }
        function bb(a) {
            for (var b = 0; b < V.length; b++) if (V[b].param == a) return !0;
            return !1;
        }
        function Ia(a) {
            a.append("<div class='sirkodiv error'>Your browser does not support SVG graphics, please upgrade your browser.</div>");
        }
        function Oa() {
            var a = 0;
            qa();
            for (var b = 0; b < l.hours.length; b++) !1 !== ra(b) && a++;
            return a;
        }
        function jb() {
            var a = 0,
                b = 24,
                c = 340,
                d = Oa();
            if (WG.user) {
                var f = WG.user.cellsize ? WG.user.cellsize : !1;
                a = WG.user.wrapnew ? WG.user.wrapnew : 0;
                "s" == f && ((b = 21.7), (c = 310));
                "xs" == f && ((b = 19.2), (c = 290));
            }
            u.wrapnew && (a = u.wrapnew);
            f = 130 + d * b;
            b = 130 + Math.floor(d / 2) * b;
            d = e(window).height();
            var g = d - 122;
            c = g / c - 0.5;
            WG.log("totalwidth=" + f + ", totalheight=" + d + ", spaceheight=" + g + ", wrapwidth=" + b + " ,window:" + va + ", wrapnew:" + a + ", tabnumber:" + y.table_id + ", tabcount:" + u.tabcount);
            WG.log("maxwrap: " + c);
            if (va < b || va > f || 0 > a) return !1;
            if (!a) return WG.log("ADAPTIVE!!!", y.table_id), u.tabcount <= Math.floor(c) ? (va > b ? !0 : !1) : va > b && va - b < va - f ? !0 : !1;
            if (1 == a) return va > b ? !0 : !1;
        }
        function Pa(a) {
            var b;
            0 <= a && (b = 0);
            11.25 <= a && (b = 1);
            33.75 <= a && (b = 2);
            56.25 <= a && (b = 3);
            78.75 <= a && (b = 4);
            101.25 <= a && (b = 5);
            123.75 <= a && (b = 6);
            146.25 <= a && (b = 7);
            168.75 <= a && (b = 8);
            191.25 <= a && (b = 9);
            213.75 <= a && (b = 10);
            236.25 <= a && (b = 11);
            258.75 <= a && (b = 12);
            281.25 <= a && (b = 13);
            303.75 <= a && (b = 14);
            326.25 <= a && (b = 15);
            348.75 <= a && (b = 0);
            return b;
        }
        function wa(a, b, c) {
            return oa(a) ? "-" : WgUtil.unitConvert(a, b, c);
        }
        function ia(a, b) {
            b || (b = 0);
            var c = Math.pow(10, b);
            a = 0 == c ? Math.round(a) : Math.round(c * a) / c;
            a = a.toString();
            c = a.indexOf(".");
            return -1 == c ? a : a.substring(0, c + b + 1);
        }
        function oa(a) {
            return "" === a || null === a || "_" === a ? !0 : !1;
        }
        function E(a) {
            return "undefined" !== typeof a ? !0 : !1;
        }
        function da(a) {
            return "undefined" === typeof a || null === a ? !1 : !0;
        }
        WG.log("Forecast...");
        var y = this,
            Ja,
            Ka,
            fa,
            u,
            Qa,
            A,
            l,
            cb,
            eb,
            ja,
            fb,
            gb,
            U,
            Ca = {},
            v = {},
            Aa = [],
            S = [],
            ha = [],
            V = [],
            M = [],
            hb = [],
            va = WG.viewportWidth(),
            P = d.table_id,
            H = d.spot;
        WG.log("SPOT", H);
        var ta = new WG.Spot(H),
            za = e("#" + d.divid),
            sa = e('<div id="' + P + '_content_div" class="div_table tab-content no-text-select dragscroll touchscroll"></div>'),
            F = e('<div class="obal" data-id_spot="' + H.id_spot + '" data-id="' + P + '" id="wgtab-obal-' + P + '"></div>');
        !d.lang && WgLang && (d.lang = WgLang);
        y.table_id = P;
        y.config = u;
        y.finished = e.Deferred();
        y.finished.then(function () {
            e(window).trigger("WG:Fcst.finished");
        });
        y.loaded = e.Deferred();
        y.loaded.then(function () {
            WG.log("All data for table_id:" + P + " LOADED!");
        });
        y.loaded.then(function () {
            if (d.pro_only_message) za.append('<div class="no-forecast">' + d.pro_only_message + '</div><div class="obal" style="display:none"></div>'), y.finished.resolve();
            else if ((WG.log("load..." + y.table_id), (A = e.extend({}, M[0].data)), WG.log(A), (Ka = M[0].wgmodel), A.fcst)) {
                l = A.fcst;
                l.init_prev_hr_start && (d.space_hr = l.init_prev_hr_start);
                d.blend
                    ? ((l = h(d.blend).data.fcst),
                      (Ka = new WG.Model({
                          init: moment.unix(l.initstamp).utc(),
                      })),
                      ja && p(M[0], ja.id_model))
                    : M[1] && ((ja = M[1].data.fcst), p(M[0], M[1].id_model));
                fa = kb();
                ja && ((fb = b(ja.update_last)), (gb = b(ja.update_next)));
                cb = b(l.update_last);
                eb = b(l.update_next);
                !d.params && A.default_vars && (d.params = A.default_vars[A.id_model]);
                e.extend(v, {}, WG.Var.getSettings());
                v.csteps = {
                    knots: [
                        [20, 1],
                        [50, 2],
                        [9999, 5],
                    ],
                    ms: [
                        [15, 0.5],
                        [30, 1],
                        [40, 2],
                        [100, 5],
                        [9999, 10],
                    ],
                    msd: [
                        [15, 0.5],
                        [30, 1],
                        [40, 2],
                        [100, 5],
                        [9999, 10],
                    ],
                    kmh: [
                        [40, 2],
                        [80, 5],
                        [200, 10],
                        [9999, 20],
                    ],
                    mph: [
                        [20, 1],
                        [40, 2],
                        [60, 5],
                        [9999, 10],
                    ],
                    bft: 1,
                    c: 1,
                    f: 2,
                };
                v.menujs = {
                    forecast: function (a, b) {
                        nb(a, b);
                    },
                    fcst_graph: function (b, c) {
                        c = void 0 === c ? !0 : !1;
                        if (a())
                            if (l.HTSGW && !l.WINDSPD)
                                if (a()) {
                                    var d = l.hours[0],
                                        e = l.hours[l.hours.length - 1],
                                        f = Ga(17, 23),
                                        g = 70;
                                    c = 0;
                                    var h = w("HTSGW");
                                    0 < h && ((c = w("PERPW")), (h += 0.5), 15 < h && (h = 15), 2 > h && (h = 2), (c = Math.round(Math.max(g * h, 25 * (c + 2)))), 380 < c && ((c = 380), (g = c / h)));
                                    h = 35 + c;
                                    b.width(f).height(h).css("background-color", "#FFFFFF !important");
                                    b.svg();
                                    var n = new WgSvg.Canvas(b);
                                    n.svg.rect(0, 0, f, h, 0, 0, {
                                        fill: "#FFFFFF",
                                        strokeWidth: 0,
                                    });
                                    b = new WgSvg.Graph(n, {
                                        px_position: [0, 0],
                                        px_dimensions: [f, h],
                                        px_padding: [0, 30, 0, 0],
                                    });
                                    h = Ea(b);
                                    b = new WgSvg.Graph(n, {
                                        px_position: [0, 0],
                                        px_dimensions: [f, c],
                                        px_padding: [0, 30, 0, 0],
                                    });
                                    b.setRange([d, e], [0, c / g]);
                                    b.setXVals(l.hours);
                                    g = "HTSGWgradient" + P;
                                    b.linearGradientV(g, WgColors.htsgw);
                                    b.legend(
                                        {
                                            fill: "url(#" + g + ")",
                                            stroke: "#EAEAEA",
                                            strokeWidth: 1,
                                            opacity: 1,
                                        },
                                        {
                                            width: 5,
                                            left: 5,
                                            line_width: 20,
                                            line_left: 0,
                                            text_left: 12,
                                            text_offset: 3,
                                            desc_left: 27,
                                        },
                                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                        {
                                            "font-size": "10px",
                                            opacity: 1,
                                            "text-anchor": "left",
                                        },
                                        "Significant wave height (m)"
                                    );
                                    b.area(l.HTSGW, 0.8, {
                                        fill: "url(#" + g + ")",
                                        stroke: "none",
                                        opacity: 0.8,
                                    });
                                    b.line(l.HTSGW, 0.8, {
                                        strokeWidth: 1.5,
                                    });
                                    g = xa("HTSGW");
                                    b.numbers(
                                        l.HTSGW,
                                        {
                                            offset_v: 4,
                                            skip: 1,
                                            print_vals: g,
                                        },
                                        {
                                            "font-size": "10px",
                                        }
                                    );
                                    b.arrows(l.DIRPW, l.HTSGW, {
                                        offset_v: -7,
                                        offset_h: 0,
                                        round: 0,
                                    });
                                    l.PERPW &&
                                        (b.setRange([d, e], [0, c / 25]),
                                        b.line(l.PERPW, 0.8, {
                                            stroke: "#FF0000",
                                            strokeWidth: 1.5,
                                            "stroke-dasharray": "3,3",
                                        }),
                                        b.numbers(
                                            l.PERPW,
                                            {
                                                offset_v: 4,
                                                skip: 1,
                                                skip_start: 1,
                                            },
                                            {
                                                "font-size": "10px",
                                                fill: "#FF0000",
                                            }
                                        ));
                                    Wa(b, h);
                                    Ha(b, f, "WG.Fcst.svgGraphWaveHelp();");
                                } else Ia(b);
                            else {
                                g = l.hours[0];
                                h = l.hours[l.hours.length - 1];
                                n = Ga(17, 23);
                                var m = 0,
                                    C = 60,
                                    k,
                                    p = 0,
                                    D;
                                l.HTSGW && (k = w("HTSGW"));
                                l.HTSGW && 0 < k && ((m = w("PERPW")), (k += 0.6), 15 < k && (k = 15), 2 > k && (k = 2), (p = Math.round(Math.max(C * k, 10 * (m + 2)))), 280 < p && ((p = 280), (C = p / k)), (m = 15));
                                l.GUST ? (d = w("GUST")) : l.WINDSPD && (d = w("WINDSPD"));
                                d += 6;
                                50 < d && (d = 50);
                                20 > d && (d = 20);
                                k = Math.round(6 * d);
                                var t = 200 + k + 35 + p + m;
                                b.width(n).height(t).css("background-color", "#FFFFFF !important");
                                b.svg();
                                var q = new WgSvg.Canvas(b);
                                q.svg.rect(0, 0, n, t, 0, 0, {
                                    fill: "#FFFFFF",
                                    strokeWidth: 0,
                                });
                                var r = new WgSvg.Graph(q, {
                                    px_position: [0, 0],
                                    px_dimensions: [n, t],
                                    px_padding: [0, 30, 0, 0],
                                });
                                var O = Ea(r);
                                l.MCDC &&
                                    ((r = new WgSvg.Graph(q, {
                                        px_position: [0, 100],
                                        px_dimensions: [n, 100],
                                        px_padding: [0, 30, 0, 0],
                                    })),
                                    r.setRange([g, h], [0, 100]),
                                    r.setXVals(l.hours),
                                    r.area(l.MCDC, 0.5, {
                                        fill: "black",
                                        stroke: "none",
                                        strokeWidth: 0,
                                        opacity: 0.3,
                                    }),
                                    (r = new WgSvg.Graph(q, {
                                        px_position: [0, 0],
                                        px_dimensions: [n, 100],
                                        px_padding: [0, 30, 0, 0],
                                    })),
                                    r.setRange([g, h], [0, 100]),
                                    r.setXVals(l.hours),
                                    r.setInvert(!0),
                                    r.area(l.MCDC, 0.5, {
                                        fill: "black",
                                        stroke: "none",
                                        strokeWidth: 0,
                                        opacity: 0.3,
                                    }));
                                r = new WgSvg.Graph(q, {
                                    px_position: [0, 0],
                                    px_dimensions: [n, 200],
                                    px_padding: [0, 30, 0, 0],
                                });
                                r.setRange([g, h], [0, 100]);
                                r.setXVals(l.hours);
                                l.HCDC &&
                                    (r.setInvert(!0),
                                    r.area(l.HCDC, 0.5, {
                                        fill: "black",
                                        stroke: "none",
                                        strokeWidth: 0,
                                        opacity: 0.15,
                                    }));
                                l.LCDC
                                    ? (r.setInvert(!1),
                                      r.area(l.LCDC, 0.5, {
                                          fill: "black",
                                          stroke: "none",
                                          strokeWidth: 0,
                                          opacity: 0.55,
                                      }))
                                    : l.TCDC &&
                                      (r.setInvert(!1),
                                      r.area(l.TCDC, 0.5, {
                                          fill: "black",
                                          stroke: "none",
                                          strokeWidth: 0,
                                          opacity: 0.7,
                                      }));
                                l.RH &&
                                    (r.setRange([g, h], [0, 100]),
                                    r.setXVals(l.hours),
                                    r.line(l.RH, 0.8, {
                                        stroke: "#00c600",
                                        strokeWidth: 1.5,
                                    }),
                                    r.numbers(
                                        l.RH,
                                        {
                                            offset_v: -11,
                                            skip: 2,
                                        },
                                        {
                                            fill: "#00c600",
                                        }
                                    ));
                                r.setLimits();
                                if (l.SLP) {
                                    var G = r,
                                        z = w("SLP"),
                                        u = W("SLP");
                                    G.setFloatingYRange(40, 1013, z, u, 5, 5);
                                    r.setXVals(l.hours);
                                    r.line(l.SLP, 0.8, {
                                        stroke: "#3344ff",
                                        strokeWidth: 1.5,
                                    });
                                    r.numbers(
                                        l.SLP,
                                        {
                                            offset_v: 3,
                                            skip: 2,
                                            skip_start: 2,
                                        },
                                        {
                                            fill: "#3344ff",
                                        }
                                    );
                                }
                                l.APCP ? (D = l.APCP) : l.APCP1 && (D = l.APCP1);
                                if (D) {
                                    r.setRange([g, h], [0, 20]);
                                    r.setXVals(l.hours);
                                    r.resetIgnore();
                                    if (E(l.PCPT)) for (G = 0; G < l.hours.length; G++) 1 == l.PCPT[G] && r.setIgnore(G);
                                    r.setLimits(0.3);
                                    r.bar(D, 0.25, {
                                        fill: "#2222FF",
                                    });
                                    r.setLimits(1);
                                    r.numbers(
                                        D,
                                        {
                                            offset_v: -8,
                                            round: 1,
                                        },
                                        {
                                            "font-size": "8.5px",
                                            fill: "#FFFFFF",
                                        }
                                    );
                                    r.resetIgnore();
                                    if (E(l.PCPT)) {
                                        for (G = 0; G < l.hours.length; G++) 1 != l.PCPT[G] && r.setIgnore(G);
                                        r.setLimits(0.3);
                                        r.bar(D, 0.25, {
                                            fill: "#77F0FF",
                                        });
                                        r.setLimits(1);
                                        r.numbers(
                                            D,
                                            {
                                                offset_v: -8,
                                                round: 1,
                                            },
                                            {
                                                "font-size": "8.5px",
                                                fill: "#0000FF",
                                            }
                                        );
                                    }
                                    r.resetIgnore();
                                }
                                l.TMPE ? ((e = l.TMPE), (f = "TMPE")) : l.TMP && ((e = l.TMP), (f = "TMP"));
                                D = w(f);
                                G = W(f);
                                l.WCHILL && (G = W("WCHILL"));
                                r.setFloatingYRange(30, 10, D, G, 3, 3);
                                r.setLimits();
                                r.setXVals(l.hours);
                                D = "TMPgradient" + P;
                                r.linearGradientV(D, WgColors.temp);
                                l.WCHILL &&
                                    ((G = xa("WCHILL")),
                                    r.circles(
                                        l.WCHILL,
                                        7,
                                        {
                                            fill: "url(#" + D + ")",
                                            stroke: "black",
                                            strokeWidth: 0.8,
                                            "stroke-dasharray": "3,3",
                                        },
                                        "",
                                        {
                                            numbers: {
                                                "font-size": "9px",
                                                opacity: 1,
                                                "text-anchor": "middle",
                                            },
                                            print_vals: G,
                                            offset_v: -3,
                                            pxDistance: 15,
                                        }
                                    ));
                                r.setLimits();
                                e &&
                                    (r.line(e, 0.8),
                                    (G = xa(f)),
                                    r.circles(
                                        e,
                                        7,
                                        {
                                            fill: "url(#" + D + ")",
                                            stroke: "black",
                                            strokeWidth: 0.8,
                                        },
                                        "",
                                        {
                                            numbers: {
                                                "font-size": "9px",
                                                opacity: 1,
                                                "text-anchor": "middle",
                                            },
                                            print_vals: G,
                                            offset_v: -3,
                                            pxDistance: 15,
                                        }
                                    ));
                                3 > W(f) &&
                                    -3 < w(f) &&
                                    r.gridLineH(0, {
                                        fill: "none",
                                        stroke: "#77F0FF",
                                        strokeWidth: 1,
                                        opacity: 1,
                                        "stroke-dasharray": "3,3",
                                    });
                                l.HTSGW &&
                                    ((r = new WgSvg.Graph(q, {
                                        px_position: [0, 200 + m],
                                        px_dimensions: [n, p],
                                        px_padding: [0, 30, 0, 0],
                                    })),
                                    r.setRange([g, h], [0, p / C]),
                                    r.setXVals(l.hours),
                                    (D = "HTSGWgradient" + P),
                                    r.linearGradientV(D, WgColors.htsgw),
                                    r.area(l.HTSGW, 0.8, {
                                        fill: "url(#" + D + ")",
                                        stroke: "none",
                                        opacity: 0.8,
                                    }),
                                    r.line(l.HTSGW, 0.8, {
                                        strokeWidth: 1.5,
                                    }),
                                    (G = xa("HTSGW")),
                                    r.numbers(
                                        l.HTSGW,
                                        {
                                            offset_v: 4,
                                            skip: 1,
                                            print_vals: G,
                                        },
                                        {
                                            "font-size": "10px",
                                        }
                                    ),
                                    r.arrows(l.DIRPW, l.HTSGW, {
                                        offset_v: -7,
                                        offset_h: 0,
                                        round: 0,
                                    }),
                                    l.PERPW &&
                                        (r.setRange([g, h], [0, p / 10]),
                                        r.line(l.PERPW, 0.8, {
                                            stroke: "#FF0000",
                                            strokeWidth: 1.5,
                                            "stroke-dasharray": "3,3",
                                        }),
                                        r.numbers(
                                            l.PERPW,
                                            {
                                                offset_v: 4,
                                                skip: 1,
                                                skip_start: 1,
                                            },
                                            {
                                                "font-size": "10px",
                                                fill: "#FF0000",
                                            }
                                        )),
                                    0 < m &&
                                        r.svg.rect(r.group, -1, p, n + 2, m, 0, 0, {
                                            fill: "#FFFFFF",
                                            stroke: "white",
                                            strokeWidth: 0,
                                            opacity: 0.8,
                                        }),
                                    Wa(r, O));
                                r = new WgSvg.Graph(q, {
                                    px_position: [0, 225 + p + m],
                                    px_dimensions: [n, k],
                                    px_padding: [0, 30, 0, 0],
                                });
                                r.setRange([g, h], [0, d]);
                                r.gridLinesH([0.6, 3, 7, 11, 16, 21, 27, 33, 40, 47, 55, 64]);
                                r.setXVals(l.hours);
                                D = "WINDSPDgradient" + P;
                                r.linearGradientV(D, WgColors.wind);
                                r.legend(
                                    {
                                        fill: "url(#" + D + ")",
                                        stroke: "#EAEAEA",
                                        strokeWidth: 1,
                                        opacity: 1,
                                    },
                                    {
                                        width: 5,
                                        left: 5,
                                        line_width: 20,
                                        line_left: 0,
                                        text_left: 12,
                                        text_offset: 3,
                                        desc_left: 27,
                                    },
                                    [0.6, 3, 7, 11, 16, 21, 27, 33, 40, 47, 55, 64],
                                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                    {
                                        "font-size": "10px",
                                        opacity: 1,
                                        "text-anchor": "left",
                                    },
                                    "Beaufort"
                                );
                                r.svg.rect(r.group, -1, k, n + 2, 25, 0, 0, {
                                    fill: "#FFFFFF",
                                    stroke: "white",
                                    strokeWidth: 0,
                                    opacity: 0.8,
                                });
                                l.GUST &&
                                    (r.area(l.GUST, 0.8, {
                                        fill: "url(#" + D + ")",
                                        stroke: "none",
                                        opacity: 0.5,
                                    }),
                                    (G = xa("GUST")),
                                    r.numbers(
                                        l.GUST,
                                        {
                                            offset_v: 4,
                                            print_vals: G,
                                        },
                                        {
                                            opacity: 0.5,
                                        }
                                    ));
                                l.WINDSPD &&
                                    (r.area(l.WINDSPD, 0.8, {
                                        fill: "url(#" + D + ")",
                                        stroke: "none",
                                        opacity: 0.8,
                                    }),
                                    r.line(l.WINDSPD, 0.8, {
                                        strokeWidth: 1.5,
                                    }),
                                    (G = xa("WINDSPD")),
                                    r.numbers(
                                        l.WINDSPD,
                                        {
                                            offset_v: -11,
                                            print_vals: G,
                                        },
                                        {
                                            "font-size": "10px",
                                        }
                                    ),
                                    r.arrows(l.WINDDIR, l.WINDSPD, {
                                        offset_v: -17,
                                        offset_h: 0,
                                        round: 0,
                                        min_distance: 12,
                                    }));
                                l.MWINDSPD &&
                                    (r.line(l.MWINDSPD, 0.8, {
                                        strokeWidth: 1.2,
                                        opacity: 0.5,
                                        "stroke-dasharray": "3,3",
                                    }),
                                    xa("MWINDSPD"));
                                Ha(r, n);
                                ob(b, '<svg class="icon"><use xlink:href="#ico_help"></use></svg>', "/snippets/graph_legend_wave.php");
                                c && Ma(t);
                            }
                        else Ia(b);
                    },
                    "2d_t": function (a, b) {
                        Ta(a, 0, 5000, b);
                    },
                    "2d_t_l": function (a, b) {
                        var c = Va(2000);
                        Ta(a, c[0], c[1], b);
                    },
                    "2d_w": function (a, b) {
                        Ua(a, 0, 5000, b);
                    },
                    "2d_w_l": function (a, b) {
                        var c = Va(2000);
                        Ua(a, c[0], c[1], b);
                    },
                    archive: function (a) {
                        WG.loadAjaxContent("/archive.php?id_spot=" + H.id_spot + "&id_model=" + A.id_model, "menusize-1");
                    },
                    statistic: function (a) {
                        WG.loadAjaxContent("/archive-stats.php?id_spot=" + H.id_spot + "&id_model=" + A.id_model, "menusize-1");
                    },
                    alert: function (a) {
                        WG.loadAjaxContent("/settings.php?addalert=1&formid=set_alerts&id_spot=" + H.id_spot + "&id_model=" + A.id_model, "hcenter vcenter");
                    },
                    tide: function (a, b) {
                        ta.isCustom(!1) || !ta.id_spot
                            ? WG.checkUser(
                                  function (a) {
                                      G();
                                  },
                                  function () {
                                      WG.proOnly(1, "tide");
                                      return !1;
                                  },
                                  !0
                              )
                            : G();
                    },
                };
                v.fn = {
                    info: function () {
                        d.blend &&
                            (y.blend_info_window && y.blend_info_window.close(),
                            (y.blend_info_window = new WG.Window({
                                title: WG.ttStr(3595, 2, "WG model mix", "", "150", "@@@"),
                                target: sa,
                                addClass: "",
                                maxWidth: WG.getMaxWidth(10, 600),
                                outside: !1,
                                fitScreen: !0,
                                position: {
                                    x: 10,
                                    y: "top",
                                },
                                src: "/forms/blend_info.php?table_id=" + P + "&id_spot=" + H.id_spot + "&lat=" + H.lat + "&lon=" + H.lon,
                            })));
                    },
                    updateinfo: function () {
                        d.blend
                            ? (y.blend_info_window && y.blend_info_window.close(),
                              (y.blend_info_window = new WG.Window({
                                  title: WG.ttStr(3595, 2, "WG model mix", "", "150", "@@@"),
                                  target: sa,
                                  addClass: "",
                                  maxWidth: WG.getMaxWidth(10, 600),
                                  outside: !1,
                                  fitScreen: !0,
                                  position: {
                                      x: 10,
                                      y: "top",
                                  },
                                  src: "/forms/blend_info.php?table_id=" + P + "&id_spot=" + H.id_spot + "&lat=" + H.lat + "&lon=" + H.lon,
                              })))
                            : new WG.Model({
                                  id_model: A.id_model,
                              }).infoWindow();
                    },
                    updateinfo_wave: function () {
                        new WG.Model({
                            id_model: ja.id_model,
                        }).infoWindow();
                    },
                    modif: function (a) {
                        y.mod_window && y.mod_window.close();
                        y.mod_window = new WG.Window({
                            title: WG.ttStr(2658, 2, "Select wind modification", "", "63", "@@@"),
                            target: sa,
                            outside: !1,
                            position: {
                                x: "left",
                                y: "top",
                            },
                            offset: {
                                x: 0,
                                y: -100,
                            },
                            src: "/ajax/ajax_select_modification.php?id_spot=" + H.id_spot + "&id_model=" + A.id_model + "&table_id=" + P + "&id_modifikace=" + l.id_modifikace,
                        });
                    },
                    share_widget: function (a) {
                        WG.modalForm(
                            {
                                form_url: "/forms/forecast_widget.php?id_spot=" + H.id_spot + "&id_model=" + A.id_model,
                                api_data: {},
                                callback: function (a, b) {
                                    b.close();
                                },
                                callback_delay: 300,
                            },
                            {
                                title: WG.ttStr(3496, 2, "Windguru forecast on your website", "", "63", "@@@"),
                            }
                        );
                    },
                    blend: function (a) {
                        y.blend_window && y.blend_window.close();
                        y.blend_window = new WG.Window({
                            title: WG.ttStr(3596, 2, "Fine-tune WG forecast", "", "63", "@@@"),
                            target: sa,
                            addClass: "wgmodal-nopadding",
                            fixed: !0,
                            outside: !1,
                            fitScreen: !0,
                            position: {
                                x: 10,
                                y: "top",
                            },
                            src: "/ajax/ajax_blend.php?table_id=" + P + "&id_spot=" + H.id_spot + "&lat=" + H.lat + "&lon=" + H.lon,
                        });
                    },
                    tide_explorer: function () {
                        ta.tideExplorer();
                    },
                };
                var c = [
                    {
                        name: "modif",
                        icon: '<svg class="icon"><use xlink:href="#ico_settings"></use></svg> ',
                        force_name: "<span> " + WG.ttStr(2659, 2, "Wind modification", "", "63", "@@@") + "</span>",
                    },
                    {
                        name: "archive",
                        icon: '<svg class="icon"><use xlink:href="#ico_archive"></use></svg> ',
                    },
                    {
                        name: "statistic",
                        icon: '<svg class="icon"><use xlink:href="#ico_statistic"></use></svg> ',
                    },
                    {
                        name: "alert",
                        icon: '<svg class="icon"><use xlink:href="#ico_email"></use></svg> ',
                    },
                ];
                H.id_spot &&
                    c.push({
                        name: "share_widget",
                        icon: '<svg class="icon"><use xlink:href="#ico_share"></use></svg> ',
                        class: "min-mobile-hide",
                    });
                (l.WINDSPD && !d.blend) || c.splice(0, 1);
                var f = [];
                f[f.length] = {
                    name: "updateinfo",
                    force_name:
                        ' <div class="model-update-info"><span class="label">Model:</span><br>' +
                        l.model_longname +
                        '<br><span class="label">Init:</span><br>' +
                        l.init_d +
                        " " +
                        l.init_h +
                        'h UTC<br><span class="label">' +
                        WG.ttStr(2662, 2, "Last updated", "", "63", "@@@") +
                        ":</span><br>" +
                        cb +
                        '<br><span class="label">' +
                        WG.ttStr(2663, 2, "Next update expected", "", "63", "@@@") +
                        ":</span><br>" +
                        eb +
                        '<br><span class="label">' +
                        WG.ttStr(2664, 2, "Model terrain altitude", "", "63", "@@@") +
                        ":</span><br>" +
                        A.model_alt +
                        " m</div>",
                };
                ja &&
                    (f[f.length] = {
                        name: "updateinfo_wave",
                        force_name:
                            ' <div class="model-update-info"><span class="label">Wave model:</span><br>' +
                            ja.model_longname +
                            '<br><span class="label">Init:</span><br>' +
                            ja.init_d +
                            " " +
                            ja.init_h +
                            'h UTC<br><span class="label">' +
                            WG.ttStr(2662, 2, "Last updated", "", "63", "@@@") +
                            ":</span><br>" +
                            fb +
                            '<br><span class="label">' +
                            WG.ttStr(2663, 2, "Next update expected", "", "63", "@@@") +
                            ":</span><br>" +
                            gb +
                            "</div>",
                    });
                var g = {
                    name: "info",
                    icon: '<svg class="icon"><use xlink:href="#ico_info"></use></svg>',
                    force_name: '<span class="butt-txt small-tablet-hide"> ' + WG.ttStr(2660, 2, "Info", "", "63", "@@@") + "</span>",
                };
                d.blend || (g.menu = f);
                v.menu = [
                    g,
                    {
                        name: "forecast",
                        icon: '<svg class="icon"><use xlink:href="#ico_forecast_table"></use></svg>',
                        force_name: '<span class="butt-txt"> ' + WG.ttStr(2424, 2, "Forecast", "", "63", "@@@") + "</span>",
                        refresh: !1,
                    },
                    {
                        name: "fcst_graph",
                        icon: "<span " + (d.guide ? 'class="wg-guide" data-guide-priority="15" data-guide-src="table-graph.php"' : "") + '><svg class="icon"><use xlink:href="#ico_graph"></use></svg></span>',
                        force_name: '<span class="butt-txt"> ' + WG.ttStr(2425, 2, "Graph", "", "63", "@@@") + "</span>",
                        refresh: !0,
                    },
                ];
                A.levels &&
                    (v.menu[v.menu.length] = {
                        name: "2d",
                        icon: '<svg class="icon small-tablet-hide"><use xlink:href="#ico_2d"></use></svg>',
                        menu: [
                            {
                                name: "2d_t",
                                icon: '<svg class="icon"><use xlink:href="#ico_temperature_profile"></use></svg>',
                                refresh: !0,
                            },
                            {
                                name: "2d_t_l",
                                icon: '<svg class="icon"><use xlink:href="#ico_temperature_profile"></use></svg>',
                                refresh: !0,
                            },
                            {
                                name: "2d_w",
                                icon: '<svg class="icon"><use xlink:href="#ico_wind_profile"></use></svg>',
                                refresh: !0,
                            },
                            {
                                name: "2d_w_l",
                                icon: '<svg class="icon"><use xlink:href="#ico_wind_profile"></use></svg>',
                                refresh: !0,
                            },
                        ],
                    });
                !WG.lite_version &&
                    0 < H.id_spot &&
                    !d.blend &&
                    (v.menu[v.menu.length] = {
                        name: "more",
                        icon: '<svg class="icon"><use xlink:href="#ico_more"></use></svg> ',
                        menu: c,
                    });
                H.id_spot &&
                    !d.blend &&
                    (v.menu[v.menu.length] = {
                        name: "share",
                        icon: '<svg class="icon mobile-hide"><use xlink:href="#ico_share"></use></svg> ',
                        force_name: '<span class="small-tablet-hide"> ' + WG.ttStr(3497, 2, "Share", "", "63", "@@@") + "</span>",
                        class: "mobile-hide",
                        menu: [
                            {
                                name: "share_widget",
                                icon: '<svg class="icon"><use xlink:href="#ico_share"></use></svg> ',
                            },
                        ],
                    });
                d.blend &&
                    (v.menu[v.menu.length] = {
                        name: "blend",
                        icon: '<span><svg class="icon"><use xlink:href="#ico_settings"></use></svg></span>',
                        force_name: '<span class="butt-txt"> ' + WG.ttStr(3597, 2, "Tune", "", "63", "@@@") + "</span>",
                    });
                H.tide &&
                    ((c = [
                        {
                            name: "tide",
                            icon: '<svg class="icon"><use xlink:href="#ico_tide"></use></svg> ',
                            force_name: '<span class=""> ' + WG.ttStr(0, 2, "Show tides (model)", "", "63", "@@@") + "</span>",
                        },
                        {
                            name: "tide_explorer",
                            icon: '<svg class="icon"><use xlink:href="#ico_tide"></use></svg> ',
                            force_name: '<span class=""> ' + WG.ttStr(0, 2, "Tide explorer", "", "63", "@@@") + "</span>",
                        },
                    ]),
                    (v.menu[v.menu.length] = {
                        name: "tide_menu",
                        icon: '<span><svg class="icon"><use xlink:href="#ico_tide"></use></svg></span>',
                        force_name: '<span class="butt-txt small-tablet-hide"> ' + WG.ttStr(0, 2, "Tides", "", "63", "@@@") + "</span>",
                        menu: c,
                    }));
                v.tabs_resize = {
                    forecast: !0,
                    fcst_graph: !0,
                    "2d_t": !0,
                    "2d_t_l": !0,
                    "2d_w": !0,
                    "2d_w_l": !0,
                    canvas: !0,
                };
                v.special = {
                    CDC: function (a, b) {
                        var c, d;
                        (b = K(a, "HCDC", "cloud", "clouds", !1, "CDC")) || (b = X(la(l.HCDC[a], "HCDC"), WgColors.cloud.getRGBA(l.HCDC[a]), "clouds", T("CDC", a)));
                        (c = K(a, "MCDC", "cloud", "clouds", !1, "CDC")) || (c = X(la(l.MCDC[a], "MCDC"), WgColors.cloud.getRGBA(l.MCDC[a]), "clouds", T("CDC", a)));
                        (d = K(a, "LCDC", "cloud", "clouds", !1, "CDC")) || (d = X(la(l.LCDC[a], "LCDC"), WgColors.cloud.getRGBA(l.LCDC[a]), "clouds", T("CDC", a)));
                        return '<td style="padding:0px !important;">' + b + c + d + "</td>";
                    },
                    SLP: function (a, b) {
                        (b = N(a, "SLP", "press"))
                            ? (a = b)
                            : ((b = ia(l.SLP[a], 0)), (a = 1000 <= b ? J(a, "SLP", b - 1000, WgColors.press.getRGBA(l.SLP[a]), "bold", T("SLP", a)) : J(a, "SLP", b, WgColors.press.getRGBA(l.SLP[a]), "", T("SLP", a))));
                        return a;
                    },
                    FLHGT: function (a, b) {
                        return ea(a, b);
                    },
                    FLHGTT: function (a, b) {
                        return ea(a, b);
                    },
                    SMER: function (a, b) {
                        return Q(a, "WINDDIR", b);
                    },
                    WAVEDIR: function (a, b) {
                        return Q(a, "DIRPW");
                    },
                    WAVESMER: function (a, b) {
                        return Q(a, "WAVEDIR");
                    },
                    DIRPW: function (a, b) {
                        return Q(a, "DIRPW");
                    },
                    SWDIR1: function (a, b) {
                        return Q(a, "SWDIR1");
                    },
                    SWDIR2: function (a, b) {
                        return Q(a, "SWDIR2");
                    },
                    WVDIR: function (a, b) {
                        return Q(a, "WVDIR");
                    },
                    APCPs: function (a, b) {
                        return z(a, "APCP", b);
                    },
                    APCP1s: function (a, b) {
                        return z(a, "APCP1", b);
                    },
                    PWEN: function (a, b) {
                        return Y(a, "PWEN");
                    },
                    SWEN1: function (a, b) {
                        return Y(a, "SWEN1");
                    },
                    SWEN2: function (a, b) {
                        return Y(a, "SWEN2");
                    },
                    WVEN: function (a, b) {
                        return Y(a, "WVEN");
                    },
                    RATING: function (a, b) {
                        x(a, b) ? (a = J(a, b, "-", "#FFFFFF")) : ((b = l[b][a]), (a = 0 > b ? "b" : ""), (b = Math.abs(b)), (a = 1 <= b ? '<td class="rating stars star' + b + a + '">&nbsp;</td>' : '<td class="rating">&nbsp;</td>'));
                        return a;
                    },
                    MIX: function (a, b) {
                        a = x(a, "MIX") ? '<td class="mix"> </td>' : '<td class="mix" style="background-color:' + WgColors.mix.getRGBA(100 * (1 - l.MIX[a])) + '"> </td>';
                        return a;
                    },
                    MIXPARAM: function (a, b) {
                        "CDC" == b && (b = "TCDC");
                        a = l.MIXPARAM ? (l.MIXPARAM[a][b] ? '<td class="mix" style="background-color:' + WgColors.mix.getRGBA(100 * (1 - l.MIXPARAM[a][b])) + '"> </td>' : '<td class="mix"> </td>') : '<td class="mix"> </td>';
                        return a;
                    },
                };
                v.specialCanvas = {};
                v.calculate = {
                    WCHILL: function () {
                        var a, b;
                        l.WCHILL = [];
                        -1 < e.inArray("MWINDSPD", U) && !E(l.MWINDSPD) && t();
                        E(l.MWINDSPD) ? (a = l.MWINDSPD) : E(l.WINDSPD) && (a = l.WINDSPD);
                        E(l.TMPE) ? (b = l.TMPE) : E(l.TMP) && (b = l.TMP);
                        for (var c = 0; c < l.hours.length; c++) {
                            var d = l.WCHILL,
                                f = c;
                            if (a && b) {
                                var g = b[c];
                                var h = a[c];
                                oa(g) || oa(h) ? (g = null) : ((h = wa(h, "kmh")), (g = 10 < g || 4.8 > h ? null : 13.12 + 0.6215 * g - 11.37 * Math.pow(h, 0.16) + 0.3965 * g * Math.pow(h, 0.16)));
                            } else g = null;
                            d[f] = g;
                        }
                    },
                    MWINDSPD: function () {
                        return t();
                    },
                    RATING: function () {
                        var a, b;
                        -1 < e.inArray("MWINDSPD", U) && !E(l.MWINDSPD) && t();
                        E(l.MWINDSPD) ? (a = l.MWINDSPD) : E(l.WINDSPD) && (a = l.WINDSPD);
                        E(l.TMPE) ? (b = l.TMPE) : E(l.TMP) && (b = l.TMP);
                        if (a && b) {
                            l.RATING = [];
                            for (var c = 0; c < l.hours.length; c++) {
                                var d = l.RATING,
                                    f = c;
                                if (a && b) {
                                    var g = a[c];
                                    var h = 0;
                                    u.limit1 > u.limit3 ? (g < u.limit1 && (h = 1), g < u.limit2 && (h = 2), g < u.limit3 && (h = 3)) : (g > u.limit1 && (h = 1), g > u.limit2 && (h = 2), g > u.limit3 && (h = 3));
                                    Math.round(b[c]) < u.tlimit && (h = -h);
                                    g = h;
                                } else g = null;
                                d[f] = g;
                            }
                        }
                    },
                    MIX: function () {
                        l.MIX = [];
                        l.MIXPARAM = [];
                        for (var a = A.stat, b = 0; b < l.hours.length; b++) {
                            var c = [];
                            l.MIXPARAM[b] = [];
                            for (var e in a)
                                if (-1 == d.blend.mix_skip.indexOf(e)) {
                                    var f = a[e][b];
                                    f && !(2 > f.count) && f.stdev && d.blend.mix_range[e] && ((f = f.stdev / (d.blend.mix_range[e] / 2)), (l.MIXPARAM[b][e] = f), c.push(f));
                                }
                            c.length && (l.MIX[b] = ss.mean(c));
                        }
                    },
                };
                v.nodatahide = {
                    WCHILL: !0,
                    HTSGW: !0,
                    DIRPW: !0,
                    SWELL1: !0,
                    SWELL2: !0,
                    WVHGT: !0,
                    PERPW: !0,
                    SWPER1: !0,
                    SWPER2: !0,
                    WVPER: !0,
                };
                v.cell_width_default = null;
                v.cell_height_default = 18;
                v.cell_height = {
                    RATING: 40,
                    CDC: 50,
                };
                v.cell_hspace = 1;
                v.cell_vspace = 1;
                v.precision_units = {
                    ft: 0,
                    msd: 1,
                };
                v.config_default = {
                    path_img: "img/",
                    svg_allow: !0,
                    fcst_maps: !0,
                    params: "WINDSPD GUST SMER TMPE FLHGT CDC APCPs".split(" "),
                    tabs: !0,
                    wj: "knots",
                    tj: "c",
                    waj: "m",
                    odh: 3,
                    doh: 22,
                    hrstep_min: 1,
                    fhours: 180,
                    limit1: 10.63,
                    limit2: 15.57,
                    limit3: 19.41,
                    tlimit: 10,
                    click_fname: "",
                    scroll_to_graph: !0,
                    space_hr: -1,
                    date_compact: !1,
                    void: 0,
                };
                u = e.extend({}, v.config_default, d);
                R(d);
                c = l.hours[l.hours.length - 1];
                120 < c && (u.hrstep_min = WG.user.long_range_step ? WG.user.long_range_step : 2);
                120 >= c && (u.hrstep_min = WG.user.short_range_step ? WG.user.short_range_step : 1);
                d.hrstep_min && (u.hrstep_min = d.hrstep_min);
                q();
                u.tabs && F.addClass("nolista");
                601 > e(window).width() && F.addClass("hide");
                y.wrapped && F.addClass("wrapped");
                WG.user && WG.user.cellsize && F.addClass("scale-" + WG.user.cellsize);
                u.tabs || F.append('<div class="lista"><span class="hs"><svg class="icon dark size-s"><use xlink:href="#ico_right"></use></svg></span></div>');
                za.empty();
                F.append(sa);
                za.append(F);
                pb();
                n();
                y.finished.resolve();
                !u.delayed_content_actions && u.tabs && WG.contentActions(za);
            } else WG.log(y.table_id + ": Data not available..."), y.finished.resolve(), za.remove();
        });
        y.show = function (a, b) {
            D(a, !1, b);
        };
        y.switchUnits = function (a) {
            var b = v.unit_type[a],
                c = Aa[b];
            c && ((c = e.inArray(c, v.unit[b])), (Aa[b] = v.unit[b][c + 1] ? v.unit[b][c + 1] : v.unit[b][0]));
            for (b = 0; b < V.length; b++) v.unit_type[V[b].param] && v.unit_type[V[b].param] == v.unit_type[a] && Za(V[b], new m(V[b].param, V[b].sada, S[V[b].sada][0], S[V[b].sada][1]));
            Da();
            pa();
        };
        y.refresh = function () {
            WG.logTime("refresh");
            for (var a = 0; a < V.length; a++) {
                var b = V[a].param;
                if (v.calculate[b]) v.calculate[b](l);
                Za(V[a], new m(b, V[a].sada, S[V[a].sada][0], S[V[a].sada][1]));
            }
            Da();
            pa();
            WG.logTimeEnd("refresh");
        };
        y.setModificationStr = function (a) {
            var b = a.split(":");
            if (2 == b.length) {
                a = b[1];
                var c = b[0];
            }
            a = a.split(",");
            16 == a.length
                ? ((b = A.fcst),
                  (b.modifikace = {
                      koef: a,
                  }),
                  c && (b.id_modifikace = c),
                  t(b),
                  -1 == e.inArray("MWINDSPD", U) && ((a = e.inArray("WINDSPD", U)), U.splice(a, 0, "MWINDSPD")),
                  ab("MWINDSPD"),
                  bb("GUST") ? $a("GUST", "MWINDSPD") : bb("WINDSPD") && $a("WINDSPD", "MWINDSPD"))
                : (ab("MWINDSPD"), (a = A.fcst), (a.modifikace = null), (a.id_modifikace = 0));
        };
        y.getIdModification = function () {
            return A.fcst.id_modifikace;
        };
        y.addForecastData = function (a) {
            if (d.pro_only_message) return !1;
            a: {
                WG.log("getForecastData", a);
                for (var b = 0; b < f.length; b++) {
                    var e = f[b];
                    WG.log("_all_forecast_data ... ", e);
                    if (e.id_model == a.id_model && e.initstr == a.initstr) {
                        if (0 < e.id_spot && e.id_spot == a.id_spot) {
                            WG.log("id_spot souhlasi, return ... ", e);
                            a = e;
                            break a;
                        }
                        if (null !== e.lat && null !== e.lon && e.lat == a.lat && e.lon == a.lon) {
                            WG.log("lat / lon  souhlasi, return ... ", e);
                            a = e;
                            break a;
                        }
                    }
                }
                e = new c(a);
                WG.log("NEW ... ", e);
                f.push(e);
                a = e;
            }
            M.push(a);
            hb.push(a.loaded);
            return a;
        };
        y.load = function () {
            for (var a = 0; a < M.length; a++) M[a].load();
            return y.loaded;
        };
        y.ready = function () {
            e.when.apply(e, hb).then(function () {
                y.loaded.resolve();
            });
        };
        y.setBlend = function (a) {
            d.blend = a;
            l = h(d.blend).data.fcst;
            ja && p(M[0], ja.id_model);
            y.refresh();
            "fcst_graph" == Qa && y.show("fcst_graph");
        };
        y.resetBlend = function () {
            y._blend_original && y.setBlend(y._blend_original);
        };
        y.getBlend = function () {
            return d.blend;
        };
        y.resWeights = function (a) {
            for (var b = {}, c = 0; c < M.length; c++)
                if (M[c].wgmodel) {
                    var d = M[c].wgmodel;
                    b[d.id_model] = Math.pow(d.resolution_real, -2 * a);
                }
            return y.weightsNormalize(b, 1, 1.5);
        };
        y.initWeights = function (a) {
            for (var b = 0, c = 0; c < M.length; c++)
                if (M[c].wgmodel) {
                    var d = M[c].wgmodel;
                    b = d.initstamp > b ? d.initstamp : b;
                }
            var e = {};
            for (c = 0; c < M.length; c++)
                if (M[c].wgmodel) {
                    d = M[c].wgmodel;
                    var f = d.id_model;
                    d = b / 3600 - d.initstamp / 3600;
                    d = 100 * Math.pow(d + 4, -0.5 * a) - 3 * a * d;
                    0 > d && (d = 0);
                    e[f] = d;
                }
            return y.weightsNormalize(e, 1, 1.5);
        };
        y.getForecastData = function (a) {
            for (var b = 0; b < M.length; b++) if (M[b].id_model == a) return M[b];
            return new c();
        };
        y.weightsNormalize = function (a, b, c) {
            var d = {},
                e = Infinity,
                f = 0,
                g;
            for (g in a) {
                var h = a[g];
                f = h > f ? h : f;
                e = h < e ? h : e;
            }
            b = (2 * b) / (f + e);
            f * b > c && (b = c / f);
            for (g in a) d[g] = a[g] * b;
            return d;
        };
    }
    var e = jQuery;
    forecasts = {};
    var f = [],
        g = a();
    return {
        version: "2.2",
        forecasts: {},
        forecast: function (a) {
            a = a || {};
            return new d(a);
        },
        showForecast: function (a, b) {
            var c = new WG.Spot({
                id_spot: b.id_spot,
            });
            b.divid = a;
            b.spot = c;
            a = WG.Fcst.forecast(b);
            a.addForecastData({
                id_spot: b.id_spot,
                id_model: b.id_model,
                initstr: b.initstr,
                WGCACHEABLE: b.WGCACHEABLE,
                cachefix: b.cachefix,
            });
            a.ready();
            a.load();
        },
        loadAll: function () {
            for (var a = 0; a < f.length; a++) f[a].load();
        },
        cleanUp: function (a) {
            if (50 < f.length || a) (f = []), WG.log("cleanForecastData!");
        },
        switchUnits: function (a, b) {
            WG.Fcst.forecasts[a].switchUnits(b);
        },
        setModificationStr: function (a, b) {
            WG.Fcst.forecasts[a].setModificationStr(b);
        },
        makeDirSVG: function (a) {
            return makeDirSVG(a, this);
        },
        svgGraphHelp: function () {
            svgGraphHelp();
        },
        svgGraphWaveHelp: function () {
            svgGraphWaveHelp();
        },
    };
})();
WG.Grid = {
    spot: {},
    marker: {},
    model: {
        id_model: 0,
        rozliseni: 100,
    },
    grid_cache: [],
    map: {},
    options: {
        id_var: 6,
        hr: 0,
        x: 7,
        y: 3,
        minkoef: 0.05,
        on_get_used: function (a) {},
        on_get_used_update: function (a) {},
        altcoords: [],
        zoom: 6,
    },
    grid_points: {},
    grid_points_used: {},
    makeGrid: function (a, b, c, d) {
        this.options = WgUtil.updateObject(d, this.options);
        this.model = b;
        this.map = L.map(a).setView(c, this.options.zoom);
        this.spot = L.circleMarker(c, {
            color: "#000",
            fillColor: "#FF5555",
            fillOpacity: 0.8,
            opacity: 1,
            weight: 1,
            radius: 8,
        }).addTo(this.map);
        this.options.altcoords.length || (this.options.altcoords = c);
        this.grid_points = new L.LayerGroup();
        this.grid_points_used = new L.LayerGroup();
        this.grid_points.addTo(this.map);
        this.grid_points_used.addTo(this.map);
        L.tileLayer("https://api.maptiler.com/maps/topo/256/{z}/{x}/{y}.png?key=H0CVk3ugbArAT7R16QhB", {
            attribution: ' <a href="http://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a> © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);
        this.makeMarker(this.options.altcoords);
        b.id_model && this.getGrid();
    },
    makeMarker: function (a) {
        var b = this;
        this.marker && this.map.removeLayer(this.marker);
        var c = new WG.Spot();
        this.marker = L.marker(a, {
            icon: c.getIconStandard(),
            draggable: !0,
            zIndexOffset: 1000,
        })
            .addTo(this.map)
            .bindPopup(WgUtil.getLangText("wggrid", "dragme"))
            .openPopup()
            .on("dragend", function () {
                b.updateUsed(1);
            });
    },
    drawGrid: function (a) {
        for (var b = 0; b < a.length; b++) this.addGP(a[b]);
        this.grid_cache[this.model.id_model] = a;
        this.getUsed();
    },
    drawUsed: function (a) {
        this.cleanUsed();
        for (var b = 0; b < a.length; b++) this.addUGP(a[b]);
        1 > a.length && this.marker.closePopup().unbindPopup().bindPopup(WgUtil.getLangText("wggrid", "nodata")).openPopup();
    },
    getGrid: function () {
        if (this.grid_cache[this.model.id_model]) {
            for (var a = this.grid_cache[this.model.id_model], b = 0; b < a.length; b++) this.addGP(a[b]);
            this.getUsed();
        } else {
            a = this.spot.getLatLng();
            var c = this;
            $.getJSON(
                WG.getApi(),
                {
                    q: "grid_points_box",
                    lat: a.lat,
                    lon: a.lng,
                    id_model: this.model.id_model,
                    id_var: this.options.id_var,
                    hr: this.options.hr,
                    x: this.options.x,
                    y: this.options.y,
                },
                function (a) {
                    c.drawGrid(a);
                }
            );
        }
    },
    resetCache: function () {
        this.grid_cache = [];
    },
    getUsed: function (a) {
        var b = this.marker.getLatLng(),
            c = this.spot.getLatLng(),
            d = b.distanceTo(c) / 1000;
        a &&
            (d < this.options.minkoef * this.model.rozliseni
                ? (this.marker
                      .unbindPopup()
                      .bindPopup(WgUtil.getLangText("wggrid", "tooclose") + " (" + WgUtil.round(d, 1) + " km)")
                      .openPopup(),
                  (b = c),
                  this.marker.setLatLng(b))
                : this.marker.closePopup().unbindPopup().bindPopup(WgUtil.getLangText("wggrid", "alt")));
        var e = this;
        $.getJSON(
            WG.getApi(),
            {
                q: "grid_points",
                lat: b.lat,
                lon: b.lng,
                id_model: this.model.id_model,
            },
            function (b) {
                e.drawUsed(b);
                if (e.options.on_get_used_update && a) e.options.on_get_used_update(b.length);
                if (e.options.on_get_used) e.options.on_get_used(b.length);
            }
        );
    },
    saveAltCoords: function (a, b) {
        var c = this.marker.getLatLng();
        b = b || {};
        a = {
            q: "set_alt_coords",
            lat: c.lat,
            lon: c.lng,
            id_model: this.model.id_model,
            id_spot: a,
        };
        b.hasOwnProperty("admincode") && (a.admincode = b.admincode);
        b.hasOwnProperty("onload") && (a.onload = b.onload);
        b.hasOwnProperty("enable") && (a.enable = b.enable ? 1 : 0);
        $.getJSON(WG.getApi(), a, function (a) {
            "error" == a["return"] ? (b.alertfn ? b.alertfn(a.message, 1) : alert(a.message)) : b.alertfn ? b.alertfn(a.message, 0) : alert(a.message);
            if (b.onload) b.onload(a);
        });
    },
    loadAltCoords: function (a, b) {
        var c = this;
        b = b || {};
        c.cleanUsed();
        a &&
            $.getJSON(
                WG.getApi(),
                {
                    q: "load_alt_coords",
                    id_model: this.model.id_model,
                    id_spot: a,
                },
                function (a) {
                    WgUtil.isDefined(a.lat) ? c.makeMarker([a.lat, a.lon]) : c.makeMarker(c.spot.getLatLng());
                    c.updateUsed(0);
                    if (b.onload) b.onload(a);
                }
            );
    },
    updateUsed: function (a) {
        this.cleanUsed();
        this.getUsed(a);
    },
    cleanUsed: function () {
        this.grid_points_used.clearLayers();
    },
    addGP: function (a) {
        var b = "#FFFFFF";
        0 < a.data.length && (b = "#5555FF");
        a = L.circleMarker([a.lat, a.lon], {
            color: "#000",
            fillColor: b,
            fillOpacity: 0.8,
            opacity: 1,
            weight: 1,
            radius: 12,
        });
        this.grid_points.addLayer(a);
    },
    addUGP: function (a) {
        var b = L.circleMarker([a.lat, a.lon], {
            color: "#000",
            fillColor: "#55FF55",
            fillOpacity: 1,
            opacity: 1,
            weight: 1,
            radius: 12,
        });
        this.grid_points_used.addLayer(b);
        b = L.divIcon({
            className: "grid-vaha",
            html: Math.round(100 * a.vaha),
            iconSize: [30, 16],
            iconAnchor: [15, 8],
        });
        a = L.marker([a.lat, a.lon], {
            icon: b,
        });
        this.grid_points_used.addLayer(a);
    },
    loadGrid: function (a, b, c) {
        c = c || {};
        c.x && (this.options.x = c.x);
        c.y && (this.options.y = c.y);
        this.model = a;
        this.grid_points.clearLayers();
        this.grid_points_used.clearLayers();
        this.map.setView(this.map.getCenter(), b, {
            reset: !0,
        });
        this.getGrid(1);
    },
};
WG.Guide = $class({
    constructor: function (a) {
        WG.Guide._lastGuide && WG.Guide._lastGuide.destroy();
        $.extend(
            this,
            {
                title: "",
            },
            a
        );
        var b = this;
        this.items = [];
        this.current = null;
        this.position = 0;
        this.on = !1;
        a = $('<div id="guide-no-target" style="position: fixed; top: 50px; right: 50%;">.</div>').appendTo($("body"));
        var c = $(
            '<div class="guide-status">&nbsp;</div><div class="guide-text"></div><div class="guide-nav"><button id="guide-prev-button" class="guide hide"><svg class="icon inbutton"><use xlink:href="#ico_left"></use></svg> ' +
                WG.ttStr(2596, 5, "Previous", "", "79", "@@@") +
                '</button><button id="guide-next-button" class="guide" style="float: right">' +
                WG.ttStr(2597, 5, "Next", "", "79", "@@@") +
                ' <svg class="icon"><use xlink:href="#ico_right"></use></svg></button><button id="guide-close-button" class="guide hide" style="float: right"><svg class="icon"><use xlink:href="#ico_ok"></use></svg> ' +
                WG.ttStr(2598, 5, "Close", "", "79", "@@@") +
                "</button></div>"
        );
        this.$notarget = a;
        c.find("#guide-prev-button").on("click", function () {
            b.prev();
        });
        c.find("#guide-next-button").on("click", function () {
            b.next();
        });
        c.find("#guide-close-button").on("click", function () {
            b.close();
        });
        this.jbox = new jBox("Tooltip", {
            addClass: "wg-guide",
            target: this.$notarget,
            closeButton: "box",
            content: c,
            repositionOnContent: !0,
            offset: {
                x: 0,
                y: 5,
            },
            adjustTracker: !0,
            onCloseComplete: function () {
                b.destroy();
            },
        });
        WG.Guide._lastGuide = this;
    },
    addPageItems: function (a) {
        var b = this;
        $(a).each(function () {
            var a = $(this);
            a = new WG.GuideItem({
                $target: a,
                priority: parseFloat(a.data("guide-priority")),
                src: a.data("guide-src"),
                guide: b,
            });
            b.items[b.items.length] = a;
        });
        this.sortItems();
    },
    addInnerItems: function (a) {
        for (var b = 0; b < a.length; b++) {
            var c = a[b];
            c = new WG.GuideItem({
                priority: c.priority,
                src: c.src,
                guide: this,
            });
            this.items[this.items.length] = c;
        }
        this.sortItems();
    },
    sortItems: function () {
        this.items.sort(function (a, b) {
            return a.priority - b.priority;
        });
    },
    navButtons: function () {
        var a = this.$content.find(".guide-nav");
        0 < this.position ? a.find("#guide-prev-button").show() : a.find("#guide-prev-button").hide();
        this.position + 1 < this.items.length ? (a.find("#guide-next-button").show(), a.find("#guide-close-button").hide()) : (a.find("#guide-next-button").hide(), a.find("#guide-close-button").show());
    },
    next: function () {
        if (this.items.length)
            if ((this.position++, this.items[this.position])) {
                this.current = this.items[this.position];
                var a = this.current.$target;
                a && !a.is(":visible") ? this.next() : (this.current.open(), this.navButtons(), this.setStatus());
            } else this.position--, this.close();
    },
    setStatus: function () {
        this.jbox.content
            .find(".guide-status")
            .empty()
            .append(this.title + " " + (this.position + 1) + " / " + this.items.length);
    },
    prev: function () {
        if (this.items.length)
            if ((this.position--, this.items[this.position])) {
                this.current = this.items[this.position];
                var a = this.current.$target;
                a && !a.is(":visible") ? this.prev() : (this.current.open(), this.navButtons(), this.setStatus());
            } else this.position++, this.close();
    },
    toggle: function () {
        this.on ? this.close() : this.open();
    },
    open: function () {
        this.jbox.open();
        this.$content = this.jbox.content;
        this.navButtons();
        this.current = this.items[this.position];
        this.current.open();
        this.setStatus();
        this.on = !0;
    },
    close: function () {
        this.on = !1;
        this.jbox.close();
    },
    destroy: function () {
        delete WG.Guide._lastGuide;
        this.on = !1;
        this.jbox.destroy();
        this.$notarget.remove();
    },
});
WG.GuideItem = $class({
    constructor: function (a) {
        $.extend(
            this,
            {
                $target: null,
                priority: 0,
                on: !1,
                src: "empty.php",
                guide: !1,
            },
            a
        );
        this.src = "/guide/" + this.src;
    },
    isVisible: function () {
        return this.$target ? this.$target.is(":visible") : !0;
    },
    open: function () {
        this.on = !0;
        var a = this,
            b = this.guide;
        b &&
            (b.$content.find(".guide-text").load(this.src, function () {
                a.$target
                    ? (b.jbox.position({
                          target: a.$target,
                      }),
                      a.pointer(!0))
                    : (a.pointer(!1),
                      b.jbox.position({
                          target: b.$notarget,
                      }));
            }),
            b.jbox.toFront());
    },
    pointer: function (a) {
        var b = this.guide.jbox;
        a ? b.wrapper.find(".jBox-pointer").show() : b.wrapper.find(".jBox-pointer").hide();
    },
    close: function () {
        this.on = !1;
    },
    log: function () {
        WG.log(this);
    },
});
WG.Notification = {
    _sw: null,
    _swr: null,
    _fmsg: null,
    _ok: !1,
    getPermission: function () {
        var a = this;
        if (!("Notification" in window)) return WG.log("This browser does not support notifications!"), a.callback_fail(), !1;
        this._fmsg
            .requestPermission()
            .then(function () {
                WG.log("Notification permission granted.");
                WG.Notification.register();
            })
            .catch(function (b) {
                WG.log("Unable to get permission to notify.", b);
                a.callback_fail();
            });
    },
    register: function (a) {
        var b = this;
        this._fmsg
            .getToken()
            .then(function (c) {
                if (c) {
                    WG.log("FCM token", c);
                    b._current_token = c;
                    var d = !0,
                        e = WG.loadLocalStorage("WG.FCM.token"),
                        f = WG.loadLocalStorage("WG.FCM.token_id_user");
                    e == c && f == WG.user.id_user && ((d = !1), (b._ok = !0), b.callback_ok(), WG.log("FCM token already sent..."));
                    a && (d = !0);
                    d && b.sendTokenToServer(c);
                } else WG.log("No Instance ID token available. Request permission to generate one."), b.callback_fail();
            })
            .catch(function (a) {
                WG.log("An error occurred while retrieving token. ", a);
                b.callback_fail();
            });
    },
    unregister: function () {
        var a = this;
        this._fmsg
            .deleteToken(a._current_token)
            .then(function (b) {
                WG.qApi(
                    {
                        q: "notification_unregister",
                        token: a._current_token,
                    },
                    function (a) {
                        WG.log(a);
                    }
                );
                b && (WG.log("FCM delete token", b), (a._current_token = null), WG.saveLocalStorage("WG.FCM.token", null));
            })
            .catch(function (a) {
                WG.log("An error occurred while deleting token. ", a);
            });
    },
    resendToken: function () {
        if (!this._current_token) return !1;
        this.sendTokenToServer(this._current_token);
    },
    sendTokenToServer: function (a) {
        var b = this;
        WG.qApi(
            {
                q: "notification_register",
                token: a,
            },
            function (c) {
                WG.saveLocalStorage("WG.FCM.token", a);
                WG.saveLocalStorage("WG.FCM.token_id_user", WG.user.id_user);
                b._ok = !0;
                b.callback_ok();
            }
        );
    },
    isSupported: function () {
        if ("serviceWorker" in navigator && "PushManager" in window && "firebase" in window) return WG.log("WG.Notification available"), !0;
        WG.log("WG.Notification not available");
        return !1;
    },
    isGranted: function () {
        return "Notification" in window && "granted" == Notification.permission ? !0 : !1;
    },
    onMessage: function (a) {
        WG.log("FCM message received:", a);
        if (a) {
            var b = a.notification;
            a = {
                body: b.body,
            };
            b.icon && (a.icon = b.icon);
            new Notification(b.title, a).onclick = function (a) {
                location.assign(b.click_action);
            };
        }
    },
    init: function (a, b) {
        this.callback_fail = b || function () {};
        this.callback_ok = a || function () {};
        if (this.isSupported()) {
            var c = this;
            c._fmsg
                ? c._ok
                    ? this.callback_ok()
                    : this.callback_fail()
                : navigator.serviceWorker.getRegistration().then(function (a) {
                      WG.Notification._swr = a;
                      c._fmsg = firebase.messaging();
                      c._fmsg.useServiceWorker(a);
                      c._fmsg.usePublicVapidKey("BPL6HD_AB_XX55vqj75A6Fa9nH4ynV_rSo0QqGWtYh9m-VOPnSIySMu89tYK51KQmcViJQXeQ33yCe0eU3LADZk");
                      c.getPermission();
                      c._fmsg.onMessage(c.onMessage);
                      c._fmsg.onTokenRefresh(function () {
                          WG.log("token refresh!");
                          c.register();
                      });
                  });
        } else this.callback_fail();
    },
};
(function (a, b) {
    "object" === typeof exports && "undefined" !== typeof module ? (module.exports = b()) : "function" === typeof define && define.amd ? define(b) : (a.WindGL = b());
})(this, function () {
    function a(a, b, c) {
        b = a.createShader(b);
        a.shaderSource(b, c);
        a.compileShader(b);
        if (!a.getShaderParameter(b, a.COMPILE_STATUS)) throw (WG.log("createShader", a.getShaderInfoLog(b)), Error(a.getShaderInfoLog(b)));
        return b;
    }
    function b(b, c, d) {
        var e = b.createProgram();
        c = a(b, b.VERTEX_SHADER, c);
        d = a(b, b.FRAGMENT_SHADER, d);
        b.attachShader(e, c);
        b.attachShader(e, d);
        b.linkProgram(e);
        if (!b.getProgramParameter(e, b.LINK_STATUS)) throw (WG.log("createProgram", b.getProgramInfoLog(e)), Error(b.getProgramInfoLog(e)));
        d = {
            program: e,
        };
        c = b.getProgramParameter(e, b.ACTIVE_ATTRIBUTES);
        for (var f = 0; f < c; f++) {
            var g = b.getActiveAttrib(e, f);
            d[g.name] = b.getAttribLocation(e, g.name);
        }
        c = b.getProgramParameter(e, b.ACTIVE_UNIFORMS);
        for (f = 0; f < c; f++) (g = b.getActiveUniform(e, f)), (d[g.name] = b.getUniformLocation(e, g.name));
        return d;
    }
    function c(a, b, c, d, e) {
        a.bindTexture(a.TEXTURE_2D, b);
        c instanceof Uint8Array ? a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, d, e, 0, a.RGBA, a.UNSIGNED_BYTE, c) : a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, c);
        return b;
    }
    function d(a, b, c, d, e, f) {
        var g = a.createTexture();
        f = f || a.UNSIGNED_BYTE;
        a.bindTexture(a.TEXTURE_2D, g);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, b);
        a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, b);
        c instanceof Uint8Array || c instanceof Float32Array ? a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, d, e, 0, a.RGBA, f, c) : a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, f, c);
        a.bindTexture(a.TEXTURE_2D, null);
        return g;
    }
    function e(a, b, c) {
        a.activeTexture(a.TEXTURE0 + c);
        a.bindTexture(a.TEXTURE_2D, b);
    }
    function f(a, b) {
        var c = a.createBuffer();
        a.bindBuffer(a.ARRAY_BUFFER, c);
        a.bufferData(a.ARRAY_BUFFER, b, a.STATIC_DRAW);
        return c;
    }
    function g(a, b, c, d) {
        a.bindBuffer(a.ARRAY_BUFFER, b);
        a.enableVertexAttribArray(c);
        a.vertexAttribPointer(c, d, a.FLOAT, !1, 0, 0);
    }
    function h(a, b, c) {
        a.bindFramebuffer(a.FRAMEBUFFER, b);
        c && a.framebufferTexture2D(a.FRAMEBUFFER, a.COLOR_ATTACHMENT0, a.TEXTURE_2D, c, 0);
    }
    var k = [
            [0, "#ffffff"],
            [0.2, "#555555"],
            [1, "#000000"],
        ],
        p = function (a, c) {
            this.gl = a;
            c = c || {};
            a.getExtension("OES_standard_derivatives");
            this.fadeOpacity = 0.996;
            this.speedFactor = 0.25;
            this.speedFactorFrame = 1;
            this.dropRate = 0.003;
            this.dropRateBump = 0.01;
            this.numParticles = 65536;
            this.particleSize = 1;
            this.particleSizeSmooth = 0;
            this.screenSizeFactor = 1;
            this.texResize = [1, 1];
            this.texOffset = [0, 0];
            this.texMaskResize = [1, 1];
            this.texMaskOffset = [0, 0];
            this.minSpeed = this.mixVal = 0;
            var d = c.speedcolor;
            var e =
                "\n             vec4 col = texture2D(u_wind, texpos);\n\n            float u_kts = raw2val(col.r, vec2(u_wind_min.r, u_wind_max.r));\n            float v_kts = raw2val(col.g, vec2(u_wind_min.g, u_wind_max.g));\n\n            float speed_t = sqrt((u_kts * u_kts) + (v_kts * v_kts));\n        ";
            d && (e = "\n                vec4 col = texture2D(u_wind, texpos);\n\n                float speed_t = raw2val(col." + d + ", vec2(u_wind_min." + d + ", u_wind_max." + d + "));\n             ");
            d =
                "\n//#define SMOOTH  // pokud chci povolit smooth     \n        \n#ifdef SMOOTH        \n    #ifdef GL_OES_standard_derivatives\n    extension GL_OES_standard_derivatives : enable\n    #endif\n#endif\n        \n        \n        precision highp float;\n\n        uniform sampler2D u_wind;\n        uniform sampler2D u_wind_1;\n        uniform sampler2D u_mask;\n        uniform vec2 u_wind_min;\n        uniform vec2 u_wind_max;\n        uniform vec2 u_wind_1_min;\n        uniform vec2 u_wind_1_max;\n        uniform vec2 uTexResize;\n        uniform vec2 uTexOffset;\n        uniform vec2 uTexMaskResize;\n        uniform vec2 uTexMaskOffset;\n        uniform bool u_use_mask;\n        uniform sampler2D u_color_ramp;\n        uniform float mixVal;\n\n        varying vec2 v_particle_pos;\n        varying float v_smooth;\n\n        float raw2val(const float raw, const vec2 range) {\n            return range.x + raw * (range.y - range.x);\n        }        \n\n        " +
                c.colors.shaderColorFn("get_color_wind") +
                " \n\n        void main() {\n\n            vec2 texpos = v_particle_pos * uTexResize + uTexOffset;\n            vec2 texpos_mask = v_particle_pos * uTexMaskResize + uTexMaskOffset;\n\n            if(u_use_mask) {\n                vec4 maskcolor = texture2D(u_mask, texpos_mask);\n                if(maskcolor.r < 1. && maskcolor.a > 0.  || texpos_mask.x < 0. || texpos_mask.x > 1. || texpos_mask.y < 0. || texpos_mask.y > 1.) {\n                    gl_FragColor = vec4(0.,0.,0.,0.); return;\n                } \n            }\n\n            " +
                e +
                "\n            \n            vec4 color = get_color_wind(speed_t);\n            \n            float r = 0.0, delta = 0.0, alpha = 1.0;\n        \n            #ifdef SMOOTH\n            if(v_smooth > 0.) {\n                vec2 cxy = 2.0 * gl_PointCoord - 1.0;\n                r = dot(cxy, cxy);\n        \n                delta = fwidth(0.0*r); // POZNAMKA VIZ VYSE!\n        \n                alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);\n            }\n            #endif\n\n            color.a *= alpha;\n            gl_FragColor = color;            \n\n        }\n        ";
            this.drawProgram = b(
                a,
                "\n//#define SMOOTH  // pokud chci povolit smooth     \n    \nprecision highp float;\n\nattribute float a_index;\n\nuniform sampler2D u_particles;\n\nuniform float u_particles_res;\nuniform float u_particle_size;\nuniform float u_particle_size_smooth;\n\nvarying vec2 v_particle_pos;\nvarying float v_smooth;\n\n\nconst vec2 bitEnc = vec2(1.,255.);\nconst vec2 bitDec = 1./bitEnc;\n\n// decode particle position from pixel RGBA\nvec2 fromRGBA(const vec4 color) {\n  vec4 rounded_color = floor(color * 255.0 + 0.5) / 255.0;\n  float x = dot(rounded_color.rg, bitDec);\n  float y = dot(rounded_color.ba, bitDec);\n  return vec2(x, y);\n}\n\n// encode particle position to pixel RGBA\nvec4 toRGBA (const vec2 pos) {\n  vec2 rg = bitEnc * pos.x;\n  rg = fract(rg);\n  rg -= rg.yy * vec2(1. / 255., 0.);\n\n  vec2 ba = bitEnc * pos.y;\n  ba = fract(ba);\n  ba -= ba.yy * vec2(1. / 255., 0.);\n\n  return vec4(rg, ba);\n}\n\n\n  \nvoid main() {\n\n    vec4 color_x = texture2D(u_particles, vec2(\n        fract(a_index / u_particles_res),\n        floor(a_index / u_particles_res) / u_particles_res));\n\n    v_particle_pos = fromRGBA(color_x);\n\n    gl_PointSize = u_particle_size;\n    v_smooth = 0.0;\n\n    #ifdef SMOOTH        \n    #ifdef GL_OES_standard_derivatives\n        if(u_particle_size_smooth > 0.) {\n            gl_PointSize = u_particle_size_smooth;\n            v_smooth = 1.0;\n        }\n    #endif\n    #endif\n\n    gl_Position = vec4(2.0 * v_particle_pos.x - 1.0, 1.0 - 2.0 * v_particle_pos.y, 0, 1);\n}    ",
                d
            );
            this.screenProgram = b(
                a,
                "\nprecision mediump float;\n\nattribute vec2 a_pos;\n\nvarying vec2 v_tex_pos;\n\nvoid main() {\n    v_tex_pos = a_pos;\n    gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);\n}\n",
                "\nprecision highp float;\n\nuniform sampler2D u_screen;\nuniform float u_opacity;\n\nvarying vec2 v_tex_pos;\n\nvoid main() {\n    vec4 color = texture2D(u_screen, 1.0 - v_tex_pos);\n    // a hack to guarantee opacity fade out even with a value close to 1.0\n    gl_FragColor = vec4(floor(255.0 * color * u_opacity) / 255.0);\n}\n"
            );
            d = c.dirfile;
            e = c.dircolor;
            var g = c.speedcolor,
                h =
                    "\n            vec2 velocity_0 = mix(u_wind_min, u_wind_max, lookup_wind(u_wind, pos * uTexResize + uTexOffset));\n            vec2 velocity_1 = mix(u_wind_1_min, u_wind_1_max, lookup_wind(u_wind_1, pos * uTexResize + uTexOffset));\n        ",
                n = "";
            e &&
                ((d = d || "wind"),
                (g = g || "r"),
                (h =
                    "\n            float minsp = (u_min_speed - u_wind_min." +
                    g +
                    ") / (u_wind_max." +
                    g +
                    " - u_wind_min." +
                    g +
                    ") ;\n            vec2 velocity_0 = mix(vec2(u_wind_min." +
                    g +
                    ",u_wind_min." +
                    g +
                    "), vec2(u_wind_max." +
                    g +
                    ",u_wind_max." +
                    g +
                    "), lookup_speed_dir(u_wind, u_" +
                    d +
                    ", pos * uTexResize + uTexOffset, minsp));\n            vec2 velocity_1 = mix(vec2(u_wind_min." +
                    g +
                    ",u_wind_min." +
                    g +
                    "), vec2(u_wind_max." +
                    g +
                    ",u_wind_max." +
                    g +
                    "), lookup_speed_dir(u_wind_1, u_" +
                    d +
                    "_1, pos * uTexResize + uTexOffset, minsp));\n            "),
                (n =
                    "\n                // wind speed lookup; speed a dir zvlast, dir je kodovano 0 - 360 \n                vec2 lookup_speed_dir(const sampler2D u_wind, const sampler2D u_windx, const vec2 uv, float minspeed) {\n                    float speed = max(minspeed,texture2D(u_wind, uv)." +
                    g +
                    ");\n                    float dir = texture2D(u_windx, uv)." +
                    e +
                    " * 360.0;\n\n                    float u = -speed * sin(dir * (PI / 180.0));\n                    float v = -speed * cos(dir * (PI / 180.0));\n                    return vec2(u, v);\n                }\n            "));
            this.updateProgram = b(
                a,
                "\nprecision mediump float;\n\nattribute vec2 a_pos;\n\nvarying vec2 v_tex_pos;\n\nvoid main() {\n    v_tex_pos = a_pos;\n    gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);\n}\n",
                "\n    precision highp float;\n\n    uniform sampler2D u_particles;\n    uniform sampler2D u_wind;\n    uniform sampler2D u_wind_1;\n    uniform sampler2D u_windx;\n    uniform sampler2D u_windx_1;\n    uniform vec2 u_wind_res;\n    uniform vec2 u_wind_min;\n    uniform vec2 u_wind_max;\n    uniform vec2 u_wind_1_min;\n    uniform vec2 u_wind_1_max;\n    uniform vec2 uTexResize;\n    uniform vec2 uTexOffset;\n    uniform vec2 uTexMaskResize;\n    uniform vec2 uTexMaskOffset;\n    uniform float u_rand_seed;\n    uniform float u_speed_factor;\n    uniform float u_speed_factor_frame;\n    uniform float u_drop_rate;\n    uniform float u_drop_rate_bump;\n    uniform float mixVal;\n    uniform float u_min_speed;\n\n    varying vec2 v_tex_pos;\n    const float PI = 3.141592653589793;\n\n    // pseudo-random generator\n    const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);\n    float rand(const vec2 co) {\n        float t = dot(rand_constants.xy, co);\n        return fract(sin(t) * (rand_constants.z + t));\n    }\n\n    // wind speed lookup; use manual bilinear filtering based on 4 adjacent pixels for smooth interpolation\n    vec2 lookup_wind(const sampler2D u_wind, const vec2 uv) {\n        return texture2D(u_wind, uv).rg; // lower-res hardware filtering, staci...\n\n        vec2 px = 1.0 / u_wind_res;\n        vec2 vc = (floor(uv * u_wind_res)) * px;\n        vec2 f = fract(uv * u_wind_res);\n        vec2 tl = texture2D(u_wind, vc).rg;\n        vec2 tr = texture2D(u_wind, vc + vec2(px.x, 0)).rg;\n        vec2 bl = texture2D(u_wind, vc + vec2(0, px.y)).rg;\n        vec2 br = texture2D(u_wind, vc + px).rg;\n        return mix(mix(tl, tr, f.x), mix(bl, br, f.x), f.y);\n    }\n\n    " +
                    n +
                    "\n\n    \nconst vec2 bitEnc = vec2(1.,255.);\nconst vec2 bitDec = 1./bitEnc;\n\n// decode particle position from pixel RGBA\nvec2 fromRGBA(const vec4 color) {\n  vec4 rounded_color = floor(color * 255.0 + 0.5) / 255.0;\n  float x = dot(rounded_color.rg, bitDec);\n  float y = dot(rounded_color.ba, bitDec);\n  return vec2(x, y);\n}\n\n// encode particle position to pixel RGBA\nvec4 toRGBA (const vec2 pos) {\n  vec2 rg = bitEnc * pos.x;\n  rg = fract(rg);\n  rg -= rg.yy * vec2(1. / 255., 0.);\n\n  vec2 ba = bitEnc * pos.y;\n  ba = fract(ba);\n  ba -= ba.yy * vec2(1. / 255., 0.);\n\n  return vec4(rg, ba);\n}\n\n\n  " +
                    ("\n\n    void main() {\n\n        float mixv = mixVal;\n\n        vec4 color_x = texture2D(u_particles, v_tex_pos);\n\n        vec2 pos = fromRGBA(color_x);\n\n        " +
                        h +
                        "\n\n        float speed_t_0 = length(velocity_0) / length(u_wind_max);\n        float speed_t_1 = length(velocity_1) / length(u_wind_1_max);\n\n        // VH update distortion, dle u_wind_res \n        float distortion = u_wind_res.x / u_wind_res.y;\n        vec2 offset_0 = vec2(velocity_0.x / distortion, -velocity_0.y) * 0.0001 * u_speed_factor * u_speed_factor_frame;\n        vec2 offset_1 = vec2(velocity_1.x / distortion, -velocity_1.y) * 0.0001 * u_speed_factor * u_speed_factor_frame;\n\n        vec2 offset = mix(offset_0,offset_1,mixv);\n        \n        float speed_t = mix(speed_t_0,speed_t_1,mixv);\n\n        // update particle position, wrapping around the boundaries\n        pos = fract(1.0 + pos + offset);\n\n        // a random seed to use for the particle drop\n        vec2 seed = (pos + v_tex_pos) * u_rand_seed;\n\n        // drop rate is a chance a particle will restart at random position, to avoid degeneration\n        float drop_rate = u_drop_rate + speed_t * u_drop_rate_bump;\n\n        float retain = step(drop_rate, rand(seed));\n\n        vec2 random_pos = vec2(rand(seed + 1.3), 1.0 - rand(seed + 2.1));\n        pos = mix(pos, random_pos, 1.0 - retain);\n        gl_FragColor = toRGBA(pos);\n    }\n      ")
            );
            this.quadBuffer = f(a, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
            this.framebuffer = a.createFramebuffer();
            this.setColorRamp(c.colors || k);
            this.resize();
        },
        q = {
            numParticles: {},
        };
    p.prototype.resize = function () {
        var a = this.gl,
            b = new Uint8Array(a.canvas.width * a.canvas.height * 4);
        this.backgroundTexture = d(a, a.NEAREST, b, a.canvas.width, a.canvas.height);
        this.screenTexture = d(a, a.NEAREST, b, a.canvas.width, a.canvas.height);
    };
    p.prototype.setColorRamp = function (a) {
        var b = this.gl,
            c = this.gl.LINEAR,
            e = document.createElement("canvas"),
            f = e.getContext("2d");
        e.width = 256;
        e.height = 1;
        e = f.createLinearGradient(0, 0, 256, 0);
        for (var g = 0; g < a.length; g++) e.addColorStop(+a[g][0], a[g][1]);
        f.fillStyle = e;
        f.fillRect(0, 0, 256, 1);
        a = new Uint8Array(f.getImageData(0, 0, 256, 1).data);
        this.colorRampTexture = d(b, c, a, 16, 16);
    };
    q.numParticles.set = function (a) {
        var b = this.gl,
            c = (this.particleStateResolution = Math.ceil(Math.sqrt(a)));
        this._numParticles = c * c;
        var e = new Uint8Array(4 * this._numParticles),
            g = new Uint8Array(4 * this._numParticles);
        for (a = 0; a < e.length; a++) (e[a] = 256 * Math.random()), (g[a] = 256 * Math.random());
        this.particleStateTexture0 = d(b, b.NEAREST, e, c, c);
        this.particleStateTexture1 = d(b, b.NEAREST, e, c, c);
        c = new Float32Array(this._numParticles);
        for (a = 0; a < this._numParticles; a++) c[a] = a;
        this.particleIndexBuffer = f(b, c);
    };
    q.numParticles.get = function () {
        return this._numParticles;
    };
    p.prototype.setWind = function (a, b, e, f, g, h) {
        function n(a) {
            k.useProgram(a.program);
            k.uniform2f(a.u_wind_min, m.windData.uMin, m.windData.vMin);
            k.uniform2f(a.u_wind_max, m.windData.uMax, m.windData.vMax);
            k.uniform2f(a.u_wind_1_min, m.windData_1.uMin, m.windData_1.vMin);
            k.uniform2f(a.u_wind_1_max, m.windData_1.uMax, m.windData_1.vMax);
            k.uniform2f(a.uTexResize, m.texResize[0], m.texResize[1]);
            k.uniform2f(a.uTexOffset, m.texOffset[0], m.texOffset[1]);
            k.uniform2f(a.uTexMaskResize, m.texMaskResize[0], m.texMaskResize[1]);
            k.uniform2f(a.uTexMaskOffset, m.texMaskOffset[0], m.texMaskOffset[1]);
        }
        var k = this.gl;
        this.windData = a;
        this.windData_1 = e || a;
        this.windTexture
            ? ((this.windTexture = c(this.gl, this.windTexture, b)), (this.windTexture_1 = c(this.gl, this.windTexture_1, f || b)))
            : ((this.windTexture = d(this.gl, this.gl.LINEAR, b)), (this.windTexture_1 = d(this.gl, this.gl.LINEAR, f || b)));
        g &&
            (this.dirTexture
                ? ((this.dirTexture = c(this.gl, this.dirTexture, g)), (this.dirTexture_1 = c(this.gl, this.dirTexture_1, h || g)))
                : ((this.dirTexture = d(this.gl, this.gl.LINEAR, g)), (this.dirTexture_1 = d(this.gl, this.gl.LINEAR, h || g))));
        var m = this;
        n(this.drawProgram);
        n(this.updateProgram);
    };
    p.prototype.setMask = function (a) {
        this._mask_set || ((this.windMask = d(this.gl, this.gl.LINEAR, a.getImageData())), (this._mask_set = !0));
    };
    p.prototype.setMixVal = function (a) {
        this.mixVal = a;
    };
    p.prototype.draw = function () {
        var a = this.gl;
        a.disable(a.DEPTH_TEST);
        a.disable(a.STENCIL_TEST);
        e(a, this.windTexture, 0);
        e(a, this.windTexture_1, 6);
        e(a, this.particleStateTexture0, 3);
        this.dirTexture && (e(a, this.dirTexture, 7), e(a, this.dirTexture_1, 8));
        var b = (a = Date.now()) - this._lastLoop;
        this.speedFactorFrame = this._lastLoop ? 60 / (1000 / b) : 1;
        this._lastLoop = a;
        this.drawScreen();
        this.updateParticles();
    };
    p.prototype.clear = function () {
        var a = this.gl;
        a.clear(a.DEPTH_BUFFER_BIT | a.COLOR_BUFFER_BIT);
    };
    p.prototype.drawScreen = function () {
        var a = this.gl;
        h(a, this.framebuffer, this.screenTexture);
        a.viewport(0, 0, a.canvas.width, a.canvas.height);
        a.enable(a.BLEND);
        a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
        this.drawTexture(this.backgroundTexture, this.fadeOpacity);
        a.disable(a.BLEND);
        this.drawParticles();
        h(a, null);
        a.enable(a.BLEND);
        a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
        this.drawTexture(this.screenTexture, 1);
        a.disable(a.BLEND);
        a = this.backgroundTexture;
        this.backgroundTexture = this.screenTexture;
        this.screenTexture = a;
    };
    p.prototype.drawTexture = function (a, b) {
        var c = this.gl,
            d = this.screenProgram;
        c.useProgram(d.program);
        g(c, this.quadBuffer, d.a_pos, 2);
        e(c, a, 2);
        c.uniform1i(d.u_screen, 2);
        c.uniform1f(d.u_opacity, b * (1 - (1 - b) * this.speedFactorFrame));
        c.drawArrays(c.TRIANGLES, 0, 6);
    };
    p.prototype.drawParticles = function () {
        var a = this.gl,
            b = this.drawProgram;
        a.useProgram(b.program);
        g(a, this.particleIndexBuffer, b.a_index, 1);
        e(a, this.colorRampTexture, 2);
        a.uniform1i(b.u_wind, 0);
        a.uniform1i(b.u_color_ramp, 2);
        a.uniform1i(b.u_particles, 3);
        this.windMask && (e(a, this.windMask, 5), a.uniform1i(b.u_mask, 5), a.uniform1i(b.u_use_mask, 1));
        a.uniform1f(b.u_particle_size, this.particleSize);
        a.uniform1f(b.u_particle_size_smooth, this.particleSizeSmooth);
        a.uniform1f(b.u_particles_res, this.particleStateResolution);
        a.uniform2f(b.u_wind_min, this.windData.uMin, this.windData.vMin);
        a.uniform2f(b.u_wind_max, this.windData.uMax, this.windData.vMax);
        a.uniform2f(b.uTexResize, this.texResize[0], this.texResize[1]);
        a.uniform2f(b.uTexOffset, this.texOffset[0], this.texOffset[1]);
        a.uniform2f(b.uTexMaskResize, this.texMaskResize[0], this.texMaskResize[1]);
        a.uniform2f(b.uTexMaskOffset, this.texMaskOffset[0], this.texMaskOffset[1]);
        a.enable(a.BLEND);
        a.blendFunc(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA);
        a.drawArrays(a.POINTS, 0, this._numParticles);
        a.disable(a.BLEND);
    };
    p.prototype.updateParticles = function () {
        var a = this.gl;
        h(a, this.framebuffer, this.particleStateTexture1);
        a.viewport(0, 0, this.particleStateResolution, this.particleStateResolution);
        var b = this.updateProgram;
        a.useProgram(b.program);
        g(a, this.quadBuffer, b.a_pos, 2);
        a.uniform1i(b.u_wind, 0);
        a.uniform1i(b.u_wind_1, 6);
        a.uniform1i(b.u_particles, 3);
        this.dirTexture && (a.uniform1i(b.u_windx, 7), a.uniform1i(b.u_windx_1, 8));
        a.uniform1f(b.u_rand_seed, Math.random());
        a.uniform2f(b.u_wind_res, this.windData.width, this.windData.height);
        a.uniform2f(b.u_wind_min, this.windData.uMin, this.windData.vMin);
        a.uniform2f(b.u_wind_max, this.windData.uMax, this.windData.vMax);
        a.uniform1f(b.u_speed_factor, this.speedFactor / (a.canvas.height / 1000));
        a.uniform1f(b.u_speed_factor_frame, this.speedFactorFrame);
        a.uniform1f(b.u_drop_rate, this.dropRate);
        a.uniform1f(b.u_drop_rate_bump, this.dropRateBump);
        a.uniform1f(b.mixVal, this.mixVal);
        a.uniform1f(b.u_min_speed, this.minSpeed);
        a.uniform2f(b.uTexResize, this.texResize[0], this.texResize[1]);
        a.uniform2f(b.uTexOffset, this.texOffset[0], this.texOffset[1]);
        a.uniform2f(b.uTexMaskResize, this.texMaskResize[0], this.texMaskResize[1]);
        a.uniform2f(b.uTexMaskOffset, this.texMaskOffset[0], this.texMaskOffset[1]);
        a.drawArrays(a.TRIANGLES, 0, 6);
        a = this.particleStateTexture0;
        this.particleStateTexture0 = this.particleStateTexture1;
        this.particleStateTexture1 = a;
    };
    Object.defineProperties(p.prototype, q);
    return p;
});
(function (a) {
    "object" === typeof exports && "undefined" !== typeof module
        ? (module.exports = a())
        : "function" === typeof define && define.amd
        ? define([], a)
        : (("undefined" !== typeof window ? window : "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : this).db = a());
})(function () {
    return (function e(b, c, d) {
        function f(h, p) {
            if (!c[h]) {
                if (!b[h]) {
                    var k = "function" == typeof require && require;
                    if (!p && k) return k(h, !0);
                    if (g) return g(h, !0);
                    p = Error("Cannot find module '" + h + "'");
                    throw ((p.code = "MODULE_NOT_FOUND"), p);
                }
                p = c[h] = {
                    exports: {},
                };
                b[h][0].call(
                    p.exports,
                    function (c) {
                        var d = b[h][1][c];
                        return f(d ? d : c);
                    },
                    p,
                    p.exports,
                    e,
                    b,
                    c,
                    d
                );
            }
            return c[h].exports;
        }
        for (var g = "function" == typeof require && require, h = 0; h < d.length; h++) f(d[h]);
        return f;
    })(
        {
            1: [
                function (b, c, d) {
                    function e(b) {
                        if (Array.isArray(b)) {
                            for (var c = 0, d = Array(b.length); c < b.length; c++) d[c] = b[c];
                            return d;
                        }
                        return Array.from(b);
                    }
                    var f = (function () {
                        return function (b, c) {
                            if (Array.isArray(b)) return b;
                            $jscomp.initSymbol();
                            $jscomp.initSymbolIterator();
                            if (Symbol.iterator in Object(b)) {
                                var d = [],
                                    e = !0,
                                    f = !1,
                                    g = void 0;
                                try {
                                    $jscomp.initSymbol();
                                    $jscomp.initSymbolIterator();
                                    for (var h = b[Symbol.iterator](), k; !(e = (k = h.next()).done) && (d.push(k.value), !c || d.length !== c); e = !0);
                                } catch (B) {
                                    (f = !0), (g = B);
                                } finally {
                                    try {
                                        if (!e && h["return"]) h["return"]();
                                    } finally {
                                        if (f) throw g;
                                    }
                                }
                                return d;
                            }
                            throw new TypeError("Invalid attempt to destructure non-iterable instance");
                        };
                    })();
                    $jscomp.initSymbol();
                    $jscomp.initSymbol();
                    $jscomp.initSymbolIterator();
                    var g =
                        "function" === typeof Symbol && "symbol" === typeof Symbol.iterator
                            ? function (b) {
                                  return typeof b;
                              }
                            : function (b) {
                                  $jscomp.initSymbol();
                                  $jscomp.initSymbol();
                                  return b && "function" === typeof Symbol && b.constructor === Symbol ? "symbol" : typeof b;
                              };
                    (function (b) {
                        function d(b) {
                            return b && "object" === ("undefined" === typeof b ? "undefined" : g(b));
                        }
                        function h(b) {
                            var c = Object.keys(b).sort();
                            if (1 === c.length) {
                                c = c[0];
                                var d = b[c];
                                b = void 0;
                                switch (c) {
                                    case "eq":
                                        c = "only";
                                        break;
                                    case "gt":
                                        c = "lowerBound";
                                        b = !0;
                                        break;
                                    case "lt":
                                        c = "upperBound";
                                        b = !0;
                                        break;
                                    case "gte":
                                        c = "lowerBound";
                                        break;
                                    case "lte":
                                        c = "upperBound";
                                        break;
                                    default:
                                        throw new TypeError("`" + c + "` is not a valid key");
                                }
                                return [c, [d, b]];
                            }
                            d = b[c[0]];
                            b = b[c[1]];
                            var e = c.join("-");
                            switch (e) {
                                case "gt-lt":
                                case "gt-lte":
                                case "gte-lt":
                                case "gte-lte":
                                    return ["bound", [d, b, "gt" === c[0], "lt" === c[1]]];
                                default:
                                    throw new TypeError("`" + e + "` are conflicted keys");
                            }
                        }
                        function q(b) {
                            return !b || "object" !== ("undefined" === typeof b ? "undefined" : g(b)) || b instanceof n ? b : ((b = h(b)), (b = f(b, 2)), n[b[0]].apply(n, e(b[1])));
                        }
                        var n = b.IDBKeyRange || b.webkitIDBKeyRange,
                            m = Object.prototype.hasOwnProperty,
                            t = function (b) {
                                return b;
                            },
                            w;
                        if (!(w = b.indexedDB || b.webkitIndexedDB || b.mozIndexedDB || b.oIndexedDB || b.msIndexedDB || b.shimIndexedDB)) throw Error("IndexedDB required");
                        var B = {},
                            W = ["abort", "error", "versionchange"],
                            ca = function (b, c, d, f) {
                                var k = this,
                                    m = null,
                                    p = function (f, h, k, C, D, p, q) {
                                        return new Promise(function (r, t) {
                                            var G = void 0;
                                            try {
                                                G = f ? n[f].apply(n, e(h)) : null;
                                            } catch (Fa) {
                                                t(Fa);
                                                return;
                                            }
                                            p = p || [];
                                            D = D || null;
                                            var ya = [],
                                                x = 0;
                                            G = [G];
                                            var z = c.transaction(b, m ? "readwrite" : "readonly");
                                            z.onerror = function (b) {
                                                return t(b);
                                            };
                                            z.onabort = function (b) {
                                                return t(b);
                                            };
                                            z.oncomplete = function () {
                                                return r(ya);
                                            };
                                            z = z.objectStore(b);
                                            z = "string" === typeof d ? z.index(d) : z;
                                            "count" !== k && G.push(C || "next");
                                            var w = m ? Object.keys(m) : [],
                                                R = function (b) {
                                                    w.forEach(function (c) {
                                                        var d = m[c];
                                                        "function" === typeof d && (d = d(b));
                                                        b[c] = d;
                                                    });
                                                    return b;
                                                };
                                            z[k].apply(z, G).onsuccess = function (b) {
                                                var c = b.target.result;
                                                if ("number" === typeof c) ya = c;
                                                else if (c)
                                                    if (null !== D && D[0] > x) (x = D[0]), c.advance(D[0]);
                                                    else if (
                                                        !(null !== D && x >= D[0] + D[1]) &&
                                                        ((b = (function () {
                                                            var b = !0,
                                                                d = "value" in c ? c.value : c.key;
                                                            try {
                                                                p.forEach(function (c) {
                                                                    b = "function" === typeof c[0] ? b && c[0](d) : b && d[c[0]] === c[1];
                                                                });
                                                            } catch (ua) {
                                                                return (
                                                                    t(ua),
                                                                    {
                                                                        v: void 0,
                                                                    }
                                                                );
                                                            }
                                                            if (b) {
                                                                x++;
                                                                if (m)
                                                                    try {
                                                                        (d = R(d)), c.update(d);
                                                                    } catch (ua) {
                                                                        return (
                                                                            t(ua),
                                                                            {
                                                                                v: void 0,
                                                                            }
                                                                        );
                                                                    }
                                                                try {
                                                                    ya.push(q(d));
                                                                } catch (ua) {
                                                                    return (
                                                                        t(ua),
                                                                        {
                                                                            v: void 0,
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                            c.continue();
                                                        })()),
                                                        "object" === ("undefined" === typeof b ? "undefined" : g(b)))
                                                    )
                                                        return b.v;
                                            };
                                        });
                                    },
                                    q = function (b, c, d) {
                                        var e = [],
                                            h = "next",
                                            k = "openCursor",
                                            n = null,
                                            r = t,
                                            q = !1,
                                            x = f || d,
                                            z = function () {
                                                return x ? Promise.reject(x) : p(b, c, k, q ? h + "unique" : h, n, e, r);
                                            },
                                            w = function () {
                                                h = null;
                                                k = "count";
                                                return {
                                                    execute: z,
                                                };
                                            },
                                            R = function () {
                                                k = "openKeyCursor";
                                                return {
                                                    desc: Z,
                                                    distinct: N,
                                                    execute: z,
                                                    filter: K,
                                                    limit: ba,
                                                    map: Q,
                                                };
                                            },
                                            ba = function (b, c) {
                                                n = c ? [b, c] : [0, b];
                                                x = n.some(function (b) {
                                                    return "number" !== typeof b;
                                                })
                                                    ? Error("limit() arguments must be numeric")
                                                    : x;
                                                return {
                                                    desc: Z,
                                                    distinct: N,
                                                    filter: K,
                                                    keys: R,
                                                    execute: z,
                                                    map: Q,
                                                    modify: B,
                                                };
                                            },
                                            K = function La(b, c) {
                                                e.push([b, c]);
                                                return {
                                                    desc: Z,
                                                    distinct: N,
                                                    execute: z,
                                                    filter: La,
                                                    keys: R,
                                                    limit: ba,
                                                    map: Q,
                                                    modify: B,
                                                };
                                            },
                                            Z = function () {
                                                h = "prev";
                                                return {
                                                    distinct: N,
                                                    execute: z,
                                                    filter: K,
                                                    keys: R,
                                                    limit: ba,
                                                    map: Q,
                                                    modify: B,
                                                };
                                            },
                                            N = function () {
                                                q = !0;
                                                return {
                                                    count: w,
                                                    desc: Z,
                                                    execute: z,
                                                    filter: K,
                                                    keys: R,
                                                    limit: ba,
                                                    map: Q,
                                                    modify: B,
                                                };
                                            },
                                            B = function (b) {
                                                m = b && "object" === ("undefined" === typeof b ? "undefined" : g(b)) ? b : null;
                                                return {
                                                    execute: z,
                                                };
                                            },
                                            Q = function (b) {
                                                r = b;
                                                return {
                                                    count: w,
                                                    desc: Z,
                                                    distinct: N,
                                                    execute: z,
                                                    filter: K,
                                                    keys: R,
                                                    limit: ba,
                                                    modify: B,
                                                };
                                            };
                                        return {
                                            count: w,
                                            desc: Z,
                                            distinct: N,
                                            execute: z,
                                            filter: K,
                                            keys: R,
                                            limit: ba,
                                            map: Q,
                                            modify: B,
                                        };
                                    };
                                ["only", "bound", "upperBound", "lowerBound"].forEach(function (b) {
                                    k[b] = function () {
                                        return q(b, arguments);
                                    };
                                });
                                this.range = function (b) {
                                    var c = void 0,
                                        d = [null, null];
                                    try {
                                        d = h(b);
                                    } catch (C) {
                                        c = C;
                                    }
                                    return q.apply(void 0, e(d).concat([c]));
                                };
                                this.filter = function () {
                                    var b = q(null, null);
                                    return b.filter.apply(b, arguments);
                                };
                                this.all = function () {
                                    return this.filter();
                                };
                            },
                            J = function (b, c, e, f) {
                                var g = this,
                                    h = !1;
                                this.getIndexedDB = function () {
                                    return b;
                                };
                                this.isClosed = function () {
                                    return h;
                                };
                                this.query = function (c, d) {
                                    return new ca(c, b, d, h ? Error("Database has been closed") : null);
                                };
                                this.add = function (c) {
                                    for (var e = arguments.length, f = Array(1 < e ? e - 1 : 0), g = 1; g < e; g++) f[g - 1] = arguments[g];
                                    return new Promise(function (e, g) {
                                        if (h) g(Error("Database has been closed"));
                                        else {
                                            var C = f.reduce(function (b, c) {
                                                    return b.concat(c);
                                                }, []),
                                                k = b.transaction(c, "readwrite");
                                            k.onerror = function (b) {
                                                b.preventDefault();
                                                g(b);
                                            };
                                            k.onabort = function (b) {
                                                return g(b);
                                            };
                                            k.oncomplete = function () {
                                                return e(C);
                                            };
                                            var n = k.objectStore(c);
                                            C.some(function (b) {
                                                var c = void 0,
                                                    e = void 0;
                                                if (d(b) && m.call(b, "item") && ((e = b.key), (b = b.item), null != e))
                                                    try {
                                                        e = q(e);
                                                    } catch (pa) {
                                                        return g(pa), !0;
                                                    }
                                                try {
                                                    c = null != e ? n.add(b, e) : n.add(b);
                                                } catch (pa) {
                                                    return g(pa), !0;
                                                }
                                                c.onsuccess = function (c) {
                                                    if (d(b)) {
                                                        c = c.target;
                                                        var e = c.source.keyPath;
                                                        null === e && (e = "__id__");
                                                        m.call(b, e) ||
                                                            Object.defineProperty(b, e, {
                                                                value: c.result,
                                                                enumerable: !0,
                                                            });
                                                    }
                                                };
                                            });
                                        }
                                    });
                                };
                                this.update = function (c) {
                                    for (var e = arguments.length, f = Array(1 < e ? e - 1 : 0), g = 1; g < e; g++) f[g - 1] = arguments[g];
                                    return new Promise(function (e, g) {
                                        if (h) g(Error("Database has been closed"));
                                        else {
                                            var C = f.reduce(function (b, c) {
                                                    return b.concat(c);
                                                }, []),
                                                k = b.transaction(c, "readwrite");
                                            k.onerror = function (b) {
                                                b.preventDefault();
                                                g(b);
                                            };
                                            k.onabort = function (b) {
                                                return g(b);
                                            };
                                            k.oncomplete = function () {
                                                return e(C);
                                            };
                                            var n = k.objectStore(c);
                                            C.some(function (b) {
                                                var c = void 0,
                                                    e = void 0;
                                                if (d(b) && m.call(b, "item") && ((e = b.key), (b = b.item), null != e))
                                                    try {
                                                        e = q(e);
                                                    } catch (pa) {
                                                        return g(pa), !0;
                                                    }
                                                try {
                                                    c = null != e ? n.put(b, e) : n.put(b);
                                                } catch (pa) {
                                                    return g(pa), !0;
                                                }
                                                c.onsuccess = function (c) {
                                                    if (d(b)) {
                                                        c = c.target;
                                                        var e = c.source.keyPath;
                                                        null === e && (e = "__id__");
                                                        m.call(b, e) ||
                                                            Object.defineProperty(b, e, {
                                                                value: c.result,
                                                                enumerable: !0,
                                                            });
                                                    }
                                                };
                                            });
                                        }
                                    });
                                };
                                this.put = function () {
                                    return this.update.apply(this, arguments);
                                };
                                this.remove = function (c, d) {
                                    return new Promise(function (e, f) {
                                        if (h) f(Error("Database has been closed"));
                                        else {
                                            try {
                                                d = q(d);
                                            } catch (D) {
                                                f(D);
                                                return;
                                            }
                                            var g = b.transaction(c, "readwrite");
                                            g.onerror = function (b) {
                                                b.preventDefault();
                                                f(b);
                                            };
                                            g.onabort = function (b) {
                                                return f(b);
                                            };
                                            g.oncomplete = function () {
                                                return e(d);
                                            };
                                            g = g.objectStore(c);
                                            try {
                                                g.delete(d);
                                            } catch (D) {
                                                f(D);
                                            }
                                        }
                                    });
                                };
                                this.delete = function () {
                                    return this.remove.apply(this, arguments);
                                };
                                this.clear = function (c) {
                                    return new Promise(function (d, e) {
                                        if (h) e(Error("Database has been closed"));
                                        else {
                                            var f = b.transaction(c, "readwrite");
                                            f.onerror = function (b) {
                                                return e(b);
                                            };
                                            f.onabort = function (b) {
                                                return e(b);
                                            };
                                            f.oncomplete = function () {
                                                return d();
                                            };
                                            f.objectStore(c).clear();
                                        }
                                    });
                                };
                                this.close = function () {
                                    return new Promise(function (d, f) {
                                        h ? f(Error("Database has been closed")) : (b.close(), (h = !0), delete B[c][e], d());
                                    });
                                };
                                this.get = function (c, d) {
                                    return new Promise(function (e, f) {
                                        if (h) f(Error("Database has been closed"));
                                        else {
                                            try {
                                                d = q(d);
                                            } catch (G) {
                                                f(G);
                                                return;
                                            }
                                            var g = b.transaction(c);
                                            g.onerror = function (b) {
                                                b.preventDefault();
                                                f(b);
                                            };
                                            g.onabort = function (b) {
                                                return f(b);
                                            };
                                            g = g.objectStore(c);
                                            var k = void 0;
                                            try {
                                                k = g.get(d);
                                            } catch (G) {
                                                f(G);
                                            }
                                            k.onsuccess = function (b) {
                                                return e(b.target.result);
                                            };
                                        }
                                    });
                                };
                                this.count = function (c, d) {
                                    return new Promise(function (e, f) {
                                        if (h) f(Error("Database has been closed"));
                                        else {
                                            try {
                                                d = q(d);
                                            } catch (G) {
                                                f(G);
                                                return;
                                            }
                                            var g = b.transaction(c);
                                            g.onerror = function (b) {
                                                b.preventDefault();
                                                f(b);
                                            };
                                            g.onabort = function (b) {
                                                return f(b);
                                            };
                                            g = g.objectStore(c);
                                            var k = void 0;
                                            try {
                                                k = null == d ? g.count() : g.count(d);
                                            } catch (G) {
                                                f(G);
                                            }
                                            k.onsuccess = function (b) {
                                                return e(b.target.result);
                                            };
                                        }
                                    });
                                };
                                this.addEventListener = function (c, d) {
                                    if (!W.includes(c)) throw Error("Unrecognized event type " + c);
                                    "error" === c
                                        ? b.addEventListener(c, function (b) {
                                              b.preventDefault();
                                              d(b);
                                          })
                                        : b.addEventListener(c, d);
                                };
                                this.removeEventListener = function (c, d) {
                                    if (!W.includes(c)) throw Error("Unrecognized event type " + c);
                                    b.removeEventListener(c, d);
                                };
                                W.forEach(function (b) {
                                    this[b] = function (c) {
                                        this.addEventListener(b, c);
                                        return this;
                                    };
                                }, this);
                                if (!f) {
                                    var k = void 0;
                                    [].some.call(b.objectStoreNames, function (b) {
                                        if (g[b]) return (k = Error('The store name, "' + b + '", which you have attempted to load, conflicts with db.js method names."')), g.close(), !0;
                                        g[b] = {};
                                        Object.keys(g)
                                            .filter(function (b) {
                                                return ![].concat(W, ["close", "addEventListener", "removeEventListener"]).includes(b);
                                            })
                                            .map(function (c) {
                                                return (g[b][c] = function () {
                                                    for (var d = arguments.length, e = Array(d), f = 0; f < d; f++) e[f] = arguments[f];
                                                    return g[c].apply(g, [b].concat(e));
                                                });
                                            });
                                    });
                                    return k;
                                }
                            },
                            X = function (b, c, d, e, f, h) {
                                if (d && 0 !== d.length) {
                                    for (b = 0; b < e.objectStoreNames.length; b++) (f = e.objectStoreNames[b]), m.call(d, f) || e.deleteObjectStore(f);
                                    var k = void 0;
                                    Object.keys(d).some(function (b) {
                                        var f = d[b],
                                            h = void 0;
                                        if (e.objectStoreNames.contains(b)) h = c.transaction.objectStore(b);
                                        else
                                            try {
                                                h = e.createObjectStore(b, f.key);
                                            } catch (ba) {
                                                return (k = ba), !0;
                                            }
                                        Object.keys(f.indexes || {}).some(function (b) {
                                            try {
                                                h.index(b);
                                            } catch (D) {
                                                var c = f.indexes[b];
                                                c = c && "object" === ("undefined" === typeof c ? "undefined" : g(c)) ? c : {};
                                                try {
                                                    h.createIndex(b, c.keyPath || c.key || b, c);
                                                } catch (G) {
                                                    return (k = G), !0;
                                                }
                                            }
                                        });
                                    });
                                    return k;
                                }
                            },
                            ea = function (b, c, d, e) {
                                b = b.target.result;
                                B[c][d] = b;
                                c = new J(b, c, d, e);
                                return c instanceof Error ? Promise.reject(c) : Promise.resolve(c);
                            },
                            Y = {
                                version: "0.15.0",
                                open: function (b) {
                                    var c = b.server,
                                        d = b.version || 1,
                                        e = b.schema,
                                        f = b.noServerMethods;
                                    B[c] || (B[c] = {});
                                    return new Promise(function (b, h) {
                                        if (B[c][d])
                                            ea(
                                                {
                                                    target: {
                                                        result: B[c][d],
                                                    },
                                                },
                                                c,
                                                d,
                                                f
                                            ).then(b, h);
                                        else {
                                            var k = (function () {
                                                if ("function" === typeof e)
                                                    try {
                                                        e = e();
                                                    } catch (Z) {
                                                        return (
                                                            h(Z),
                                                            {
                                                                v: void 0,
                                                            }
                                                        );
                                                    }
                                                var g = w.open(c, d);
                                                g.onsuccess = function (e) {
                                                    return ea(e, c, d, f).then(b, h);
                                                };
                                                g.onerror = function (b) {
                                                    b.preventDefault();
                                                    h(b);
                                                };
                                                g.onupgradeneeded = function (b) {
                                                    (b = X(b, g, e, b.target.result, c, d)) && h(b);
                                                };
                                                g.onblocked = function (b) {
                                                    var e = new Promise(function (b, e) {
                                                        g.onsuccess = function (g) {
                                                            ea(g, c, d, f).then(b, e);
                                                        };
                                                        g.onerror = function (b) {
                                                            return e(b);
                                                        };
                                                    });
                                                    b.resume = e;
                                                    h(b);
                                                };
                                            })();
                                            if ("object" === ("undefined" === typeof k ? "undefined" : g(k))) return k.v;
                                        }
                                    });
                                },
                                delete: function (b) {
                                    return new Promise(function (c, d) {
                                        var e = w.deleteDatabase(b);
                                        e.onsuccess = function (b) {
                                            return c(b);
                                        };
                                        e.onerror = function (b) {
                                            return d(b);
                                        };
                                        e.onblocked = function (b) {
                                            b =
                                                null === b.newVersion || "undefined" === typeof Proxy
                                                    ? b
                                                    : new Proxy(b, {
                                                          get: function (b, c) {
                                                              return "newVersion" === c ? null : b[c];
                                                          },
                                                      });
                                            var c = new Promise(function (c, d) {
                                                e.onsuccess = function (d) {
                                                    "newVersion" in d || (d.newVersion = b.newVersion);
                                                    "oldVersion" in d || (d.oldVersion = b.oldVersion);
                                                    c(d);
                                                };
                                                e.onerror = function (b) {
                                                    return d(b);
                                                };
                                            });
                                            b.resume = c;
                                            d(b);
                                        };
                                    });
                                },
                                cmp: function (b, c) {
                                    return new Promise(function (d, e) {
                                        try {
                                            d(w.cmp(b, c));
                                        } catch (K) {
                                            e(K);
                                        }
                                    });
                                },
                            };
                        "undefined" !== typeof c && "undefined" !== typeof c.exports ? (c.exports = Y) : (b.db = Y);
                    })(self);
                },
                {},
            ],
        },
        {},
        [1]
    )(1);
});
WG.Storage = $class({
    constructor: function (a, b) {
        var c = this;
        db
            ? db
                  .open({
                      server: "wg",
                      version: 2,
                      schema: {
                          requests: {
                              key: {
                                  keyPath: "query",
                              },
                              indexes: {
                                  q: {},
                                  timestamp: {},
                              },
                          },
                          wg: {
                              key: {
                                  keyPath: "key",
                              },
                          },
                          wg_hints: {
                              key: {
                                  keyPath: "key",
                              },
                          },
                      },
                  })
                  .catch(function (a) {
                      WG.log("db.js open failed...");
                      b && b();
                  })
                  .then(function (b) {
                      c.server = b;
                      a && a();
                  })
            : (WG.log("db.js: no db..."), b && b());
    },
    setApi: function (a, b, c, d) {
        this.server &&
            (d &&
                $.each(d, function (b, c) {
                    delete a[c];
                }),
            (d = JSON.stringify(a)),
            (b = {
                q: a.q,
                query: d,
                timestamp: new Date().getTime(),
                json: b,
            }),
            this.server.requests.update(b).then(function (a) {
                $.each(a, function () {
                    WG.log("STORE");
                    WG.log(this);
                });
                c && c(a);
            }));
    },
    getApi: function (a, b, c) {
        if (this.server)
            return (
                c &&
                    $.each(c, function (b, c) {
                        delete a[c];
                    }),
                (c = JSON.stringify(a)),
                (c = this.server.requests.get(c)),
                c.then(function (a) {
                    a ||
                        (a = {
                            json: void 0,
                        });
                    b(a.json);
                }),
                c
            );
    },
    cleanApi: function () {
        if (this.server) {
            var a = this.server,
                b = this,
                c = new Date().getTime();
            WG.log("CLEAN STORAGE");
            var d = c - 432000000;
            a.requests
                .query("timestamp")
                .bound(0, d)
                .execute()
                .then(function (a) {
                    b.removeApiRequests(a);
                });
            d = c - 1800000;
            a.requests
                .query("timestamp")
                .bound(0, d)
                .filter("q", "live_stations")
                .execute()
                .then(function (a) {
                    b.removeApiRequests(a);
                });
            a.requests
                .query("timestamp")
                .bound(0, d)
                .filter("q", "station_data_last")
                .execute()
                .then(function (a) {
                    b.removeApiRequests(a);
                });
            a.requests
                .query("timestamp")
                .bound(0, d)
                .filter("q", "live_update")
                .execute()
                .then(function (a) {
                    b.removeApiRequests(a);
                });
        }
    },
    removeApiRequests: function (a) {
        var b = this.server;
        $.each(a, function () {
            b.requests.remove(this.query).then(function (a) {
                WG.log("STORAGE: removed: " + a);
            });
        });
    },
    setWg: function (a, b, c) {
        if (this.server)
            return (
                (a = this.server.wg.update({
                    key: a,
                    val: b,
                })),
                a.then(function (a) {
                    c && c(a);
                }),
                a
            );
    },
    getWg: function (a, b) {
        if (this.server)
            return (
                (a = this.server.wg.get(a)),
                a.then(function (a) {
                    a ||
                        (a = {
                            val: void 0,
                        });
                    b && b(a.val);
                }),
                a
            );
    },
    delWg: function (a, b) {
        if (this.server)
            return (
                (a = this.server.wg.remove(a)),
                a.then(function (a) {
                    a ||
                        (a = {
                            val: void 0,
                        });
                    b && b(a.val);
                }),
                a
            );
    },
    runHint: function (a, b) {
        this.server &&
            this.server.wg_hints.get(a).then(function (a) {
                !(a || {}).key && b && b();
            });
    },
    doneHint: function (a, b) {
        if (this.server)
            return this.server.wg_hints.update({
                key: a,
                val: 1,
            });
    },
});
WG.TimeScroller = $class({
    constructor: function (a) {
        var b = {
            onScroll: !1,
            onScrollEnd: function (a) {
                WG.log(a.format());
            },
            $target: !1,
            from: moment(),
            to: moment(),
            step: 3600,
            step_width: 10,
            init: moment(),
            height: 40,
            tz: "UTC",
            infinite: !0,
            clickable: !0,
        };
        $.extend(this, b, a);
        var c = this;
        this.$target.addClass("timescroller").empty();
        this.$target.width(this.$target.width());
        b = this.$_wrap = $('<div class="scroll-wrap"></div>').appendTo(this.$target);
        b.append('<div class="currentline">');
        this.$currenttime = $('<div class="currenttime wg-guide-tidemap" data-guide-priority="2" data-guide-src="tidemap-currenttime.php"></div>');
        b.append(this.$currenttime);
        c.$_wrap.get(0);
        var d = (this.$_graph = $('<div class="scroll-content"></div>').appendTo(b));
        this._pauseScrollEvent = !1;
        this._value = a.init.clone();
        c.widthCheck();
        this.infinite &&
            ((a = (this._wrap_width / this.step_width) * this.step * 3),
            (this.from = this.init
                .clone()
                .add(-a / 2, "second")
                .startOf("day")),
            (this.to = this.init
                .clone()
                .add(a / 2, "second")
                .endOf("day")),
            WG.log("infinite", this.from.format(), this.to.format()));
        a = ((this.to.unix() - this.from.unix()) / this.step) * this.step_width + this._wrap_width;
        b.addClass("dragscroll").addClass("dragscroll-nobar").css("overflow-x", "scroll");
        d.width(a).height(this.height).css("background-color", "#FFFFFF !important");
        c.widthCheck();
        this.draw();
        this.init && this.set(this.init);
        b = WG.debounce(function () {
            c.resizeScroller();
        }, 100);
        $(window).on("resize", b);
        dragscroll.reset();
        c.clickable && c.clickEventsOn();
        c.scrollEventsOn();
    },
    resizeScroller: function () {
        this.scrollEventsOff();
        var a = this.get();
        WG.log("VALUE: ", a.format());
        var b = this.$_wrap.detach();
        this.$target.width("initial");
        this.$target.width(this.$target.width());
        this.widthCheck();
        this.$target.append(b);
        this.draw();
        this.set(a);
        this.scrollEventsOn();
    },
    redrawInfiniteScroller: function (a) {
        this.scrollEventsOff();
        WG.log("VALUE: ", a.format());
        var b = this.$_wrap.detach();
        this.$target.width("initial");
        this.$target.width(this.$target.width());
        var c = (this._wrap_width / this.step_width) * this.step * 3;
        this.from = a
            .clone()
            .add(-c / 2, "second")
            .startOf("day");
        this.to = a
            .clone()
            .add(c / 2, "second")
            .endOf("day");
        this.widthCheck();
        c = ((this.to.unix() - this.from.unix()) / this.step) * this.step_width + this._wrap_width;
        this.$_graph.width(c).height(this.height).css("background-color", "#FFFFFF !important");
        this.widthCheck();
        this.$target.append(b);
        this.draw();
        this.set(a);
        this.scrollEventsOn();
    },
    draw: function () {
        var a = this.$_graph;
        a.empty();
        a.svg();
        a = new WgSvg.Canvas(a);
        a.svg.rect(0, 0, this._content_width, this.height, 0, 0, {
            fill: "#FFFFFF",
            strokeWidth: 0,
        });
        a = new WgSvg.Graph(a, {
            px_position: [0, 0],
            px_dimensions: [this._content_width, this.height],
            px_padding: [0, this._wrap_width / 2, 0, this._wrap_width / 2],
        });
        var b = this.from,
            c = this.to,
            d = [0],
            e = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            f = [0, 3, 6, 9, 12, 15, 18, 21];
        20 <= this.step_width && (f = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
        a.setXRange(b.unix(), c.unix());
        var g = [],
            h = [],
            k = [],
            p = [],
            q = [],
            n = [],
            m = b.clone();
        for (m.tz(this.tzid); m.isSameOrBefore(c); ) {
            var t = m.hour();
            -1 < $.inArray(t, d) && (g[g.length] = m.unix());
            -1 < $.inArray(t, e) && (h[h.length] = m.unix());
            -1 < $.inArray(t, f) && ((q[q.length] = m.unix()), (n[n.length] = m.format("H") + "h"));
            12 == t && ((k[k.length] = m.unix()), (p[p.length] = WG.getLangText("weekday", m.format("d")) + " " + m.format("D.M.")));
            m.add(1, "hours");
        }
        for (d = b.clone().startOf("day"); d.isSameOrBefore(c); )
            (b = d.clone()),
                (d = d.clone().add(1, "day")),
                d.isAfter(c) && (d = c.clone()),
                (e = (b.clone().tz("UTC").startOf("day").unix() / 86400) % 2 ? "#f4f4f4" : "#ffffff"),
                a.gridRect(b.unix(), d.unix(), {
                    fill: e,
                    stroke: "none",
                    strokeWidth: 0,
                    opacity: 1,
                }),
                (d = b.add(1, "day"));
        a.gridLinesV(h, {
            strokeWidth: 0.5,
            opacity: 0.3,
            "stroke-dasharray": "2,2",
        });
        a.gridLinesV(g, {
            strokeWidth: 1,
            opacity: 0.4,
            "stroke-dasharray": "none",
        });
        a.setXVals(k);
        a.texts(
            p,
            {
                ypos: a.y.range[1],
                skip: 0,
                offset_v: -18,
                offset_h: 0,
            },
            {
                "font-size": "11px",
                "font-weight": "bold",
            }
        );
        a.setXVals(q);
        a.texts(
            n,
            {
                ypos: a.y.range[1],
                skip: 0,
                offset_v: -31,
                offset_h: 0,
            },
            {
                "font-size": "10px",
                opacity: 0.7,
            }
        );
    },
    setTz: function (a) {
        this.from.tz(a);
        this.to.tz(a);
        this.draw();
        this._update_currenttime(this.get().tz(a));
    },
    position: function () {
        var a = this.$_wrap.get(0);
        WG.log("position... ", a.scrollLeft, this._content_width, this._wrap_width);
        return a.scrollLeft / (this._content_width - this._wrap_width);
    },
    scrollEventsOn: function () {
        var a = this,
            b,
            c = this.$_wrap.get(0);
        a.$_wrap.off("scroll");
        a.$_wrap.on("scroll", function () {
            clearTimeout(b);
            if (!a._pauseScrollEvent) {
                a._update();
                if (a.infinite) {
                    var d = c.scrollLeft,
                        e = !1;
                    d < a._wrap_width / 2 + 50 && (WG.log("LEFT!"), (e = !0));
                    d > a._content_width - a._wrap_width - a._wrap_width / 2 - 50 && (WG.log("RIGHT!"), (e = !0));
                    e && a.redrawInfiniteScroller(a.get());
                }
                b = setTimeout(function () {
                    if (a.onScrollEnd) a.onScrollEnd(a._value.clone());
                }, 200);
                if (a.onScroll) a.onScroll(a._value.clone());
            }
        });
    },
    scrollEventsOff: function () {
        this.$_wrap.off("scroll");
    },
    clickEventsOn: function () {
        var a = this,
            b = this.$_wrap.get(0);
        a.$_wrap.on("click", function (c) {
            if (!a.$_wrap.hasClass("dragging")) {
                var d = a.$_wrap.offset();
                c = c.originalEvent.clientX - d.left - a._wrap_width / 2 + b.scrollLeft;
                c = (a.to.unix() - a.from.unix()) * (c / (a._content_width - a._wrap_width));
                d = a.from.clone();
                d.add(c, "seconds");
                WG.log("CLICKED!", d.format());
                a.set(d, !0);
                a.scrollEventsOn();
            }
        });
    },
    clickEventsOff: function () {
        this.$_wrap.off("click");
    },
    get: function () {
        return this._value.clone();
    },
    set: function (a, b) {
        var c = this.$_wrap.get(0),
            d = ((a.unix() - this.from.unix()) / (this.to.unix() - this.from.unix())) * (this._content_width - this._wrap_width);
        this._value = a.clone();
        this._update_currenttime(a);
        b
            ? c.scrollTo({
                  left: d,
                  behavior: "smooth",
              })
            : c.scrollTo(d, 0);
    },
    _update_currenttime: function (a) {
        var b = a.format("D. M. YYYY HH:mm"),
            c = this.from.tz();
        a = c ? " " + WG.timezoneStr(a, c) : "";
        this.$currenttime.empty().append(b + a);
    },
    _update: function () {
        var a = this.from.clone();
        a.add((this.to.unix() - this.from.unix()) * this.position(), "seconds");
        this._update_currenttime(a);
        this._value = a;
    },
    _refresh: function () {
        this.pauseScrollEvents(!0);
        this.widthCheck();
        this.set(this.get());
        this.pauseScrollEvents(!1);
    },
    debug: function () {
        WG.log("from,to,now", this.from.format(), this.to.format());
    },
    widthCheck: function () {
        this._wrap_width = this.$target.width();
        this._content_width = this.$_graph.width();
    },
    pauseScrollEvents: function (a) {
        this._pauseScrollEvent = a ? !0 : !1;
    },
});
(function (a, b) {
    "function" === typeof define && define.amd ? define(b) : "object" === typeof module && module.exports ? (module.exports = b()) : (a.TouchSideSwipe = b());
})(this, function () {
    return function (a) {
        function b() {
            !0 === J && k();
            t = window.innerWidth;
            K = 499 < t ? m.elSubmainWidth : t * m.elSubmainMaxWidth;
            T = K + m.sideHookWidth;
            Q.style.width = K + "px";
            z.style.transform = "translateX(" + -K + "px)";
            z.style.width = T + "px";
        }
        function c(a) {
            z.classList.add("tss--out");
            a.stopPropagation();
            document.body.style.overflow = "hidden";
            z.style.transitionDuration = "0s";
            N.style.transitionDuration = "0s";
            N.style.zIndex = 99997;
            X = z.getBoundingClientRect().left;
            ea = z.getBoundingClientRect().top;
            w = a.changedTouches[0].clientX;
            B = a.changedTouches[0].clientY;
            R = la = !1;
        }
        function d(a) {
            a.stopPropagation();
            if (!la) {
                W = a.changedTouches[0].clientX;
                ca = a.changedTouches[0].clientY;
                a = W - (w - X);
                var b = ca - (B - ea);
                if (!R && ((R = !0), Math.abs(a) < Math.abs(b))) {
                    la = !0;
                    return;
                }
                0 >= a && (w > K && (a += w - K), W <= K + w && 0 >= a && (z.style.transform = "translateX(" + a + "px)"), (a = W / K), 0 < a && 1 > a && (N.style.opacity = a >= m.opacityBackground ? m.opacityBackground : a));
            }
        }
        function e(a) {
            a.stopPropagation();
            a = a.changedTouches[0].clientX;
            document.body.style.overflow = "";
            la ||
                ((z.style.transitionDuration = m.moveSpeed + "s"),
                (N.style.transitionDuration = m.moveSpeed + "s"),
                !J && a > w ? (Math.abs(w - a) > m.shiftForStart ? h() : k()) : !J && a < w ? k() : J && a < w && a <= K && ((w > K && a < K - m.shiftForStart) || (w < K && Math.abs(w - a) > m.shiftForStart) ? k() : h()));
        }
        function f(a) {
            a.stopPropagation();
            !1 === J ? h() : k();
        }
        function g(a) {
            a.stopPropagation();
            var b = z.getBoundingClientRect().left;
            a.clientX > b + K && k();
        }
        function h() {
            N.style.opacity = m.opacityBackground;
            z.style.width = t + "px";
            z.style.transform = "translateX(0px)";
            z.classList.remove("tss--close");
            z.classList.add("tss--open");
            N.classList.remove("tss-bg--close");
            N.classList.add("tss-bg--open");
            N.style.zIndex = "99997";
            J = !0;
            m.onFirstOpen && (m.onFirstOpen(), (m.onFirstOpen = !1));
        }
        function k() {
            document.body.style.overflow = "";
            N.style.opacity = 0;
            z.style.width = T + "px";
            z.style.transform = "translateX(" + -K + "px)";
            z.classList.remove("tss--open");
            z.classList.add("tss--close");
            z.classList.remove("tss--out");
            N.classList.remove("tss-bg--open");
            N.classList.add("tss-bg--close");
            N.style.zIndex = "-999";
            J = !1;
        }
        function p(a) {
            t = window.innerWidth;
            t < m.windowMaxWidth && !r ? q() : t >= m.windowMaxWidth && r && void 0 != (z && N) && (z.parentNode.insertBefore(Y, z), z.remove(), N.remove(), (r = !1));
        }
        function q() {
            t < m.windowMaxWidth &&
                !r &&
                ((r = !0),
                (Y = document.getElementById(m.elInitID)),
                (z = document.createElement("div")),
                (Q = document.createElement("div")),
                (x = document.createElement("div")),
                (x.innerHTML = '<div class="tss-label_pic"><svg class="icon light"><use xlink:href="#ico_close"></use></svg></div>'),
                (N = document.createElement("div")),
                z.appendChild(Q),
                Q.appendChild(x),
                Y.parentNode.insertBefore(z, Y),
                Q.appendChild(Y),
                document.body.insertBefore(N, document.body.lastChild),
                (z.classList = "tss"),
                (Q.classList = "tss-wrap"),
                (x.classList = "tss-label"),
                (N.classList = "tss-bg"),
                (K = 499 < t ? m.elSubmainWidth : t * m.elSubmainMaxWidth),
                (Q.style.width = K + "px"),
                (T = K + m.sideHookWidth),
                (z.style.transitionDuration = m.moveSpeed + "s"),
                (N.style.transitionDuration = m.moveSpeed + "s"),
                k(),
                z.addEventListener("touchstart", c, !1),
                z.addEventListener("touchmove", d, !1),
                z.addEventListener("touchend", e, !1),
                z.addEventListener("click", g, !1),
                x.addEventListener("click", f, !1),
                window.addEventListener("resize", b, !1));
            window.addEventListener("resize", p, !1);
        }
        function n() {
            if (t > m.windowMaxWidth) {
                var a = "(touch-sideswipe) cant use when window inner width > " + m.windowMaxWidth + "px (your actual option windowMaxWidth). Please, add the condition here.";
                Z = function () {
                    console.log("tssOpen " + a);
                };
                ba = function () {
                    console.log("tssClose " + a);
                };
            } else (Z = h), (ba = k);
        }
        var m = {
                elInitID: a.elementID || "touchSideSwipe",
                elSubmainWidth: a.elementWidth || 400,
                elSubmainMaxWidth: a.elementMaxWidth || 0.8,
                sideHookWidth: a.sideHookWidth || 44,
                moveSpeed: a.moveSpeed || 0.2,
                opacityBackground: a.opacityBackground || 0.8,
                shiftForStart: a.shiftForStart || 50,
                windowMaxWidth: a.windowMaxWidth || 1024,
                onFirstOpen: a.onFirstOpen || !1,
            },
            t = window.innerWidth,
            w,
            B,
            W,
            ca,
            J,
            X,
            ea,
            Y,
            z,
            Q,
            x,
            N,
            K,
            T,
            la = !1,
            R = !1,
            r = !1;
        q();
        var Z, ba;
        n();
        window.addEventListener("resize", n, !1);
        return {
            tssOpen: Z,
            tssClose: ba,
            tssSet: function (a) {
                for (var c in a) m[c] = a[c];
                b();
            },
            tssPulse: function (a) {
                var b = document.documentElement;
                a = -K + a;
                b.style.setProperty("--tss-pulse-in-x", -K + "px");
                b.style.setProperty("--tss-pulse-out-x", a + "px");
                WG.log("tssPulse", a);
                z.style.width = t + "px";
                z.classList.add("tss--pulse");
            },
        };
    };
});
(function (a, b) {
    "object" === typeof exports && "undefined" !== typeof module ? (module.exports = b()) : "function" === typeof define && define.amd ? define(b) : ((a = a || self), (a.tidePredictor = b()));
})(this, function () {
    var a = Math.PI / 180,
        b = 180 / Math.PI,
        c = function (a, b, c, d, e) {
            return a + ("undefined" !== typeof b ? b : 0) / 60 + ("undefined" !== typeof c ? c : 0) / 3600 + ("undefined" !== typeof d ? d : 0) / 3600000 + ("undefined" !== typeof e ? e : 0) / 3600000000;
        },
        d = [c(23, 26, 21.448), -c(0, 0, 4680.93), -c(0, 0, 1.55), c(0, 0, 1999.25), -c(0, 0, 51.38), -c(0, 0, 249.67), -c(0, 0, 39.05), c(0, 0, 7.12), c(0, 0, 27.87), c(0, 0, 5.79), c(0, 0, 2.45)].map(function (a, b) {
            return a * Math.pow(0.01, b);
        }),
        e = [-77.06265000000002, 1.7190199999968172, 0.0004591, 4.8e-7],
        f = [280.46645, 36000.76983, 0.0003032],
        g = [5.145],
        h = [218.3164591, 481267.88134236, -0.0013268, 1 / 538841 - 1 / 65194000],
        k = [125.044555, -1934.1361849, 0.0020762, 1 / 467410, -1 / 60616000],
        p = [83.353243, 4069.0137111, -0.0103238, -1 / 80053, 1 / 18999000],
        q = function (a, b) {
            var c = [];
            a.forEach(function (a, d) {
                c.push(a * Math.pow(b, d));
            });
            return c.reduce(function (a, b) {
                return a + b;
            });
        },
        n = function (a, b) {
            var c = [];
            a.forEach(function (a, d) {
                c.push(a * d * Math.pow(b, d - 1));
            });
            return c.reduce(function (a, b) {
                return a + b;
            });
        },
        m = function (a) {
            var b = a.getFullYear(),
                c = a.getMonth() + 1;
            a = a.getDate() + a.getHours() / 24 + a.getMinutes() / 1440 + a.getSeconds() / 86400 + a.getMilliseconds() / 86400000000;
            2 >= c && (--b, (c += 12));
            var d = Math.floor(b / 100);
            return Math.floor(365.25 * (b + 4716)) + Math.floor(30.6001 * (c + 1)) + a + (2 - d + Math.floor(d / 4)) - 1524.5;
        },
        t = function (c, d, e) {
            c *= a;
            d *= a;
            e *= a;
            return b * Math.acos(Math.cos(d) * Math.cos(e) - Math.sin(d) * Math.sin(e) * Math.cos(c));
        },
        w = function (c, d, e) {
            c *= a;
            d *= a;
            e *= a;
            var f = (Math.cos(0.5 * (e - d)) / Math.cos(0.5 * (e + d))) * Math.tan(0.5 * c);
            d = (Math.sin(0.5 * (e - d)) / Math.sin(0.5 * (e + d))) * Math.tan(0.5 * c);
            f = Math.atan(f);
            d = Math.atan(d);
            return -(f - 0.5 * c + (d - 0.5 * c)) * b;
        },
        B = function (c, d, e) {
            c *= a;
            d *= a;
            e *= a;
            var f = (Math.cos(0.5 * (e - d)) / Math.cos(0.5 * (e + d))) * Math.tan(0.5 * c);
            d = (Math.sin(0.5 * (e - d)) / Math.sin(0.5 * (e + d))) * Math.tan(0.5 * c);
            f = Math.atan(f);
            d = Math.atan(d);
            return (f - 0.5 * c - (d - 0.5 * c)) * b;
        },
        W = function (c, d, e) {
            var f = a * t(c, d, e);
            c = a * B(c, d, e);
            return b * Math.atan((Math.sin(2 * f) * Math.sin(c)) / (Math.sin(2 * f) * Math.cos(c) + 0.3347));
        },
        ca = function (c, d, e) {
            var f = a * t(c, d, e);
            c = a * B(c, d, e);
            return 0.5 * b * Math.atan((Math.pow(Math.sin(f), 2) * Math.sin(2 * c)) / (Math.pow(Math.sin(f), 2) * Math.cos(2 * c) + 0.0727));
        },
        J = function (a) {
            var b = {},
                c = {
                    s: h,
                    h: f,
                    p: p,
                    N: k,
                    pp: e,
                    90: [90],
                    omega: d,
                    i: g,
                },
                C = 1 / 876600;
            Object.keys(c).forEach(function (d) {
                var e = ((q(c[d], (m(a) - 2451545) / 36525) % 360) + 360) % 360;
                b[d] = {
                    value: e,
                    speed: n(c[d], (m(a) - 2451545) / 36525) * C,
                };
            });
            var r = {
                I: t,
                xi: w,
                nu: B,
                nup: W,
                nupp: ca,
            };
            Object.keys(r).forEach(function (a) {
                var c = (((0, r[a])(b.N.value, b.i.value, b.omega.value) % 360) + 360) % 360;
                b[a] = {
                    value: c,
                    speed: null,
                };
            });
            var x = 360 * (m(a) - Math.floor(m(a)));
            b["T+h-s"] = {
                value: x + b.h.value - b.s.value,
                speed: 15 + b.h.speed - b.s.speed,
            };
            b.P = {
                value: b.p.value - (b.xi.value % 360),
                speed: null,
            };
            return b;
        },
        X = function (a, b) {
            return ((a % b) + b) % b;
        },
        ea = function (a, b) {
            a.time = new Date(a.time.getTime() - z);
            if ("undefined" === typeof b || !b) return a;
            a.high && b.height_offset && b.height_offset.high && (a.level *= b.height_offset.high);
            a.low && b.height_offset && b.height_offset.low && (a.level *= b.height_offset.low);
            a.high && b.time_offset && b.time_offset.high && (a.time = new Date(a.time.getTime() + 60000 * b.time_offset.high));
            a.low && b.time_offset && b.time_offset.low && (a.time = new Date(a.time.getTime() + 60000 * b.time_offset.low));
            return a;
        },
        Y = function (a, b) {
            return "undefined" !== typeof b && "undefined" !== typeof b[a]
                ? b[a]
                : {
                      high: "High",
                      low: "Low",
                  }[a];
        },
        z = 60000 * new Date().getTimezoneOffset(),
        Q = function (b) {
            var c = b.timeline,
                d = b.constituents,
                e = b.start,
                f = function (a, b, c, e, f) {
                    var g = [],
                        h = 0;
                    d.forEach(function (d) {
                        g.push(d.amplitude * e[d.name] * Math.cos(b[d.name] * a + (f[d.name] + c[d.name]) - d._phase));
                    });
                    g.forEach(function (a) {
                        h += a;
                    });
                    return h;
                },
                g = function () {
                    var b = J(e),
                        f = {},
                        g = {},
                        h = [],
                        k = [];
                    d.forEach(function (c) {
                        var d = c._model.value(b),
                            e = c._model.speed(b);
                        f[c.name] = a * d;
                        g[c.name] = a * e;
                    });
                    c.items.forEach(function (b) {
                        var c = {},
                            e = {},
                            f = J(b);
                        d.forEach(function (b) {
                            var d = X(b._model.u(f), 360);
                            c[b.name] = a * d;
                            e[b.name] = X(b._model.f(f), 360);
                        });
                        h.push(c);
                        k.push(e);
                    });
                    return {
                        baseValue: f,
                        baseSpeed: g,
                        u: h,
                        f: k,
                    };
                };
            return Object.freeze({
                getExtremesPrediction: function (a) {
                    a = "undefined" !== typeof a ? a : {};
                    var b = a.labels,
                        d = a.offsets,
                        e = [];
                    a = g();
                    var h = a.baseSpeed,
                        k = a.u,
                        m = a.f,
                        n = a.baseValue,
                        p = !1,
                        q = !1,
                        r = f(0, h, k[0], m[0], n);
                    c.items.forEach(function (a, g) {
                        a = f(c.hours[g], h, k[g], m[g], n);
                        a > r &&
                            q &&
                            e.push(
                                ea(
                                    {
                                        time: c.items[g - 1],
                                        level: r,
                                        high: !1,
                                        low: !0,
                                        label: Y("low", b),
                                    },
                                    d
                                )
                            );
                        a < r &&
                            p &&
                            e.push(
                                ea(
                                    {
                                        time: c.items[g - 1],
                                        level: r,
                                        high: !0,
                                        low: !1,
                                        label: Y("high", b),
                                    },
                                    d
                                )
                            );
                        a > r && ((p = !0), (q = !1));
                        a < r && ((p = !1), (q = !0));
                        r = a;
                    });
                    return e;
                },
                getTimelinePrediction: function () {
                    var a = [],
                        b = g(),
                        d = b.baseSpeed,
                        e = b.u,
                        h = b.f,
                        k = b.baseValue;
                    c.items.forEach(function (b, g) {
                        var m = c.hours[g];
                        g = {
                            time: b,
                            hour: m,
                            level: f(m, d, e[g], h[g], k),
                        };
                        g.time.setTime(b.getTime() - z);
                        a.push(g);
                    });
                    return a;
                },
                prepareConstants: function (b) {
                    var c = J(b),
                        e = {};
                    d.forEach(function (b) {
                        var d = b._model.value(c),
                            f = b._model.speed(c),
                            g = X(b._model.u(c), 360);
                        e[b.name] = {
                            baseValue: a * d,
                            baseSpeed: a * f,
                            u: a * g,
                            f: X(b._model.f(c), 360),
                        };
                    });
                    return e;
                },
            });
        },
        x = {
            fUnity: function () {
                return 1;
            },
            fMm: function (b) {
                return (2 / 3 - Math.pow(Math.sin(a * b.I.value), 2)) / ((2 / 3 - Math.pow(Math.sin(a * b.omega.value), 2)) * (1 - 1.5 * Math.pow(Math.sin(a * b.i.value), 2)));
            },
            fMf: function (b) {
                return Math.pow(Math.sin(a * b.I.value), 2) / (Math.pow(Math.sin(a * b.omega.value), 2) * Math.pow(Math.cos(0.5 * a * b.i.value), 4));
            },
            fO1: function (b) {
                var c = a * b.omega.value,
                    d = a * b.I.value;
                return (Math.sin(d) * Math.pow(Math.cos(0.5 * d), 2)) / (Math.sin(c) * Math.pow(Math.cos(0.5 * c), 2) * Math.pow(Math.cos(0.5 * a * b.i.value), 4));
            },
            fJ1: function (b) {
                return Math.sin(2 * a * b.I.value) / (Math.sin(2 * a * b.omega.value) * (1 - 1.5 * Math.pow(Math.sin(a * b.i.value), 2)));
            },
            fOO1: function (b) {
                var c = a * b.omega.value,
                    d = a * b.I.value;
                return (Math.sin(d) * Math.pow(Math.sin(0.5 * d), 2)) / (Math.sin(c) * Math.pow(Math.sin(0.5 * c), 2) * Math.pow(Math.cos(0.5 * a * b.i.value), 4));
            },
            fM2: function (b) {
                return Math.pow(Math.cos(0.5 * a * b.I.value), 4) / (Math.pow(Math.cos(0.5 * a * b.omega.value), 4) * Math.pow(Math.cos(0.5 * a * b.i.value), 4));
            },
            fK1: function (b) {
                var c = a * b.I.value;
                return (
                    Math.pow(0.2523 * Math.pow(Math.sin(2 * c), 2) + 0.1689 * Math.sin(2 * c) * Math.cos(a * b.nu.value) + 0.0283, 0.5) / (0.5023 * Math.sin(2 * a * b.omega.value) * (1 - 1.5 * Math.pow(Math.sin(a * b.i.value), 2)) + 0.1681)
                );
            },
            fL2: function (b) {
                var c = a * b.I.value;
                c = Math.pow(1 - 12 * Math.pow(Math.tan(0.5 * c), 2) * Math.cos(2 * a * b.P.value) + 36 * Math.pow(Math.tan(0.5 * c), 4), 0.5);
                return x.fM2(b) * c;
            },
            fK2: function (b) {
                var c = a * b.I.value;
                return (
                    Math.pow(0.2523 * Math.pow(Math.sin(c), 4) + 0.0367 * Math.pow(Math.sin(c), 2) * Math.cos(2 * a * b.nu.value) + 0.0013, 0.5) /
                    (0.5023 * Math.pow(Math.sin(a * b.omega.value), 2) * (1 - 1.5 * Math.pow(Math.sin(a * b.i.value), 2)) + 0.0365)
                );
            },
            fM1: function (b) {
                var c = a * b.I.value;
                c = Math.pow(0.25 + 1.5 * Math.cos(c) * Math.cos(2 * a * b.P.value) * Math.pow(Math.cos(0.5 * c), -0.5) + 2.25 * Math.pow(Math.cos(c), 2) * Math.pow(Math.cos(0.5 * c), -4), 0.5);
                return x.fO1(b) * c;
            },
            fModd: function (a, b) {
                return Math.pow(x.fM2(a), b / 2);
            },
            uZero: function (a) {
                return 0;
            },
            uMf: function (a) {
                return -2 * a.xi.value;
            },
            uO1: function (a) {
                return 2 * a.xi.value - a.nu.value;
            },
            uJ1: function (a) {
                return -a.nu.value;
            },
            uOO1: function (a) {
                return -2 * a.xi.value - a.nu.value;
            },
            uM2: function (a) {
                return 2 * a.xi.value - 2 * a.nu.value;
            },
            uK1: function (a) {
                return -a.nup.value;
            },
            uL2: function (c) {
                var d = a * c.P.value;
                return 2 * c.xi.value - 2 * c.nu.value - b * Math.atan(Math.sin(2 * d) / ((1 / 6) * Math.pow(Math.tan(0.5 * a * c.I.value), -2) - Math.cos(2 * d)));
            },
            uK2: function (a) {
                return -2 * a.nupp.value;
            },
            uM1: function (c) {
                var d = a * c.I.value;
                return c.xi.value - c.nu.value + b * Math.atan(((5 * Math.cos(d) - 1) / (7 * Math.cos(d) + 1)) * Math.tan(a * c.P.value));
            },
            uModd: function (a, b) {
                return (b / 2) * x.uM2(a);
            },
        },
        N = function (a, b) {
            var c = [];
            a.forEach(function (a, d) {
                c.push(a * b[d]);
            });
            return c.reduce(function (a, b) {
                return a + b;
            });
        },
        K = function (a) {
            return [a["T+h-s"], a.s, a.h, a.p, a.N, a.pp, a["90"]];
        },
        T = function (a) {
            var b = [];
            K(a).forEach(function (a) {
                b.push(a.speed);
            });
            return b;
        },
        la = function (a) {
            var b = [];
            K(a).forEach(function (a) {
                b.push(a.value);
            });
            return b;
        };
    c = function (a, b, c, d) {
        if (!b) throw Error("Coefficient must be defined for a constituent");
        return Object.freeze({
            name: a,
            coefficients: b,
            value: function (a) {
                return N(b, la(a));
            },
            speed: function (a) {
                return N(b, T(a));
            },
            u: "undefined" !== typeof c ? c : x.uZero,
            f: "undefined" !== typeof d ? d : x.fUnity,
        });
    };
    var R = function (a, b) {
            var c = [];
            b.forEach(function (a) {
                var b = a.factor;
                a.constituent.coefficients.forEach(function (a, d) {
                    "undefined" === typeof c[d] && (c[d] = 0);
                    c[d] += a * b;
                });
            });
            return Object.freeze({
                name: a,
                coefficients: c,
                speed: function (a) {
                    var c = 0;
                    b.forEach(function (b) {
                        var d = b.factor;
                        c += b.constituent.speed(a) * d;
                    });
                    return c;
                },
                value: function (a) {
                    var c = 0;
                    b.forEach(function (b) {
                        var d = b.factor;
                        c += b.constituent.value(a) * d;
                    });
                    return c;
                },
                u: function (a) {
                    var c = 0;
                    b.forEach(function (b) {
                        var d = b.factor;
                        c += b.constituent.u(a) * d;
                    });
                    return c;
                },
                f: function (a) {
                    var c = [];
                    b.forEach(function (b) {
                        var d = b.factor;
                        c.push(Math.pow(b.constituent.f(a), Math.abs(d)));
                    });
                    return c.reduce(function (a, b) {
                        return a * b;
                    });
                },
            });
        },
        r = {};
    r.Z0 = c("Z0", [0, 0, 0, 0, 0, 0, 0], x.uZero, x.fUnity);
    r.SA = c("Sa", [0, 0, 1, 0, 0, 0, 0], x.uZero, x.fUnity);
    r.SSA = c("Ssa", [0, 0, 2, 0, 0, 0, 0], x.uZero, x.fUnity);
    r.MM = c("MM", [0, 1, 0, -1, 0, 0, 0], x.uZero, x.fMm);
    r.MF = c("MF", [0, 2, 0, 0, 0, 0, 0], x.uMf, x.fMf);
    r.Q1 = c("Q1", [1, -2, 0, 1, 0, 0, 1], x.uO1, x.fO1);
    r.O1 = c("O1", [1, -1, 0, 0, 0, 0, 1], x.uO1, x.fO1);
    r.K1 = c("K1", [1, 1, 0, 0, 0, 0, -1], x.uK1, x.fK1);
    r.J1 = c("J1", [1, 2, 0, -1, 0, 0, -1], x.uJ1, x.fJ1);
    r.M1 = c("M1", [1, 0, 0, 0, 0, 0, 1], x.uM1, x.fM1);
    r.P1 = c("P1", [1, 1, -2, 0, 0, 0, 1], x.uZero, x.fUnity);
    r.S1 = c("S1", [1, 1, -1, 0, 0, 0, 0], x.uZero, x.fUnity);
    r.OO1 = c("OO1", [1, 3, 0, 0, 0, 0, -1], x.uOO1, x.fOO1);
    r["2N2"] = c("2N2", [2, -2, 0, 2, 0, 0, 0], x.uM2, x.fM2);
    r.N2 = c("N2", [2, -1, 0, 1, 0, 0, 0], x.uM2, x.fM2);
    r.NU2 = c("NU2", [2, -1, 2, -1, 0, 0, 0], x.uM2, x.fM2);
    r.M2 = c("M2", [2, 0, 0, 0, 0, 0, 0], x.uM2, x.fM2);
    r.LAM2 = c("LAM2", [2, 1, -2, 1, 0, 0, 2], x.uM2, x.fM2);
    r.L2 = c("L2", [2, 1, 0, -1, 0, 0, 2], x.uL2, x.fL2);
    r.T2 = c("T2", [2, 2, -3, 0, 0, 1, 0], x.uZero, x.fUnity);
    r.S2 = c("S2", [2, 2, -2, 0, 0, 0, 0], x.uZero, x.fUnity);
    r.R2 = c("R2", [2, 2, -1, 0, 0, -1, 2], x.uZero, x.fUnity);
    r.K2 = c("K2", [2, 2, 0, 0, 0, 0, 0], x.uK2, x.fK2);
    r.M3 = c(
        "M3",
        [3, 0, 0, 0, 0, 0, 0],
        function (a) {
            return x.uModd(a, 3);
        },
        function (a) {
            return x.fModd(a, 3);
        }
    );
    r.MSF = R("MSF", [
        {
            constituent: r.S2,
            factor: 1,
        },
        {
            constituent: r.M2,
            factor: -1,
        },
    ]);
    r["2Q1"] = R("2Q1", [
        {
            constituent: r.N2,
            factor: 1,
        },
        {
            constituent: r.J1,
            factor: -1,
        },
    ]);
    r.RHO = R("RHO", [
        {
            constituent: r.NU2,
            factor: 1,
        },
        {
            constituent: r.K1,
            factor: -1,
        },
    ]);
    r.MU2 = R("MU2", [
        {
            constituent: r.M2,
            factor: 2,
        },
        {
            constituent: r.S2,
            factor: -1,
        },
    ]);
    r["2SM2"] = R("2SM2", [
        {
            constituent: r.S2,
            factor: 2,
        },
        {
            constituent: r.M2,
            factor: -1,
        },
    ]);
    r["2MK3"] = R("2MK3", [
        {
            constituent: r.M2,
            factor: 1,
        },
        {
            constituent: r.O1,
            factor: 1,
        },
    ]);
    r.MK3 = R("MK3", [
        {
            constituent: r.M2,
            factor: 1,
        },
        {
            constituent: r.K1,
            factor: 1,
        },
    ]);
    r.MN4 = R("MN4", [
        {
            constituent: r.M2,
            factor: 1,
        },
        {
            constituent: r.N2,
            factor: 1,
        },
    ]);
    r.M4 = R("M4", [
        {
            constituent: r.M2,
            factor: 2,
        },
    ]);
    r.MS4 = R("MS4", [
        {
            constituent: r.M2,
            factor: 1,
        },
        {
            constituent: r.S2,
            factor: 1,
        },
    ]);
    r.S4 = R("S4", [
        {
            constituent: r.S2,
            factor: 2,
        },
    ]);
    r.M6 = R("M6", [
        {
            constituent: r.M2,
            factor: 3,
        },
    ]);
    r.S6 = R("S6", [
        {
            constituent: r.S2,
            factor: 3,
        },
    ]);
    r.M8 = R("M8", [
        {
            constituent: r.M2,
            factor: 4,
        },
    ]);
    var Z = function (a) {
            if (a instanceof Date) return new Date(a.getTime() + z);
            if ("number" === typeof a) return new Date(1000 * a);
            throw Error("Invalid date format, should be a Date object, or timestamp");
        },
        ba = function (b) {
            var c = b.harmonicConstituents,
                d = b.phaseKey;
            b = b.offset;
            if (!Array.isArray(c)) throw Error("Harmonic constituents are not an array");
            var e = [];
            c.forEach(function (b, c) {
                if ("undefined" === typeof b.name) throw Error("Harmonic constituents must have a name property");
                "undefined" !== typeof r[b.name] && ((b._model = r[b.name]), (b._phase = a * b[d]), e.push(b));
            });
            !1 !== b &&
                e.push({
                    name: "Z0",
                    _model: r.Z0,
                    _phase: 0,
                    amplitude: b,
                });
            var f = new Date(),
                g = new Date(),
                h = {
                    setTimeSpan: function (a, b) {
                        f = Z(a);
                        g = Z(b);
                        if (f.getTime() >= g.getTime()) throw Error("Start time must be before end time");
                        return h;
                    },
                    prediction: function (a) {
                        a =
                            "undefined" !== typeof a
                                ? a
                                : {
                                      timeFidelity: 600,
                                  };
                        var b = f;
                        a = a.timeFidelity;
                        a = "undefined" !== typeof a ? a : 600;
                        for (var c = [], d = g.getTime() / 1000, h = (b = b.getTime() / 1000), k = []; b <= d; ) c.push(new Date(1000 * b)), k.push((b - h) / 3600), (b += a);
                        return Q({
                            timeline: {
                                items: c,
                                hours: k,
                            },
                            constituents: e,
                            start: f,
                        });
                    },
                    getCalcConstants: function (a) {
                        return Q({
                            constituents: e,
                        }).prepareConstants(a);
                    },
                };
            return Object.freeze(h);
        };
    return function (a, b) {
        var c = {
            harmonicConstituents: a,
            phaseKey: "phase_GMT",
            offset: !1,
        };
        "undefined" !== typeof b &&
            Object.keys(c).forEach(function (a) {
                "undefined" !== typeof b[a] && (c[a] = b[a]);
            });
        return {
            getTimelinePrediction: function (a) {
                var b = a.start,
                    d = a.end;
                a = a.timeFidelity;
                return ba(c)
                    .setTimeSpan(b, d)
                    .prediction(
                        a
                            ? {
                                  timeFidelity: a,
                              }
                            : {}
                    )
                    .getTimelinePrediction();
            },
            getExtremesPrediction: function (a) {
                var b = a.start,
                    d = a.end,
                    e = a.labels,
                    f = a.offsets;
                a = a.timeFidelity;
                return ba(c)
                    .setTimeSpan(b, d)
                    .prediction({
                        timeFidelity: a,
                    })
                    .getExtremesPrediction(e, f);
            },
            getWaterLevelAtTime: function (a) {
                a = a.time;
                var b = new Date(a.getTime() + 600000);
                return ba(c).setTimeSpan(a, b).prediction().getTimelinePrediction()[0];
            },
            getCalcConstants: function (a) {
                return ba(c).getCalcConstants(Z(a));
            },
        };
    };
});
(function (a) {
    var b = function (b) {
        this._options = {
            checkOnLoad: !1,
            resetOnEnd: !1,
            loopCheckTime: 50,
            loopMaxNumber: 5,
            baitClass: "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links",
            baitStyle: "width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;",
            debug: !1,
        };
        this._var = {
            version: "3.2.1",
            bait: null,
            checking: !1,
            loop: null,
            loopNumber: 0,
            event: {
                detected: [],
                notDetected: [],
            },
        };
        void 0 !== b && this.setOption(b);
        var c = this;
        b = function () {
            setTimeout(function () {
                !0 === c._options.checkOnLoad &&
                    (!0 === c._options.debug && c._log("onload->eventCallback", "A check loading is launched"),
                    null === c._var.bait && c._creatBait(),
                    setTimeout(function () {
                        c.check();
                    }, 1));
            }, 1);
        };
        void 0 !== a.addEventListener ? a.addEventListener("load", b, !1) : a.attachEvent("onload", b);
    };
    b.prototype._options = null;
    b.prototype._var = null;
    b.prototype._bait = null;
    b.prototype._log = function (a, b) {
        console.log("[BlockAdBlock][" + a + "] " + b);
    };
    b.prototype.setOption = function (a, b) {
        if (void 0 !== b) {
            var c = a;
            a = {};
            a[c] = b;
        }
        for (var d in a) (this._options[d] = a[d]), !0 === this._options.debug && this._log("setOption", 'The option "' + d + '" he was assigned to "' + a[d] + '"');
        return this;
    };
    b.prototype._creatBait = function () {
        var b = document.createElement("div");
        b.setAttribute("class", this._options.baitClass);
        b.setAttribute("style", this._options.baitStyle);
        this._var.bait = a.document.body.appendChild(b);
        this._var.bait.offsetParent;
        this._var.bait.offsetHeight;
        this._var.bait.offsetLeft;
        this._var.bait.offsetTop;
        this._var.bait.offsetWidth;
        this._var.bait.clientHeight;
        this._var.bait.clientWidth;
        !0 === this._options.debug && this._log("_creatBait", "Bait has been created");
    };
    b.prototype._destroyBait = function () {
        a.document.body.removeChild(this._var.bait);
        this._var.bait = null;
        !0 === this._options.debug && this._log("_destroyBait", "Bait has been removed");
    };
    b.prototype.check = function (a) {
        void 0 === a && (a = !0);
        !0 === this._options.debug && this._log("check", "An audit was requested " + (!0 === a ? "with a" : "without") + " loop");
        if (!0 === this._var.checking) return !0 === this._options.debug && this._log("check", "A check was canceled because there is already an ongoing"), !1;
        this._var.checking = !0;
        null === this._var.bait && this._creatBait();
        var b = this;
        this._var.loopNumber = 0;
        !0 === a &&
            (this._var.loop = setInterval(function () {
                b._checkBait(a);
            }, this._options.loopCheckTime));
        setTimeout(function () {
            b._checkBait(a);
        }, 1);
        !0 === this._options.debug && this._log("check", "A check is in progress ...");
        return !0;
    };
    b.prototype._checkBait = function (b) {
        var c = !1;
        null === this._var.bait && this._creatBait();
        if (
            null !== a.document.body.getAttribute("abp") ||
            null === this._var.bait.offsetParent ||
            0 == this._var.bait.offsetHeight ||
            0 == this._var.bait.offsetLeft ||
            0 == this._var.bait.offsetTop ||
            0 == this._var.bait.offsetWidth ||
            0 == this._var.bait.clientHeight ||
            0 == this._var.bait.clientWidth
        )
            c = !0;
        if (void 0 !== a.getComputedStyle) {
            var e = a.getComputedStyle(this._var.bait, null);
            !e || ("none" != e.getPropertyValue("display") && "hidden" != e.getPropertyValue("visibility")) || (c = !0);
        }
        !0 === this._options.debug &&
            this._log(
                "_checkBait",
                "A check (" + (this._var.loopNumber + 1) + "/" + this._options.loopMaxNumber + " ~" + (1 + this._var.loopNumber * this._options.loopCheckTime) + "ms) was conducted and detection is " + (!0 === c ? "positive" : "negative")
            );
        !0 === b && (this._var.loopNumber++, this._var.loopNumber >= this._options.loopMaxNumber && this._stopLoop());
        if (!0 === c) this._stopLoop(), this._destroyBait(), this.emitEvent(!0), !0 === b && (this._var.checking = !1);
        else if (null === this._var.loop || !1 === b) this._destroyBait(), this.emitEvent(!1), !0 === b && (this._var.checking = !1);
    };
    b.prototype._stopLoop = function (a) {
        clearInterval(this._var.loop);
        this._var.loop = null;
        this._var.loopNumber = 0;
        !0 === this._options.debug && this._log("_stopLoop", "A loop has been stopped");
    };
    b.prototype.emitEvent = function (a) {
        !0 === this._options.debug && this._log("emitEvent", "An event with a " + (!0 === a ? "positive" : "negative") + " detection was called");
        a = this._var.event[!0 === a ? "detected" : "notDetected"];
        for (var b in a) if ((!0 === this._options.debug && this._log("emitEvent", "Call function " + (parseInt(b) + 1) + "/" + a.length), a.hasOwnProperty(b))) a[b]();
        !0 === this._options.resetOnEnd && this.clearEvent();
        return this;
    };
    b.prototype.clearEvent = function () {
        this._var.event.detected = [];
        this._var.event.notDetected = [];
        !0 === this._options.debug && this._log("clearEvent", "The event list has been cleared");
    };
    b.prototype.on = function (a, b) {
        this._var.event[!0 === a ? "detected" : "notDetected"].push(b);
        !0 === this._options.debug && this._log("on", 'A type of event "' + (!0 === a ? "detected" : "notDetected") + '" was added');
        return this;
    };
    b.prototype.onDetected = function (a) {
        return this.on(!0, a);
    };
    b.prototype.onNotDetected = function (a) {
        return this.on(!1, a);
    };
    a.BlockAdBlock = b;
    void 0 === a.blockAdBlock &&
        (a.blockAdBlock = new b({
            checkOnLoad: !0,
            resetOnEnd: !0,
        }));
})(window);
!(function (t, r) {
    "object" == typeof exports && "undefined" != typeof module ? r(exports) : "function" == typeof define && define.amd ? define(["exports"], r) : r(((t = t || self).ss = {}));
})(this, function (t) {
    "use strict";
    function r(t) {
        if (0 === t.length) return 0;
        for (var r, n = t[0], e = 0, a = 1; a < t.length; a++) (r = n + t[a]), Math.abs(n) >= Math.abs(t[a]) ? (e += n - r + t[a]) : (e += t[a] - r + n), (n = r);
        return n + e;
    }
    function n(t) {
        if (0 === t.length) throw new Error("mean requires at least one data point");
        return r(t) / t.length;
    }
    function e(t, r) {
        var e,
            a,
            o = n(t),
            i = 0;
        if (2 === r) for (a = 0; a < t.length; a++) i += (e = t[a] - o) * e;
        else for (a = 0; a < t.length; a++) i += Math.pow(t[a] - o, r);
        return i;
    }
    function a(t) {
        if (0 === t.length) throw new Error("variance requires at least one data point");
        return e(t, 2) / t.length;
    }
    function o(t) {
        if (1 === t.length) return 0;
        var r = a(t);
        return Math.sqrt(r);
    }
    function i(t) {
        if (0 === t.length) throw new Error("mode requires at least one data point");
        if (1 === t.length) return t[0];
        for (var r = t[0], n = NaN, e = 0, a = 1, o = 1; o < t.length + 1; o++) t[o] !== r ? (a > e && ((e = a), (n = r)), (a = 1), (r = t[o])) : a++;
        return n;
    }
    function u(t) {
        return t.slice().sort(function (t, r) {
            return t - r;
        });
    }
    function h(t) {
        if (0 === t.length) throw new Error("min requires at least one data point");
        for (var r = t[0], n = 1; n < t.length; n++) t[n] < r && (r = t[n]);
        return r;
    }
    function f(t) {
        if (0 === t.length) throw new Error("max requires at least one data point");
        for (var r = t[0], n = 1; n < t.length; n++) t[n] > r && (r = t[n]);
        return r;
    }
    function s(t, r) {
        var n = t.length * r;
        if (0 === t.length) throw new Error("quantile requires at least one data point.");
        if (r < 0 || r > 1) throw new Error("quantiles must be between 0 and 1");
        return 1 === r ? t[t.length - 1] : 0 === r ? t[0] : n % 1 != 0 ? t[Math.ceil(n) - 1] : t.length % 2 == 0 ? (t[n - 1] + t[n]) / 2 : t[n];
    }
    function l(t, r, n, e) {
        for (n = n || 0, e = e || t.length - 1; e > n; ) {
            if (e - n > 600) {
                var a = e - n + 1,
                    o = r - n + 1,
                    i = Math.log(a),
                    u = 0.5 * Math.exp((2 * i) / 3),
                    h = 0.5 * Math.sqrt((i * u * (a - u)) / a);
                o - a / 2 < 0 && (h *= -1), l(t, r, Math.max(n, Math.floor(r - (o * u) / a + h)), Math.min(e, Math.floor(r + ((a - o) * u) / a + h)));
            }
            var f = t[r],
                s = n,
                g = e;
            for (c(t, n, r), t[e] > f && c(t, n, e); s < g; ) {
                for (c(t, s, g), s++, g--; t[s] < f; ) s++;
                for (; t[g] > f; ) g--;
            }
            t[n] === f ? c(t, n, g) : c(t, ++g, e), g <= r && (n = g + 1), r <= g && (e = g - 1);
        }
    }
    function c(t, r, n) {
        var e = t[r];
        (t[r] = t[n]), (t[n] = e);
    }
    function g(t, r) {
        var n = t.slice();
        if (Array.isArray(r)) {
            !(function (t, r) {
                for (var n = [0], e = 0; e < r.length; e++) n.push(w(t.length, r[e]));
                n.push(t.length - 1), n.sort(p);
                var a = [0, n.length - 1];
                for (; a.length; ) {
                    var o = Math.ceil(a.pop()),
                        i = Math.floor(a.pop());
                    if (!(o - i <= 1)) {
                        var u = Math.floor((i + o) / 2);
                        v(t, n[u], Math.floor(n[i]), Math.ceil(n[o])), a.push(i, u, u, o);
                    }
                }
            })(n, r);
            for (var e = [], a = 0; a < r.length; a++) e[a] = s(n, r[a]);
            return e;
        }
        return v(n, w(n.length, r), 0, n.length - 1), s(n, r);
    }
    function v(t, r, n, e) {
        r % 1 == 0 ? l(t, r, n, e) : (l(t, (r = Math.floor(r)), n, e), l(t, r + 1, r + 1, e));
    }
    function p(t, r) {
        return t - r;
    }
    function w(t, r) {
        var n = t * r;
        return 1 === r ? t - 1 : 0 === r ? 0 : n % 1 != 0 ? Math.ceil(n) - 1 : t % 2 == 0 ? n - 0.5 : n;
    }
    function M(t, r) {
        if (r < t[0]) return 0;
        if (r > t[t.length - 1]) return 1;
        var n = (function (t, r) {
            var n = 0,
                e = 0,
                a = t.length;
            for (; e < a; ) r <= t[(n = (e + a) >>> 1)] ? (a = n) : (e = -~n);
            return e;
        })(t, r);
        if (t[n] !== r) return n / t.length;
        n++;
        var e = (function (t, r) {
            var n = 0,
                e = 0,
                a = t.length;
            for (; e < a; ) r >= t[(n = (e + a) >>> 1)] ? (e = -~n) : (a = n);
            return e;
        })(t, r);
        if (e === n) return n / t.length;
        var a = e - n + 1;
        return (a * (e + n)) / 2 / a / t.length;
    }
    function m(t) {
        var r = g(t, 0.75),
            n = g(t, 0.25);
        if ("number" == typeof r && "number" == typeof n) return r - n;
    }
    function d(t) {
        return +g(t, 0.5);
    }
    function b(t) {
        for (var r = d(t), n = [], e = 0; e < t.length; e++) n.push(Math.abs(t[e] - r));
        return d(n);
    }
    function q(t, r) {
        r = r || Math.random;
        for (var n, e, a = t.length; a > 0; ) (e = Math.floor(r() * a--)), (n = t[a]), (t[a] = t[e]), (t[e] = n);
        return t;
    }
    function E(t, r) {
        return q(t.slice().slice(), r);
    }
    function y(t) {
        for (var r, n = 0, e = 0; e < t.length; e++) (0 !== e && t[e] === r) || ((r = t[e]), n++);
        return n;
    }
    function S(t, r) {
        for (var n = [], e = 0; e < t; e++) {
            for (var a = [], o = 0; o < r; o++) a.push(0);
            n.push(a);
        }
        return n;
    }
    function x(t, r, n, e) {
        var a;
        if (t > 0) {
            var o = (n[r] - n[t - 1]) / (r - t + 1);
            a = e[r] - e[t - 1] - (r - t + 1) * o * o;
        } else a = e[r] - (n[r] * n[r]) / (r + 1);
        return a < 0 ? 0 : a;
    }
    function P(t, r, n, e, a, o, i) {
        if (!(t > r)) {
            var u = Math.floor((t + r) / 2);
            (e[n][u] = e[n - 1][u - 1]), (a[n][u] = u);
            var h = n;
            t > n && (h = Math.max(h, a[n][t - 1] || 0)), (h = Math.max(h, a[n - 1][u] || 0));
            var f,
                s,
                l,
                c = u - 1;
            r < e.length - 1 && (c = Math.min(c, a[n][r + 1] || 0));
            for (var g = c; g >= h && !((f = x(g, u, o, i)) + e[n - 1][h - 1] >= e[n][u]); --g)
                (s = x(h, u, o, i) + e[n - 1][h - 1]) < e[n][u] && ((e[n][u] = s), (a[n][u] = h)), h++, (l = f + e[n - 1][g - 1]) < e[n][u] && ((e[n][u] = l), (a[n][u] = g));
            P(t, u - 1, n, e, a, o, i), P(u + 1, r, n, e, a, o, i);
        }
    }
    function k(t, r) {
        if (t.length !== r.length) throw new Error("sampleCovariance requires samples with equal lengths");
        if (t.length < 2) throw new Error("sampleCovariance requires at least two data points in each sample");
        for (var e = n(t), a = n(r), o = 0, i = 0; i < t.length; i++) o += (t[i] - e) * (r[i] - a);
        return o / (t.length - 1);
    }
    function I(t) {
        if (t.length < 2) throw new Error("sampleVariance requires at least two data points");
        return e(t, 2) / (t.length - 1);
    }
    function D(t) {
        var r = I(t);
        return Math.sqrt(r);
    }
    function C(t, r, n, e) {
        return (t * r + n * e) / (r + e);
    }
    function T(t) {
        if (0 === t.length) throw new Error("rootMeanSquare requires at least one data point");
        for (var r = 0, n = 0; n < t.length; n++) r += Math.pow(t[n], 2);
        return Math.sqrt(r / t.length);
    }
    var N = function () {
        (this.totalCount = 0), (this.data = {});
    };
    (N.prototype.train = function (t, r) {
        for (var n in (this.data[r] || (this.data[r] = {}), t)) {
            var e = t[n];
            void 0 === this.data[r][n] && (this.data[r][n] = {}), void 0 === this.data[r][n][e] && (this.data[r][n][e] = 0), this.data[r][n][e]++;
        }
        this.totalCount++;
    }),
        (N.prototype.score = function (t) {
            var r,
                n = {};
            for (var e in t) {
                var a = t[e];
                for (r in this.data) (n[r] = {}), this.data[r][e] ? (n[r][e + "_" + a] = (this.data[r][e][a] || 0) / this.totalCount) : (n[r][e + "_" + a] = 0);
            }
            var o = {};
            for (r in n) for (var i in ((o[r] = 0), n[r])) o[r] += n[r][i];
            return o;
        });
    var _ = function () {
        (this.weights = []), (this.bias = 0);
    };
    (_.prototype.predict = function (t) {
        if (t.length !== this.weights.length) return null;
        for (var r = 0, n = 0; n < this.weights.length; n++) r += this.weights[n] * t[n];
        return (r += this.bias) > 0 ? 1 : 0;
    }),
        (_.prototype.train = function (t, r) {
            if (0 !== r && 1 !== r) return null;
            t.length !== this.weights.length && ((this.weights = t), (this.bias = 1));
            var n = this.predict(t);
            if ("number" == typeof n && n !== r) {
                for (var e = r - n, a = 0; a < this.weights.length; a++) this.weights[a] += e * t[a];
                this.bias += e;
            }
            return this;
        });
    var R = 0.0001;
    function F(t) {
        if (t < 0) throw new Error("factorial requires a non-negative value");
        if (Math.floor(t) !== t) throw new Error("factorial requires an integer input");
        for (var r = 1, n = 2; n <= t; n++) r *= n;
        return r;
    }
    var A = [
            0.9999999999999971,
            57.15623566586292,
            -59.59796035547549,
            14.136097974741746,
            -0.4919138160976202,
            0.00003399464998481189,
            0.00004652362892704858,
            -0.00009837447530487956,
            0.0001580887032249125,
            -0.00021026444172410488,
            0.00021743961811521265,
            -0.0001643181065367639,
            0.00008441822398385275,
            -0.000026190838401581408,
            0.0000036899182659531625,
        ],
        z = 607 / 128,
        V = Math.log(Math.sqrt(2 * Math.PI));
    var j = {
        1: {
            0.995: 0,
            0.99: 0,
            0.975: 0,
            0.95: 0,
            0.9: 0.02,
            0.5: 0.45,
            0.1: 2.71,
            0.05: 3.84,
            0.025: 5.02,
            0.01: 6.63,
            0.005: 7.88,
        },
        2: {
            0.995: 0.01,
            0.99: 0.02,
            0.975: 0.05,
            0.95: 0.1,
            0.9: 0.21,
            0.5: 1.39,
            0.1: 4.61,
            0.05: 5.99,
            0.025: 7.38,
            0.01: 9.21,
            0.005: 10.6,
        },
        3: {
            0.995: 0.07,
            0.99: 0.11,
            0.975: 0.22,
            0.95: 0.35,
            0.9: 0.58,
            0.5: 2.37,
            0.1: 6.25,
            0.05: 7.81,
            0.025: 9.35,
            0.01: 11.34,
            0.005: 12.84,
        },
        4: {
            0.995: 0.21,
            0.99: 0.3,
            0.975: 0.48,
            0.95: 0.71,
            0.9: 1.06,
            0.5: 3.36,
            0.1: 7.78,
            0.05: 9.49,
            0.025: 11.14,
            0.01: 13.28,
            0.005: 14.86,
        },
        5: {
            0.995: 0.41,
            0.99: 0.55,
            0.975: 0.83,
            0.95: 1.15,
            0.9: 1.61,
            0.5: 4.35,
            0.1: 9.24,
            0.05: 11.07,
            0.025: 12.83,
            0.01: 15.09,
            0.005: 16.75,
        },
        6: {
            0.995: 0.68,
            0.99: 0.87,
            0.975: 1.24,
            0.95: 1.64,
            0.9: 2.2,
            0.5: 5.35,
            0.1: 10.65,
            0.05: 12.59,
            0.025: 14.45,
            0.01: 16.81,
            0.005: 18.55,
        },
        7: {
            0.995: 0.99,
            0.99: 1.25,
            0.975: 1.69,
            0.95: 2.17,
            0.9: 2.83,
            0.5: 6.35,
            0.1: 12.02,
            0.05: 14.07,
            0.025: 16.01,
            0.01: 18.48,
            0.005: 20.28,
        },
        8: {
            0.995: 1.34,
            0.99: 1.65,
            0.975: 2.18,
            0.95: 2.73,
            0.9: 3.49,
            0.5: 7.34,
            0.1: 13.36,
            0.05: 15.51,
            0.025: 17.53,
            0.01: 20.09,
            0.005: 21.96,
        },
        9: {
            0.995: 1.73,
            0.99: 2.09,
            0.975: 2.7,
            0.95: 3.33,
            0.9: 4.17,
            0.5: 8.34,
            0.1: 14.68,
            0.05: 16.92,
            0.025: 19.02,
            0.01: 21.67,
            0.005: 23.59,
        },
        10: {
            0.995: 2.16,
            0.99: 2.56,
            0.975: 3.25,
            0.95: 3.94,
            0.9: 4.87,
            0.5: 9.34,
            0.1: 15.99,
            0.05: 18.31,
            0.025: 20.48,
            0.01: 23.21,
            0.005: 25.19,
        },
        11: {
            0.995: 2.6,
            0.99: 3.05,
            0.975: 3.82,
            0.95: 4.57,
            0.9: 5.58,
            0.5: 10.34,
            0.1: 17.28,
            0.05: 19.68,
            0.025: 21.92,
            0.01: 24.72,
            0.005: 26.76,
        },
        12: {
            0.995: 3.07,
            0.99: 3.57,
            0.975: 4.4,
            0.95: 5.23,
            0.9: 6.3,
            0.5: 11.34,
            0.1: 18.55,
            0.05: 21.03,
            0.025: 23.34,
            0.01: 26.22,
            0.005: 28.3,
        },
        13: {
            0.995: 3.57,
            0.99: 4.11,
            0.975: 5.01,
            0.95: 5.89,
            0.9: 7.04,
            0.5: 12.34,
            0.1: 19.81,
            0.05: 22.36,
            0.025: 24.74,
            0.01: 27.69,
            0.005: 29.82,
        },
        14: {
            0.995: 4.07,
            0.99: 4.66,
            0.975: 5.63,
            0.95: 6.57,
            0.9: 7.79,
            0.5: 13.34,
            0.1: 21.06,
            0.05: 23.68,
            0.025: 26.12,
            0.01: 29.14,
            0.005: 31.32,
        },
        15: {
            0.995: 4.6,
            0.99: 5.23,
            0.975: 6.27,
            0.95: 7.26,
            0.9: 8.55,
            0.5: 14.34,
            0.1: 22.31,
            0.05: 25,
            0.025: 27.49,
            0.01: 30.58,
            0.005: 32.8,
        },
        16: {
            0.995: 5.14,
            0.99: 5.81,
            0.975: 6.91,
            0.95: 7.96,
            0.9: 9.31,
            0.5: 15.34,
            0.1: 23.54,
            0.05: 26.3,
            0.025: 28.85,
            0.01: 32,
            0.005: 34.27,
        },
        17: {
            0.995: 5.7,
            0.99: 6.41,
            0.975: 7.56,
            0.95: 8.67,
            0.9: 10.09,
            0.5: 16.34,
            0.1: 24.77,
            0.05: 27.59,
            0.025: 30.19,
            0.01: 33.41,
            0.005: 35.72,
        },
        18: {
            0.995: 6.26,
            0.99: 7.01,
            0.975: 8.23,
            0.95: 9.39,
            0.9: 10.87,
            0.5: 17.34,
            0.1: 25.99,
            0.05: 28.87,
            0.025: 31.53,
            0.01: 34.81,
            0.005: 37.16,
        },
        19: {
            0.995: 6.84,
            0.99: 7.63,
            0.975: 8.91,
            0.95: 10.12,
            0.9: 11.65,
            0.5: 18.34,
            0.1: 27.2,
            0.05: 30.14,
            0.025: 32.85,
            0.01: 36.19,
            0.005: 38.58,
        },
        20: {
            0.995: 7.43,
            0.99: 8.26,
            0.975: 9.59,
            0.95: 10.85,
            0.9: 12.44,
            0.5: 19.34,
            0.1: 28.41,
            0.05: 31.41,
            0.025: 34.17,
            0.01: 37.57,
            0.005: 40,
        },
        21: {
            0.995: 8.03,
            0.99: 8.9,
            0.975: 10.28,
            0.95: 11.59,
            0.9: 13.24,
            0.5: 20.34,
            0.1: 29.62,
            0.05: 32.67,
            0.025: 35.48,
            0.01: 38.93,
            0.005: 41.4,
        },
        22: {
            0.995: 8.64,
            0.99: 9.54,
            0.975: 10.98,
            0.95: 12.34,
            0.9: 14.04,
            0.5: 21.34,
            0.1: 30.81,
            0.05: 33.92,
            0.025: 36.78,
            0.01: 40.29,
            0.005: 42.8,
        },
        23: {
            0.995: 9.26,
            0.99: 10.2,
            0.975: 11.69,
            0.95: 13.09,
            0.9: 14.85,
            0.5: 22.34,
            0.1: 32.01,
            0.05: 35.17,
            0.025: 38.08,
            0.01: 41.64,
            0.005: 44.18,
        },
        24: {
            0.995: 9.89,
            0.99: 10.86,
            0.975: 12.4,
            0.95: 13.85,
            0.9: 15.66,
            0.5: 23.34,
            0.1: 33.2,
            0.05: 36.42,
            0.025: 39.36,
            0.01: 42.98,
            0.005: 45.56,
        },
        25: {
            0.995: 10.52,
            0.99: 11.52,
            0.975: 13.12,
            0.95: 14.61,
            0.9: 16.47,
            0.5: 24.34,
            0.1: 34.28,
            0.05: 37.65,
            0.025: 40.65,
            0.01: 44.31,
            0.005: 46.93,
        },
        26: {
            0.995: 11.16,
            0.99: 12.2,
            0.975: 13.84,
            0.95: 15.38,
            0.9: 17.29,
            0.5: 25.34,
            0.1: 35.56,
            0.05: 38.89,
            0.025: 41.92,
            0.01: 45.64,
            0.005: 48.29,
        },
        27: {
            0.995: 11.81,
            0.99: 12.88,
            0.975: 14.57,
            0.95: 16.15,
            0.9: 18.11,
            0.5: 26.34,
            0.1: 36.74,
            0.05: 40.11,
            0.025: 43.19,
            0.01: 46.96,
            0.005: 49.65,
        },
        28: {
            0.995: 12.46,
            0.99: 13.57,
            0.975: 15.31,
            0.95: 16.93,
            0.9: 18.94,
            0.5: 27.34,
            0.1: 37.92,
            0.05: 41.34,
            0.025: 44.46,
            0.01: 48.28,
            0.005: 50.99,
        },
        29: {
            0.995: 13.12,
            0.99: 14.26,
            0.975: 16.05,
            0.95: 17.71,
            0.9: 19.77,
            0.5: 28.34,
            0.1: 39.09,
            0.05: 42.56,
            0.025: 45.72,
            0.01: 49.59,
            0.005: 52.34,
        },
        30: {
            0.995: 13.79,
            0.99: 14.95,
            0.975: 16.79,
            0.95: 18.49,
            0.9: 20.6,
            0.5: 29.34,
            0.1: 40.26,
            0.05: 43.77,
            0.025: 46.98,
            0.01: 50.89,
            0.005: 53.67,
        },
        40: {
            0.995: 20.71,
            0.99: 22.16,
            0.975: 24.43,
            0.95: 26.51,
            0.9: 29.05,
            0.5: 39.34,
            0.1: 51.81,
            0.05: 55.76,
            0.025: 59.34,
            0.01: 63.69,
            0.005: 66.77,
        },
        50: {
            0.995: 27.99,
            0.99: 29.71,
            0.975: 32.36,
            0.95: 34.76,
            0.9: 37.69,
            0.5: 49.33,
            0.1: 63.17,
            0.05: 67.5,
            0.025: 71.42,
            0.01: 76.15,
            0.005: 79.49,
        },
        60: {
            0.995: 35.53,
            0.99: 37.48,
            0.975: 40.48,
            0.95: 43.19,
            0.9: 46.46,
            0.5: 59.33,
            0.1: 74.4,
            0.05: 79.08,
            0.025: 83.3,
            0.01: 88.38,
            0.005: 91.95,
        },
        70: {
            0.995: 43.28,
            0.99: 45.44,
            0.975: 48.76,
            0.95: 51.74,
            0.9: 55.33,
            0.5: 69.33,
            0.1: 85.53,
            0.05: 90.53,
            0.025: 95.02,
            0.01: 100.42,
            0.005: 104.22,
        },
        80: {
            0.995: 51.17,
            0.99: 53.54,
            0.975: 57.15,
            0.95: 60.39,
            0.9: 64.28,
            0.5: 79.33,
            0.1: 96.58,
            0.05: 101.88,
            0.025: 106.63,
            0.01: 112.33,
            0.005: 116.32,
        },
        90: {
            0.995: 59.2,
            0.99: 61.75,
            0.975: 65.65,
            0.95: 69.13,
            0.9: 73.29,
            0.5: 89.33,
            0.1: 107.57,
            0.05: 113.14,
            0.025: 118.14,
            0.01: 124.12,
            0.005: 128.3,
        },
        100: {
            0.995: 67.33,
            0.99: 70.06,
            0.975: 74.22,
            0.95: 77.93,
            0.9: 82.36,
            0.5: 99.33,
            0.1: 118.5,
            0.05: 124.34,
            0.025: 129.56,
            0.01: 135.81,
            0.005: 140.17,
        },
    };
    var B = Math.sqrt(2 * Math.PI),
        K = {
            gaussian: function (t) {
                return Math.exp(-0.5 * t * t) / B;
            },
        },
        O = {
            nrd: function (t) {
                var r = D(t),
                    n = m(t);
                return "number" == typeof n && (r = Math.min(r, n / 1.34)), 1.06 * r * Math.pow(t.length, -0.2);
            },
        };
    function U(t, r, n) {
        var e, a;
        if (void 0 === r) e = K.gaussian;
        else if ("string" == typeof r) {
            if (!K[r]) throw new Error('Unknown kernel "' + r + '"');
            e = K[r];
        } else e = r;
        if (void 0 === n) a = O.nrd(t);
        else if ("string" == typeof n) {
            if (!O[n]) throw new Error('Unknown bandwidth method "' + n + '"');
            a = O[n](t);
        } else a = n;
        return function (r) {
            var n = 0,
                o = 0;
            for (n = 0; n < t.length; n++) o += e((r - t[n]) / a);
            return o / a / t.length;
        };
    }
    var G = Math.sqrt(2 * Math.PI);
    function H(t) {
        for (var r = t, n = t, e = 1; e < 15; e++) r += n *= (t * t) / (2 * e + 1);
        return Math.round(10000 * (0.5 + (r / G) * Math.exp((-t * t) / 2))) / 10000;
    }
    for (var L = [], W = 0; W <= 3.09; W += 0.01) L.push(H(W));
    function J(t) {
        var r = 1 / (1 + 0.5 * Math.abs(t)),
            n = r * Math.exp(-t * t + ((((((((0.17087277 * r - 0.82215223) * r + 1.48851587) * r - 1.13520398) * r + 0.27886807) * r - 0.18628806) * r + 0.09678418) * r + 0.37409196) * r + 1.00002368) * r - 1.26551223);
        return t >= 0 ? 1 - n : n - 1;
    }
    function Q(t) {
        var r = (8 * (Math.PI - 3)) / (3 * Math.PI * (4 - Math.PI)),
            n = Math.sqrt(Math.sqrt(Math.pow(2 / (Math.PI * r) + Math.log(1 - t * t) / 2, 2) - Math.log(1 - t * t) / r) - (2 / (Math.PI * r) + Math.log(1 - t * t) / 2));
        return t >= 0 ? n : -n;
    }
    function X(t) {
        if ("number" == typeof t) return t < 0 ? -1 : 0 === t ? 0 : 1;
        throw new TypeError("not a number");
    }
    (t.BayesianClassifier = N),
        (t.PerceptronModel = _),
        (t.addToMean = function (t, r, n) {
            return t + (n - t) / (r + 1);
        }),
        (t.average = n),
        (t.bayesian = N),
        (t.bernoulliDistribution = function (t) {
            if (t < 0 || t > 1) throw new Error("bernoulliDistribution requires probability to be between 0 and 1 inclusive");
            return [1 - t, t];
        }),
        (t.binomialDistribution = function (t, r) {
            if (!(r < 0 || r > 1 || t <= 0 || t % 1 != 0)) {
                var n = 0,
                    e = 0,
                    a = [],
                    o = 1;
                do {
                    (a[n] = o * Math.pow(r, n) * Math.pow(1 - r, t - n)), (e += a[n]), (o = (o * (t - ++n + 1)) / n);
                } while (e < 1 - R);
                return a;
            }
        }),
        (t.bisect = function (t, r, n, e, a) {
            if ("function" != typeof t) throw new TypeError("func must be a function");
            for (var o = 0; o < e; o++) {
                var i = (r + n) / 2;
                if (0 === t(i) || Math.abs((n - r) / 2) < a) return i;
                X(t(i)) === X(t(r)) ? (r = i) : (n = i);
            }
            throw new Error("maximum number of iterations exceeded");
        }),
        (t.chiSquaredDistributionTable = j),
        (t.chiSquaredGoodnessOfFit = function (t, r, e) {
            for (var a = 0, o = r(n(t)), i = [], u = [], h = 0; h < t.length; h++) void 0 === i[t[h]] && (i[t[h]] = 0), i[t[h]]++;
            for (var f = 0; f < i.length; f++) void 0 === i[f] && (i[f] = 0);
            for (var s in o) s in i && (u[+s] = o[s] * t.length);
            for (var l = u.length - 1; l >= 0; l--) u[l] < 3 && ((u[l - 1] += u[l]), u.pop(), (i[l - 1] += i[l]), i.pop());
            for (var c = 0; c < i.length; c++) a += Math.pow(i[c] - u[c], 2) / u[c];
            var g = i.length - 1 - 1;
            return j[g][e] < a;
        }),
        (t.chunk = function (t, r) {
            var n = [];
            if (r < 1) throw new Error("chunk size must be a positive number");
            if (Math.floor(r) !== r) throw new Error("chunk size must be an integer");
            for (var e = 0; e < t.length; e += r) n.push(t.slice(e, e + r));
            return n;
        }),
        (t.ckmeans = function (t, r) {
            if (r > t.length) throw new Error("cannot generate more classes than there are data values");
            var n = u(t);
            if (1 === y(n)) return [n];
            var e = S(r, n.length),
                a = S(r, n.length);
            !(function (t, r, n) {
                for (var e = r[0].length, a = t[Math.floor(e / 2)], o = [], i = [], u = 0, h = void 0; u < e; ++u)
                    (h = t[u] - a), 0 === u ? (o.push(h), i.push(h * h)) : (o.push(o[u - 1] + h), i.push(i[u - 1] + h * h)), (r[0][u] = x(0, u, o, i)), (n[0][u] = 0);
                for (var f = 1; f < r.length; ++f) P(f < r.length - 1 ? f : e - 1, e - 1, f, r, n, o, i);
            })(n, e, a);
            for (var o = [], i = a[0].length - 1, h = a.length - 1; h >= 0; h--) {
                var f = a[h][i];
                (o[h] = n.slice(f, i + 1)), h > 0 && (i = f - 1);
            }
            return o;
        }),
        (t.combinations = function t(r, n) {
            var e,
                a,
                o,
                i,
                u = [];
            for (e = 0; e < r.length; e++)
                if (1 === n) u.push([r[e]]);
                else for (o = t(r.slice(e + 1, r.length), n - 1), a = 0; a < o.length; a++) (i = o[a]).unshift(r[e]), u.push(i);
            return u;
        }),
        (t.combinationsReplacement = function t(r, n) {
            for (var e = [], a = 0; a < r.length; a++)
                if (1 === n) e.push([r[a]]);
                else for (var o = t(r.slice(a, r.length), n - 1), i = 0; i < o.length; i++) e.push([r[a]].concat(o[i]));
            return e;
        }),
        (t.combineMeans = C),
        (t.combineVariances = function (t, r, n, e, a, o) {
            var i = C(r, n, a, o);
            return (n * (t + Math.pow(r - i, 2)) + o * (e + Math.pow(a - i, 2))) / (n + o);
        }),
        (t.cumulativeStdNormalProbability = function (t) {
            var r = Math.abs(t),
                n = Math.min(Math.round(100 * r), L.length - 1);
            return t >= 0 ? L[n] : +(1 - L[n]).toFixed(4);
        }),
        (t.epsilon = R),
        (t.equalIntervalBreaks = function (t, r) {
            if (t.length < 2) return t;
            for (var n = h(t), e = f(t), a = [n], o = (e - n) / r, i = 1; i < r; i++) a.push(a[0] + o * i);
            return a.push(e), a;
        }),
        (t.erf = J),
        (t.errorFunction = J),
        (t.extent = function (t) {
            if (0 === t.length) throw new Error("extent requires at least one data point");
            for (var r = t[0], n = t[0], e = 1; e < t.length; e++) t[e] > n && (n = t[e]), t[e] < r && (r = t[e]);
            return [r, n];
        }),
        (t.extentSorted = function (t) {
            return [t[0], t[t.length - 1]];
        }),
        (t.factorial = F),
        (t.gamma = function t(r) {
            if (Number.isInteger(r)) return r <= 0 ? NaN : F(r - 1);
            if (--r < 0) return Math.PI / (Math.sin(Math.PI * -r) * t(-r));
            var n = r + 0.25;
            return (
                Math.pow(r / Math.E, r) *
                Math.sqrt(2 * Math.PI * (r + 1 / 6)) *
                (1 + 1 / 144 / Math.pow(n, 2) - 1 / 12960 / Math.pow(n, 3) - 257 / 207360 / Math.pow(n, 4) - 52 / 2612736 / Math.pow(n, 5) + 5741173 / 9405849600 / Math.pow(n, 6) + 37529 / 18811699200 / Math.pow(n, 7))
            );
        }),
        (t.gammaln = function (t) {
            if (t <= 0) return 1 / 0;
            t--;
            for (var r = A[0], n = 1; n < 15; n++) r += A[n] / (t + n);
            var e = z + 0.5 + t;
            return V + Math.log(r) - e + (t + 0.5) * Math.log(e);
        }),
        (t.geometricMean = function (t) {
            if (0 === t.length) throw new Error("geometricMean requires at least one data point");
            for (var r = 1, n = 0; n < t.length; n++) {
                if (t[n] <= 0) throw new Error("geometricMean requires only positive numbers as input");
                r *= t[n];
            }
            return Math.pow(r, 1 / t.length);
        }),
        (t.harmonicMean = function (t) {
            if (0 === t.length) throw new Error("harmonicMean requires at least one data point");
            for (var r = 0, n = 0; n < t.length; n++) {
                if (t[n] <= 0) throw new Error("harmonicMean requires only positive numbers as input");
                r += 1 / t[n];
            }
            return t.length / r;
        }),
        (t.interquartileRange = m),
        (t.inverseErrorFunction = Q),
        (t.iqr = m),
        (t.kde = U),
        (t.kernelDensityEstimation = U),
        (t.linearRegression = function (t) {
            var r,
                n,
                e = t.length;
            if (1 === e) (r = 0), (n = t[0][1]);
            else {
                for (var a, o, i, u = 0, h = 0, f = 0, s = 0, l = 0; l < e; l++) (u += o = (a = t[l])[0]), (h += i = a[1]), (f += o * o), (s += o * i);
                n = h / e - ((r = (e * s - u * h) / (e * f - u * u)) * u) / e;
            }
            return {
                m: r,
                b: n,
            };
        }),
        (t.linearRegressionLine = function (t) {
            return function (r) {
                return t.b + t.m * r;
            };
        }),
        (t.mad = b),
        (t.max = f),
        (t.maxSorted = function (t) {
            return t[t.length - 1];
        }),
        (t.mean = n),
        (t.median = d),
        (t.medianAbsoluteDeviation = b),
        (t.medianSorted = function (t) {
            return s(t, 0.5);
        }),
        (t.min = h),
        (t.minSorted = function (t) {
            return t[0];
        }),
        (t.mode = function (t) {
            return i(u(t));
        }),
        (t.modeFast = function (t) {
            for (var r, n = new Map(), e = 0, a = 0; a < t.length; a++) {
                var o = n.get(t[a]);
                void 0 === o ? (o = 1) : o++, o > e && ((r = t[a]), (e = o)), n.set(t[a], o);
            }
            if (0 === e) throw new Error("mode requires at last one data point");
            return r;
        }),
        (t.modeSorted = i),
        (t.numericSort = u),
        (t.perceptron = _),
        (t.permutationTest = function (t, r, e, a) {
            if ((void 0 === a && (a = 10000), void 0 === e && (e = "two_side"), "two_side" !== e && "greater" !== e && "less" !== e)) throw new Error("`alternative` must be either 'two_side', 'greater', or 'less'");
            for (var o = n(t) - n(r), i = new Array(a), u = t.concat(r), h = Math.floor(u.length / 2), f = 0; f < a; f++) {
                q(u);
                var s = u.slice(0, h),
                    l = u.slice(h, u.length),
                    c = n(s) - n(l);
                i[f] = c;
            }
            var g = 0;
            if ("two_side" === e) for (var v = 0; v <= a; v++) Math.abs(i[v]) >= Math.abs(o) && (g += 1);
            else if ("greater" === e) for (var p = 0; p <= a; p++) i[p] >= o && (g += 1);
            else for (var w = 0; w <= a; w++) i[w] <= o && (g += 1);
            return g / a;
        }),
        (t.permutationsHeap = function (t) {
            for (var r = new Array(t.length), n = [t.slice()], e = 0; e < t.length; e++) r[e] = 0;
            for (var a = 0; a < t.length; )
                if (r[a] < a) {
                    var o = 0;
                    a % 2 != 0 && (o = r[a]);
                    var i = t[o];
                    (t[o] = t[a]), (t[a] = i), n.push(t.slice()), r[a]++, (a = 0);
                } else (r[a] = 0), a++;
            return n;
        }),
        (t.poissonDistribution = function (t) {
            if (!(t <= 0)) {
                var r = 0,
                    n = 0,
                    e = [],
                    a = 1;
                do {
                    (e[r] = (Math.exp(-t) * Math.pow(t, r)) / a), (n += e[r]), (a *= ++r);
                } while (n < 1 - R);
                return e;
            }
        }),
        (t.probit = function (t) {
            return 0 === t ? (t = R) : t >= 1 && (t = 1 - R), Math.sqrt(2) * Q(2 * t - 1);
        }),
        (t.product = function (t) {
            for (var r = 1, n = 0; n < t.length; n++) r *= t[n];
            return r;
        }),
        (t.quantile = g),
        (t.quantileRank = function (t, r) {
            return M(u(t), r);
        }),
        (t.quantileRankSorted = M),
        (t.quantileSorted = s),
        (t.quickselect = l),
        (t.rSquared = function (t, r) {
            if (t.length < 2) return 1;
            for (var n = 0, e = 0; e < t.length; e++) n += t[e][1];
            for (var a = n / t.length, o = 0, i = 0; i < t.length; i++) o += Math.pow(a - t[i][1], 2);
            for (var u = 0, h = 0; h < t.length; h++) u += Math.pow(t[h][1] - r(t[h][0]), 2);
            return 1 - u / o;
        }),
        (t.rms = T),
        (t.rootMeanSquare = T),
        (t.sample = function (t, r, n) {
            return E(t, n).slice(0, r);
        }),
        (t.sampleCorrelation = function (t, r) {
            return k(t, r) / D(t) / D(r);
        }),
        (t.sampleCovariance = k),
        (t.sampleKurtosis = function (t) {
            var r = t.length;
            if (r < 4) throw new Error("sampleKurtosis requires at least four data points");
            for (var e, a = n(t), o = 0, i = 0, u = 0; u < r; u++) (o += (e = t[u] - a) * e), (i += e * e * e * e);
            return ((r - 1) / ((r - 2) * (r - 3))) * ((r * (r + 1) * i) / (o * o) - 3 * (r - 1));
        }),
        (t.sampleSkewness = function (t) {
            if (t.length < 3) throw new Error("sampleSkewness requires at least three data points");
            for (var r, e = n(t), a = 0, o = 0, i = 0; i < t.length; i++) (a += (r = t[i] - e) * r), (o += r * r * r);
            var u = t.length - 1,
                h = Math.sqrt(a / u),
                f = t.length;
            return (f * o) / ((f - 1) * (f - 2) * Math.pow(h, 3));
        }),
        (t.sampleStandardDeviation = D),
        (t.sampleVariance = I),
        (t.sampleWithReplacement = function (t, r, n) {
            if (0 === t.length) return [];
            n = n || Math.random;
            for (var e = t.length, a = [], o = 0; o < r; o++) {
                var i = Math.floor(n() * e);
                a.push(t[i]);
            }
            return a;
        }),
        (t.shuffle = E),
        (t.shuffleInPlace = q),
        (t.sign = X),
        (t.standardDeviation = o),
        (t.standardNormalTable = L),
        (t.subtractFromMean = function (t, r, n) {
            return (t * r - n) / (r - 1);
        }),
        (t.sum = r),
        (t.sumNthPowerDeviations = e),
        (t.sumSimple = function (t) {
            for (var r = 0, n = 0; n < t.length; n++) r += t[n];
            return r;
        }),
        (t.tTest = function (t, r) {
            return (n(t) - r) / (o(t) / Math.sqrt(t.length));
        }),
        (t.tTestTwoSample = function (t, r, e) {
            var a = t.length,
                o = r.length;
            if (!a || !o) return null;
            e || (e = 0);
            var i = n(t),
                u = n(r),
                h = I(t),
                f = I(r);
            if ("number" == typeof i && "number" == typeof u && "number" == typeof h && "number" == typeof f) {
                var s = ((a - 1) * h + (o - 1) * f) / (a + o - 2);
                return (i - u - e) / Math.sqrt(s * (1 / a + 1 / o));
            }
        }),
        (t.uniqueCountSorted = y),
        (t.variance = a),
        (t.zScore = function (t, r, n) {
            return (t - r) / n;
        }),
        Object.defineProperty(t, "__esModule", {
            value: !0,
        });
});
//# sourceMappingURL=simple-statistics.min.js.map
