(function ($, BaseBrush, pluginsNamespace, util) {
  /**
   * Provides a a simple eraser button which activates free drawing mode and
   * makes a brush with white color.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} options
   * Configuration object.
   *
   * @param {number} options.brushSize
   * Eraser default brush size
   *
   * @param {String} options.cursorUrl
   * Custom CSS url for eraser cursor.
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
   * @memberof DrawerJs.plugins
   * @augments DrawerJs.plugins.BaseBrush
   * @constructor
   */
  var SimpleWhiteEraser = function SimpleWhiteEraserPlugin(drawerInstance,
                                                           options) {
    var _this = this;

    BaseBrush.call(_this, drawerInstance);

    this.name = 'SimpleWhiteEraser';
    this.btnClass = 'btn-simple-eraser';
    this.faClass = 'fa-eraser';
    this.tooltip = drawerInstance.t('SimpleWhiteEraser');

    _this._defaultOptions = {
      brushSize: 3,
      cursorUrl: 'eraser'
    };

    this._setupOptions(options);

    if (_this.options.cursorUrl == 'eraser') {
      var drawerFolderUrl = util.getDrawerFolderUrl();
      if(drawerFolderUrl){
        _this.options.cursorUrl = 'url(' + drawerFolderUrl +
        'assets/cursor-fa-eraser.cur), default';
      }
    }

    /**
     * Color value before eraser tool.
     * @type {String}
     */
    this.previousColor = null;

    /**
     * BrushSize before eraser tool. Used to separate eraser brush size from
     * other brushes.
     * @type {Number}
     */
    this.previousBrushSize = null;

    /**
     * Last used eraser brush size. Used to restore eraser size after another
     * brush tool.
     * @type {Number}
     */
    this.savedBrushSize = this.options.brushSize;
  };

  SimpleWhiteEraser.prototype = Object.create(BaseBrush.prototype);
  SimpleWhiteEraser.prototype.constructor = SimpleWhiteEraser;

  /**
   * This method is called in BaseBrush._activateTool()
   * Children of BaseBrush MUST implement afterActivateTool().e
   */
  SimpleWhiteEraser.prototype.afterActivateTool = function () {
    this.previousColor = this.drawerInstance.fCanvas.freeDrawingBrush.color;
    this.drawerInstance.fCanvas.freeDrawingBrush.color = '#fff';
    this.drawerInstance.fCanvas.freeDrawingBrush.fill = '#fff';
    this.drawerInstance.fCanvas.freeDrawingBrush.opacity = this.drawerInstance.activeOpacity;

    this._previousCursor = this.drawerInstance.fCanvas.freeDrawingCursor;
    this.drawerInstance.fCanvas.freeDrawingCursor = this.options.cursorUrl;

    this.previousBrushSize = this.drawerInstance.freeDrawingBrushSize;
    this.drawerInstance.setFreeDrawingBrushSize(this.savedBrushSize);
  };

  /**
   * This method is called in BaseBrush._deactivateTool()
   * Children of BaseBrush MUST implement afterDeactivateTool().
   */
  SimpleWhiteEraser.prototype.afterDeactivateTool = function () {
    this.drawerInstance.fCanvas.freeDrawingCursor = this._previousCursor;
    this.drawerInstance.fCanvas.freeDrawingBrush.color = this.previousColor;
    this.drawerInstance.fCanvas.freeDrawingBrush.fill = this.previousColor;

    this.savedBrushSize = this.drawerInstance.freeDrawingBrushSize;
    this.drawerInstance.setFreeDrawingBrushSize(this.previousBrushSize);
  };

  pluginsNamespace.SimpleWhiteEraser = SimpleWhiteEraser;

}(jQuery, DrawerJs.plugins.BaseBrush, DrawerJs.plugins, DrawerJs.util));