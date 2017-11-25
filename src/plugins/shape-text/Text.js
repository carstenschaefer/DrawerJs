(function ($, BaseShape, pluginsNamespace, util) {
  "use strict";

  /**
   * Provides an editable text shape.
   *
   * @param drawerInstance
   *
   * @param {Object} options
   * Configuration object.
   *
   * @param {number} options.editIconSize
   * Sets the 'edit icon' size, in pixels.
   * Default is 32px. More then 64px is not recommended.
   *
   * @param {boolean} options.editIconMode
   * Sets if 'edit icon' mode is on.
   *
   * @param {object.<string, array>} options.predefined
   * List of available values from control dropdown
   *
   * @param {object.<string, array>} options.defaultValues
   * List of default values of styles
   *
   * @memberof DrawerJs.plugins
   *
   * @constructor
   * @augments DrawerJs.plugins.BaseShape
   */
  var Text = function TextConstructor(drawerInstance, options) {
    // call super c-tor
    BaseShape.call(this, drawerInstance);


    this._setupOptions(options);

    this.tooltip = this.drawerInstance.t('Draw a text');
    this.helpTooltipText = this.drawerInstance.t('Click to place a text');

    this.drawerInstance.on(this.drawerInstance.EVENT_OPTIONS_TOOLBAR_CREATED + this.eventNs, this._onOptionsToolbarCreated.bind(this));
  };

  Text.prototype = Object.create(BaseShape.prototype);
  Text.prototype.constructor = Text;


  Text.prototype.name = 'Text';
  /**
   * List of tool options to show when tool is activated.
   * Deviating from BaseShape tool, Line has no 'color', only 'border'.
   * @type {String[]}
   */
  Text.prototype.toolOptionsList = ['color', 'border', 'opacity'];


  // tool event namespace
  Text.prototype.eventNs = '.textTool';

  Text.prototype.name = 'Text';
  Text.prototype.btnClass = 'btn-text';
  Text.prototype.faClass = 'fa-font';
/////////////////////////////////////////////////////////

    /**
     * On tool options toolbar created - create controls and set handlers
     * To proper react on objects selection and
     *
     * @param  {Event} ev
     * @param  {Drawer} toolbar toolbar which was created
     * @private
     */
    Text.prototype._onOptionsToolbarCreated = function (ev, toolbar) {

      // react on text selection change
      this.drawerInstance.on(this.drawerInstance.EVENT_TEXT_SELECTION_CHANGED, this._onTextSelectionChanged.bind(this));
      // react on edit mode entering
      this.drawerInstance.on(this.drawerInstance.EVENT_TEXT_EDITING_ENTERED, this._onTextEditingEntered.bind(this));
      // react on edit mode exiting
      this.drawerInstance.on(this.drawerInstance.EVENT_TEXT_EDITING_EXITED, this._onTextEditingExited.bind(this));
    };

    Text.prototype._deactivateTool = function () {
        if (!this.active) {
          return;
        }

        // call _deactivateTool() of parent
        BaseShape.prototype._deactivateTool.call(this);
    };


    /**
     * Removes tool controls.
     * If  doDeleteToolbarCreationListeners is true - removes listeners on toolbar creation event.
     * So, tool will not appear on toolbar next time, when toolbar is created.
     *
     * @param {boolean} doDeleteToolbarCreationListeners
     */
    Text.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
        // sign off option toolbar creation
        if (doDeleteToolbarCreationListeners) {
            this.drawerInstance.off(this.drawerInstance.EVENT_OPTIONS_TOOLBAR_CREATED + this.eventNs);
        }

        // call parent removeTool()
        BaseShape.prototype.removeTool.call(this, doDeleteToolbarCreationListeners);
    };

  /**
   * React on edit mode entering
   * @param  {fabric.Event} fEvent
   * @param  {fabric.Object} tool - Object of active tool
   * @private
   */
  Text.prototype._onTextEditingEntered = function (fEvent, tool) {
    console.info('EVENT_TEXT_EDITING_ENTERED');
    this._onTextSelectionChanged(fEvent, tool);
  };

  /**
   * React on edit mode exiting
   * @param  {fabric.Event} fEvent
   * @param  {fabric.Object} tool - Object of active tool
   * @private
   */
  Text.prototype._onTextEditingExited = function (fEvent, tool) {
    if (tool && tool.target) {
      tool.target._lastSelection = undefined;
      tool.target._lastStyles = undefined;
    }
  };

  /**
   * React on styles changes of current text object
   * @param  {fabric.Event} ev
   * @param  {fabric.Object} tool - Object of active tool
   * @private
   */
  Text.prototype._onTextSelectionChanged = function (ev, tool) {
    var targetObj = (tool && tool.target) || this.drawerInstance.getActiveObject(); // @todo

    var currentPos = {
          start: targetObj.selectionStart,
          end: targetObj.selectionEnd
        },
        lastPos = targetObj._lastSelection || {},
        emptySelection = currentPos.start === currentPos.end,
        firstChar = currentPos.start === 0,
        sameStartPosition = currentPos.start === lastPos.start && currentPos.start !== undefined,
        sameEndPosition = currentPos.end === lastPos.end && currentPos.end !== undefined,
        samePosition = sameStartPosition && sameEndPosition;

    if (!samePosition) {
      targetObj._lastSelection = currentPos;

      var objectStyles = targetObj.getObjStyles(),
          prevStyles = targetObj._lastStyles || {},
          getPrevCharStyles = (emptySelection && !firstChar),
          prevCharStyles = getPrevCharStyles && targetObj.getSelectionStyles(currentPos.start - 1),
          styles = prevCharStyles || targetObj.getSelectionStyles(),
          stylesAreChanged = targetObj._hasStyleChanged(prevStyles, prevCharStyles || styles),
          stylesWithMultipleValues = [];

      // For not empty selection
      if (!emptySelection) {
        styles = $.extend(true, {}, styles);
        var stylesArrayForEachChar = targetObj.getSelectionStyles(currentPos.start, currentPos.end),
            firstStyleObj = $.extend(true, {}, stylesArrayForEachChar[0]);
        stylesArrayForEachChar.forEach(function(stylesObj, i) {
          for (var styleName in objectStyles) {
            var charsHaveDifferentStyles = stylesObj[styleName] !== firstStyleObj[styleName],
                alreadyMultiple = stylesWithMultipleValues.indexOf(styleName) !== -1;
            if (charsHaveDifferentStyles && !alreadyMultiple) {
              stylesWithMultipleValues.push(styleName);
              styles[styleName] = undefined;
            }
          }
        });
        stylesAreChanged = stylesWithMultipleValues.length || targetObj._hasStyleChanged(prevStyles, styles);
      }
      this.drawerInstance.setTemporaryStyles(styles);

      if (stylesAreChanged) {
        targetObj._lastStyles = styles;

        var drawer = this.drawerInstance;
        drawer.trigger(drawer.EVENT_TEXT_STYLES_CHANGED, [styles, objectStyles, stylesWithMultipleValues]);
      }
    }
  };

  Text.prototype.addShape = function (left, top, text, styles) {
    styles = styles || {};
    left = parseInt(left, 10);
    left = left || left === 0 ? left : 0;
    top = parseInt(top, 10);
    top = top || top === 0 ? top : 0;
    var shape = this.createShape(left, top, text, styles);
    shape.set('left',left);
    shape.set('top',top);
    this.shape = shape;
    // finish drawing
    this.finishItemDraw();

    // some tools are supposed to draw one shape and then deactivate
    if (this.onlyOneItem) {
      this.drawerInstance.trigger(this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL, this);
    }
  };

  Text.prototype.createShape = function (left, top, textString, styles) {
    styles = styles || {};
    textString = textString || 'Text';
    this.startLeft = left;
    this.startTop = top;

    this.text = new fabric.ErasableText(textString, {editIconMode : this.options.editIconMode, editIconSize: this.options.editIconSize});

    var drawer = this.drawerInstance,
        defaultValues = this.options.defaultValues || {},
        collectedStyles = {};

    drawer.trigger(drawer.EVENT_TEXT_GET_STYLES, [this, collectedStyles]);

    collectedStyles = collectedStyles || {};
    collectedStyles.defaultValues = collectedStyles.defaultValues || {}; //@todo


    this.text.set('fontFamily', styles.fontFamily || defaultValues.fontFamily || collectedStyles.defaultValues.fontFamily);
    this.text.set('fontSize', styles.fontSize || defaultValues.fontSize || collectedStyles.defaultValues.fontSize);
    this.text.set('lineHeight', styles.lineHeight || defaultValues.lineHeight || collectedStyles.defaultValues.lineHeight);
    this.text.set('fill', styles.fill || defaultValues.fill || collectedStyles.defaultValues.fill || this.drawerInstance.activeColor);
    this.text.set('opacity', styles.opacity || defaultValues.opacity || collectedStyles.defaultValues.opacity || this.drawerInstance.activeOpacity);

    this.text.set('left', left - this.text.width / 2);
    this.text.set('top', top - this.text.height / 2);

    return this.text;
  };

  Text.prototype.updateShape = function (text, newLeft, newTop) {
  };

  /**
   * Checks if object is instance of fabric.Text
   * @param  {fabric.Object} obj - Instance of Fabric.Object
   * @return {Boolean}
   */
  Text.prototype.isObjectText = function (obj) {
    return obj instanceof fabric.IText;
  };

  pluginsNamespace.Text = Text;

}(jQuery, DrawerJs.plugins.BaseShape, DrawerJs.plugins, DrawerJs.util));
