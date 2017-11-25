(function ($, pluginsNamespace, util) {
  "use strict";

  var emptyFunc = function () {};

  var MOUSE_UP = util.mouseUp('ToggleVisibilityButton');
  var MOUSE_DOWN = util.mouseDown('ToggleVisibilityButton');
  var MOUSE_MOVE = util.mouseMove('ToggleVisibilityButton');

  /**
   * Provides a button toggle toolbars visibility
   *
   * @param {Drawer} drawer - Instance of {@link Drawer}
   * @param {Object} options
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var ToggleVisibilityButton = function ToggleVisibilityButtonConstructor(drawer, options) {
    /**
     * @type {Drawer}
     */
    this.drawer = drawer;
    this._setupOptions(options);
    this.drawer.on(this.drawer.EVENT_FLOATING_TOOLBAR_CREATED, this._onToolbarCreated.bind(this));
  };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  ToggleVisibilityButton.prototype._setupOptions = function (options, pluginName, doNotSave) {
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
   * React on overcanvas mode
   * @private
   */
  ToggleVisibilityButton.prototype._onOverCanvasMode = function () {
    this.showNextItem();
    if (!this.positionInitialized) {
      this._setInitialPosition();
    }
  };

  /**
   * On toolbar created - create tool button.
   * @private
   */
  ToggleVisibilityButton.prototype._onToolbarCreated = function (ev, toolbar) {
    this.toolbar = toolbar;

    var needToInitButton = this.checkConfigForButton();
    if (needToInitButton) {
      this.createControls(toolbar);
      this._onOverCanvasMode();
    }
  };

  /**
   *
   * @param toolbar
   * @returns {Boolean}
   * @private
   */
  ToggleVisibilityButton.prototype._checkToolbarForButton = function (toolbar) {
    var result = false;
    if (toolbar) {
    var haveButton = toolbar.options.toggleVisibilityButton,
        isPopup = toolbar.options.compactType === 'popup';
      result = haveButton && !isPopup;
    }
    return result;
  };

  /**
   * Check current config of drawer for toolbars that need button
   * @returns {Boolean}
   */
  ToggleVisibilityButton.prototype.checkConfigForButton = function () {
    var drawingToolsToolbar = this.drawer.toolbars.drawingToolsToolbar,
        toolOptionsToolbar = this.drawer.toolbars.toolOptionsToolbar,
        settingsToolbar = this.drawer.toolbars.settingsToolbar,

        drawingToolsHave = this._checkToolbarForButton(drawingToolsToolbar),
        toolOptionsHave = this._checkToolbarForButton(toolOptionsToolbar),
        settingsHave = this._checkToolbarForButton(settingsToolbar),
        needToInit = drawingToolsHave || toolOptionsHave || settingsHave,
        toolbarsForToggle = [];
    if (drawingToolsHave) {
      toolbarsForToggle.push(drawingToolsToolbar);
    }
    if (toolOptionsHave) {
      toolbarsForToggle.push(toolOptionsToolbar);
    }
    if (settingsHave) {
      toolbarsForToggle.push(settingsToolbar);
    }
    this.toolbarsForToggle = toolbarsForToggle;
    return needToInit;
  };

  /**
   * @param toolbar
   * @private
   */
  ToggleVisibilityButton.prototype.createControls = function (toolbar) {
    this._createAndAddButton(toolbar);
    this.showButton();
  };

  /**
   * Deletes tool button.
   * If  doDeleteToolbarCreationListeners is true - removes listeners of toolbar creation event.
   * So, tool will not appear on toolbar next time, when toolbar is created.
   *
   * @param {boolean} doDeleteToolbarCreationListeners
   */
  ToggleVisibilityButton.prototype.removeTool = function (doDeleteToolbarCreationListeners) {
    if (this.deleteControls) {
      this.deleteControls();
    }

    // stop listening toolbar creation
    if (doDeleteToolbarCreationListeners) {
      this.drawer.off(this.drawer.EVENT_FLOATING_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
    }
  };


  /**
   * Move button over canvas
   * @param {Number} [left] - new offset of button
   * @param {Number} [top] - new offset of button
   */
  ToggleVisibilityButton.prototype.moveButton = function (left, top) {
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
    this.$button.css({
      left: left + 'px',
      top: top + 'px'
    });
  };

  /**
   * Restore initial position/state of button
   * @private
   */
  ToggleVisibilityButton.prototype._setInitialPosition = function () {
    var offsetLeft = 0,
        offsetTop = 0,
        insidePlaceholders = this.drawer.toolbars.toolbarPlaceholders.inside,
        $insideTopPlaceholderEl = insidePlaceholders && insidePlaceholders.top && insidePlaceholders.top.$element,
        $insideLeftPlaceholderEl = insidePlaceholders && insidePlaceholders.left && insidePlaceholders.left.$element;
    if ($insideTopPlaceholderEl && $insideTopPlaceholderEl.length) {
      offsetTop += $insideTopPlaceholderEl.height();
    }
    if ($insideLeftPlaceholderEl && $insideLeftPlaceholderEl.length) {
      offsetLeft += $insideLeftPlaceholderEl.width();
    }
    this.positionInitialized = true;
    this.moveButton(offsetLeft, offsetTop);
  };


  /**
   * Creates and adds button to toolbar.
   * @param  {DrawerToolbar} toolbar
   * @private
   */
  ToggleVisibilityButton.prototype._createAndAddButton = function (toolbar) {
    var $button,
        $body = $('body'),
        toggleVisibilityButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-toggle-canvas hidden',
          iconClass: 'fa-eye',
          tooltipText: this.drawer.t('Toggle toolbar vision')
        };
    $button = toolbar.addButton(toggleVisibilityButtonConf);

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

    // util.bindLongPress($button, 'move-button');

  };



  /**
   * React on mouse down
   * @param {Event} event
   * @private
   */
  ToggleVisibilityButton.prototype._onMouseDown = function (event) {
    // turn erasing on
    var self = this;
    this.moveNow = true;
    this.triggerClick = true;

    this.refreshSizes();
    this.refreshPositionLimits();

    util.setTimeout(function () {
      self.triggerClick = false;
    }, 200);
  };


  /**
   * React on mouse up
   * @param {Event} event
   * @private
   */
  ToggleVisibilityButton.prototype._onMouseUp = function (event) {
    var self = this,
        isButton = event.target === this.$button.get(0) || this.$button.find(event.target).length;
    this.moveNow = false;
    this.dragNow = false;
    this.$button.removeClass('dragging');
    if (isButton && this.triggerClick && !this.touchRightNow) {
      this.triggerClick = false;
      this.touchRightNow = true;
      util.setTimeout(function () {
        self.touchRightNow = false;
      }, 400);
      this.showNextItem();
    }
  };

  /**
   * Listens for mouse movement
   * @param {Event} event
   * @private
   */
  ToggleVisibilityButton.prototype._onMouseMove = function (event) {
    if (this.moveNow) {

      if (!this.dragNow) {
        this.$button.addClass('dragging');
        this.dragNow = true;
      }
      if (!this.latestSizes) {
        this.refreshSizes();
      }
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
  };

  /**
   * Refresh max sizes of button offset
   */
  ToggleVisibilityButton.prototype.refreshSizes = function () {
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
   *
   */
  ToggleVisibilityButton.prototype.refreshPositionLimits = function () {
    var buttonSize = this.$button.get(0).getBoundingClientRect(),
        borderSize = 2;
    this.positionLimit = {
      left: this.drawer.width - buttonSize.width - borderSize,
      top: this.drawer.height - buttonSize.height - borderSize,
    };
  };

  /**
   * Show button
   */
  ToggleVisibilityButton.prototype.showButton = function () {
    this.$button.removeClass('hidden');
  };
  
  /**
   * Hide button
   */
  ToggleVisibilityButton.prototype.hideButton = function () {
    this.$button.addClass('hidden');
  };

  /**
   * Toggle current visible toolbar
   */
  ToggleVisibilityButton.prototype.showNextItem = function () {
    var self = this,
        haveVisible,
        nextToolbar,
        firstToolbar = this.toolbarsForToggle[0];
    this.toolbarsForToggle.forEach(function(toolbar, i){
      if (!toolbar.invisible) {
        var indexOfNextToolbar = i +1;
        haveVisible = true;
        nextToolbar = self.toolbarsForToggle[indexOfNextToolbar];
      }
      toolbar.hideToolbar();
    });
    if (haveVisible) {
      if (nextToolbar) {
        nextToolbar.showToolbar();
      }
    } else {
      firstToolbar.showToolbar();
    }
  };

  pluginsNamespace.ToggleVisibilityButton = ToggleVisibilityButton;
})(jQuery, DrawerJs.plugins, DrawerJs.util);