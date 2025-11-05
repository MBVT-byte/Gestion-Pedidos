import React from 'react';

const DunaCanariasLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <path id="circlePath" fill="none" d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" />
        </defs>
        
        <circle cx="100" cy="100" r="100" fill="#2c3e50" />
        
        <g transform="translate(100 100) scale(0.6)">
            <path
                d="M -22 -25 L -45 0 L 0 45 L 45 0 L 22 -25 L 0 -10 L -45 0 M 0 -10 L 45 0"
                stroke="#bfa86b"
                strokeWidth="10"
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <g fill="none" stroke="#bfa86b" strokeWidth="10" strokeLinecap="round">
                <path d="M 0 -22 L 0 -35" />
                <path d="M -15 -18 L -8 -28" />
                <path d="M 15 -18 L 8 -28" />
            </g>
        </g>
        
        <text style={{ fontSize: '21px', fontFamily: 'sans-serif', fill: '#bfa86b', letterSpacing: '4.5px', textTransform: 'uppercase' }}>
            <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                DUNA CANARIAS LÍDER
            </textPath>
        </text>
        <text style={{ fontSize: '21px', fontFamily: 'sans-serif', fill: '#bfa86b', letterSpacing: '7px', textTransform: 'uppercase' }}>
            {/* Fix: The 'side' attribute is a valid SVG 2 attribute not in React's SVG types. Using a spread to bypass the type check. */}
            <textPath href="#circlePath" startOffset="0%" textAnchor="middle" {...{ side: 'right' }}>
                EN BISUTERÍA
            </textPath>
        </text>
    </svg>
);

export default DunaCanariasLogo;