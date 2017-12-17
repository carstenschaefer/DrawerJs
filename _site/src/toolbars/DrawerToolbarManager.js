
/**
* Drawer toolbar  class.
* @param {Drawer} drawerInstance
*
* @constructor
*/
var DrawerToolbarManager = function (drawer) {
  this.drawerInstance = drawer;
  if (!drawer) {
    throw new Error("DrawerToolbarManager : drawer must be provided!");
  }
  this.toolbars = {};
  this.toolbarPlaceholders = {};
  this.TooltipManager = new DrawerJs.utilPlugins.TooltipManager(this.drawerInstance);
};


/**
 * Appends toolbar to specified location.
 *
 * @param {DrawerToolbar} toolbar - toolbar to append
 * @param {DrawerToolbar.defaultSetOfOptions} [options] - options of toolbar
 */
DrawerToolbarManager.prototype.addToolbar = function (toolbar, options) {
  options = options || {};
  var customPosition = (options.position == ToolbarPlaceholder.prototype.CUSTOM_POSITION),
      posKey = customPosition ? options.customAnchorSelector : options.position,
      isCustomPositionType = posKey === ToolbarPlaceholder.prototype.POPUP_POSITION || posKey === ToolbarPlaceholder.prototype.OVER_CANVAS_POSITION,
      posTypeKey = isCustomPositionType ? ToolbarPlaceholder.prototype.POSITION_TYPE_CUSTOM : options.positionType || ToolbarPlaceholder.prototype.POSITION_TYPE_OUTSIDE,
      placeHolderByType = this.toolbarPlaceholders[posTypeKey] && this.toolbarPlaceholders[posTypeKey][posKey],
      placeholderByKey = this.toolbarPlaceholders[posKey],
      placeholder = placeHolderByType || placeholderByKey;
  if (placeholder) {
    placeholder.addToolbar(toolbar);
  } else {
    if (!customPosition) {
      var messageText = "DrawerToolbarManager.addToolbar() : no placeholder exists with name '",
          variablesText = posTypeKey + " " + posKey + " " + options.customAnchorSelector + "'";
      this.drawerInstance.error(messageText + variablesText);
    }
  }
};


/**
 * Setup/create all toolbars
 */
