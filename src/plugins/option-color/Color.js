(function ($, pluginsNamespace, BaseToolOptions, util) {
  'use strict';

  /**
   * Provides color input
   * for changing shapes/brush color.
   *
   * @param {DrawerJs.Drawer} drawer
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} options
   * Configuration object.
   *
   * @param {String[]} options.colors
   * Array of colors to be used.
   *
   * @param {number} options.colorsInRow
   * Number of colors for one row.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   * @extends {DrawerJs.plugins.BaseToolOptions}
   */
  var ColorTool = function ColorToolConstructor(drawer, options) {
      // call super c-tor
      BaseToolOptions.call(this, drawer);
    this._setupOptions(options);

    /**
     * Instance of ColorpickerControl
     * @type {DrawerJs.plugins.ColorpickerControl}
     */
      this.colorControl = new pluginsNamespace.ColorpickerControl(this.drawer, this.options);
    /**
     * Instance of OpacityControl
     * @type {DrawerJs.plugins.OpacityControl}
     */
      this.opacityControl = new pluginsNamespace.OpacityControl(this.drawer, this.options);
    };

    ColorTool.prototype = Object.create(BaseToolOptions.prototype);
    ColorTool.prototype.constructor = BaseToolOptions;

  ColorTool.prototype.optionName = 'color';

  ColorTool.prototype._defaultOptions = {
    showOpacityControl: false,
    alwaysVisible: true,
    colorText: 'Fill:'
  };
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Creates controls
   * @param  {DrawerToolbar} toolbar
   */
  ColorTool.prototype.createControls = function(toolbar) {
    this.colorControl.createControl(toolbar,  this._onColorSelected.bind(this));
    this.opacityControl.createControl(toolbar,  this._onOpacityControlChanged.bind(this));
  };


  /**
   * This function is called everytime user clicks on color from color-dropdown
   * menu.
   *
   * @param {String} selectedColor Hash value of user selected color.
   */
  ColorTool.prototype._onColorSelected = function (selectedColor) {
    if (selectedColor == 'transparent') {
      var opacity = this.opacityControl.getOpacity();
      var colorWithAlfaRgba = this._hexToRgba(selectedColor, opacity);
  
      this.drawer.setColor(colorWithAlfaRgba); 
    } else {
      this.drawer.setColor(selectedColor);
    }
  };


  /**
   * This function is called every time user clicks on color from color-dropdown
   * menu.
   *
   * @param {String} opacity Hash value of user selected color.
   */
  ColorTool.prototype._onOpacityControlChanged = function (opacity) {
    var currentColor = this.drawer.activeColor;
    var colorWithAlfaRgba = this._hexToRgba(currentColor, opacity);

    this.drawer.setColor(colorWithAlfaRgba);
  };


  /**
   * React on object selection - update controls
   * Is called from BaseOptionTool._onObjectSelected method
   *
   * @param  {fabric.Object} target
   */
  ColorTool.prototype.updateControlsFromObject = function (target) {
      var color = null;

      // get object color
      if (target.path) { // free drawing shape
        // @todo: rework in target.getColor()
        color = target.get('stroke');
        this.colorControl.disableTransparent();
      }  else {
        color = target.get('fill');
        this.colorControl.enableTransparent();
      }

      // update color and opacity controls
      if (color) {
        this.updateControlsWithColor(color);
        this.drawer.activeColor = color;
      }
  };


  /**
   * Updates color and opacity controls with color
   * @param  {String} color
   */
  ColorTool.prototype.updateControlsWithColor = function(color) {
        // update color control
        this.colorControl.setColor(color);

        // update opacity control
        var fColor = new fabric.Color(color);
        var source = fColor._source;
        var opacity = source[3];
        this.opacityControl.setOpacity(opacity);
  };


  /**
   * Show color control and optionally - opacity control
   * @param  {Boolean} [withoutOpacity]
   */
  ColorTool.prototype.showControls = function (withoutOpacity) {
    withoutOpacity = withoutOpacity !== undefined ? withoutOpacity : !this.options.showOpacityControl;
      this.colorControl.showControls();
      if (withoutOpacity) {
        this.opacityControl.hideControls();
      } else {
        this.opacityControl.showControls();
      }
  };


  /**
   * Hides both controls
   */
  ColorTool.prototype.hideControls = function (force) {
    var alwaysVisible = this.drawer.options.toolbars.popupButtonAlwaysVisible || this.options.alwaysVisible;
    if (force || !alwaysVisible) {
      this.colorControl.hideControls();
      this.opacityControl.hideControls();
    }
  };


  /**
   * Adds opacity to color in hex form, returns rgba
   * @param  {String} colorHex color in hex format
   * @param  {Number} opacity  opacity 0..1
   * @return {String}          color in rgba format
   */
  ColorTool.prototype._hexToRgba = function(colorHex, opacity) {
    var colorWithAlfa = new fabric.Color(colorHex);
    colorWithAlfa._source[3] =  opacity;

    return colorWithAlfa.toRgba();
  };


  pluginsNamespace.Color = ColorTool;

}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseToolOptions, DrawerJs.util));
