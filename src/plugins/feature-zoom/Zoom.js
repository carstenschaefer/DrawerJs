(function (global, $, pluginsNamespace, DrawerApi, util) {
  'use strict';
  var fabric = global.fabric || (global.fabric = {});

  var MOUSE_DOWN = util.mouseDown('Zoom');
  var MOUSE_MOVE = util.mouseMove('Zoom');
  var MOUSE_UP = util.mouseUp('Zoom');
  var isWebkit = util.checkBrowser('webkit'),
      cursorPrefix = isWebkit ? '-webkit-' : '';

  /**
   * Provides ability to change zoom
   *
   * @param {DrawerJs.Drawer} drawer
   * @param {DrawerJs.plugins.Zoom.defaultOptions} [options]
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var Zoom = function ZoomConstructor(drawer, options) {
    /**
     * @type {Drawer}
     */
    this.drawer = drawer;
    this._setupOptions(options);
    this._init();
  };

  /**
   * @typedef {Object} defaultOptions
   * @memberOf DrawerJs.plugins.Zoom
   * @property {Boolean} [enabled=true] - Zoom is enabled
   * @property {Boolean} [enableWhenNoActiveTool=true] - Allow to move canvas when no object is selected and is no active tool.
   * @property {Boolean} [enableButton=true] - Add "move canvas" button to settings toolbar
   * @property {Boolean} [showZoomTooltip=true] - Show tooltip with current zoom value on any change of zoom props
   * @property {Boolean} [enableMove=true] - Enable move of canvas
   * @property {Boolean} [useWheelEvents=true] - Attach wheel events
   * @property {Boolean} [moveCanvasOnWheel=true] - Change center of viewport on wheel events depending on mouse position.
   * @property {Number} [moveCanvasOnWheelStep=0] - Attach wheel events. Valid range of value is from 0(center of
   * viewport will not changed) to 1(center of viewport will move to mouse position). Most comfortable value is 0.05-0.15
   * @property {Number} [zoomStep=1.05] - Step of each zoom change. (1.05 = 105%)
   * @property {Number} [defaultZoom=1] - Default zoom value
   * @property {Number} [minZoom=1] - Min zoom value
   * @property {Number} [maxZoom=32] - Max zoom value
   *
   */

  /**
   * @type {DrawerJs.plugins.Zoom.defaultOptions}
   * @private
   */
  Zoom.prototype._defaultOptions = {
    enabled: true,

    enableWhenNoActiveTool: true,
    enableButton: true,

    showZoomTooltip: true,
    enableMove: true,
    useWheelEvents: true,

    moveCanvasOnWheel: true,
    moveCanvasOnWheelStep: 0,

    zoomStep: 1.05,
    defaultZoom: 1,
    maxZoom: 32,
    minZoom: 1,
    buttonOrder: 11
  };

  /**
   * Init zoom plugin
   * @private
   */
  Zoom.prototype._init = function () {
    this.viewport = new pluginsNamespace.ZoomViewport(this.drawer);

    this.enabled = this.options.enabled;
    this.zoomIsOn = true;
    this.currentZoom = 1;

    this._updateProto();
    if (this.enabled) {
      this._attachDrawerEvents();
      this._updateDrawerValues();
    }
  };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  Zoom.prototype._setupOptions = function (options, pluginName, doNotSave) {
    pluginName = pluginName || this.name;
    var drawer = this.drawerInstance || this.drawer,
        optionsFromDrawer = drawer && drawer.getPluginConfig(pluginName),
        result = $.extend(true,
            {},
            this._defaultOptions || {},
            optionsFromDrawer || {},
            options || {}
        );

    if (!doNotSave) {
      this.options = result;
    }
    return result;
  };

  /**
   * Update prototype of fabric object/canvas
   * @private
   */
  Zoom.prototype._updateProto = function () {
    this.drawer.on(this.drawer.EVENT_CANVAS_READY, this._updateCanvasProto.bind(this));
    this.drawer.on(this.drawer.EVENT_CANVAS_READY, this._updateObjectProto.bind(this));
  };

  /**
   * Attach drawer events
   * @private
   */
  Zoom.prototype._attachDrawerEvents = function () {
    this.drawer.on(this.drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._onToolbarCreated.bind(this));
    this.drawer.on(this.drawer.EVENT_RESTORE_DEFAULT_ZOOM, this.restoreDefaultZoom.bind(this));

    this.drawer.on(this.drawer.EVENT_DO_ACTIVATE_TOOL, this._onActivateTool.bind(this));
    this.drawer.on(this.drawer.EVENT_DO_DEACTIVATE_TOOL, this._ctxUpperRestore.bind(this));

    this.drawer.on(this.drawer.EVENT_BEFORE_RENDER, this._ctxSet.bind(this));
    this.drawer.on(this.drawer.EVENT_AFTER_RENDER, this._ctxRestore.bind(this));

    this.drawer.on(this.drawer.EVENT_ZOOM_SET, this._ctxSet.bind(this));
    this.drawer.on(this.drawer.EVENT_ZOOM_UNSET, this._ctxUnset.bind(this));
    this.drawer.on(this.drawer.EVENT_ZOOM_RESTORE, this._ctxRestore.bind(this));

    this.drawer.on(this.drawer.EVENT_ZOOM_UPPER_SET, this._ctxUpperSet.bind(this));
    this.drawer.on(this.drawer.EVENT_ZOOM_UPPER_UNSET, this._ctxUpperUnset.bind(this));
    this.drawer.on(this.drawer.EVENT_ZOOM_UPPER_RESTORE, this._ctxUpperRestore.bind(this));

    this.drawer.on(this.drawer.EVENT_CANVAS_START_RESIZE, this._ctxSet.bind(this));
    this.drawer.on(this.drawer.EVENT_CANVAS_STOP_RESIZE, this._ctxRestore.bind(this));

    this.drawer.on(this.drawer.EVENT_SELECTION_CLEARED, this._refreshButton.bind(this));
    this.drawer.on(this.drawer.EVENT_OBJECT_SELECTED, this._refreshButton.bind(this));

    this.drawer.on(this.drawer.EVENT_TOOL_ACTIVATED, this._refreshButton.bind(this));
    this.drawer.on(this.drawer.EVENT_TOOL_DEACTIVATED, this._refreshButton.bind(this));
  };

  Zoom.prototype._refreshButton = function (fEvent) {
    this._refreshMoveButtonState();
  };

  Zoom.prototype._ctxUpperSet = function (fEvent) {
    var fCanvas = this.drawer.fCanvas,
        ctxUpper = fCanvas.contextTop;
    ctxUpper.save();
    ctxUpper.scale(this.viewport.zoom, this.viewport.zoom);
    ctxUpper.translate(this.viewport.position.x, this.viewport.position.y);
  };

  Zoom.prototype._ctxUpperUnset = function (fEvent) {
    var fCanvas = this.drawer.fCanvas,
        ctxUpper = fCanvas.contextTop;
    ctxUpper.save();
    ctxUpper.scale(1 / this.viewport.zoom, 1 / this.viewport.zoom);
    ctxUpper.translate(-this.viewport.position.x, -this.viewport.position.y);

  };

  Zoom.prototype._ctxUpperRestore = function (fEvent) {
    var fCanvas = this.drawer.fCanvas,
        ctxUpper = fCanvas.contextTop;
    ctxUpper.restore();
  };

  Zoom.prototype._ctxSet = function (fEvent) {
    var fCanvas = this.drawer.fCanvas,
        ctx = fCanvas.contextContainer;
    ctx.save();
    ctx.scale(this.viewport.zoom, this.viewport.zoom);
    ctx.translate(this.viewport.position.x, this.viewport.position.y);
  };

  Zoom.prototype._ctxUnset = function (fEvent) {
    var fCanvas = this.drawer.fCanvas,
        ctx = fCanvas.contextContainer;
    ctx.save();
    ctx.scale(1 / this.viewport.zoom, 1 / this.viewport.zoom);
    ctx.translate(-this.viewport.position.x, -this.viewport.position.y);
  };

  Zoom.prototype._ctxRestore = function (fEvent) {
    var fCanvas = this.drawer.fCanvas,
        ctx = fCanvas.contextContainer;
    ctx.restore();
  };
  /**
   * React on activate of tool
   * @param {fabric.Event} fEvent event obj
   * @param {BaseTool} tool tool object
   * @private
   */
  Zoom.prototype._onActivateTool = function (fEvent, tool) {
    if (!tool.doNotZoomOnActivate) {
      this._ctxUpperSet();
    }
  };

  /**
   * React on deactivate of tool
   * @param {fabric.Event} fEvent event obj
   * @param {BaseTool} tool tool object
   * @private
   */
  Zoom.prototype._onDeactivateTool = function (fEvent, tool) {
    if (!tool.doNotZoomOnActivate) {
      this._ctxUpperRestore();
    }
  };

  /**
   * On toolbar created - create tool button.
   * @param {fabric.Event} fEvent - event obj
   * @param {DrawerToolbar} toolbar - Drawer toolbar
   */
  Zoom.prototype._onToolbarCreated = function (fEvent, toolbar) {
    this.toolbar = toolbar;
    var needToInitButton = true;
    if (needToInitButton) {
      this.createControls(toolbar);
      this._createHelperElements();
      this._attachEvents();
    }
  };

  /**
   * Remove helper elements
   * @private
   */
  Zoom.prototype._removeHelperElements = function () {
    if (this.$zoomTooltip && this.$zoomTooltip.length) {
      this.$zoomTooltip.remove();
      delete this.$zoomTooltip;
    }
  };

  /**
   * Create helper elements
   * @private
   */
  Zoom.prototype._createHelperElements = function () {
    this._removeHelperElements();
    var zoomTooltipHtml = '<div class="zoom-tooltip transparent-tooltip"></div>',
        $zoomTooltip = $(zoomTooltipHtml),
        $canvasContainer = this.drawer.$canvasEditContainer;

    this.$zoomTooltip = $zoomTooltip;
    $canvasContainer.append($zoomTooltip);
  };

  /**
   * Attach events for helper elements
   * @private
   */
  Zoom.prototype._attachEvents = function () {
    var self = this;
    if (this.options.showZoomTooltip) {
      var hideFunc = function () {
            self.$zoomTooltip.addClass('transparent-tooltip');
          },
          debouncedTooltipHideFunc = util.debounce(hideFunc, 1000);

      this.drawer.on(this.drawer.EVENT_ZOOM_CHANGE, function (fEvent, zoomProps) {
        var zoomAsText = parseInt(zoomProps.zoom * 100, 10) + '%';
        self.$zoomTooltip.text(zoomAsText);
        self.$zoomTooltip.removeClass('transparent-tooltip');
        debouncedTooltipHideFunc();
      });
    }
    if (this.options.enableButton) {
      this.drawer.on(this.drawer.EVENT_ZOOM_CHANGE, function (fEvent, zoomProps) {
        var stateIsChanged = (zoomProps.prevValues.zoom === 1 && zoomProps.zoom !== 1) || (zoomProps.zoom === 1 && zoomProps.prevValues.zoom !== 1);
        if (stateIsChanged) {
          self._refreshMoveButtonState();
        }
      });
    }
  };


  /**
   * Create controls
   * @param {DrawerToolbar} toolbar - Drawer toolbar
   */
  Zoom.prototype.createControls = function (toolbar) {
    this._createAndAddButton(toolbar);
    this._attachWheelEvents();
    this._attachMoveEvents();
    this._attachTouchEvents();

  };


  /**
   * Creates and adds buttons to toolbar.
   * @param  {DrawerToolbar} toolbar
   */
  Zoom.prototype._createAndAddButton = function (toolbar) {
    var $zoomInButton,
        $zoomOutButton,
        $moveCanvasButton,
        zoomInButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-zoom-in',
          iconClass: 'fa-search-plus',
          tooltipText: this.drawer.t('Zoom in'),
          clickHandler: this._onZoomIn.bind(this)
        },
        zoomOutButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-zoom-out',
          iconClass: 'fa-search-minus',
          tooltipText: this.drawer.t('Zoom out'),
          clickHandler: this._onZoomOut.bind(this)
        },
        moveCanvasButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-zoom-move',
          iconClass: 'fa-search',
          tooltipText: this.drawer.t('Move canvas'),
          clickHandler: this._onMoveButtonClick.bind(this)
        };
    $zoomInButton = toolbar.addButton(zoomInButtonConf);
    $zoomOutButton = toolbar.addButton(zoomOutButtonConf);

    if (this.options.enableMove && this.options.enableButton) {
      $moveCanvasButton = toolbar.addButton(moveCanvasButtonConf);
    }

    this.toolbar = toolbar;
    this.$zoomInButton = $zoomInButton;
    this.$zoomOutButton = $zoomOutButton;
    this.$moveCanvasButton = $moveCanvasButton;
  };

  /**
   * React on "Move canvas" button click
   * @param {Event} event
   * @private
   */
  Zoom.prototype._onMoveButtonClick = function (event) {
    var isDisabled = this.$moveCanvasButton.hasClass('disabled');
    if (!isDisabled) {
      this.moveButtonIsActive = !this.moveButtonIsActive;
      this._refreshMoveButtonState(true);
    }
  };

  /**
   * Collect data for zoom from event
   * @param {Event} event
   * @param {Boolean} [changeZoomCenter]
   * @param {Boolean} [zoomIn]
   * @returns {Object}
   * @private
   */
  Zoom.prototype._getZoomPopertiesFromEvent = function (event, changeZoomCenter, zoomIn) {
    var result = {},
        newZoomCenterX,
        newZoomCenterY,
        newZoomValue = this.currentZoom * (zoomIn ? this.options.zoomStep : 1 / this.options.zoomStep);
    if (changeZoomCenter) {
      var eventPosition = this.drawer.getRelativeEventPosition(event, true),
          zoomCenterXFromEvent = eventPosition.left / newZoomValue - this.viewport.position.x,
          zoomCenterYFromEvent = eventPosition.top / newZoomValue - this.viewport.position.y,
          deltaX = zoomCenterXFromEvent - this.zoomCenterX,
          deltaY = zoomCenterYFromEvent - this.zoomCenterY;

      newZoomCenterX = this.zoomCenterX + deltaX * this.options.moveCanvasOnWheelStep;
      newZoomCenterY = this.zoomCenterY + deltaY * this.options.moveCanvasOnWheelStep;
    } else {
      newZoomCenterX = this.zoomCenterX;
      newZoomCenterY = this.zoomCenterY;
    }
    result.zoom = newZoomValue;
    result.zoomCenterX = newZoomCenterX;
    result.zoomCenterY = newZoomCenterY;
    return result;
  };

  /**
   * Trigger zoom in event
   * @param {Event} event
   * @param {Boolean} [changeZoomCenter]
   * @private
   */
  Zoom.prototype._onZoomIn = function (event, changeZoomCenter) {
    if (this.zoomIsOn) {
      var zoomProps = this._getZoomPopertiesFromEvent(event, changeZoomCenter, true);
      this.setZoom(zoomProps.zoom, zoomProps.zoomCenterX, zoomProps.zoomCenterY, true);
    }
  };

  /**
   * Trigger zoom out event
   * @param {Event} event
   * @param {Boolean} [changeZoomCenter]
   * @private
   */
  Zoom.prototype._onZoomOut = function (event, changeZoomCenter) {
    if (this.zoomIsOn) {
      var zoomProps = this._getZoomPopertiesFromEvent(event, changeZoomCenter, false);
      this.setZoom(zoomProps.zoom, zoomProps.zoomCenterX, zoomProps.zoomCenterY, true);
    }
  };

  /**
   * Attach wheel event to canvas
   * @private
   */
  Zoom.prototype._attachWheelEvents = function () {
    if (this.options.useWheelEvents) {
      this.wheelEventsAttached = true;
      var canvasContainer = this.drawer.$canvasEditContainer.find('.canvas-container').get(0);
      util.addWheelListener(canvasContainer, this._onWheelEvent.bind(this), true); //@todo capture
    }
  };

  /**
   * Attach move events
   * @private
   */
  Zoom.prototype._attachMoveEvents = function () {
    if (this.options.enableMove) {
      var $document = $(window.document),
          $canvasContainer = this.drawer.$canvasEditContainer.find('.canvas-container');

      $canvasContainer.off(MOUSE_DOWN).on(MOUSE_DOWN, this._moveOnMouseDown.bind(this));
      $document.off(MOUSE_MOVE).on(MOUSE_MOVE, this._moveOnMouseMove.bind(this));
      $document.off(MOUSE_UP).on(MOUSE_UP, this._moveOnMouseUp.bind(this));
    }
  };

  /**
   * Move canvas - React on mouse down.
   * @param {Event} e
   * @private
   */
  Zoom.prototype._moveOnMouseDown = function (e) {
    var currActiveObj = this.drawer.fCanvas.getActiveObject(),
        selectedTool = this.drawer.activeDrawingTool,
        buttonIsActive = this.moveButtonIsActive,

        buttonPermission = this.options.enableButton && buttonIsActive,
        noActiveToolPermission = this.options.enableWhenNoActiveTool && (!this.options.enableButton || buttonPermission),
        preventMove = this.currentZoom === 1 || currActiveObj || selectedTool,
        initMove = !preventMove && (buttonPermission || noActiveToolPermission);

    if (initMove) {
      var currPoint = this.drawer.getRelativeEventPosition(e);

      this.drawer.movingNow = true;
      this.isMoving = true;
      this.moveStartPoint = currPoint;
      this.moveLastPoint = currPoint;

      var $body = $('body');
      this.drawer.fCanvas.defaultCursor = cursorPrefix + 'grabbing';
      this.drawer.fCanvas.setCursor(cursorPrefix + 'grabbing');
      $body.addClass('drawer-dragging drawer-zoom-moving');

      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  /**
   *
   * @private
   */
  Zoom.prototype._refreshMoveButtonState = function (doNotSaveState) {
    this.savedDefaultCursor = this.savedDefaultCursor || this.drawer.fCanvas.defaultCursor;
    if (this.options.enableButton) {
      if (this.currentZoom === 1) {
        this.$moveCanvasButton.addClass('disabled');
        this.drawer.fCanvas.defaultCursor = this.savedDefaultCursor;
        this.drawer.fCanvas.setCursor(this.savedDefaultCursor);
      } else {
        if (!doNotSaveState) {
          var enableToMove = this._checkMovePermission(!doNotSaveState);
          this.moveButtonIsActive = enableToMove;
        }

        this.$moveCanvasButton.removeClass('disabled');
        if (this.moveButtonIsActive) {
          this._prepareDrawerForZoom();
          this.drawer.fCanvas.defaultCursor = cursorPrefix + 'grab';
          this.drawer.fCanvas.setCursor(cursorPrefix + 'grab');
          $('body').addClass('drawer-zoom-move-available');
          this.toolbar.setActiveButton('btn-zoom-move');
        } else {
          this.drawer.fCanvas.defaultCursor = this.savedDefaultCursor;
          this.drawer.fCanvas.setCursor(this.savedDefaultCursor);
          $('body').removeClass('drawer-zoom-move-available');
          this.toolbar.clearActiveButton();
        }
      }
    } else {
      this.drawer.fCanvas.defaultCursor = cursorPrefix + 'grab';
      this.drawer.fCanvas.setCursor(cursorPrefix + 'grab');
      $('body').addClass('drawer-zoom-move-available');
    }
  };

  Zoom.prototype._prepareDrawerForZoom = function () {
    this.drawer.trigger(this.drawer.EVENT_DO_DEACTIVATE_ALL_TOOLS);
    this.drawer.fCanvas._clearSelection();
    this.drawer.fCanvas.renderAll();
  };



  /**
   *
   * @private
   */
  Zoom.prototype._checkMovePermission = function (withButtonState) {
    var currActiveObj = this.drawer.fCanvas.getActiveObject(),
        selectedTool = this.drawer.activeDrawingTool,
        buttonStateIsActive = withButtonState && this.moveButtonIsActive,
        result = !currActiveObj && !selectedTool && (this.options.enableWhenNoActiveTool || buttonStateIsActive);
    return result;
  };

  /**
   * Move canvas - React on mouse move.
   * @param {Event} e
   * @private
   */
  Zoom.prototype._moveOnMouseMove = function (e) {
    if (this.isMoving && this.currentZoom !== 1) {
      var self = this,
          moveEventPos = this.drawer.getRelativeEventPosition(e),
          moveLastPoint = this.moveLastPoint,
          deltaX = (moveLastPoint.left - moveEventPos.left),
          deltaY = (moveLastPoint.top - moveEventPos.top),
          newCenterX = this.zoomCenterX + deltaX,
          newCenterY = this.zoomCenterY + deltaY,
          moveDrawerFunc = function moveDrawerFunc() {
            self.setZoom(self.currentZoom, newCenterX, newCenterY, true);
          };

      this.moveLastPoint = moveEventPos;
      util.requestAnimationFrame(moveDrawerFunc);

      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  /**
   * Move canvas - React on mouse up.
   * @param {Event} e
   * @private
   */
  Zoom.prototype._moveOnMouseUp = function (e) {
    if (this.isMoving) {
      var $body = $('body'),
          self = this;

      util.setTimeout(function () {
        self.drawer.movingNow = false;
      }, 0);
      this.isMoving = false;
      this.drawer.fCanvas.defaultCursor = cursorPrefix + 'grab';
      this.drawer.fCanvas.setCursor(cursorPrefix + 'grab');
      $body.removeClass('drawer-dragging drawer-zoom-moving');

      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  /**
   * Attach wheel event to canvas
   * @private
   */
  Zoom.prototype._attachTouchEvents = function () {
      var self = this,
          $canvasContainer = this.drawer.$canvasEditContainer,
          startDiff,
          lastDiff;

    function getDistance(p1,p2) {
      var result;
      result = Math.sqrt(Math.pow(p1.left - p2.left, 2) + Math.pow(p1.top - p2.top, 2));
      return result;
    }

    $canvasContainer.off('touchstart.drawerZoom').on('touchstart.drawerZoom', function (event) {
      var touches = event.touches ? event.touches : event.originalEvent.touches;
      if (self.zoomIsOn && touches && touches.length > 1) {
        var pointPos1 = getEventPosition(event, 0),
            pointPos2 = getEventPosition(event, 1);
        if (!pointPos1.left || !pointPos1.top) {
          pointPos1 = getEventPosition(window.event, 0);
          pointPos2 = getEventPosition(window.event, 1);
        }
        startDiff = getDistance(pointPos1, pointPos2);
        lastDiff = startDiff;
        self._prepareDrawerForZoom();
      }
    });
    $canvasContainer.off('touchmove.drawerZoom').on('touchmove.drawerZoom', function (event) {
      var touches = event.touches ? event.touches : event.originalEvent.touches,
          zoominit = self.zoomIsOn && touches && touches.length > 1;
      if (zoominit) {
        var pointPos1 = util.getEventPosition(event, 0),
            pointPos2 = util.getEventPosition(event, 1);
        if (!pointPos1.left || !pointPos1.top) {
          pointPos1 = util.getEventPosition(window.event, 0);
          pointPos2 = util.getEventPosition(window.event, 1);
        }
        var currDiff = getDistance(pointPos1, pointPos2),
            isZoomIn = lastDiff < currDiff,
            zoom = self.currentZoom * (isZoomIn ? self.options.zoomStep : 1 / self.options.zoomStep),
            scrollOffset = util.getScrollOffset($canvasContainer),
            canvasContainer = $canvasContainer.get(0),
            canvasContainerSizes = canvasContainer.getBoundingClientRect(),
            touchCenterX = pointPos1.left - (pointPos1.left - pointPos2.left) / 2,
            touchCenterY = pointPos1.top - (pointPos1.top - pointPos2.top) / 2,
            zoomCenterX = touchCenterX - canvasContainerSizes.left - scrollOffset.left,
            zoomCenterY = touchCenterY - canvasContainerSizes.top - scrollOffset.top;

        self.setZoom(zoom, zoomCenterX, zoomCenterY, true);
        lastDiff = currDiff;
        event.stopPropagation();
        event.preventDefault();
      }
    });
  };

  /**
   * React on wheel event
   * @param {Event} e
   * @private
   */
  Zoom.prototype._onWheelEvent = function (e) {
    if (this.zoomIsOn) {
      var delta = e.deltaY || e.detail || e.wheelDelta;
      this._prepareDrawerForZoom();
      if (delta > 0) {
        this._onZoomOut(e, true);
      } else {
        this._onZoomIn(e, true);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  };

  /**
   * Update zoom values of drawer/plugin
   * @param {Object} [data]
   * @private
   */
  Zoom.prototype._updateDrawerValues = function (data) {
    data = data || {};
    var width = this.drawer.width,
        height = this.drawer.height,
        zoomCenter = this.viewport.getZoomCenter();

    this.zoomCenterX = this.zoomCenterX !== undefined ? this.zoomCenterX : zoomCenter.x;
    this.zoomCenterY = this.zoomCenterY !== undefined ? this.zoomCenterY : zoomCenter.y;

    var zoomCenterX = data.zoomCenterX !== undefined ? data.zoomCenterX : this.zoomCenterX,
        zoomCenterY = data.zoomCenterY !== undefined ? data.zoomCenterY : this.zoomCenterY,
        currentZoom = data.zoom;

    if (typeof currentZoom !== 'number' || !isFinite(currentZoom)) {
      currentZoom = this.currentZoom;
      if (typeof currentZoom !== 'number' || !isFinite(currentZoom)) {
        currentZoom = this.options.defaultZoom;
      }
    }

    if (zoomCenterX > width) {
      zoomCenterX = width;
    }
    if (zoomCenterY > height) {
      zoomCenterY = width;
    }
    if (zoomCenterX < 0) {
      zoomCenterX = 0;
    }
    if (zoomCenterY < 0) {
      zoomCenterY = 0;
    }
    if (typeof this.options.minZoom === 'number') {
      currentZoom = Math.max(currentZoom, this.options.minZoom);
    }
    if (typeof this.options.maxZoom === 'number') {
      currentZoom = Math.min(currentZoom, this.options.maxZoom);
    }

    this.drawer.currentZoom = this.currentZoom = currentZoom;
    this.drawer.zoomCenterX = this.zoomCenterX = zoomCenterX;
    this.drawer.zoomCenterY = this.zoomCenterY = zoomCenterY;
  };

  /**
   * Set zoom
   * @param {Number} value - new zoom value
   * @param {Number} [zoomCenterX] - x coord of new canvas center
   * @param {Number} [zoomCenterY] - y coord of new canvas center
   * @param {Boolean} [strict] - Set zoom center without changes
   */
  Zoom.prototype.setZoom = function (value, zoomCenterX, zoomCenterY, strict) {
    var zoomValueIsValid = typeof value === 'number' && isFinite(value),
        strictMode = strict !== undefined ? strict : !this.options.moveCanvasOnWheel,
        prevValues,
        zoomResult;
    if (zoomValueIsValid) {
      prevValues = {
        zoom: this.currentZoom,
        zoomCenterX: this.zoomCenterX,
        zoomCenterY: this.zoomCenterY
      };
      this._updateDrawerValues({
        zoom: value,
        zoomCenterX: zoomCenterX,
        zoomCenterY: zoomCenterY
      });

      zoomResult = this.viewport.setViewport(this.currentZoom, this.zoomCenterX, this.zoomCenterY, strictMode);
      zoomResult.prevValues = prevValues;
      this._updateDrawerValues(zoomResult);
      this.drawer.trigger(this.drawer.EVENT_ZOOM_CHANGE, [zoomResult]);
    } else {
      console.info('invalid zoom value');
    }
  };

  /**
   * Update prototype of fabric tools
   * @priv
   */
  Zoom.prototype._updateObjectProto = function () {
    var self = this,
        _drawControl = fabric.Object.prototype._drawControl,
        drawControls = fabric.Object.prototype.drawControls,
        getPointByOrigin = fabric.Object.prototype.getPointByOrigin,
        _setCornerCoords = fabric.Object.prototype._setCornerCoords;


    /*
    fabric.Object.prototype._drawControl = function (control, ctx, methodName, left, top) {
      var viewport = self.viewport,
          zoom = viewport ? viewport.zoom : 1;
      ctx.lineWidth = 1 / Math.max(this.scaleX, this.scaleY);
      return _drawControl.apply(this, [control, ctx, methodName, left, top]);
    };

    fabric.Object.prototype.drawControls = function (ctx) {
      var viewport = self.viewport,
          zoom = viewport ? viewport.zoom : 1,
          result;
      this.cornerSize = this.cornerSize / zoom;
      result = drawControls.apply(this, [ctx]);
      this.cornerSize = this.cornerSize * zoom;
      return result;
    };
    */

    fabric.Object.prototype._setCornerCoords = function () {
      var viewport = self.viewport,
          zoom = viewport ? viewport.zoom : 1,
          result;
      this.cornerSize = this.cornerSize / zoom;
      result = _setCornerCoords.apply(this, arguments);
      this.cornerSize = this.cornerSize * zoom;
      return result;
    };

    fabric.Object.prototype.getPointByOrigin = function () {
      var viewport = self.viewport,
          zoom = viewport ? viewport.zoom : 1,
          result;
      this.cornerSize = this.cornerSize / zoom;
      result = getPointByOrigin.apply(this, arguments);
      this.cornerSize = this.cornerSize * zoom;
      return result;
    };

  };

  /**
   * Override native fabric functions
   * @private
   */
  Zoom.prototype._updateCanvasProto = function () {
    var self = this,
        fCanvas = this.drawer.fCanvas,
        getPointer = fCanvas.getPointer,
        _drawSelection = fCanvas._drawSelection;

    fCanvas.getPointer = function (e, ignoreZoom, upperCanvasEl) {
      var pointer = getPointer.apply(this, arguments);
      if (!isFinite(pointer.x) || !isFinite(pointer.y) ) {
        var $canvasEditContainer = self.drawer.$canvasEditContainer,
            canvasEditContainerSizes = $canvasEditContainer.get(0).getBoundingClientRect(),
            eventPos = util.getEventPosition(window.event),
            offset = util.getScrollOffset(self.drawer.$canvasEditContainer),
            x = eventPos.left - offset.left - canvasEditContainerSizes.left,
            y = eventPos.top - offset.top - canvasEditContainerSizes.top;
        pointer = {
          x: x,
          y: y
        };
      }
          var offsetX = self.viewport.position.x,
          offsetY = self.viewport.position.y,
          newX = parseInt(pointer.x / self.viewport.zoom - offsetX, 10),
          newY = parseInt(pointer.y / self.viewport.zoom - offsetY, 10);
      pointer.oldX = pointer.x;
      pointer.oldY = pointer.y;
      pointer.newX = newX;
      pointer.newY = newY;
      pointer.x = newX;
      pointer.y = newY;
      return pointer;
    };

    fCanvas._drawSelection = function () {
      var ctx;
      ctx = this.contextTop;
      ctx.save();
      ctx.scale(this.viewport.zoom, this.viewport.zoom);
      ctx.translate(this.viewport.position.x, this.viewport.position.y);
      _drawSelection.apply(this, arguments);
      ctx.restore();
      return ctx;
    };
  };

  /**
   * Restore default state of zoom
   * @private
   */
  Zoom.prototype.restoreDefaultZoom = function () {
    var defaultZoomValue = this.options.defaultZoom,
        zoomCenter = this.viewport.getZoomCenter(),
        newZoomData;
    this.setZoom(defaultZoomValue, zoomCenter.x, zoomCenter.y, true);
    this.viewport.setToCenterOfCanvas(1);
    newZoomData = this.viewport.getData();
    this._updateDrawerValues(newZoomData);
  };


  /**
   * API methods
   */

  /**
   * Set zoom of current drawer instance
   * @param {Number} zoom - zoom level
   * @param {Number} [zoomCenterX] - x coord of new center point of canvas. From 0 to current canvas width
   * @param {Number} [zoomCenterY] - y coord of new center point of canvas. From 0 to current canvas height
   */
  DrawerApi.prototype.setZoom = function (zoom, zoomCenterX, zoomCenterY) {
    var zoomTool = this.drawer.getPluginInstance('Zoom');
    if (zoomTool) {
      zoomTool.setZoom(zoom, zoomCenterX, zoomCenterY, true);
    }
  };

  /**
   * Restore default state of zoom
   */
  DrawerApi.prototype.restoreDefaultZoom = function () {
    var zoomTool = this.drawer.getPluginInstance('Zoom');
    if (zoomTool) {
      zoomTool.restoreDefaultZoom();
    }
  };

  pluginsNamespace.Zoom = Zoom;
}(this, jQuery, DrawerJs.plugins, DrawerJs.DrawerApi, DrawerJs.util));