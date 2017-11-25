(function ($, pluginsNamespace, BaseToolOptions, util) {
  'use strict';

  /**
   * Provides input for changing width of line/arrow.
   *
   * @param {DrawerJs.Drawer} drawer
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} [options] - Configuration object
   * @param {Number} [options.digitsAfterDecimalPoint=0] - The number of digits to appear after the decimal point;
   *
   * @constructor
   * @memberof DrawerJs.options
   * @extends {DrawerJs.plugins.BaseToolOptions}
   */
  var LineWidth = function LineWidthConstructor(drawer, options) {
    // call super c-tor
    BaseToolOptions.call(this, drawer);
    this._setupOptions(options);
  };

  LineWidth.prototype = Object.create(BaseToolOptions.prototype);
  LineWidth.prototype.constructor = BaseToolOptions;

  LineWidth.prototype.name = 'LineWidth';
  LineWidth.prototype.optionName = 'lineWidth';
  // LineWidth.prototype.useCombobox = true;
  // LineWidth.prototype.buttonMode = true;
  // LineWidth.prototype.preventHightlight = true;
  LineWidth.prototype.useCombobox = false;
  LineWidth.prototype.preventHightlight = false;
  LineWidth.prototype.buttonMode = false;

  LineWidth.prototype.buttonIconClass = 'fa-arrows-h';

  LineWidth.prototype._defaultOptions = {
    digitsAfterDecimalPoint: 0
  };

  LineWidth.prototype.onSelectionCleared = function (toolbar) {
    this.data = false;
  };

  LineWidth.prototype.createControls = function (toolbar) {
    this.createControl(toolbar);
    this._attachEvents();
  };

  /**
   * Get html of control
   * @returns {string} result - html of controls
   * @private
   */
  LineWidth.prototype._generateHtml = function () {
    var result,
        selectHtml;

    selectHtml = '' +
        '<select ' +
        'class="editable-canvas-line-width-input controls-value-item" ' +
        'name="drawer-size"' +
        'data-name="lineWidth"' +
        '>' +
        '</select>';

    var optionItemDefaultClasses = 'toolbar-item-wrapper toolbar-item-range editable-canvas-line-width hidden',
        optionItemAdditionalClasses = '' +
            (this.buttonMode ? ' toolbar-button-item ' : '') +
            (this.preventHightlight ? ' prevent-highlight ' : ''),
        optionItemClasses = optionItemDefaultClasses + optionItemAdditionalClasses;

    /*
     // For button mode
     result = '' +
     '<li class="' + optionItemClasses + '">' +
     '<div class="toolbar-item-description">' +
     '<span class="toolbar-item-label">' +
     this.drawer.t('Line width:') + ' ' +
     '</span>' +
     '<span class="toolbar-item-valueholder"></span>' +
     '<span class="toolbar-item-icon fa ' + this.buttonIconClass + '"></span>' +
     '</div>' +
     '<div class="toolbar-dropdown-block collapsed">' +
     selectHtml +
     '</div>' +
     '</li>';

     */

    result = '' +
        '<li class="' + optionItemClasses + '">' +
          '<div class="toolbar-item-description">' +
            '<span class="toolbar-label editable-canvas-line-width-label">' +
              this.drawer.t('Line width:') + ' ' +
            '</span>' +
            '<span class="toolbar-label toolbar-label-indicator editable-canvas-line-width-indicator"></span>' + '' +
          '</div>' +
          '<input ' +
            'class="editable-canvas-line-width-input controls-value-item" ' +
            'name="drawer-line-width"' +
            'data-name="lineWidth"' +
            'type="range"' +
            'min="1"' +
            'max="1000"' +
          '>' +
        '</li>';
    return result;
  };

  /**
   * Create/add controls
   * @param {DrawerToolbar} toolbar
   * @returns {jQuery}
   * @private
   */
  LineWidth.prototype.createControl = function (toolbar) {
    var toolControlHtml = this._generateHtml();
    this.$toolControl = $(toolControlHtml);
    this.$valueIndicator = this.$toolControl.find('.editable-canvas-line-width-indicator');
    toolbar.addControl(this.$toolControl, this.options.buttonOrder);
    return this.$toolControl;
  };

  /**
   * Attach events for control element
   * @private
   */
  LineWidth.prototype._attachEvents = function () {
    if (this.$toolControl) {
      this.$toolControl.on('input change toolbarOptionChange', this.onInputChange.bind(this));
    }
  };


  /**
   * Validate width value
   * @param rawValue
   * @returns {*}
   */
  LineWidth.prototype.validateValue = function (rawValue) {
    rawValue = parseInt(rawValue, 10);
    var result,
        rawValueIsValid = typeof rawValue === 'number' && isFinite(rawValue) && rawValue;
    if (rawValueIsValid) {
      var decimalRatio = Math.pow(10, this.options.digitsAfterDecimalPoint),
          formattedValue = parseInt(rawValue * decimalRatio, 10) / decimalRatio;
      result = formattedValue;
    }
    return result;
  };

  /**
   * Set line width of current active object
   * @param {number|string} value - Width of line/arrow in px
   */
  LineWidth.prototype.setLineWidth = function (value) {
    var fCanvas = this.drawer.fCanvas,
        target = fCanvas.getActiveObject();
    if (target) {
      if (!this.data) {
        this.collectDataFromObject(target);
      }

      var diffRatio = parseInt(value / this.data.initialWidth * 100, 10) / 100;
      
      target.x1 = this.data.x1 * diffRatio * target.scaleX;
      target.x2 = this.data.x2 *  diffRatio * target.scaleX;
      target.y1 = this.data.y1 * diffRatio * target.scaleY;
      target.y2 = this.data.y2 * diffRatio * target.scaleY;

      target.set('x1',target.x1);
      target.set('x2',target.x2);
      target.set('y1',target.y1);
      target.set('y2',target.y2);

      target.set('top',this.data.top);
      target.set('left',this.data.left);

      fCanvas.renderAll();
    }
  };

  /**
   * This function is called every time user changes width via control
   * @private
   */
  LineWidth.prototype.onInputChange = function () {
    var $opacityInput = $(this.$toolControl).find('input'),
        rawValue = $opacityInput.val(),
        validatedValue = this.validateValue(rawValue);
    this.$valueIndicator.text(validatedValue + 'px');
    this.setLineWidth(validatedValue);
  };

  LineWidth.prototype.collectDataFromObject = function (target) {
    var result = {},
        decimalRatio = Math.pow(10, this.options.digitsAfterDecimalPoint),
        calcWidth = function (x, y) {
          var result,
              axisSum = Math.pow(x, 2) + Math.pow(y, 2),
              widthRaw = Math.sqrt(axisSum),
              lineWidth = parseInt(widthRaw * decimalRatio) / decimalRatio;
          result = lineWidth;
          return result;
        },
        xDelta =target.x2 - target.x1,
        yDelta =target.y2 - target.y1,
        xDiffScaled = (xDelta) * target.scaleX,
        yDiffScaled = (yDelta) * target.scaleY,
        xDiff = (xDelta),
        yDiff = (yDelta),
        angleRad = Math.atan((yDelta) / (xDelta)),
        angleDeg = Math.abs(fabric.util.radiansToDegrees(angleRad));

    result.lineWidth = calcWidth(xDiffScaled, yDiffScaled);
    result.initialWidth = calcWidth(xDiff, yDiff);
    result.angleRad = angleRad;
    result.angleDeg = angleDeg;

    result.top = target.top;
    result.left = target.left;
    result.x1 = target.x1;
    result.x2 = target.x2;
    result.y1 = target.y1;
    result.y2 = target.y2;

    this.data = result;
    return result;
  };

  LineWidth.prototype.updateControls = function (dataToFill) {
    dataToFill = dataToFill || this.data;
    var rawValue = dataToFill.lineWidth,
        validatedValue = this.validateValue(rawValue);
    this.$toolControl.find('input').val(validatedValue);
    this.$valueIndicator.text(validatedValue + 'px');
  };

  LineWidth.prototype.showControls = function () {
    this.$toolControl.removeClass('hidden');
  };

  LineWidth.prototype.hideControls = function (force) {
    this.$toolControl.addClass('hidden');
  };

  pluginsNamespace.LineWidth = LineWidth;
}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseToolOptions, DrawerJs.util));