(function ($, pluginsNamespace, BaseToolOptions, util) {
  'use strict';

  /**
   * Provides opacity input for changing shapes/brush opacity.
   *
   * @param {DrawerJs.Drawer} drawer
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} options - Configuration object
   * @param {Number} options.defaultValue - Default opacity value
   *
   *
   * @constructor
   * @memberof DrawerJs.options
   * @extends {DrawerJs.plugins.BaseToolOptions}
   */
  var OpacityOption = function OpacityOptionConstructor(drawer, options) {
    // call super c-tor
    BaseToolOptions.call(this, drawer);
    this._setupOptions(options);
  };

  OpacityOption.prototype = Object.create(BaseToolOptions.prototype);
  OpacityOption.prototype.constructor = BaseToolOptions;

  OpacityOption.prototype.optionName = 'opacity';


  OpacityOption.prototype._defaultOptions = {
    defaultValue: 1,
    alwaysVisible: true
  };

  OpacityOption.prototype.createControls = function (toolbar) {
    this.createControl(toolbar, this.setOpacity.bind(this));
  };

  /**
   * Create controls.
   * @param {DrawerToolbar} toolbar
   * @param {Function} [opacityChangeCallback]
   * @returns {jQuery}
   */
  OpacityOption.prototype.createControl = function (toolbar, opacityChangeCallback) {
    this.toolbar = toolbar;
    this.opacityChangeCallback = opacityChangeCallback;

    this.$opacityControl = $(
        '<li class="editable-canvas-opacity-option toolbar-item-range">' +
          '<div class="toolbar-item-description">' +
            '<span class="toolbar-label editable-canvas-opacity-option-label">' +
            this.drawer.t('Opacity :') + ' ' +
            '</span>' +
            '<span class="toolbar-label toolbar-label-indicator editable-canvas-opacity-option-indicator">' +
              '100%' +
            '</span>' +
          '</div>' +
        '<input class="editable-canvas-opacity-option-input" ' +
        'type="range" name="drawer-size" min="0" max="100"' +
        'value="100" />' +
        '</li>');

    this.$opacityIndicator = this.$opacityControl.find('.editable-canvas-opacity-option-indicator');
    toolbar.addControl(this.$opacityControl, this.options.buttonOrder);
    this.$opacityControl.on('change', this._onOpacityChange.bind(this));
    return this.$opacityControl;
  };


  /**
   * Set opacity value
   * @private
   */
  OpacityOption.prototype.setOpacity = function (value) {
    var fCanvas = this.drawer.fCanvas,
        activeFabricObject = fCanvas.getActiveObject();

    this.drawer.setOpacity(value);
    if (activeFabricObject) {
      activeFabricObject.setOpacity(value);
      fCanvas.renderAll();
    }
  };

  /**
   * This function is called every time user changes opacity via control
   * @private
   */
  OpacityOption.prototype._onOpacityChange = function () {
    var $opacityInput = $(this.$opacityControl).find('input'),
        rawValue = parseInt($opacityInput.val(), 10),
        rawValueIsValid = typeof rawValue === 'number' && isFinite(rawValue),
        validatedValue = rawValueIsValid ? rawValue : this.options.defaultOpacity,
        formattedValue = parseInt(validatedValue, 10) + '%';
    this._opacity = validatedValue / 100;

    this.$opacityIndicator.text(formattedValue);

    if (this.opacityChangeCallback) {
      this.opacityChangeCallback(this._opacity);
    }
  };

  OpacityOption.prototype.collectDataFromObject = function (target) {
    var result = {};
    result.opacity = target.get('opacity');
    this.data = result;
    return result;
  };

  OpacityOption.prototype.updateControls = function (dataToFill) {
    dataToFill = dataToFill || this.data;

    var rawValue = dataToFill.opacity,
        rawValueIsValid = typeof rawValue === 'number' && isFinite(rawValue),
        validatedValue = rawValueIsValid ? rawValue : this.options.defaultOpacity,
        formattedValue = parseInt(validatedValue*100, 10) + '%';
    this.drawer.activeOpacity = validatedValue;
    this.$opacityControl.find('input').val(validatedValue*100);
    this.$opacityControl.find('.editable-canvas-opacity-option-indicator').text(formattedValue);
  };

  OpacityOption.prototype.showControls = function () {
    this.$opacityControl.removeClass('hidden');
  };

  OpacityOption.prototype.hideControls = function (force) {
    var alwaysVisible = this.drawer.options.toolbars.popupButtonAlwaysVisible || this.options.alwaysVisible;
    if (force || !alwaysVisible) {
      this.$opacityControl.addClass('hidden');
    }
  };

  pluginsNamespace.OpacityOption = OpacityOption;

}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseToolOptions, DrawerJs.util));
