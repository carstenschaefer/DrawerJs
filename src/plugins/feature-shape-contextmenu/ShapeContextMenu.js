(function ($, pluginsNamespace, util) {
  var MOUSE_DOWN = util.mouseDown('ShapeContextMenu');
  /**
   *
   * Provides context menu for moving shapes to background-foreground and
   * remove them.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} options
   * Configuration object.
   *
   * @param {Object} [options.position.mouse=cursor]
   * Defines placement of context menu when working on non-touch screen.
   * <br><br>
   * Valid values are: <code>cursor</code>, <code>shapeRightBottom</code>,.
   *
   * @param {Object} [options.position.touch=shapeRightBottom]
   * Defines placement of context menu when working on touch screen.
   * <br><br>
   *
   * @param {Function} [options.customFitViewportMethod]
   * Custom function to calc coords to fit menu in viewport.
   * Arguments : (left, top)
   * Returns :  Object with keys {left, top}
   * <br><br>
   *
   * @param {Function} [options.customMenuRenderer]
   * Custom function to render context menu.
   * Arguments : ()
   * Returns :  Object with keys {left, top}
   * <br><br>
   *
   * Valid values are: <code>cursor</code>, <code>shapeRightBottom</code>.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var ShapeContextMenu = function ShapeContextMenuConstructor(drawerInstance, options) {
    var _this = this;
    _this.drawerInstance = drawerInstance;

    this.options = $.extend(true, {}, this._defaultOptions || {}, options || {});
    this.left = this.top = 0;

    this._bindedOnContextMenu = this._onContextMenu.bind(this);

    // using here EVENT_OPTIONS_TOOLBAR_CREATED just to make tool responsive to tools reload,
    // tool by itself does not belong to any toolbar
    this._bindedSetHandlers = this._setHandlers.bind(this);
    drawerInstance.on(drawerInstance.EVENT_OPTIONS_TOOLBAR_CREATED, this._bindedSetHandlers);

    drawerInstance.on(drawerInstance.EVENT_EDIT_STOP, this._onEditStop.bind(this));
    drawerInstance.on(drawerInstance.EVENT_OBJECT_MOVING, this._onObjectMoved.bind(this));
  };


  ShapeContextMenu.prototype.eventsNamespace = 'shapeContextMenu';

  ShapeContextMenu.prototype._defaultOptions = {
      position: {
        touch: 'shapeRightBottom', // context menu will be placed at shape's right bottom corner
        mouse: 'cursor' // context menu will be placed in the position of click
      }
    };



  ShapeContextMenu.prototype._setHandlers = function () {
    if (this.options.customMenuRenderer) {
      this.drawerInstance.on(this.drawerInstance.EVENT_CONTEXTMENU + '.' + this.eventsNamespace, this.options.customMenuRenderer);
    }
    else {
      this.drawerInstance.on(this.drawerInstance.EVENT_CONTEXTMENU + '.' + this.eventsNamespace, this._bindedOnContextMenu);

      var self = this;
      util.bindClick($('body'), 'shapeContextMenu', function () {
        self.hideContextMenu();
      });
    }
    this.drawerInstance.$canvasEditContainer.off(MOUSE_DOWN).on(MOUSE_DOWN, this._onMouseDown.bind(this));
  };


  ShapeContextMenu.prototype._unsetHandlers = function (doDeleteToolbarCreationListeners) {
    if (this.options.customMenuRenderer) {
      this.drawerInstance.off(this.drawerInstance.EVENT_CONTEXTMENU + '.' + this.eventsNamespace);
    }
    else {
      util.unbindClick($('body'), 'shapeContextMenu');
      this.drawerInstance.off(this.drawerInstance.EVENT_CONTEXTMENU + '.' + this.eventsNamespace);

      if (doDeleteToolbarCreationListeners) {
        this.drawerInstance.off(this.drawerInstance.EVENT_OPTIONS_TOOLBAR_CREATED, this._bindedSetHandlers);
      }
    }
  };


  ShapeContextMenu.prototype.removeTool = function (doDeleteToolbarCreationListeners) {
      this._unsetHandlers(doDeleteToolbarCreationListeners);
  };

  ShapeContextMenu.prototype._onObjectMoved = function () {
    this.objectWasMoved = true;
  };

  ShapeContextMenu.prototype._onEditStop = function () {
      this._unsetHandlers();
  };

  ShapeContextMenu.prototype._onMouseDown = function () {
    this.objectWasMoved = false;
  };

  ShapeContextMenu.prototype._onContextMenu = function (event, originalEvent) {
    var drawingInProgress = this.drawerInstance.drawingInProgress,
        isBrushDrawing = this.drawerInstance.isBrushDrawing,
        objectWasMoved = this.objectWasMoved,
        ignoreContextMenu = drawingInProgress || isBrushDrawing || objectWasMoved;
    if (!ignoreContextMenu) {
      if (originalEvent.type.indexOf('touch') > -1) {
        originalEvent = originalEvent.originalEvent;
      }
      this.handleContextMenuEvent(originalEvent);
    }
  };

  /**
   * Handles context menu event: finds object by click coordinates, selects
   * that object and invokes {@link ShapeContextMenu.showContextMenu()}
   *
   * @param event mouse right click event or touch.originalEvent
   */
  ShapeContextMenu.prototype.handleContextMenuEvent = function (event) {
    var _this = this,
        targetIsCanvas = $(event.target).hasClass('upper-canvas'),
        canvasTarget = targetIsCanvas && _this.drawerInstance.fCanvas.findTarget(event),
        canvasTargetIsMoving = canvasTarget && canvasTarget.isMoving,
        targetCorner = canvasTarget && canvasTarget.__corner,
        needToShowContextMenu = canvasTarget && !canvasTargetIsMoving && !targetCorner;
    if (needToShowContextMenu) {
        _this.drawerInstance.fCanvas.setActiveObject(canvasTarget);
        _this.showContextMenu(canvasTarget, event);
      }
  };

  /**
   * Shows context menu for specified fabricjs object.
   *
   * @param fabricItem
   * @param event
   */
  ShapeContextMenu.prototype.showContextMenu = function (fabricItem, event) {
    var _this = this;
    _this.hideContextMenu();

    var eventsNS = _this.eventsNamespace;

    _this.$contextMenu = $(
      '<ul class="editable-canvas-shape-context-menu"' +
      '></ul>'
    );

    var $bringForward = $('<li><a>' +
      _this.drawerInstance.t('Bring forward') +
    '</a></li>');
    util.bindClick($bringForward.find('a'), eventsNS, this._bringObjectForward.bind(this, fabricItem));
    _this.$contextMenu.append($bringForward);

    var $sendBackwards = $('<li><a>' +
      _this.drawerInstance.t('Send backwards') +
    '</a></li>');
    util.bindClick($sendBackwards.find('a'), eventsNS, this._sendObjectBackwards.bind(this, fabricItem));
    _this.$contextMenu.append($sendBackwards);

    var $bringToFront = $('<li><a>' +
      _this.drawerInstance.t('Bring to front') +
    '</a></li>');
    util.bindClick($bringToFront.find('a'), eventsNS, this._bringObjectToFront.bind(this, fabricItem));

    _this.$contextMenu.append($bringToFront);

    var $sendToBack = $('<li><a>' +
      _this.drawerInstance.t('Send to back') +
    '</a></li>');
    util.bindClick($sendToBack.find('a'), eventsNS, this._sendObjectToBack.bind(this, fabricItem));

    _this.$contextMenu.append($sendToBack);

    var $duplicate = $('<li><a>' +
    _this.drawerInstance.t('Duplicate') +
    '</a></li>');
    util.bindClick($duplicate.find('a'), eventsNS, this._duplicateObject.bind(this, fabricItem));
    _this.$contextMenu.append($duplicate);

    var $remove = $('<li><a>' +
      _this.drawerInstance.t('Remove') +
    '</a></li>');
    util.bindClick($remove.find('a'), eventsNS, this._removeObject.bind(this, fabricItem));
    _this.$contextMenu.append($remove);

    var paddings = 20;
    if (_this.drawerInstance.touchDevice) {
      paddings = _this.drawerInstance.options.toolbarSizeTouch;
    } else {
      paddings = _this.drawerInstance.options.toolbarSize;
    }

    paddings = paddings / 3;

    _this.$contextMenu.find('li > a').each(function (k, v) {
      $(v).css({
        'padding-top': paddings + 'px',
        'padding-bottom': paddings + 'px'
      });
    });

    _this.drawerInstance.$canvasEditContainer.append(_this.$contextMenu);

    this._positionMenu(fabricItem, util.getEventPosition(event));
  };

  /**
   * Hides context menu.
   */
  ShapeContextMenu.prototype.hideContextMenu = function () {
    if (this.$contextMenu) {
      this.$contextMenu.remove();
    }
  };


  /**
   * Set Menu left and top coords.
   * @param {number} left
   * @param {number} top
   */
  ShapeContextMenu.prototype.setMenuPosition = function(left, top) {
    this.left = Number(left);
    this.top  = Number(top);
    this.$contextMenu.css('left', left + 'px');
    this.$contextMenu.css('top', top + 'px');
  };


  /**
   * Get menu origin.
   * @return {Object} object with keys {left, top}
   */
  ShapeContextMenu.prototype.getMenuPosition = function() {
    return {left : this.left, top: this.top};
  };


  /**
   * Calcs menu position based on plugin options. click coords and object coords.
   * Then adjusts menu position to fit viewport.
   *
   * @param  {fabric.Object} fabricItem object for which context menu is called
   * @param  {Coords} clickCoords coords of mouse click
   */
  ShapeContextMenu.prototype._positionMenu = function (fabricItem, clickCoords) {
    // calc menu starting point based  on options
    var canvasOffset = $(this.drawerInstance.fCanvas.upperCanvasEl).offset();
    var left = 0;
    var top = 0;

    var optionsType = this.drawerInstance.touchDevice ? 'touch' : 'mouse';
    var positionOption = this.options.position[optionsType];


    if (positionOption == 'shapeRightBottom') {
      left = fabricItem.left + fabricItem.width;
      top = fabricItem.top + fabricItem.height;
    } else if (positionOption == 'cursor') {
      left = clickCoords.left - canvasOffset.left + 10;
      top = clickCoords.top - canvasOffset.top + 10;
    }

    var adjustedCoords = {};
    if (this.options.customFitViewportMethod) {
      adjustedCoords = this.options.customFitViewportMethod(left, top);
    } else {
      adjustedCoords = this._calcCoordsToFitViewport(left, top);
    }

    left = adjustedCoords.left;
    top  = adjustedCoords.top;

    this.setMenuPosition(left, top);
  };


 /**
  * Calcualtes new coords for conetx menu to fit in viewport
  * @param  {number} left current menu origin left
  * @param  {number} top  current menu origin coord
  * @return {Object}      returns Object with keys {left, top}
  */
 ShapeContextMenu.prototype._calcCoordsToFitViewport = function (left, top) {
    left = Number(left);
    top  = Number(top);
    // check if bottom edge is not outside viewport
    var menuHeight = this.$contextMenu.height();
    var canvasHeight = this.drawerInstance.fCanvas.height;
    var bottom = top + menuHeight;
    if (bottom > canvasHeight) {
        top = canvasHeight - menuHeight - 10;
    }

    var menuWidth = this.$contextMenu.width();
    var canvasWidth = this.drawerInstance.fCanvas.width;
    var right = left + menuWidth;
    if (right > canvasWidth) {
        left = canvasWidth - menuWidth - 10;
    }

    return {left : left, top: top};
 };


  ShapeContextMenu.prototype._bringObjectForward = function(fabricItem) {
      this.drawerInstance.api.bringObjectForward(fabricItem);
      this.hideContextMenu();
      return false;
  };

  ShapeContextMenu.prototype._sendObjectBackwards = function(fabricItem) {
      this.drawerInstance.api.sendObjectBackwards(fabricItem);
      this.hideContextMenu();
      return false;
  };


  ShapeContextMenu.prototype._bringObjectToFront = function(fabricItem) {
      this.drawerInstance.api.bringObjectToFront(fabricItem);
      this.hideContextMenu();
      return false;
  };


  ShapeContextMenu.prototype._sendObjectToBack = function(fabricItem) {
      this.drawerInstance.api.sendObjectToBack(fabricItem);
      this.hideContextMenu();
      return false;
  };


  ShapeContextMenu.prototype._removeObject = function(fabricItem) {
      this.drawerInstance.api.removeObject(fabricItem);
      this.hideContextMenu();
      return false;
  };


  ShapeContextMenu.prototype._duplicateObject = function(fabricItem) {
      this.drawerInstance.api.duplicateObject(fabricItem);
      this.hideContextMenu();
      return false;
  };


  pluginsNamespace.ShapeContextMenu = ShapeContextMenu;
}(jQuery, DrawerJs.plugins, DrawerJs.util));