(function (global) {
    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;


    /**
     *
     * @param {Object[]} eraserPathsData
     * @constructor
     */
    fabric.ErasableMixin = function(objData) {
        // clear eraserPaths. Do this, because inside fabric.Object.initialize()
        // options properties were merged into 'this', and this.eraserPaths is copy of objData.eraserPaths
        this.eraserPaths = [];
        if (objData) {
            // create eraserPaths from eraserPathsData
            this.eraserPaths = this._createEraserPaths(objData.eraserPaths);
        }
    };


    /**
     * Initialization of object instance.
     * Resets this.eraserPaths, then instantiates array of eraserPaths in it,
     * data taken from objData.eraserPaths
     *
     * @param {Object} objData
     */
    fabric.ErasableMixin.prototype.initialize = function(objData) {
        // add eraserPaths property to object instance
        this.eraserPaths = [];

        // TODO: do we need this??
        if (objData) {
            this.eraserPaths = fabric.ErasableMixin.prototype._createEraserPaths.call(this, objData.eraserPaths);
            // this.eraserPaths = this._createEraserPaths(objData.eraserPaths);
        }
    };


    /**
     * Fills this.eraserPaths with paths, created from objData.eraserPaths
     *
     * @param {Object[]} eraserPathsData
     * @private
     */
    fabric.ErasableMixin.prototype._createEraserPaths = function(eraserPathsData) {
        var eraserPaths = [];
        // fill this.eraserPaths with EraserPath objects, created from objData.eraserPaths
        if (eraserPathsData) {
            eraserPathsData.map(function (p) {
                fabric.EraserPath.fromObject(p, function (createdPath) {
                    eraserPaths.push(createdPath);
                });
            });
        }
        return eraserPaths;
    };


    /**
     *
     * @param ctx
     */
    fabric.ErasableMixin.prototype.render = function ErasableMixinRender (ctx, mainObjectRenderer) {
        // get temp canvas
        var tempCanvas = DrawerJs.util.getTemporaryCanvas(this.canvas);
        var tempContext = tempCanvas.getContext('2d');

        // clear rect with size as working canvas
        var width = this.canvas.width;
        var height = this.canvas.height;
        tempContext.clearRect(0, 0, width, height);

        // render object in tempContext, (Object._render() will be called)
        mainObjectRenderer(tempContext);

        // now render erasers on top of object
        for (var i = 0; i < this.eraserPaths.length; i++) {
            this.eraserPaths[i].globalCompositeOperation = 'destination-out';
            this.eraserPaths[i].render(tempContext);
        }

        // render tempCanvas on working one
        ctx.drawImage(tempCanvas, 0, 0);
    };


    /**
     * Add eraser path to object.
     * Sets neccessary path properties;
     * Sets path angle same as object's,
     * to keep path points in same place - rotates them back individually
     *
     * @param {fabric.Path} path
     * @param {Function} callback
     */
    fabric.ErasableMixin.prototype.addEraserPath = function (srcPath, callback) {
        var self = this;
        // clone path, modify clone and add it
        srcPath.clone(function (clonedPath) {
            // eraser path must be non-interactive
            clonedPath.set('stroke', 'blue');
            clonedPath.selectable = false;
            clonedPath.evented = false;

            var thisCenter = self.getCenterPoint();
            var pathCenter = clonedPath.getCenterPoint();

            // eraser path offset to object
            clonedPath.polygonOffsetX = pathCenter.x - thisCenter.x;
            clonedPath.polygonOffsetY = pathCenter.y - thisCenter.y;

            // set path angle same, as angle of object
            var a = self.angle;
            clonedPath.set({angle : a});

            // to keep path points in same place - rotate them by -a
            for (var i = 0; i < clonedPath.path.length; i++) {
                fabric.ErasableMixin.prototype._rotatePathPoints(clonedPath.path[i], thisCenter, -a);
            }

            // call to make path be in correct position with object
            fabric.ErasableMixin.prototype._updatePathPosition.call(self, clonedPath);

            // now add modified clonedPath to list of eraser paths
            self.eraserPaths.push(clonedPath);

            // call callback
            if (callback) {
                callback(this);
            }
        });
    };


    /**
     * Override default _set().
     * Updates eraser paths' position, angle and scale,
     * to be consistent with changes in object.
     *
     * @param key
     * @param value
     * @private
     */
    fabric.ErasableMixin.prototype._updateEPathsOnSet = function (key, value) {
        if (!this.eraserPaths)
            return;

        var thisCenter = this.getCenterPoint();

        for (var p = 0; p < this.eraserPaths.length; p++) {
            var ePath = this.eraserPaths[p];

            if (!(ePath instanceof fabric.EraserPath)) {
                continue;
            }

            var ePathScaleX = ePath.scaleX, ePathScaleY = ePath.scaleY;
            var coeff;

            // if object's scaleX has changed - update each ePath individual scaleX
            if (key == 'scaleX') {
                coeff = value / this.scaleX;
                ePathScaleX = ePathScaleX * coeff;
                ePath.set('scaleX', ePathScaleX);
            }

            // if object's scaleY has changed - update each ePath individual scaleY
            if (key == 'scaleY') {
                coeff = value / this.scaleY;
                ePathScaleY = ePathScaleY * coeff;
                ePath.set('scaleY', ePathScaleY);
            }

            // eraser's angle is always same as object's
            if (key == 'angle') {
                ePath.set('angle', this.angle);
            }

            fabric.ErasableMixin.prototype._updatePathPosition.call(this, ePath);
        }
    };


    fabric.ErasableMixin.prototype._updatePathPosition = function(ePath) {
        var thisCenter = this.getCenterPoint();
        var ePathScaleX = ePath.scaleX, ePathScaleY = ePath.scaleY;

        // global ePath origin coord = object center coord +  scaled ePath offset
        var globalOffsetPointX = thisCenter.x + (ePath.polygonOffsetX * ePathScaleX);
        var globalOffsetPointY = thisCenter.y + (ePath.polygonOffsetY * ePathScaleY);

        // calc ePath origin offset, respecting rotation
        var rotatedPoint = fabric.util.rotatePoint(
            new fabric.Point(globalOffsetPointX, globalOffsetPointY),
            thisCenter,
            fabric.util.degreesToRadians(ePath.angle)
        );

        ePath.set('left', rotatedPoint.x);
        ePath.set('top', rotatedPoint.y);
    };

   /**
     * Rotate all points in path around 'rotationOrigin' by 'angle'
     * Iterates through 'data', and makes changes in-place
     *
     * @param  array data  array with path commands and coords, and coords WILL BE CHANGED
     * @param  fabric.Point rotationOrigin
     * @param  number angle angle in degrees
     *
     * @return array
     */
    fabric.ErasableMixin.prototype._rotatePathPoints = function(data, rotationOrigin, angle) {
        var point, rotatedPoint;
        var angleRad = fabric.util.degreesToRadians(angle);
        var l = data.length;
        for (var i = 0; i < l; i++) {
            // skip non-numeric
            if (typeof data[i] != 'number')
                continue;

            // if data[i] is number, then it and next number are coords of point in path:
            // data[i] -> x, data[i + 1] -> y
            point = new fabric.Point(data[i], data[i + 1]);

            // rotate point around rotationOrigin
            rotatedPoint = fabric.util.rotatePoint(point, rotationOrigin, angleRad);

            // write rotatedPoint coords back in data[]
            data[i] = rotatedPoint.x;
            data[i + 1] = rotatedPoint.y;

            // jump to next pair
            i++;
        }

        return data;
    };


    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    fabric.ErasableMixin.prototype.toObject = function () {
        var o =  { eraserPaths : this.eraserPaths.map(function (p) {
            return p.toObject();
        })
        };
        return o;
    };


    /**
     * Returns fabric.ErasableObject instance from an object representation
     *
     * @static
     * @memberOf fabric.Polygon
     * @param {Object} objectData Object to create an instance from
     * @return {fabric.ErasableObject} Instance of fabric.ErasableObject
     */
    fabric.ErasableMixin.prototype.fromObject = function (objectData) {
        this.eraserPaths = fabric.ErasableMixin.prototype._createEraserPaths(objectData.eraserPaths);
        return this;
    };


    /**
     * @param {fabric.Object} obj
     */
    fabric.makeObjectErasable = function(obj) {
        var mixin = new fabric.ErasableMixin();

        // will be used in Eraser to determine, which objects are erasable
        obj.prototype.isErasable = true;

        var objInitialize = obj.prototype.initialize;
        obj.prototype.initialize = function() {
            // first call object initialize() with arguments
            objInitialize.apply(this, arguments);
            // then call mixin initialize()
            mixin.initialize.apply(this, arguments);
        };

        obj.prototype.addEraserPath = function(path) {
            mixin.addEraserPath.call(this, path);
        };

        var oldRender = obj.prototype.render;
        obj.prototype.render = function(ctx) {
            mixin.render.call(this, ctx, oldRender.bind(this));   // then render eraser paths
        };

        var oldSet = obj.prototype._set;
        obj.prototype._set = function(key, value) {
            mixin._updateEPathsOnSet.call(this, key, value);   // first update eraserPaths
            oldSet.call(this, key, value);  // then call original _set() of object
        };


        // fromObject - special case. It is part of obj, not its prototype
        var oldFromObject = obj.fromObject;
          obj.fromObject = function(objData, callback) {
            if (this.async) {
                // first call fromObject() of object
                oldFromObject.call(this, objData,
                    function(createdObject){
                        // then call ErasableMixin.fromObject to instantiate eraserPath
                        var objWithErasers = mixin.fromObject.call(createdObject, objData);
                        if(callback) {
                          callback(objWithErasers);
                        }
                    });
            } else {
                // first call fromObject() of object
                var createdObject = oldFromObject.call(this, objData);
                // then call ErasableMixin.fromObject to instantiate eraserPath
                var objWithErasers = mixin.fromObject.call(createdObject, objData);

                return objWithErasers;
            }
        };


        var oldToObject = obj.prototype.toObject;
        obj.prototype.toObject = function() {
            // first call oldToObject () of object
            var objData = oldToObject.call(this);
            // then extend result with
            extend(objData, mixin.toObject.call(this));

            return objData;
        };
    };


})(typeof exports !== 'undefined' ? exports : this);