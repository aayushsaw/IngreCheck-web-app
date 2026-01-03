import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="relative bg-background border-t border-border/40 pt-16 pb-8 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-ingrecheck-light/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-10 h-10 bg-gradient-to-br from-ingrecheck-light to-ingrecheck rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-ingrecheck/20">
                I
              </div>
              <span className="font-poppins font-bold text-2xl tracking-tight text-foreground">IngreCheck</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Empowering your health choices with AI-driven food analysis. Scan, check, and live better.
            </p>
            <div className="flex gap-4">
              <Link href="https://apps.apple.com/us/app/ingredicheck-grocery-scanner/id6477521615" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <AppStoreBadge />
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=com.ingrecheck.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <GooglePlayBadge />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-foreground text-lg mb-6">Explore</h3>
            <ul className="space-y-4">
              {['Features', 'Premium', 'Scanning', 'Recommendations'].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className="text-muted-foreground hover:text-ingrecheck transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-ingrecheck/0 group-hover:bg-ingrecheck transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-foreground text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              {['About Us', 'Team', 'Press', 'Careers'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-muted-foreground hover:text-ingrecheck transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-ingrecheck/0 group-hover:bg-ingrecheck transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-poppins font-semibold text-foreground text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-ingrecheck transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-ingrecheck transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="mt-8 p-4 rounded-xl bg-ingrecheck/5 border border-ingrecheck/10">
              <p className="text-xs text-muted-foreground">
                Stay updated with our newsletter.
              </p>
              {/* Placeholder for newsletter input if needed */}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 text-center md:text-center flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} IngreCheck Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            {/* Social placeholders could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};

const IngreCheckLogo = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60.7,38.4c-4-9.3-10.6-16.5-18.7-16.5c-8,0-14.7,7.2-18.7,16.5c-3.9,9.2-9.4,28.4,0,37.8c4.7,4.7,11.8,7.6,18.7,7.6
        c6.9,0,14-2.9,18.7-7.6C70.1,66.8,64.6,47.6,60.7,38.4z"
        fill="#3cbd71"
      />
      <path
        d="M80,38.4c0,0-19.4,3-19.4,42.5c0,0,25.5-4.7,25.5-43.9"
        fill="#ef9e48"
      />
      <path
        d="M42,46.2c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S40.9,46.2,42,46.2z"
        fill="#FFFFFF"
      />
      <path
        d="M50.3,55.6c0,4.6-3.7,8.3-8.3,8.3s-8.3-3.7-8.3-8.3s3.7-8.3,8.3-8.3S50.3,51,50.3,55.6z"
        fill="#FFFFFF"
      />
      <path
        d="M45.7,56.7c0.4,0,0.7-0.3,0.7-0.7c0-0.4-0.3-0.7-0.7-0.7c-0.4,0-0.7,0.3-0.7,0.7C45,56.4,45.3,56.7,45.7,56.7z"
        fill="#000000"
      />
    </svg>
  );
};

const AppStoreBadge = () => {
  return (
    <svg width="120" height="40" viewBox="0 0 119.66 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M119.66,35c0,2.75-2.25,5-5,5H5c-2.75,0-5-2.25-5-5V5c0-2.75,2.25-5,5-5h109.66c2.75,0,5,2.25,5,5V35z" fill="#A6A6A6" />
      <path d="M114.66,0H5C2.25,0,0,2.25,0,5v30c0,2.75,2.25,5,5,5h109.66c2.75,0,5-2.25,5-5V5C119.66,2.25,117.41,0,114.66,0z M114.66,1c2.2,0,4,1.8,4,4v30c0,2.2-1.8,4-4,4H5c-2.2,0-4-1.8-4-4V5c0-2.2,1.8-4,4-4H114.66z" fill="#A6A6A6" />
      <path d="M24.13,20.52c-0.03-3.35,2.74-4.97,2.87-5.05c-1.56-2.29-4-2.6-4.86-2.64c-2.07-0.21-4.04,1.22-5.09,1.22 c-1.05,0-2.67-1.19-4.39-1.16c-2.26,0.03-4.34,1.31-5.5,3.34c-2.34,4.06-0.6,10.08,1.68,13.38c1.12,1.61,2.44,3.42,4.19,3.36 c1.68-0.07,2.32-1.09,4.36-1.09c2.04,0,2.61,1.09,4.4,1.05c1.82-0.03,2.97-1.65,4.08-3.27c1.29-1.88,1.82-3.7,1.85-3.8 C27.68,23.51,24.16,22.48,24.13,20.52z" fill="#FFFFFF" />
      <path d="M21.5,12.5c0.92-1.12,1.55-2.67,1.38-4.22c-1.33,0.05-2.94,0.89-3.9,2c-0.86,0.99-1.61,2.58-1.41,4.1 C19.01,14.48,20.57,13.62,21.5,12.5z" fill="#FFFFFF" />
      <g>
        <path d="M43.41,27.1h-4.73l-1.14,3.36h-2l4.48-12.42h2.08l4.48,12.42h-2.04L43.41,27.1z M39.13,25.62h3.84l-1.89-5.56h-0.05 L39.13,25.62z" fill="#FFFFFF" />
        <path d="M55.26,25.97c0,2.81-1.51,4.62-3.78,4.62c-1.29,0-2.32-0.58-2.85-1.58h-0.04v4.48h-1.86v-12h1.8v1.5h0.03 c0.52-0.96,1.63-1.62,2.89-1.62C53.75,21.37,55.26,23.18,55.26,25.97z M53.34,25.97c0-1.83-0.95-3.04-2.39-3.04 c-1.42,0-2.37,1.23-2.37,3.04c0,1.82,0.95,3.05,2.37,3.05C52.4,29.02,53.34,27.8,53.34,25.97z" fill="#FFFFFF" />
        <path d="M65.12,25.97c0,2.81-1.51,4.62-3.78,4.62c-1.29,0-2.32-0.58-2.85-1.58h-0.04v4.48h-1.86v-12h1.8v1.5h0.04 c0.52-0.96,1.63-1.62,2.89-1.62C63.61,21.37,65.12,23.18,65.12,25.97z M63.2,25.97c0-1.83-0.95-3.04-2.39-3.04 c-1.42,0-2.37,1.23-2.37,3.04c0,1.82,0.95,3.05,2.37,3.05C62.26,29.02,63.2,27.8,63.2,25.97z" fill="#FFFFFF" />
        <path d="M71.71,27.04c0.14,1.23,1.33,2.04,2.97,2.04c1.57,0,2.7-0.81,2.7-1.92c0-0.96-0.68-1.54-2.28-1.94l-1.61-0.39 c-2.27-0.55-3.33-1.61-3.33-3.34c0-2.14,1.86-3.61,4.51-3.61c2.62,0,4.42,1.47,4.48,3.61h-1.87c-0.11-1.24-1.14-1.99-2.63-1.99 s-2.52,0.75-2.52,1.85c0,0.87,0.65,1.39,2.25,1.79l1.37,0.33c2.54,0.6,3.6,1.63,3.6,3.44c0,2.32-1.85,3.78-4.79,3.78 c-2.75,0-4.61-1.42-4.73-3.66H71.71z" fill="#FFFFFF" />
        <path d="M83.35,19.3v2.14h1.72v1.47h-1.72v4.99c0,0.78,0.34,1.13,1.1,1.13c0.2,0,0.44-0.02,0.61-0.04v1.46 c-0.34,0.07-0.69,0.09-1.04,0.09c-1.85,0-2.53-0.69-2.53-2.45v-5.18h-1.32v-1.47h1.32V19.3H83.35z" fill="#FFFFFF" />
        <path d="M86.06,25.97c0-2.84,1.68-4.64,4.29-4.64c2.61,0,4.29,1.8,4.29,4.64c0,2.85-1.67,4.64-4.29,4.64 C87.73,30.61,86.06,28.82,86.06,25.97z M92.76,25.97c0-1.95-0.9-3.11-2.41-3.11c-1.52,0-2.41,1.16-2.41,3.11 c0,1.96,0.9,3.11,2.41,3.11C91.87,29.08,92.76,27.92,92.76,25.97z" fill="#FFFFFF" />
        <path d="M96.19,21.43h1.77v1.54h0.04c0.28-0.98,1.11-1.64,2.18-1.64c0.26,0,0.48,0.04,0.62,0.07v1.74 c-0.16-0.05-0.45-0.1-0.78-0.1c-1.2,0-1.96,0.81-1.96,2.09v5.37h-1.86V21.43z" fill="#FFFFFF" />
        <path d="M109.38,27.84c-0.25,1.64-1.85,2.77-3.9,2.77c-2.63,0-4.27-1.76-4.27-4.6c0-2.84,1.64-4.68,4.19-4.68 c2.51,0,4.09,1.72,4.09,4.47v0.64h-6.4v0.11c0,1.55,0.97,2.56,2.4,2.56c1.02,0,1.82-0.49,2.07-1.27H109.38z M103.09,24.97h4.53 c-0.05-1.39-0.93-2.3-2.23-2.3C104.16,22.67,103.16,23.6,103.09,24.97z" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

const GooglePlayBadge = () => {
  return (
    <svg width="120" height="40" viewBox="0 0 135 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M130,40H5c-2.8,0-5-2.2-5-5V5c0-2.8,2.2-5,5-5h125c2.8,0,5,2.2,5,5v30C135,37.8,132.8,40,130,40z" fill="#A6A6A6" />
      <path d="M130,0.8c2.3,0,4.2,1.9,4.2,4.2v30c0,2.3-1.9,4.2-4.2,4.2H5c-2.3,0-4.2-1.9-4.2-4.2V5c0-2.3,1.9-4.2,4.2-4.2H130 M130,0H5 C2.2,0,0,2.3,0,5v30c0,2.8,2.2,5,5,5h125c2.8,0,5-2.2,5-5V5C135,2.3,132.8,0,130,0z" fill="#A6A6A6" />
      <path d="M68.1,21.8c-2.4,0-4.3,1.8-4.3,4.3c0,2.4,1.9,4.3,4.3,4.3c2.4,0,4.3-1.8,4.3-4.3C72.4,23.5,70.5,21.8,68.1,21.8z M68.1,28.6 c-1.3,0-2.4-1.1-2.4-2.6c0-1.5,1.1-2.6,2.4-2.6c1.3,0,2.4,1,2.4,2.6C70.5,27.5,69.4,28.6,68.1,28.6z M58.8,21.8 c-2.4,0-4.3,1.8-4.3,4.3c0,2.4,1.9,4.3,4.3,4.3c2.4,0,4.3-1.8,4.3-4.3C63.1,23.5,61.2,21.8,58.8,21.8z M58.8,28.6 c-1.3,0-2.4-1.1-2.4-2.6c0-1.5,1.1-2.6,2.4-2.6c1.3,0,2.4,1,2.4,2.6C61.2,27.5,60.1,28.6,58.8,28.6z M47.7,23.1v1.8h4.3 c-0.1,1-0.5,1.8-1,2.3c-0.6,0.6-1.6,1.3-3.3,1.3c-2.7,0-4.7-2.1-4.7-4.8s2.1-4.8,4.7-4.8c1.4,0,2.5,0.6,3.3,1.3l1.3-1.3 c-1.1-1-2.5-1.8-4.5-1.8c-3.6,0-6.7,3-6.7,6.6c0,3.6,3.1,6.6,6.7,6.6c2,0,3.4-0.6,4.6-1.9c1.2-1.2,1.6-2.9,1.6-4.2 c0-0.4,0-0.8-0.1-1.1H47.7z M93.1,24.5c-0.4-1-1.4-2.7-3.6-2.7c-2.2,0-4,1.7-4,4.3c0,2.4,1.8,4.3,4.2,4.3c1.9,0,3.1-1.2,3.5-1.9 l-1.4-1c-0.5,0.7-1.1,1.2-2.1,1.2c-1,0-1.6-0.4-2.1-1.3l5.7-2.4L93.1,24.5z M87.3,25.9c0-1.6,1.3-2.5,2.2-2.5 c0.7,0,1.4,0.4,1.6,0.9L87.3,25.9z M82.6,30h1.9V17.5h-1.9V30z M79.6,22.7L79.6,22.7c-0.5-0.5-1.3-1-2.3-1 c-2.1,0-4.1,1.9-4.1,4.3c0,2.4,1.9,4.2,4.1,4.2c1,0,1.8-0.5,2.2-1h0.1v0.6c0,1.6-0.9,2.5-2.3,2.5c-1.1,0-1.9-0.8-2.1-1.5 l-1.6,0.7c0.5,1.1,1.7,2.5,3.8,2.5c2.2,0,4-1.3,4-4.4V22h-1.8V22.7z M77.4,28.6c-1.3,0-2.4-1.1-2.4-2.6c0-1.5,1.1-2.6,2.4-2.6 c1.3,0,2.3,1.1,2.3,2.6C79.7,27.5,78.7,28.6,77.4,28.6z M101.8,17.5h-4.5V30h1.9v-4.7h2.6c2.1,0,4.1-1.5,4.1-3.9 S103.9,17.5,101.8,17.5z M101.9,23.5h-2.7v-4.3h2.7c1.4,0,2.2,1.2,2.2,2.1C104,22.4,103.2,23.5,101.9,23.5z M113.4,21.7 c-1.4,0-2.8,0.6-3.3,1.9l1.7,0.7c0.4-0.7,1-0.9,1.7-0.9c1,0,1.9,0.6,2,1.6v0.1c-0.3-0.2-1.1-0.5-1.9-0.5c-1.8,0-3.6,1-3.6,2.8 c0,1.7,1.5,2.8,3.1,2.8c1.3,0,1.9-0.6,2.4-1.2h0.1v1h1.8v-4.8C117.2,23,115.5,21.7,113.4,21.7z M113.2,28.6 c-0.6,0-1.5-0.3-1.5-1.1c0-1,1.1-1.3,2-1.3c0.8,0,1.2,0.2,1.7,0.4C115.2,27.8,114.2,28.6,113.2,28.6z M123.7,22l-2.1,5.4h-0.1 l-2.2-5.4h-2l3.3,7.6l-1.9,4.2h1.9l5.1-11.8H123.7z M106.9,30h1.9V17.5h-1.9V30z" fill="#FFFFFF" />
      <defs>
        <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="21.7996" y1="173.2904" x2="5.0172" y2="156.508" gradientTransform="matrix(1 0 0 -1 0 182.0002)">
          <stop offset="0" stopColor="#00A0FF" />
          <stop offset="0.0066" stopColor="#00A1FF" />
          <stop offset="0.2601" stopColor="#00BEFF" />
          <stop offset="0.5122" stopColor="#00D2FF" />
          <stop offset="0.7604" stopColor="#00DFFF" />
          <stop offset="1" stopColor="#00E3FF" />
        </linearGradient>
      </defs>
      <path d="M10.4,7.5C10.1,7.8,10,8.3,10,8.9v22.1c0,0.6,0.2,1.1,0.5,1.4l0.1,0.1l12.4-12.4V20v-0.1L10.4,7.5L10.4,7.5z" fill="url(#SVGID_1_)" />
      <defs>
        <linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="33.834" y1="161.9987" x2="9.637" y2="161.9987" gradientTransform="matrix(1 0 0 -1 0 182.0002)">
          <stop offset="0" stopColor="#FFE000" />
          <stop offset="0.4087" stopColor="#FFBD00" />
          <stop offset="0.7754" stopColor="#FFA500" />
          <stop offset="1" stopColor="#FF9C00" />
        </linearGradient>
      </defs>
      <path d="M27,24.3l-4.1-4.1V20v-0.1l4.1-4.1l0.1,0.1l4.9,2.8c1.4,0.8,1.4,2.1,0,2.9L27,24.3L27,24.3z" fill="url(#SVGID_2_)" />
      <defs>
        <linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="24.8265" y1="159.704" x2="2.0686" y2="136.9461" gradientTransform="matrix(1 0 0 -1 0 182.0002)">
          <stop offset="0" stopColor="#FF3A44" />
          <stop offset="1" stopColor="#C31162" />
        </linearGradient>
      </defs>
      <path d="M27.1,24.2L22.9,20L10.4,32.5c0.5,0.5,1.2,0.5,2.1,0.1L27.1,24.2" fill="url(#SVGID_3_)" />
      <defs>
        <linearGradient id="SVGID_4_" gradientUnits="userSpaceOnUse" x1="7.2972" y1="181.8239" x2="17.4598" y2="171.6614" gradientTransform="matrix(1 0 0 -1 0 182.0002)">
          <stop offset="0" stopColor="#32A071" />
          <stop offset="0.0685" stopColor="#2DA771" />
          <stop offset="0.4762" stopColor="#15CF74" />
          <stop offset="0.8009" stopColor="#06E775" />
          <stop offset="1" stopColor="#00F076" />
        </linearGradient>
      </defs>
      <path d="M27.1,15.8L12.5,7.5c-0.9-0.5-1.6-0.4-2.1,0.1L22.9,20L27.1,15.8z" fill="url(#SVGID_4_)" />
    </svg>
  );
};

export default Footer;
