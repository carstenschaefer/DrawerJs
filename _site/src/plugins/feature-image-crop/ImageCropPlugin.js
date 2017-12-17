(function ($, pluginsNamespace, util) {
  "use strict";

  var MOUSE_DOWN = util.mouseDown('drawerJsCrop');
  var MOUSE_UP = util.mouseUp('drawerJsCrop');
  var MOUSE_MOVE = util.mouseMove('drawerJsCrop');

  var emptyFunc = function () {},
      cssPrefixes = ['Webkit', 'Moz', 'ms'],
      emptyStyles = document.createElement('div').style,
      CSS_TRANS_ORG,
      CSS_TRANSFORM,
      CSS_USERSELECT;

  function vendorPrefix(prop) {
    if (prop in emptyStyles) {
      return prop;
    }

    var capProp = prop[0].toUpperCase() + prop.slice(1),
        i = cssPrefixes.length;

    while (i--) {
      prop = cssPrefixes[i] + capProp;
      if (prop in emptyStyles) {
        return prop;
      }
    }
  }

  CSS_TRANSFORM = vendorPrefix('transform');
  CSS_TRANS_ORG = vendorPrefix('transformOrigin');
  CSS_USERSELECT = vendorPrefix('userSelect');

  /**
   * Provides a button to minimize canvas.
   *
   * @param {DrawerJs.Drawer} drawer
   * @param {jQuery} $element
   * @param {object} [options]
   * options
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var ImageCropPlugin = function ImageCropPluginConstructor(drawer, $element, options) {
    /**
     * @type {Drawer}
     */
    this.name = 'ImageCropPlugin';
    this.drawer = drawer;
    this.$element = $element;

    this._resetData();
    this.options = $.extend(true, {}, this._defaultOptions, options || {});

    this._init();
    return this;
  };

  ImageCropPlugin.prototype._defaultOptions = {
    boundary: { },
    enableExif: false,
    minSize: 10,
    enableOrientation: false,
    update: emptyFunc,
    controlsCss: {},
    controlsTouchCss: {}
  };

  ImageCropPlugin.prototype.globals = {
    translate: 'translate3d'
  };

  /**
   *
   * @param {String|Object} bindOptions
   * @param {Function} [callback]
   * @returns {Promise}
   * @private
   */
  ImageCropPlugin.prototype._bind = function (bindOptions, callback) {
    var url,
        callbackIsValid = callback && typeof callback === 'function';

    if (typeof bindOptions === 'string') {
      this.data = {
        url: bindOptions
      };
    } else {
      this.data = $.extend(true, {}, bindOptions || {});
    }

    this._resetData();

    this.successCallback = callbackIsValid ? callback : this.successCallback || emptyFunc;

    if (this.data && this.data.newImage) {
      this.originalImage = this.data.url;
      this.prevImages = [];
    }
    this.currentImage = this.data.url;

    this.elements.$fullsizePreview.attr('src', this.data.url);
    var loadImagePromise = util.loadImage(this.data.url, this.elements.$img.get(0), this.data).then(this.startCropping.bind(this));
    return loadImagePromise;
  };

  /** Draw data and get canvas
   * @param {Object} data
   * @returns {HTMLElement}
   * @private
   */
  ImageCropPlugin.prototype._getCanvas = function(data) {
    var points = data.points,
        left = parseInt(points[0],10),
        top = parseInt(points[1],10),
        right = parseInt(points[2],10),
        bottom = parseInt(points[3],10),
        width = right-left,
        height = bottom-top,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        outWidth = width,
        outHeight = height,
        startX = 0,
        startY = 0,
        canvasWidth = outWidth,
        canvasHeight = outHeight,
        customDimensions = (data.outputWidth && data.outputHeight),
        outputRatio = 1;

    if (!outputRatio && customDimensions) {
      canvasWidth = data.outputWidth;
      canvasHeight = data.outputHeight;
      outputRatio = canvasWidth / outWidth;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (data.backgroundColor) {
      ctx.fillStyle = data.backgroundColor;
      ctx.fillRect(0, 0, outWidth, outHeight);
    }

    if (left < 0) {
      startX = Math.abs(left);
      left = 0;
    }
    if (top < 0) {
      startY = Math.abs(top);
      top = 0;
    }
    if (right > this.originalWidth) {
      width = this.originalWidth - left;
      outWidth = width;
    }
    if (bottom > this.originalHeight) {
      height = this.originalHeight - top;
      outHeight = height;
    }

    if (outputRatio !== 1) {
      startX *= outputRatio;
      startY *= outputRatio;
      outWidth *= outputRatio;
      outHeight *= outputRatio;
    }
    ctx.drawImage(this.elements.$fullsizePreview.get(0), left, top, width, height, startX, startY, outWidth, outHeight);
    return canvas;
  };

  /**
   *
   * @param {Object} data
   * @returns {jQuery}
   * @private
   */
  ImageCropPlugin.prototype._getHtmlResult = function(data) {
    var points = data.points,
        $div = $('<div class="croppie-result">'),
        $img = $('<img>'),
        width = points[2] - points[0],
        height = points[3] - points[1];

    $div.append($img);
    $img.css({
      left: (-1 * points[0]) + 'px',
      top: (-1 * points[1]) + 'px'
    });
    img.src = data.url;
    $div.css({
      width: width + 'px',
      height: height + 'px'
    });
    return $div;
  };

  /**
   * @param {Object} data
   * @returns {String}
   * @private
   */
  ImageCropPlugin.prototype._getBase64Result = function(data) {
    var result = this._getCanvas(data).toDataURL(data.format, data.quality);
    return result;
  };

  /**
   *
   * @param {Object} data
   * @returns {Promise}
   * @private
   */
  ImageCropPlugin.prototype._getBlobResult = function(data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self._getCanvas(data).toBlob(function (blob) {
        resolve(blob);
      }, data.format, data.quality);
    });
  };


  /**
   * Get current state of cropper
   * @return {Object} - current state data
   * @private
   */
  ImageCropPlugin.prototype._get = function () {
    var previewEl = this.elements.$img.get(0),
        viewportEl = this.elements.$viewport.get(0),
        imgData = previewEl.getBoundingClientRect(),
        vpData = viewportEl.getBoundingClientRect(),
        x1 = vpData.left - imgData.left,
        y1 = vpData.top - imgData.top,
        x2 = x1 + vpData.width,
        y2 = y1 + vpData.height,
        currZoom = (parseInt(this._currentZoom * 100) / 100) || 1;

    x1 = Math.max(0, x1 / currZoom);
    y1 = Math.max(0, y1 / currZoom);
    x2 = Math.max(0, x2 / currZoom);
    y2 = Math.max(0, y2 / currZoom);

    var p1 = parseFloat(x1).toFixed(4),
        p2 = parseFloat(y1).toFixed(4),
        p3 = parseFloat(x2).toFixed(4),
        p4 = parseFloat(y2).toFixed(4);

    return {
      points: [p1, p2, p3, p4],
      zoom: currZoom
    };
  };

  var RESULT_DEFAULTS = {
        type: 'canvas',
        format: 'png',
        quality: 1
      },
      RESULT_FORMATS = ['jpeg', 'webp', 'png'];

  /**
   * Get result of image crop
   * @param {Object} [options]
   * @returns {Promise}
   * @private
   */
  ImageCropPlugin.prototype._result = function (options) {
    var self = this,
        data = this._get(),
        opts = $.extend(true, {}, RESULT_DEFAULTS, options || {}),
        resultType = (typeof (options) === 'string' ? options : (opts.type || 'base64')),
        format = opts.format,
        quality = opts.quality,
        backgroundColor = opts.backgroundColor,
        viewport = this.elements.$viewport.get(0),
        vpRect = viewport.getBoundingClientRect(),
        prom;

    /*
    if (size === 'viewport') {
      data.outputWidth = vpRect.width;
      data.outputHeight = vpRect.height;
    } else if (typeof size === 'object') {
      if (size.width && size.height) {
        data.outputWidth = size.width;
        data.outputHeight = size.height;
      } else if (size.width) {
        data.outputWidth = size.width;
        data.outputHeight = size.width / ratio;
      } else if (size.height) {
        data.outputWidth = size.height * ratio;
        data.outputHeight = size.height;
      }
    }
    */

    if (RESULT_FORMATS.indexOf(format) > -1) {
      data.format = 'image/' + format;
      data.quality = quality;
    }

    data.url = this.data.url;
    data.backgroundColor = backgroundColor;

    prom = new Promise(function (resolve, reject) {
      switch (resultType.toLowerCase()) {
        case 'rawcanvas':
          resolve(self._getCanvas(data));
          break;
        case 'canvas':
        case 'base64':
          resolve(self._getBase64Result(data));
          break;
        case 'blob':
          self._getBlobResult(data).then(resolve);
          break;
        default:
          resolve(self._getHtmlResult(data));
          break;
      }
    });
    return prom;
  };

  /**
   * @param {Image} img
   * @param {Function} cb - callback
   */
  ImageCropPlugin.prototype.getExifOrientation = function (img, cb) {
    if (!window.EXIF) {
      cb(0);
    }

    EXIF.getData(img, function () {
      var orientation = EXIF.getTag(this, 'Orientation');
      cb(orientation);
    });
  };

  /**
   *
   * @param {HTMLCanvasElement} canvas
   * @param {Image} img
   * @param {Number} orientation
   */
  ImageCropPlugin.prototype.drawCanvas = function (canvas, img, orientation) {
    var width = img.width,
        height = img.height,
        ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.save();
    switch (orientation) {
      case 2:
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        break;

      case 3:
        ctx.translate(width, height);
        ctx.rotate(180*Math.PI/180);
        break;

      case 4:
        ctx.translate(0, height);
        ctx.scale(1, -1);
        break;

      case 5:
        canvas.width = height;
        canvas.height = width;
        ctx.rotate(90*Math.PI/180);
        ctx.scale(1, -1);
        break;

      case 6:
        canvas.width = height;
        canvas.height = width;
        ctx.rotate(90*Math.PI/180);
        ctx.translate(0, -height);
        break;

      case 7:
        canvas.width = height;
        canvas.height = width;
        ctx.rotate(-90*Math.PI/180);
        ctx.translate(-width, height);
        ctx.scale(1, -1);
        break;

      case 8:
        canvas.width = height;
        canvas.height = width;
        ctx.translate(0, width);
        ctx.rotate(-90*Math.PI/180);
        break;
    }
    ctx.drawImage(img, 0,0, width, height);
    ctx.restore();
  };

  /**
   * @param {Number} [customOrientation]
   * @private
   */
  ImageCropPlugin.prototype._transferImageToCanvas = function (customOrientation) {
    customOrientation = this.options.enableOrientation && customOrientation;
    var $canvas = this.elements.$canvas,
        canvas = $canvas.get(0),
        img = this.elements.$img.get(0),
        ctx = canvas.get(0).getContext('2d'),
        exif = this.options.enableExif && window.EXIF;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = img.width;
    canvas.height = img.height;

    if (exif) {
      this.getExifOrientation(img, function (orientation) {
        this.drawCanvas(canvas, img, parseInt(orientation, 10));
        if (customOrientation) {
          this.drawCanvas(canvas, img, customOrientation);
        }
      });
    } else {
      if (customOrientation) {
        this.drawCanvas(canvas, img, customOrientation);
      }
    }
  };

  /**
   * React on image crop
   * @param {String} [result]
   * @private
   */
  ImageCropPlugin.prototype._onCropSuccess = function (result) {
    this.success(result);
  };

  /**
   * Success callback
   * @param {String} [result]
   */
  ImageCropPlugin.prototype.success = function (result) {
    if (this.successCallback) {
      this.successCallback(result);
    }
  };

  /**
   * Reset data of cropper plugin
   * @private
   */
  ImageCropPlugin.prototype._resetData = function() {
    this.weight = 0;

    this.originalWidth = null;
    this.originalHeight = null;
    this.actualWidth = null;
    this.actualHeight = null;

    this.croppedWidth = null;
    this.croppedHeight = null;
    this.croppedLeft = null;
    this.croppedTop = null;
  };

  /**
   * Destroy instance of image crop plugin
   * @private
   */
  ImageCropPlugin.prototype._destroy = function() {

  };

  /**
   * Update size values of cropper elements
   * @private
   */
  ImageCropPlugin.prototype._updateViewportSizes = function() {
    var currentSizes = this.elements.$img.get(0).getBoundingClientRect(),
        parentCurrentSizes = this.elements.$img.parent().get(0).getBoundingClientRect(),
        offsetLeft = currentSizes && parentCurrentSizes && (currentSizes.left - parentCurrentSizes.left),
        offsetTop = currentSizes && parentCurrentSizes && (currentSizes.top - parentCurrentSizes.top),
        maxAvailableWidth = (currentSizes && currentSizes.width) || this.originalWidth,
        maxAvailableHeight = (currentSizes && currentSizes.height) || this.originalHeight;

    this.actualWidth = maxAvailableWidth;
    this.actualHeight = maxAvailableHeight;
    this.offsetLeft = offsetLeft;
    this.offsetTop = offsetTop;
    this._currentZoom = parseInt(this.actualWidth / this.originalWidth * 100) / 100;
  };

  /**
   * Update viewport position
   * @param {String} [styles] - style attribute
   * @private
   */
  ImageCropPlugin.prototype._refreshViewportPosition = function(styles) {
    this._updateViewportSizes();
    var stylesForControls = {
      'width': this.croppedWidth ? this.croppedWidth : this.actualWidth,
      'height': this.croppedHeight ? this.croppedHeight : this.actualHeight,
      'max-width': this.actualWidth,
      'max-height': this.actualHeight,
      'left': this.croppedLeft ? this.croppedLeft : this.offsetLeft || 0,
      'top': this.croppedTop ? this.croppedTop : this.offsetTop || 0
    };
    if (styles) {
      this.elements.$viewport.attr('style', styles);
    } else {
      this.elements.$viewport.css(stylesForControls);
    }
  };

  /**
   * Restore prev state of cropper
   */
  ImageCropPlugin.prototype.undoCrop = function() {
    var imageToUndo = this.prevImages.pop();
    if (imageToUndo) {
      this._bind(imageToUndo);
    }
  };

  /**
   * Create cropper elements
   * @private
   */
  ImageCropPlugin.prototype._setupCropElements = function () {
    var controlsBlockHtml,
        assetsUrl = util.getDrawerFolderUrl() + 'assets/',
        cursorStyleAttr = 'style="cursor: url(' + assetsUrl + 'cursor-fa-crop-right.cur), crosshair"',
        borderStyleAttr = 'style="background: url(' + assetsUrl + 'border.gif);"';

    controlsBlockHtml = ''+
        '<div class="imager-crop-container">' +
        '<div class="crop-corner crop-top-left"></div>' +
        '<div class="crop-corner crop-top-right"></div>' +
        '<div class="crop-corner crop-bottom-right"></div>' +
        '<div class="crop-corner crop-bottom-left"></div>' +
        '<div class="crop-border crop-border-top" '+borderStyleAttr+'></div>' +
        '<div class="crop-border crop-border-right" '+borderStyleAttr+'></div>' +
        '<div class="crop-border crop-border-bottom" '+borderStyleAttr+'></div>' +
        '<div class="crop-border crop-border-left" '+borderStyleAttr+'></div>' +
        '</div>';
    
    this.elements = this.elements || {};
    this.elements.$viewport =  $(controlsBlockHtml);

    this.elements.$img = $('<img class="cr-image">');
    this.elements.$fullsizePreview = $('<img class="cr-image-fullsize">');
    this.elements.$overlay = $('<div class="cr-overlay">');
    this.elements.$preview = this.elements.$img;

    this.$element.append(this.elements.$fullsizePreview);
    this.$element.append(this.elements.$preview);
    this.$element.append(this.elements.$overlay);
    this.$element.append(this.elements.$viewport);
  };

  /**
   * Init cropper
   * @private
   */
  ImageCropPlugin.prototype._init = function () {
    this._setupCropElements();
  };

  /**
   * Save current state of cropper
   * @private
   */
  ImageCropPlugin.prototype._save = function () {

    this.prevImages.push({
      viewportStyleAttr: this.elements.$viewport.attr('style'),
      points: this._get(),
      url: this.currentImage
    });
  };

  /**
   * Process crop with current settings
   * @param {Boolean} [replaceCurrentImageWithResult]
   */
  ImageCropPlugin.prototype.applyCrop = function (replaceCurrentImageWithResult) {
    var self = this;
    self._result().then(function (result) {
      if (replaceCurrentImageWithResult) {
        self._save();
        self._bind(result);
      } else {
        self._onCropSuccess(result);
      }
    });
  };

  /**
   * @param {Image} img
   */
  ImageCropPlugin.prototype.startCropping = function (img) {
    var _this = this;

    img.style.opacity = 1;

    _this.enableRendering = false;
    _this.renderCropped = false;

    var $body = $('body');

    _this.originalWidth = img.naturalWidth;
    _this.originalHeight = img.naturalHeight;

    _this.makePreview();
    _this._refreshViewportPosition(_this.data && _this.data.viewportStyleAttr);
    _this.viewportStyleAttr = false;

    var $corners = _this.elements.$viewport.find('.crop-corner');

    if (_this.drawer.touchDevice) {
      $corners.css(_this.options.controlsTouchCss);
    } else {
      $corners.css(_this.options.controlsCss);
    }

    $corners.on(MOUSE_DOWN, function (clickEvent) {
      var controlItem = this,
          controlItemSize = this.getBoundingClientRect().width / 2;

      _this.drawer.croppingNow = true;

      var startPos = util.getEventPosition(clickEvent);

      var viewportSizeBox = _this.elements.$viewport.get(0).getBoundingClientRect(),
          parentSizeBox = _this.elements.$viewport.parent().get(0).getBoundingClientRect(),
          startControlsLeft = viewportSizeBox.left - parentSizeBox.left,
          startControlsTop = viewportSizeBox.top - parentSizeBox.top,
          startControlsWidth = viewportSizeBox.width,
          startControlsHeight = viewportSizeBox.height;

      var isTopLeft = $(controlItem).hasClass('crop-top-left'),
          isTopRight = $(controlItem).hasClass('crop-top-right'),
          isBottomLeft = $(controlItem).hasClass('crop-bottom-left'),
          isBottomRight = $(controlItem).hasClass('crop-bottom-right');

      $body.on(MOUSE_MOVE, function (moveEvent) {
        var movePos = util.getEventPosition(moveEvent);

        var diffLeft = movePos.left - startPos.left;
        var diffTop = movePos.top - startPos.top;

        if (isTopLeft) {
          _this.croppedLeft = startControlsLeft + diffLeft;
          _this.croppedTop = startControlsTop + diffTop;

          _this.croppedWidth = startControlsWidth - diffLeft;
          _this.croppedHeight = startControlsHeight - diffTop;
        }

        if (isTopRight) {
          _this.croppedLeft = startControlsLeft;
          _this.croppedTop = startControlsTop + diffTop;

          _this.croppedWidth = startControlsWidth - (diffLeft * -1);
          _this.croppedHeight = startControlsHeight - diffTop;
        }

        if (isBottomRight) {
          _this.croppedLeft = startControlsLeft;
          _this.croppedTop = startControlsTop;

          _this.croppedWidth = startControlsWidth - (diffLeft * -1);
          _this.croppedHeight = startControlsHeight + diffTop;
        }

        if (isBottomLeft) {
          _this.croppedLeft = startControlsLeft + diffLeft;
          _this.croppedTop = startControlsTop;

          _this.croppedWidth = startControlsWidth - diffLeft;
          _this.croppedHeight = startControlsHeight + diffTop;
        }

        // bounds validation
        if (_this.croppedLeft < _this.offsetLeft) {
          _this.croppedLeft = _this.offsetLeft;
        }

        if ((_this.croppedLeft + controlItemSize) > (_this.offsetLeft + _this.actualWidth)) {
          _this.croppedLeft = _this.offsetLeft + _this.actualWidth - _this.options.minSize;
          _this.croppedWidth = _this.options.minSize;
        }

        if (_this.croppedTop < _this.offsetTop) {
          _this.croppedTop = _this.offsetTop;
        }

        if ((_this.croppedTop + controlItemSize) > (_this.offsetTop + _this.actualHeight)) {
          _this.croppedTop = _this.offsetTop + _this.actualHeight - _this.options.minSize;
          _this.croppedHeight = _this.options.minSize;
        }

        if (_this.croppedLeft + _this.croppedWidth > (_this.actualWidth + _this.offsetLeft)) {
          _this.croppedWidth = _this.actualWidth - _this.croppedLeft + _this.offsetLeft;
        }

        if (_this.croppedTop + _this.croppedHeight > (_this.actualHeight + _this.offsetTop)) {
          _this.croppedHeight = _this.actualHeight - _this.croppedTop + _this.offsetTop;
        }

        _this.elements.$viewport.css({
          left: _this.croppedLeft,
          top: _this.croppedTop,
          width: _this.croppedWidth,
          height: _this.croppedHeight
        });

        moveEvent.preventDefault();
        moveEvent.stopPropagation();
        return false;
      });

      $body.on(MOUSE_UP, function () {
        util.setTimeout(function(){
          _this.drawer.croppingNow = false;
        }, 50);
        $body.off(MOUSE_MOVE);
        $body.off(MOUSE_UP);
      });
    });
  };

  /**
   * Create preview element
   * @param {Number} originalWidth
   * @param {Number} originalHeight
   */
  ImageCropPlugin.prototype.makePreview = function (originalWidth, originalHeight) {
    var _this = this;

    _this.$preview = $('' +
        '<div class="imager-crop-preview-container">' +
        '<canvas class="imager-crop-preview"></canvas>' +
        '</div>').css('position', 'absolute').css('top', '50px').css({
      width: originalWidth,
      height: originalHeight,
      position: 'absolute',
      right: '50px',
      top: '50px'
    });

    _this.previewCanvas = _this.$preview.find('canvas.imager-crop-preview')[0];
    _this.previewCanvas.__previewCanvas = true;

    _this.previewCanvas.width = originalWidth * 1.5;
    _this.previewCanvas.height = originalHeight * 1.5;

    $(_this.previewCanvas).css({
      height: '400px'
    });

    _this.$element.append(this.$preview);
  };

  /**
   * Reset data
   * @private
   */
  ImageCropPlugin.prototype.reset = function () {
    this.croppedLeft = null;
    this.croppedTop = null;
    this.croppedWidth = null;
    this.croppedHeight = null;

    this.sizeBeforeCrop = null;
  };

  /* CSS Transform Prototype */
  var TRANSLATE_OPTS = {
    'translate3d': {
      suffix: ', 0px'
    },
    'translate': {
      suffix: ''
    }
  };
  var Transform = function (x, y, scale) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.scale = parseFloat(scale);
  };

  Transform.parse = function (v) {
    if (v) {
      var isJquery = v && v instanceof jQuery && v.length,
          isNode = v instanceof Node,
          node = isJquery ? v.get(0) : (isNode && v),
          nodeStyle = node && node.style;
      if (nodeStyle) {
        return Transform.parse(nodeStyle[CSS_TRANSFORM]);
      } else {
        if (v.indexOf('matrix') > -1 || v.indexOf('none') > -1) {
          return Transform.fromMatrix(v);
        } else {
          return Transform.fromString(v);
        }
      }
    }
  };

  Transform.fromMatrix = function (v) {
    var vals = v.substring(7).split(',');
    if (!vals.length || v === 'none') {
      vals = [1, 0, 0, 1, 0, 0];
    }
    var xVal = parseInt(vals[4], 10),
        yVal = parseInt(vals[5], 10),
        scaleVal = parseFloat(vals[0]);

    return new Transform(xVal, yVal, scaleVal);
  };

  Transform.fromString = function (v) {
    var values = v.split(') '),
        translate = values[0].substring(ImageCropPlugin.prototype.globals.translate.length + 1).split(','),
        scale = values.length > 1 ? values[1].substring(6) : 1,
        x = translate.length > 1 ? translate[0] : 0,
        y = translate.length > 1 ? translate[1] : 0;

    return new Transform(x, y, scale);
  };

  Transform.prototype.toString = function () {
    var suffix = TRANSLATE_OPTS[ImageCropPlugin.prototype.globals.translate].suffix || '',
        prefix = ImageCropPlugin.prototype.globals.translate,
        style = '(' + this.x + 'px, ' + this.y + 'px' + suffix + ') scale(' + this.scale + ')',
        result = prefix + style;

    return result;
  };

  var TransformOrigin = function (el) {
    var elIsJquery = el instanceof jQuery;
    el = elIsJquery ? el.get(0) : el;
    if (!el || !el.style[CSS_TRANS_ORG]) {
      this.x = 0;
      this.y = 0;
      return;
    }
    var css = el.style[CSS_TRANS_ORG].split(' ');
    this.x = parseFloat(css[0]);
    this.y = parseFloat(css[1]);
  };

  TransformOrigin.prototype.toString = function () {
    return this.x + 'px ' + this.y + 'px';
  };
  /***********/
  pluginsNamespace.ImageCropPlugin = ImageCropPlugin;
})(jQuery, DrawerJs.plugins, DrawerJs.util);