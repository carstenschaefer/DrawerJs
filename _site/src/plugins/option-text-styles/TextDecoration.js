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

  var TextDecoration = function TextDecorationConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);
    this._setupOptions(options);
  };

  TextDecoration.prototype = Object.create(BaseTextOptionTool.prototype);
  TextDecoration.prototype.constructor = BaseTextOptionTool;

  TextDecoration.prototype.name = 'TextDecoration';
  TextDecoration.prototype.optionName = 'TextDecoration';
  TextDecoration.prototype.focusTextOnChange = true;
  TextDecoration.prototype.onlyPredefined = true;
  /**
   * @default
   * @const
   * @override
   * @type {string}
   */
  TextDecoration.prototype.buttonIconClass = 'fa-strikethrough';
  TextDecoration.prototype.valueType = {
    textDecoration: 'string'
  };

  /**
   * @type {object}
   * @private
   */
  TextDecoration.prototype._defaultOptions = {
    defaultValues: {
      textDecoration: ''
    },
    predefined:{
      textDecoration: ["underline", "overline", "line-through"]
    }
  };
  
  TextDecoration.prototype.controlTemplate = function () {
    var result,
        $predefined,
        selectHtml;

    $predefined = this.options.predefined.textDecoration.map(function (size, i) {
      return '<option value="' + size + '">' + size + '</option>';
    }).join('');

    selectHtml = '' +
        '<select ' +
        'class="editable-canvas-text-decoration-input controls-value-item" ' +
        'name="drawer-size"' +
        'data-name="textDecoration"' +
        'value="' + this.options.defaultValues.textDecoration + '">' +
        $predefined +
        '</select>';

    var optionItemDefaultClasses = 'toolbar-item-wrapper editable-canvas-text-option editable-canvas-text-decoration hidden',
        optionItemAdditionalClasses = this.buttonMode ? ' toolbar-button-item ': '',
        optionItemClasses = optionItemDefaultClasses + optionItemAdditionalClasses;

    result = '' +
        '<li class="' + optionItemClasses + '">' +
        '<div class="toolbar-item-description">' +
        '<span class="toolbar-item-label">' +
        this.drawer.t('Text Decoration:') + ' ' +
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

  pluginsNamespace.TextDecoration = TextDecoration;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));