(function ($, pluginsNamespace, BaseToolOptions) {
  'use strict';

  /**
   * Provides range control for selecting brush size in free drawing mode.
   *
   * @param {DrawerJs.Drawer} drawer
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var BrushSize = function BrushSizeConstructor(drawer) {
    // call super constructor
    BaseToolOptions.call(this, drawer);

    this.name = 'BrushSize';

    /**
     * Option name. On selecting tool/object, if this.toolName is in array of
     * object allowed options - tool will show controls
     * @type {String}
     */
    this.optionName = 'brushSize';

    /**
     * Size controls element
     * @type {Object}
     */
    this.$sizeControl = null;

    // set handlers
    drawer.on(drawer.EVENT_BRUSH_SIZE_CHANGED, this.updateValue.bind(this));
    drawer.on(drawer.EVENT_BRUSH_CHANGED, this.updateValue.bind(this));
  };


  BrushSize.prototype = Object.create(BaseToolOptions.prototype);
  BrushSize.prototype.constructor = BaseToolOptions;


//////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Creates controls. Is called from BaseToolOptions._onToolbarCreated
     * @param  {DrawerToolbar} toolbar
     */
    BrushSize.prototype.createControls = function(toolbar) {
        this.createSizeControl(toolbar);
    };

    /**
     * Deletes tool button.
     * If  doDeleteToolbarCreationListeners is true - removes listenin on toolbar creation event.
     * So, tool will not appear on toolbar next time, when toolbar is created.
     *
     * @param {boolean} doDeleteToolbarCreationListeners
     */
    BrushSize.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
        this.$sizeControl.remove();

        // stop listening toolbar creation
        if (doDeleteToolbarCreationListeners) {
            this.drawer.off(this.drawer.EVENT_OPTIONS_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
        }
    };


  /**
   * Create controls.
   * @param  {DrawerToolbar} toolbar to add control to
   */
  BrushSize.prototype.createSizeControl = function (toolbar) {
    var _this = this;

    _this.$sizeControl = $(
      '<li style="display:none" ' +
          'class="editable-canvas-brushsize toolbar-item-range"' +
      '>' +
        '<div class="toolbar-item-description">' +
          '<span class="toolbar-label">' +
          this.drawer.t('Size:') + ' ' +
          '</span>' +
          '<span class="toolbar-label toolbar-label-indicator editable-canvas-brushsize-indicator">' +
            '0px' +
          '</span>' +
        '</div>' +
        '<input class="editable-canvas-brushsize-input" ' +
               'type="range" name="drawer-size" min="1"' +
               'value="0" />' +
        '</li>');

    toolbar.addControl(_this.$sizeControl, this.options.buttonOrder);

    $(_this.$sizeControl).on('change', function () {
      var size = $(_this.$sizeControl).find('input').val();
      $(_this.$sizeControl).find('.editable-canvas-brushsize-indicator')
        .text(size + 'px');
      _this.drawer.setBrushSize(size);
    });
  };


  BrushSize.prototype.showControls = function() {
      this.updateValue();
      this.$sizeControl.show();
  };

  BrushSize.prototype.hideControls = function() {
      this.$sizeControl.hide();
  };


  /**
   * Update size control with current drawer brush size.
   */
  BrushSize.prototype.updateValue = function () {
    var size = this.drawer.getBrushSize();
    this.$sizeControl.find('input').val(size);
    this.$sizeControl.find('.editable-canvas-brushsize-indicator')
      .text(size + 'px');
  };

  pluginsNamespace.BrushSize = BrushSize;

}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseToolOptions));
