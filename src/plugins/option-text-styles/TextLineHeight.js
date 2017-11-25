(function ($, pluginsNamespace, util, BaseTextOptionTool) {
  'use strict';

  var classicDefaultValue = 1.16, // Standard value of line height
      fabricDefaultLineHeight = fabric.Text.prototype.lineHeight || classicDefaultValue;

  /**
   * Creates controls for changing line height;
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

  var TextLineHeight = function TextLineHeightConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);

    this._setupOptions(options);
  };

  TextLineHeight.prototype = Object.create(BaseTextOptionTool.prototype);
  TextLineHeight.prototype.constructor = BaseTextOptionTool;

  TextLineHeight.prototype.name = 'TextLineHeight';
  TextLineHeight.prototype.optionName = 'TextLineHeight';
  TextLineHeight.prototype.showOnEditMode = false;
  TextLineHeight.prototype.hideOnEditMode = true;
  TextLineHeight.prototype.stylesToObject = true;
  TextLineHeight.prototype.preventHightlight = true;
  TextLineHeight.prototype.buttonIconClass = 'fa-arrows-v';
  TextLineHeight.prototype.onlyPredefined = true;

  TextLineHeight.prototype.valueType = {
    lineHeight: 'number'
  };

  TextLineHeight.prototype._defaultOptions = {
    defaultValues: {
      lineHeight: fabricDefaultLineHeight
    },
    predefined: {
      lineHeight: [1, 1.16, 1.25, 1.5, 1.75, 2, 3]
    }
  };

  TextLineHeight.prototype.collectDataFromObject = function (tool) {
    var result = {
      lineHeight: tool.lineHeight
    };
    this._lastData = this._lastData || {};
    $.extend(true, this._lastData, result);
    return result;
  };

  TextLineHeight.prototype.controlTemplate = function () {
    var result,
        $predefined,
        selectHtml;

    $predefined = this.options.predefined.lineHeight.map(function (size, i) {
      var sizeInPercent = parseInt(Math.round(size * 100), 10);
      return '<option value="' + size + '">' + sizeInPercent + '%' + '</option>';
    }).join('');

    selectHtml = '' +
        '<select ' +
        'class="editable-canvas-text-lineheight-input controls-value-item" ' +
        'name="drawer-size"' +
        'data-name="lineHeight"' +
        'value="' + this.options.defaultValues.lineHeight + '">' +
        $predefined +
        '</select>';

    var optionItemDefaultClasses = 'toolbar-item-wrapper editable-canvas-text-option editable-canvas-text-lineheight hidden',
        optionItemAdditionalClasses = '' +
            (this.buttonMode ? ' toolbar-button-item ': '') +
            (this.preventHightlight ? ' prevent-highlight ': ''),
        optionItemClasses = optionItemDefaultClasses + optionItemAdditionalClasses;

    result = '' +
        '<li class="' + optionItemClasses + '">' +
        '<div class="toolbar-item-description">' +
        '<span class="toolbar-item-label">' +
        this.drawer.t('Line height:') + ' ' +
        '</span>' +
        '<span class="toolbar-item-valueholder"></span>' +
        '<span class="toolbar-item-icon fa ' + this.buttonIconClass + '"></span>' +
        '</div>' +
        '<div class="toolbar-dropdown-block collapsed">' +
        selectHtml +
        '</div>' +
        '</li>';

    return result;
  };

  pluginsNamespace.TextLineHeight = TextLineHeight;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));