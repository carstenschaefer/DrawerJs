(function ($, pluginsNamespace, BaseToolOptions, util) {
  'use strict';

  /**
   * Base class for text options plugins.
   *
   * @param drawer
   * @constructor
   * @memberof DrawerJs.plugins
   * @augments DrawerJs.plugins.BaseToolOptions
   */
  var BaseTextOptionTool = function (drawer) {
    BaseToolOptions.call(this, drawer);
    this.drawer = drawer;

    this._setEventHandlers();
    this._setGlobalClickHandler();
  };

  BaseTextOptionTool.prototype = Object.create(BaseToolOptions.prototype);
  BaseTextOptionTool.prototype.constructor = BaseToolOptions;

  /**
   * Button icon class - font Awesome
   * @constant
   * @type {string}
   */
  BaseTextOptionTool.prototype.buttonIconClass = '';
  BaseTextOptionTool.prototype.showOnEditMode = true;
  BaseTextOptionTool.prototype.hideOnEditMode = false;

  BaseTextOptionTool.prototype.focusTextOnChange = false;

  BaseTextOptionTool.prototype.onlyPredefined = false;
  BaseTextOptionTool.prototype.stylesToObject = false;

  BaseTextOptionTool.prototype.useCombobox = true;
  BaseTextOptionTool.prototype.buttonMode = true;

  BaseTextOptionTool.prototype.predefined = {};
  BaseTextOptionTool.prototype.valueType = {};

  BaseTextOptionTool.prototype.minValue = undefined;
  BaseTextOptionTool.prototype.maxValue = undefined;

  /**
   * Setup events
   * @private
   */
  BaseTextOptionTool.prototype._setEventHandlers =function () {
    // react on styles changes of current text object
    this.drawer.on(this.drawer.EVENT_TEXT_STYLES_CHANGED, this._onStylesChanged.bind(this));

    // get styles handler
    this.drawer.on(this.drawer.EVENT_TEXT_GET_STYLES, this._onGetStyles.bind(this));

    if (this._onObjectAdded) {
      this.drawer.on(this.drawer.EVENT_OBJECT_ADDED, this._onObjectAdded.bind(this));
    }
  };

  /**
   * Apply selected border style to added object.
   *
   * @param {fabric.Event} fEvent
   * @param {Object} styles
   * @param {Object} [objectStyles]
   * @param {Array} [stylesWithMultipleValues]
   * @private
   */
  BaseTextOptionTool.prototype._onStylesChanged = function (fEvent, styles, objectStyles, stylesWithMultipleValues) {
    this.updateControls(styles, objectStyles, stylesWithMultipleValues);
  };


  /**
   * Get styles of current control
   *
   * @param {fabric.Event} [fEvent]
   * @param {fabric.Object} [tool]
   * @param {Object} result
   * @private
   */
  BaseTextOptionTool.prototype._onGetStyles = function (fEvent, tool, result) {
    result = result || {};

    //@todo get active style

    result.defaultValues = $.extend(true, {}, result.defaultValues || {}, this.options.defaultValues || {});
  };

  /**
   * Fill controls with data
   * @param {Object} [styles]
   * @param {Object} [objectStyles]
   * @param {Array} [stylesWithMultipleValues]
   */
  BaseTextOptionTool.prototype.updateControls = function (styles, objectStyles, stylesWithMultipleValues) {
    styles = styles || this._lastData || {};
    objectStyles = objectStyles || {};
    stylesWithMultipleValues = stylesWithMultipleValues || [];

    var _self = this,
        $toolControl = this.$toolControl;
    if ($toolControl) {
      var $allControls = $toolControl.find('.controls-value-item');
      $allControls.each(function (i, currElement) {
        var $currElement = $(currElement),
            isInputType = $currElement.is('input, select, textarea'),
            currValueName = $currElement.data('name'),
            defaultValue = _self._defaultOptions.defaultValues[currValueName],
            inheritedValue = objectStyles[currValueName],
            multipleValues = stylesWithMultipleValues.indexOf(currValueName) !== -1,
            currValueIsInvalid = styles[currValueName] === undefined,
            neededValue = styles[currValueName] !== undefined ? styles[currValueName] : inheritedValue || defaultValue;

        if (multipleValues) {
          neededValue = '';
        }

        if (isInputType) {
          $currElement.val(neededValue);
        }

        _self._updateClasses(currValueIsInvalid, currValueIsInvalid && neededValue === inheritedValue, multipleValues);

        $toolControl.toggleClass('option-value-invalid', !!currValueIsInvalid);
        $toolControl.toggleClass('option-value-multiple', !!multipleValues);
        $toolControl.toggleClass('option-value-inherited', !!(currValueIsInvalid && neededValue === inheritedValue));

        var haveError = currValueIsInvalid || multipleValues,
            inheritedClassString = currValueIsInvalid && neededValue === inheritedValue ? ' option-value-inherited ' : '',
            invalidClassString = currValueIsInvalid ? ' option-value-invalid ' : '',
            multipleClassString = multipleValues ? ' option-value-multiple ' : '',
            classString = '' + inheritedClassString + invalidClassString + multipleClassString ;

        if ($currElement.data('comboBox')) {
          $currElement.data('comboBox').updateSelectedValues(neededValue, classString);
        } else {
          $currElement.trigger('valueChanged', [{
            value: neededValue,
            valueName: currValueName,
            inherited: currValueIsInvalid || neededValue === inheritedValue,
            multipleValues: multipleValues,
            classString: classString
          }]);
        }

        _self.updateSingleControl(currValueName, neededValue);
      });
    }
  };

  /**
   * Update indicator classes
   * @param {Boolean} [valueIsInvalid] - control have invalid value
   * @param {Boolean} [valueIsInherited] - control have value inherited from object
   * @param {Boolean} [valueIsMultiple] - current selection have multiple values for current style
   * @private
   */
  BaseTextOptionTool.prototype._updateClasses = function (valueIsInvalid, valueIsInherited, valueIsMultiple) {
    this.$toolControl.toggleClass('option-value-invalid', !!valueIsInvalid);
    this.$toolControl.toggleClass('option-value-multiple', !!valueIsInherited);
    this.$toolControl.toggleClass('option-value-inherited', !!valueIsMultiple);
  };

  /**
   * React on edit mode entering
   * @param  {String} valueName
   * @param  {*} value
   */
  BaseTextOptionTool.prototype.updateSingleControl = function (valueName, value) {

  };

  /**
   * Apply styles
   * @param {object.<string>} [styles] - Styles object
   */
  BaseTextOptionTool.prototype.setStyles = function (styles) {
    //@TODO refactor - to many render
    styles = styles || this._lastData || this.getStylesFromControls();

    var currText = this.drawer.fCanvas.getActiveObject();
    if (currText) {
      var selectionIsEmpty = currText.selectionEnd === currText.selectionStart;
      if (selectionIsEmpty) {
        this.drawer.setTemporaryStyles(styles);
      } else {
        this.drawer.setTemporaryStyles();
        if (this.stylesToObject) {
          for (var styleName in styles) {
            currText[styleName] = styles[styleName];
          }
        } else {
          currText.setSelectionStyles(styles);
        }
      }
      this._lastData = styles;
      if (this.focusTextOnChange) {
        if (this.comboBox) {
          this.comboBox.hideDropdown();
        }
        if (currText.hiddenTextarea) {
          currText.hiddenTextarea.focus();
        }
      }
      currText.canvas.renderAll();
    }
  };

  /**
   * Validate and normalize value
   * @param {*} value
   * @param {string} valueName
   * @param {boolean} [doNotUseDefault]
   * @return {*} result - normalized value
   */

  BaseTextOptionTool.prototype.normalizeValue = function (value, valueName, doNotUseDefault) {
    var result,
        defaultValue = !doNotUseDefault ? this.options.defaultSize : undefined,
        validValue = this.validateValue(value, valueName),
        overrideWithDefault = !validValue;

    result = overrideWithDefault ? defaultValue : value;

    if (this.minValue && this.minValue[valueName] !== undefined) {
      result = result < this.minValue[valueName] ? this.minValue[valueName] : result;
    }

    if (this.maxValue && this.maxValue[valueName] !== undefined) {
      result = result > this.maxValue[valueName] ? this.maxValue[valueName] : result;
    }
    return result;
  };

  /**
   * Attach events for control element
   * @private
   */
  BaseTextOptionTool.prototype._attachEvents = function () {
    if (this.$toolControl) {
      this.$toolControl.on('input change toolbarOptionChange', this.onInputChange.bind(this));
    }
  };

  /**
   * Create controls
   * @returns {string} result - html of controls
   */
  BaseTextOptionTool.prototype.generateControlHtml = function () {
    var result = '';

    if (this.controlTemplate) {
      if (typeof this.controlTemplate === 'function') {
        result = this.controlTemplate();
      } else {
        result = this.controlTemplate;
      }
    }
    return result;
  };

  /**
   * Create controls.
   * @param  {DrawerToolbar} toolbar to add control to
   * @param  {Function} [changeCallback]
   */
  BaseTextOptionTool.prototype.createControls = function (toolbar, changeCallback) {
    this.changeCallback = changeCallback;

    var toolControlHtml = this.generateControlHtml();
    this.$toolControl = $(toolControlHtml);

    toolbar.addControl(this.$toolControl, this.options.buttonOrder);
    this.setupControl(toolbar, this.$toolControl, changeCallback);
    this._attachEvents();

    return this.$toolControl;
  };

  /**
   * Create controls.
   * @param  {DrawerToolbar} toolbar - to add control to
   * @param  {jQuery} [$toolControl] - tool control element
   * @param  {Function} [changeCallback]
   */
  BaseTextOptionTool.prototype.setupControl = function (toolbar, $toolControl, changeCallback) {
  };


  /**
   * Setup data
   * @param {String} pluginName - name of plugin
   * @returns {Object}
   * @private
   */
  BaseTextOptionTool.prototype._collectDefaultOptions = function (pluginName) {
    var textConfig = this.drawer.getPluginConfig('Text'),
        result = {
          predefined: $.extend(true, {}, textConfig.predefined || {}),
          defaultValues: $.extend(true, {}, textConfig.defaultValues || {})
        };
    return result;
  };

  /**
   * Process options
   * @param {Object} [defaultOptions]
   * @param {Object} [options]
   * @param {Object} [optionsFromDrawer]
   * @param {Object} [result]
   * @returns {Object}
   * @private
   */
  BaseTextOptionTool.prototype._onOptionsSetup = function (defaultOptions, options, optionsFromDrawer, result) {
    options = options || {};
    defaultOptions = defaultOptions || {};
    optionsFromDrawer = optionsFromDrawer || {};

    var valueName,
        defVal,
        drawVal,
        optVal;

    /**
     * Because https://bugs.jquery.com/ticket/9477
     * Bug - extend (deep) merges arrays fields instead of replacing them
     * **/
    for (valueName in result.predefined) {
      defVal = (defaultOptions.predefined && defaultOptions.predefined[valueName]);
      drawVal = (optionsFromDrawer.predefined && optionsFromDrawer.predefined[valueName]);
      optVal = (options.predefined && options.predefined[valueName]);
      result.predefined[valueName] = optVal !== undefined && optVal !== false ? optVal :
          drawVal !== undefined && drawVal !== false ? drawVal :
          defVal !== undefined && defVal !== false ? defVal : [];
    }
    return result;
  };

  /**
   * Handle change of values via controls
   * @param  {Event} e - Event that modifies control's values
   * @private
   * @todo rename as private
   */
  BaseTextOptionTool.prototype.onInputChange = function (e) {
    var valueFromEvent;
    valueFromEvent = this.getStylesFromChangeEvent(e);
    if (!valueFromEvent) {
      this.getStylesFromControls();
    }
    this.setStyles(valueFromEvent);
    this._updateClasses();
  };

  /**
   * Collect data from change event
   * @param  {Event} e - event that modifies control's values
   */
  BaseTextOptionTool.prototype.getStylesFromChangeEvent = function (e) {

  };

  /**
   * Collect data from controls
   * @returns {Object}
   */
  BaseTextOptionTool.prototype.getStylesFromControls = function () {
    var _self = this,
        result = {},
        $toolControl = this.$toolControl;
    if ($toolControl) {
      var $allControls = $toolControl.find('input, select, textarea');
      $allControls.each(function (i, currElement) {
        var $currElement = $(currElement),
            currValueName = $currElement.data('name'),
            currValue = $currElement.val(),
            validatedValue = _self.normalizeValue(currValue, currValueName);

        if (currValueName !== undefined && currValue !== undefined) {
          result[currValueName] = validatedValue;
        }
      });
    }
    this._lastData = result;
    return result;
  };

  /**
   * Validates value
   * @param {*} value
   * @param {string} valueName
   * @param {Boolean} [strictMode]
   * @return {boolean}
   */

  BaseTextOptionTool.prototype.validateValue = function (value, valueName, strictMode) {
    var valueIsValid,
        checkForMatchWithPredefined = this.onlyPredefined && this.predefined && this.predefined[valueName],
        equalToPredefinedValue = checkForMatchWithPredefined && this.predefined[valueName].indexOf(value) !== -1;

    switch (this.valueType[valueName]) {
      case 'number':
        value = parseFloat(value);
        valueIsValid = typeof value === 'number' && isFinite(value);
        break;
      case 'string':
        valueIsValid = typeof value === 'string';
        break;
      case 'color':
        var isString = typeof value === 'string',
            isColorInstance = value instanceof fabric.Color;
        valueIsValid = strictMode ? isColorInstance : isString;
        break;
      default :
        valueIsValid = value !== undefined;
        break;
    }

    valueIsValid = checkForMatchWithPredefined ? (valueIsValid && equalToPredefinedValue) : valueIsValid;
    return valueIsValid;
  };

  /**
   * Hides controls
   */
  BaseTextOptionTool.prototype.hideControls = function () {
    if (this.$toolControl) {
      this.$toolControl.addClass('hidden');
    }
  };


  /**
   * Shows controls
   * @param {Boolean} [withUpdate] - need to update controls
   * @param  {fabric.Object} [tool] - for styles collecting
   */
  BaseTextOptionTool.prototype.showControls = function (withUpdate, tool) {
    if (withUpdate) {
      tool = tool || this.drawer.fCanvas.getActiveObject();
      var currentStyles = tool.getSelectionStyles(),
          objStyles = tool.getObjStyles();
      this.updateControls(currentStyles ,objStyles);
    }
    if (this.$toolControl) {
      this.$toolControl.removeClass('hidden');
    }
  };

  /**
   * Removes tool
   */
  BaseTextOptionTool.prototype.remove = function () {
    if (this.$toolControl) {
      this.$toolControl.remove();
    }
  };

  /** @TODO check
   * Set listeners for clicks - to properly close controls on outside clicks
   * @private
   */
  BaseTextOptionTool.prototype._setGlobalClickHandler = function () {
    var self = this,
        $html = $('html');

    $html.off('click.textOptionTool').on('click.textOptionTool', function (e) {
      self.hideControls();
    });
  };

  pluginsNamespace.BaseTextOptionTool = BaseTextOptionTool;
}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseToolOptions, DrawerJs.util));