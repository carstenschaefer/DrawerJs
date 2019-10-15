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
      
    /**
     * Variable to save color used before switching to transparent
     */
      this.transparentSaveColor = null;
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
    if (selectedColor == "rgba(0, 0, 0, 0)") {
      //selected transparent color
      this.saveColor();
    }
    this.drawer.setColor(selectedColor);
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
        this.restoreColor();
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
   * Shows / hides transparency based on current selected tool
   * @param {BaseTool} tool
   */
  ColorTool.prototype.onActivateTool = function (tool) {
      if (tool instanceof pluginsNamespace.Line ||
          tool instanceof pluginsNamespace.ArrowOneSide ||
          tool instanceof pluginsNamespace.ArrowTwoSide ||
          tool instanceof pluginsNamespace.Pencil) {
        //no transparent for them
        this.colorControl.disableTransparent();
        this.restoreColor();
      } else {
        //should be save to activate
        this.colorControl.enableTransparent();
      }
  };
  
  /**
   * Save current color into transparentSaveColor
   */
  ColorTool.prototype.saveColor = function () {
    console.log("saving");
    if(!this.transparentSaveColor) {
      console.log("saving1");
      this.transparentSaveColor = this.drawer.activeColor;
    }
  };
  
  /**
   * Load color from transparentSaveColor
   */
  ColorTool.prototype.restoreColor = function () {
    console.log("restoring");
    if(this.transparentSaveColor) {
      console.log("restoring1");
      this._onColorSelected(this.transparentSaveColor);
      this.colorControl.setColor(this.transparentSaveColor);
      this.transparentSaveColor = null;
    }
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
