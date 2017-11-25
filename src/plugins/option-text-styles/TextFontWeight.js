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

  var TextFontWeight = function TextFontWeightConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);

    // init options
    this._setupOptions(options);
  };

  TextFontWeight.prototype = Object.create(BaseTextOptionTool.prototype);
  TextFontWeight.prototype.constructor = BaseTextOptionTool;


  TextFontWeight.prototype.name = 'TextFontWeight';
  TextFontWeight.prototype.optionName = 'TextFontWeight';
  TextFontWeight.prototype.focusTextOnChange = true;
  TextFontWeight.prototype.onlyPredefined = true;
  TextFontWeight.prototype.buttonIconClass = 'fa-bold';

  TextFontWeight.prototype._defaultOptions = {
    defaultValues: {
      fontWeight: 'normal'
    },
    predefined: {
      fontWeight: ['normal', 'bold', 'light', 100, 200, 300, 400, 500, 600, 700, 800, 900]
    }
  };
  
  TextFontWeight.prototype.controlTemplate = function () {
    var result,
        $predefined,
        selectHtml;

    $predefined = this.options.predefined.fontWeight.map(function (size, i) {
      return '<option value="' + size + '">' + size + '</option>';
    }).join('');

    selectHtml = '' +
        '<select ' +
        'class="editable-canvas-text-fontweight-input controls-value-item" ' +
        'name="drawer-size"' +
        'data-name="fontWeight"' +
        'value="' + this.options.defaultValues.fontWeight + '">' +
        $predefined +
        '</select>';

    var optionItemDefaultClasses = 'toolbar-item-wrapper editable-canvas-text-option editable-canvas-text-fontweight hidden',
        optionItemAdditionalClasses = this.buttonMode ? ' toolbar-button-item ': '',
        optionItemClasses = optionItemDefaultClasses + optionItemAdditionalClasses;

    result = '' +
        '<li class="' + optionItemClasses + '">' +
        '<div class="toolbar-item-description">' +
        '<span class="toolbar-item-label">' +
        this.drawer.t('Font Weight:') + ' ' +
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

  pluginsNamespace.TextFontWeight = TextFontWeight;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));