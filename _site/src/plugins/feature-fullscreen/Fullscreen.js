(function ($, pluginsNamespace, util) {
  "use strict";

  /**
   * Provides a button to enter fullscreen mode.
   *
   * @param {DrawerJs.Drawer} drawer
   * @param {Object} options
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var Fullscreen = function FullscreenConstructor(drawer, options) {
    var _this = this;

    /**
     * @type {Drawer}
     */
    _this.drawer = drawer;
    _this.LOGTAG = _this.name;

    _this._setupOptions(options);

    _this.previousWidth = null;
    _this.previousHeight = null;
    _this.previousOffset = null;

    _this.$enterButton = null;
    _this.$exitButton = null;

    _this.onlyForEditing = false;

    // set handlers on toolbar creation
    this._bindedOnToolbarCreated = this._onToolbarCreated.bind(this);
    drawer.on(drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);


    // befre loading
    _this.drawer
      .on(_this.drawer.EVENT_EDIT_START, function () {
        var dataBeforeFullscreen = _this.drawer
          .$imageElement.attr('data-before-fullscreen');

        if (dataBeforeFullscreen) {
          _this.$enterButton.hide();
          _this.$exitButton.show();
        } else {
          _this.$enterButton.show();
          _this.$exitButton.hide();
        }

      });

    _this.drawer.on(_this.drawer.EVENT_EDIT_STOP, function () {
      if (_this.onlyForEditing) {
        _this.exitFullscreen();
      }
    });

    $(window).on('resize', function(){
      if(_this.isInFullscreenMode()){
        _this.adjustFullscreenSize();
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
  Fullscreen.prototype._setupOptions = function (options, pluginName, doNotSave) {
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
    Fullscreen.prototype._onToolbarCreated = function (ev, toolbar) {
        this.toolbar = toolbar;
        var enterButtonConfig = {
              buttonOrder: this.options.buttonOrder,
              additionalClass: 'btn-fullscreen',
              iconClass: 'fa-expand',
              tooltipText: this.drawer.t('Enter fullscreen mode'),
              clickHandler: this.enterFullscreen.bind(this)
            },
            exitButtonConfig = {
              buttonOrder: this.options.buttonOrder,
              additionalClass: 'btn-fullscreen',
              iconClass: 'fa-compress',
              tooltipText: this.drawer.t('Exit fullscreen mode'),
              clickHandler: this.exitFullscreen.bind(this)
            };

        // add button expand
      this.$enterButton = toolbar.addButton(enterButtonConfig);

        // add button shrink
      this.$exitButton = toolbar.addButton(exitButtonConfig);
      this.$exitButton.hide();
    };


    /**
     * Deletes tool button.
     * If  doDeleteToolbarCreationListeners is true - removes listeners of toolbar creation event.
     * So, tool will not appear on toolbar next time, when toolbar is created.
     *
     * @param {boolean} doDeleteToolbarCreationListeners
     */
    Fullscreen.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
        if (this.deleteControls) {
            this.deleteControls();
        }

        // stop listening toolbar creation
        if (doDeleteToolbarCreationListeners) {
            this.drawer.off(this.drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
        }
    };





  Fullscreen.prototype.isInFullscreenMode = function () {
    var $image = this.drawer.$imageElement;

    if ($image.attr('data-before-fullscreen') !== undefined) {
      return true;
    }

    return false;
  };

  Fullscreen.prototype.adjustFullscreenSize = function () {
    var _this = this;
    var redactorInstance = _this.drawer.redactorInstance;

    var $image = _this.drawer.$imageElement;

    var toolbarSize = _this.drawer.options.toolbarSize;

    var width = redactorInstance.$box.width() - toolbarSize;
    var height = redactorInstance.$box.height() - toolbarSize;

    var offset = redactorInstance.$box.offset();

    _this.drawer.$canvasEditContainer.css({
      'left': offset.left + 'px',
      'top': (offset.top + toolbarSize ) + 'px',
      'width': width + 'px',
      'height': height + 'px'
    });

    _this.drawer.fCanvas.setWidth(width);
    _this.drawer.fCanvas.setHeight(height);

    if(!_this.onlyForEditing) {
      $image.css({
        'position': 'absolute',
        'left': '0px',
        'top': '0px',
        'width': width + 'px',
        'height': height + 'px'
      });
    }
  };

  Fullscreen.prototype.enterFullscreen = function () {
    var _this = this;
    var redactorInstance = _this.drawer.redactorInstance;

    var $image = _this.drawer.$imageElement;

    var toolbarSize = _this.drawer.options.toolbarSize;

    // this.drawer.trigger(this.drawer.EVENT_HIDE_TOOLTIPS);

    _this.$enterButton.hide();
    _this.$exitButton.show();

    $image.attr('data-before-fullscreen',
      JSON.stringify({
        imageCss: {
          'position': $image.css('position'),
          'display': $image.css('display'),
          'left': $image.css('float'),
          'top': $image.css('top'),
          'margin-left': $image.css('margin-left'),
          'margin-right': $image.css('margin-right'),
          'width': $image.css('width'),
          'height': $image.css('height')
        },
        canvasCss: {
          'width': _this.drawer.width,
          'height': _this.drawer.height,
          'offset': _this.drawer.$canvasEditContainer.offset()
        }
      })
    );

    if (!this.onlyForEditing) {
      $image.css('position', 'absolute');
    }

    _this.adjustFullscreenSize();

    if (this.onlyForEditing) {
      var duration = util.getTransitionDuration(
        _this.drawer.$canvasEditContainer[0]
      );

      util.setTimeout(function () {
        redactorInstance.$box.css('opacity', '0');
      }, duration);
    }

    // @todo: rework this!
    _this.drawer.toolbars.toolOptionsToolbar
      .removeClass('toolbar-bottomLeft').detach();
    _this.drawer
      .appendToolbar(_this.drawer.toolbars.toolOptionsToolbar, 'topRight');

    _this.drawer.toolbars.setToolbarButtonsSize();
    _this.drawer.onCanvasModified();
  };

  Fullscreen.prototype.exitFullscreen = function () {
    var _this = this;
    var $image = _this.drawer.$imageElement;

    $('.editable-canvas-tooltip').removeClass('active');

    _this.$enterButton.show();
    _this.$exitButton.hide();

    var dataBeforeFullscreenStr = $image.attr('data-before-fullscreen');
    var dataBeforeFullscreen = JSON.parse(dataBeforeFullscreenStr);
    $image.attr('data-before-fullscreen', null);

    if (this.onlyForEditing) {
      _this.drawer.redactorInstance.$box.css('opacity', '1');
    } else {
      $image.css(dataBeforeFullscreen.imageCss);
    }

    if (_this.drawer.$canvasEditContainer) {
      var duration = util.getTransitionDuration(
        _this.drawer.$canvasEditContainer[0]
      );

      var previousWidth = dataBeforeFullscreen.canvasCss.width;
      var previousHeight = dataBeforeFullscreen.canvasCss.height;

      _this.drawer.$canvasEditContainer.css({
        'left': dataBeforeFullscreen.canvasCss.offset.left + 'px',
        'top': dataBeforeFullscreen.canvasCss.offset.top + 'px',
        'width': previousWidth + 'px',
        'height': previousHeight + 'px'
      });

      _this.drawer.$canvasEditContainer.find('.canvas-container')
        .css({
          'width': previousWidth + 'px',
          'height': previousHeight + 'px'
        });

      util.setTimeout(function () {
        _this.drawer.fCanvas.setWidth(previousWidth);
        _this.drawer.fCanvas.setHeight(previousHeight);
      }, duration);

      _this.drawer.width = previousWidth;
      _this.drawer.height = previousHeight;

      _this.drawer.adjustEditContainer(true, true);
    }

    _this.drawer.toolbars.toolOptionsToolbar
      .removeClass('toolbar-topRight').detach();
    _this.drawer
      .appendToolbar(_this.drawer.toolbars.toolOptionsToolbar, 'bottomLeft');

    _this.drawer.toolbars.setToolbarButtonsSize();
    _this.drawer.onCanvasModified();
  };

  pluginsNamespace.Fullscreen = Fullscreen;
}(jQuery, DrawerJs.plugins, DrawerJs.util));