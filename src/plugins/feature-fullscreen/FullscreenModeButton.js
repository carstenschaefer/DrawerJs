(function ($, pluginsNamespace, util, DrawerApi) {
  "use strict";

  var isFF = util.checkBrowser('mozilla'),
      isSafari = util.checkBrowser('safari'),
      isWebkit = util.checkBrowser('webkit'),
      emptyFunc = function () {},
      isTouchDevice;

  /**
   * Provides a button to minimize canvas.
   *
   * @param {DrawerJs.Drawer} drawer
   * @param {Object} options
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var FullscreenModeButton = function FullscreenModeButtonConstructor(drawer, options) {
    /**
     * @type {Drawer}
     */
    this.name = 'FullscreenModeButton';
    this.drawer = drawer;
    isTouchDevice = this.drawer.touchDevice;

    this._setupOptions(options);
    this._attachEvents();
    this._setupFullscreenHandlers();

    this.drawer.on(this.drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._onConfigToolbarCreated.bind(this));
  };

  /**
   * Attach global events
   * @private
   */
  FullscreenModeButton.prototype._attachEvents = function () {
    var self = this,
        eventsList = '' +
            'onfullscreenchange.FullscreenModeButton ' +
            'webkitfullscreenchange.FullscreenModeButton ' +
            'fullscreenchange.FullscreenModeButton '+
            'mozfullscreenchange.FullscreenModeButton ' +
            'MSFullscreenChange.FullscreenModeButton ';
    $(document).off(eventsList).on(eventsList, function () {
      self.globalFullscreenMode = !self.globalFullscreenMode;
      self.reactOnResize = true;
      util.setTimeout(function () {
        self.reactOnResize = false;
      }, 2000);
      if (self.globalFullscreenMode) {
        self.setFullscreenStateOn(true);
      } else {
        self.setFullscreenStateOff(true);
      }
    });

    window.removeEventListener('resize', self._onWindowResize.bind(self));
    window.addEventListener('resize', self._onWindowResize.bind(self));

    $(document).off('keypress.FullscreenModeButton').on('keypress.FullscreenModeButton', function(e) {
      var isFullscreen = (self.globalFullscreenMode && self.fullscreenMode),
          isEscKey = e.keyCode == 27,
          turnOffFullscreen = isFullscreen && isEscKey;
      if (turnOffFullscreen) { // ESC key
            self.fullscreenOff(true);
      }
    });
  };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  FullscreenModeButton.prototype._setupOptions = function (options, pluginName, doNotSave) {
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
   * React on window resize
   * @private
   */
  FullscreenModeButton.prototype._onWindowResize = function () {
    var self = this;

    if (isFF && !self.reactOnResize && !self.globalFullscreenMode) {
      self._saveCurrentSizes();
    }

    if (self.reactOnResize) {
      if (!self.globalFullscreenMode) {
        self._restoreNormalSizes();
      } else {
        self._refreshFullscreenSize(false);
      }
    }



    var turnOff = false && !isFF, //global, but not for firefox
        ffTurnOff = !self.fullscreenMode && self.reactOnResize && isFF && !self.globalFullscreenMode,
        webkitTurnOff = self.fullscreenMode && !self.globalFullscreenMode && isWebkit,
        needToTurnOff = turnOff || ffTurnOff || webkitTurnOff;
    if (needToTurnOff) {
      self.setFullscreenStateOff();
    }
    self.reactOnResize = false;
  };

  FullscreenModeButton.prototype._saveCurrentSizes = function (oldWidth, oldHeight) {
    if (!oldWidth || !oldHeight) {
      oldWidth = this.drawer.$canvasEditContainer.outerWidth();
      oldHeight = this.drawer.$canvasEditContainer.outerHeight();
    }

    this.savedWidth = oldWidth;
    this.savedHeight = oldHeight;
  };

  /**
   * Set drawer size - all available space
   * @param {Boolean} [save] - save current size for further restore
   * @private
   */
  FullscreenModeButton.prototype._refreshFullscreenSize = function (save) {
    var $window = $(window),
        viewportWidth = $window.width(),
        viewportHeight = $window.height(),
        oldWidth = this.drawer.width,
        oldHeight = this.drawer.height,
        $editContainer = this.drawer.$canvasEditContainer,
        drawerHaveAnimatedClass = $editContainer.hasClass('animated');

    if (save) {
      this._saveCurrentSizes(oldWidth, oldHeight);
    }
    $editContainer.removeClass('animated');
    this.drawer.setSize(
        viewportWidth,
        viewportHeight
    );
    this.drawer.trigger(this.drawer.EVENT_RESTORE_DEFAULT_ZOOM);
    $editContainer.toggleClass('animated', !!drawerHaveAnimatedClass);
  };

  /**
   * Restore drawer size
   * @private
   */
  FullscreenModeButton.prototype._restoreNormalSizes = function () {
    var self = this,
        $editContainer = this.drawer.$canvasEditContainer,
        drawerHaveAnimatedClass = $editContainer.hasClass('animated');
    $editContainer.removeClass('animated');
    $editContainer.css('position', this.savedPosition);
    console.info(this.savedWidth,this.savedHeight);
    this.drawer.setSize(
        this.savedWidth,
        this.savedHeight
    );
    util.setTimeout(function () {
      self.drawer.adjustEditContainer();
      self.drawer.trigger(self.drawer.EVENT_RESTORE_DEFAULT_ZOOM);
      util.setTimeout(function () {
        $editContainer.toggleClass('animated', !!drawerHaveAnimatedClass);
      },0);
    }, 0);
  };

  /**
   * Setup request/cancel handlers depending on browser
   * @private
   */
  FullscreenModeButton.prototype._setupFullscreenHandlers = function () {
    var element = document.documentElement,
        fullscreenCancelFunc,
        fullscreenRequest_defaultFunc = function () {
          element.requestFullScreen();
        },
        fullscreenRequest_default = element.requestFullScreen && fullscreenRequest_defaultFunc,

        fullscreenRequest_msFunc = function () {
          element.msRequestFullscreen();
        },
        fullscreenRequest_ms = element.msRequestFullscreen && fullscreenRequest_msFunc,
        fullscreenRequest_mozillaFunc = function () {
          element.mozRequestFullScreen();
        },
        fullscreenRequest_mozilla = element.mozRequestFullScreen && fullscreenRequest_mozillaFunc,
        fullscreenRequest_webkitFunc = function () {
          element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        },
        fullscreenRequest_webkit = element.webkitRequestFullScreen && fullscreenRequest_webkitFunc;

    this.fullscreenRequest =  fullscreenRequest_default ||
                              fullscreenRequest_ms ||
                              fullscreenRequest_mozilla ||
                              fullscreenRequest_webkit ||
                              this.setFullscreenStateOn.bind(this);
    fullscreenCancelFunc =  document.cancelFullScreen ||
                            document.msExitFullscreen ||
                            document.mozCancelFullScreen ||
                            document.webkitCancelFullScreen ||
                            this.setFullscreenStateOff.bind(this);
    this.fullscreenCancel = function() {
      fullscreenCancelFunc.call(document);
    };
  };


  /**
   * React on toolbar created - create tool button.
   * @param {fabric.Event} ev
   * @param {DrawerToolbar} toolbar
   * @private
   */
  FullscreenModeButton.prototype._onConfigToolbarCreated = function (ev, toolbar) {
    this.fullscreenEl = this.drawer.$canvasEditContainer.get(0);
    this._createAndAddButton(toolbar);
  };

  /**
   * Deletes tool button.
   * If  doDeleteToolbarCreationListeners is true - removes listeners of toolbar creation event.
   * So, tool will not appear on toolbar next time, when toolbar is created.
   *
   * @param {boolean} [doDeleteToolbarCreationListeners]
   */
  FullscreenModeButton.prototype.removeTool = function (doDeleteToolbarCreationListeners) {
    if (this.deleteControls) {
      this.deleteControls();
    }
    // stop listening toolbar creation
    if (doDeleteToolbarCreationListeners) {
      this.drawer.off(this.drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
    }
  };


  /**
   * Creates and adds minimize button to toolbar.
   * @param  {DrawerToolbar} toolbar
   */
  FullscreenModeButton.prototype._createAndAddButton = function (toolbar) {
    var toggleModeButtonConfig = {
          buttonOrder: 10,
          additionalClass: 'btn-fullscreen-canvas',
          iconClass: 'fa-window-restore',
          tooltipText: this.drawer.t('Toggle fullscreen mode'),
          clickHandler: this._onFullscreenModeButtonClick.bind(this)
        },
        $fullscreenModeButton = toolbar.addButton(toggleModeButtonConfig);
    this.$fullscreenModeButton = $fullscreenModeButton;
  };

  /**
   * Toggle fullscreen state
   * @param {Boolean} [forceCancel]
   * @private
   */
  FullscreenModeButton.prototype._toggleFullScreen = function (forceCancel) {
    var currStateIsFullscreen_default = (document.fullScreenElement && document.fullScreenElement !== null),
        currStateIsFullscreen_moz = (!document.mozFullScreen && !document.webkitIsFullScreen),
        currStateIsFullscreen = currStateIsFullscreen_default || currStateIsFullscreen_moz,
        turnOn = forceCancel === false || (!forceCancel && currStateIsFullscreen);
    if (turnOn) {
      this.fullscreenRequest();
    } else {
      this.fullscreenCancel();
    }
  };

  /**
   * On minimize button click handler
   * @private
   */
  FullscreenModeButton.prototype._onFullscreenModeButtonClick = function () {
    if (this.fullscreenMode) {
      this.fullscreenOff();
    } else {
      this.fullscreenOn();
    }
  };

  /**
   * Drawer - remove fullscreen state
   */
  FullscreenModeButton.prototype.setFullscreenStateOff = function () {
    var canvasContainerIsValid = this.drawer.$canvasEditContainer || this.drawer.$canvasEditContainer.length,
        currStateIsValid = canvasContainerIsValid;
    this.changeStateInProgress = true;
    if (currStateIsValid) {
      this.drawer.trigger(this.drawer.EVENT_DO_DEACTIVATE_ALL_TOOLS);
      this.drawer.trigger(this.drawer.EVENT_DESTROY_TOOLTIPS);
      var self = this,
          $editContainer = this.drawer.$canvasEditContainer,
          drawerHaveAnimatedClass = $editContainer.hasClass('animated');

      this.fullscreenMode = false;
      this.drawer.fullscreenMode = false;
      $editContainer.addClass('fullscreen-in-progress');
      $editContainer.removeClass('animated');
      $editContainer.removeClass('fullscreen');

      this.drawer.$imageElement.show();
      this._restoreNormalSizes();

      util.setTimeout(function () {
        self.drawer.toolbars.resetAllToolbars();
        if (self.$fullscreenModeButton) {
          self.$fullscreenModeButton.removeClass('active');
        }
        if (isSafari) {
          self._restoreNormalSizes();
        }
        $editContainer.toggleClass('animated', !!drawerHaveAnimatedClass);
        $editContainer.removeClass('fullscreen-in-progress');
        self.changeStateInProgress = false;
      }, 0);
    }
  };

  /**
   * Drawer - set fullscreen state
   */
  FullscreenModeButton.prototype.setFullscreenStateOn = function () {
    this.changeStateInProgress = true;
    var canvasContainerIsValid = this.drawer.$canvasEditContainer || this.drawer.$canvasEditContainer.length,
        currStateIsValid = canvasContainerIsValid;
    if (currStateIsValid) {
      this.drawer.trigger(this.drawer.EVENT_DO_DEACTIVATE_ALL_TOOLS);
      this.drawer.trigger(this.drawer.EVENT_DESTROY_TOOLTIPS);
      var self = this,
          $editContainer = this.drawer.$canvasEditContainer,
          drawerHaveAnimatedClass = $editContainer.hasClass('animated');

      this.fullscreenMode = true;
      this.drawer.fullscreenMode = true;
      this.savedPosition = $editContainer.css('position');

      $editContainer.addClass('fullscreen-in-progress');
      $editContainer.removeClass('animated');
      $editContainer.addClass('fullscreen');
      this.drawer.$imageElement.hide();

      self._refreshFullscreenSize(!isFF);

      util.setTimeout(function () {
        self.drawer.toolbars.resetAllToolbars();
        self.drawer.toolbars.settingsToolbar.$toolbar.parent().addClass('fullscreenOverOther');
        if (self.$fullscreenModeButton) {
          self.$fullscreenModeButton.addClass('active');
        }
        $editContainer.toggleClass('animated', !!drawerHaveAnimatedClass);
        $editContainer.removeClass('fullscreen-in-progress');
        self.changeStateInProgress = false;
      }, 50);
    }
  };

  /**
   * Turn fullscreen mode on
   */
  FullscreenModeButton.prototype.fullscreenOn = function () {
    this._toggleFullScreen(false);
  };

  /**
   * Turn fullscreen mode off
   */
  FullscreenModeButton.prototype.fullscreenOff = function () {
    this._toggleFullScreen(true);
  };

  /**
   * Provide API method - fullscreenOn
   */
  DrawerApi.prototype.fullscreenOn = function () {
    var tool = this.drawer.getPluginInstance('FullscreenModeButton');
    tool.fullscreenOn();
  };

  /**
   * Provide API method - fullscreenOff
   */
  DrawerApi.prototype.fullscreenOff = function () {
    var tool = this.drawer.getPluginInstance('FullscreenModeButton');
    tool.fullscreenOff();
  };

  pluginsNamespace.FullscreenModeButton = FullscreenModeButton;
})(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.DrawerApi);