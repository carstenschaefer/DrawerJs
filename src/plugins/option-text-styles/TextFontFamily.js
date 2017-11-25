(function ($, pluginsNamespace, util, BaseTextOptionTool) {
  'use strict';

  /**
   * Creates controls for changing font family;
   *
   * @param drawer
   * Instance of drawer
   * @param {Object} options
   * Configuration object.
   * @param {Object} options.fonts
   * Specifies the list of fonts available to select.
   * The format is:
   *
   * <code>
   * <pre class="prettyprint javascript">
   *   {
   *    'Font display name': 'Font-family CSS value'
   *   }
   * </pre>
   * </code>
   *
   * Example:
   *
   * <code>
   * <pre class="prettyprint javascript">
   * fonts: {
   *     'Georgia': 'Georgia, serif',
   *     'Palatino': "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
   *     'Times New Roman': "'Times New Roman', Times, serif"
   * }
   * </pre>
   * </code>
   *
   *
   * @param {String} options.defaultFont
   * Default font display name from <code>fonts</code> config
   * that will be selected when edit mode activates.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   * @augments DrawerJs.plugins.BaseTextOptionTool
   */

  var TextFontFamily = function TextFontFamilyConstructor(drawer, options) {
    BaseTextOptionTool.call(this, drawer);

    this._setupOptions(options);

    this.activeFont = this.options.fonts[this.options.defaultFont];
    this.drawer.on(this.drawer.EVENT_TEXT_GET_STYLES, this._onGetStyles.bind(this));
  };

  TextFontFamily.prototype = Object.create(BaseTextOptionTool.prototype);
  TextFontFamily.prototype.constructor = BaseTextOptionTool;

  TextFontFamily.prototype.name = 'TextFontFamily';
  TextFontFamily.prototype.optionName = 'TextFontFamily';
  TextFontFamily.prototype.buttonIconClass = 'fa-font';
  TextFontFamily.prototype.focusTextOnChange = true;
  TextFontFamily.prototype.onlyPredefined = true;
  TextFontFamily.prototype.valueType = {
    fontFamily: 'string'
  };

  TextFontFamily.prototype._defaultOptions = {
    defaultValues: {
      fontFamily: 'Georgia'
    },
    fonts: {
      'Georgia': 'Georgia, serif',
      'Palatino': "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
      'Times New Roman': "'Times New Roman', Times, serif",

      'Arial': 'Arial, Helvetica, sans-serif',
      'Arial Black': "'Arial Black', Gadget, sans-serif",
      'Comic Sans MS': "'Comic Sans MS', cursive, sans-serif",
      'Impact': 'Impact, Charcoal, sans-serif',
      'Lucida Grande': "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
      'Tahoma': 'Tahoma, Geneva, sans-serif',
      'Trebuchet MS': "'Trebuchet MS', Helvetica, sans-serif",
      'Verdana': 'Verdana, Geneva, sans-serif',

      'Courier New': "'Courier New', Courier, monospace",
      'Lucida Console': "'Lucida Console', Monaco, monospace"
    },
    defaultFont: 'Georgia'
  };

  TextFontFamily.prototype.changeFont = function (fontFamilyName, withoutSetStyles) {
    var _this = this;

    _this.activeFont = _this.options.fonts[fontFamilyName];

    if (!withoutSetStyles) {
      _this.setStyles({
        fontFamily: _this.activeFont
      });
    }

    _this.$toolControl.find('.editable-canvas-fontfamily').css('font-family', _this.activeFont);
    _this.$toolControl.find('.editable-canvas-fontfamily').text(fontFamilyName || '');
    _this.$toolControl.find('.fonts-dropdown').addClass('hidden');
  };

  TextFontFamily.prototype.updateSingleControl = function (valueName, value) {
    if (valueName === 'fontFamily') {
        var font = this.getFontByCss(value);
        this.changeFont(font, true);
    }
  };

  TextFontFamily.prototype._collectDefaultOptions = function (pluginName) {
    var textConfig = this.drawer.getPluginConfig('Text'),
        result = {
          fonts: $.extend(true, {}, textConfig.fonts || {}),
          defaultFont: textConfig.defaultFont
        };
    return result;
  };

  TextFontFamily.prototype._onGetStyles = function (fEvent, tool, result) {
    result = result || {};
    result.defaultValues =  result.defaultValues || {};
    result.defaultValues.fontFamily = this.options.fonts[this.options.defaultFont];
  };

  /**
   * Get font family from css string
   * @param {string} fontCssString
   * @returns {*}
   */
  TextFontFamily.prototype.getFontByCss = function (fontCssString) {
    var fName = null;
    $.each(this.options.fonts, function (fontName, fontCss) {
      if (fontCss == fontCssString) {
        fName = fontName;
      }
    });
    return fName;
  };

  TextFontFamily.prototype.setupControl = function (toolbar, $toolControl, changeCallback) {
    var _this = this;
    util.bindClick(
        $toolControl.find('.toolbar-label'), 'fontFamily',
        function () {
          $toolControl.find('.fonts-dropdown').toggleClass('hidden');
        });

    //
    $toolControl.find('li a').each(function (i, fontItem) {
      var $fontItem = $(fontItem);
      util.bindClick($fontItem, 'fontFamily',
          function () {
            var fname = $(this).data('fontName');
            _this.changeFont(fname);
          });
    });
  };

  TextFontFamily.prototype.controlTemplate = function () {
    var result,
        $predefined = '',
        selectHtml;

    $.each(this.options.fonts, function (fontName, fontCss) {
      var fontItem = '' +
      '<option ' +
        'style="font-family: ' + fontCss + ';"' +
        'value="' + fontName + '"' +
        'data-font-name="' + fontName + '">' +
          fontName +
      '</option>';

      $predefined += fontItem;
    });

    selectHtml = '' +
        '<select ' +
          'class="editable-canvas-text-fontfamily-input controls-value-item" ' +
          'name="drawer-size"' +
          'data-name="fontFamily"' +
          'value="' + this.options.defaultValues.fontFamily + '">' +
            $predefined +
        '</select>';

    var optionItemDefaultClasses = 'toolbar-item-wrapper editable-canvas-text-option editable-canvas-text-fontfamily hidden',
        optionItemAdditionalClasses = this.buttonMode ? ' toolbar-button-item ': '',
        optionItemClasses = optionItemDefaultClasses + optionItemAdditionalClasses;

    result = '' +
        '<li class="' + optionItemClasses + '">' +
        '<div class="toolbar-item-description">' +
        '<span class="toolbar-item-label">' +
        this.drawer.t('Font family:') + ' ' +
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

  pluginsNamespace.TextFontFamily = TextFontFamily;
}(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.plugins.BaseTextOptionTool));