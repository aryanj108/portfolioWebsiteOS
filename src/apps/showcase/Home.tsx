import React from 'react';

interface HomeProps {
  onNavigate?: (section: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const navLinks = ['ABOUT', 'EXPERIENCE', 'PROJECTS', 'CONTACT'];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#f4f4f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: '"Times New Roman", Georgia, serif',
    }}>

      {/* Background watermark circles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[
          { top: '8%',  left: '5%',  width: 160, height: 160, opacity: 0.045 },
          { top: '15%', right: '4%', width: 220, height: 220, opacity: 0.035 },
          { top: '55%', left: '2%',  width: 130, height: 130, opacity: 0.04  },
          { top: '60%', right: '6%', width: 180, height: 180, opacity: 0.04  },
          { top: '30%', left: '44%', width: 90,  height: 90,  opacity: 0.03  },
          { top: '72%', left: '28%', width: 110, height: 110, opacity: 0.03  },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #5566dd 0%, transparent 70%)',
            ...pos,
          }} />
        ))}
      </div>

      {/* Center content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Name + title */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h1 style={{
            fontSize: 68,
            fontWeight: 'bold',
            fontFamily: '"Times New Roman", Georgia, serif',
            color: '#2a2a2a',
            margin: '0 0 10px 0',
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}>
            Aryan Jalota
          </h1>
          <h2 style={{
            fontSize: 22,
            fontWeight: 'normal',
            fontFamily: '"Courier New", Courier, monospace',
            color: '#3a3a3a',
            margin: 0,
            letterSpacing: '1px',
          }}>
            Software Engineer
          </h2>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 36 }}>
          {navLinks.map((link) => (
            <span
              key={link}
              onClick={() => onNavigate && onNavigate(link)}
              style={{
                fontSize: 15,
                fontFamily: '"Courier New", Courier, monospace',
                color: '#0000cc',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 'bold',
                letterSpacing: '2px',
                userSelect: 'none',
                display: 'inline-block',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#0000aa';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#0000cc';
              }}
            >
              {link}
            </span>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 11,
        fontFamily: '"Courier New", monospace',
        color: '#999',
        zIndex: 1,
      }}>
        © {new Date().getFullYear()} Aryan Jalota
      </div>
    </div>
  );
};

export default Home;