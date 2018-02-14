(function ($, pluginsNamespace, util) {
  'use strict';

  /**
   * Creates color input for changing color; colorChangeHandler is called on color change.
   *
   * @param {Object} options
   * Configuration object.
   *
   * @param {callback} colorChangeHandler will be called  with new color as parameter
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var OpacityControl = function OpacityControlConstructor(drawer, options) {
      /**
       * @type {Drawer}
       */
      this.drawer = drawer;

      // init options
      this.options = $.extend(true, {}, this._defaultOptions || {}, options || {});

      this._opacity = this.options.defaultOpacity;
      this.drawer.on(this.drawer.AFTER_CREATE_TOOLBARS, this._moveControlToEnd.bind(this));
    };


  OpacityControl.prototype._defaultOptions = {
    defaultOpacity : 1
  };


  /**
   * Removes tool
   */
  OpacityControl.prototype.remove = function () {
    if (this.$opacityControl) {
      this.$opacityControl.remove();
    }
  };

  /**
   * Move opacity control to the end of toolbar for popup
   * @private
   */
  OpacityControl.prototype._moveControlToEnd = function () {
    var needToMove = this.toolbar.options.compactType === 'popup';
    if (needToMove) {
      var $toolbar = this.$opacityControl.parent();
      $toolbar.append(this.$opacityControl);
    }
  };

  /**
   * Hides controls
   */
  OpacityControl.prototype.hideControls = function () {
    if (this.$opacityControl) {
      this.$opacityControl.addClass('hidden');
    }
  };


  /**
   * Shows controls
   */
  OpacityControl.prototype.showControls = function () {
    if (this.$opacityControl) {
      this.$opacityControl.removeClass('hidden');
    }
  };


  /**
   * Returns current opacity
   * @return {Number} current opacity - number from 0 to 1
   */
  OpacityControl.prototype.getOpacity = function () {
      return this._opacity;
  };


  /**
   * Sets current opacity and updated tool control.
   * @param {Number} opacity number from 0 to 1
   */
  OpacityControl.prototype.setOpacity = function (opacity) {
      this._opacity = opacity;

      this.$opacityControl.find('input').val(opacity * 100 );
      this.$opacityControl.find('.editable-canvas-opacity-indicator').text(opacity * 100 + '%');
    };


  /**
   * This function is called every time user clicks on color from color-dropdown
   * menu.
   *
   * @param {String} selectedColor Hash value of user selected color.
   */
  OpacityControl.prototype.onOpacityChange = function () {
    var $opacityInput = $(this.$opacityControl).find('input'),
        rawValue = parseInt($opacityInput.val(), 10),
        rawValueIsValid = typeof rawValue === 'number' &&  isFinite(rawValue),
        validatedValue = rawValueIsValid ? rawValue : this.options.defaultOpacity,
        formattedValue = parseInt(validatedValue, 10) + '%';
    this._opacity = validatedValue / 100;

    this.$opacityIndicator.text(formattedValue);

    if (this.opacityChangeCallback) {
      this.opacityChangeCallback(this._opacity);
    }
  };


  /**
   * Create controls.
   * @param  {DrawerToolbar} toolbar to add control to
   */
  OpacityControl.prototype.createControl = function (toolbar, opacityChangeCallback) {
    var self = this;
    this.toolbar = toolbar;
    this.opacityChangeCallback = opacityChangeCallback;

    this.$opacityControl = $(
      '<li class="editable-canvas-opacity toolbar-item-range">' +
        '<div class="toolbar-item-description">' +
          '<span class="toolbar-label editable-canvas-opacity-label">' +
          this.drawer.t('Fill opacity:') + ' ' +
          '</span>' +
          '<span class="toolbar-label toolbar-label-indicator editable-canvas-opacity-indicator">' +
            '100%' +
          '</span>' +
      '</div>' +
        '<input class="editable-canvas-opacity-input" ' +
               'type="range" name="drawer-size" min="0" max="100"' +
               'value="100" />' +
        '</li>');

    this.$opacityIndicator = this.$opacityControl.find('.editable-canvas-opacity-indicator');

    toolbar.addControl(this.$opacityControl, this.options.buttonOrder);

    $(this.$opacityControl).on('change', this.onOpacityChange.bind(this));

    return this.$opacityControl;
  };


  OpacityControl.prototype.showControls = function() {
      // this.updateControl();
      this.$opacityControl.show();
  };


  OpacityControl.prototype.hideControls = function() {
      this.$opacityControl.hide();
  };


  // OpacityControl.prototype.updateControl = function () {
  //   var opactity = .5;
  //   this.setBrushSize

  // };

  pluginsNamespace.OpacityControl = OpacityControl;

}(jQuery, DrawerJs.plugins, DrawerJs.util));
