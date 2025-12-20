import cit from '../assets/cit.png';
import ua from '../assets/ua.png';
import ssite from '../assets/ssite.jpg';
import eventLogo from '../assets/cei2026f.png'; // Make sure to add the event logo

export default function Header() {
  return (
    <header className="bg-uaBlue shadow-lg border-b-4 border-yellow-500">
       {/* Top Bar for University Logos */}
      <div className="flex justify-between items-center px-4 py-2 container mx-auto">
        <img src={cit} alt="CIT" className="h-16 w-16 object-contain" />
        <div className="flex flex-col items-center">
             <img src={ua} alt="UA" className="h-20 w-20 object-contain" />
             <h1 className="text-white text-xs mt-1 font-bold tracking-widest hidden md:block">UNIVERSITY OF THE ASSUMPTION</h1>
        </div>
        <img src={ssite} alt="SSITE" className="h-16 w-16 object-contain" />
      </div>
      
      {/* Sub-header for Event Logo/Title */}
      <div className="bg-white/10 backdrop-blur-sm py-2 text-center">
         <img src={eventLogo} alt="Event Logo" className="h-12 mx-auto object-contain" />
         <p className="text-uaWhite text-sm font-light mt-1">Research Forum Scoring System</p>
      </div>
    </header>
  );
}