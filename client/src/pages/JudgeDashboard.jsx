import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import Swal from 'sweetalert2';
import { 
    ChevronDown, 
    ChevronRight, 
    CheckCircle2, 
    Trophy, 
    Users, 
    Layout, 
    Megaphone, 
    Search,
    Eye,
    Edit3,
    ExternalLink 
} from 'lucide-react';

export default function JudgeDashboard() {
    const [teams, setTeams] = useState([]);
    const [existingScores, setExistingScores] = useState([]); 
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [scores, setScores] = useState({}); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const loadData = async () => {
        try {
            const [teamsRes, scoresRes] = await Promise.all([
                api.get('/scores/teams'),
                api.get('/scores/judge-scores') 
            ]);
            setTeams(teamsRes.data);
            setExistingScores(scoresRes.data);
        } catch (err) { 
            console.error(err);
            navigate('/'); 
        }
    };

    useEffect(() => {
        loadData();
    }, [navigate]);

    const handleSelectTeam = (team) => {
        const previousScore = existingScores.find(s => s.teamId === team._id);
        if (previousScore) {
            setScores({
                paper: previousScore.paper,
                presenter: previousScore.presenter,
                poster: previousScore.poster,
                marketing: previousScore.marketing
            });
        } else {
            setScores({});
        }
        setSelectedTeam(team);
        setIsDropdownOpen(false);
        window.scrollTo(0,0);
    };

    const handleScoreChange = (category, criteria, value, max) => {
        let val = parseInt(value);
        if (isNaN(val)) val = 0; 
        if (val > max) val = max;
        if (val < 0) val = 0;
        
        setScores(prev => ({
            ...prev,
            [category]: { ...prev[category] || {}, [criteria]: val }
        }));
    };

    const viewPaper = () => {
        if (selectedTeam && selectedTeam.paperLink) {
            window.open(selectedTeam.paperLink, '_blank');
        } else {
            Swal.fire('Info', 'No paper link available for this team.', 'info');
        }
    };

    const viewPoster = () => {
        const fileUrl = `/posters/${selectedTeam.name}.pdf`;
        
        Swal.fire({
            title: `Poster: ${selectedTeam.name}`,
            // WIDTH: PDFs need more width to be readable
            width: '900px', 
            // HTML: Use an iframe to embed the PDF
            html: `
                <div style="height: 600px; width: 100%;">
                    <iframe 
                        src="${fileUrl}" 
                        width="100%" 
                        height="100%" 
                        style="border: none;"
                        title="Team Poster"
                    ></iframe>
                </div>
                <div style="margin-top: 10px;">
                    <a href="${fileUrl}" target="_blank" class="text-uaBlue underline text-sm">
                        Problem viewing? Click here to open in new tab
                    </a>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            // Note: img.onerror does not work on iframes. 
            // If the file is missing, the browser will show its default 404 inside the box.
        });
    };

    const submitScore = async () => {
        const isUpdate = existingScores.some(s => s.teamId === selectedTeam._id);
        const actionText = isUpdate ? "Update Scores" : "Submit Scores";
        
        const result = await Swal.fire({
            title: `${actionText}?`,
            html: `You are about to ${isUpdate ? 'update' : 'submit'} scores for <br/><b style="color:#072758">${selectedTeam.name}</b>`,
            icon: isUpdate ? 'info' : 'question',
            showCancelButton: true,
            confirmButtonColor: '#072758',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${actionText}`
        });

        if (result.isConfirmed) {
            try {
                await api.post('/scores/submit', { teamId: selectedTeam._id, scores });
                await Swal.fire({
                    title: isUpdate ? 'Updated!' : 'Submitted!',
                    text: 'Scores have been recorded successfully.',
                    icon: 'success',
                    confirmButtonColor: '#072758',
                    timer: 1500
                });
                await loadData();
                setSelectedTeam(null);
                setScores({});
                window.scrollTo(0,0);
            } catch (err) {
                Swal.fire('Error', 'Submission failed. Please check your connection.', 'error');
            }
        }
    };

    const filteredTeams = teams.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isGraded = (teamId) => existingScores.some(s => s.teamId === teamId);
    const isEditing = selectedTeam && isGraded(selectedTeam._id);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {selectedTeam && (
                <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         {/* HEADER LOGO */}
                         <div className={`h-12 w-12 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shadow-sm overflow-hidden`}>
                            <img 
                                src={`/teams/${selectedTeam.name}.png`} 
                                alt={selectedTeam.name}
                                className="h-full w-full object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                         </div>
                         <div className="hidden sm:block">
                            <h2 className="text-sm font-bold text-uaBlue leading-tight">{selectedTeam.name}</h2>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {isEditing ? <span className="text-green-600 font-bold flex items-center gap-1"><Edit3 size={10}/> Editing Mode</span> : selectedTeam.projectTitle}
                            </p>
                         </div>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 bg-white border border-gray-300 hover:border-uaBlue text-gray-700 hover:text-uaBlue px-4 py-2 rounded-full shadow-sm transition-all duration-200 text-sm font-medium"
                        >
                            <span>Switch Team</span>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="p-3 border-b border-gray-100 bg-gray-50">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search teams..." 
                                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {filteredTeams.map(team => {
                                        const graded = isGraded(team._id);
                                        return (
                                            <button 
                                                key={team._id}
                                                onClick={() => handleSelectTeam(team)}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 flex items-center gap-3 ${selectedTeam._id === team._id ? 'bg-blue-50 text-uaBlue font-bold' : 'text-gray-700'}`}
                                            >
                                                {/* DROPDOWN LOGO */}
                                                <div className="h-8 w-8 bg-white border border-gray-200 rounded p-0.5 flex-shrink-0">
                                                    <img 
                                                        src={`/teams/${team.name}.png`} 
                                                        className="h-full w-full object-contain"
                                                        onError={(e) => { e.target.style.display='none' }}
                                                    />
                                                </div>
                                                <div className="flex-1 truncate">
                                                    {team.name}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {graded && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">Graded</span>}
                                                    {selectedTeam._id === team._id && <CheckCircle2 size={14} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="container mx-auto max-w-4xl p-4 md:p-6">
                {!selectedTeam ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-uaBlue mb-2">Judge Dashboard</h2>
                            <p className="text-gray-500">Select a research team to begin evaluation</p>
                        </div>
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by team name or title..."
                                className="w-full pl-10 p-3 rounded-xl border border-gray-200 shadow-sm outline-none"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTeams.map((team, idx) => {
                                const graded = isGraded(team._id);
                                return (
                                    <button 
                                        key={team._id} 
                                        onClick={() => handleSelectTeam(team)} 
                                        className={`group p-4 rounded-xl shadow-sm hover:shadow-md border transition-all flex items-start gap-4 relative overflow-hidden text-left h-32
                                            ${graded ? 'bg-blue-50/50 border-green-200' : 'bg-white border-gray-100 hover:border-uaBlue'}`}
                                    >
                                        {graded && (
                                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                                GRADED
                                            </div>
                                        )}
                                        
                                        {/* MAIN GRID LOGO */}
                                        <div className="h-16 w-16 bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            <img 
                                                src={`/teams/${team.name}.png`} 
                                                alt={team.name}
                                                className="h-full w-full object-contain"
                                                onError={(e) => {
                                                    // Fallback to Index Number if Image Fails
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerText = idx + 1;
                                                    e.target.parentElement.classList.add('font-bold', 'text-uaBlue', 'text-xl');
                                                }}
                                            />
                                        </div>

                                        <div className="flex flex-col justify-center h-full">
                                            <h3 className="font-bold text-lg text-uaBlue leading-tight mb-1">{team.name}</h3>
                                            <p className="text-gray-500 text-xs line-clamp-2">{team.projectTitle}</p>
                                        </div>
                                        
                                        {!graded && <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-uaBlue transition-all" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
                        {isEditing && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center gap-3">
                                <Edit3 size={20} />
                                <div>
                                    <p className="font-bold text-sm">Editing Mode</p>
                                    <p className="text-xs">You have already graded this team. Modifying values below will update your previous score.</p>
                                </div>
                            </div>
                        )}

                        <SectionCard 
                            title="Best Paper Criteria" 
                            icon={<Layout className="text-white" size={20} />} 
                            color="bg-uaBlue"
                            action={
                                <button 
                                    onClick={viewPaper}
                                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/40 transition-colors"
                                >
                                    <ExternalLink size={16} /> View Paper
                                </button>
                            }
                        >
                            <Input label="Research Quality & Tech Soundness" max={30} value={scores?.paper?.researchQuality} desc="Clarity of the problem and objectives, strength of theoretical grounding, appropriateness of methodology, and robustness of system design and implementation." onChange={(v) => handleScoreChange('paper', 'researchQuality', v, 30)} />
                            <Input label="Innovation & Originality" max={20} value={scores?.paper?.innovation} desc="Novelty of the idea, creativity of approach, uniqueness of features, and potential to disrupt or improve existing solutions." onChange={(v) => handleScoreChange('paper', 'innovation', v, 20)} />
                            <Input label="Impact, Adoption & Value" max={20} value={scores?.paper?.impact} desc="Relevance to industry, community, or society; feasibility of deployment; successful or potential utilization and adoption." onChange={(v) => handleScoreChange('paper', 'impact', v, 20)} />
                            <Input label="Usability & UX" max={15} value={scores?.paper?.usability} desc="Visual clarity, consistency, accessibility, intuitive interaction, and overall user satisfaction." onChange={(v) => handleScoreChange('paper', 'usability', v, 15)} />
                            <Input label="Evaluation & Validation" max={15} value={scores?.paper?.evaluation} desc="Evidence of testing, user acceptance, performance evaluation, and use of feedback to refine the system." onChange={(v) => handleScoreChange('paper', 'evaluation', v, 15)} />
                        </SectionCard>

                        <SectionCard title="Best Presenter Criteria" icon={<Users className="text-white" size={20} />} color="bg-emerald-600">
                            <Input label="Clarity & Organization" max={20} value={scores?.presenter?.clarity} desc="Logical structure and flow of ideas; clear articulation of objectives, methodology, and results; effective transitions and emphasis on key points." onChange={(v) => handleScoreChange('presenter', 'clarity', v, 20)} />
                            <Input label="Mastery of Content" max={25} value={scores?.presenter?.mastery} desc="Depth of understanding of the research and system; confidence and accuracy in explanations; ability to relate technical details to practical outcomes." onChange={(v) => handleScoreChange('presenter', 'mastery', v, 25)} />
                            <Input label="Panel Defense (Q&A)" max={20} value={scores?.presenter?.panelDefense} desc="Quality, relevance, and depth of responses to panel questions; ability to justify design decisions and research methods; demonstration of analytical thinking and adaptability." onChange={(v) => handleScoreChange('presenter', 'panelDefense', v, 20)} />
                            <Input label="Audio-Visual Aids" max={15} value={scores?.presenter?.visualAids} desc="Accuracy, readability, and professional quality of visual aids; effective use of diagrams and demonstrations; clear voice, pacing, and body language." onChange={(v) => handleScoreChange('presenter', 'visualAids', v, 15)} />
                            <Input label="Time Management" max={10} value={scores?.presenter?.timeManagement} desc="Adherence to the allotted presentation time; balanced coverage of required sections; smooth pacing without rushing or unnecessary delays." onChange={(v) => handleScoreChange('presenter', 'timeManagement', v, 10)} />
                            <Input label="Leadership & Teamwork" max={5} value={scores?.presenter?.leadership} desc="Evidence of effective collaboration; clear role distribution; professionalism, respect, and accountability among team members." onChange={(v) => handleScoreChange('presenter', 'leadership', v, 5)} />
                            <Input label="Research Ethics" max={5} value={scores?.presenter?.ethics} desc="Proper citation and acknowledgment of sources; ethical data handling and reporting; compliance with institutional research and ethical guidelines." onChange={(v) => handleScoreChange('presenter', 'ethics', v, 5)} />
                        </SectionCard>

                        <SectionCard 
                            title="Best Poster Criteria" 
                            icon={<Trophy className="text-white" size={20} />} 
                            color="bg-yellow-600"
                            action={
                                <button onClick={viewPoster} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/40">
                                    <Eye size={16} /> View Poster
                                </button>
                            }
                        >
                            <Input label="Poster Design & Org" max={60} value={scores?.poster?.design} desc="How effective is the poster design in showing the content of the subject and how valuable is each figure or graph in furthering the viewer’s understanding of the subject?" onChange={(v) => handleScoreChange('poster', 'design', v, 60)} />
                            <Input label="Explanation Ability" max={20} value={scores?.poster?.explanation} desc="Familiar with everything that is being covered and confident speaking about the subject matter. Giving a presentation on something implies that the presenter is an expert on the subject." onChange={(v) => handleScoreChange('poster', 'explanation', v, 20)} />
                            <Input label="Clarity of Presentation" max={20} value={scores?.poster?.clarity} desc="Clearness to perception or understanding of presentation." onChange={(v) => handleScoreChange('poster', 'clarity', v, 20)} />
                        </SectionCard>

                        <SectionCard title="Marketing Materials" icon={<Megaphone className="text-white" size={20} />} color="bg-purple-600">
                            <Input label="Clarity of Message" max={25} value={scores?.marketing?.clarity} desc="Message is clear, concise, and easily understood; objectives, key information, and call-to-action are effectively communicated to the target audience." onChange={(v) => handleScoreChange('marketing', 'clarity', v, 25)} />
                            <Input label="Creativity & Visual Impact" max={25} value={scores?.marketing?.creativity} desc="Originality of concept; visual appeal; effective use of color, typography, imagery, and layout to capture attention and sustain interest." onChange={(v) => handleScoreChange('marketing', 'creativity', v, 25)} />
                            <Input label="Relevance to Target" max={20} value={scores?.marketing?.relevance} desc="Content is appropriate, relevant, and tailored to the intended audience; tone, language, and design align with the campaign’s goals." onChange={(v) => handleScoreChange('marketing', 'relevance', v, 20)} />
                            <Input label="Content Accuracy" max={15} value={scores?.marketing?.content} desc="Information is accurate, well-organized, and consistent across all materials; proper grammar, spelling, and branding are observed." onChange={(v) => handleScoreChange('marketing', 'content', v, 15)} />
                            <Input label="Professionalism" max={15} value={scores?.marketing?.professionalism} desc="High production quality; proper formatting and resolution; effective use of tools and platforms; overall professional presentation." onChange={(v) => handleScoreChange('marketing', 'professionalism', v, 15)} />
                        </SectionCard>

                        <div className="pt-6 pb-12">
                            <button 
                                onClick={submitScore} 
                                className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] 
                                    ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-uaBlue hover:bg-blue-900'}`}
                            >
                                <CheckCircle2 /> {isEditing ? "Update Scores" : "Submit Final Scores"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const SectionCard = ({ title, icon, color, action, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`${color} px-6 py-4 flex justify-between items-center`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">{icon}</div>
                <h3 className="font-bold text-white text-lg tracking-wide">{title}</h3>
            </div>
            {action && <div>{action}</div>}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const Input = ({ label, max, desc, onChange, value }) => {
    const [showDesc, setShowDesc] = useState(false);
    const val = value || 0;
    const isMax = val === max;
    const isError = val > max;

    return (
        <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowDesc(!showDesc)}>
                    <ChevronRight size={18} className={`text-gray-400 group-hover:text-uaBlue transition-transform ${showDesc ? 'rotate-90' : ''}`} />
                    <label className="text-sm font-semibold text-gray-700 group-hover:text-uaBlue select-none">{label}</label>
                </div>
                <div className="relative">
                    <input 
                        type="number" max={max} min="0" value={value || ''}
                        className={`w-20 text-center font-bold text-lg border-2 rounded-lg py-1 px-2 outline-none transition-all ${isError ? 'border-red-500 bg-red-50' : isMax ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                        onChange={(e) => onChange(e.target.value)} 
                    />
                    <div className="absolute -bottom-4 right-0 text-[10px] text-gray-400">Max: {max}</div>
                </div>
            </div>
            {showDesc && (
                <div className="ml-7 text-xs text-slate-600 bg-slate-50 p-3 rounded-md border-l-4 border-uaBlue">
                    {desc}
                </div>
            )}
        </div>
    );
};