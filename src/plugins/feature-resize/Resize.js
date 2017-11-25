(function ($, pluginsNamespace, util) {
  /**
   * Provides a control for canvas resizing.
   * Supports both mouse/touch.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var ResizeTool = function ResizeConstructor(drawerInstance) {
    var self = this;

    this.drawerInstance = drawerInstance;
    this.name = 'DrawerPluginResize';
    this.LOGTAG = this.name;

    this.MOUSEDOWN = util.mouseDown('drawerPluginResize');
    this.MOUSEUP = util.mouseUp('drawerPluginResize');
    this.MOUSEMOVE = util.mouseMove('drawerPluginResize');

    // on toolbar create
    this._bindedOnToolbarCreated = this._onToolbarCreated.bind(this);
    drawerInstance.on(this.drawerInstance.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);

    drawerInstance.on(this.drawerInstance.EVENT_RESIZER_HIDE, this.resizerHide.bind(this));
    drawerInstance.on(this.drawerInstance.EVENT_RESIZER_SHOW, this.resizerShow.bind(this));
  };

  /**
   * On toolbar created - create tool button.
   */
  ResizeTool.prototype._onToolbarCreated = function () {
      this.createControls();
  };


  /**
   * Deletes tool button.
   * If  doDeleteToolbarCreationListeners is true - removes listeners of toolbar creation event.
   * So, tool will not appear on toolbar next time, when toolbar is created.
   *
   * @param {boolean} doDeleteToolbarCreationListeners
   */
  ResizeTool.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
      if (this.deleteControls) {
          this.deleteControls();
      }

      // stop listening toolbar creation
      if (doDeleteToolbarCreationListeners) {
          this.drawerInstance.off(this.drawerInstance.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
      }
  };


  ResizeTool.prototype.createControls = function() {
    this.deleteControls();
    this.appendResizeControl();
  };


  ResizeTool.prototype.deleteControls = function() {
    if (this.$canvasResizer && this.$canvasResizer.length) {
      this.$canvasResizer.remove();
    }
  };



  ResizeTool.prototype.appendResizeControl = function () {
    var _this = this;

    var $document = $(window.document),
        $body = $('body'),
        $elemForEvent = $document; // cache body elem for performance

    var $editContainer = _this.drawerInstance.$canvasEditContainer;

    this.$canvasResizer = $('<span class="redactor-drawer-resizer">' +
    '<span class="resizer-box"></span></span>');

    if (this.drawerInstance.touchDevice) {
      this.$canvasResizer.find('.resizer-box').addClass('touch');
    }

    $editContainer.append(this.$canvasResizer);

    this.$canvasResizer.find('.resizer-box')
      .on(this.MOUSEDOWN, function (event) {

        var eventPos = util.getEventPosition(event);

        _this.drawerInstance.log(_this.LOGTAG, 'resize start');
        _this.resizeOriginalWidth = _this.drawerInstance.width;
        _this.resizeOriginalHeight = _this.drawerInstance.height;
        _this.resizeStartX = eventPos.left;
        _this.resizeStartY = eventPos.top;

        var $body = $('body');
        $body.addClass('drawer-resizing');

        _this.drawerInstance.trigger(_this.drawerInstance.EVENT_CANVAS_START_RESIZE);
        _this.drawerInstance.resizingNow = true;

        $elemForEvent.on(_this.MOUSEMOVE, function (moveEvent) {
          moveEvent.stopPropagation();
          moveEvent.preventDefault();

          var moveEventPos = util.getEventPosition(moveEvent);

          var xDiff = _this.resizeStartX - moveEventPos.left;
          var yDiff = _this.resizeStartY - moveEventPos.top;

          var resizeDrawerFunc = function resizeDrawerFunc() {
            _this.drawerInstance.setSize(
                _this.resizeOriginalWidth - xDiff,
                _this.resizeOriginalHeight - yDiff
            );

            _this.drawerInstance.trigger(_this.drawerInstance.EVENT_CANVAS_RESIZING);
          };

          util.requestAnimationFrame(resizeDrawerFunc);
          return false;
        });

        // register global mouseUp handler so no matter where user
        // will release a button we should receive that event
        // and finish resizing.
        $elemForEvent.on(_this.MOUSEUP, function (upEvent) {
          $body.removeClass('drawer-resizing');

          $elemForEvent.off(_this.MOUSEMOVE);
          $elemForEvent.off(_this.MOUSEUP); // clean up this handler
          _this.drawerInstance.log(_this.LOGTAG, 'resize finished by mouseup');
          _this.resizeFinished();
        });

        // Also it's good to intercept mouse leaving from editor area
        // $body.on('mouseleave.canvasResizer', function () {
        //     $body.off(_this.MOUSEMOVE);
        //     $body.off('mouseleave.canvasResizer');

        //     _this.drawerInstance.log(_this.LOGTAG,
        //       'resize finished leaving redactor\' area.');

        //     _this.resizeFinished();
        // });

      });
  };

  /**
   * Hide resize elements
   */
  ResizeTool.prototype.resizerHide = function() {
    if (this.$canvasResizer && this.$canvasResizer.length) {
      this.$canvasResizer.addClass('hidden');
    }
  };

  /**
   * Show resize elements
   */
  ResizeTool.prototype.resizerShow = function() {
    if (this.$canvasResizer && this.$canvasResizer.length) {
      this.$canvasResizer.removeClass('hidden');
    }
  };


  ResizeTool.prototype.resizeFinished = function() {
    this.drawerInstance.onCanvasModified();
    this.drawerInstance.resizingNow = false;

    console.log('[resize]', 'EVENT_CANVAS_STOP_RESIZE');
    this.drawerInstance.trigger(this.drawerInstance.EVENT_CANVAS_STOP_RESIZE);
  };

  pluginsNamespace.Resize = ResizeTool;
}(jQuery, DrawerJs.plugins, DrawerJs.util));