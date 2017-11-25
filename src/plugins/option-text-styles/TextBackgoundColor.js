(function ($, pluginsNamespace, util, BaseTextOptionTool) {
  'use strict';

  /**
   * Creates controls for changing text background color;
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

  var TextBackgroundColor = function TextBackgroundColorConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);

    // init options
    this._setupOptions(options);

    this.colorControl = new pluginsNamespace.ColorpickerControl(this.drawer, this.options);
  };

  TextBackgroundColor.prototype = Object.create(BaseTextOptionTool.prototype);
  TextBackgroundColor.prototype.constructor = BaseTextOptionTool;

  TextBackgroundColor.prototype.name = 'TextBackgroundColor';
  TextBackgroundColor.prototype.optionName = 'TextBackgroundColor';
  TextBackgroundColor.prototype.focusTextOnChange = true;
  TextBackgroundColor.prototype.useCombobox = false;
  TextBackgroundColor.prototype.buttonMode = false;

  TextBackgroundColor.prototype._defaultOptions = {
    colorText: 'Text background:',
    defaultValues: {
      textBackgroundColor: ''
    },
  };

  TextBackgroundColor.prototype.onlyPredefined = true;
  TextBackgroundColor.prototype.valueType = {
    textBackgroundColor: 'color'
  };

  TextBackgroundColor.prototype.updateSingleControl = function (valueName, value) {
    if (valueName === 'textBackgroundColor') {
      this.colorControl.setColor(value);
    }
  };

  TextBackgroundColor.prototype.getStylesFromControls = function () {};

  TextBackgroundColor.prototype.getStylesFromChangeEvent = function (data) {
    var result;
    if (data) {
      if (typeof data === 'object') {
        result = data.styles;
      }
      if (typeof data === 'string') {
        result = {
          textBackgroundColor: data
        };
      }
    }
    this._lastData = result;
    return result;
  };


  TextBackgroundColor.prototype.setupControl = function (toolbar, $toolControl, changeCallback) {
    this.colorChangeHandler = changeCallback;

    this.$toolControl = this.colorControl.createControl(toolbar,  this.onInputChange.bind(this));
    // cache control components
    this.$toolControl.$colorIndicator = this.$toolControl.find('.color-indicator');
    this.$toolControl.$colorDropdown = this.$toolControl.find('.color-dropdown');

    this.$toolControl.$colorIndicator.attr('data-name', 'textBackgroundColor');
    this.$toolControl.$colorIndicator.addClass('controls-value-item');

    this.$toolControl.addClass('editable-canvas-text-option editable-canvas-text-backgroundcolor');

    this.colorDropdownVisible = false;
  };

  pluginsNamespace.TextBackgroundColor = TextBackgroundColor;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));