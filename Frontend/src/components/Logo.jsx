/**
 * DriveHub — Custom SVG Logo Component
 * Concept: A stylised speed-chevron split diamond
 *   – Left half: solid gold rhombus
 *   – Right half: outlined gold rhombus
 *   – A forward-facing motion slash cuts diagonally through the centre
 * Pure React SVG primitives, no icon libraries.
 */

const Logo = ({ size = 36, showWordmark = true, className = '' }) => {
  const h = size;
  const w = size * 0.88;

  return (
    <div
      className={`dh-logo ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: showWordmark ? size * 0.38 : 0 }}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 44 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DriveHub logo mark"
      >
        {/* Left half rhombus — solid gold */}
        <polygon
          points="22,2 2,25 22,48 22,2"
          fill="#C9A84C"
        />
        {/* Right half rhombus — outline */}
        <polygon
          points="22,2 42,25 22,48 22,2"
          fill="none"
          stroke="#C9A84C"
          strokeWidth="2"
        />
        {/* Motion slash — cuts through centre, negative space */}
        <line
          x1="14"
          y1="38"
          x2="30"
          y2="12"
          stroke="#0D0D0D"
          strokeWidth="3.5"
          strokeLinecap="square"
        />
        {/* Secondary slash — parallel, slightly offset, thinner */}
        <line
          x1="19"
          y1="41"
          x2="35"
          y2="15"
          stroke="#C9A84C"
          strokeWidth="1.2"
          strokeLinecap="square"
          opacity="0.5"
        />
      </svg>

      {showWordmark && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1,
          gap: '2px',
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontSize: size * 0.6,
            letterSpacing: '0.08em',
            color: '#F0EDE6',
            textTransform: 'uppercase',
          }}>
            Drive
          </span>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300,
            fontSize: size * 0.38,
            letterSpacing: '0.22em',
            color: '#C9A84C',
            textTransform: 'uppercase',
          }}>
            Hub
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
