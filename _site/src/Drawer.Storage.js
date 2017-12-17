(function  (Drawer, util) {

  /**
   * Returns canvas data(information about all objects presented on canvas).
   *
   * The order of sources is following:
   * - fabricjs canvas instance(if available) toJSON method.
   * - options.contentConfig.loadCanvasData(if available)
   * - options.contentCOnfig.canvasDataContainer(if available)
   * - data-canvas-serialized attribute
   *   (if options.contentConfig.saveToHtml=true)
   *
   * @return {Object} serialized canvas data
   */
  Drawer.prototype.getCanvasData = function () {
    var serializedCanvas = null;

    if (this.fCanvas) {
      serializedCanvas = this.fCanvas.toJSON();
    } else if (this.options.contentConfig.loadCanvasData) {
      serializedCanvas = this.options.contentConfig.loadCanvasData(this.id);
    } else if (this.$canvasDataContainer) {
      var canvasDataText = this.$canvasDataContainer.text();
      if (canvasDataText) {
        serializedCanvas = JSON.parse(canvasDataText)[this.id];
      }
    }
    else {
      var attr = this.$imageElement.attr('data-canvas-serialized');
      if (attr) {
        serializedCanvas = JSON.parse(attr);
      }
    }

    return serializedCanvas;
  };


  /**
   * Returns data-url with image encoded to base64
   *
   * Firstly this method will try to get image data from fabric canvas instance.
   * If that is not available (for example when in edit mode)
   * it will check options for loadImageData function. If it is specified,
   * it will be invoked with this.id argument.
   *
   * If options.contentConfig.loadImageData is not set,
   * options.contentConfig.imagesContainer will be checked for data.
   *
   * @returns {String} image data encoded in base64/png.
   */
  Drawer.prototype.getImageData = function () {
    if (this.fCanvas) {
      this.imageData = this.fCanvas.toDataURL();
    } else if (this.options.contentConfig.loadImageData) {
      this.imageData = this.options.contentConfig.loadImageData(this.id);
      if (this.imageData[0] == '"' &&
        this.imageData[this.imageData.length - 1] == '"') {
        this.imageData = this.imageData.substr(1, this.imageData.length - 2);
      }
    } else if (this.$imagesContainer) {
      var imagesDataText = this.$imagesContainer.text();
      if (imagesDataText) {
        var imagesData = JSON.parse(imagesDataText);
        this.imageData = imagesData[this.id];
      }
    }

    return this.imageData;
  };




  /**
   * Loads canvas from serialized data.
   * Triggers EVENT_LOADED_FROM_JSON on complete.
   */
  Drawer.prototype.loadCanvas = function (serializedCanvas) {
    var _this = this;
    if (serializedCanvas) {
      this.fCanvas.loadFromJSON(serializedCanvas, function() {
        // now when we load everything we should adjust object's properties
        // for selection controls based on our config
        var allObjects = _this.fCanvas.getObjects();
        for (var o in allObjects) {
          _this._updateObjectsControls(allObjects[o]);
        }

        // set mode to ACTIVE and trigger event
        _this.mode = _this.MODE_ACTIVE;
        _this.trigger(_this.EVENT_LOADED_FROM_JSON);

        _this.fCanvas.renderAll();
        _this.onCanvasLoaded();
      });
    } else {
      // yes, we have not set all listeners, and better place for this
      // is in the end of startEditing(), but it does not affect anything,
      // so I let it here
      _this.mode = this.MODE_ACTIVE;
      _this.onCanvasLoaded();
    }
  };


  Drawer.prototype.onCanvasLoaded = function () {
    var _this = this;
    // subscribe to events only after deserialization to avoid triggering
    // for all objects while loading
    this.fCanvas.on('object:added', function (fEvent) {
      _this._updateObjectsControls(fEvent.target);
      _this.trigger(_this.EVENT_OBJECT_ADDED, fEvent);
      _this.onCanvasModified();
    });
    this.fCanvas.on('object:moving', function (fEvent) {
      _this.trigger(_this.EVENT_OBJECT_MOVING, fEvent);
    });
    this.fCanvas.on('object:modified', function () {
      _this.onCanvasModified();
    });
    this.fCanvas.on('before:render', function (fEvent) {
      _this.trigger(_this.EVENT_BEFORE_RENDER, fEvent);
    });
    this.fCanvas.on('after:render', function (fEvent) {
      _this.trigger(_this.EVENT_AFTER_RENDER, fEvent);
    });
    this.fCanvas.on('canvas:zoom:lower:set', function (fEvent) {
      _this.trigger(_this.EVENT_ZOOM_SET, fEvent);
    });
    this.fCanvas.on('canvas:zoom:lower:restore', function (fEvent) {
      _this.trigger(_this.EVENT_ZOOM_RESTORE, fEvent);
    });
    this.fCanvas.on('canvas:zoom:upper:set', function (fEvent) {
      _this.trigger(_this.EVENT_ZOOM_UPPER_SET, fEvent);
    });
    this.fCanvas.on('canvas:zoom:upper:restore', function (fEvent) {
      _this.trigger(_this.EVENT_ZOOM_UPPER_RESTORE, fEvent);
    });
    this.fCanvas.on('pencil:move:before', function (fEvent) {
      _this.trigger(_this.EVENT_ZOOM_UPPER_SET, fEvent);
    });
    this.fCanvas.on('pencil:move:after', function (fEvent) {
      _this.trigger(_this.EVENT_ZOOM_UPPER_RESTORE, fEvent);
    });


    this.fCanvas.on('object:removed', function () {
      _this.onCanvasModified();
    });
    this.fCanvas.on('object:selected', function (fEvent) {
      _this.trigger(_this.EVENT_OBJECT_SELECTED, fEvent);
    });
    this.fCanvas.on('selection:cleared', function (fEvent) {
      _this.trigger(_this.EVENT_SELECTION_CLEARED, fEvent);
    });
    this.fCanvas.on('text:selection:changed', function (fEvent) {
      _this.trigger(_this.EVENT_TEXT_SELECTION_CHANGED, fEvent);
    });
    this.fCanvas.on('text:editing:entered', function (fEvent) {
      _this.trigger(_this.EVENT_TEXT_EDITING_ENTERED, fEvent);
    });
    this.fCanvas.on('text:editing:exited', function (fEvent) {
      _this.trigger(_this.EVENT_TEXT_EDITING_EXITED, fEvent);
    });

    // restore brush and color settings
    this.setColor();
    // this.setBrushSize();

    // create all toolbars. Toolbars must be created after fCanvas is initialized.
    this.toolbars.createAllToolbars();

    // give upper-canvas some id to properly handle clicks inside it
    $(this.fCanvas.upperCanvasEl).attr('data-id', 1);

    this.setSize(this.width, this.height);

    this.$canvasEditContainer.on('contextmenu', function (event) {
      // disable context menu in drawer for any other plugins, but trigger an
      // event for all drawer-plugins to handle
      _this.trigger(_this.EVENT_CONTEXTMENU, [event]);
      return false;
    });

    util.bindLongPress(this.$canvasEditContainer, 'canvasEdit',
        function (event) {
          _this.trigger(_this.EVENT_CONTEXTMENU, [event]);
        });

    this.trigger(this.EVENT_EDIT_START);

    this.$canvasEditContainer.on('keydown', '.canvas-container', function (event) {
      _this.trigger(_this.EVENT_KEYDOWN, event);

      var isDelKey = event.which == 8,
          isBackspaceKey = event.which == 46,
          removeKeyTriggered = isDelKey || isBackspaceKey,
          needToDeleteActiveObj = removeKeyTriggered;

      if (needToDeleteActiveObj) {
        _this.fCanvas.renderOnAddRemove = false;
        var activeObject = _this.fCanvas.getActiveObject();
        if (activeObject) {
          activeObject.remove();

          event.preventDefault();
          event.stopPropagation();
        }

        var activeGroup = _this.fCanvas.getActiveGroup();
        if (activeGroup) {
          activeGroup.getObjects().map(function (canvasObject) {
            canvasObject.remove();
          });

          _this.fCanvas.discardActiveGroup();

          event.preventDefault();
          event.stopPropagation();
        }

        _this.fCanvas.renderAll();
        _this.fCanvas.renderOnAddRemove = true;

        return false;
      }
    });

    this.trigger(this.EVENT_CANVAS_READY);
  };

  Drawer.prototype.getSerializedCanvas = function () {
    var serializedCanvas = this.fCanvas.toJSON();
    var serializedCanvasStr = JSON.stringify(serializedCanvas, null, 2);
    return serializedCanvasStr;
  };


  Drawer.prototype.beforeSync = function () {
    // we do not want redactor to see image's data in its tag since it could be
    // huge.
    if (this.options.contentConfig && !this.options.contentConfig.saveInHtml) {
      this.$imageElement.attr('src', '');
    }

    if (this.fCanvas) {
      this.beforeSyncActiveObject = this.fCanvas.getActiveObject();
      this.beforeSyncActiveGroup = this.fCanvas.getActiveGroup();
      this.fCanvas.deactivateAll();
    }
  };

  Drawer.prototype.afterSync = function () {
    if (this.beforeSyncActiveObject) {
      this.fCanvas.setActiveObject(this.beforeSyncActiveObject);
      delete this.beforeSyncActiveObject;
    }

    if (this.beforeSyncActiveGroup) {
      this.fCanvas.setActiveGroup(this.beforeSyncActiveGroup);
      delete this.beforeSyncActiveGroup;
    }

    if (this.options.contentConfig && !this.options.contentConfig.saveInHtml) {
      this.$imageElement.attr('src', this.getImageData());
    }
  };

  /**
   * Synchronizes canvas data with storages specified in options.contentConfig.
   *
   * @param deleteItself
   */
  Drawer.prototype.syncCanvasData = function (deleteItself) {
    var _this = this;

    if (!_this.fCanvas) {
      return;
    }

    var serializedCanvasStr = this.getSerializedCanvas();

    if (_this.$canvasDataContainer) {
      var existingDataText = _this.$canvasDataContainer.text();
      var existingData = {};
      if (existingDataText.length > 0) {
        existingData = JSON.parse(existingDataText);
      }

      if (!deleteItself) {
        if (_this.fCanvas) {
          existingData[_this.id] = serializedCanvasStr;
        }
      } else {
        delete existingData[_this.id];
      }

      _this.$canvasDataContainer.text(JSON.stringify(existingData, null, 2));

      _this.log('sync', 'sync with data container done.');
    }

    if (this.options.contentConfig.saveCanvasData) {
      this.options.contentConfig.saveCanvasData(this.id, serializedCanvasStr);
    }

    if (this.options.contentConfig.saveInHtml) {
      this.$imageElement.attr('data-canvas-serialized', serializedCanvasStr);
    }
  };


  /**
   * Synchronizes image data(base64/png) string with storages defined in
   * options.contentConfig.
   *
   * @param deleteItself
   */
  Drawer.prototype.syncImageData = function (deleteItself) {
    var _this = this;

    var imageData = _this.getImageData();

    if (_this.$imagesContainer) {

      var existingDataText = _this.$imagesContainer.text();
      var existingData = {};
      if (existingDataText.length > 0) {
        existingData = JSON.parse(existingDataText);
      }

      if (!deleteItself) {
        existingData[_this.id] = imageData;
      } else {
        delete existingData[_this.id];
      }

      _this.$imagesContainer.text(JSON.stringify(existingData, null, 2));

      _this.log('sync', 'sync with images container done.');
    }

    if (_this.options.contentConfig.saveImageData) {
      _this.options.contentConfig.saveImageData(this.id, imageData);
    }
  };


})(DrawerJs.Drawer, DrawerJs.util);