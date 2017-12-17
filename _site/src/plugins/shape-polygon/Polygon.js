(function ($, BaseShape, pluginsNamespace, util) {
  "use strict";

  var MOUSE_DOWN = util.mouseDown('Polygon');
  var MOUSE_MOVE = util.mouseMove('Polygon');
  var MOUSE_UP = util.mouseUp('Polygon');

  /**
   * Provides a polygon button which can be used to draw polygons.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} options
   * Configuration object.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var Polygon = function PolygonConstructor(drawerInstance, options) {
    var _this = this;

    BaseShape.call(_this, drawerInstance);

    this.name = 'Polygon';
    this.btnClass = 'btn-polygon';
    this.faClass = 'fa-star';
    this.tooltip = drawerInstance.t('Draw a Polygon');
    this.helpTooltipText = drawerInstance.t('Click to start a new line');

    this.options = options || {};
    this.centeringMode =
      this.options.centeringMode || BaseShape.CENTERING_MODE.NORMAL;

    drawerInstance.on(drawerInstance.EVENT_EDIT_STOP, function () {
      _this.finishDraw();
    });

    drawerInstance.on(drawerInstance.EVENT_DO_ACTIVATE_TOOL,
      function (event, tool) {
        if (!(tool instanceof Polygon)) {
          _this.finishDraw();
        }
      });
  };

  Polygon.prototype = Object.create(BaseShape.prototype);
  Polygon.prototype.constructor = Polygon;

  Polygon.prototype.setUpHandlers = function () {
    var _this = this;

    _this.drawerInstance.fCanvas._oldSelectionState = _this.drawerInstance.fCanvas.selection;
    _this.drawerInstance.fCanvas.selection = false;

    _this.$stopButton = $('<button class="stop-polygon">' +
      _this.drawerInstance.t('Stop drawing a polygon') +
    '</button>');
    _this.drawerInstance.$canvasEditContainer.append(_this.$stopButton);
    _this.$stopButton.click(function () {
      _this.finishDraw();
    });

    _this.drawerInstance
      .on(_this.drawerInstance.EVENT_KEYDOWN, function (event, originalEvent) {
        if (originalEvent.which == 27) {
          _this.finishDraw();
        }
      });

    var drawingArea = $(this.drawerInstance.fCanvas.upperCanvasEl);

    var newPointHandler = function (event) {
      _this.addNewPoint(event);

      if (!_this.poly.__mouseEventSet) {
        _this.setUpMoveEvent();
        _this.poly.__mouseEventSet = true;
      }

      _this.drawerInstance.fCanvas.renderAll();
    };

    if (_this.drawerInstance.touchDevice) {
      drawingArea.on(MOUSE_DOWN, function (event) {
        newPointHandler(event);
        event.preventDefault();
        event.stopPropagation();
        return false;
      });

      drawingArea.on(MOUSE_UP, function (event) {
        drawingArea.off(MOUSE_MOVE);
        _this.poly.__mouseEventSet = false;
        event.preventDefault();
        event.stopPropagation();
        return false;
      });
    } else {
      drawingArea.on(MOUSE_DOWN, function (event) {
        newPointHandler(event);
        event.preventDefault();
        event.stopPropagation();
        return false;
      });
    }
  };

  Polygon.prototype.addNewPoint = function (event) {
    var _this = this,
        pointCoords = this.drawer.fCanvas.getPointer(event),
        left = pointCoords.x,
        top = pointCoords.y;

    if (!_this.poly) {
      _this.startLeft = left;
      _this.startTop = top;

      _this.poly = new fabric.SegmentablePolygon([[
        {
          x: 0,
          y: 0
        }
      ]]);
      _this.poly.set('fill', _this.drawerInstance.activeColor);
      _this.poly.set('opacity', _this.drawerInstance.activeOpacity);
      _this.poly.set('left', left);
      _this.poly.set('top', top);
      _this.poly.set('evented', false);
      _this.poly.set('selectable', false);
      _this.drawerInstance.fCanvas.add(_this.poly);
    }

    var points = _this.poly.get('points');

    var centerPoint = _this.poly.getCenterPoint();
    left = left - centerPoint.x;
    top = top - centerPoint.y;

    points[0].push({
      x: left,
      y: top
    });

    _this.poly.set('points', points);

    _this.fixPosition();
  };

  Polygon.prototype.setUpMoveEvent = function () {
    var _this = this;
    var drawingArea = $(this.drawerInstance.fCanvas.upperCanvasEl);

    drawingArea.on(MOUSE_MOVE, function (event) {
      var points = _this.poly.get('points'),
          pointCoords = _this.drawerInstance.fCanvas.getPointer(event),
          centerPoint = _this.poly.getCenterPoint(),
          left = pointCoords.x - centerPoint.x,
          top = pointCoords.y - centerPoint.y;

      if (points[0].length >= 2) {
        points[0][points[0].length - 1].x = left;
        points[0][points[0].length - 1].y = top;

        _this.poly.set('points', points);

        _this.fixPosition();

        _this.drawerInstance.fCanvas.renderAll();
      }
    });
  };

  Polygon.prototype.fixPosition = function () {
    var _this = this;

    _this.poly._fixPoints();
    _this.poly.setCoords();

    var points = _this.poly.get('points');

    var centerPoint = _this.poly.getCenterPoint();
    var firstPointX = centerPoint.x + points[0][0].x;
    var firstPointY = centerPoint.y + points[0][0].y;

    var firstPointGlobalX = firstPointX;
    var firstPointGlobalY = firstPointY;

    var xDiff = _this.startLeft - firstPointGlobalX;
    var yDiff = _this.startTop - firstPointGlobalY;
    _this.poly.set('left', _this.poly.get('left') + xDiff);
    _this.poly.set('top', _this.poly.get('top') + yDiff);
  };

  Polygon.prototype.finishDraw = function () {
    var _this = this;

    _this.drawerInstance.fCanvas.selection = _this.drawerInstance.fCanvas._oldSelectionState;

    var drawingArea = $(this.drawerInstance.fCanvas.upperCanvasEl);

    drawingArea.off(MOUSE_MOVE);
    drawingArea.off(MOUSE_DOWN);
    drawingArea.off(MOUSE_UP);

    util.unbindLongPress(drawingArea, 'polygon');

    if (_this.poly) {
      // only remove last point for non-touch device
      if (!_this.drawerInstance.touchDevice) {
        var points = this.poly.get('points');
        points[0].splice(points[0].length - 1, 1);
        this.poly.set('points', points);
      }

      this.fixPosition();

      _this.poly.set('evented', true);
      _this.poly.set('selectable', true);

      var cloned = this.poly.clone();
      this.drawerInstance.fCanvas.add(cloned);
      this.drawerInstance.fCanvas.remove(this.poly);
    }

    this.poly = null;

    this.drawerInstance.fCanvas.renderAll();
    if (_this.$stopButton) {
      util.setTimeout(function () {
        _this.$stopButton.remove();
      }, 1);
    }

    this._deactivateTool();
  };

  pluginsNamespace.Polygon = Polygon;

}(jQuery, DrawerJs.plugins.BaseShape, DrawerJs.plugins, DrawerJs.util));