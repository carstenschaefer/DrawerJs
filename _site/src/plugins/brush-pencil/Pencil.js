(function ($, BaseBrush, pluginsNamespace, util) {
  'use strict';

  /**
   * Provides a pencil button which activates free drawing mode.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} options
   * Configuration object.
   *
   * @param {String} options.cursorUrl
   * Custom CSS url for pencil cursor.
   *
   * 'pencil' value could be specified: in this case built-in
   * pencil cursor will be user which is located in
   * <code>assets/cursor-fa-pencil.cur</code>
   *
   * Example:
   * <code><pre>url(path/to/cursor.cur), default</pre></code>
   *
   * Note the word 'default' at the end: that is the name of cursor that will
   * be used when url is unavailable.
   *
   * More information about css cursor property could be found here:
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor}
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/cursor}
   *
   * @param {Number} options.brushSize
   * Default brush size.
   *
   * @memberof DrawerJs.plugins
   *
   * @constructor
   * @augments DrawerJs.plugins.BaseBrush
   */
  var Pencil = function (drawerInstance, options) {
    var _this = this;

    BaseBrush.call(_this, drawerInstance);

    this.name = 'Pencil';

    /**
     * List of tool options to show when tool is activated.
     * Deviating from BaseShape tool, Line has no 'color', only 'border'.
     * @type {String[]}
     */
    this.toolOptionsList = ['color', 'opacity', 'brushSize'];

    this.btnClass = 'btn-pencil';
    this.faClass = 'fa-pencil';
    this.tooltip = drawerInstance.t('Free drawing mode');

    _this._defaultOptions = {
      cursorUrl: 'pencil',
      brushSize: 2
    };

    this._setupOptions(options);

    if (_this.options.cursorUrl == 'pencil') {
      var drawerFolderUrl = util.getDrawerFolderUrl();
      if(drawerFolderUrl){
        _this.options.cursorUrl = 'url(' + drawerFolderUrl +
        'assets/cursor-fa-pencil.cur), default';
      }
    }
  };

  Pencil.prototype = Object.create(BaseBrush.prototype);
  Pencil.prototype.constructor = Pencil;

  Pencil.prototype.createBrush = function(){
    var brush = new fabric.ErasablePencilBrush(this.drawerInstance.fCanvas);

    brush.color = this.drawerInstance.activeColor;
    brush.opacity = this.drawerInstance.activeOpacity;
    brush.width = this.options.brushSize;

    return brush;
  };

  /**
   * This method is called in BaseBrush._activateTool()
   * Children of BaseBrush MUST implement afterActivateTool.
   *
   * Save previous fabricJs cursor.
   */
  Pencil.prototype.afterActivateTool = function () {
    var fCanvas = this.drawerInstance.fCanvas;

    this._previousCursor = fCanvas.freeDrawingCursor;
    fCanvas.freeDrawingCursor = this.options.cursorUrl;
  };


  /**
   * This method is called in BaseBrush._deactivateTool()
   * Children of BaseBrush MUST implement afterDeactivateTool.
   *
   * Restore previous fabricJs cursor.
   */
  Pencil.prototype.afterDeactivateTool = function () {
    var fCanvas = this.drawerInstance.fCanvas;
    fCanvas.freeDrawingCursor = this._previousCursor;
  };

  pluginsNamespace.Pencil = Pencil;

}(jQuery, DrawerJs.plugins.BaseBrush, DrawerJs.plugins, DrawerJs.util));