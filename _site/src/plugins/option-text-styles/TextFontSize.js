(function ($, pluginsNamespace, util, BaseTextOptionTool) {
  'use strict';

  /**
   * Creates controls for changing font size of text;
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

  var TextFontSize = function TextFontSizeConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);

    this._setupOptions(options);
  };

  TextFontSize.prototype = Object.create(BaseTextOptionTool.prototype);
  TextFontSize.prototype.constructor = BaseTextOptionTool;

  TextFontSize.prototype.name = 'TextFontSize';
  TextFontSize.prototype.optionName = 'TextFontSize';
  TextFontSize.prototype.buttonIconClass = 'fa-text-height';

  TextFontSize.prototype.valueType = {
    fontSize: 'number'
  };

  TextFontSize.prototype._defaultOptions = {
    defaultValues: {
      fontSize: 48
    },
    predefined: {
      fontSize: [6, 12, 14, 16, 20, 24, 32, 40, 48, 72]
    }
  };

  TextFontSize.prototype.controlTemplate = function () {
    var result,
        $predefined,
        selectHtml;

    $predefined = this.options.predefined.fontSize.map(function (size, i) {
      return '<option value="' + size + '">' + size + '</option>';
    }).join('');

    selectHtml = '' +
        '<select ' +
          'class="editable-canvas-text-fontsize-input controls-value-item" ' +
          'name="drawer-size"' +
          'data-name="fontSize"' +
          'value="' + this.options.defaultValues.fontSize + '">' +
            $predefined +
        '</select>';

      var optionItemDefaultClasses = 'toolbar-item-wrapper editable-canvas-text-option editable-canvas-text-fontsize hidden',
          optionItemAdditionalClasses = this.buttonMode ? ' toolbar-button-item ': '',
          optionItemClasses = optionItemDefaultClasses + optionItemAdditionalClasses;

      result = '' +
          '<li class="' + optionItemClasses + '">' +
              '<div class="toolbar-item-description">' +
                '<span class="toolbar-item-label">' +
                this.drawer.t('Font size:') + ' ' +
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

  pluginsNamespace.TextFontSize = TextFontSize;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));