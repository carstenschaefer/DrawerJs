# Fabric.js extensions folder

This folder contains fabric.js extension classes for shapes that supports 
erasing.

All that shapes inherit from custom class called SegmentablePolygon.

The aim of SegmentablePolygon is to provide polygonal shape that could be 
modified at any time and that supports multiple polygon segments. 

Segments are sub-polygons that define a polygon inner holes. 
Such holes could appear when user clicks with eraser inside a shape. 