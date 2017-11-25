(function (Drawer) {
  /**
   * This event is triggered every time user clicks on canvas to edit it.
   * @type {string}
   */
  Drawer.prototype.EVENT_EDIT_START = 'editStart';
  /**
   * This event is triggered every time user stops editing canvas.
   * @type {string}
   */
  Drawer.prototype.EVENT_EDIT_STOP = 'editStop';
  /**
   * This event is triggered when canvas is deserialized
   * from image's attributes.
   * @type {string}
   */
  Drawer.prototype.EVENT_LOADED_FROM_JSON = 'loadedFromJson';
  /**
   * This event is triggered when canvas is deserialized, and is ready to work.
   * @type {string}
   */
  Drawer.prototype.EVENT_CANVAS_READY = 'ready';
  /**
   * This event is triggered after canvas resizing starts
   * from image's attributes.
   * @type {string}
   */
  Drawer.prototype.EVENT_CANVAS_START_RESIZE = 'canvas:resize:start';

  /**
   * This event is triggered after canvas resizing starts
   * from image's attributes.
   * @type {string}
   */
  Drawer.prototype.EVENT_BEFORE_RENDER = 'before:render';


  /**
   * This event is triggered after canvas resizing starts
   * from image's attributes.
   * @type {string}
   */
  Drawer.prototype.EVENT_AFTER_RENDER = 'after:render';
  /**
   * This event is triggered in process of canvas resize
   * from image's attributes.
   * @type {string}
   */
  Drawer.prototype.EVENT_CANVAS_RESIZING = 'canvas:resize:resizing';
  /**
   * This event is triggered after canvas resize stopped
   * from image's attributes.
   * @type {string}
   */
  Drawer.prototype.EVENT_CANVAS_STOP_RESIZE = 'canvas:resize:stop';
  /**
   * This event is triggered every time user changes a brush size.
   * @type {string}
   */
  Drawer.prototype.EVENT_BRUSH_SIZE_CHANGED = 'brushSizeChanged';
  /**
   * This event is triggered every time user selects a tool that changes
   * free drawing brush.
   * @type {string}
   */
  Drawer.prototype.EVENT_BRUSH_CHANGED = 'brushChanged';

  /**
   * Triggering this event will cause tool based on BaseTool to activate
   * @type {string}
   */
  Drawer.prototype.EVENT_DO_ACTIVATE_TOOL = 'activateTool';
  /**
   * Triggering this event will cause tool based on BaseTool to deactivate
   * @type {string}
   */
  Drawer.prototype.EVENT_DO_DEACTIVATE_TOOL = 'deactivateTool';
  /**
   * Triggering this event will cause to all tools based on BaseTool to deactivate.
   * This event is part of lifecycle of EVENT_DO_ACTIVATE_TOOL,
   * and is triggered every time after tool reacts on EVENT_DO_ACTIVATE_TOOL
   * @type {string}
   */
  Drawer.prototype.EVENT_DO_DEACTIVATE_ALL_TOOLS = 'deactivateAllTools';

  /**
   * Event emitted, when options have changed.
   * In most cases - if user opened used 'CanvasProperties' plugin.
   * @type {String}
   */
  Drawer.prototype.EVENT_OPTIONS_CHANGED = 'options.changed';
  /**
   * This event is triggered when user removes canvas from page.
   * @type {string}
   */
  Drawer.prototype.EVENT_DESTROY = 'destroy';


  Drawer.prototype.EVENT_TOOL_ACTIVATED = 'toolActivated';

  Drawer.prototype.EVENT_TOOL_DEACTIVATED = 'toolDeactivated';

  Drawer.prototype.EVENT_TOOLS_TOOLBAR_CREATED = 'toolsToolbarCreated';

  /**
   * This event is triggered when options toolbar is created and provides a way
   * to add buttons to it.
   * The second argument for this event is {DrawerToolbar} and can be used
   * to manipulate with t.
   *
   * @type {string}
   */

  Drawer.prototype.BEFORE_CREATE_TOOLBARS ='beforeCreateToolbars';

  Drawer.prototype.AFTER_CREATE_TOOLBARS ='afterCreateToolbars';

  Drawer.prototype.EVENT_OPTIONS_TOOLBAR_CREATED ='optionsToolbarCreated';

  Drawer.prototype.EVENT_CONFIG_TOOLBAR_CREATED = 'configToolbarCreated';

  Drawer.prototype.EVENT_IMAGECROP_TOOLBAR_CREATED = 'imageCropToolbarCreated';

  Drawer.prototype.EVENT_FLOATING_TOOLBAR_CREATED = 'floatingToolbarCreated';

  Drawer.prototype.EVENT_MINIMIZED_TOOLBAR_CREATED = 'minimizedToolbarCreated';

  Drawer.prototype.EVENT_TOOLBAR_DESTROYED = 'toolbarDestroyed';

  Drawer.prototype.EVENT_TOOLBAR_CHANGE_STATE = 'toolbarChangeState';

  Drawer.prototype.EVENT_TOOLBAR_CLEAR_STATE = 'toolbarClearState';

  Drawer.prototype.EVENT_TOOLBAR_STATE_HIDDEN_OFF = 'toolbarShow';

  Drawer.prototype.EVENT_TOOLBAR_STATE_HIDDEN_ON = 'toolbarHide';

  Drawer.prototype.EVENT_TOOLBAR_STATE_OVERLAY_ON = 'toolbarOverlayShow';

  Drawer.prototype.EVENT_TOOLBAR_STATE_OVERLAY_OFF = 'toolbarOverlayHide';

  Drawer.prototype.EVENT_TOOLBAR_STATE_DISABLED_ON = 'toolbarDisableOn';

  Drawer.prototype.EVENT_TOOLBAR_STATE_DISABLED_OFF = 'toolbarDisableOff';

  Drawer.prototype.EVENT_RESTORE_DEFAULT_ZOOM = 'restoreDefaultZoom';

  Drawer.prototype.EVENT_CONTEXTMENU = 'contextmenu';

  Drawer.prototype.EVENT_KEYDOWN = 'keydown';

  Drawer.prototype.EVENT_BEFORE_SHAPE_ADD = 'beforeShapeAdd';

  Drawer.prototype.EVENT_AFTER_SHAPE_ADD = 'afterShapeAdd';

  Drawer.prototype.EVENT_ZOOM_SET = 'EVENT_ZOOM_SET';

  Drawer.prototype.EVENT_ZOOM_UNSET = 'EVENT_ZOOM_UNSET';

  Drawer.prototype.EVENT_ZOOM_UPPER_SET = 'EVENT_ZOOM_UPPER_SET';

  Drawer.prototype.EVENT_ZOOM_UPPER_UNSET = 'EVENT_ZOOM_UPPER_UNSET';

  Drawer.prototype.EVENT_ZOOM_UPPER_RESTORE = 'EVENT_ZOOM_UPPER_RESTORE';

  Drawer.prototype.EVENT_ZOOM_RESTORE = 'EVENT_ZOOM_RESTORE';


  Drawer.prototype.EVENT_ZOOM_CHANGE = 'zoomChange';

  Drawer.prototype.EVENT_CANVAS_MODIFIED = 'canvasModified';

  Drawer.prototype.EVENT_OBJECT_ADDED = 'objectAdded';

  Drawer.prototype.EVENT_OBJECT_SELECTED = 'objectSelected';

  Drawer.prototype.EVENT_OBJECT_MOVING = 'objectMoving';

  Drawer.prototype.EVENT_SELECTION_CLEARED = 'selectionCleared';

  Drawer.prototype.EVENT_TEXT_SELECTION_CHANGED = 'textSelectionChanged';

  Drawer.prototype.EVENT_TEXT_EDITING_ENTERED = 'textEditingEntered';

  Drawer.prototype.EVENT_TEXT_EDITING_EXITED = 'textEditingExited';

  Drawer.prototype.EVENT_TEXT_STYLES_CHANGED = 'textStylesChanged';

  Drawer.prototype.EVENT_TEXT_GET_STYLES = 'textGetStyles';

  Drawer.prototype.EVENT_OVERCANVAS_POPUP_SHOW = 'overcanvasPopupShow';

  Drawer.prototype.EVENT_OVERCANVAS_POPUP_HIDE = 'overcanvasPopupHide';

  Drawer.prototype.EVENT_OVERCANVAS_BUTTON_SHOW = 'overcanvasButtonShow';

  Drawer.prototype.EVENT_OVERCANVAS_BUTTON_HIDE = 'overcanvasButtonHide';

  Drawer.prototype.EVENT_IMAGE_CROP = 'initImageCrop';

  Drawer.prototype.EVENT_RESIZER_HIDE = 'resizerHide';

  Drawer.prototype.EVENT_RESIZER_SHOW = 'resizerShow';

  Drawer.prototype.EVENT_CREATE_TOOLTIP = 'createTooltip';

  Drawer.prototype.EVENT_HIDE_TOOLTIPS = 'hideTooltips';

  Drawer.prototype.EVENT_DESTROY_TOOLTIPS = 'destroyTooltips';

  /**
   * Remove event listeners by event name and(or) callback
   *
   * @param eventName
   * @param callback
   * @returns {*}
   */
  Drawer.prototype.off = function (eventName, callback) {
    return this._eventEmitter.off(eventName, callback);
  };

  /**
   * Add event listener to canvas element events.
   *
   * @param eventName
   * @param callback
   */
  Drawer.prototype.on = function (eventName, callback) {
    return this._eventEmitter.on(eventName, callback);
  };

  /**
   * Trigger any canvas event.
   *
   * @param eventName
   * @param [args]
   * @returns {*}
   */
  Drawer.prototype.trigger = function (eventName, args) {
    var eventResult,
        needToLogErors = !this.insideEvent;
    try {
      this.insideEvent = true;
      eventResult = this._eventEmitter.trigger(eventName, args);
    } catch(err) {
      if (this.options.debug) {
        var errorName = 'Catched error - ' + eventName;
        console.groupCollapsed(errorName);
        this.log('Event name',eventName);
        this.log('Arguments', args);
        this.error(err);
        console.groupEnd(errorName);
      }
    }
    if (needToLogErors) {
      this.insideEvent = false;
    }
    return eventResult;
  };
})(DrawerJs.Drawer);