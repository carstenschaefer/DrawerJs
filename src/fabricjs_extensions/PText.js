    (function (global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;

    /**
     * @class
     * @extends fabric.IText
     */
    fabric.PText = fabric.util.createClass(fabric.IText, {
        type: 'PText',

        _defaultOptions : {
            editIconMode    : true,
        },

        /**
         * List of options to show when object is selected
         * @type {Array}
         */
        objectOptionsList : [
          'color',
          'border',
          'opacity',

          'TextLineHeight',
          'TextAlign'
        ],

        /**
         * Initializes object.
         * @param  {String} text
         * @param  {Object} options
         * @param  {boolean} options.editIconMode edit icon size, in pixels
         * @param  {number|String} options.editIconSize edit icon size, in pixels or strings:  small, medium, large
         */
        initialize: function (text, options) {
            this.callSuper('initialize', text, options);

            this.options =  $.extend(true, this._defaultOptions || {}, options || {});

            // create icon
            var iconPath = DrawerJs.util.getDrawerFolderUrl() + 'assets/pencil-square-o.32.png';

            // initialize control
          if (this.options.editIconMode) {
            this.startEditControl = new ObjectFloatingControl(this, iconPath, this._iconClickHandler.bind(this), this.options);
          }
        },
      /**
       * Copied from fabric js - add support of useCopiedStyles
       * Handles onInput event
       * @param {Event} e Event object
       */
      onInput: function(e) {
        if (!this.isEditing || this.inCompositionMode) {
          return;
        }
        var offset = this.selectionStart || 0,
            offsetEnd = this.selectionEnd || 0,
            textLength = this.text.length,
            newTextLength = this.hiddenTextarea.value.length,
            diff, charsToInsert, start;
        if (newTextLength > textLength) {
          //we added some character
          start = this._selectionDirection === 'left' ? offsetEnd : offset;
          diff = newTextLength - textLength;
          charsToInsert = this.hiddenTextarea.value.slice(start, start + diff);
        }
        else {
          //we selected a portion of text and then input something else.
          //Internet explorer does not trigger this else
          diff = newTextLength - textLength + offsetEnd - offset;
          charsToInsert = this.hiddenTextarea.value.slice(offset, offset + diff);
        }
        var emptySelection = this.selectionStart === this.selectionEnd,
            useCopiedStyles = emptySelection && this.canvas.copiedTextStyle;
        this.insertChars(charsToInsert, useCopiedStyles);
        e.stopPropagation();
      },

      renderCursorOrSelection: function (ctx) {
        this.canvas.fire('canvas:zoom:upper:set');
        this.callSuper('renderCursorOrSelection', ctx);
        this.canvas.fire('canvas:zoom:upper:restore');

      },


        /**
         * Overriding IText mouseup handler.
         * This version do not trigger editing mode on second click.
         * This functionality is inside _iconClickHandler
         */
        initMouseupHandler: function() {
            this.on('mouseup', function(evt) {
                if (this.options.editIconMode) {
                    this.onMouseUpHandler(evt);
                } else {
                    this.onMouseUpSuperHandler(evt);
                }
            });
        },


        onMouseUpHandler : function (evt) {
            this.__isMousedown = false;
            if (!this.editable || (this._isObjectMoved && this._isObjectMoved(evt.e))) {
              return;
            }

            this.selected = true;
        },

        /**
         *
         * @see fabric.js Text.onMouseUpSuperHandler
         * @param  {fabric.Event} evt
         */
        onMouseUpSuperHandler : function(evt) {
            this.__isMousedown = false;
            if (!this.editable || (this._isObjectMoved && this._isObjectMoved(evt.e))) {
                return;
            }

            if (this.__lastSelected && !this.__corner) {
                this.enterEditing(evt.e);
                if (this.selectionStart === this.selectionEnd) {
                    this.initDelayedCursor(true);
                }
                else {
                    this.renderCursorOrSelection();
                }
            }

            this.selected = true;
        },


        /**
         * Checks, if click on canvas is inside icon rect.
         * If yes - launches editing mode
         *
         * @param  {fabric.Event} evt
         */
        _iconClickHandler : function(evt) {
            //  select current object again, it is required for proper UI work
            this.canvas.setActiveObject(this);

            // enter editing and do stuff. Code is copied from IText.initMouseupHandler
            this.enterEditing(evt.e);
            if (this.selectionStart === this.selectionEnd) {
                this.initDelayedCursor(true);
            }
            else {
                this.renderCursorOrSelection();
            }
        },
      /**
       * Collect all styles which affects text
       *
       * @param  {fabric.Object} [obj] - text object
       * @returns {object} - styles object
       */
        getObjStyles: function (obj) {
          obj = obj || this;
          var styles = {
            fontSize: obj.fontSize,
            fill: obj.fill,
            textBackgroundColor: obj.textBackgroundColor,
            textDecoration: obj.textDecoration,
            fontFamily: obj.fontFamily,
            fontWeight: obj.fontWeight,
            fontStyle: obj.fontStyle,
            lineHeight: obj.lineHeight,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth
          };
          return styles;
        },


        /**
         * Draws text and edit icon
         * @param  {Context2D} ctx
         */
        render : function (ctx) {
          this.callSuper('render', ctx);
        },


        toObject: function (propertiesToInclude) {
            return extend(this.callSuper('toObject', propertiesToInclude));
        }

    });


    /**
     * Creates fabric object from data.
     * Is sync, so simply returns new object.
     *
     * @param objData
     * @param {function} callback
     */
    fabric.PText.fromObject = function (objData) {
        return new fabric.PText(objData.text, objData);
    };

})(typeof exports !== 'undefined' ? exports : this);
