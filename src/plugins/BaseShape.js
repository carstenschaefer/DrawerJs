(function ($, pluginsNamespace, BaseTool, util) {
  "use strict";

  /**
   * Provides mechanism to draw shapes like in photoshop.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * @memberof DrawerJs.plugins
   * @constructor
   */
  var BaseShape = function BaseShapeConstructor(drawerInstance) {
    if (!drawerInstance) {
      throw new Error("BaseShape CTOR : drawerInstance is not set!");
    }

    // call super constructor
    BaseTool.call(this, drawerInstance);
    var _this = this;
    this.drawer = drawerInstance;

    this.type = 'shape';
    this.objectBaseType = 'shape';
    /**
     * List of tool options to show when tool is activated
     * @type {Array}
     */
    this.toolOptionsList = ['color', 'border', 'opacity'];

    this.drawingInProgress = false;
    this.onlyOneItem = true;

    this.MOUSEMOVE = this.getEventId(['mousemove', 'touchmove']);
    this.MOUSEDOWN = this.getEventId(['mousedown', 'touchstart']);
    this.MOUSEUP = this.getEventId(['mouseup', 'touchend']);
  };


  BaseShape.prototype = Object.create(BaseTool.prototype);
  BaseShape.prototype.constructor = BaseShape;

  /**
   * Min size of shape in px. If less - shape will not be added
   * @type {number}
   */
  BaseShape.prototype.minShapeSize = 4;

  /**
   * Min size of shape in px for touch devices. If less - shape will not be added
   * @type {number}
   */
  BaseShape.prototype.minShapeSizeForTouch = 15;


  BaseShape.CENTERING_MODE = {
    NORMAL: 'normal',
    FROM_CENTER: 'from_center'
  };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  BaseShape.prototype._setupOptions = function (options, pluginName, doNotSave) {
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

  BaseShape.prototype.getEventId = function (event) {
    var _this = this;

    if (event instanceof String) {
      event = [event];
    }

    if (event instanceof Array) {
      return event.map(function (e) {
        return e + '.drawerTool' + _this.btnClass;
      }).join(' ');
    }
  };

  BaseShape.prototype._activateTool = function () {
    if (this.active)
      return;

    // call _activateTool() of parent
    BaseTool.prototype._activateTool.call(this);

    this.drawerInstance.log('TOOL', this.name + ' : _activateTool() [BaseShape]');

    var _this = this;

    // show no tooltip on touch devices
    if (!this.drawerInstance.touchDevice) {
      _this.showHelpTooltip();
    }

    var fCanvas = this.drawerInstance.fCanvas;
    // remove all active selection
    fCanvas.disableSelection();

    fCanvas.renderAll();

    fCanvas.defaultCursor = 'crosshair';

    if (this.setUpHandlers) {
      this.setUpHandlers();
    } else {
      this._setUpHandlers();
    }
  };


  BaseShape.prototype._setUpHandlers = function () {
    var _this = this;
    var fCanvas = this.drawerInstance.fCanvas;

    $(fCanvas.upperCanvasEl).on(_this.MOUSEDOWN, function (event) {
      _this.drawerInstance.log('baseShape', 'mousedown');

      $(fCanvas.upperCanvasEl).off(_this.MOUSEDOWN);

      // no tooltip was shown on touch devices
      if (!_this.drawerInstance.touchDevice) {
        _this.removeHelpTooltip();
      }

      if (fCanvas.getActiveObject()) {
        return true;
      }

      if (_this.drawingInProgress) {
        _this.finishItemDraw();
        return true;
      }

      _this.drawingInProgress = true;
      _this.drawerInstance.drawingInProgress = true;
      var startPointCoords = _this.drawer.fCanvas.getPointer(event, true);

      if (!_this.createShape) {
        throw new Error('createShape method does not exist', _this);
      }

      _this.shape = _this.createShape(
          startPointCoords.x,
          startPointCoords.y
      );

      _this.drawerInstance.trigger(_this.drawerInstance.EVENT_ZOOM_SET);
      fCanvas.add(_this.shape);
      _this.drawerInstance.trigger(_this.drawerInstance.EVENT_ZOOM_RESTORE);

      $(document).on(_this.MOUSEMOVE, function (event) {
        var pointCoords = _this.drawer.fCanvas.getPointer(event);

        if (!_this.updateShape) {
          throw new Error('updateShape method does not exist', _this);
        }

        _this.updateShape(_this.shape,
            pointCoords.x,
            pointCoords.y
        );

        fCanvas.renderAll();
      });

      $(document).on(_this.MOUSEUP, function () {
        _this.drawerInstance.log('baseShape', 'mouseup');
        var minSize = _this.drawer.touchDevice ? _this.minShapeSizeForTouch : _this.minShapeSize,
            widthIsSmaller = _this.shape.width < minSize,
            heightIsSmaller = !_this.checkOnlyWidth && (_this.shape.height < minSize),
            shapeIsSmaller = _this.checkOnlyWidthOrHeight ? widthIsSmaller && heightIsSmaller : widthIsSmaller || heightIsSmaller,
            preventAddOfShape = shapeIsSmaller;

        // Check, if shape is too small.
        // for desktop this is ok - shape will still follow mouse and
        // drawing will be stopped when user make a second click
        // but for touch devices this will not work so we simply remove a
        // shape if its too small but allow him to draw another.

        if (preventAddOfShape) {
            _this.shape.remove();
            _this.shape = null;

            _this._deactivateTool();
            _this._activateTool();
            return;
          }

        // finish drawing
          _this.finishItemDraw();

          // some tools are supposed to draw one shape and then deactivate
        if (_this.onlyOneItem) {
            _this.drawerInstance.trigger(_this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL, _this);
        }

      });
    });
  };

  BaseShape.prototype.finishItemDraw = function () {
    var _this = this;
    var fCanvas = _this.drawerInstance.fCanvas;

    fCanvas.defaultCursor = 'default';

    if (!this.drawerInstance.touchDevice) {
      _this.removeHelpTooltip();
    }
    fCanvas.deactivateAll();
    fCanvas.calcOffset();

    _this.drawingInProgress = false;
    util.setTimeout(function(){
      _this.drawerInstance.drawingInProgress = false;
    });
    $(document).off(_this.MOUSEMOVE);
    $(document).off(_this.MOUSEUP);

    // call finishShape, if it is implemented
    if (this.finishShape) {
      this.finishShape(this.shape);
    }

    if (_this.shape) {
      if (_this.shape.width < 0) {
        _this.shape.set('width', _this.shape.width * -1);
        _this.shape.set('left', _this.shape.left - _this.shape.width);
        _this.shape.set('flipX', true);
      }
      if (_this.shape.height < 0) {
        _this.shape.set('height', _this.shape.height * -1);
        _this.shape.set('top', _this.shape.top - _this.shape.height);
        _this.shape.set('flipY', true);
      }

      var newShape = _this.shape.clone();

      _this.shape.remove();
      _this.shape = null;

      fCanvas.deactivateAll();

      fCanvas.add(newShape);

      fCanvas.restoreSelection();

      fCanvas.renderAll();
      fCanvas.calcOffset();
      fCanvas.renderAll();
    }
  };

  BaseShape.prototype._deactivateTool = function () {
    if (!this.active) {
      return;
    }
    // call _deactivateTool() of parent
    BaseTool.prototype._deactivateTool.call(this);

    this.drawerInstance.log('TOOL', this.name + ' : _deactivateTool() [BaseShape]');

    this.finishItemDraw();

    $(this.drawerInstance.fCanvas.upperCanvasEl)
      .off(this.MOUSEDOWN);

    this.drawerInstance.fCanvas.restoreSelection();
  };


  BaseShape.prototype.showHelpTooltip = function () {
    var _this = this;
    var fCanvas = _this.drawerInstance.fCanvas;

    var helpText = '';
    if (this.helpTooltipText) {
      helpText = this.helpTooltipText;
    } else {
      helpText = _this.drawerInstance.t('Click to start drawing a ') +
          '<i class="fa ' + _this.faClass + '"></i>';
    }

    _this.cursorTooltip = $(
        '<div class="drawer-tool-mouse-tooltip ' + this.btnClass + '">' +
        helpText +
        '</div>'
    );

    $('body').append(_this.cursorTooltip);
    $(fCanvas.upperCanvasEl)
        .on('mousemove.drawer-tool-mouse-toolip', function (event) {
          _this.cursorTooltip.css('left', event.pageX);
          _this.cursorTooltip.css('top', event.pageY);
        });

    $(fCanvas.upperCanvasEl).on('mouseleave', function () {
      _this.cursorTooltip.css('opacity', 0);
    });

    $(fCanvas.upperCanvasEl).on('mouseenter', function () {
      _this.cursorTooltip.css('opacity', 1);
    });
  };

  BaseShape.prototype.removeHelpTooltip = function () {
    if (this.cursorTooltip) {
      $('body').off('mousemove.drawer-tool-mouse-toolip');
      this.cursorTooltip.fadeOut();
      this.cursorTooltip.remove();
    }
  };


  pluginsNamespace.BaseShape = BaseShape;

}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseTool, DrawerJs.util));
