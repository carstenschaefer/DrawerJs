(function ($, pluginsNamespace, util) {
  'use strict';

  var optimalSizeOfDropdown = 375;

  /**
   * Creates color input for changing color; colorChangeHandler is called on color change.
   *
   * @param {DrawerJs.Drawer} drawer
   *
   * @param {Object} [options]
   * Configuration object.
   *
   * @param {String[]} [options.colors]
   * Array of colors to be used.
   *
   * @param {number} [options.colorsInRow]
   * Number of colors for one row.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var ColorpickerControl = function ColorpickerControlConstructor(drawer, options) {
      this.drawer = drawer;

      // init options
      options = options || {};
      this.options = $.extend(true, {}, this._defaultOptions || {}, options || {});

      this.hideOnEditMode = true;
      // more stuff
      this.assetsUrl = util.getDrawerFolderUrl() + 'assets/';
      this.shouldDisplayTransparent = false;

      this.colors = this.options.colors;
      this.colorsInRow = this.options.colorsInRow;
    };


  ColorpickerControl.prototype._defaultOptions = {
      colors: [
          '#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d','#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#ffff00',
          '#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb','#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada', '#fff2ca',
          '#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7','#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5', '#ffe694',
          '#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694','#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f', '#f2c314',
          '#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734','#76923c', '#5f497a', '#92cddc', '#e36c09', '#c09100',
          '#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423','#4f6128', '#3f3151', '#31859b', '#974806', '#7f6000'
        ],
        colorsInRow: 11,
        minSwatchSize : 10,
        buttonOrder: 6
  };

  ColorpickerControl.prototype.TRANSPARENT = 'rgba(0, 0, 0, 0)';
  ColorpickerControl.prototype.defaultPosition = 'bottom';
  ColorpickerControl.prototype.positions = ['bottom', 'top', 'left', 'right'];

  /**
   * Removes tool
   */
  ColorpickerControl.prototype.remove = function () {
    if (this.$colorButton) {
      this.$colorButton.remove();
    }
  };


  /**
   * Hides controls
   */
  ColorpickerControl.prototype.hideControls = function () {
    if (this.$colorButton) {
      this.$colorButton.addClass('hidden');
    }
  };

  /**
   * Shows controls.
   * Before showing - updates controls size and position.
   */
  ColorpickerControl.prototype.showControls = function () {
    if (this.$colorButton) {
      this.$colorButton.removeClass('hidden');
    }
  };


  /**
   * Returns current selected color
   * @return {String} currently selected css color
   */
  ColorpickerControl.prototype.getColor = function() {
      return this.currentColor;
  };


  /**
   * Sets current color.
   * @param {String|fabric.Color} color valid css color or 'transparent'
   */
  ColorpickerControl.prototype.setColor = function (color) {
      if (color instanceof fabric.Color) {
        this.currentColor = color;
      } else {
        this.currentColor = new fabric.Color(color);
      }

      var background = color,
          isTransparent = color === '' || color == this.TRANSPARENT || color == 'transparent';
      if (isTransparent) {
        background = 'url(' + this.assetsUrl + 'transparent.png)';
        this.currentColor = this.TRANSPARENT;
      }

      this.$colorButton.$colorIndicator.css('background', background);
    };


  /**
   * Removes transparent color from list
   */
  ColorpickerControl.prototype.disableTransparent = function () {
    this.shouldDisplayTransparent = false;

    if (this.$colorButton) {
      this.$colorButton.find('.transparent').hide();
    }
  };

  /**
   * Adds transparent color to the list
   */
  ColorpickerControl.prototype.enableTransparent = function () {
    this.shouldDisplayTransparent = true;

    if (this.$colorButton) {
      this.$colorButton.find('.transparent').show();
    }
  };


  /**
   * This function is called every time user clicks on color from color-dropdown
   * menu.
   *
   * @param {String} selectedColor Hash value of user selected color.
   */
  ColorpickerControl.prototype.onColorSelected = function (selectedColor) {
    this.hideColorDropdown();
    this.setColor(selectedColor);

    if (this.colorChangeHandler) {
      this.colorChangeHandler(selectedColor);
    }
  };


  /**
   * Create and attach global click handlers
   * @private
   */
  ColorpickerControl.prototype._setGlobalClickHandler = function() {
    var self = this;
    $('html').click(function (e) {
        if (self.colorDropdownVisible && (e.target != self.$colorButton.$colorIndicator.get(0))) {
          self.hideColorDropdown();
        }
        return true;
    });
  };


  /**
   * Creates color button which shows colors Controls on click.
   *
   * @param {DrawerToolbar} toolbar to append this button to.
   * @param {Function} colorChangeHandler - Function that will be called when color is selected.
   */
  ColorpickerControl.prototype.createControl = function (toolbar, colorChangeHandler) {
    this.$colorButton = $(this._getControlHtml());

    this._collectDataFromToolbar(toolbar);

    // cache control components
    this.$colorButton.$colorIndicator = this.$colorButton.find('.color-indicator');
    this.$colorButton.$colorDropdown = this.$colorButton.find('.color-dropdown');

    this.$colorButton.$colorIndicator.css('background-color', this.drawer.activeColor);

    this.colorDropdownVisible = false;
    this.$colorButton.$colorIndicator.click(this._onButtonClick.bind(this));

    this.colorChangeHandler = colorChangeHandler;

    this._buildPicker(this.$colorButton.$colorDropdown);

    this._setGlobalClickHandler();

    toolbar.addControl(this.$colorButton, this.options.buttonOrder);

    return this.$colorButton;
  };

  /**
   * React on button click
   * @param {Event} event - mouse click event
   * @private
   */
  ColorpickerControl.prototype._onButtonClick = function (event) {
    var $trigger = $(event.currentTarget);
    this.$lastTrigger = $trigger;
    this.toggleColorDropdown($trigger);
  };

  ColorpickerControl.prototype._collectDataFromToolbar = function (toolbar) {
    if (toolbar) {
      var toolbarPosition = toolbar.options.position;
      this.isVertical = toolbarPosition === 'left' || toolbarPosition === 'right';
      this.$toolbar = toolbar.$toolbar;
      this.toolbar = toolbar;
    }
  };

  /**
   * Build some magic picker.
   * @param  {jQuery} $container - jQuery wrapper of container
   * @private
   */
  ColorpickerControl.prototype._buildPicker = function ($container) {
    // create swatch for each color
    for (var i = 0; i < this.colors.length; i++) {
      var color = this.colors[i];

      var $swatch = this._createSwatch(color);
      $container.append($swatch);
    }

    // create transparentSwatch
    var $transparentSwatch = this._createTransparentSwatch();
    $container.append($transparentSwatch);
  };


  /**
   * Calcs swatch size and updated Controls width if needed.
   * @private
   */
  ColorpickerControl.prototype._updateControlsSize = function () {
      // calc swatch size
      var swatchSize = this._calcSwatchSize();
      // swatch size in css is 1em, so set $container fontSize
      this.$colorButton.$colorDropdown.css('fontSize', swatchSize + 'px');
      // set control width
      var controlWidth = swatchSize * this.colorsInRow;
      this.$colorButton.$colorDropdown.css('width', controlWidth + 'px');
  };


  /**
   * Calc swatch size to fit current drawer width, respecting this.colorsInRow
   * @return {Number} size of swatch in px
   * @private
   */
  ColorpickerControl.prototype._calcSwatchSize = function () {
    var swatchSize = this.drawer.touchDevice ? this.drawer.options.toolbarSize
                                             : this.drawer.options.toolbarSizeTouch;
    swatchSize = swatchSize || this.options.minSwatchSize;

    // calc swatch width to fit in drawer canvas
    var widthToFit = Math.floor(this.drawer.width * 0.95 / this.colorsInRow);
    // calc swatch height to fit in drawer canvas, including toolOptionsToolbar height
    var heightWithToolbars = this.drawer.height + this.drawer.toolbars.toolOptionsToolbar.height();
    var heightToFit = Math.floor(heightWithToolbars  / (this.colors.length / this.colorsInRow));

    var minSize = Math.min(widthToFit, heightToFit);
    // look if colors total area is bigger then available space
    if (swatchSize > minSize) {
        swatchSize = Math.max(minSize, this.options.minSwatchSize);
    }

    return swatchSize;
  };

  /**
   * Collect sizes of needed elements
   * @param {jQuery} $trigger - trigger element
   * @returns {Object}
   * @private
   */
  ColorpickerControl.prototype._getAvailableSpace = function ($trigger) {
    var result;
    if ($trigger && $trigger.length) {
      var $canvas = this.drawer.$canvasEditContainer,
          $contentWrapper = this.$colorButton.$colorDropdown.closest('.popup-content-wrapper'),
          $toolbarWrapper = this.$colorButton.$colorDropdown.closest('.toolbar-content-wrapper'),
          canvasSizes = $canvas.get(0).getBoundingClientRect(),
          triggerSizes = $trigger.get(0).getBoundingClientRect(),
          toolbarSizes = $toolbarWrapper.get(0).getBoundingClientRect(),
          popupSizes = $contentWrapper.get(0).getBoundingClientRect(),
          paletteSizes = this.$colorButton.$colorDropdown.get(0).getBoundingClientRect(),

          // arrowSize = 10,
          arrowSize = 0,
          triggerOffsetX = triggerSizes.left - canvasSizes.left,
          triggerOffsetY = triggerSizes.top - canvasSizes.top;
      result = {};

      result.top = triggerOffsetY;
      result.left = triggerOffsetX;
      result.right = canvasSizes.width - triggerOffsetX - triggerSizes.width;
      result.bottom = canvasSizes.height - triggerOffsetY - triggerSizes.height;

      result.centerX = triggerOffsetX + triggerSizes.width/2;
      result.centerY = triggerOffsetY + triggerSizes.height/2;

      result.palette = {
        arrowSize: arrowSize,
        top: paletteSizes.height,
        bottom: paletteSizes.height,
        left: paletteSizes.width,
        right: paletteSizes.width
      };

      result.popupSizes = popupSizes;
      result.toolbarSizes = toolbarSizes;
      result.paletteSizes = paletteSizes;
      result.canvasSizes = canvasSizes;
      result.triggerSizes = triggerSizes;
    }
    this.sizes = result;
    return result;
  };

  /**
   * Reset palette
   * @private
   */
  ColorpickerControl.prototype._resetPalette = function () {
    this.$colorButton.$colorDropdown.removeClass('palette-with-scroll');
    this.$colorButton.$colorDropdown.removeAttr('style');
    this.$colorButton.$colorDropdown.removeAttr('data-position');
  };

  /**
   * Set size for palette as for canvas
   * @private
   */
  ColorpickerControl.prototype._setFullSize = function () {
    var sizes = this.sizes,
        popupOffsetLeft = sizes.toolbarSizes.left - sizes.canvasSizes.left,
        popupOffsetTop = sizes.toolbarSizes.top - sizes.canvasSizes.top,
        styles = {};

    styles.top = -popupOffsetTop;
    styles.left = -popupOffsetLeft;
    styles.width = sizes.canvasSizes.width;
    styles.height = sizes.canvasSizes.height;

    this.$colorButton.$colorDropdown.css(styles);
  };

  /**
   * Adjust position for popup
   * @param {jQuery} $element - trigger element
   * @private
   */
  ColorpickerControl.prototype._adjustPosition = function ($element) {
    this._resetPalette();
    var sizes = this._getAvailableSpace($element),
        positionFound;
    this.positions.forEach(function (position, i) {
      var positionExists = sizes[position] && sizes.palette[position];
      if (!positionFound && positionExists) {
        var neededSpace = sizes.palette[position] + sizes.palette.arrowSize,
            spaceIsEnough = (sizes[position] - neededSpace) > 0;
        positionFound = spaceIsEnough && position;
      }
    });
    if (positionFound) {
      this._movePalette(positionFound);
    } else {
      this._setFullSize();
    }
  };

  /**
   * Crop unnecessary width/height
   * @private
   */
  ColorpickerControl.prototype._cropSizeOfPalette = function () {
    var paletteSizes = this.$colorButton.$colorDropdown.get(0).getBoundingClientRect(),
        canvasSizes = this.sizes.canvasSizes,
        styles = {},
        negativeDiffY_bottom = canvasSizes.height - (paletteSizes.height + paletteSizes.top - canvasSizes.top),
        negativeDiffY_top = paletteSizes.top - canvasSizes.top,
        negativeDiffX_right = canvasSizes.width - (paletteSizes.width + paletteSizes.left - canvasSizes.left),
        negativeDiffX_left = paletteSizes.left - canvasSizes.left,
        negativeDiffY = Math.min(negativeDiffY_bottom,negativeDiffY_top),
        negativeDiffX = Math.min(negativeDiffX_right,negativeDiffX_left),
        notEnoughSpace;

    if (negativeDiffY < 0) {
      notEnoughSpace = true;
      styles.height = paletteSizes.height + negativeDiffY;
    }
    if (negativeDiffX < 0) {
      notEnoughSpace = true;
      styles.width = paletteSizes.width + negativeDiffX;
    }
    if (notEnoughSpace) {
      this.$colorButton.$colorDropdown.addClass('palette-with-scroll');
    }

    this.$colorButton.$colorDropdown.css(styles);
  };

  /**
   * Move palette to chosen direction
   * @param {String} position
   * @private
   */
  ColorpickerControl.prototype._movePalette = function (position) {
    var sizes = this.sizes,
        popupOffsetLeft = this.sizes.toolbarSizes.left - this.sizes.canvasSizes.left,
        popupOffsetTop = this.sizes.toolbarSizes.top - this.sizes.canvasSizes.top,
        isVerticalAlign,
        styles = {},
        offsetLeft,
        offsetTop,
        arrowOffsetLeft = sizes.paletteSizes.width/2,
        arrowOffsetTop = sizes.paletteSizes.height/2,
        negativeDiff,
        smallerThanCanvas,
        notEnoughSpace;

    switch (position) {
      case 'left':
        offsetLeft = sizes.left - sizes.paletteSizes.width - sizes.palette.arrowSize;
        offsetTop = sizes.centerY - sizes.paletteSizes.height/2;
        styles.right = sizes.toolbarSizes.width - (sizes.left - popupOffsetLeft);
        break;
      case 'right':
        offsetLeft = sizes.canvasSizes.width - sizes.right + sizes.palette.arrowSize;
        offsetTop = sizes.centerY - sizes.paletteSizes.height/2;
        styles.left =  sizes.left - popupOffsetLeft + sizes.triggerSizes.width;
        break;
      case 'top':
        isVerticalAlign = true;
        offsetLeft = sizes.centerX - sizes.paletteSizes.width/2;
        offsetTop = sizes.top - sizes.paletteSizes.height - sizes.palette.arrowSize;
        styles.bottom = sizes.toolbarSizes.height - (sizes.top - popupOffsetTop);
        break;
      case 'bottom':
        isVerticalAlign = true;
        offsetLeft = sizes.centerX - sizes.paletteSizes.width/2;
        offsetTop = sizes.canvasSizes.height - sizes.bottom + sizes.palette.arrowSize;
        styles.top = sizes.top - popupOffsetTop + sizes.triggerSizes.height;
        break;
    }

    if (isVerticalAlign) {
      negativeDiff = (offsetLeft + sizes.paletteSizes.width ) - sizes.canvasSizes.width;
      smallerThanCanvas = (sizes.canvasSizes.width - sizes.paletteSizes.width) > 0;
      if (negativeDiff > 0 && offsetLeft > 0 && !smallerThanCanvas) {
        arrowOffsetLeft += negativeDiff;
        styles.right = 0 - popupOffsetLeft;
      } else {
        if (offsetLeft < 0) {
          arrowOffsetLeft += offsetLeft;
          offsetLeft = 0;
        }
        notEnoughSpace = true;
        styles.width = sizes.canvasSizes.width;
        styles.left = offsetLeft - popupOffsetLeft;
      }
    } else {
      negativeDiff = (offsetTop + sizes.paletteSizes.height) - sizes.canvasSizes.height;
      smallerThanCanvas = (sizes.canvasSizes.height - sizes.paletteSizes.height) > 0;
      if (negativeDiff > 0 && offsetTop > 0 && !smallerThanCanvas) {
        arrowOffsetTop += negativeDiff;
        styles.bottom = 0 - popupOffsetTop;
      } else {
        notEnoughSpace = true;
        if (offsetTop < 0) {
          arrowOffsetTop += offsetTop;
          offsetTop = 0;
        }
        styles.height = sizes.canvasSizes.width;
        styles.top = offsetTop - popupOffsetTop;
      }
    }

    if (notEnoughSpace) {
      this.$colorButton.$colorDropdown.addClass('palette-with-scroll');
    }
    this.$colorButton.$colorDropdown.attr('data-position',position);
    this.$colorButton.$colorDropdown.css(styles);
    this._cropSizeOfPalette();
    // this._moveArrow(arrowOffsetLeft, arrowOffsetTop);
  };


  /**
   * Adjusts color dropdown position to be inside drawer
   * @private
   */
  ColorpickerControl.prototype._adjustControlsPosition = function () {
    var notEnoughWidth = this.drawer.width < optimalSizeOfDropdown,
        notEnoughHeight = this.drawer.height < optimalSizeOfDropdown,
        smallerThanNormalSize = this.isVertical ? notEnoughHeight : notEnoughWidth,
        canvasContainerSizes = this.drawer.$canvasEditContainer.get(0).getBoundingClientRect(),
        colorButtonSizes = this.$colorButton.get(0).getBoundingClientRect(),
        minimumSizeDelta = 10,
        currDropdownSizes;


    this.$colorButton.$colorDropdown.removeAttr('style');
    currDropdownSizes = this.$colorButton.$colorDropdown.get(0).getBoundingClientRect();

    if (this.isVertical) {
      if (smallerThanNormalSize) {
        this.$colorButton.$colorDropdown.css('top', 0);
      } else {
        var topOffsetOfButton = colorButtonSizes.top - canvasContainerSizes.top,
            newTopValue = topOffsetOfButton + colorButtonSizes.height / 2 - currDropdownSizes.height / 2;
        this.$colorButton.$colorDropdown.css('top', newTopValue);
      }
    } else {
      if (smallerThanNormalSize) {
        this.$colorButton.$colorDropdown.css('left', 0);
      } else {
        var leftOffsetOfButton = colorButtonSizes.left - canvasContainerSizes.left,
            newLeftValue = leftOffsetOfButton + colorButtonSizes.width / 2 - currDropdownSizes.width / 2;
        this.$colorButton.$colorDropdown.css('left', newLeftValue);
      }
    }

    if (!smallerThanNormalSize) {
      currDropdownSizes = this.$colorButton.$colorDropdown.get(0).getBoundingClientRect();
      if (this.isVertical) {
        smallerThanNormalSize = (optimalSizeOfDropdown - currDropdownSizes.height) > minimumSizeDelta;

        var topOffsetIsValid = currDropdownSizes.top > canvasContainerSizes.top,
            bottomOffsetIsValid = (currDropdownSizes.top + currDropdownSizes.height) < (canvasContainerSizes.top + canvasContainerSizes.height),
            topIsCorrect = topOffsetIsValid,
            bottomIsCorrect = bottomOffsetIsValid && !smallerThanNormalSize;

        if (!topIsCorrect) {
          this.$colorButton.$colorDropdown.removeAttr('style');
          this.$colorButton.$colorDropdown.css('top', 0);
        }
        if (!bottomIsCorrect) {
          this.$colorButton.$colorDropdown.removeAttr('style');
          this.$colorButton.$colorDropdown.css({
            'bottom' : 0,
            'top': 'auto'
          });
        }
      } else {
        smallerThanNormalSize = (optimalSizeOfDropdown - currDropdownSizes.width) > minimumSizeDelta;

        var leftOffsetIsValid = currDropdownSizes.left > canvasContainerSizes.left,
            rightOffsetIsValid = (currDropdownSizes.left + currDropdownSizes.width) < (canvasContainerSizes.left + canvasContainerSizes.width),
            leftIsCorrect = leftOffsetIsValid,
            rightIsCorrect = rightOffsetIsValid && !smallerThanNormalSize;

        if (!leftIsCorrect) {
          this.$colorButton.$colorDropdown.removeAttr('style');
          this.$colorButton.$colorDropdown.css('left', 0);
        }
        if (!rightIsCorrect) {
          this.$colorButton.$colorDropdown.removeAttr('style');
          this.$colorButton.$colorDropdown.css({
            'right' : 0,
            'left': 'auto'
          });
        }
      }
    }
  };

  /**
   * Get html of color control
   * @returns {String}
   * @private
   */
  ColorpickerControl.prototype._getControlHtml = function () {
    var colorLabelText = this.options.colorText || "";
    return '<li class="colorpicker-control" ' +
              'data-editable-canvas-sizeable="toolbar-button" ' +
              '>' +
            '<span class="toolbar-label" ' +
                  'data-editable-canvas-sizeable="toolbar-button" ' +
                  'data-editable-canvas-cssrules="line-height">' +
                  this.drawer.t(colorLabelText) + ' ' + '</span>' +
            '<span class="color-indicator" ' +
                  'data-editable-canvas-sizeable="toolbar-button" ' +
                  'data-editable-canvas-cssrules="width"></span>' +
            '<span class="color-dropdown control-hidden hidden" ' +
                  'data-editable-canvas-sizeable="toolbar-button"></span>' +
          '</li>';

  };

    /**
     * Creates swatch - square control with given color
     *
     * @param  {String} color
     * @param  {String} _class css class
     * @return {jQuery}
     * @private
     */
  ColorpickerControl.prototype._createSwatch = function (color, _class) {
      var $swatch = $('<a href="#"></a>');
      $swatch.attr('rel', color)
             .addClass('color-swatch')
             .css({'background-color': color});

      if (_class) {
        $swatch.addClass(_class);
      }

    // bind click
      util.bindClick($swatch, 'colorpicker', this._swatchClickHandler.bind(this));

      return $swatch;
    };


    /**
     * Swatch click handler.
     * Calls onColorSelected()
     * Prevents default click on <a> behavior.
     *
     * @param  {jQuery.Event} e
     * @private
     */
    ColorpickerControl.prototype._swatchClickHandler = function(e) {
      e.preventDefault();
      e.stopPropagation();

      var clickedColorValue = $(e.target).attr('rel');
      this.onColorSelected(clickedColorValue);
      return false;
    };

    /**
     * Creates swatch for transparent  color
     * @return {jQuery}
     * @private
     */
    ColorpickerControl.prototype._createTransparentSwatch = function() {
        var $swatch = this._createSwatch(this.TRANSPARENT, 'transparent');
        $swatch.text(this.drawer.t('Transparent'));

        if (!this.shouldDisplayTransparent) {
          $swatch.hide();
        }

        return $swatch;
    };

  /**
   * Show color dropdown
   * @param {jQuery} [$trigger] - trigger element
   */
  ColorpickerControl.prototype.showColorDropdown = function ($trigger) {
    this.colorDropdownVisible = true;
    this._updateControlsSize();
    var insidePopup = this.$toolbar.closest('.popup-content-wrapper').length;
    this.$colorButton.$colorDropdown.removeClass('hidden');
    if (insidePopup) {
      this._adjustPosition($trigger);
    } else {
      this._adjustControlsPosition();
    }

    this.$colorButton.$colorDropdown.removeClass('control-hidden');
    if (this.toolbar.options.compactType === 'scrollable') {
      this.$cloneControl = $('<div class="colorpicker-control"></div>');
      this.$cloneDropdown = this.$colorButton.$colorDropdown.clone(true);
      this.$cloneControl.append(this.$cloneDropdown);
      this.$toolbar.closest('.toolbar-placeholder').append(this.$cloneControl);
    }
  };

  /**
   * Hide color dropdown
   */
  ColorpickerControl.prototype.hideColorDropdown = function () {
    this.colorDropdownVisible = false;
    this.$colorButton.$colorDropdown.addClass('hidden');
    this.$colorButton.$colorDropdown.addClass('control-hidden');
    if (this.$cloneControl) {
      this.$cloneControl.remove();
    }
  };

  /**
   * Toggle state of color dropdown
   * @param {jQuery} [$trigger]
   */
  ColorpickerControl.prototype.toggleColorDropdown = function ($trigger) {
    if (!this.colorDropdownVisible) {
      this.showColorDropdown($trigger);
    } else {
      this.hideColorDropdown();
    }
  };


  pluginsNamespace.ColorpickerControl = ColorpickerControl;

}(jQuery, DrawerJs.plugins, DrawerJs.util));
