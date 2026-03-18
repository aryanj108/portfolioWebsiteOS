import { useEffect, useRef, useState } from "react";

// ─── Colors ───────────────────────────────────────────────────────────────────
const Colors = {
  black:     '#000000',
  white:     '#ffffff',
  lightGray: '#c0c0c0',
  darkGray:  '#808080',
  blue:      '#000080',
};

// ─── Shared styles (directly from DragIndicator.tsx) ─────────────────────────
const BORDER_WIDTH = 6;

const sharedStyles = {
  draggable: {
    opacity: 0,
    position: 'absolute',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  hozDrag: {
    width: '100%',
    height: BORDER_WIDTH,
    backgroundColor: Colors.white,
    pointerEvents: 'none',
  },
  vertDragContainer: {
    width: '100%',
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  vertDrag: {
    width: BORDER_WIDTH,
    height: '100%',
    backgroundColor: Colors.white,
    pointerEvents: 'none',
  },
  checkerboard: {
    backgroundImage: `linear-gradient(45deg, black 25%, transparent 25%),
    linear-gradient(-45deg, black 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, black 75%),
    linear-gradient(-45deg, transparent 75%, black 75%)`,
    backgroundSize: `4px 4px`,
    backgroundPosition: `0 0, 0 2px, 2px -2px, -2px 0px`,
    pointerEvents: 'none',
  },
};

// ─── DragIndicator ────────────────────────────────────────────────────────────
// Exact port of DragIndicator.tsx — uses transform:translate, not top/left
function DragIndicator({ dragRef, width, height }) {
  return (
    <div
      ref={dragRef}
      style={{ ...sharedStyles.draggable, width, height }}
    >
      <div style={{ ...sharedStyles.hozDrag, ...sharedStyles.checkerboard }} />
      <div style={{ ...sharedStyles.vertDragContainer,
        height: `calc(100% - ${BORDER_WIDTH * 2}px)` }}>
        <div style={{ ...sharedStyles.vertDrag, ...sharedStyles.checkerboard }} />
        <div style={{ ...sharedStyles.vertDrag, ...sharedStyles.checkerboard }} />
      </div>
      <div style={{ ...sharedStyles.hozDrag, ...sharedStyles.checkerboard }} />
    </div>
  );
}

// ─── ResizeIndicator ──────────────────────────────────────────────────────────
// Exact port of ResizeIndicator.tsx — uses top/left absolute positioning
function ResizeIndicator({ resizeRef, top, left, width, height }) {
  return (
    <div
      ref={resizeRef}
      style={{ ...sharedStyles.draggable, top, left, width, height }}
    >
      {/* Expand the bottom-right click target */}
      <div style={{ position: 'absolute', width: 32, height: 32, bottom: -20, right: -20 }} />
      <div style={{ ...sharedStyles.hozDrag, ...sharedStyles.checkerboard }} />
      <div style={{ ...sharedStyles.vertDragContainer,
        height: `calc(100% - ${BORDER_WIDTH * 2}px)` }}>
        <div style={{ ...sharedStyles.vertDrag, ...sharedStyles.checkerboard }} />
        <div style={{ ...sharedStyles.vertDrag, ...sharedStyles.checkerboard }} />
      </div>
      <div style={{ ...sharedStyles.hozDrag, ...sharedStyles.checkerboard }} />
    </div>
  );
}

// ─── Window ───────────────────────────────────────────────────────────────────
export default function Window({
  title,
  children,
  onClose,
  onMinimize,
  isMinimized,
  style,
  zIndex,
  onFocus,
  bottomLeftText = '',
  windowBarColor,
  windowBarIcon,
}) {
  const windowRef       = useRef(null);
  const dragRef         = useRef(null);
  const resizeRef       = useRef(null);
  const contentRef      = useRef(null);
  const dragProps       = useRef(null);
  const lastClickInside = useRef(false);

  const [top,    setTop]    = useState(Math.random() * 100 + 50);
  const [left,   setLeft]   = useState(Math.random() * 200 + 50);
  const [width,  setWidth]  = useState(parseInt(style?.width)  || 600);
  const [height, setHeight] = useState(parseInt(style?.height) || 500);

  const [windowActive, setWindowActive] = useState(true);
  const [isDragging,   setIsDragging]   = useState(false);
  const [isResizing,   setIsResizing]   = useState(false);
  const [isMaximized,  setIsMaximized]  = useState(false);
  const [preMaxSize,   setPreMaxSize]   = useState(null);

  // ── Sync dragRef transform to current window position every render ──────────
  // This is exactly what the reference does:
  // useEffect(() => { dragRef.current.style.transform = `translate(${left}px, ${top}px)`; });
  useEffect(() => {
    if (dragRef.current) {
      dragRef.current.style.transform = `translate(${left}px, ${top}px)`;
    }
  });

  // ── Window active/inactive ────────────────────────────────────────────────
  const onCheckClick = () => {
    if (lastClickInside.current) {
      setWindowActive(true);
    } else {
      setWindowActive(false);
    }
    lastClickInside.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousedown', onCheckClick, false);
    return () => window.removeEventListener('mousedown', onCheckClick, false);
  }, []);

  const onWindowInteract = () => {
    onFocus();
    setWindowActive(true);
    lastClickInside.current = true;
  };

  // ── Drag — exactly matches reference ─────────────────────────────────────
  const startDrag = (e) => {
    if (isMaximized) return;
    const { clientX, clientY } = e;
    setIsDragging(true);
    e.preventDefault();
    dragProps.current = { dragStartX: clientX, dragStartY: clientY };
    window.addEventListener('mousemove', onDrag, false);
    window.addEventListener('mouseup',   stopDrag, false);
  };

  const getXYFromDragProps = (clientX, clientY) => {
    if (!dragProps.current) return { x: 0, y: 0 };
    const { dragStartX, dragStartY } = dragProps.current;
    return { x: clientX - dragStartX + left, y: clientY - dragStartY + top };
  };

  const onDrag = ({ clientX, clientY }) => {
    const { x, y } = getXYFromDragProps(clientX, clientY);
    dragRef.current.style.transform = `translate(${x}px, ${y}px)`;
    dragRef.current.style.opacity   = 1;
  };

  const stopDrag = ({ clientX, clientY }) => {
    setIsDragging(false);
    const { x, y } = getXYFromDragProps(clientX, clientY);
    setTop(y);
    setLeft(x);
    // Note: reference intentionally leaves opacity at 1 here (commented out reset)
    // dragRef opacity will reset via the useEffect on next render when isDragging=false
    window.removeEventListener('mousemove', onDrag, false);
    window.removeEventListener('mouseup',   stopDrag, false);
  };

  // ── Resize — exactly matches reference ───────────────────────────────────
  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    window.addEventListener('mousemove', onResize,   false);
    window.addEventListener('mouseup',   stopResize, false);
  };

  const onResize = ({ clientX, clientY }) => {
    const curWidth  = clientX - left;
    const curHeight = clientY - top;
    if (curWidth  > 520) resizeRef.current.style.width  = `${curWidth}px`;
    if (curHeight > 220) resizeRef.current.style.height = `${curHeight}px`;
    resizeRef.current.style.opacity = 1;
  };

  const stopResize = () => {
    setIsResizing(false);
    setWidth(parseInt(resizeRef.current.style.width)   || width);
    setHeight(parseInt(resizeRef.current.style.height) || height);
    resizeRef.current.style.opacity = 0;
    window.removeEventListener('mousemove', onResize,   false);
    window.removeEventListener('mouseup',   stopResize, false);
  };

  // ── Maximize ──────────────────────────────────────────────────────────────
  const maximize = () => {
    if (isMaximized) {
      setWidth(preMaxSize.width);
      setHeight(preMaxSize.height);
      setTop(preMaxSize.top);
      setLeft(preMaxSize.left);
      setIsMaximized(false);
    } else {
      setPreMaxSize({ width, height, top, left });
      setWidth(window.innerWidth);
      setHeight(window.innerHeight - 32);
      setTop(0);
      setLeft(0);
      setIsMaximized(true);
    }
  };

  if (isMinimized) return null;

  const titleBarBg = !windowActive
    ? Colors.darkGray
    : windowBarColor || `linear-gradient(to right, ${Colors.blue}, #1084d0)`;

  const btnStyle = {
    width: 16,
    height: 14,
    padding: 0,
    background: Colors.lightGray,
    border: '1px solid',
    borderColor: `${Colors.white} ${Colors.black} ${Colors.black} ${Colors.white}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    // container div — matches reference's `styles.container`
    // (position relative so drag/resize overlays position correctly)
    <div onMouseDown={onWindowInteract} style={{ position: 'relative' }}>

      {/* ── Main window ──────────────────────────────────────────────────── */}
      <div
        ref={windowRef}
        style={{
          backgroundColor: Colors.lightGray,
          position: 'absolute',
          width,
          height,
          top,
          left,
          zIndex,
        }}
      >
        {/* windowBorderOuter */}
        <div style={{
          border:       `1px solid ${Colors.black}`,
          borderTopColor:  Colors.lightGray,
          borderLeftColor: Colors.lightGray,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box',
        }}>
          {/* windowBorderInner */}
          <div style={{
            border:       `1px solid ${Colors.darkGray}`,
            borderTopColor:  Colors.white,
            borderLeftColor: Colors.white,
            flex: 1,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            position: 'relative',
          }}>

            {/* dragHitbox — invisible, covers title bar, triggers drag */}
            <div
              onMouseDown={startDrag}
              style={{
                position: 'absolute',
                width: 'calc(100% - 70px)',
                height: 48,
                zIndex: 10000,
                top: -8,
                left: -4,
                cursor: isMaximized ? 'default' : 'move',
              }}
            />

            {/* topBar / title bar */}
            <div style={{
              background: titleBarBg,
              width: '100%',
              height: 20,
              display: 'flex',
              alignItems: 'center',
              paddingRight: 2,
              boxSizing: 'border-box',
              flexShrink: 0,
              userSelect: 'none',
            }}>
              {/* windowHeader */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                {windowBarIcon
                  ? <img src={`/icons/${windowBarIcon}`} alt="" width="16" height="16"
                      style={{ paddingLeft: 4, paddingRight: 4, opacity: windowActive ? 1 : 0.5 }} />
                  : <div style={{ width: 16 }} />
                }
                <img src="/icons/windowsLogo.svg" alt="" width="14" height="14"
                  style={{ marginLeft: 2, marginRight: 4, opacity: windowActive ? 1 : 0.6 }} />
                <span className="showcase-header" style={{
                  fontFamily: 'MS Sans Serif, sans-serif',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: windowActive ? Colors.white : Colors.lightGray,
                }}>
                  {title}
                </span>
              </div>

              {/* windowTopButtons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} style={btnStyle}>
                  <img src="/icons/minimize.png" alt="minimize" width="10" height="10"
                    style={{ imageRendering: 'pixelated' }} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); maximize(); }} style={btnStyle}>
                  <img src="/icons/maximize.png" alt="maximize" width="10" height="10"
                    style={{ imageRendering: 'pixelated' }} />
                </button>
                <div style={{ paddingLeft: 2 }}>
                  <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={btnStyle}>
                    <img src="/icons/close.png" alt="close" width="10" height="10"
                      style={{ imageRendering: 'pixelated' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* contentOuter */}
            <div style={{
              border:       `1px solid ${Colors.white}`,
              borderTopColor:  Colors.darkGray,
              borderLeftColor: Colors.darkGray,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              marginTop: 8,
              marginBottom: 8,
              overflow: 'hidden',
            }}>
              {/* contentInner */}
              <div style={{
                border:       `1px solid ${Colors.lightGray}`,
                borderTopColor:  Colors.black,
                borderLeftColor: Colors.black,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}>
                {/* content */}
                <div
                  ref={contentRef}
                  style={{
                    flex: 1,
                    position: 'relative',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    backgroundColor: Colors.white,
                    fontFamily: 'MS Sans Serif, sans-serif',
                    fontSize: '11px',
                  }}
                >
                  {children}
                </div>
              </div>
            </div>

            {/* resizeHitbox */}
            <div
              onMouseDown={startResize}
              style={{
                position: 'absolute',
                width: 60,
                height: 60,
                bottom: -20,
                right: -20,
                cursor: 'nwse-resize',
                zIndex: 10000,
              }}
            />

            {/* bottomBar */}
            <div style={{
              flexShrink: 1,
              width: '100%',
              height: 20,
              display: 'flex',
              alignItems: 'stretch',
            }}>
              {/* Left text — flex: 5/7 */}
              <div style={{
                border:       `1px solid ${Colors.white}`,
                borderTopColor:  Colors.darkGray,
                borderLeftColor: Colors.darkGray,
                padding: 2,
                flex: 5 / 7,
                display: 'flex',
                alignItems: 'center',
              }}>
                <p style={{ fontSize: 12, marginLeft: 4, fontFamily: 'MS Sans Serif, sans-serif', margin: 0, marginLeft: 4 }}>
                  {bottomLeftText}
                </p>
              </div>

              {/* bottomSpacer 1 */}
              <div style={{
                border:       `1px solid ${Colors.white}`,
                borderTopColor:  Colors.darkGray,
                borderLeftColor: Colors.darkGray,
                padding: 2,
                width: 16,
                marginLeft: 2,
              }} />

              {/* bottomSpacer 2 */}
              <div style={{
                border:       `1px solid ${Colors.white}`,
                borderTopColor:  Colors.darkGray,
                borderLeftColor: Colors.darkGray,
                padding: 2,
                width: 16,
                marginLeft: 2,
              }} />

              {/* bottomResizeContainer — flex: 2/7 */}
              <div style={{
                border:       `1px solid ${Colors.white}`,
                borderTopColor:  Colors.darkGray,
                borderLeftColor: Colors.darkGray,
                flex: 2 / 7,
                marginLeft: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                padding: 0,
              }}>
                <img src="/icons/windowResize.png" alt="" width="12" height="12"
                  style={{ imageRendering: 'pixelated' }} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── ResizeIndicator overlay ───────────────────────────────────────── */}
      {/* Matches reference: wrapper div controls zIndex/cursor/mixBlendMode  */}
      <div style={!isResizing
        ? { zIndex: -10000, pointerEvents: 'none' }
        : { zIndex: zIndex + 1000, cursor: 'nwse-resize', mixBlendMode: 'difference' }
      }>
        <ResizeIndicator
          top={top}
          left={left}
          width={width}
          height={height}
          resizeRef={resizeRef}
        />
      </div>

      {/* ── DragIndicator overlay ─────────────────────────────────────────── */}
      {/* Matches reference: wrapper div controls zIndex/cursor/mixBlendMode  */}
      <div style={!isDragging
        ? { zIndex: -10000, pointerEvents: 'none' }
        : { zIndex: zIndex + 1000, cursor: 'move', mixBlendMode: 'difference' }
      }>
        <DragIndicator
          width={width}
          height={height}
          dragRef={dragRef}
        />
      </div>

    </div>
  );
}