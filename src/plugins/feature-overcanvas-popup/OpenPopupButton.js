(function ($, pluginsNamespace, util) {
  "use strict";

  var emptyFunc = function () {};

  var MOUSE_UP = util.mouseUp('OpenPopupButton');
  var MOUSE_DOWN = util.mouseDown('OpenPopupButton');
  var MOUSE_MOVE = util.mouseMove('OpenPopupButton');

  /**
   * Provides a button to open popup
   *
   * @param {DrawerJs.Drawer} drawer
   * @param {Object} options
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var OpenPopupButton = function OpenPopupButtonConstructor(drawer, options) {
    /**
     * @type {Drawer}
     */
    this.drawer = drawer;
    this._setupOptions(options);

    drawer.on(drawer.EVENT_OPTIONS_TOOLBAR_CREATED, this._onToolbarCreated.bind(this));
    drawer.on(drawer.EVENT_FLOATING_TOOLBAR_CREATED, this._init.bind(this));
  };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  OpenPopupButton.prototype._setupOptions = function (options, pluginName, doNotSave) {
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
   * Init
   * @private
   */
  OpenPopupButton.prototype._init = function (ev, toolbar) {
    if (this.needToInitButton) {
      this.createControls(toolbar);

      this.drawer.off(this.drawer.EVENT_OBJECT_SELECTED, this._onObjectSelected.bind(this));
      this.drawer.on(this.drawer.EVENT_OBJECT_SELECTED, this._onObjectSelected.bind(this));

      this.drawer.off(this.drawer.EVENT_SELECTION_CLEARED, this._onSelectionCleared.bind(this));
      this.drawer.on(this.drawer.EVENT_SELECTION_CLEARED, this._onSelectionCleared.bind(this));

      this.drawer.off(this.drawer.EVENT_DO_ACTIVATE_TOOL, this._onActivateTool.bind(this));
      this.drawer.on(this.drawer.EVENT_DO_ACTIVATE_TOOL, this._onActivateTool.bind(this));

      this.drawer.off(this.drawer.EVENT_DO_DEACTIVATE_TOOL, this._onDeactivateTool.bind(this));
      this.drawer.on(this.drawer.EVENT_DO_DEACTIVATE_TOOL, this._onDeactivateTool.bind(this));

      this.drawer.off(this.drawer.EVENT_DO_DEACTIVATE_ALL_TOOLS, this._onDeactivateAllTools.bind(this));
      this.drawer.on(this.drawer.EVENT_DO_DEACTIVATE_ALL_TOOLS, this._onDeactivateAllTools.bind(this));

      this.drawer.off(this.drawer.EVENT_CANVAS_START_RESIZE, this.hideButton.bind(this));
      this.drawer.on(this.drawer.EVENT_CANVAS_START_RESIZE, this.hideButton.bind(this));

      this.drawer.off(this.drawer.EVENT_CANVAS_STOP_RESIZE, this.refreshPosition.bind(this));
      this.drawer.on(this.drawer.EVENT_CANVAS_STOP_RESIZE, this.refreshPosition.bind(this));

      this.drawer.off(this.drawer.EVENT_OVERCANVAS_BUTTON_HIDE, this.hideButton.bind(this));
      this.drawer.on(this.drawer.EVENT_OVERCANVAS_BUTTON_HIDE, this.hideButton.bind(this));

      this.drawer.off(this.drawer.EVENT_OVERCANVAS_BUTTON_SHOW, this.showButton.bind(this));
      this.drawer.on(this.drawer.EVENT_OVERCANVAS_BUTTON_SHOW, this.showButton.bind(this));

      this.drawer.off(this.drawer.EVENT_IMAGE_CROP, this.hideButton.bind(this));
      this.drawer.on(this.drawer.EVENT_IMAGE_CROP, this.hideButton.bind(this));
    }
  };

  /**
   * React on toolbar created
   * @private
   */
  OpenPopupButton.prototype._onToolbarCreated = function (ev, toolbar) {
    this.toolbar = toolbar;

    var toolOptionsToolbarHavePopupPosition = toolbar.options.compactType === toolbar.POPUP,
        toolbarIsHidden = toolbar.options.hidden,
        needToInitButton = toolOptionsToolbarHavePopupPosition && !toolbarIsHidden;

    this.needToInitButton = needToInitButton;
  };

  /**
   * React on object selected
   * @private
   */

  OpenPopupButton.prototype._onObjectSelected = function (event) {
    this.showButton();
  };


  /**
   * React on tool activation
   * @private
   */

  OpenPopupButton.prototype._onActivateTool = function (event) {
    this.showButton();
  };

  /**
   * React on tool deactivation
   * @private
   */

  OpenPopupButton.prototype._onDeactivateTool = function (event) {
    this.hideButton();
  };

  /**
   * React on tools deactivation
   * @private
   */

  OpenPopupButton.prototype._onDeactivateAllTools = function (event, dataFromEvent) {
    var isBeforeActivateTool = dataFromEvent && dataFromEvent.beforeActivateTool,
        needToHide = !isBeforeActivateTool;
    if (needToHide) {
      this.hideButton();
    }
  };

  /**
   * React on selection change
   * @private
   */

  OpenPopupButton.prototype._onSelectionCleared = function (event, fabricEvent) {
    var needToHideButton = !this.drawer.activeDrawingTool;
    if (needToHideButton) {
      this.hideButton();
    }
  };

  /**
   * @param {DrawerToolbar} toolbar
   * @private
   */
  OpenPopupButton.prototype.createControls = function (toolbar) {
    this._createAndAddButton(toolbar);
    this._setInitialPosition();
    this.showButton();
  };

  /**
   * Deletes tool button.
   * If  doDeleteToolbarCreationListeners is true - removes listeners of toolbar creation event.
   * So, tool will not appear on toolbar next time, when toolbar is created.
   *
   * @param {boolean} doDeleteToolbarCreationListeners
   */
  OpenPopupButton.prototype.removeTool = function (doDeleteToolbarCreationListeners) {
    if (this.deleteControls) {
      this.deleteControls();
    }

    // stop listening toolbar creation
    if (doDeleteToolbarCreationListeners) {
      this.drawer.off(this.drawer.EVENT_FLOATING_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
    }
  };

  /**
   * Restore initial position of button
   * @private
   */
  OpenPopupButton.prototype._setInitialPosition = function () {
    var offsetLeft = 0,
        offsetTop = 0,
        insidePlaceholders = this.drawer.toolbars.toolbarPlaceholders.inside,
        $insideTopPlaceholderEl = insidePlaceholders && insidePlaceholders.top && insidePlaceholders.top.$element,
        $insideLeftPlaceholderEl = insidePlaceholders && insidePlaceholders.left && insidePlaceholders.left.$element;
    if ($insideTopPlaceholderEl && $insideTopPlaceholderEl.length) {
      $insideTopPlaceholderEl.find('ul.editable-canvas-toolbar:visible').each(function(i, element){
        var $toolbar = $(element);
        offsetTop += $toolbar.height();
      });
    }
    if ($insideLeftPlaceholderEl && $insideLeftPlaceholderEl.length) {
      $insideLeftPlaceholderEl.find('ul.editable-canvas-toolbar:visible').each(function(i, element){
        var $toolbar = $(element);
        offsetLeft += $toolbar.width();
      });
    }
    this.positionInitialized = true;
    this.moveButton(offsetLeft, offsetTop);
  };

  /**
   * Move button over canvas
   * @param {Number} [left] - left offset of button
   * @param {Number} [top] - topoffset of button
   */
  OpenPopupButton.prototype.moveButton = function (left, top) {
    if (!this.positionLimit) {
      this.refreshPositionLimits();
    }
    left = left > this.positionLimit.left ? this.positionLimit.left : left;
    top = top > this.positionLimit.top ? this.positionLimit.top : top;

    left = left < 0 ? 0 : left;
    top = top < 0 ? 0 : top;


    this.latestState = {
      left: left || 0,
      top: top || 0
    };
    this.$button[0].style.left = left + 'px';
    this.$button[0].style.top = top + 'px';
  };


  /**
   * Refresh current position of button
   */
  OpenPopupButton.prototype.refreshPosition = function () {
    var buttonLeft = (this.latestState && this.latestState.left) || 0,
        buttonTop = (this.latestState && this.latestState.top) || 0;
    this.showButton();
    this.refreshPositionLimits();
    this.moveButton(buttonLeft, buttonTop);

  };

  /**
   * Creates and adds button to toolbar.
   * @param  {DrawerToolbar} toolbar
   * @private
   */
  OpenPopupButton.prototype._createAndAddButton = function (toolbar) {
    var $button,
        $body = $('body'),
        openPopupButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-popup-canvas hidden',
          iconClass: 'fa-cogs',
          tooltipText: this.drawer.t('Open options tools')
        };
    $button = toolbar.addButton(openPopupButtonConf);
    this.$button = $button;

    var buttonLeft = (this.latestState && this.latestState.left) || 0,
        buttonTop = (this.latestState && this.latestState.top) || 0;

    this.moveButton(buttonLeft, buttonTop);
    // set all mouse handlers:
    // handle mouse move while tool is active
    $body.off(MOUSE_MOVE).on(MOUSE_MOVE, this._onMouseMove.bind(this));

    // handle mouse down and mouse up
    $button.off(MOUSE_DOWN).on(MOUSE_DOWN, this._onMouseDown.bind(this));
    $body.off(MOUSE_UP).on(MOUSE_UP, this._onMouseUp.bind(this));
  };

  /**
   * React on mouse down
   * Set erasingNow to true.
   * Eraser path will start by current brush, independently.
   * @param {Event} event - mouse down event
   * @private
   */
  OpenPopupButton.prototype._onMouseDown = function (event) {
    // turn erasing on
    var self = this;
    this.moveNow = true;
    this.triggerClick = true;
    this.clickPosition = util.getEventPosition(event);

    this.refreshSizes();
    this.refreshPositionLimits();

    util.setTimeout(function () {
      self.triggerClick = false;
    }, 200);
  };


  /**
   * On mouse up - set erasingNow to false.
   * Eraser path will be created soon, and
   * main work on erasing will be  done in _onEraserPathCreated()
   * @param {Event} event
   * @private
   */
  OpenPopupButton.prototype._onMouseUp = function (event) {
    this.moveNow = false;
    this.dragNow = false;
    this.clickPosition = {};
    var isButton = event.target === this.$button.get(0) || this.$button.find(event.target).length;
    this.$button.removeClass('dragging');
    if (isButton && this.triggerClick) {
      this.drawer.trigger(this.drawer.EVENT_OVERCANVAS_POPUP_SHOW, [this.$button]);
    }
  };

  /**
   * Listens for mouse movement when eraser is active.
   *
   * @param {Event} event
   * @private
   */
  OpenPopupButton.prototype._onMouseMove = function (event) {
    if (this.moveNow) {
      var eventPosition = util.getEventPosition(event),
          sameLeft = this.clickPosition && (this.clickPosition.left === eventPosition.left),
          sameTop = this.clickPosition && (this.clickPosition.top === eventPosition.top),
          cursorIsMoved = !sameLeft || !sameTop;
      if (cursorIsMoved) {
        if (!this.dragNow) {
          this.$button.addClass('dragging');
          this.dragNow = true;
        }
        this.latestSizes = this.latestSizes || this.refreshSizes();
        var eventPos = util.getEventPosition(event),
            latestSizes = this.latestSizes,
            canvasSize = latestSizes.canvas;

        var left = eventPos.left - canvasSize.left - latestSizes.button.width/2 - latestSizes.scroll.left;
        var top = eventPos.top - canvasSize.top - latestSizes.button.height/2 - latestSizes.scroll.top;

        this.triggerClick = false;
        this.moveButton(left, top);

        event.preventDefault();
        event.stopPropagation();
      }
    }
  };


  /**
   * Refresh max sizes of button offset
   */
  OpenPopupButton.prototype.refreshSizes = function () {
    var result = {};

    var fCanvas = this.drawer.fCanvas,
        canvasSizeBox = fCanvas.upperCanvasEl.getBoundingClientRect(),
        buttonSizeBox = this.$button[0].getBoundingClientRect();
    result.canvas = canvasSizeBox;
    result.button = buttonSizeBox;
    result.scroll = util.getScrollTopFromElement(this.$button);
    this.latestSizes = result;
    return result;
  };

  /**
   * Refresh max sizes of button offset
   */
  OpenPopupButton.prototype.refreshPositionLimits = function () {
    var buttonSize = this.$button.get(0).getBoundingClientRect(),
        borderSize = 2;
    this.positionLimit = {
      left: this.drawer.width - buttonSize.width - borderSize,
      top: this.drawer.height - buttonSize.height - borderSize,
    };
  };

  /**
   * Show popup button
   */
  OpenPopupButton.prototype.showButton = function () {
    this.$button.removeClass('hidden');
  };

  /**
   * Hide popup button
   * @param {fabric.Event} [fEvent] - fabric event
   * @param {Boolean} [force] - force to hide button ignoring all options
   */
  OpenPopupButton.prototype.hideButton = function (fEvent, force) {
    var alwaysVisible = this.drawer.options.toolbars.popupButtonAlwaysVisible;
    if (force || !alwaysVisible) {
      this.$button.addClass('hidden');
    }
  };

  pluginsNamespace.OpenPopupButton = OpenPopupButton;
})(jQuery, DrawerJs.plugins, DrawerJs.util);