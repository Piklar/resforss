import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Trophy, 
    BarChart3, 
    RefreshCw, 
    Search, 
    Eye, 
    Users, 
    FileText, 
    Layout, 
    Megaphone,
    X,
    Lightbulb,
    Rocket,
    Monitor,
    Mic,
    Image as ImageIcon
} from 'lucide-react';

export default function AdminDashboard() {
    const [rawScores, setRawScores] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null); 
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = () => {
        api.get('/scores/results').then(res => {
            setRawScores(res.data);
            processResults(res.data);
            setLastUpdated(new Date());
        }).catch(err => console.error(err));
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const processResults = (data) => {
        const teamScores = {};
        
        data.forEach(entry => {
            const tid = entry.teamId._id;
            if (!teamScores[tid]) {
                teamScores[tid] = { 
                    id: tid,
                    name: entry.teamId.name,
                    projectTitle: entry.teamId.projectTitle,
                    paperLink: entry.teamId.paperLink,
                    judges: [], 
                    totalPaper: 0, 
                    totalPresenter: 0,
                    totalPoster: 0,
                    totalMarketing: 0,
                    innovation: 0, 
                    breakthrough: 0, 
                    ux: 0, 
                    count: 0 
                };
            }
            
            const p = entry.paper || {};
            const pr = entry.presenter || {};
            const po = entry.poster || {};
            const m = entry.marketing || {};

            // Calculate Totals per Judge
            const judgePaperTotal = (p.researchQuality||0) + (p.innovation||0) + (p.impact||0) + (p.usability||0) + (p.evaluation||0);
            const judgePresenterTotal = (pr.clarity||0) + (pr.mastery||0) + (pr.panelDefense||0) + (pr.visualAids||0) + (pr.timeManagement||0) + (pr.leadership||0) + (pr.ethics||0);
            const judgePosterTotal = (po.design||0) + (po.explanation||0) + (po.clarity||0);
            const judgeMarketingTotal = (m.clarity||0) + (m.creativity||0) + (m.relevance||0) + (m.content||0) + (m.professionalism||0);

            teamScores[tid].judges.push({
                name: entry.judgeId ? entry.judgeId.name : "Unknown Judge",
                scores: entry, 
                totals: {
                    paper: judgePaperTotal,
                    presenter: judgePresenterTotal,
                    poster: judgePosterTotal,
                    marketing: judgeMarketingTotal
                }
            });
            
            // Add to Aggregate Sums
            teamScores[tid].totalPaper += judgePaperTotal;
            teamScores[tid].totalPresenter += judgePresenterTotal;
            teamScores[tid].totalPoster += judgePosterTotal;
            teamScores[tid].totalMarketing += judgeMarketingTotal;

            // Specific Criteria Sums (for Special Awards)
            teamScores[tid].innovation += (p.innovation||0);
            teamScores[tid].breakthrough += (p.innovation||0) + (p.impact||0); // Innovation + Impact
            teamScores[tid].ux += (p.usability||0); // Usability/UX
            teamScores[tid].count++;
        });

        const final = Object.values(teamScores).map(t => ({
            ...t,
            // Calculate Final Averages
            avgPaper: (t.totalPaper / t.count).toFixed(2),
            avgPresenter: (t.totalPresenter / t.count).toFixed(2),
            avgPoster: (t.totalPoster / t.count).toFixed(2),
            avgMarketing: (t.totalMarketing / t.count).toFixed(2),
            
            // Special Awards Averages
            avgInnovation: (t.innovation / t.count).toFixed(2),
            avgBreakthrough: (t.breakthrough / t.count).toFixed(2),
            avgUX: (t.ux / t.count).toFixed(2),
        }));

        setResults(final);
    };

    const filteredResults = results.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="container mx-auto max-w-7xl">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-uaBlue flex items-center gap-2">
                            <BarChart3 /> Admin Analytics
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Live scoring updates. Last synced: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search Team..." 
                                className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-uaBlue"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={fetchData} 
                            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 text-uaBlue font-medium transition-colors"
                        >
                            <RefreshCw size={18} /> Refresh
                        </button>
                    </div>
                </div>

                {/* --- AWARDS SECTION (Based on PDF) --- */}
                <h3 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-yellow-500 pl-3">Award Winners</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* 1. Best Capstone Paper */}
                    <AwardCard icon={<FileText size={24}/>} title="Best Capstone Paper" winner={getWinner(results, 'avgPaper')} sub="Highest Overall Paper Score" />
                    
                    {/* 2. Most Innovative Research */}
                    <AwardCard icon={<Lightbulb size={24}/>} title="Most Innovative Research" winner={getWinner(results, 'avgInnovation')} sub="Highest Innovation Score" />
                    
                    {/* 3. Breakthrough Research Award */}
                    <AwardCard icon={<Rocket size={24}/>} title="Breakthrough Research" winner={getWinner(results, 'avgBreakthrough')} sub="Innovation + Impact" />
                    
                    {/* 4. Best UI/UX Design */}
                    <AwardCard icon={<Monitor size={24}/>} title="Best UI/UX Design" winner={getWinner(results, 'avgUX')} sub="Highest Usability Score" />
                    
                    {/* 5. Best Paper Presenter */}
                    <AwardCard icon={<Mic size={24}/>} title="Best Paper Presenter" winner={getWinner(results, 'avgPresenter')} sub="Highest Presenter Score" />
                    
                    {/* 6. Best Poster - UPDATED TO SHOW TOP 3 */}
                    <AwardCard icon={<ImageIcon size={24}/>} title="Best Poster" winner={getTop3Winners(results, 'avgPoster')} sub="Top 3 Highest Poster Scores" />
                    
                    {/* 7. Best Marketing Materials */}
                    <AwardCard icon={<Megaphone size={24}/>} title="Best Marketing Materials" winner={getWinner(results, 'avgMarketing')} sub="Highest Marketing Score" />
                </div>

                {/* Main Table */}
                <h3 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-uaBlue pl-3">Score Overview</h3>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-uaBlue text-white uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Team</th>
                                    <th className="px-6 py-4 text-center">Judges Scored</th>
                                    <th className="px-6 py-4 text-center bg-white/10">Paper (Avg)</th>
                                    <th className="px-6 py-4 text-center bg-white/10">Presenter (Avg)</th>
                                    <th className="px-6 py-4 text-center bg-white/10">Poster (Avg)</th>
                                    <th className="px-6 py-4 text-center bg-white/10">Marketing (Avg)</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredResults.map((r, i) => (
                                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-white border border-gray-200 p-1 shadow-sm flex-shrink-0">
                                                <img 
                                                    src={`/teams/${r.name}.png`} 
                                                    onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/50?text=IMG"}} 
                                                    alt={r.name} 
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-uaBlue text-lg">{r.name}</div>
                                                <div className="text-gray-500 text-xs line-clamp-1">{r.projectTitle}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {r.count} Judges
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-lg text-yellow-600 bg-yellow-50/50">{r.avgPaper}</td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-lg text-green-600 bg-green-50/50">{r.avgPresenter}</td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-lg text-purple-600 bg-purple-50/50">{r.avgPoster}</td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-lg text-pink-600 bg-pink-50/50">{r.avgMarketing}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setSelectedTeam(r)}
                                                className="text-uaBlue hover:text-blue-700 flex items-center justify-center gap-1 mx-auto font-semibold"
                                            >
                                                <Eye size={16} /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* DETAILED MODAL */}
            {selectedTeam && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="bg-uaBlue p-6 flex items-center gap-4">
                            <div className="h-16 w-16 bg-white rounded-lg p-1">
                                <img 
                                    src={`/teams/${selectedTeam.name}.png`} 
                                    onError={(e) => {e.target.src = "https://via.placeholder.com/50?text=IMG"}} 
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white">{selectedTeam.name}</h2>
                                <p className="text-blue-200 text-sm">{selectedTeam.projectTitle}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedTeam(null)}
                                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Users size={20} /> Judge Breakdown
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedTeam.judges.map((judge, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow-md transition">
                                        <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                                            <div className="h-8 w-8 bg-uaBlue rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                {judge.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-uaBlue">{judge.name}</span>
                                        </div>

                                        <div className="space-y-4 text-sm">
                                            {/* Paper Breakdown */}
                                            <div>
                                                <div className="flex justify-between font-bold text-gray-700">
                                                    <span>Paper</span>
                                                    <span>{judge.totals.paper}/100</span>
                                                </div>
                                                <div className="pl-2 text-xs text-gray-500 space-y-1 mt-1 border-l-2 border-yellow-400">
                                                    <div className="flex justify-between"><span>Research:</span> <span>{judge.scores.paper?.researchQuality || 0}</span></div>
                                                    <div className="flex justify-between"><span>Innovation:</span> <span>{judge.scores.paper?.innovation || 0}</span></div>
                                                    <div className="flex justify-between"><span>Impact:</span> <span>{judge.scores.paper?.impact || 0}</span></div>
                                                    <div className="flex justify-between"><span>Usability/UX:</span> <span>{judge.scores.paper?.usability || 0}</span></div>
                                                </div>
                                            </div>

                                            {/* Presenter Breakdown */}
                                            <div>
                                                <div className="flex justify-between font-bold text-gray-700">
                                                    <span>Presenter</span>
                                                    <span>{judge.totals.presenter}/100</span>
                                                </div>
                                                <div className="pl-2 text-xs text-gray-500 space-y-1 mt-1 border-l-2 border-green-400">
                                                    <div className="flex justify-between"><span>Mastery:</span> <span>{judge.scores.presenter?.mastery || 0}</span></div>
                                                    <div className="flex justify-between"><span>Q&A:</span> <span>{judge.scores.presenter?.panelDefense || 0}</span></div>
                                                </div>
                                            </div>

                                            {/* Poster Breakdown */}
                                            <div className="bg-white p-2 rounded border border-gray-100 flex justify-between font-bold text-gray-700">
                                                <span>Poster</span>
                                                <span>{judge.totals.poster}/100</span>
                                            </div>

                                            {/* Marketing Breakdown */}
                                            <div className="bg-white p-2 rounded border border-gray-100 flex justify-between font-bold text-gray-700">
                                                <span>Marketing</span>
                                                <span>{judge.totals.marketing}/100</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-100 p-4 text-right border-t border-gray-200">
                            <button 
                                onClick={() => setSelectedTeam(null)}
                                className="bg-white border border-gray-300 px-6 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper Components

const getWinner = (list, key) => {
    if (list.length === 0) return "TBD";
    // Sort descending based on the specific key provided
    const sorted = [...list].sort((a, b) => parseFloat(b[key]) - parseFloat(a[key]));
    const winner = sorted[0];
    
    // Safety check in case scores are 0
    if (parseFloat(winner[key]) === 0) return "TBD";

    return (
        <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                <img 
                    src={`/teams/${winner.name}.png`} 
                    onError={(e) => {e.target.src = "https://via.placeholder.com/50?text=IMG"}} 
                    className="h-full w-full object-contain"
                />
            </div>
            <div className="overflow-hidden">
                <span className="block text-lg font-bold truncate text-uaBlue">{winner.name}</span>
                <span className="text-xs font-bold bg-yellow-400/20 text-yellow-700 px-2 py-0.5 rounded border border-yellow-400/50 inline-block">
                    Score: {winner[key]}
                </span>
            </div>
        </div>
    );
};

// NEW FUNCTION: Get Top 3 Winners
const getTop3Winners = (list, key) => {
    if (list.length === 0) return "TBD";
    const sorted = [...list].sort((a, b) => parseFloat(b[key]) - parseFloat(a[key]));
    const top3 = sorted.slice(0, 3);
    
    if (top3.length === 0 || parseFloat(top3[0][key]) === 0) return "TBD";

    return (
        <div className="flex flex-col gap-2 mt-1">
            {top3.map((winner, index) => (
                <div key={index} className="flex items-center gap-3 border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                    <span className="text-gray-300 font-bold text-sm w-3">#{index + 1}</span>
                    <div className="h-8 w-8 rounded-md bg-gray-50 border border-gray-100 p-0.5 flex-shrink-0">
                        <img 
                            src={`/teams/${winner.name}.png`} 
                            onError={(e) => {e.target.src = "https://via.placeholder.com/50?text=IMG"}} 
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="overflow-hidden min-w-0">
                        <span className="block text-sm font-bold truncate text-uaBlue">{winner.name}</span>
                        <span className="text-[10px] font-bold bg-yellow-400/20 text-yellow-700 px-1.5 rounded inline-block">
                            {winner[key]}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const AwardCard = ({ title, winner, sub, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-uaBlue">
            {icon}
        </div>
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            {title}
        </h3>
        <div className="relative z-10">
            {winner}
        </div>
        <p className="text-xs text-gray-400 mt-2 ml-1">{sub}</p>
    </div>
);