DrawerToolbarManager.prototype.createAllToolbars = function () {
  var _this = this;

  this.drawerInstance.trigger(this.drawerInstance.BEFORE_CREATE_TOOLBARS, [this]);

  // create wrapper for toolbar
  this._createHelperElements();

  // create placeholders for toolbars

  this._createToolbarsPlaceholders();

  var toolbarsOptions = this.drawerInstance.options.toolbars,
      isFullscreen = this.drawerInstance.$canvasEditContainer.hasClass('fullscreen');

  var toolOptions_conf,
      drawingTools_conf,
      settingsToolbar_conf,
      overCanvasToolbar_conf = toolbarsOptions.overCanvas;

  if (!isFullscreen) {
    toolOptions_conf = toolbarsOptions.toolOptions;
    drawingTools_conf = toolbarsOptions.drawingTools;
    settingsToolbar_conf = toolbarsOptions.settings;
  } else {
    var overridedValues = {
      positionType: ToolbarPlaceholder.prototype.POSITION_TYPE_INSIDE
    };
    toolOptions_conf = $.extend(true,
        {},
        toolbarsOptions.toolOptions,
        toolbarsOptions.toolOptions.fullscreenMode || {},
        overridedValues);
    drawingTools_conf = $.extend(true,
        {},
        toolbarsOptions.drawingTools,
        toolbarsOptions.drawingTools.fullscreenMode || {},
        overridedValues);
    settingsToolbar_conf = $.extend(true,
        {},
        toolbarsOptions.settings,
        toolbarsOptions.settings.fullscreenMode || {},
        overridedValues);
  }

  // order of toolbox creation MATTERS
  // OptionsToolbar must be created first, because in createToolsToolbar() we can activate default tool,
  // which will trigger updates in BrushSize and BrushColor tools.
  this.toolOptionsToolbar = new ToolOptionsToolbar(this.drawerInstance, toolOptions_conf);
  var toolOptionsToolbarOptions = {
    position: toolOptions_conf.position,
    positionType: toolOptions_conf.positionType,
    customAnchorSelector: toolOptions_conf.customAnchorSelector
  };
  if (toolOptions_conf.compactType === DrawerToolbar.prototype.POPUP) {
    toolOptionsToolbarOptions.position = ToolbarPlaceholder.prototype.POPUP_POSITION;
    toolOptionsToolbarOptions.positionType = ToolbarPlaceholder.prototype.POSITION_TYPE_CUSTOM;
  }
  this.addToolbar(this.toolOptionsToolbar, toolOptionsToolbarOptions);


  // drawer tools
  this.drawingToolsToolbar = new DrawingToolsToolbar(this.drawerInstance, drawingTools_conf);

  var drawingToolsToolbarOptions = {
    position: drawingTools_conf.position,
    positionType: drawingTools_conf.positionType,
    customAnchorSelector: drawingTools_conf.customAnchorSelector
  };
  this.addToolbar(this.drawingToolsToolbar, drawingToolsToolbarOptions);

  // toolbar with close, move, options buttons
  this.settingsToolbar = new SettingsToolbar(this.drawerInstance, settingsToolbar_conf);
  var settingsToolbarOptions = {
    position: settingsToolbar_conf.position,
    positionType: settingsToolbar_conf.positionType,
    customAnchorSelector: settingsToolbar_conf.customAnchorSelector
  };
  this.addToolbar(this.settingsToolbar, settingsToolbarOptions);

  // Over canvas toolbar
  this.overCanvasToolbar = new OverCanvasToolbar(this.drawerInstance, overCanvasToolbar_conf);
  var overCanvasToolbarOptions = {
    position: ToolbarPlaceholder.prototype.OVER_CANVAS_POSITION,
    positionType: ToolbarPlaceholder.prototype.POSITION_TYPE_CUSTOM
  };
  this.addToolbar(this.overCanvasToolbar, overCanvasToolbarOptions);

  // Over canvas toolbar
  this.cropImageToolbar = new CropImageToolbar(this.drawerInstance, overCanvasToolbar_conf);
  var cropImageToolbarOptions = {
    position: ToolbarPlaceholder.prototype.TOP_POSITION,
    positionType: ToolbarPlaceholder.prototype.POSITION_TYPE_INSIDE
  };

  this.addToolbar(this.cropImageToolbar, cropImageToolbarOptions);

  // Minimized toolbar
  this.minimizedToolbar = new MinimizedToolbar(this.drawerInstance);
  var minimizedToolbarOptions = {
    position: ToolbarPlaceholder.prototype.TOP_POSITION,
    positionType: ToolbarPlaceholder.prototype.POSITION_TYPE_INSIDE
  };
  this.addToolbar(this.minimizedToolbar, minimizedToolbarOptions);

  // @todo: move to other place
  this.setToolbarButtonsSize();

  // remove all toolbars on exit
  this.drawerInstance.on(this.drawerInstance.EVENT_EDIT_STOP, function () {
    _this.destroyAllToolbars();
  });

  this.drawerInstance.trigger(this.drawerInstance.AFTER_CREATE_TOOLBARS, [this]);
};


/**
 * Creates placeholders for toolbars.
 * All placeholders are inside this.toolbarPlaceholders.
 * Default keys are : left, right, top, bottom
 * Custom anchor toolbars placeholders are stored as this.toolbarPlaceholders[customAnchorSelector]
 * If no anchor element found by selector - 'top' placeholder is used instead
 *
 * @private
 */
DrawerToolbarManager.prototype._createToolbarsPlaceholders = function() {
  // create placeholders elements
  this.toolbarPlaceholders['outside'] = {};
  this.toolbarPlaceholders['inside'] = {};
  this.toolbarPlaceholders['custom'] = {};

  this.toolbarPlaceholders['outside']['top'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.TOP_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_OUTSIDE);
  this.toolbarPlaceholders['outside']['left'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.LEFT_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_OUTSIDE);
  this.toolbarPlaceholders['outside']['right'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.RIGHT_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_OUTSIDE);
  this.toolbarPlaceholders['outside']['bottom'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.BOTTOM_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_OUTSIDE);

  this.toolbarPlaceholders['inside']['top'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.TOP_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_INSIDE);
  this.toolbarPlaceholders['inside']['left'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.LEFT_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_INSIDE);
  this.toolbarPlaceholders['inside']['right'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.RIGHT_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_INSIDE);
  this.toolbarPlaceholders['inside']['bottom'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.BOTTOM_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_INSIDE);

  this.toolbarPlaceholders['custom']['canvas'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.OVER_CANVAS_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_CUSTOM);
  this.toolbarPlaceholders['custom']['popup'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.POPUP_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_CUSTOM);
  this.toolbarPlaceholders['custom']['minimized'] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.TOP_POSITION, ToolbarPlaceholder.prototype.POSITION_TYPE_INSIDE);

  // @todo: remake this!
  var toolbarNames = ['drawingTools', 'toolOptions', 'settings'];

  // look for all toolbars options and see, if there are custom positions, to create placeholder
  for (var i = 0; i < toolbarNames.length; i++) {
    var toolbarConf = this.drawerInstance.options.toolbars[toolbarNames[i]];
    if (toolbarConf && (toolbarConf.position == ToolbarPlaceholder.prototype.CUSTOM_POSITION) && (toolbarConf.customAnchorSelector)) {
        var anchorSelector = toolbarConf.customAnchorSelector;
        this.toolbarPlaceholders[anchorSelector] = new ToolbarPlaceholder(this.drawerInstance, ToolbarPlaceholder.prototype.CUSTOM_POSITION, null, anchorSelector);
    }
  }
};

