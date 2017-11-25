(function ($, namespace, pluginsNamespace, util, texts) {
  'use strict';

  /**
   * Canvas editable element.
   *
   * @param redactorInstance {Object|null} Redactor's instance.
   *                         Could be null for standalone version.
   *
   * @param options {Object} Object with configuration parameters.
   *
   * @param {String} options.borderCss
   * Canvas border css styles.
   * <br><br>
   * Example:
   * <code>1px dashed rgb(195, 194, 194)</code>
   *
   * @param {String} options.borderCssEditMode
   * Canvas border css styles which will be applied when in edit mode.
   * <br><br>
   * Example:
   * <code>1px dashed rgb(195, 194, 194)</code>
   *
   * @param {String} options.backgroundCss
   * Canvas background css style which will be applied to canvas container.
   * <br><br>
   * Example:
   * <code>
   *   url(/redactor.plugin.drawer/dist/assets/transparent.png) repeat
   * </code>
   *
   * @param {String} options.defaultImageUrl
   * Image url that will be drawn on canvas when it's just created and
   * nothing has been drawn on it.
   *
   * @param {number} options.toolbarSize=35
   * Specifies drawer's toolbar buttons size in px.
   *
   * @param {number} options.toolbarSizeTouch=43
   * Specifies drawer's toolbar buttons size in px when running on touch device.
   *
   * @param {Object} options.toolbars - Configuration for each toolbar.
   * Each toolbar have next configuration object:
   * <code><pre>
   *   {
   *
   *      // All of {@link DrawerToolbar.defaultSetOfOptions}
   *      hidden: false,
   *      position: 'top',
   *      positionType: 'outside',
   *      compactType: 'scrollable',
   *      toggleVisibilityButton: false,
   *      customAnchorSelector: '#custom-toolbar-here',
   *
   *      fullscreenMode: {
   *          // All of {@link DrawerToolbar.defaultSetOfOptions}
   *          hidden: false,
   *          position: 'top',
   *          positionType: 'outside',
   *          compactType: 'scrollable',
   *          toggleVisibilityButton: false,
   *          customAnchorSelector: '#custom-toolbar-here',
   *      }
   *   }
   * </pre></code>
   *
   * @param {Boolean} options.toolbars.popupButtonAlwaysVisible=true - Always display popup button(If any toolbar uses it)
   *
   * @param {DrawerToolbar.defaultToolbarOptions} options.toolbars.drawingTools - Configuration of "Drawing tools" toolbar
   *
   * @param {DrawerToolbar.defaultToolbarOptions} options.toolbars.toolOptions - Configuration of "Tool options" toolbar
   *
   * @param {DrawerToolbar.defaultToolbarOptions} options.toolbars.settings - Configuration of "Drawer settings" toolbar
   *
   * @param {Object} options.tooltipCss
   * Allows css customizations of buttons tooltips. Could be any valid css
   * object that will be passed directly to jQuery.css method.
   * <br><br>
   * Example:
   * <code><pre>
   *   {
   *    background: 'green',
   *    color: 'red'
   *   }
   * </pre></code>
   *
   * @param {String} options.activeColor=#19A6FD
   * Specifies default active color for drawer(the one that will be selected on
   * initialization).
   *
   * @param {String} options.align  left|right|center|inline|floating
   * Specifies drawer align.
   * Drawer can be moved via MovableFloatingMode only if align is 'floating'
   * <br><br>
   *
   * @param {Boolean} options.transparentBackground
   * Specifies if drawer canvas has transparent background.
   * <br><br>
   *
   * @param {String} options.texts
   * Object containing strings with translations/texts to use.
   * <br>
   * String keys could be found in Localization_en.js file.
   * <br><br>
   * Example:
   * <code><pre>
   *   {
   *    'Free drawing mode': 'Pencil',
   *   }
   * </pre></code>
   *
   * @param {Array} options.plugins
   * List of plugin names that drawer will use. Please see a full list here:
   * {@link DrawerJs.plugins}
   *
   * Example:
   * <code><pre>
     * plugins: [
   *  // Drawing tools
   *  'Pencil',
   *  'Eraser',
   *  'Text',
   *  'Line',
   *  'ArrowOneSide',
   *  'ArrowTwoSide',
   *  'Triangle',
   *  'Rectangle',
   *  'Circle',
   *
   *  // Drawing options
   *  'ColorpickerRedactor',
   *  'BrushSize',
   *  'Resize'
   * ],
   * </pre></code>
   *
   * @param {Object} options.pluginsConfig
   * Each Drawer plugin could have its own configuration and could be
   * configured by this section.
   * <br><br>
   *
   * This is the object which keys are plugin names and values are objects
   * with plugin configuration fields.
   * <br><br>
   *
   * Plugins names and documentation about each plugin could be found here:
   * {@link DrawerJs.plugins}.
   * Look at plugin's constructor `<code>options</code>` argument.
   * <br><br>
   *
   * For example we would like to configure
   * {@link DrawerJs.plugins.Text} and {@link DrawerJs.plugins.Eraser}
   * plugins:
   * <code><pre class="prettyprint">
   * pluginsConfig: {
   *   "Text": {
   *     "fonts": {
   *       "Georgia": 'Georgia, serif',
   *       "Palatino": "'Palatino Linotype', Palatino, serif"
   *     },
   *     "defaultFont": 'Georgia'
   *   },
   *   "Eraser": {
   *     "cursorUrl": "url(assets/eraser_cursor.cur), default"
   *   }
   * }
   * </code></pre>
   *
   * @param {Object} options.defaultActivePlugin
   * Activates default tool, if options.defaultActivePlugin is set;
   * MUST contain keys:
   * name - name of plugin
   * mode - one of : ['always', 'onNew', 'lastUsed']
   * Depending on options.defaultActivePlugin.mode :
   * 'always'   - same plugin will be always actived
   * 'onNew'    - default plugin is actiavted, only if canvas is empty
   * 'lastUsed' - on first drawer run plugin options.defaultActivePlugin.name, on consecutive - last used tool
   *
   * @param {Object} options.canvasProperties
   * Specifies fabricjs options that will be passed directly to fabricjs
   * canvas instance on creation.
   *
   * @param {String} options.canvasProperties.selectionColor
   * Specifies color of selection rectangle.
   *
   *
   * @param {number[]} options.canvasProperties.selectionDashArray
   * What it allows us to do is make selection lines dashed.
   * <br><br>
   *
   * The way to define dash pattern is by specifying intervals via an array.
   * <br><br>
   * So to create a pattern where there's one long dash followed by one short
   * dash, we could use something like <code>[10, 5]</code>
   * as "selectionDashArray".
   * <br>
   *
   * This will draw a line that's 10px long, then skip 5px, draw 10px line
   * again, and so on.<br>
   * If we were to use <code>[2, 4, 6]</code> array, the pattern would be
   * created by drawing 2px line, then skipping 4px, then drawing 6px line,
   * then skipping 2px, then drawing 4px line, then skipping 6px, and so on.
   * You get the point.
   *
   *
   * @param {number} options.canvasProperties.selectionLineWidth
   * Specifies selection line width in pixels.
   *
   *
   * @param {String} options.canvasProperties.selectionBorderColor
   * Specifies selection line color.
   *
   *
   * @param {Object} options.objectControls
   * Specifies the appearance of selected object controls.
   *
   *
   * @param {String} options.objectControls.borderColor
   * Specifies selected object border color.
   *
   *
   * @param {float} options.objectControls.borderOpacityWhenMoving
   * Specifies border opacity when object is selected and in moving process.
   *
   *
   * @param {String} options.objectControls.cornerColor
   * Specified color of control corners for resizing/rotating.
   *
   *
   * @param {number} options.objectControls.cornerSize
   * Specifies size of corners for resizing/rotating.
   *
   *
   * @param {boolean} options.objectControls.hasBorders
   * Toggles visibility of selected object border.
   *
   * @param {Object} options.objectControlsTouch
   * The same as <code>objectControls</code> but will be used
   * when touch device is detected.
   *
   * @param {Function} options.detectTouch
   * A custom function that will be used by drawer to determine whether it is
   * running on touch device or not.
   * <br><br>
   *
   * This function must return <code>true</code> or <code>false</code>.
   * <br><br>
   *
   * <code>true</code> means that touch device is detected and drawer should
   * adjust its toolbar sized, add touch events etc.
   * <br><br>
   *
   * Note that if this function is not specified, drawer will use its own
   * detection mechanism.
   * <br><br>
   *
   * To disable any detection simply set this parameter to such function:
   * <code><pre>function() { return false; }</pre></code>
   *
   *
   * @param {Object} options.contentConfig
   * Specifies data-management configuration and controls where canvas element
   * will store its information.
   *
   *
   * @param {number} options.contentConfig.saveAfterInactiveSec
   * Specifies number of seconds to wait after user interaction.
   * If nothing happens in that time - canvas will be saved.
   * Any interaction resets the timer.
   *
   * @param {boolean} options.contentConfig.saveInHtml
   * Controls whether a drawer will save its content to underlying
   * image element.
   * <br><br>
   *
   * If <code>true</code>, canvas objects data will be serialized to JSON and
   * appended to image's <code>data-canvas-serialized</code> attribute.
   * <br><br>
   *
   * Note that JSON could be huge on canvases with a lot of objects and
   * freedrawings.
   *
   *
   * @param {String|jQuery} options.contentConfig.imagesContainer
   * Specifies external data container for canvas images data.
   * <br><br>
   *
   * Canvas will serialize itself into base64 encoded png image and
   * store it as json-encoded text to that container.
   * <br><br>
   *
   * This could be used for storing rendered images separately from content.
   * <br><br>
   *
   * JSON example:
   * <code><pre>
   * {
   *    'canvas_id': 'base64/png .....'
   * }
   * </pre></code>
   *
   *
   * @param {String|jQuery} options.contentConfig.canvasDataContainer
   * Specifies external data container for canvas data.
   * <br><br>
   *
   * Canvas will serialize itself into json object containing all the vector
   * objects on canvas and its parameters like angle, color etc.
   * <br><br>
   *
   * This could be used for storing canvas vector data separately from content.
   * <br><br>
   *
   * JSON example:
   * <code><pre>
   * {
   *    'canvas_id': {
   *        'objects': []
   *    }
   * }
   * </pre></code>
   *
   * @param {Function} options.contentConfig.loadCanvasData
   * Specifies a function that will be called when editable canvas needs to
   * load its fabricjs data.
   * <br><br>
   * <code>function(canvasId)</code>
   *
   * @param {Function} options.contentConfig.saveCanvasData
   * Specifies a function that will be called when editable canvas needs to
   * store its fabricjs data.
   * <br><br>
   * <code>function(canvasId, canvasData)</code>
   *
   * @param {Function} options.contentConfig.loadImageData
   * Specifies a function that will be called when editable canvas needs to
   * load base64/png image data data.
   * <br><br>
   * <code>function(canvasId)</code>
   *
   * @param {Function} options.contentConfig.saveImageData
   * Specifies a function that will be called when editable canvas needs to
   * save base64/png image data data.
   * <br><br>
   * <code>function(canvasId, imageData)</code>
   *
   * @param {string} options.basePath
   * Base web url from which all needed drawer files (assets basically)
   * will be loaded. If null, drawer will try to determine it by itself by
   * parsing it's script 'src' tag.
   *
   * @param width {number}   Width in px
   * @param height {number}  Height in px
   *
   * @memberof DrawerJs
   * @constructor
   */
  var Drawer = function DrawerConstructor(redactorInstance, options,
                                          width, height) {
    var _this = this;
    this.mode = this.MODE_INACTIVE;
    this.redactorInstance = redactorInstance;
    this.id = Math.random().toString().replace('0.', '');
    this.width = width || 0;
    this.height = height || 0;

    /**
     * Use jQuery's event system to dispatch events
     * @type {jQuery}
     * @private
     */

    this._eventEmitter = $({});

    this.api = new namespace.DrawerApi(this);

    this.setOptions(options);


    /**
     * Image element for previewing canvas.
     * @type {jQuery}
     */
    this.$imageElement = null;

    /**
     * Container for all editing controls.
     * @type {jQuery}
     */
    this.$canvasEditContainer = null;

    /**
     * Aligment css riles for this canvas.
     * Those rules will be applied to image when edit mode is off,
     * and to canvas edit box when edit mode is on.
     * @type {{}}
     */
    this.aligmentCss = {};

    // toolbars manager
    this.toolbars = new DrawerToolbarManager(this);
    // this.loadPlugins();

    if (_this.options.detectTouch) {
      if (_this.options.detectTouch.constructor.name !== 'Function') {
        throw new Error('detectTouch should be a function which will be ' +
        'called when Drawer needs to determine whether it is working ' +
        'on touch device');
      }

      _this.touchDevice = _this.options.detectTouch(_this);
    } else {
      _this.touchDevice = /(iPhone|iPod|iPad|BlackBerry|Android)/
        .test(navigator.userAgent);

      $('body').on('touchstart.DrawerTouchCheck', function () {
        _this.touchDevice = true;
        $('body').off('touchstart.DrawerTouchCheck');
        _this.log('touch', 'Found touch screen');
      });
    }

    _this.$canvasDataContainer = null;
    if (_this.options.contentConfig.canvasDataContainer) {
      _this.$canvasDataContainer =
        $(_this.options.contentConfig.canvasDataContainer);

      if (_this.$canvasDataContainer.length < 1) {
        _this.$canvasDataContainer = null;
        throw new Error('contentConfig.canvasDataContainer provided but ' +
        'not found in DOM: ' +
        _this.options.contentConfig.canvasDataContainer);
      }
    }

    _this.$imagesContainer = null;
    if (_this.options.contentConfig.imagesContainer) {
      _this.$imagesContainer =
        $(_this.options.contentConfig.imagesContainer);

      if (_this.$imagesContainer.length < 1) {
        _this.$imagesContainer = null;
        throw new Error('contentConfig.imagesContainer provided but ' +
        'not found in DOM: ' +
        _this.options.contentConfig.imagesContainer);
      }
    }

    var inlineStyles = '' +
      '.editable-canvas-not-edited {' +
        'background: url(' + this.options.defaultImageUrl + ') no-repeat !important;' +
        'background-size: contain !important;' +
      '}';

    util.addStyle(inlineStyles);

    return this;
  };


  Drawer.prototype.api = {};

  Drawer.prototype.MODE_PREPARING = 'mode:preparing';
  Drawer.prototype.MODE_ACTIVE = 'mode:active';
  Drawer.prototype.MODE_INACTIVE = 'mode:inactive';



  /**
   * Sets new  drawer options. Reloads plugins.
   * @param {Object} options
   */
  Drawer.prototype.setOptions = function(options) {
      this.options = $.extend(true, this.defaultOptions || {}, options || {});

      this.onOptionsUpdated(true);
  };

  /**
   * Get config of plugin
   * @param {String} name - name of plugin
   * @returns {Object} - config of plugin
   */
  Drawer.prototype.getPluginConfig = function(name) {
    var result = {},
        nameIsValid = name && typeof name === 'string' && name.length,
        pluginConfig = nameIsValid && this.options.pluginsConfig[name],
        textPluginConfig = nameIsValid && this.options.pluginsConfig.Text && this.options.pluginsConfig.Text[name];

    if (pluginConfig) {
      result = $.extend(true, result, pluginConfig);
    }
    if (textPluginConfig) {
      result = $.extend(true, result, textPluginConfig);
    }

    return result;
  };

  /**
   * Update current options.
   * If optionsToUpdate has plugins key, plugins will be reloaded
   *
   * @param  {Object} optionsToUpdate options object
   */
  Drawer.prototype.updateOptions = function(optionsToUpdate) {
      optionsToUpdate = optionsToUpdate || {};
      this.options = $.extend(true, this.options, optionsToUpdate);

      var doReloadPlugins = false;
      if (optionsToUpdate.plugins) {
          // replace old plugin list with new, not extend
          this.options.plugins = optionsToUpdate.plugins;
          doReloadPlugins = true;
      }

      this.onOptionsUpdated(doReloadPlugins);
  };




  Drawer.prototype.onOptionsUpdated = function(reloadPlugins) {
      if(this.options.basePath) {
          util.setDrawerFolderUrl(this.options.basePath);
       }

      // hotfix for paths containing drawer folder
      this.options.canvasProperties.rotationCursor = 'url(' + util.getDrawerFolderUrl() + 'assets/cursor-fa-rotate-right.cur), default';

      if (!this.activeColor) {
          this.activeColor = this.options.activeColor || this.defaultOptions.activeColor;
      }
    if (this.activeOpacity === undefined) {
      this.activeOpacity = this.options.activeOpacity || this.defaultOptions.activeOpacity;
    }

      if (reloadPlugins) {
        this.loadPlugins();
        if (this.toolbars) {
          this.toolbars.resetAllToolbars();
        }
      }
  };

  /**
   * Unloads all plugins,
   */
  Drawer.prototype.unloadPlugins = function() {
      for (var key in this._pluginsInstances) {
        this.unloadPlugin(key);
      }
  };


  /**
   * Unload plugin by name.
   */
  Drawer.prototype.unloadPlugin = function(pluginName) {
    if (this._pluginsInstances.hasOwnProperty(pluginName)) {
        var tool = this._pluginsInstances[pluginName];
        if (tool.removeTool) {
            tool.removeTool(true);
        }
      delete this._pluginsInstances[pluginName];
    }
  };

  /**
   * Load plugin
   * @param {String} pluginName - name of plugin to load
   */
  Drawer.prototype.loadPlugin = function (pluginName) {
    if (!pluginName || !pluginsNamespace[pluginName]) {
      this.error('Drawer: Load plugin error - ' + pluginName + '. No such plugin.');
      return;
    }

    var alreadyInitialized = this._pluginsInstances[pluginName],
        isCorePlugin = this.options.corePlugins && this.options.corePlugins.indexOf(pluginName) !== -1;
    if (alreadyInitialized) {
      if (!isCorePlugin) {
        this.error('Drawer: Load plugin error - ' + pluginName + '. Plugin should not be specified multiple times.');
      }
      return;
    }

    try {
      var pluginConfig = {};
      if (this.options.pluginsConfig[pluginName]) {
        pluginConfig = this.options.pluginsConfig[pluginName];
      }
      var plugin = new pluginsNamespace[pluginName](this, pluginConfig);
      this._pluginsInstances[pluginName] = plugin;
    } catch (err) {
      this.error('Drawer: Load plugin error - ' + pluginName + '.');
      this.error(err);
    }
  };


  /**
   * Create plugins instances, according to options.plugins list
   */
  Drawer.prototype.loadPlugins = function() {
    if (!this._pluginsInstances) {
      this._pluginsInstances = {};
    } else {
      this.unloadPlugins();
    }

    if (this.options.corePlugins) {
      for (var j = 0; j < this.options.corePlugins.length; j++) {
        this.loadPlugin(this.options.corePlugins[j]);
      }
    }
    if (this.options.plugins) {
      for (var i = 0; i < this.options.plugins.length; i++) {
        this.loadPlugin(this.options.plugins[i]);
      }
    }
  };





  Drawer.prototype.log = function (tag, msg) {
    if (this.options.debug) {
      console.log('%c[' + tag + ']', 'color: green', msg);
    }
  };

  Drawer.prototype.error = function (msg) {
    if (this.options.debug) {
      console.error(msg);
    }
  };

  Drawer.prototype.clickEvent = function (namespace) {
    return 'click.' + namespace + ' touchend.' + namespace;
  };


  /**
   * Returns html string that should be appended to DOM and will represent
   * editable canvas.
   *
   * @returns {String}
   */
  Drawer.prototype.getHtml = function () {
    var img = $('<img>')
      .css({
        'display': 'inline-block',
        'width': this.width ||  this.options.defaultWidth,
        'height': this.height || this.options.defaultHeight,
        'background': this.options.backgroundCss
      })
      .addClass('editable-canvas-image')
      .addClass('editable-canvas-not-edited')
      .attr('id', 'canvas_image_' + this.id)
      .attr('data-redactor-drawer-enabled', true)
      .attr('src', '');

    if (this.options.borderCss) {
      img.css('border', this.options.borderCss);
    }

    return $(img)[0].outerHTML;
  };

  /**
   * This method should be called every time display properties of canvas
   * change to properly restore them after sync/load.
   */
  Drawer.prototype.updateAligmentCss = function () {
    this.aligmentCss = this.getAligmentCssFor(this.$imageElement);
  };

  Drawer.prototype.getAligmentCssFor = function (element) {
    var styles = window.getComputedStyle(element[0]),
        aligmentCss = {
      'display': styles.display,
      'float': styles.float,
      'margin-left': styles.marginLeft,
      'margin-right': styles.marginRight,
      'position': styles.position,
      'left': styles.left,
      'top': styles.top
    };

    if (element.attr('data-margin-left')) {
      aligmentCss['margin-left'] = element.attr('data-margin-left');
    }

    if (element.attr('data-margin-right')) {
      aligmentCss['margin-right'] = element.attr('data-margin-right');
    }

    return aligmentCss;
  };

  Drawer.prototype.setAligmentCssFor = function (element, css) {
    if (element.css('display') == 'none') {
      delete css.display;
    }

    element.css(css);

    if (css['margin-left'] && css['margin-left'] == 'auto') {
      element.css('margin-left', 'auto');
      element.attr('data-margin-left', 'auto');
    }

    if (css['margin-right'] && css['margin-right'] == 'auto') {
      element.css('margin-right', 'auto');
      element.attr('data-margin-right', 'auto');
    }
  };

  /**
   * Should be called after inserting this element to DOM
   * to setup necessary event handlers etc.
   */
  Drawer.prototype.onInsert = function () {
    var _this = this;

    $(document).off(this.clickEvent('DrawerStop' + this.id));

    // If we have no image element here - this is the first run
    var firstRun = !this.$imageElement;

    this.$imageElement = $(document.getElementById('canvas_image_' + this.id));

    if (firstRun) {
      if (this.options.align) {
         this.aligmentCss = this._generateAlignCss(this.options.align);
      } else {
        this.aligmentCss = this.getAligmentCssFor(this.$imageElement);
      }

      this.width = this.$imageElement.outerWidth();
      this.height = this.$imageElement.outerHeight();
      this.$imageElement.removeClass('edit-mode');
    }

    if (this.$imageElement.attr('src').length < 1 &&
      !this.$imageElement.hasClass('editable-canvas-not-edited')) {
      this.$imageElement.attr('src', this.getImageData());
      this.$imageElement.removeClass('editable-canvas-not-edited');
    }

    //this.setSize(this.width, this.height);
    this.setAligmentCssFor(this.$imageElement, this.aligmentCss);

    // since this function can be called multiple times in a row
    // (it's called every time something in redactor changes)
    // we should clear previously set handlers.
    if (this.options.editOnClick) {
      this.$imageElement.off();
      util.bindClick(this.$imageElement, 'Drawer', function (event) {
        _this._startEditing();
      });
    } else {
      this.$imageElement.off(_this.clickEvent('Drawer'));
      this.$imageElement.on(_this.clickEvent('Drawer'), function () {
        _this.drawCanvasControls();
      });
    }

    // set global click handler
    util.bindClick($(document), 'Drawer', this._globalClickHandler.bind(this));

    // call onOptionsChange on EVENT_OPTIONS_CHANGED
    this.on(this.EVENT_OPTIONS_CHANGED, this.onOptionsChange.bind(this));
    // call onOptionsChange on EVENT_CANVAS_READY, for initial setup
    this.on(this.EVENT_CANVAS_READY, this.onOptionsChange.bind(this));
  };


  /**
   * Intercept all click events and check their targets.
   * if target is inside canvas edit box - do nothing.
   * otherwise - trigger 'stopEditing' method.
   *
   * @param  {Event} event click
   */
  Drawer.prototype._globalClickHandler = function(event) {
      var parentDrawerBox = $(event.target).parents('#redactor-drawer-box');

      if (parentDrawerBox.length > 0) {
        if (parentDrawerBox.attr('data-canvas-id') != this.id) {
          return false;
        }
        return true;
      }

      if (event.target.id == 'canvas_image_' + this.id) {
        return false;
      }

      if (event.target.id == 'redactor-image-editter' &&
        $(event.target).attr('data-canvas-id') == this.id) {
        return false;
      }

      if ($(event.target).parents('#redactor-modal').length > 0) {
        return false;
      }

      if (this.$canvasEditContainer) {
        // ignore outside mouse-up while resizing
        var needToStop = this.options.exitOnOutsideClick &&
            !this.resizingNow &&
            !this.croppingNow &&
            !this.movingNow &&
            !this.fullscreenMode &&
            !this.drawingInProgress &&
            !this.isBrushDrawing;
        if (needToStop) {
          this._stopEditing();
        }
      }
  };

  /**
   * Activates on the 'onclick' handler
   * to draw controls ('Edit in drawer button') over image.
   *
   * Redactor automatically places 'onclick' handler on image when it is appended,
   * so it will fire first and it will place image edit html
   * over image ('Edit' at the center).
   * That handler is Redactor.image.loadEditableControls(imageElement);
   *
   * Our handler will file later with that edit html appended, so all we need is
   * to correct button's title and to change 'onclick' handler of edit-box
   * to ours.
   */
  Drawer.prototype.drawCanvasControls = function () {
    var _this = this;
    // use default image module to generate markup
    //this.redactorInstance.image.loadEditableControls(this.imageElement);

    // enable click handlers
    var $editter = $('#redactor-image-editter');
    $editter.attr('data-canvas-id', this.id);
    $editter.text('Edit in Drawer');
    // position correction
    $editter.css('margin-left', '-' + $editter.innerWidth() / 2 + 'px');
    $editter.off('click');

    $editter.on('click', function () {
      _this._startEditing();
    });
  };

  /**
   * Turns on edit mode.
   *
   * Hides image element, appends fabricjs canvas element after image,
   * adds toolbars for drawing etc.
   *
   * @private
   */
  Drawer.prototype._startEditing = function () {
    this.log('canvasEditMode', 'startEditing()');
    var _this = this;
    if (this.mode != this.MODE_INACTIVE) {
      this.log('Drawer.startEditing(): already in active mode');
      return;
    }
    this.mode = this.MODE_PREPARING;

    // since we are working inside redactor's editing area which has
    // contenteditable=true, every our click to canvas/image/canvas edit
    // controls etc will be propagated to redactor's editbox and keyboard
    // will be shown on touch devices.
    // To prevent that we need to set contenteditable=false every time canvas
    // goes into editing mode.
    if (_this.redactorInstance) {
      _this.redactorInstance.$editor.attr('contenteditable', 'false');
    }

    _this._previousFocusedElement = document.activeElement;
    $(document.activeElement).blur();

    // user can resize image so we need to update our w/h.
    this.width = this.$imageElement.outerWidth();
    this.height = this.$imageElement.outerHeight();

    this.$imageElement.addClass('edit-mode');
    this.$imageElement.removeClass('editable-canvas-not-edited');

    var $canvas = $('<canvas width="' + this.width + '"' +
    ' height="' + this.height + '" />');

    this.$canvasEditContainer = $('<span id="redactor-drawer-box" ' +
    'data-canvas-id="' + this.id + '" tabindex="0"></span>');
    this.$canvasEditContainer = $('<span></span>');
    this.$canvasEditContainer.attr('id', 'redactor-drawer-box');
    this.$canvasEditContainer.attr('data-canvas-id', this.id);
    this.$canvasEditContainer.attr({
      'id':'redactor-drawer-box',
      'class': 'drawer-instance-container',
      'data-canvas-id': this.id,
      'tabindex': '0'
    });

    if (this.options.borderCss) {
      this.$canvasEditContainer.css('border', this.options.borderCssEditMode);
    }

    if (this.touchDevice) {
      this.$canvasEditContainer.addClass('touch');
    }
    this.$canvasEditContainer.css({
      'position': 'absolute'
    });

    this.aligmentCss = this.getAligmentCssFor(this.$imageElement);

    this.$canvasEditContainer.append($canvas);

    $('body').append(this.$canvasEditContainer);
    this.adjustEditContainer();
    $(window).on('resize.drawer' + this.id, function () {
      _this.adjustEditContainer(false, true);
    });

    if (this.redactorInstance) {
      this.redactorInstance.image.hideResize();
    }

    // get serialized canvas
    var serializedCanvas = this.getCanvasData();

    // create fabricJs canvas
    this.fCanvas = new namespace.Canvas($canvas.get(0));
    this.fCanvas.selection = false; // [DRW-74] Prevent selecting multiple objects

    if (this.options && this.options.canvasProperties) {
      $.each(this.options.canvasProperties, function (k, v) {
        _this.fCanvas[k] = v;
      });
    }

    this.$canvasEditContainer
      .css('background', this.$imageElement.css('background'));

    this.loadCanvas(serializedCanvas);
  };


  /**
   * Turns off edit mode.
   *
   * Serializes all objects painted on canvas to base64 and sets it as
   * this.imageElement 'src' attribute.
   *
   * Serializes all objects painted on canvas to json and sets it as
   * this.imageElement 'data-canvas-serialized' attribute, so all canvas objects
   * could be restored for editing later.
   *
   * @private
   */
  Drawer.prototype._stopEditing = function () {
    this.log('canvasEditMode', '_stopEditing()');
    if (this.mode == this.MODE_INACTIVE) {
      this.log('canvasEditMode', '_stopEditing(): already stopped, mode is INACTIVE');
      return;
    }

    // see startEditingMethod for the reason of making redactor uneditable
    if (this.redactorInstance) {
      this.redactorInstance.$editor.attr('contenteditable', 'true');
    }

    // deactivate all tools
    this.trigger(this.EVENT_DO_DEACTIVATE_ALL_TOOLS);

    // torn off any selection on objects
    if (this.fCanvas) {
      this.fCanvas.deactivateAll();
    }

    // image should show what has been painted on canvas
    this.$imageElement.attr('src', this.getImageData());
    this.$imageElement.removeClass('edit-mode');
    this.$imageElement.removeClass('editable-canvas-not-edited');

    this.syncCanvasData();

    this.$imageElement.show();

    if (this.$canvasEditContainer) {
      this.$canvasEditContainer.remove();
      this.$canvasEditContainer = null;
    }

    $(window).off('resize.drawer' + this.id);

    this.trigger(this.EVENT_EDIT_STOP);
    this.mode = this.MODE_INACTIVE;
  };

  /**
   *
   * @param {String} newColor
   */
  Drawer.prototype.setActiveColor = function (newColor) {
    var currActiveObject = this.fCanvas.getActiveObject(),
        currActiveTool = this.activeDrawingTool,
        colorPluginInstance = this._pluginsInstances.Color,
        colorPickerControl = colorPluginInstance && colorPluginInstance.colorControl;


    this.activeColor = newColor;
    this.options.activeColor = newColor;
    if (!currActiveObject && colorPickerControl) {
      colorPickerControl.setColor(newColor);
    }
    if (currActiveTool) {
      currActiveTool.brush = null;
      currActiveTool._activateTool();
    }
    this.trigger(this.EVENT_CANVAS_MODIFIED);
  };


  /**
   * Changes active editor color.
   * When called without attributes re-sets previously saved color to canvas.
   *
   * @param {String|null} [newColor]
   * @param {Number|null} [newOpacity] - New opacity value
   */
  Drawer.prototype.setColor = function (newColor, newOpacity) {
    if (newColor) {
      this.activeColor = newColor;
    }
    if (newOpacity !== undefined) {
      this.activeOpacity = newOpacity;
    }

    if (!this.fCanvas) {
      return;
    }

    var activeObject = this.fCanvas.getActiveObject();
    this.setOpacity(this.activeOpacity, true);
    if (activeObject) {
      var isLineType =  activeObject.type === 'line' || activeObject.type === 'arrow',
          havePath = activeObject.path;
      if (isLineType) {
        activeObject.set('stroke', this.activeColor);
      } else {
        if (havePath) {
          activeObject.set('stroke', this.activeColor);
        } else {
          activeObject.set('fill', this.activeColor);
        }
      }
      this.fCanvas.renderAll();
    }
    this.fCanvas.freeDrawingBrush.color = this.activeColor;
    this.fCanvas.freeDrawingBrush.fill = this.activeColor;
    this.trigger(this.EVENT_CANVAS_MODIFIED);
  };

  /**
   *
   * @param value
   * @param withoutProcessing
   */
  Drawer.prototype.setOpacity = function (value, withoutProcessing) {
    value = value!== undefined ? value : this.activeOpacity;
    this.activeOpacity = value;
    var activeObject = this.fCanvas.getActiveObject();
    if (activeObject) {
      activeObject.set('opacity', value);
    }
    this.fCanvas.freeDrawingBrush.opacity = value;
    if (!withoutProcessing) {
      this.fCanvas.renderAll();
      this.trigger(this.EVENT_CANVAS_MODIFIED);
    }
  };

  /**
   * Changes brush size in free drawing mode.
   *
   * @param {int|null} [newBrushSize]
   */
  Drawer.prototype.setBrushSize = function (newBrushSize) {
    if (this.fCanvas) {
      this.fCanvas.freeDrawingBrush.width = newBrushSize;
    }

    this.trigger(this.EVENT_BRUSH_SIZE_CHANGED);
  };

  /**
   * Returns size of currently selected tool brush.
   *
   * @returns {number}
   */
  Drawer.prototype.getBrushSize = function () {
    var size = 0;

    if (this.fCanvas) {
      size = this.fCanvas.freeDrawingBrush.width;
    }

    return size;
  };

  Drawer.prototype.setBrush = function (newBrush) {
    this.fCanvas.freeDrawingBrush = newBrush;
    this.trigger(this.EVENT_BRUSH_CHANGED);
  };

  Drawer.prototype.getBrush = function () {
    return this.fCanvas ? this.fCanvas.freeDrawingBrush : null;
  };

  /**
   * Get current sizes of Drawer
   * @returns {DrawerJs.DrawerApi.sizesOfDrawer}
   */
  Drawer.prototype.getSize = function () {
    var result = {},
        $container = this.$canvasEditContainer,
        containerSizes = $container && $container.get(0).getBoundingClientRect(),
        scrollSizes = $container && util.getScrollOffset($container);

    result.top = containerSizes ? containerSizes.top : null;
    result.left = containerSizes ? containerSizes.left : null;

    result.scrollTop = scrollSizes ? scrollSizes.top : null;
    result.scrollLeft = scrollSizes ? scrollSizes.left : null;

    result.width = this.width;
    result.height = this.height;
    return result;
  };

  /**
   * Changes canvas size.
   *
   * @param {number} width
   * @param {number} height
   */
  Drawer.prototype.setSize = function (width, height) {
    this.width = width;
    this.height = height;

    if (this.fCanvas) {
      this.fCanvas.setWidth(this.width);
      this.fCanvas.setHeight(this.height);
    }

    this.$imageElement.css('width', this.width);
    this.$imageElement.css('height', this.height);

    if (this.$canvasEditContainer) {
      this.$canvasEditContainer.css('width', this.width);
      this.$canvasEditContainer.css('height', this.height);
    }

    this.adjustEditContainer(false, true);
  };


  /**
   * Generates css for given align.
   * @param  {String} alignMode left|right|center|inline|floating
   * @return {Object} object with css properties
   */
  Drawer.prototype._generateAlignCss = function (alignMode) {
    var aligmentCss = {};

    switch (alignMode) {
     case 'floating' :
      aligmentCss['position'] = 'absolute';
      aligmentCss['display'] = 'block';
      aligmentCss['float'] = 'none';
      aligmentCss['left'] = '0px';
      aligmentCss['top'] = '0px';
     break;

     case 'center' :
      aligmentCss['float'] = 'none';
      aligmentCss['margin-left'] = 'auto';
      aligmentCss['margin-right'] = 'auto';
      aligmentCss['display'] = 'block';
      aligmentCss['position'] = 'static';
     break;

     case 'left' :
     case 'right' :
      aligmentCss['display'] = 'block';
      aligmentCss['float'] = alignMode;
      aligmentCss['position'] = 'static';
     break;

     case 'inline' :
      aligmentCss['float'] = 'none';
      aligmentCss['display'] = 'inline-block';
      aligmentCss['position'] = 'static';
     break;

     default:
      aligmentCss['float'] = 'none';
      aligmentCss['display'] = 'inline-block';
      aligmentCss['position'] = 'static';
    }

    return aligmentCss;
  };

  /**
   * Changes canvas aligment.
   *
   * @param {String} align left|right|center|inline|floating
   */
  Drawer.prototype.setAlign = function (align) {
    var newAligmentCss = this._generateAlignCss(align);

    this.setAligmentCssFor(this.$imageElement, newAligmentCss);
    this.aligmentCss = this.getAligmentCssFor(this.$imageElement);

    this.adjustEditContainer();

    this.trigger(this.EVENT_CANVAS_MODIFIED);
  };

  /**
   * Returns current aligment setting for canvas.
   *
   * @returns {string} align left|right|center|inline|floating
   */
  Drawer.prototype.getAlign = function () {
    var currentAlign = 'inline';

    if (this.aligmentCss['position'] == 'absolute') {
      currentAlign = 'floating';
    }
    else if (this.aligmentCss['float'] == 'left') {
      currentAlign = 'left';
    } else if (this.aligmentCss['float'] == 'right') {
      currentAlign = 'right';
    } else if (this.aligmentCss['display'] == 'block' &&
      this.aligmentCss['margin-left'] == 'auto') {
      currentAlign = 'center';
    }

    return currentAlign;
  };

  /**
   *
   * @param {Boolean} [withAnimation]
   * @param {Boolean} [doNotUseDelay] - in some conditions need to use delay to prevent animation
   * @returns {boolean}
   */
  Drawer.prototype.adjustEditContainer = function (withAnimation, doNotUseDelay) {
    var self = this,
        drawerHaveAnimatedClass = this.$canvasEditContainer.hasClass('animated');
    if (!this.$canvasEditContainer) {
      return false;
    }

    var imageOffset = this.$imageElement.offset();
    if (!withAnimation) {
      this.$canvasEditContainer.removeClass('animated');
    }
    this.$canvasEditContainer.css({
      top: imageOffset.top,
      left: imageOffset.left
    });
    if (!withAnimation) {
      if (doNotUseDelay) {
        self.$canvasEditContainer.toggleClass('animated', !!drawerHaveAnimatedClass);
      } else {
        util.setTimeout(function(){
          if (self.$canvasEditContainer && self.$canvasEditContainer.length) {
            self.$canvasEditContainer.toggleClass('animated', !!drawerHaveAnimatedClass);
          }
        },0);
      }
    }
  };

  /**
   * Removes itself from redactor entirely.
   */
  Drawer.prototype.destroy = function () {
    this.trigger(this.EVENT_DESTROY);
    this._stopEditing();
    this.$imageElement.remove();
    this.syncCanvasData(true);
    this.syncImageData(true);
  };


 /**
  * Activates default tool, if options.defaultActivePlugin is set;
  * Name of plugin is taken from options.defaultActivePlugin.name;
  * Depending on options.defaultActivePlugin.mode :
  * 'always'   - same plugin will be always activated
  * 'onNew'    - default plugin is activated, only if canvas is empty
  * 'lastUsed' - on first drawer run plugin options.defaultActivePlugin.name, on consecutive - last used tool
  */
 Drawer.prototype.activateDefaultPlugin = function () {
  // see, if we need to activate default tool
  if (!this.options.defaultActivePlugin) {
    return;
  }

  var pluginName = this.options.defaultActivePlugin.name;
  var pluginMode = this.options.defaultActivePlugin.mode;

  // mode 'always' and 'lastUsed' go always; onNew - only if canvas is empty
  if ((pluginMode == 'always') || (pluginMode  == 'lastUsed') ||
      (pluginMode == 'onNew' && (this.fCanvas.getObjects().length === 0))) {

      this.log('defaultActivePlugin', pluginMode+'/'+pluginName);

    // if pluginMode is 'lastUsed' and we have already used tool - use it again
    if (this.lastUsedPluginName && pluginMode  == 'lastUsed'){
      pluginName = this.lastUsedPluginName;
    }

    // if plugin 'pluginName' exists, activate it
    var defaultTool = this._pluginsInstances[pluginName];
    if (defaultTool) {
      this.trigger(this.EVENT_DO_ACTIVATE_TOOL, [defaultTool]);
    } else {
      this.log('WARNING', "options['defaultActivePlugin']['name'] is '" + pluginName + "', but no such plugin found.");
    }
  }

 };

  /**
   * This method will be triggered every time something on canvas change
   * to perform synchronization work, trigger events etc.
   *
   * @param {Boolean} ignoreOptions Some options like saveAfterInactiveSec
   * could modify this method behavior to postpone modify event for later
   * for better performance. This param allows to ignore any options when
   * {true} is passed.
   */
  Drawer.prototype.onCanvasModified = function (ignoreOptions) {
    var _this = this;

    if (ignoreOptions === undefined &&
      this.options.contentConfig.saveAfterInactiveSec) {

      if (this.__activityTimer !== undefined) {
        _this.log('saveAfterInactiveSec', 'Cleaning previous timeout');
        clearTimeout(this.__activityTimer);
      }

      _this.log('saveAfterInactiveSec', 'Setting up a timeout');
      this.__activityTimer = util.setTimeout(function () {
        _this.log('saveAfterInactiveSec',
          'Timeout happened, triggering onCanvasModified');
        _this.onCanvasModified(true);
      }, this.options.contentConfig.saveAfterInactiveSec * 1000);

      return false;
    }

    if (!this.redactorInstance) {
      // when working inside redactor, RedactorPlugin.js will do this for us
      // because one redactor instance could contain multiple Drawers and
      // it's RedactorPlugin's responsibility to synchronize all canvases
      // at same time
      this.beforeSync();
    }

    this.syncCanvasData();
    this.syncImageData();

    this.trigger(this.EVENT_CANVAS_MODIFIED);

    if (!this.redactorInstance) {
      this.afterSync();
    }
  };

  /**
   * Fabric.js allows objects controls configuration to be applied only
   * on instances of objects, but drawer provides global configuration
   * in 'objectControls' section.
   *
   * This method applies that config to specified object with respect to
   * touch/desktop config sections.
   *
   * @private
   */
  Drawer.prototype._updateObjectsControls = function (fObject) {
    var objProps = this.options.objectControls;

    if (this.touchDevice && this.options.objectControlsTouch) {
      objProps = this.options.objectControlsTouch;
    }

    if (objProps) {
      for (var propertyName in objProps) {
        if (objProps.hasOwnProperty(propertyName)) {
          fObject.set(propertyName, objProps[propertyName]);
        }
      }
    }
  };

  Drawer.prototype.getPluginInstance = function (pluginName) {
    if (!this._pluginsInstances[pluginName]) {
      throw new Error('Plugin not exists: ' + pluginName);
    } else {
      return this._pluginsInstances[pluginName];
    }
  };


  /**
   * Is called on EVENT_OPTIONS_CHANGED.
   * - changes background transparency
   */
  Drawer.prototype.onOptionsChange = function () {
    if (this.options.transparentBackground) {
      this.$imageElement.css('background', 'transparent');
      this.$canvasEditContainer.css('background', 'transparent');
    } else {
      this.$imageElement.css('background', 'white');
      this.$canvasEditContainer.css('background', 'white');
    }
  };


  /**
   * Returns translated text string from default vocabulary of from
   * specified 'texts' config.
   *
   * If string not found console.warn will be used and provided textString
   * will be returned.
   *
   * @param textString
   */
  Drawer.prototype.t = function (textString) {
    if (this.options.texts[textString]) {
      return this.options.texts[textString];
    } else {
      // console.warn('String not found in texts:' + textString);
      return textString;
    }
  };


  /**
   * Shows error message to user.
   *
   * @param {String} err
   */
  Drawer.prototype.showError = function(err) {
    // @todo: replace alert!
    alert(err);
  };

  /**
   * Returns x coord of drawer left-top
   *
   * @return {Number} left
   */
  Drawer.prototype.left = function() {
    return this.$canvasEditContainer.css('left').replace('px', '') | 0;
  };

  /**
   * Returns y coord of drawer left-top
   *
   * @return {Number} left
   */
  Drawer.prototype.top = function() {
    return this.$canvasEditContainer.css('top').replace('px', '') | 0;
  };

  Drawer.prototype.setTemporaryStyles = function(styles) {
      styles = styles || false;
      var stylesAreValid = !!styles,
          temporaryStyles = stylesAreValid ? $.extend(true, {}, this.fCanvas._temporaryStyles || {}, styles || {}) : false;
      for (var styleName in styles) {
        if (styles[styleName] === undefined) {
          delete temporaryStyles[styleName];
        }
      }
      if (temporaryStyles) {
        this.fCanvas._temporaryStyles = temporaryStyles;
        this.fCanvas.copiedTextStyle = {
          0: temporaryStyles
        };
        fabric.copiedTextStyle = {
          0: temporaryStyles
        };
      } else {
        this.fCanvas._temporaryStyles = temporaryStyles;
        this.fCanvas.copiedTextStyle = temporaryStyles;
        fabric.copiedTextStyle = temporaryStyles;
      }
  };

  /**
   * Get position relative to canvas from event
   * @param {Event} event
   * @param {Boolean} [considerZoom] @todo
   * @returns {Object}
   */
  Drawer.prototype.getRelativeEventPosition = function(event, considerZoom) {
    var result = {},
        absolutePosition = util.getEventPosition(event),
        scrollOffset = util.getScrollOffset(this.$canvasEditContainer),
        canvasContainer = this.$canvasEditContainer.get(0),
        canvasContainerSizes = canvasContainer.getBoundingClientRect();

    result.top = absolutePosition.top - canvasContainerSizes.top - scrollOffset.top;
    result.left = absolutePosition.left - canvasContainerSizes.left - scrollOffset.left;
    result.scaledTop = result.top;
    result.scaledLeft = result.left;


    // console.info('pos', result.left, result.scaledLeft, result.top, result.scaledTop);
    return result;
  };

  namespace.Drawer = Drawer;
}(jQuery, DrawerJs, DrawerJs.plugins, DrawerJs.util, DrawerJs.texts));
