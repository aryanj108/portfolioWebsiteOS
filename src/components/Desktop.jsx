import { useState, useEffect } from "react";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import { AboutContent, ProjectsContent, ContactContent, ResumeContent } from "./WindowContents";
import Home from '../apps/showcase/Home';

export default function Desktop() {
  const [time, setTime] = useState(new Date());
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const openWindow = (title, content, width = '500px') => {
    const newWindow = {
      id: Date.now(),
      title,
      content,
      isMinimized: false,
      zIndex: nextZIndex,
      width
    };
    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);
  };
  
  const closeWindow = (id) => {
    setWindows(windows.filter(w => w.id !== id));
  };
  
  const minimizeWindow = (id) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };
  
  const focusWindow = (id) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex } : w
    ));
    setNextZIndex(nextZIndex + 1);
  };
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#3e9697',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Desktop Icons */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <DesktopIcon 
          icon="/icons/folder.svg" 
          label="My Showcase" 
          onDoubleClick={() => openWindow('My Showcase', <Home />, '860px')}
        />
        <DesktopIcon 
          icon="/icons/folder.svg" 
          label="Projects" 
          onDoubleClick={() => openWindow('Projects', <ProjectsContent />, '600px')}
        />
        <DesktopIcon 
          icon="/icons/folder.svg" 
          label="About Me" 
          onDoubleClick={() => openWindow('About Me', <AboutContent />)}
        />
        <DesktopIcon 
          icon="/icons/folder.svg" 
          label="Contact" 
          onDoubleClick={() => openWindow('Contact', <ContactContent />)}
        />
        <DesktopIcon 
          icon="/icons/folder.svg" 
          label="Resume" 
          onDoubleClick={() => openWindow('Resume', <ResumeContent />)}
        />
      </div>
      
      {/* Windows */}
      {windows.map(window => (
        <Window
          key={window.id}
          title={window.title}
          isMinimized={window.isMinimized}
          zIndex={window.zIndex}
          style={{ width: window.width }}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
        >
          {window.content}
        </Window>
      ))}
      
      {/* Taskbar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40px',
        background: '#c0c0c0',
        border: '2px solid',
        borderColor: '#ffffff #000000 #000000 #ffffff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5px',
        gap: '5px',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.2)'
      }}>
        
        {/* Start Button */}
        <button style={{
          height: '36px',
          padding: '0 8px',
          background: '#c0c0c0',
          border: '2px solid',
          borderColor: '#ffffff #000000 #000000 #ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          fontFamily: 'MS Sans Serif, sans-serif',
          fontWeight: 'bold',
          fontSize: '11px'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.borderColor = '#000000 #ffffff #ffffff #000000';
          e.currentTarget.style.padding = '1px 7px 0 9px';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
          e.currentTarget.style.padding = '0 8px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#ffffff #000000 #000000 #ffffff';
          e.currentTarget.style.padding = '0 8px';
        }}
        >
          <img src="/icons/windowsLogo.svg" alt="Windows" width="14" height="14" />
          Start
        </button>
        
        {/* Taskbar Window Buttons */}
        <div style={{ flex: 1, display: 'flex', gap: '2px' }}>
          {windows.map(window => (
            <button
              key={window.id}
              onClick={() => minimizeWindow(window.id)}
              style={{
                height: '28px',
                padding: '0 10px',
                background: window.isMinimized ? '#c0c0c0' : '#ffffff',
                border: '2px solid',
                borderColor: window.isMinimized 
                  ? '#ffffff #000000 #000000 #ffffff'
                  : '#000000 #ffffff #ffffff #000000',
                cursor: 'pointer',
                fontFamily: 'MS Sans Serif, sans-serif',
                fontSize: '11px',
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {window.title}
            </button>
          ))}
        </div>
        
        {/* System Tray */}
        <div style={{
          height: '28px',
          padding: '0 10px',
          background: '#c0c0c0',
          border: '1px solid',
          borderColor: '#808080 #ffffff #ffffff #808080',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '11px',
          fontFamily: 'MS Sans Serif, sans-serif'
        }}>
          <img src="/icons/volumeLogo.svg" alt="Volume" width="16" height="16" />
          <span>
            {time.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
        </div>
      </div>
      
    </div>
  );
}