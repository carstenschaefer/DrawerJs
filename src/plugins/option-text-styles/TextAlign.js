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

  var TextAlign = function TextAlignConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);

    // init options
    this._setupOptions(options);
  };

  TextAlign.prototype = Object.create(BaseTextOptionTool.prototype);
  TextAlign.prototype.constructor = BaseTextOptionTool;

  TextAlign.prototype.name = 'TextAlign';
  TextAlign.prototype.optionName = 'TextAlign';
  TextAlign.prototype.useCombobox = true;
  TextAlign.prototype.buttonMode = true;
  TextAlign.prototype.focusTextOnChange = true;
  TextAlign.prototype.preventHightlight = true;
  TextAlign.prototype.showOnEditMode = false;
  TextAlign.prototype.hideOnEditMode = true;
  TextAlign.prototype.stylesToObject = true;
  TextAlign.prototype.onlyPredefined = true;
  TextAlign.prototype.buttonIconClass = 'fa-align-left';

  TextAlign.prototype.valueType = {
    textAlign: 'string'
  };

  TextAlign.prototype._defaultOptions = {
    defaultValues: {
      textAlign: "left"
    },
    predefined: {
      textAlign: ["left", "center", "right", "justify"]
    },
    valueMap: {
      left: {
        value: 'left',
        classString: 'fa fa-align-left'
      },
      center: {
        value: 'center',
        classString: 'fa fa-align-center'
      },
      right: {
        value: 'right',
        classString: 'fa fa-align-right'
      },
      justify: {
        value: 'justify',
        classString: 'fa fa-align-justify'
      }
    }
  };
  
  TextAlign.prototype.controlTemplate = function () {
    var result,
        $predefined,
        selectHtml;

    $predefined = this.options.predefined.textAlign.map(function (size, i) {
      return '<option value="' + size + '">' + size + '</option>';
    }).join('');

    selectHtml = '' +
        '<select ' +
        'class="editable-canvas-text-textalign-input controls-value-item" ' +
        'name="drawer-size"' +
        'data-name="textAlign"' +
        'value="' + this.options.defaultValues.textAlign + '">' +
        $predefined +
        '</select>';

    var optionItemDefaultClasses = 'toolbar-item-wrapper editable-canvas-text-option editable-canvas-text-textalign hidden',
        optionItemAdditionalClasses = ''+
            (this.buttonMode ? ' toolbar-button-item ': '') +
            (this.preventHightlight ? ' prevent-highlight ': ''),
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

  pluginsNamespace.TextAlign = TextAlign;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));