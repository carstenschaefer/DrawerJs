(function ($, pluginsNamespace, util, BaseTextOptionTool) {
  'use strict';

  /**
   * Creates controls for changing text color;
   *
   * @param drawer
   * Instance of drawer
   * @param {Object} options
   * Configuration object.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   * @augments DrawerJs.plugins.BaseTextOptionTool
   */

  var TextColor = function TextColorConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);

    // init options
    this._setupOptions(options);
    this.colorControl = new pluginsNamespace.ColorpickerControl(this.drawer, this.options);
  };

  TextColor.prototype = Object.create(BaseTextOptionTool.prototype);
  TextColor.prototype.constructor = BaseTextOptionTool;

  TextColor.prototype.name = 'TextColor';
  TextColor.prototype.optionName = 'TextColor';
  TextColor.prototype.focusTextOnChange = true;
  TextColor.prototype.onlyPredefined = true;

  TextColor.prototype._defaultOptions = {
    colorText: 'Font color:',
    defaultValues: {
      fill: ''
    },
  };

  TextColor.prototype.valueType = {
    fill: 'color'
  };

  TextColor.prototype.updateSingleControl = function (valueName, value) {
    if (valueName === 'fill') {
      this.colorControl.setColor(value);
    }
  };

  TextColor.prototype.getStylesFromControls = function () {};

  TextColor.prototype.getStylesFromChangeEvent = function (data) {
    var result;
    if (data) {
      if (typeof data === 'object') {
        result = data.styles;
      }
      if (typeof data === 'string') {
        result = {
          fill: data
        };
      }
    }
    this._lastData = result;
    return result;
  };

  TextColor.prototype.setupControl = function (toolbar, $toolControl, changeCallback) {
    this.colorChangeHandler = changeCallback;

    this.$toolControl = this.colorControl.createControl(toolbar,  this.onInputChange.bind(this));
    // cache control components
    this.$toolControl.$colorIndicator = this.$toolControl.find('.color-indicator');
    this.$toolControl.$colorDropdown = this.$toolControl.find('.color-dropdown');

    this.$toolControl.$colorIndicator.attr('data-name', 'fill');
    this.$toolControl.$colorIndicator.addClass('controls-value-item');

    this.$toolControl.addClass('editable-canvas-text-option editable-canvas-text-color');

    this.colorDropdownVisible = false;
  };

  pluginsNamespace.TextColor = TextColor;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));