/**
 * Remove helper elements such as toolbars wrapper, etc.
 * @private
 */
DrawerToolbarManager.prototype._removeHelperElements = function() {
  if (this.drawerInstance.$toolbarsWrapper && this.drawerInstance.$toolbarsWrapper.length) {
    this.drawerInstance.$toolbarsWrapper.remove();
  }
  var $toolbarsWrapper = this.drawerInstance.$canvasEditContainer.find('.toolbars-wrapper');
  if ($toolbarsWrapper && $toolbarsWrapper.length) {
    $toolbarsWrapper.remove();
  }
  this.drawerInstance.$toolbarsWrapper = undefined;
};

/**
 * Create helper elements such as toolbars wrapper, etc.
 * @private
 */
DrawerToolbarManager.prototype._createHelperElements = function() {
  this._removeHelperElements();
  var toolbarsWrapperHtml = '<div class="toolbars-wrapper"></div>';

  var $toolbarsWrapper = $(toolbarsWrapperHtml),
      container = this.drawerInstance.$canvasEditContainer;

  container.append($toolbarsWrapper);

  this.drawerInstance.$toolbarsWrapper = $toolbarsWrapper;
};

/**
 * Removes all toolbars.
 */
DrawerToolbarManager.prototype.destroyAllToolbars = function () {
    this.settingsToolbar.remove();
    this.drawingToolsToolbar.remove();
    this.toolOptionsToolbar.remove();
};


/**
 * Removes and then re-creates all toolbars.
 */
DrawerToolbarManager.prototype.resetAllToolbars = function() {
  this.destroyAllToolbars();
  this.createAllToolbars();
};


/**
 * This method allows dynamical size adjustment of elements.
 * Elements which needs to be resized should have two attributes:
 *
 * data-editable-canvas-sizeable="someNamespace",
 * where someNamespace is unique id for the group of elements tht will be
 * resized together.
 *
 * data-editable-canvas-cssrules=width,height,font-size:($v / 2.5)
 * which provides a list of css rules on which a new size will be applied.
 * If resulting size needs to be modififed in some way, the one could
 * specify a function like in font-size.
 *
 * @param {String} namespace
 * @param {String} newSize
 * @private
 */
DrawerToolbarManager.prototype._adjustElementsSize = function (namespace, newSize) {
  var elementsToResize =
    $('[data-editable-canvas-sizeable=' + namespace + ']');

  for (var i = 0; i < elementsToResize.length; i++) {
    var elem = elementsToResize[i];

    var attributesToChange = $(elem).attr('data-editable-canvas-cssrules');
    // if no attributes to change - skip
    if (!attributesToChange)
      continue;

    var attributesToChangeArr = attributesToChange.split(',');

    for (var a = 0; a < attributesToChangeArr.length; a++) {
      var attrName = attributesToChangeArr[a];
      var attrVal = newSize;

      if (attrName[0] == '-') {
        attrName = attrName.substr(1);
        attrVal = '-' + newSize;
      }

      var matches = attrName.match(/:\((.+)\)/);
      if (matches) {
        attrName = attrName.replace(matches[0], '');
        var expression = matches[1];
        expression = expression.replace('$v', attrVal);
        var result = new Function("return " + expression)();
        attrVal = result;
      }

      $(elem).css(attrName, attrVal + 'px');
    }
  }
};



/**
 * Sets the size of buttons on all toolbars.
 *
 * @param [size] width and height in px
 */
DrawerToolbarManager.prototype.setToolbarButtonsSize = function (size) {
  if (size) {
    if (this.touchDevice) {
      this.drawerInstance.options.toolbarSizeTouch = size;
    } else {
      this.drawerInstance.options.toolbarSize = size;
    }
  } else {
    if (this.touchDevice) {
      size = this.drawerInstance.options.toolbarSizeTouch;
    } else {
      size = this.drawerInstance.options.toolbarSize;
    }
  }

  this._adjustElementsSize('toolbar-button', size);
};
