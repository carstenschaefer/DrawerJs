(function ($, pluginsNamespace, BaseToolOptions, util) {
  "use strict";

  /**
   * Provides toolbar controls for configuring border size and color.
   * Uses colorpicker plugin, so depends on it.
   *
   * @param {DrawerJs.Drawer} drawer
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @param {Object} options
   * Configuration object.
   *
   * @param {String} options.color
   * Default border color.
   *
   * @param {String} options.borderTypes
   * Object with all borders that will be available for selection
   * <br><br>
   *
   * Example:
   * <code>
   * <pre>
   * "None": {
   *   width: 0,
   *   description: 'None'
   * },
   * "Solid thin": {
   *   width: 1,
   *   preview: this.assetsFolder + 'border-solid-thin.png'
   * },
   * </pre>
   * </code>
   *
   * @param {String} options.defaultBorder
   * Border that will be selected when object is created.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var ShapeBorder = function BorderConfigPlugin(drawer, options) {
    this.optionName = 'border';
    this.name = 'ShapeBorder';
    // call super constructor
    BaseToolOptions.call(this, drawer);

    /**
     * Option name. On selecting tool/object, if this.toolName is in array of
     * object allowed options - tool will show controls
     * @type {String}
     */

    // DrawerJs is created, so basePath is set and  util.getDrawerFolderUrl() works properly.
    // so we can set assets folder
    this.assetsFolder = util.getDrawerFolderUrl() + 'assets/';

    // complete default option paths by assets path.
    this._setGlobalClickHandler();
    this._completeDefaultOptionsPaths();

    // setup colorpicker for border color
    this.colorpicker = new pluginsNamespace.ColorpickerControl(this.drawer, this.options);

    this.currentColor = this.options.color;
    this.currentBorder = this.options.borderTypes[this.options.defaultBorder];
    this.activeToolIsShape = false;

    this.drawer.on(this.drawer.EVENT_CANVAS_START_RESIZE, this.hideStyleDropdown.bind(this));
  };

  ShapeBorder.prototype = Object.create(BaseToolOptions.prototype);
  ShapeBorder.prototype.constructor = BaseToolOptions;


//////////////////////////////////////////////////////////////////////////////////////////
  ShapeBorder.prototype._defaultOptions = {
      color: 'rgba(0, 0, 0, 0)',
      borderTypes: {
        "None": {
          width: 0,
          description: 'None',
          color: 'transparent'
        },
        "Solid thin": {
          width: 1,
          preview: 'border-solid-thin.png'
        },
        "Solid bold": {
          width: 5,
          preview: 'border-solid-bold.png'
        },
        "Dashed thin": {
          width: 1,
          dashArray: [8, 8],
          preview: 'border-dashed-thin.png'
        },
        "Dashed bold": {
          width: 5,
          dashArray: [8, 8],
          preview: 'border-dashed-bold.png'
        }
      },
      defaultBorder: "None"
    };


    /**
     * Complete path to previews by prepending path to assets folder to them
     */
    ShapeBorder.prototype._completeDefaultOptionsPaths = function() {
      for (var borderType in this.options.borderTypes) {
        var borderOption = this.options.borderTypes[borderType];
        if (borderOption.preview) {
          borderOption.preview = this.assetsFolder + borderOption.preview;
        }
      }
    };

  /**
   * Set listeners for clicks - to properly close controls on outside clicks
   */
  ShapeBorder.prototype._setGlobalClickHandler = function() {
    var self = this;
    $(window.document).off('click.DrawerShapeBorder').on('click.DrawerShapeBorder', function (e) {
      var $target = $(e.target),
          isIndicator = $target.hasClass('border-type-indicator');
      if (self.isDropdownVisible && !isIndicator) {
        self.hideStyleDropdown();
      }
    });
  };


  /**
   * When an object is selected on canvas we want to reflect that object's color and border type
   * on the toolbar.
   *
   * This method checks selected object type and if it's a shape it gets that shape's color
   * and border type and sets them as active on the color/border selection toolbar.
   *
   * @param fabricEvent
   * @param fabricEvent
   */
  ShapeBorder.prototype.updateControlsFromObject = function (target) {
    // get color
    this.updateColorFromObject(target);
    // get stroke
    this.updateStrokeFromObject(target);
    // now update controls state
    this.updateControls();
  };


  /**
   * Sets this.currentColor same as object stroke color,
   * or TRASPARENT if object has no stroke
   *
   * @param  {fabric.Object} object
   */
  ShapeBorder.prototype.updateColorFromObject = function (object) {
    var color = null;
    color = object.get('stroke');
    if (color) {
      this.currentColor = color;
    } else {
      this.currentColor = pluginsNamespace.ColorpickerControl.TRANSPARENT;
    }
  };


  /**
   * Sets this.currentBorder same as object stroke,
   * if object border patten matches with one of predefined patterns.
   *
   * @param  {fabric.Object} object
   */
  ShapeBorder.prototype.updateStrokeFromObject = function(object) {
      // get stroke params
      var shapeDashArray = object.get('strokeDashArray');
      var shapeDashWidth = object.get('strokeWidth');
      // search for pattern
      for (var b in this.options.borderTypes) {
        if (this.options.borderTypes.hasOwnProperty(b)) {
          var bType = this.options.borderTypes[b];

          var dashArrayEquals = JSON.stringify(bType.dashArray) === JSON.stringify(shapeDashArray);

          if (!bType.dashArray && !shapeDashArray) {
            dashArrayEquals = true;
          }

          if (dashArrayEquals && bType.width == shapeDashWidth) {
            this.currentBorder = bType;
          }
        }
      }
  };


  /**
   * Apply selected border style to added object.
   *
   * @param evt
   * @param fabricEvent
   */
  ShapeBorder.prototype._onObjectAdded = function (evt, fabricEvent) {
    // do not react on object:added, if canvas is not loaded fully
    if (this.drawer.mode != this.drawer.MODE_ACTIVE)
      return;

    var currentShape = fabricEvent.target;

    this.applyBorderStyle(currentShape);
    this.drawer.fCanvas.renderAll();
  };


  /**
   * Update controls a
   * If activated tool is Line/Arrow:
   * 1) save old values of borderColor and border type
   * 2) make current border color same as drawer active color
   * 3) make current border 'Solid thin'
   * @param {BaseTool} tool
   */
  ShapeBorder.prototype.onActivateTool = function ( tool) {

    if (tool instanceof pluginsNamespace.Line ||
      tool instanceof pluginsNamespace.ArrowOneSide ||
      tool instanceof pluginsNamespace.ArrowTwoSide) {
        this.colorBeforeLineShape = this.currentColor;
        this.borderBeforeLineShape = this.currentBorder;

        this.currentColor = this.drawer.activeColor;
        this.currentBorder = this.options.borderTypes["Solid thin"];
        this.updateControls();
    } else if (this.colorBeforeLineShape !== undefined) {
        this.currentColor = this.colorBeforeLineShape;
        this.currentBorder = this.borderBeforeLineShape;

        delete this.colorBeforeLineShape;
        delete this.borderBeforeLineShape;
        this.updateControls();
    }
  };



  /**
   * Creates controls and adds them to toolbar.
   * @param {DrawerToolbar} toolbar to add control to
   */
  ShapeBorder.prototype.createControls = function (toolbar) {
    var _this = this;

    // ------ color button -----------
    this.colorButton = this.colorpicker.createControl(toolbar, this.onColorSelected.bind(this));
    this.colorpicker.setColor(this.options.color);

    // rewrite this, ugh...
    this.colorButton.css('display', 'inline-block');
    this.colorButton.find('.toolbar-label').text(this.drawer.t('Border:'));
    // ------ /color button -----------

    // ------ border type button -----------
    _this.$borderTypeButton = $(
      '<li class="editable-canvas-border-type" ' +
          'data-editable-canvas-sizeable="toolbar-button" ' +
          '>' +
      '<span class="toolbar-label editable-canvas-border-type-label">' +
      this.drawer.t('Border type:') + ' ' +
      '</span>' +
      '<span class="border-type-indicator" ' +
            'data-editable-canvas-sizeable="toolbar-button" ' +
            '>' +
      '</span>' +
      '<span class="border-type-dropdown toolbar-dropdown-block hidden" ' +
            'data-editable-canvas-sizeable="toolbar-button" ' +
            // 'data-editable-canvas-cssrules="top"' +
      '>' +
      '</span>' +
      '</li>');


    _this.isDropdownVisible = false;

    _this.$borderTypeButton.$dropdown = _this.$borderTypeButton.find('.border-type-dropdown');
    _this.$borderTypeButton.$indicator = _this.$borderTypeButton.find('.border-type-indicator');

    util.bindClick(_this.$borderTypeButton, 'border-type-dropdown', _this.toggleStyleDropdown.bind(_this));

    var $borderTypes = $('<ul></ul>');
    _this.$borderTypeButton.$dropdown.append($borderTypes);

    var borderTypeHandler = function (event) {
      var $target = $(event.target),
          borderTypeName = $target.attr('data-border-type');
      if (borderTypeName) {
        _this.currentBorder = _this.options.borderTypes[borderTypeName];
        _this.onColorSelected();

        event.stopPropagation();
        event.preventDefault();
      }
    };

    for (var borderTypeName in this.options.borderTypes) {
      if (this.options.borderTypes.hasOwnProperty(borderTypeName)) {
        var borderDefinition = this.options.borderTypes[borderTypeName];

        var li = $(
          '<li data-border-type="' + borderTypeName + '"' +
          'data-editable-canvas-sizeable="toolbar-button" ' +
          // 'data-editable-canvas-cssrules="height,line-height">' +
          // 'data-editable-canvas-cssrules="line-height">' +
          '</li>');
        if (borderDefinition.preview) {
          li.css('background-image', 'url(' + borderDefinition.preview + ')');
        }
        if (borderDefinition.description) {
          li.text(borderDefinition.description);
        }
        util.bindClick(li, 'border-type', borderTypeHandler);

        $borderTypes.append(li);
      }
    }

    toolbar.addControl(_this.$borderTypeButton, this.options.buttonOrder);
    // ------ /border type button -----------

    _this.onColorSelected();
    _this.hideControls();
  };


  /**
   * React on user color selection
   * @param  {String} selectedColor
   */
  ShapeBorder.prototype.onColorSelected = function (selectedColor) {
    if (selectedColor) {
      this.currentColor = selectedColor;
    }

    this.updateControls();

    if (this.drawer.fCanvas) {
      var currentShape = this.drawer.fCanvas.getActiveObject();
      if (currentShape) {
        this.applyBorderStyle(currentShape);
      }
      this.drawer.fCanvas.renderAll();
    }
  };


  /**
   * Apply current border style to object
   * @todo @refactor
   * @param  {fabric.Object} fabricObject
   */
  ShapeBorder.prototype.applyBorderStyle = function (fabricObject) {
    if (util.isShape(fabricObject) || fabricObject instanceof fabric.Line) {
      if (this.currentBorder.color) {
        fabricObject.set('stroke', this.currentBorder.color);
      } else {
        fabricObject.set('stroke', this.currentColor);
      }

      fabricObject.set('strokeWidth', this.currentBorder.width);
      if (this.currentBorder.dashArray) {
        fabricObject.set('strokeDashArray', this.currentBorder.dashArray);
      } else {
        fabricObject.set('strokeDashArray', null);
      }
    }
  };


  /**
   * Updates UI to reflect selected border and color.
   * Hides colorpicker if current border is 'None'
   */
  ShapeBorder.prototype.updateControls = function () {
    // update color button
    this.colorpicker.setColor(this.currentColor);

    // hide dropdowns when something is selected
    this.hideStyleDropdown();

    // also hide color button when border None is selected
    if (this.currentBorder.description == 'None') {
      this.colorpicker.hideControls();
    } else {
      this.colorpicker.showControls();
    }

    // set indicator background
    var $indicator = this.$borderTypeButton.find('.border-type-indicator');
    var background = this.currentBorder.preview ? 'url(' + this.currentBorder.preview + ')'
                                                : 'none';
    $indicator.css('background-image',background);

    // set indicator text
    if (this.currentBorder.description) {
      $indicator.text(this.drawer.t(
        this.currentBorder.description
      ));
    } else {
      $indicator.text('');
    }
  };


  ShapeBorder.prototype.showControls = function () {
    this.colorpicker.showControls();
    this.$borderTypeButton.show();
  };

  ShapeBorder.prototype.hideControls = function () {
    this.colorpicker.hideControls();
    this.$borderTypeButton.hide();
  };


  ShapeBorder.prototype.toggleStyleDropdown = function() {
    var needToShow = !this.isDropdownVisible;
    if (needToShow) {
      this.showStyleDropdown();
    } else {
      this.hideStyleDropdown();
    }
  };

  ShapeBorder.prototype.hideStyleDropdown = function() {
    this.$borderTypeButton.$dropdown.addClass('hidden');
    this.isDropdownVisible = false;
    if (this.$clonedDropdown) {
      this.$clonedDropdown.remove();
    }
  };

  ShapeBorder.prototype.showStyleDropdown = function() {
    this.$borderTypeButton.$dropdown.removeClass('hidden');
    this.isDropdownVisible = true;

    var toolbar = this.drawer && this.drawer.toolbars && this.drawer.toolbars.toolOptionsToolbar,
        toolbarOptions = toolbar && toolbar.options,
        notInsidePopup = toolbarOptions && toolbarOptions.position !== 'popup',
        outside = toolbarOptions && toolbarOptions.positionType === 'outside',
        insideScrollable = toolbarOptions && toolbarOptions.compactType === 'scrollable',
        toolbarHaveScrollable = notInsidePopup && outside && insideScrollable;
    if (toolbarHaveScrollable) {
      var $dropdown = this.$borderTypeButton.$dropdown,
          clone;

      $dropdown.removeClass('hidden');
      clone = $dropdown.clone(true);

      this.$borderTypeButton.$dropdown.closest('.toolbar-placeholder').append(clone);
      clone.addClass('border-type-dropdown-cloned');
      this.$clonedDropdown = clone;

      var drawerSizes = util.getScrollOffset(this.drawer.$canvasEditContainer),
          parentSizes = util.getScrollOffset(this.$borderTypeButton),
          canvasRect = this.drawer.$canvasEditContainer.get(0).getBoundingClientRect();

      var buttonSizes = this.$borderTypeButton.get(0).getBoundingClientRect(),
          buttonCenter = buttonSizes.left + buttonSizes.width/2,
          clonedDropdownOffset = (buttonCenter - canvasRect.left - (parentSizes.left - drawerSizes.left)) - this.$clonedDropdown.width() / 2;

      var offsetRightFromCss = 12,
          toRightOffset = buttonSizes.left + buttonSizes.width - canvasRect.left - (parentSizes.left - drawerSizes.left) - this.$clonedDropdown.width() - offsetRightFromCss;
      this.$clonedDropdown.css({
        'left': toRightOffset
      });
      $dropdown.addClass('hidden');
    }
  };

  pluginsNamespace.ShapeBorder = ShapeBorder;

}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseToolOptions, DrawerJs.util));
