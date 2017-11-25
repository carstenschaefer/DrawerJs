(function ($, pluginsNamespace, BaseTool, util) {
  'use strict';


  var MOUSE_UP_TIMER = util.mouseUp('BaseBrushTimer');
  var MOUSE_DOWN_TIMER = util.mouseDown('BaseBrushTimer');
  /**
   * Base class for all brushes/free drawing tools.
   *
   * @param drawerInstance
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var BaseBrush = function (drawerInstance) {
    // call super constructor
    BaseTool.call(this, drawerInstance);

    // set type
    this.type = 'brush';

    // @todo : use it
    this.brushConstructor = fabric.ErasablePencilBrush;
  };


  BaseBrush.prototype = Object.create(BaseTool.prototype);
  BaseBrush.prototype.constructor = BaseBrush;

  BaseBrush.prototype.doNotZoomOnActivate = true;

  BaseBrush.prototype.createButton = function (toolbar) {
    var _this = this,
        clickHandler = function () {
          var action = _this.active ? _this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL
              : _this.drawerInstance.EVENT_DO_ACTIVATE_TOOL;

          _this.drawerInstance.trigger(action, [_this]);
        },
        buttonConfig = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: this.btnClass,
          iconClass: this.faClass,
          tooltipText: this.tooltip,
          clickHandler: clickHandler
        };


    this.$toolButton = toolbar.addButton(buttonConfig);
  };

  BaseBrush.prototype._activateTool = function () {
    // call _activateTool() of parent
    BaseTool.prototype._activateTool.call(this);
    this.drawerInstance.log('TOOL', this.name + ' : activateTool [BaseBrush]');

    var _this = this;
    var fCanvas = _this.drawerInstance.fCanvas;

    fCanvas.freeDrawingCursor =
      "url(/redactor.plugin.drawer/dist/cursor-fa-eraser.cur), default";
    fCanvas.isDrawingMode = true;

    // create brush
    if (!_this.brush) {
      if (!_this.createBrush) {
        _this.brush = new fabric.ErasablePencilBrush(_this.drawerInstance.fCanvas);
      } else {
        _this.brush = _this.createBrush();
      }
    }

    // save prev brush and set new
    _this.previousBrush = _this.drawerInstance.getBrush();
    _this.drawerInstance.setBrush(_this.brush);

    _this.drawerInstance.trigger(this.drawerInstance.EVENT_TOOL_ACTIVATED, [this]);
    // this method will be redefined in BaseBrush descendants
    this.afterActivateTool();
    this._attachTimerEvents();
  };

  /**
   * Attach event that indicates "Brush" drawing mode
   * @private
   */
  BaseBrush.prototype._attachTimerEvents = function () {
    var upperCanvasEl = this.drawerInstance.fCanvas.upperCanvasEl,
        $upperCanvasEl = $(upperCanvasEl);

    this._removeTimerEvents();
    // handle mouse down and mouse up
    $upperCanvasEl.on(MOUSE_DOWN_TIMER, this._onMouseDownTimer.bind(this));
    $(window.document).on(MOUSE_UP_TIMER, this._onMouseUpTimer.bind(this));
  };

  /**
   * Update indicator on mouse down
   * @private
   */
  BaseBrush.prototype._onMouseDownTimer = function () {
    this.drawerInstance.isBrushDrawing = true;
  };

  /**
   * Update indicator on mouse up
   * @private
   */
  BaseBrush.prototype._onMouseUpTimer = function () {
    var self = this;
    util.setTimeout(function(){
      self.drawerInstance.isBrushDrawing = false;
    },0);
  };

  /**
   * Remove events
   * @private
   */
  BaseBrush.prototype._removeTimerEvents = function () {
    var upperCanvasEl = this.drawerInstance.fCanvas.upperCanvasEl,
        $upperCanvasEl = $(upperCanvasEl);

    // handle mouse down and mouse up
    $upperCanvasEl.off(MOUSE_DOWN_TIMER);
    $(window.document).off(MOUSE_UP_TIMER);
  };

  /**
   *
   *
   * @private
   */
  BaseBrush.prototype._deactivateTool = function () {
    // call _deactivateTool() of parent
    BaseTool.prototype._deactivateTool.call(this);
    this.drawerInstance.log('TOOL', this.name + ' : deactivateTool [BaseBrush]');

    this.drawerInstance.fCanvas.isDrawingMode = false;

    // remove mouse events listening
    $(this.drawerInstance.fCanvas.upperCanvasEl)
      .off('mousedown.BaseBrush touchstart.BaseBrush');

    $(this.drawerInstance.fCanvas.upperCanvasEl)
      .off('mouseup.BaseBrush touchend.BaseBrush');

    this._removeTimerEvents();
    // restore prev brush
    this.drawerInstance.setBrush(this.previousBrush);
    this.brush = null;

    this.drawerInstance.trigger(this.drawerInstance.EVENT_TOOL_DEACTIVATED, [this]);
    // this method will be redefined in BaseBrush descendants
    this.afterDeactivateTool();
  };


  /**
   * Method MUST be redefined in descendants.
   * Method is called in the end of _deactivateTool().
   */
  BaseBrush.prototype.afterActivateTool = function () {
    throw new Error(this.name + ' should implement afterActivateTool() method.');
  };

  /**
   * Method MUST be redefined in descendants.
   * Method is called in the end of _deactivateTool().
   */
  BaseBrush.prototype.afterDeactivateTool = function () {
    throw new Error(this.name + ' should implement afterDeactivateTool() method.');
  };

  pluginsNamespace.BaseBrush = BaseBrush;

}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseTool, DrawerJs.util));

