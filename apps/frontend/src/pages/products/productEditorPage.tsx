import {
  Stage,
  Layer,
  Rect,
  Line,
  Circle,
  RegularPolygon,
  Transformer,
  Text,
} from 'react-konva';
import { useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Undo,
  Redo,
  Eraser,
  Save,
  Grid3X3,
  Brush,
  Square,
  Circle as CircleIcon,
  Triangle,
  MousePointer2,
  Trash2,
  PaintBucket,
  Type as TypeIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dataUrlToFile } from '../../utils/dataUrlToFile';
import { uploadProductImage } from '../../services/uploads.service';
import { designsService } from '../../services/designs.service';

const GRID_WIDTH = 24;
const GRID_HEIGHT = 20;
const CELL_SIZE = 20;

type Tool =
  | 'select'
  | 'paint'
  | 'brush'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'text';

type Stroke = {
  id: string;
  points: number[];
  color: string;
  strokeWidth: number;
};
type ShapeBase = {
  id: string;
  rotation?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  draggable?: boolean;
};
type RectShape = ShapeBase & {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
};
type CircleShape = ShapeBase & {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
};
type TriangleShape = ShapeBase & {
  type: 'triangle';
  x: number;
  y: number;
  radius: number;
};
type TextShape = ShapeBase & {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
};
type AnyShape = RectShape | CircleShape | TriangleShape | TextShape;

type SceneSnapshot = {
  grid: string[][];
  strokes: Stroke[];
  shapes: AnyShape[];
};

