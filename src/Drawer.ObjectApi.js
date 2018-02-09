(function(DrawerApi) {
    /**
     * Checks if obj is set and is fabric.Object
     *
     * @param  {} obj [description]
     * @throw {Error}  if obj is falsie or object is not fabric.Object
     */
    DrawerApi.prototype._checkObject = function(obj) {
        if (!obj) {
            throw new Error('[Drawer API]  no object provided!');
        }
        if (!(obj instanceof fabric.Object)) {
            throw new Error("[Drawer API]  object type is not 'fabric.Object!'");
        }
    };


    /**
     * Returns currently active object.
     * @return {fabric.Object}   currently active object
     */
    DrawerApi.prototype.getSelectedObject = function() {
        return this.drawer.fCanvas.getActiveObject();
    };


    /**
     * Bring object closer to front in objects stack.
     *
     * @param  {fabric.Object} fabricItem   object to reposition
     * @return {fabric.Object} returns   same object
     */
    DrawerApi.prototype.bringObjectForward = function(fabricItem) {
        this._checkObject(fabricItem);

        this.drawer.fCanvas.bringForward(fabricItem, true);
        this.drawer.syncCanvasData();
        return fabricItem;
    };


    /**
     * Bring object closer to bottom in objects stack.
     *
     * @param  {fabric.Object} fabricItem   object to reposition
     * @return {fabric.Object} returns   same object
     */
    DrawerApi.prototype.sendObjectBackwards = function(fabricItem) {
        this._checkObject(fabricItem);
        this.drawer.fCanvas.sendBackwards(fabricItem, true);
        this.drawer.syncCanvasData();
        return fabricItem;
    };


    /**
     * Move object the top object in stack.
     *
     * @param  {fabric.Object} fabricItem   object to reposition
     * @return {fabric.Object}   returns same object
     */
    DrawerApi.prototype.bringObjectToFront = function(fabricItem) {
        this._checkObject(fabricItem);

        this.drawer.fCanvas.bringToFront(fabricItem, true);
        this.drawer.syncCanvasData();
        return fabricItem;
    };


    /**
     * Move object the bottom object in stack.
     *
     * @param  {fabric.Object} fabricItem   object to reposition
     * @return {fabric.Object}   returns same object
     */
    DrawerApi.prototype.sendObjectToBack = function(fabricItem) {
        this._checkObject(fabricItem);

        this.drawer.fCanvas.sendToBack(fabricItem);
        this.drawer.syncCanvasData();
        return fabricItem;
    };

    /**
     * Remove object from canvas.
     *
     * @param  {fabric.Object} fabricItem  object to reposition
     */
    DrawerApi.prototype.removeObject = function(fabricItem) {
        this._checkObject(fabricItem);

        fabricItem.remove();
        this.drawer.fCanvas.renderAll();
    };


  /**
   * Duplicate given object.
   * If object is not 'async' - it will be returned.
   * If 'callback' is provided - it will be called after cloning,
   *  with cloned object as argument
   *
   * @param  {fabric.Object}  fabricItem  object to be cloned
   * @param  {Function}       callback    will be called after cloning with cloned object as argument
   * @return {fabric.Object}              cloned object, if objject is not 'async'
   */
    DrawerApi.prototype.duplicateObject = function(fabricItem, callback) {
        this._checkObject(fabricItem);

        var _this = this;
        var onCloned = function (clonedObj) {
            if (!clonedObj) {
                throw new Error("[Drawer API] duplicateObject() : Clone failed! Clone source: " + fabricItem.toString());
            }

            clonedObj.set('left', fabricItem.get('left') + 20);
            clonedObj.set('top', fabricItem.get('top') + 20);
            _this.drawer.fCanvas.add(clonedObj);
            _this.drawer.fCanvas.renderAll();

            // call callback with new object
            if (callback) {
                callback(clonedObj);
            }
            return clonedObj;
        };

        // sync and async objects cloning is different
        if(fabricItem.async) {
            // call clone with callback
            fabricItem.clone(onCloned);
        } else {
            // direct call function
            return onCloned(fabricItem.clone());
        }
    };

})(DrawerJs.DrawerApi);
