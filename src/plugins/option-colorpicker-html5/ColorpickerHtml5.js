(function ($, pluginsNamespace) {
  /**
   * Provides html5 color input for changing shapes/freedrawing brush color.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var ColorpickerHtml5 = function ColorpickerHtml5Constructor(drawerInstance) {
    var _this = this;
    this.drawerInstance = drawerInstance;
    this.name = 'BrushSize';

    drawerInstance.on(drawerInstance.EVENT_OPTIONS_TOOLBAR_CREATED,
      function (e, toolbar) {
        _this.createColorControl(toolbar);
      });
  };

  /**
   * Create control and append it to toolbar
   * @param  {DrawerToolbar} toolbar to add control to
   */
  ColorpickerHtml5.prototype.createColorControl = function (toolbar) {
    var _this = this;

    var colorButton = $(
      '<li class="editable-canvas-plugin-color"' +
        'data-editable-canvas-sizeable="toolbar-button" ' +
        'data-editable-canvas-cssrules="height">' +
      '<span class="toolbar-label"' +
        'data-editable-canvas-sizeable="toolbar-button" ' +
        'data-editable-canvas-cssrules="height,line-height">Color: </span>' +
      '<input class="editable-canvas-colorpicker" type="color" ' +
        'value="' + this.drawerInstance.activeColor + '" ' +
        'data-editable-canvas-sizeable="toolbar-button" ' +
        'data-editable-canvas-cssrules="height,width"/>' +
      '</li>');

    toolbar.addControl(colorButton, this.options.buttonOrder);

    var colorChangeHandler = function (event) {
      if (!event) {
        return;
      }

      var color = event.target.value;

      _this.drawerInstance.setColor(color);
    };

    colorButton.find('input').change(colorChangeHandler);
  };

  pluginsNamespace.ColorpickerHtml5 = ColorpickerHtml5;

}(jQuery, DrawerJs.plugins));
