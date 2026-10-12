// Minimalist, authentic Notion-style monochrome cartoon doodles / vector illustrations
// Automatically adapts between Light (White & Black) and Dark (Black & White)

export const RoadDoodle = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M40 160C60 120 80 100 100 70C120 40 140 30 160 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M70 170C90 130 110 110 130 80C150 50 170 40 190 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M55 165L60 155" stroke="currentColor" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" />
    <path d="M85 125L90 115" stroke="currentColor" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" />
    <path d="M115 85L120 75" stroke="currentColor" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" />
    {/* Minimalist Cartoon Car */}
    <rect x="90" y="55" width="28" height="16" rx="4" fill="var(--notion-card)" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="96" cy="72" r="4" fill="currentColor" />
    <circle cx="112" cy="72" r="4" fill="currentColor" />
    <rect x="95" y="58" width="18" height="6" rx="1" fill="var(--notion-bg)" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const CityDoodle = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 600 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
    {/* Horizon line */}
    <line x1="0" y1="150" x2="600" y2="150" stroke="var(--notion-border)" strokeWidth="2" />
    {/* Minimalist buildings */}
    <rect x="40" y="70" width="45" height="80" fill="var(--notion-sidebar)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    <rect x="50" y="80" width="8" height="10" fill="currentColor" fillOpacity="0.2" />
    <rect x="65" y="80" width="8" height="10" fill="currentColor" fillOpacity="0.2" />
    <rect x="50" y="100" width="8" height="10" fill="currentColor" fillOpacity="0.2" />
    <rect x="65" y="100" width="8" height="10" fill="currentColor" fillOpacity="0.2" />
    
    <rect x="100" y="40" width="60" height="110" fill="var(--notion-card)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    <line x1="130" y1="20" x2="130" y2="40" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    <rect x="112" y="55" width="10" height="12" fill="currentColor" fillOpacity="0.2" />
    <rect x="135" y="55" width="10" height="12" fill="currentColor" fillOpacity="0.2" />
    <rect x="112" y="75" width="10" height="12" fill="currentColor" fillOpacity="0.2" />
    <rect x="135" y="75" width="10" height="12" fill="currentColor" fillOpacity="0.2" />
    
    <rect x="180" y="90" width="50" height="60" fill="var(--notion-sidebar)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    <rect x="250" y="50" width="55" height="100" fill="var(--notion-card)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    
    <rect x="330" y="30" width="70" height="120" fill="var(--notion-sidebar)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    <polygon points="365,10 330,30 400,30" fill="var(--notion-card)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    
    <rect x="420" y="80" width="50" height="70" fill="var(--notion-card)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    <rect x="490" y="60" width="65" height="90" fill="var(--notion-sidebar)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
    
    {/* Floating clouds / sun */}
    <circle cx="530" cy="30" r="14" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3 3" />
  </svg>
);

export const AiDoodle = ({ className = "w-28 h-28" }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="80" cy="80" r="50" fill="var(--notion-card)" stroke="currentColor" strokeWidth="3" />
    {/* Cartoon Face */}
    <circle cx="65" cy="72" r="4" fill="currentColor" />
    <circle cx="95" cy="72" r="4" fill="currentColor" />
    <path d="M72 92C76 96 84 96 88 92" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    {/* Antenna / sparkles */}
    <line x1="80" y1="30" x2="80" y2="15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="80" cy="12" r="4" fill="currentColor" />
    <path d="M125 45L135 40L130 50L135 60L125 55L115 60L120 50L115 40Z" fill="currentColor" />
  </svg>
);

export const DocumentDoodle = ({ className = "w-24 h-24" }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="25" y="15" width="70" height="90" rx="6" fill="var(--notion-card)" stroke="currentColor" strokeWidth="2.5" />
    <line x1="38" y1="35" x2="82" y2="35" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="50" x2="82" y2="50" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="38" y1="65" x2="65" y2="65" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="75" cy="80" r="10" fill="var(--notion-bg)" stroke="currentColor" strokeWidth="2" />
    <path d="M72 80L74 82L79 77" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
