# Eraser

Usually vector drawing tools don't have an eraser.

DrawerJS has.

Few approaches were made to make eraser tool work as it should and as user expects it to work.

First approach took ~2 weeks to implement and didn't show good results. Approach was based on geometry calculations library and was doing a lot of calculations.

Logic was: when left mouse key is pressed and user moves mouse through shape, get shape's polygon coordinates along with mouse polygon (simple small square) and pass them to polygon substraction function. [More info](http://mathoverflow.net/questions/111296/subtract-rectangle-from-polygon)

It was very slow even on desctop processors and was abandoned.

New algorhytm was invented:

## Clipping mask based eraser

This technique is based on a simple drawing method included in fabric.js.

The idea is simple: eraser is a simple brush with white color. It draws the same way a `pencil` tool draws.

But when user finishes erasing we copy resulting eraser paths and add them to all shapes that were affected.

So, any shape in DrawerJS has an array of eraser paths. Actually we have [ErasableObject](https://g-tac.visualstudio.com/_git/DrawerJs?path=%2Fsrc%2Ffabricjs_extensions%2FErasableObject.js&version=GBmaster&_a=contents&line=8&lineStyle=plain&lineEnd=8&lineStartColumn=12&lineEndColumn=26) 
and [ErasableMixin](https://g-tac.visualstudio.com/_git/DrawerJs?path=%2Fsrc%2Ffabricjs_extensions%2FErasableMixin.js&version=GBmaster&_a=contents&line=13&lineStyle=plain&lineEnd=13&lineStartColumn=12&lineEndColumn=25).

When a shape gets rendered, it also renders all eraser paths attached to it and uses [globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) 
to change the way eraser paths will be rendered.