(function ($, pluginsNamespace, util, BaseTextOptionTool) {
  'use strict';

  /**
   * Creates controls for changing font style of text;
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

  var TextFontStyle = function TextFontStyleConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);

    // init options
    this._setupOptions(options);
  };

  TextFontStyle.prototype = Object.create(BaseTextOptionTool.prototype);
  TextFontStyle.prototype.constructor = BaseTextOptionTool;

  TextFontStyle.prototype.name = 'TextFontStyle';
  TextFontStyle.prototype.optionName = 'TextFontStyle';
  TextFontStyle.prototype.onlyPredefined = true;
  TextFontStyle.prototype.focusTextOnChange = true;
  TextFontStyle.prototype.buttonIconClass = 'fa-italic';
  TextFontStyle.prototype.valueType = {
    fontStyle: 'string'
  };

  TextFontStyle.prototype._defaultOptions = {
    defaultValues: {
      fontStyle: ''
    },
    predefined: {
      fontStyle: ["normal", "italic", "oblique"]
    }
  };
  
  TextFontStyle.prototype.controlTemplate = function () {
    var result,
        $predefined,
        selectHtml;

    $predefined = this.options.predefined.fontStyle.map(function (size, i) {
      return '<option value="' + size + '">' + size + '</option>';
    }).join('');

    selectHtml = '' +
        '<select ' +
        'class="editable-canvas-text-fontstyle-input controls-value-item" ' +
        'name="drawer-size"' +
        'data-name="fontStyle"' +
        'value="' + this.options.defaultValues.fontStyle + '">' +
        $predefined +
        '</select>';

    var optionItemDefaultClasses = 'toolbar-item-wrapper editable-canvas-text-option editable-canvas-text-fontstyle hidden',
        optionItemAdditionalClasses = this.buttonMode ? ' toolbar-button-item ': '',
        optionItemClasses = optionItemDefaultClasses + optionItemAdditionalClasses;

    result = '' +
        '<li class="' + optionItemClasses + '">' +
        '<div class="toolbar-item-description">' +
        '<span class="toolbar-item-label">' +
        this.drawer.t('Font style:') + ' ' +
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

  pluginsNamespace.TextFontStyle = TextFontStyle;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));