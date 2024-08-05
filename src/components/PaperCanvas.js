// src/components/PaperCanvas.js
import React, { useEffect, useRef } from "react";
import paper from "paper";

const PaperCanvas = ({
  elements,
  setElements,
  selectedId,
  setSelectedId,
  canvasRef,
}) => {
  const canvasElementRef = useRef(null);

  useEffect(() => {
    paper.setup(canvasElementRef.current);
    const project = paper.project;
    canvasRef.current = project;

    // Add elements to the canvas
    elements.forEach((el) => {
      if (el.type === "text") {
        const text = new paper.PointText({
          point: [el.x, el.y],
          content: el.text,
          fontSize: el.fontSize,
        });
        text.data = { id: el.id };
        project.activeLayer.addChild(text);
      } else if (el.type === "image") {
        const raster = new paper.Raster({
          source: el.src,
          position: [el.x, el.y],
        });
        raster.onLoad = function () {
          raster.scale(el.width / raster.width, el.height / raster.height);
          raster.data = { id: el.id };
          project.activeLayer.addChild(raster);
        };
      }
    });

    project.view.onMouseDown = (event) => {
      const hitResult = project.hitTest(event.point);
      if (hitResult && hitResult.item) {
        setSelectedId(hitResult.item.data.id);
      }
    };

    project.view.onMouseDrag = (event) => {
      const hitResult = project.hitTest(event.point);
      if (
        hitResult &&
        hitResult.item &&
        hitResult.item.data.id === selectedId
      ) {
        hitResult.item.position = hitResult.item.position.add(event.delta);
        const newElements = elements.map((el) => {
          if (el.id === hitResult.item.data.id) {
            return {
              ...el,
              x: hitResult.item.position.x,
              y: hitResult.item.position.y,
            };
          }
          return el;
        });
        setElements(newElements);
      }
    };

    return () => {
      project.clear();
    };
  }, [elements, setElements, selectedId, setSelectedId, canvasRef]);

  return <canvas ref={canvasElementRef} width={600} height={600} />;
};

export default PaperCanvas;
