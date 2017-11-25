(function ($, brushes, BaseBrush, pluginsNamespace, util) {
  'use strict';

  var MOUSE_UP = util.mouseUp('Eraser');
  var MOUSE_DOWN = util.mouseDown('Eraser');
  var MOUSE_MOVE = util.mouseMove('Eraser');
  var MOUSE_ENTER_CURSOR = 'mouseenter.EraserCursor';
  var MOUSE_LEAVE_CURSOR = 'mouseleave.EraserCursor';

  /**
   * Provides an eraser which allows to erase any drawing/shapes.
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
   * @memberof DrawerJs.plugins
   *
   * @constructor
   * @augments DrawerJs.plugins.BaseBrush
   */
  var Eraser = function (drawerInstance, options) {
    var _this = this;

    BaseBrush.call(_this, drawerInstance);

    this.name = 'Eraser';
    this.btnClass = 'btn-eraser';
    this.faClass = 'fa-eraser';
    this.tooltip = drawerInstance.t('Eraser');

    this.separatePathOnShapes = true;

    _this._defaultOptions = {
      cursorUrl: 'none',
      brushSize: 3,
      useCoordsQueue: false
    };

    this._setupOptions(options);

    /**
     * List of tool options to show when tool is activated.
     * Deviating from BaseShape tool, Line has no 'color', only 'border'.
     * @type {String[]}
     */
    this.toolOptionsList = ['brushSize'];

    /**
     *
     * @type {boolean}
     */
    this.forceOptionsHide = true;

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

    /**
     * Boolean flag showing if we are in erasing mode
     * @type {Boolean}
     */
    this.erasingNow = false;

    /**
     * Eraser brush
     * @type {fabric.Brush}
     */
    this.brush = null;
  };


  Eraser.prototype = Object.create(BaseBrush.prototype);
  Eraser.prototype.constructor = Eraser;


  ////// STATR/STOP TOOL METHODS ////////////////////////////////////////////////////////////////////
  /**
   * This method is called in BaseBrush._activateTool()
   * Children of BaseBrush MUST implement afterActivateTool()
   */
  Eraser.prototype.afterActivateTool = function () {
    var drw = this.drawerInstance;
    var fCanvas = drw.fCanvas;

    // set cursor
    this._previousCursor = drw.fCanvas.freeDrawingCursor;
    drw.fCanvas.freeDrawingCursor = this.options.cursorUrl;

    // set eraser brush
    this.brush = this._createBrush();
    drw.setBrush(this.brush);

    // on brush size change - update our cursor size
    drw.on(drw.EVENT_BRUSH_SIZE_CHANGED, this._updateCursorShapeSize.bind(this));

    // set all mouse handlers:
    // handle mouse move while tool is active
    $(fCanvas.upperCanvasEl).on(MOUSE_MOVE,  this._onMouseMove.bind(this));

    // handle mouse down and mouse up
    $(fCanvas.upperCanvasEl).on(MOUSE_DOWN, this._onMouseDown.bind(this));
    $(fCanvas.upperCanvasEl).on(MOUSE_UP, this._onMouseUp.bind(this));

    // create cursor
    this._createEraserCursorShape();

    // handle mouse leave / enter canvas (to hide/show cursor)
    $(fCanvas.upperCanvasEl).on(MOUSE_ENTER_CURSOR, this._showEraserCursorShape.bind(this));
    $(fCanvas.upperCanvasEl).on(MOUSE_LEAVE_CURSOR, this._hideEraserCursorShape.bind(this));


    // on eraser path created - do work
    fCanvas.on('path:created', this._onEraserPathCreated.bind(this));
  };


  /**
   * After tool deactivation - remove all event handlers
   * This method is called in BaseBrush._activateTool()
   * Children of BaseBrush MUST implement afterDeactivateTool.
   */
  Eraser.prototype.afterDeactivateTool = function () {
    var fCanvas = this.drawerInstance.fCanvas;

    // switch erasing off
    this.erasingNow = false;

    fCanvas.off('path:created');

    // restore cursor
    fCanvas.freeDrawingCursor = this._previousCursor;
    // remove cursorShape
    this._removeEraserCursorShape();

    $(fCanvas.upperCanvasEl).off(MOUSE_MOVE);
    $(fCanvas.upperCanvasEl).off(MOUSE_UP);
    $(fCanvas.upperCanvasEl).off(MOUSE_DOWN);

    $(fCanvas.upperCanvasEl).off(MOUSE_ENTER_CURSOR);
    $(fCanvas.upperCanvasEl).off(MOUSE_LEAVE_CURSOR);
  };


  /**
   * Create eraser brush
   */
  Eraser.prototype._createBrush = function () {
    var brush = new brushes.EraserBrush(this.drawerInstance.fCanvas);

    brush.color = '#fff';
    brush.opacity = this.drawerInstance.activeOpacity;
    brush.width = this.options.brushSize;

    return brush;
  };


  ////// ERASER CURSOR METHODS //////////////////////////////////////////////////////////////////////
  /**
   * Create shape, that will be used as eraser cursor
   */
  Eraser.prototype._createEraserCursorShape = function () {
    // eraser shape setup
    var eraserPolyRadius = this.drawerInstance.getBrushSize() / 2;

    this.eraserCursorShape = new fabric.PCircle({
      radius: eraserPolyRadius
    });

    this.drawerInstance.fCanvas.add(this.eraserCursorShape);

    this.eraserCursorShape.isEraserBrush = true;
    this.eraserCursorShape.set('fill', 'transparent');
    this.eraserCursorShape.set('stroke', 'black');
    this.eraserCursorShape.set('strokeWidth', 1);
    this.eraserCursorShape.set('originX', 'center');
    this.eraserCursorShape.set('originY', 'center');

    this._updateCursorShapeSize();
  };


  /**
   * Remove eraser shape, that was used as eraser cursor
   */
  Eraser.prototype._removeEraserCursorShape = function () {
    if(this.eraserCursorShape){
      this.eraserCursorShape.remove();
      delete this.eraserCursorShape;
    }
  };

  /**
   * Show eraser cursor shape
   */
  Eraser.prototype._showEraserCursorShape = function () {
    this.eraserCursorShape.set('visible', true);
    this.drawerInstance.fCanvas.renderAll();
  };

  /**
   * Hide eraser cursor shape
   */
  Eraser.prototype._hideEraserCursorShape = function () {
    this.eraserCursorShape.set('visible', false);
    this.drawerInstance.fCanvas.renderAll();
  };


  /**
   * Update our cursor shape size to be same as brush size
   */
  Eraser.prototype._updateCursorShapeSize = function () {
    if (!this.eraserCursorShape) {
      return;
    }

    var eraserPolyRadius = this.drawerInstance.getBrushSize() / 2;
    var eraserPolyDashSize = (2 * Math.PI * eraserPolyRadius) / 20;
    this.eraserCursorShape.set('radius', eraserPolyRadius);
    this.eraserCursorShape.set('strokeDashArray', [
      eraserPolyDashSize, eraserPolyDashSize
    ]);
  };



  ////// ERASER PATH METHODS //////////////////////////////////////////////////////////////////////
  /**
   * After eraser path was created - apply it to all affected shapes.
   * @param  {fabric.Event} e
   */
  Eraser.prototype._onEraserPathCreated = function (e) {
    var fCanvas = this.drawerInstance.fCanvas;

    e.path.set('eraserPath', true);
    e.path.set('visible', true);

    for (var i = 0; i < this.affectedShapes.length; i++) {
      var shape = this.affectedShapes[i];
      delete shape.eraserAffected;
      shape.addEraserPath(e.path);
    }

    fCanvas.renderAll();
  };


  /**
   * Look, which erasable objects are under eraser.
   * Add them to affectedShapes[]
   *
   * @param {number} x
   * @param {number} y
   * @private
   */
  Eraser.prototype._affectShapesUnderCoords = function (x, y) {
    var fCanvas = this.drawerInstance.fCanvas;
    var allObjects = fCanvas.getObjects();

    this.eraserCursorShape._lastCenterPosition = {x: x, y: y};
    for (var i = 0; i < allObjects.length; i++) {
      var obj = allObjects[i];
      // if object is non-erasable or if already affected by our eraser- skip it
      if (!obj.isErasable || obj.eraserAffected || obj.isEraserBrush)
        continue;

      var addPathToObject = this._checkObjectIntersection(obj, x, y);
      if (addPathToObject) {
        obj.eraserAffected = true;
        this.affectedShapes.push(obj);
      }
    }
  };
  
    /**
     * Check if object is intersected with eraser brush
     *
     * @param {object} obj
     * @param {number} x
     * @param {number} y
     * @private
     */

    Eraser.prototype._checkObjectIntersection = function (obj, x, y) {
      var result,
          circleObj = this.eraserCursorShape,
          rectsAreIntersects = circleObj.intersectsWithObject(obj),
          objContainsCenterOfBrush,
          objContainsPointFromPerimeter;

      if (rectsAreIntersects) {
        objContainsCenterOfBrush = !obj.canvas.isTargetTransparent(obj, x, y);
        if (!objContainsCenterOfBrush) {
          var deltaX = circleObj._lastCenterPosition ? x - circleObj._lastCenterPosition.x : undefined,
              deltaY = circleObj._lastCenterPosition ? y - circleObj._lastCenterPosition.y : undefined,
              perimeterPoints = circleObj.getPerimeterPoints(deltaX, deltaY);
          perimeterPoints.forEach(function (pointCoords, i) {
            if (!objContainsPointFromPerimeter) {
              objContainsPointFromPerimeter = !obj.canvas.isTargetTransparent(obj, pointCoords.x, pointCoords.y);
            }
          });
        }
      }
      result = objContainsCenterOfBrush || objContainsPointFromPerimeter;
      return result;
    };


  ////// MOSUE HANDLERS //////////////////////////////////////////////////////////////////////
  /**
   * Set erasingNow to true.
   * Eraser path will start by current brush, independently.
   * @param {Event} e - mouse down event
   */
  Eraser.prototype._onMouseDown = function (e) {
    var rightClick = e.which === 3,
        middleClick = e.which === 2;
    if (!rightClick && !middleClick) {
      // reset affectedShapes[]
      this.affectedShapes = [];
      // turn erasing on
      this.erasingNow = true;
    }
  };


  /**
   * On mouse up - set erasingNow to false.
   * Eraser path will be created soon, and
   * main work on erasing will be  done in _onEraserPathCreated()
   */
  Eraser.prototype._onMouseUp = function () {
    this.erasingNow = false;
    this.drawerInstance.fCanvas.renderAll();
  };

  /**
   * Listens for mouse movement when eraser is active.
   *
   * @param {Event} event
   * @private
   */
  Eraser.prototype._onMouseMove =  function (event) {
    // calc mouse event coords relative to canvas
    var pointCoords = this.drawer.fCanvas.getPointer(event);
    var left = pointCoords.x;
    var top = pointCoords.y;

    // move eraser shape to make it follow mouse pointer
    if(this.eraserCursorShape){
      // eraser shape could not be created on touch devices because there's no mouseenter events
      this.eraserCursorShape.set('left', pointCoords.x);
      this.eraserCursorShape.set('top', pointCoords.y);
      this.eraserCursorShape.setCoords();

      this.drawerInstance.fCanvas.renderAll();
    }

    if (this.erasingNow) {
        // Look, if there are erasable shapes under cursor
        if (this.separatePathOnShapes) {
          this._affectShapesUnderCoords(left, top);
        }
    }
  };



  pluginsNamespace.Eraser = Eraser;

}(
  jQuery,
  DrawerJs.brushes,
  DrawerJs.plugins.BaseBrush,
  DrawerJs.plugins,
  DrawerJs.util
));