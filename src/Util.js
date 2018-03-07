(function ($, utilNamespace) {
  'use strict';

  /**
   * Contains url to a folder of drawer files.
   *
   * @type {null|string}
   * @private
   */
  var _drawerFolderUrl = null;

  utilNamespace.setDrawerFolderUrl = function (url) {
    _drawerFolderUrl = url.replace(/\/*$/g, '') + '/';
  };

  /**
   * This function finds an url from which drawer file was loaded
   *
   * @function
   * @memberof DrawerJs.util
   * @returns {*}
   */
  utilNamespace.getDrawerFolderUrl = function () {
    if (_drawerFolderUrl) {
      return _drawerFolderUrl;
    }

    // try to find a folder from which this script is included
    var scripts = document.getElementsByTagName("script");
    var drawerJsFilenamePattern = /dist\/(drawer.+\.js)+$/;

    for (var i = 0; i < scripts.length; i++) {
      var s = scripts.item(i);

      if (s.src) {
        var match = s.src.match(drawerJsFilenamePattern);
        if (match) {
          var pathToDrawerFolder = s.src.replace(match[1], '');
          return pathToDrawerFolder;
        }
      }
    }

    return '';
  };

  /**
   * Removes all click events with specified namespace bound to element.
   *
   * @param {jQuery} element
   * @param {String} namespace
   */
  utilNamespace.unbindClick = function (element, namespace) {
    var ns = namespace + 'drawerBindClick';

    $(element).off('click.' + ns);
    $(element).off('touchstart.' + ns);
    $(element).off('touchend.' + ns);
  };

  utilNamespace.bindClick = function (element, namespace, handler) {
    var ns = namespace + 'drawerBindClick';

    $(element).on('click.' + ns, function (event) {
      var elem = this;
      var result = null;

      if (elem.__lastClickTime) {
        var lastClickDiff = Date.now() - elem.__lastClickTime;
        if (lastClickDiff > 500) {
          try {
            result = handler.apply(elem, [event]);
          } catch(err){
              var errorName = 'Catched error - ' + 'click.' + ns;
              console.groupCollapsed(errorName);
              console.log('%c[' + 'Event name' + ']', 'color: green', 'click.' + ns);
              console.log('%c[' + 'Element' + ']', 'color: green', element);
              console.error(err);
              console.groupEnd(errorName);
          }

          if (result === false) {
            event.stopPropagation();
            event.preventDefault();
            return false;
          }
        } else {
          // seems that we have already triggered this click on touchend event
        }
      } else {
        try {
          result = handler.apply(elem, [event]);
        } catch (err) {
          var errorName = 'Catched error - ' + 'click.' + ns;
          console.groupCollapsed(errorName);
          console.log('%c[' + 'Event name' + ']', 'color: green', 'click.' + ns);
          console.log('%c[' + 'Element' + ']', 'color: green', element);
          console.error(err);
          console.groupEnd(errorName);
        }

        if (result === false) {
          event.stopPropagation();
          event.preventDefault();
          return false;
        }
      }
    });
    $(element).on('touchstart.' + ns, function (event) {
      var elem = this;

      elem.__drawerTouchStartEvent = event;

      // disable click entirely since we do everything with touch events
      $(element).off('click.' + ns);
    });
    $(element).on('touchend.' + ns, function (event) {
      var elem = this,
          result;

      if (elem.__drawerTouchStartEvent) {
        var tsDiff = Math.abs(
          elem.__drawerTouchStartEvent.timeStamp - event.timeStamp
        );

        if (tsDiff < 300) {
          elem.__lastClickTime = Date.now();
          try {
            result = handler.apply(elem, [event]);
          } catch (err) {
            var errorName = 'Catched error - ' + 'touchend.' + ns;
            console.groupCollapsed(errorName);
            console.log('%c[' + 'Event name' + ']', 'color: green', 'touchend.' + ns);
            console.log('%c[' + 'Element' + ']', 'color: green', elem);
            console.error(err);
            console.groupEnd(errorName);
          }
          if (result === false) {
            event.stopPropagation();
            event.preventDefault();
            return false;
          }
        }
        delete elem.__drawerTouchStartEvent;
      }
    });
  };

  utilNamespace.bindDoubleTap = function (element, namespace,
                                          handler) {
    var timeWindow = 500;
    var positionWindow = 20;

    $(element).on('touchend.' + namespace, function (event) {
      var eventElem = this,
          eventPos;
      if (eventElem.__touchEndTime) {
        var diff = Date.now() - eventElem.__touchEndTime;
        eventPos = utilNamespace.getEventPosition(event);
        var xDiff = Math.abs(eventElem.__touchEndX - eventPos.left);
        var yDiff = Math.abs(eventElem.__touchEndY - eventPos.top);
        var result;

        if (diff < timeWindow &&
          xDiff < positionWindow &&
          yDiff < positionWindow) {

          delete eventElem.__touchEndTime;
          delete eventElem.__touchEndX;
          delete eventElem.__touchEndY;
          try {
            result = handler.apply(eventElem, [event]);
          } catch (err) {
            var errorName = 'Catched error - ' + 'touchend(doubleTap).' + namespace;
            console.groupCollapsed(errorName);
            console.log('%c[' + 'Event name' + ']', 'color: green', 'touchend(doubleTap).' + namespace);
            console.log('%c[' + 'Element' + ']', 'color: green', eventElem);
            console.error(err);
            console.groupEnd(errorName);
          }
          if (result === false) {
            event.stopPropagation();
            event.preventDefault();
            return false;
          }
        } else {
          delete eventElem.__touchEndTime;
          delete eventElem.__touchEndX;
          delete eventElem.__touchEndY;
        }
      } else {
        eventElem.__touchEndTime = Date.now();
        eventPos = utilNamespace.getEventPosition(event);
        eventElem.__touchEndX = eventPos.left;
        eventElem.__touchEndY = eventPos.top;
        utilNamespace.setTimeout(function () {
          delete eventElem.__touchEndTime;
          delete eventElem.__touchEndX;
          delete eventElem.__touchEndY;
        }, timeWindow);
      }
    });
  };

  utilNamespace.bindLongPress = function (element, namespace,
                                          handler) {
    var logTag = 'drawerBindLongPress';
    var ns = namespace + logTag;

    $(element).on('touchstart.' + ns, function (event) {
      var elem = this;

      elem.__touchStartTime = Date.now();
      var eventPos = utilNamespace.getEventPosition(event);
      elem.__touchStartX = eventPos.left;
      elem.__touchStartY = eventPos.top;

      if (elem.__longPressCheckTimeout) {
        clearTimeout(elem.__longPressCheckTimeout);
      }

      var cleanHandlers = function () {

        delete elem.__touchStartTime;
        delete elem.__touchStartX;
        delete elem.__touchStartY;

        $(elem).off('touchmove.' + ns);
        $(elem).off('touchend.' + ns);
      };

      $(elem).on('touchmove.' + ns, function (moveEvent) {
        var eventPos = utilNamespace.getEventPosition(moveEvent);
        if (elem.__touchStartTime) {
          var xDiff = Math.abs(
            elem.__touchStartX - eventPos.left
          );
          var yDiff = Math.abs(
            elem.__touchStartY - eventPos.top
          );

          if (xDiff > 10 || yDiff > 10) {
            cleanHandlers();
          }
        }
      });

      $(elem).on('touchend.' + ns, function (endEvent) {
        cleanHandlers();
      });

      elem.__longPressCheckTimeout = setTimeout(function () {
        if (elem.__touchStartTime) {
          cleanHandlers();
          try {
            var result = handler.apply(elem, [event]);
          } catch (err) {
            var errorName = 'Catched error - ' + 'touchstart(bindLongPress).' + ns;
            console.groupCollapsed(errorName);
            console.log('%c[' + 'Event name' + ']', 'color: green', 'touchstart(bindLongPress).' + ns);
            console.log('%c[' + 'Element' + ']', 'color: green', elem);
            console.error(err);
            console.groupEnd(errorName);
          }
        }
      }, 1000);

      return true;
    });
  };

  utilNamespace.unbindLongPress = function (element, namespace) {
    var logTag = 'drawerBindLongPress';
    var ns = namespace + logTag;

    $(element).off('touchstart.' + ns);
    $(element).off('touchmove.' + ns);
    $(element).off('touchend.' + ns);
  };

  utilNamespace.mouseDown = function (namespace) {
    return 'mousedown.' + namespace + this.id +
      ' touchstart.' + namespace + this.id;
  };

  utilNamespace.mouseMove = function (namespace) {
    return 'mousemove.' + namespace + this.id +
      ' touchmove.' + namespace + this.id;
  };

  utilNamespace.mouseUp = function (namespace) {
    return 'mouseup.' + namespace + this.id +
      ' touchend.' + namespace + this.id;
  };

  utilNamespace.getTransitionDuration = function (el, with_delay) {
    var style = window.getComputedStyle(el),
      duration = style.webkitTransitionDuration,
      delay = style.webkitTransitionDelay;

    // fix miliseconds vs seconds
    duration = (duration.indexOf("ms") > -1) ?
      parseFloat(duration) : parseFloat(duration) * 1000;
    delay = (delay.indexOf("ms") > -1) ?
      parseFloat(delay) : parseFloat(delay) * 1000;

    if (with_delay) return (duration + delay);

    else return duration;
  };

  utilNamespace.getEventPosition = function (event, touchIndex) {
    var result = {};
    var searchTouchEvent = function (innerEvent, fromInner) {
      var touchEvent;
      if (innerEvent) {
        var isTouch = innerEvent.type.indexOf('touch') > -1,
            haveTouches = isTouch && innerEvent.touches && innerEvent.touches.length,
            eventCoordsAreValid = utilNamespace.eventCoordsAreValid(innerEvent),
            getFromTouch = isTouch && haveTouches && !eventCoordsAreValid;

        touchEvent = getFromTouch ? innerEvent : (!fromInner && searchTouchEvent(innerEvent.originalEvent, true));
      }
      return touchEvent;
    };
    if (event) {
      touchIndex = touchIndex || 0;
      var touchEvent =  searchTouchEvent(event),
          touchCoordsAreValid = touchEvent && utilNamespace.eventCoordsAreValid(touchEvent.touches[touchIndex]),
          eventCoordsAreValid = utilNamespace.eventCoordsAreValid(event),
          originalEventCoordsAreValid = event && event.originalEvent && utilNamespace.eventCoordsAreValid(event.originalEvent);

      var coordsHolder = (touchCoordsAreValid && touchEvent.touches[touchIndex]) || (eventCoordsAreValid && event) || (originalEventCoordsAreValid && event.originalEvent);
      if (coordsHolder) {
        result = {
          left: coordsHolder.pageX,
          top: coordsHolder.pageY
        };
      }
    }
    return result;
  };

  utilNamespace.eventCoordsAreValid = function (event) {
    var isValid;
    if (event) {
      var areNotZero = event.pageX !== 0 && event.pageY !== 0,
          areNumbers = typeof event.pageX === 'number' && typeof event.pageY === 'number',
          areNotNan = areNumbers && isFinite(event.pageX) && isFinite(event.pageY);
      isValid = areNotZero && areNumbers && areNotNan;
    }
    return isValid;
  };

  utilNamespace.isShape = function (fabricObject) {
    var isShape = false;

    if (fabricObject.type &&
      (fabricObject.type == 'line' ||
      fabricObject.type == 'arrow')) {
      isShape = false;
    }
    else if (fabricObject.path) { // free drawing shape
      isShape = false;
    } else {
      isShape = true;
    }

    return isShape;
  };


  utilNamespace.__temporaryCanvas = null;
  utilNamespace.__latestValidCanvasWidth = null;
  utilNamespace.__latestValidCanvasHeight = null;
  utilNamespace.getTemporaryCanvas = function (originalCanvas) {
    if (!utilNamespace.__temporaryCanvas) {
      utilNamespace.__temporaryCanvas = document.createElement('canvas');
    }

    var canvasWidth = originalCanvas.width,
        canvasHeight = originalCanvas.height,
        resultCanvasWidth = canvasWidth || utilNamespace.__latestValidCanvasWidth || 1,
        resultCanvasHeight = canvasHeight || utilNamespace.__latestValidCanvasHeight || 1;

    utilNamespace.__temporaryCanvas.setAttribute('width', resultCanvasWidth);
    utilNamespace.__temporaryCanvas.setAttribute('height', resultCanvasHeight);

    utilNamespace.__latestValidCanvasWidth = resultCanvasWidth;
    utilNamespace.__latestValidCanvasHeight = resultCanvasHeight;

    return utilNamespace.__temporaryCanvas;
  };

  utilNamespace.LastCoordsQueue = function () {
    this.coordsQueue = [];
    this.length = 10;

    this.pushCoords = function (x, y) {
      if (this.coordsQueue.length > this.length) {
        this.coordsQueue =
          this.coordsQueue.slice(this.coordsQueue.length - this.length);
      }

      this.coordsQueue.push({x: x, y: y});
    };

    this.getInterpolatedValues = function () {
      if (this.coordsQueue.length === 0) {
        return [];
      }

      if (this.coordsQueue.length === 1) {
        return [{x: this.coordsQueue[0].x, y: this.coordsQueue[0].y}];
      }

      var interpolatedCoords = [];

      var prevX = this.coordsQueue[this.coordsQueue.length - 2].x;
      var prevY = this.coordsQueue[this.coordsQueue.length - 2].y;

      var currX = this.coordsQueue[this.coordsQueue.length - 1].x;
      var currY = this.coordsQueue[this.coordsQueue.length - 1].y;

      var xDiff = currX - prevX;
      var yDiff = currY - prevY;

      var xDiffAbs = Math.abs(xDiff);
      var yDiffAbs = Math.abs(yDiff);

      var iterations = xDiffAbs > yDiffAbs ? xDiffAbs : yDiffAbs;

      for (var ii = 0; ii < iterations; ii++) {
        interpolatedCoords.push({
          x: prevX + ((xDiff / iterations) * ii),
          y: prevY + ((yDiff / iterations) * ii)
        });
      }

      return interpolatedCoords;
    };
  };

  /**
   * Add css rule to sheet
   * @param {Node} sheet - sheet element
   * @param {String} selector - selector for css rule
   * @param {String} rules - text of css rules
   * @param {Number} [index] - index of rule
   */
  utilNamespace.addCSSRule = function addCSSRule(sheet, selector, rules, index) {
    if (sheet) {
      if ("insertRule" in sheet) {
        sheet.insertRule(selector + "{" + rules + "}", index);
      } else {
        if ("addRule" in sheet) {
          sheet.addRule(selector, rules, index);
        }
      }
    }
  };

  /**
   * Add css rule to style sheet
   * @param {String} styleSelector - selector for css rule
   * @param {String} styleRule - text of css rules
   * @param {jQuery|String|Node} styleSheet - stylesheet element
   * @param {Boolean} [createElement] - create stylesheet element if cant find matched
   * @param {Boolean} [force] - need to insert css rules even if there no stylesheet element
   */
  utilNamespace.addStyleToStyleSheet = function (styleSelector, styleRule, styleSheet, createElement, force) {
    var isJqueryEl = styleSheet && styleSheet instanceof jQuery && styleSheet.length,
        isSelector = typeof styleSheet === 'string' && $(styleSheet).length && $(styleSheet),
        isNode = styleSheet instanceof Node && $(styleSheet).length && $(styleSheet),
        $styleSheet = isJqueryEl || isSelector || isNode;
    if ($styleSheet) {
      utilNamespace.addCSSRule($styleSheet[0].sheet, styleSelector, styleRule);
    } else {
      if (createElement) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        style.id = styleSheet;
        head.appendChild(style);
        utilNamespace.addCSSRule(style.sheet, styleSelector, styleRule);
      } else {
        if (force) {
          var css = styleSelector + '{' + styleRule + '}';
          utilNamespace.addStyle(css);
        }
      }
    }
  };

  utilNamespace.addStyle = function (css) {
    var head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
  };


  utilNamespace.isString = function (str) {
      return typeof(str) == 'string' || str instanceof String;
  };

  utilNamespace.getScrollTopFromElement = function ($element) {
    var $currElement = $element,
        result = {
          left: 0,
          top: 0
        },
        needToContinue = true;
    while (needToContinue) {
      needToContinue = $currElement && $currElement.length && !$currElement.is('body');
      var currScrollTop = $currElement.scrollTop(), currScrollLeft = $currElement.scrollLeft();
      result.top += currScrollTop;
      result.left += currScrollLeft;
      $currElement = $currElement.parent();
    }
    return result;
  };


  /**
   * Debounce function
   * @param {Function} func
   * @param {Number} [wait]
   * @param {Boolean} [immediate]
   * @returns {Function}
   */
  utilNamespace.debounce = function (func, wait, immediate) {
    wait = wait || 0;
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = utilNamespace.setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  /**
   *
   * @param src
   * @param {Node} [imageEl]
   * @param {Object} [data]
   * @returns {Promise}
   */
  utilNamespace.loadImage = function (src, imageEl, data, ignoreCrossOrigin) {
    data = data || {};
    var img = imageEl || new Image();
    img.style.opacity = 0;

    return new Promise(function (resolve) {
      if (img.src === src) {
        // If image source hasn't changed resolve immediately
        resolve(img, data);
      } else {
        img.removeAttribute('crossOrigin');
        if (!ignoreCrossOrigin && src.match(/^https?:\/\/|^\/\//)) {
          img.setAttribute('crossOrigin', 'anonymous');
        }
        img.onload = function () {
          utilNamespace.setTimeout(function () {
            resolve(img, data);
          }, 1);
        };
        img.src = src;
      }
    });
  };

  utilNamespace.checkBrowser = function (browser) {
    var ua = navigator.userAgent.toLowerCase();
    var match = /(opr)[\/]([\w.]+)/.exec( ua ) ||
        /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [];

    if (browser == 'safari') return (typeof match[3] != 'undefined') ? match[3] == 'safari' : false;
    if (browser == 'version') return match[2];
    if (browser == 'webkit') return (match[1] == 'chrome' || match[1] == 'opr' || match[1] == 'webkit');
    if (match[1] == 'rv') return browser == 'msie';
    if (match[1] == 'opr') return browser == 'webkit';

    return browser == match[1];
  };

  /**
   *
   * @param {jQuery} $element
   */
  utilNamespace.getScrollOffset = function ($element) {
    var result = {},
        needContinue = true,
        currElement = $element,
        offsetX = 0,
        offsetY = 0;
    if ($element && $element.length) {
      while (needContinue) {
        currElement = currElement.parent();
        needContinue = currElement && currElement.length && !currElement.is('body');
        offsetX += currElement.scrollLeft();
        offsetY += currElement.scrollTop();
      }
    }
    result.left = offsetX;
    result.top = offsetY;
    return result;
  };


  /**
   * Custom setTimeout function with advanced error handling
   @param {String|Function} func
   @param {number} [delay]
   @param {...*} [arguments]
   @return {number}
   */
  utilNamespace.setTimeout = function (func, delay, args) {
    var funcWrapper,
        timer,
        tempError = new Error('Parent stack'),
        stack = tempError.stack;
    funcWrapper = function advancedSetTimeout() {
      try {
        func.apply(window, arguments);
      } catch (err) {
        var errorName = 'Catched error - ' + 'setTimeout';
        console.groupCollapsed(errorName);
        console.log('%c[' + 'Parent stack' + ']', 'color: green', stack);
        console.log('%c[' + 'Error stack' + ']', 'color: green', err.stack);
        console.error(err);
        console.groupEnd(errorName);
      }
    };
    timer = window.setTimeout(funcWrapper, delay, args);
    return timer;
  };

  /**
   * Mousewheel handler across browser from developer.mozilla.org
   */
  (function () {
    var prefix = "",
        _addEventListener,
        support,
        addWheelListener;

    // detect event model
    if (window.addEventListener) {
      _addEventListener = "addEventListener";
    } else {
      _addEventListener = "attachEvent";
      prefix = "on";
    }

    // detect available wheel event
    var support_modern = "onwheel" in document.createElement("div") && "wheel", // Modern browsers support "wheel"
        support_WebkitIe = document.onmousewheel !== undefined && "mousewheel",// Webkit and IE support at least "mousewheel"
        support_remaining = "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    support = support_modern || support_WebkitIe || support_remaining;

    var eventHandlerForOldBrowsers = function (originalEvent) {
          originalEvent = originalEvent || window.event;

          // create a normalized event object
          var event = {
            // keep a ref to the original event object
            originalEvent: originalEvent,
            target: originalEvent.target || originalEvent.srcElement,
            type: "wheel",
            deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
            deltaX: 0,
            deltaY: 0,
            deltaZ: 0,
            preventDefault: function () {
              if (originalEvent.preventDefault) {
                originalEvent.preventDefault();
              } else {
                originalEvent.returnValue = false;
              }
            }
          };

          // calculate deltaY (and deltaX) according to the event
          if (support == "mousewheel") {
            event.deltaY = -1 / 40 * originalEvent.wheelDelta;
            // Webkit also support wheelDeltaX
            if (originalEvent.wheelDeltaX) {
              event.deltaX = -1 / 40 * originalEvent.wheelDeltaX;
            }
          } else {
            event.deltaY = originalEvent.deltaY || originalEvent.detail;
          }

          // it's time to fire the callback
          return callback(event);

        },
        _addWheelListener = function (elem, eventName, callback, useCapture) {
          var eventNameFull = prefix + eventName,
              eventHandler;

          eventHandler = support == "wheel" ? callback : eventHandlerForOldBrowsers;

          elem[_addEventListener](eventNameFull, eventHandler, useCapture || false);
        };

    /**
     *
     * @param elem
     * @param {Function} callback
     * @param {Boolean} useCapture
     */
    utilNamespace.addWheelListener = function (elem, callback, useCapture) {
      _addWheelListener(elem, support, callback, useCapture);

      // handle MozMousePixelScroll in older Firefox
      if (support == "DOMMouseScroll") {
        _addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
      }
    };

    utilNamespace.requestAnimationFrame = window.requestAnimationFrame.bind(window) ||
        window.mozRequestAnimationFrame.bind(window) ||
        window.webkitRequestAnimationFrame.bind(window)  ||
        window.msRequestAnimationFrame.bind(window)  ||
        function (f) {
          f();
        };

    utilNamespace.cancelAnimationFrame = window.cancelAnimationFrame.bind(window) ||
        window.mozCancelAnimationFrame.bind(window) ||
        function () {};
  }());

}(jQuery, DrawerJs.util));