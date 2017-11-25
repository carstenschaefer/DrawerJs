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
  var StrokeWidth = function StrokeWidthConstructor(drawer, options) {
    // call super c-tor
    BaseToolOptions.call(this, drawer);
    this._setupOptions(options);
  };

  StrokeWidth.prototype = Object.create(BaseToolOptions.prototype);
  StrokeWidth.prototype.constructor = BaseToolOptions;

  StrokeWidth.prototype.name = 'StrokeWidth';
  StrokeWidth.prototype.optionName = 'strokeWidth';
  // StrokeWidth.prototype.useCombobox = true;
  // StrokeWidth.prototype.buttonMode = true;
  // StrokeWidth.prototype.preventHightlight = true;
  StrokeWidth.prototype.useCombobox = false;
  StrokeWidth.prototype.preventHightlight = false;
  StrokeWidth.prototype.buttonMode = false;

  StrokeWidth.prototype.buttonIconClass = 'fa-arrows-h';

  StrokeWidth.prototype._defaultOptions = {
    digitsAfterDecimalPoint: 0
  };

  StrokeWidth.prototype.onSelectionCleared = function (toolbar) {
    this.data = false;
  };

  StrokeWidth.prototype.createControls = function (toolbar) {
    this.createControl(toolbar);
    this._attachEvents();
  };

  /**
   * Get html of control
   * @returns {string} result - html of controls
   * @private
   */
  StrokeWidth.prototype._generateHtml = function () {
    var result,
        selectHtml;

    selectHtml = '' +
        '<select ' +
        'class="editable-canvas-stroke-width-input controls-value-item" ' +
        'name="drawer-size"' +
        'data-name="strokeWidth"' +
        '>' +
        '</select>';

    var optionItemDefaultClasses = 'toolbar-item-wrapper toolbar-item-range editable-canvas-stroke-width hidden',
        optionItemAdditionalClasses = '' +
            (this.buttonMode ? ' toolbar-button-item ' : '') +
            (this.preventHightlight ? ' prevent-highlight ' : ''),
        optionItemClasses = optionItemDefaultClasses + optionItemAdditionalClasses;

    result = '' +
        '<li class="' + optionItemClasses + '">' +
          '<div class="toolbar-item-description">' +
            '<span class="toolbar-label editable-canvas-stroke-width-label">' +
              this.drawer.t('Stroke width:') + ' ' +
            '</span>' +
            '<span class="toolbar-label toolbar-label-indicator editable-canvas-stroke-width-indicator"></span>' + '' +
          '</div>' +
          '<input ' +
            'class="editable-canvas-stroke-width-input controls-value-item" ' +
            'name="drawer-stroke-width"' +
            'data-name="strokeWidth"' +
            'type="range"' +
            'min="1"' +
            'max="50"' +
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
  StrokeWidth.prototype.createControl = function (toolbar) {
    var toolControlHtml = this._generateHtml();
    this.$toolControl = $(toolControlHtml);
    this.$valueIndicator = this.$toolControl.find('.editable-canvas-stroke-width-indicator');
    toolbar.addControl(this.$toolControl, this.options.buttonOrder);
    return this.$toolControl;
  };

  /**
   * Attach events for control element
   * @private
   */
  StrokeWidth.prototype._attachEvents = function () {
    if (this.$toolControl) {
      this.$toolControl.on('input change toolbarOptionChange', this.onInputChange.bind(this));
    }
  };


  /**
   * Validate width value
   * @param rawValue
   * @returns {*}
   */
  StrokeWidth.prototype.validateValue = function (rawValue) {
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
  StrokeWidth.prototype.setStrokeWidth = function (value) {
    value =  parseInt(value, 10);
    var fCanvas = this.drawer.fCanvas,
        target = fCanvas.getActiveObject();
    this.drawer.lineStrokeWidth = value;
    if (target) {
      if (!this.data) {
        this.collectDataFromObject(target);
      }
      target.set('left',this.data.left);
      target.set('top',this.data.top);
      target.set('strokeWidth', parseInt(value, 10));
      fCanvas.renderAll();
    }
  };

  /**
   * This function is called every time user changes width via control
   * @private
   */
  StrokeWidth.prototype.onInputChange = function () {
    var $opacityInput = $(this.$toolControl).find('input'),
        rawValue = $opacityInput.val(),
        validatedValue = this.validateValue(rawValue);
    this.$valueIndicator.text(validatedValue + 'px');
    this.setStrokeWidth(validatedValue);
  };

  StrokeWidth.prototype.collectDataFromObject = function (target) {
    var result = {},
        decimalRatio = Math.pow(10, this.options.digitsAfterDecimalPoint),
        strokeWidth = target.strokeWidth;
    result.strokeWidth = strokeWidth;
    result.top = target.top;
    result.left = target.left;

    this.data = result;
    return result;
  };

  StrokeWidth.prototype.updateControls = function (dataToFill) {
    dataToFill = dataToFill || this.data;
    var rawValue = dataToFill.strokeWidth,
        validatedValue = this.validateValue(rawValue);
    this.drawer.lineStrokeWidth = validatedValue;
    this.$toolControl.find('input').val(validatedValue);
    this.$valueIndicator.text(validatedValue + 'px');
  };

  StrokeWidth.prototype.showControls = function () {
    this.$toolControl.removeClass('hidden');
  };

  StrokeWidth.prototype.hideControls = function (force) {
    this.$toolControl.addClass('hidden');
  };

  pluginsNamespace.StrokeWidth = StrokeWidth;
}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseToolOptions, DrawerJs.util));