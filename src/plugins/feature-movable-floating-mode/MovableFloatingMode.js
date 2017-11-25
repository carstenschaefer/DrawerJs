(function ($, pluginsNamespace, /*BaseToolOptions,*/ util) {
  "use strict";
  var MOUSE_DOWN = util.mouseDown('MovableFloatingMode');
  var MOUSE_MOVE = util.mouseMove('MovableFloatingMode');
  var MOUSE_UP = util.mouseUp('MovableFloatingMode');


  /**
   * Allows moving of canvas when it is in 'floating' mode.
   *
   * @param {DrawerJs.Drawer} drawer
   * @param {Object} options
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var MovableFloatingMode = function MovableFloatingModePlugin(drawer, options) {
    this.drawer = drawer;
    this._setupOptions(options);

    // set handlers
    this._bindedOnToolbarCreated = this._onToolbarCreated.bind(this);
    drawer.on(drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
    drawer.on(drawer.EVENT_MINIMIZED_TOOLBAR_CREATED, this._bindedOnToolbarCreated);

    // if options.align is set and not 'floating' - plugin will not work, warn user about this
    if (drawer.options.align && (drawer.options.align !== 'floating')) {
      console.warn("MovableFloatingMode plugin: options.align is set and it is not 'floating', so canvas will not move. Please use MovableFloatingMode plugin with 'floating' align");
    }

    // if align is not set - make it 'floating'
    if (!drawer.options.align) {
        drawer.options.align = 'floating';
    }

    this.drawer.on(this.drawer.EVENT_CANVAS_READY,    this.onOptionsChanged.bind(this));
    this.drawer.on(this.drawer.EVENT_OPTIONS_CHANGED, this.onOptionsChanged.bind(this));
  };

  // MovableFloatingMode.prototype = Object.create(BaseToolOptions.prototype);
  // MovableFloatingMode.prototype.constructor = BaseToolOptions;

    /**
     * Setup data
     * @param {Object} [options] - options to save
     * @param {String} [pluginName] - name of plugin
     * @param {Boolean} [doNotSave] - set true to not save result as this.options
     * @returns {Object} config of plugin
     */
    MovableFloatingMode.prototype._setupOptions = function (options, pluginName, doNotSave) {
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
     * On toolbar created - create tool button.
     */
    MovableFloatingMode.prototype._onToolbarCreated = function (ev, toolbar) {
        this.toolbar = toolbar;
        this.createControls(toolbar);
    };



    /**
     * Deletes tool button.
     * If  doDeleteToolbarCreationListeners is true - removes listeners of toolbar creation event.
     * So, tool will not appear on toolbar next time, when toolbar is created.
     *
     * @param {boolean} doDeleteToolbarCreationListeners
     */
    MovableFloatingMode.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
        if (this.deleteControls) {
            this.deleteControls();
        }

        // stop listening toolbar creation
        if (doDeleteToolbarCreationListeners) {
            this.drawer.off(this.drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
            this.drawer.off(this.drawer.EVENT_MINIMIZED_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
        }
    };



  /**
   * Is called from Base
   * @param  {DrawerToolbar} toolbar
   */
  MovableFloatingMode.prototype.createControls = function (toolbar) {
    this.makeMoveButton(toolbar);
  };

  MovableFloatingMode.prototype.makeMoveButton = function (toolbar) {
    // create move button
    var moveButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-move',
          iconClass: 'fa-arrows',
          tooltipText: this.drawer.t('Move canvas')
        },
        $moveButton = toolbar.addButton(moveButtonConf);
    this.$moveButton = $moveButton;

    // set handler
    this.$moveButton.on(MOUSE_DOWN, this.buttonOnMouseDown.bind(this));
  };


  /**
   * Handler of mouse down on button.
   * @param  {MouseEvent} event [description]
   */
  MovableFloatingMode.prototype.buttonOnMouseDown = function (event) {
    if (event.type.indexOf('touch') > -1) {
      event = event.originalEvent;
    }

    $('.tooltip-btn-move').css('display', 'none');

    // save coords of drawer
    this.startLeft = this.drawer.$imageElement
        .css('left').replace('px', '') | 0;
    this.startTop = this.drawer.$imageElement
        .css('top').replace('px', '') | 0;

    // save coords of click
    this.mouseStartLeft = event.pageX;
    this.mouseStartTop = event.pageY;

    // set handler for mouse move
    var $body = $('body'),
        $document = $(window.document);
    $body.addClass('drawer-moving');
    $document.on(MOUSE_MOVE, this.buttonOnMouseMove.bind(this));
    // set handler for mouse up
    $document.on(MOUSE_UP, this.buttonOnMouseUp.bind(this));

    return false;
  };


  /**
   * Handler of mouse movement, when mouse button is down.
   * @param  {Event} moveEvent        [description]
   * @return {Boolean}                returns false, to stop event propagation
   */
  MovableFloatingMode.prototype.buttonOnMouseMove = function (moveEvent) {
    var self = this,
        moveEventPos = util.getEventPosition(moveEvent),
        moveDrawerFunc = function moveDrawerFunc(){
          self.moveDrawer(moveEventPos.left, moveEventPos.top);
        };

    util.requestAnimationFrame(moveDrawerFunc);

    moveEvent.preventDefault();
    moveEvent.stopPropagation();
    return false;
  };


  /**
   * Mouse up handler.
   * @param  {MouseEvent} event
   * @return {Boolean}    returns false, to stop event propagation
   */
  MovableFloatingMode.prototype.buttonOnMouseUp = function (event) {
      $('.tooltip-btn-move').css('display', 'block');

      var $body = $('body'),
          $document = $(window.document);
      $body.removeClass('drawer-moving');
    $document.off(MOUSE_MOVE);
    $document.off(MOUSE_UP);

      return false;
  };


  /**
   * Moves drawer according to mouse movement.
   * x, y here are coords of mouse pointer.
   *
   * @param  {integer} x x coord of mouse pointer
   * @param  {integer} y y coord of mouse pointer
   */
  MovableFloatingMode.prototype.moveDrawer = function (x, y) {
    // calc offset of mouse pointer from click position
    var diffLeft = x - this.mouseStartLeft;
    var diffTop = y - this.mouseStartTop;

    // new coords of drawer
    var newLeft = this.startLeft + diffLeft;
    var newTop = this.startTop + diffTop;
    newLeft = (newLeft < 0) ? 0 : newLeft;
    newTop  = (newTop < 0)  ? 0 : newTop;

    // change drawer position
    var drawer = this.drawer;
    drawer.$imageElement.css({
      left: newLeft,
      top: newTop
    });

    drawer.updateAligmentCss();
    drawer.adjustEditContainer(false, true);
  };

  /**
   * Shows/hide move button, depending on current align mode.
   */
  MovableFloatingMode.prototype.onOptionsChanged = function() {
    // try to get fullscreen plugin
    var fullScreenPlugin;
    try {
      fullScreenPlugin = this.drawer.getPluginInstance('Fullscreen');
    }
    catch (e) {
      // do nothing
    }

    // see, if we are in fullscreen mode
    var isInFullscreen = fullScreenPlugin && fullScreenPlugin.isInFullscreenMode();

    // show button if no fullscreen mode and align is 'floating'
    if (!isInFullscreen && (this.drawer.options.align == 'floating')) {
      this.showMoveButton();
    } else {
      this.hideMoveButton();
    }
  };


  /**
   * Shows plugin button.
   */
  MovableFloatingMode.prototype.showMoveButton = function() {
    if (!this.$moveButton) {
      console.warn('MovableFloatingMode.removeMoveButton() : no button \'Move\' present');
      return;
    }
    this.$moveButton.show();
  };

  /**
   * Hides plugin button.
   */
  MovableFloatingMode.prototype.hideMoveButton = function() {
    if (!this.$moveButton) {
      console.warn('MovableFloatingMode.removeMoveButton() : no button \'Move\' present');
      return;
    }
    this.$moveButton.hide();
  };


  pluginsNamespace.MovableFloatingMode = MovableFloatingMode;
}(jQuery, DrawerJs.plugins, /*DrawerJs.plugins.BaseToolOptions,*/ DrawerJs.util));