export default function ProductEditorPage() {
  const { t } = useTranslation();

  const [message, setMessage] = useState<string>('');
  const [tool, setTool] = useState<Tool>('paint');

  // Couleurs
  const [activeColor, setActiveColor] = useState('#FF8C42');
  const [strokeColor, setStrokeColor] = useState('#222');
  const [fillColor, setFillColor] = useState('#ffffff');

  // Tailles
  const [brushWidth, setBrushWidth] = useState(4);
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2);

  const [showGrid, setShowGrid] = useState(true);

  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill('#ffffff'))
  );
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [shapes, setShapes] = useState<AnyShape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Édition inline du texte
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [editorPos, setEditorPos] = useState<{
    left: number;
    top: number;
    width: number;
    fontSize: number;
    color: string;
  }>({
    left: 0,
    top: 0,
    width: 120,
    fontSize: 18,
    color: '#000',
  });

  const initialSnap: SceneSnapshot = { grid, strokes: [], shapes: [] };
  const [history, setHistory] = useState<string[]>([
    JSON.stringify(initialSnap),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const selectedNodeRef = useRef<any>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);

  const snapshot = (): SceneSnapshot => ({ grid, strokes, shapes });
  const pushHistory = (snap: SceneSnapshot) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(snap));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    if (selectedNodeRef.current) tr.nodes([selectedNodeRef.current]);
    else tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, shapes]);

  const handleGridPaint = (row: number, col: number) => {
    if (!showGrid || tool !== 'paint') return;
    const newGrid = grid.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? activeColor : c))
    );
    setGrid(newGrid);
    pushHistory({ ...snapshot(), grid: newGrid });
  };

  const handleUndo = () => {
    if (historyIndex === 0) return;
    const newIndex = historyIndex - 1;
    const parsed: SceneSnapshot = JSON.parse(history[newIndex]);
    setGrid(parsed.grid);
    setStrokes(parsed.strokes);
    setShapes(parsed.shapes);
    setHistoryIndex(newIndex);
    setSelectedId(null);
  };
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const parsed: SceneSnapshot = JSON.parse(history[newIndex]);
    setGrid(parsed.grid);
    setStrokes(parsed.strokes);
    setShapes(parsed.shapes);
    setHistoryIndex(newIndex);
    setSelectedId(null);
  };
  const handleClear = () => {
    const cleared = Array.from({ length: GRID_HEIGHT }, () =>
      Array(GRID_WIDTH).fill('#ffffff')
    );
    setGrid(cleared);
    setStrokes([]);
    setShapes([]);
    setSelectedId(null);
    pushHistory({ grid: cleared, strokes: [], shapes: [] });
  };

  const handleSave = async () => {
    const stage = stageRef.current;
    if (!stage) return;

    // masquer le Transformer
    const tr = trRef.current as any | null;
    const backup = tr ? tr.nodes() : null;
    if (tr) tr.nodes([]);
    await new Promise((r) => requestAnimationFrame(r));
    stage.draw();

    // 1) export en PNG
    const dataURL = stage.toDataURL({
      pixelRatio: 2,
      mimeType: 'image/png',
      quality: 1,
    });

    // 2) convertir en File
    const file = dataUrlToFile(dataURL, `design-${uuidv4()}.png`);

    try {
      // 3) upload Supabase via ton endpoint
      const { path } = await uploadProductImage(file); // ex: "public/<random>.png"

      // 4) créer l'enregistrement "design"
      await designsService.create({
        message: message?.trim() || null,
        imagePath: path, // on stocke le chemin, pas l’URL signée
        scene: snapshot(), // facultatif si trop gros
      });

      alert(t('design.savedAlert'));
    } catch (e) {
      console.error(e);
      alert('Erreur: impossible d’enregistrer le design');
    } finally {
      if (tr && backup) {
        tr.nodes(backup);
        tr.getLayer()?.batchDraw();
      }
    }
  };
  const getPointerPos = () =>
    stageRef.current?.getPointerPosition() as
      | { x: number; y: number }
      | undefined;

  // === Souris : down / move / up ===
  const onMouseDown = () => {
    const pos = getPointerPos();
    if (!pos) return;

    // Texte : un clic ajoute UNE entrée puis repasse en select
    if (tool === 'text') {
      const id = uuidv4();
      const txt: TextShape = {
        id,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Texte',
        fontSize: 18,
        fill: activeColor,
        rotation: 0,
        draggable: true,
      };
      const newShapes = [...shapes, txt];
      setShapes(newShapes);
      setSelectedId(id);
      pushHistory({ ...snapshot(), shapes: newShapes });
      setTool('select');
      return;
    }

    if (tool === 'brush') {
      const id = uuidv4();
      setStrokes((prev) => [
        ...prev,
        {
          id,
          points: [pos.x, pos.y],
          color: activeColor,
          strokeWidth: brushWidth,
        },
      ]);
      setIsDrawing(true);
      return;
    }

    if (tool === 'rect') {
      const id = uuidv4();
      setShapes((p) => [
        ...p,
        {
          id,
          type: 'rect',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          stroke: strokeColor,
          strokeWidth: shapeStrokeWidth,
          fill: fillColor,
          rotation: 0,
          draggable: true,
        } as RectShape,
      ]);
      setSelectedId(id);
      setIsDrawing(true);
      return;
    }
    if (tool === 'circle') {
      const id = uuidv4();
      setShapes((p) => [
        ...p,
        {
          id,
          type: 'circle',
          x: pos.x,
          y: pos.y,
          radius: 0,
          stroke: strokeColor,
          strokeWidth: shapeStrokeWidth,
          fill: fillColor,
          rotation: 0,
          draggable: true,
        } as CircleShape,
      ]);
      setSelectedId(id);
      setIsDrawing(true);
      return;
    }
    if (tool === 'triangle') {
      const id = uuidv4();
      setShapes((p) => [
        ...p,
        {
          id,
          type: 'triangle',
          x: pos.x,
          y: pos.y,
          radius: 0,
          stroke: strokeColor,
          strokeWidth: shapeStrokeWidth,
          fill: fillColor,
          rotation: 0,
          draggable: true,
        } as TriangleShape,
      ]);
      setSelectedId(id);
      setIsDrawing(true);
      return;
    }
  };

  const onMouseMove = () => {
    if (!isDrawing) return;
    const pos = getPointerPos();
    if (!pos) return;

    if (tool === 'brush') {
      setStrokes((prev) => {
        const last = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          { ...last, points: [...last.points, pos.x, pos.y] },
        ];
      });
      return;
    }
    if (tool === 'rect') {
      setShapes((prev) => {
        const i = prev.findIndex((s) => s.id === selectedId);
        if (i === -1) return prev;
        const start = prev[i] as RectShape;
        const w = pos.x - start.x,
          h = pos.y - start.y;
        const updated: RectShape = {
          ...start,
          x: w < 0 ? pos.x : start.x,
          y: h < 0 ? pos.y : start.y,
          width: Math.abs(w),
          height: Math.abs(h),
        };
        const copy = prev.slice();
        copy[i] = updated;
        return copy;
      });
      return;
    }
    if (tool === 'circle' || tool === 'triangle') {
      setShapes((prev) => {
        const i = prev.findIndex((s) => s.id === selectedId);
        if (i === -1) return prev;
        const start = prev[i] as CircleShape | TriangleShape;
        const dx = pos.x - start.x,
          dy = pos.y - start.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        const updated = { ...start, radius: r } as AnyShape;
        const copy = prev.slice();
        copy[i] = updated;
        return copy;
      });
    }
  };

  const onMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    pushHistory(snapshot());

    if (tool === 'rect' || tool === 'circle' || tool === 'triangle') {
      setTool('select');
    }
  };

  // === Interactions éléments ===
  const onShapeClick = (e: any, id: string, shape?: AnyShape) => {
    e.cancelBubble = true;

    if (tool === 'paint') {
      // Seau : remplit la forme
      setShapes((prev) =>
        prev.map((s) =>
          s.id === id ? ({ ...s, fill: activeColor } as AnyShape) : s
        )
      );
      pushHistory(snapshot());
      return;
    }
    setSelectedId(id);
  };

  // ====== TEXT INLINE EDIT ======
  const startTextEdit = (txt: TextShape, node: any) => {
    const stage = stageRef.current;
    const containerRect = stage?.container().getBoundingClientRect();
    if (!stage || !containerRect) return;

    const absPos = node.getAbsolutePosition();
    setEditingTextId(txt.id);
    setEditingValue(txt.text);
    setEditorPos({
      left: containerRect.left + absPos.x,
      top: containerRect.top + absPos.y,
      width: Math.max(120, txt.text.length * (txt.fontSize * 0.6)),
      fontSize: txt.fontSize,
      color: txt.fill || '#000',
    });
  };

  const commitTextEdit = (apply: boolean) => {
    if (!editingTextId) return;
    if (apply) {
      setShapes((prev) =>
        prev.map((s) =>
          s.id === editingTextId
            ? ({ ...(s as TextShape), text: editingValue } as AnyShape)
            : s
        )
      );
      pushHistory(snapshot());
    }
    setEditingTextId(null);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    const newShapes = shapes.filter((s) => s.id !== selectedId);
    if (newShapes.length !== shapes.length) {
      setShapes(newShapes);
      setSelectedId(null);
      pushHistory(snapshot());
      return;
    }
    const newStrokes = strokes.filter((s) => s.id !== selectedId);
    if (newStrokes.length !== strokes.length) {
      setStrokes(newStrokes);
      setSelectedId(null);
      pushHistory(snapshot());
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    setShapes((prev) => {
      const i = prev.findIndex((s) => s.id === selectedId);
      if (i === -1) return prev;
      const copy = prev.slice();
      copy[i] = {
        ...copy[i],
        stroke: strokeColor,
        strokeWidth: shapeStrokeWidth,
      };
      return copy;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokeColor, shapeStrokeWidth]);

  return (
    <div className="min-h-screen bg-sand text-ink">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-3 py-2 flex flex-wrap items-center gap-2">
          <IconToggle
            active={tool === 'select'}
            onClick={() => setTool('select')}
            title={t('editor.toolSelect')}
          >
            <MousePointer2 size={18} />
          </IconToggle>
          <IconToggle
            active={tool === 'paint'}
            onClick={() => setTool('paint')}
            title={t('editor.toolPaint')}
          >
            <PaintBucket size={18} />
          </IconToggle>
          <IconToggle
            active={tool === 'brush'}
            onClick={() => setTool('brush')}
            title={t('editor.toolBrush')}
          >
            <Brush size={18} />
          </IconToggle>
          <IconToggle
            active={tool === 'rect'}
            onClick={() => setTool('rect')}
            title={t('editor.toolRect')}
          >
            <Square size={18} />
          </IconToggle>
          <IconToggle
            active={tool === 'circle'}
            onClick={() => setTool('circle')}
            title={t('editor.toolCircle')}
          >
            <CircleIcon size={18} />
          </IconToggle>
          <IconToggle
            active={tool === 'triangle'}
            onClick={() => setTool('triangle')}
            title={t('editor.toolTriangle')}
          >
            <Triangle size={18} />
          </IconToggle>
          <IconToggle
            active={tool === 'text'}
            onClick={() => setTool('text')}
            title="Text"
          >
            <TypeIcon size={18} />
          </IconToggle>

          <IconBtn
            onClick={() => setShowGrid((v) => !v)}
            title={showGrid ? t('editor.hideGrid') : t('editor.showGrid')}
          >
            <Grid3X3 size={18} />
          </IconBtn>

          <ColorIcon
            color={activeColor}
            onChange={setActiveColor}
            title="Active color (brush/bucket/text)"
          />
          <ColorIcon
            color={strokeColor}
            onChange={setStrokeColor}
            title="Shape stroke"
          />
          <ColorIcon
            color={fillColor}
            onChange={setFillColor}
            title="Shape fill (default)"
          />

          {tool === 'brush' && (
            <input
              title={t('editor.brushWidth')}
              type="range"
              min={1}
              max={30}
              value={brushWidth}
              onChange={(e) => setBrushWidth(+e.target.value)}
              className="w-24 accent-ink"
            />
          )}
          {(tool === 'rect' ||
            tool === 'circle' ||
            tool === 'triangle' ||
            selectedId) && (
            <input
              title={t('editor.shapeStrokeWidth')}
              type="range"
              min={1}
              max={20}
              value={shapeStrokeWidth}
              onChange={(e) => setShapeStrokeWidth(+e.target.value)}
              className="w-24 accent-ink"
            />
          )}

          <div className="ml-auto flex gap-2">
            <IconBtn onClick={handleUndo} title="Undo">
              <Undo size={18} />
            </IconBtn>
            <IconBtn onClick={handleRedo} title="Redo">
              <Redo size={18} />
            </IconBtn>
            <IconBtn onClick={handleClear} title="Clear">
              <Eraser size={18} />
            </IconBtn>
            <IconBtn
              onClick={deleteSelected}
              title={t('editor.delete')}
              disabled={!selectedId}
            >
              <Trash2 size={18} />
            </IconBtn>
            <IconBtn onClick={handleSave} title="Save">
              <Save size={18} />
            </IconBtn>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 py-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('editor.messagePlaceholder')}
          className="w-full h-24 p-3 border rounded bg-white shadow focus:outline-none"
        />
      </div>

      <div className="max-w-6xl mx-auto px-3 pb-8">
        <div ref={stageWrapRef} className="relative">
          {editingTextId && (
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => commitTextEdit(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  commitTextEdit(true);
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  commitTextEdit(false);
                }
              }}
              autoFocus
              style={{
                position: 'fixed',
                left: editorPos.left,
                top: editorPos.top,
                width: editorPos.width,
                fontSize: editorPos.fontSize,
                color: editorPos.color,
                lineHeight: 1.2 as any,
                border: '1px solid #ddd',
                padding: '2px 4px',
                background: '#fff',
                zIndex: 50,
              }}
            />
          )}

          <div className="flex justify-center overflow-auto border shadow rounded-lg bg-gray-50 p-2">
            <Stage
              ref={stageRef}
              width={GRID_WIDTH * CELL_SIZE}
              height={GRID_HEIGHT * CELL_SIZE}
              onPointerDown={(e) => {
                const clickedBg = e.target === e.target.getStage();
                if (clickedBg) setSelectedId(null);
                if (tool !== 'select') onMouseDown();
              }}
              onPointerMove={onMouseMove}
              onPointerUp={onMouseUp}
            >
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={GRID_WIDTH * CELL_SIZE}
                  height={GRID_HEIGHT * CELL_SIZE}
                  fill="#ffffff"
                />
              </Layer>

              {showGrid && (
                <Layer listening={tool === 'paint'}>
                  {grid.map((row, ri) =>
                    row.map((color, ci) => (
                      <Rect
                        key={`${ri}-${ci}`}
                        x={ci * CELL_SIZE}
                        y={ri * CELL_SIZE}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        fill={color}
                        stroke="#ddd"
                        onClick={() => handleGridPaint(ri, ci)}
                      />
                    ))
                  )}
                </Layer>
              )}

              <Layer>
                {shapes.map((shape) => {
                  const isSelected = selectedId === shape.id;

                  if (shape.type === 'rect') {
                    return (
                      <Rect
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        rotation={shape.rotation ?? 0}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        fill={shape.fill}
                        draggable
                        hitStrokeWidth={10}
                        onClick={(e) => onShapeClick(e, shape.id, shape)}
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        onDblClick={(e) => {}}
                        onDragEnd={() => pushHistory(snapshot())}
                        onTransformEnd={(e) => {
                          const node = e.target as any;
                          const sx = node.scaleX(),
                            sy = node.scaleY();
                          node.scaleX(1);
                          node.scaleY(1);
                          setShapes((prev) =>
                            prev.map((s) =>
                              s.id === shape.id
                                ? {
                                    ...(s as RectShape),
                                    x: node.x(),
                                    y: node.y(),
                                    width: Math.max(
                                      5,
                                      (s as RectShape).width * sx
                                    ),
                                    height: Math.max(
                                      5,
                                      (s as RectShape).height * sy
                                    ),
                                    rotation: node.rotation(),
                                  }
                                : s
                            )
                          );
                          pushHistory(snapshot());
                        }}
                        ref={(n) => {
                          if (isSelected) selectedNodeRef.current = n;
                        }}
                      />
                    );
                  }

                  if (shape.type === 'circle') {
                    return (
                      <Circle
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        radius={(shape as CircleShape).radius}
                        rotation={shape.rotation ?? 0}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        fill={shape.fill}
                        draggable
                        hitStrokeWidth={10}
                        onClick={(e) => onShapeClick(e, shape.id, shape)}
                        onDragEnd={() => pushHistory(snapshot())}
                        onTransformEnd={(e) => {
                          const node = e.target as any;
                          const sx = node.scaleX();
                          node.scaleX(1);
                          node.scaleY(1);
                          setShapes((prev) =>
                            prev.map((s) =>
                              s.id === shape.id
                                ? {
                                    ...(s as CircleShape),
                                    x: node.x(),
                                    y: node.y(),
                                    radius: Math.max(
                                      3,
                                      (s as CircleShape).radius * sx
                                    ),
                                    rotation: node.rotation(),
                                  }
                                : s
                            )
                          );
                          pushHistory(snapshot());
                        }}
                        ref={(n) => {
                          if (isSelected) selectedNodeRef.current = n;
                        }}
                      />
                    );
                  }

                  if (shape.type === 'triangle') {
                    return (
                      <RegularPolygon
                        key={shape.id}
                        id={shape.id}
                        x={(shape as TriangleShape).x}
                        y={(shape as TriangleShape).y}
                        sides={3}
                        radius={(shape as TriangleShape).radius}
                        rotation={shape.rotation ?? 0}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        fill={shape.fill}
                        draggable
                        hitStrokeWidth={10}
                        onClick={(e) => onShapeClick(e, shape.id, shape)}
                        onDragEnd={() => pushHistory(snapshot())}
                        onTransformEnd={(e) => {
                          const node = e.target as any;
                          const sx = node.scaleX();
                          node.scaleX(1);
                          node.scaleY(1);
                          setShapes((prev) =>
                            prev.map((s) =>
                              s.id === shape.id
                                ? {
                                    ...(s as TriangleShape),
                                    x: node.x(),
                                    y: node.y(),
                                    radius: Math.max(
                                      4,
                                      (s as TriangleShape).radius * sx
                                    ),
                                    rotation: node.rotation(),
                                  }
                                : s
                            )
                          );
                          pushHistory(snapshot());
                        }}
                        ref={(n) => {
                          if (isSelected) selectedNodeRef.current = n;
                        }}
                      />
                    );
                  }

                  // TEXTE
                  const txt = shape as TextShape;
                  return (
                    <Text
                      key={txt.id}
                      id={txt.id}
                      x={txt.x}
                      y={txt.y}
                      text={txt.text}
                      fontSize={txt.fontSize}
                      fill={txt.fill}
                      rotation={txt.rotation ?? 0}
                      draggable
                      hitStrokeWidth={10}
                      onClick={(e) => onShapeClick(e, txt.id, txt)}
                      onDblClick={(e) => startTextEdit(txt, e.target)}
                      onDragEnd={() => pushHistory(snapshot())}
                      onTransformEnd={(e) => {
                        const node = e.target as any;
                        const sy = node.scaleY();
                        node.scaleX(1);
                        node.scaleY(1);
                        setShapes((prev) =>
                          prev.map((s) =>
                            s.id === txt.id
                              ? {
                                  ...(s as TextShape),
                                  x: node.x(),
                                  y: node.y(),
                                  fontSize: Math.max(
                                    8,
                                    (s as TextShape).fontSize * sy
                                  ),
                                  rotation: node.rotation(),
                                }
                              : s
                          )
                        );
                        pushHistory(snapshot());
                      }}
                      ref={(n) => {
                        if (isSelected) selectedNodeRef.current = n;
                      }}
                    />
                  );
                })}

                <Transformer
                  ref={trRef}
                  rotateEnabled
                  enabledAnchors={[
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ]}
                  anchorSize={8}
                />
              </Layer>

              <Layer listening={tool === 'brush'}>
                {strokes.map((s) => (
                  <Line
                    key={s.id}
                    id={s.id}
                    points={s.points}
                    stroke={s.color}
                    strokeWidth={s.strokeWidth}
                    tension={0.3}
                    lineCap="round"
                    lineJoin="round"
                    onClick={(e) =>
                      tool === 'select' && (e.cancelBubble = true)
                    }
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconToggle({ active, onClick, title, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded ${
        active
          ? 'bg-sunset text-white'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      }`}
    >
      {children}
    </button>
  );
}
function IconBtn({ onClick, title, disabled, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded ${
        disabled
          ? 'bg-gray-200 text-gray-400'
          : 'bg-gray-800 text-white hover:bg-gray-900'
      }`}
    >
      {children}
    </button>
  );
}
function ColorIcon({
  color,
  onChange,
  title,
}: {
  color: string;
  onChange: (c: string) => void;
  title?: string;
}) {
  const id = `color-${Math.random().toString(36).slice(2)}`;
  return (
    <label
      htmlFor={id}
      title={title}
      className="relative p-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
    >
      <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
      <input
        id={id}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="hidden"
      />
    </label>
  );
}
