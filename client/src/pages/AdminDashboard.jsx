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
    X
} from 'lucide-react';

export default function AdminDashboard() {
    const [rawScores, setRawScores] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null); // For the detailed modal
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
        // Optional: Auto-refresh every 30 seconds
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
                    judges: [], // To store individual judge breakdowns
                    // Aggregators
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

            // Calculate Judge Totals
            const judgePaperTotal = (p.researchQuality||0) + (p.innovation||0) + (p.impact||0) + (p.usability||0) + (p.evaluation||0);
            const judgePresenterTotal = (pr.clarity||0) + (pr.mastery||0) + (pr.panelDefense||0) + (pr.visualAids||0) + (pr.timeManagement||0) + (pr.leadership||0) + (pr.ethics||0);
            const judgePosterTotal = (po.design||0) + (po.explanation||0) + (po.clarity||0);
            const judgeMarketingTotal = (m.clarity||0) + (m.creativity||0) + (m.relevance||0) + (m.content||0) + (m.professionalism||0);

            // Add to Judges List for Breakdown
            teamScores[tid].judges.push({
                name: entry.judgeId ? entry.judgeId.name : "Unknown Judge",
                scores: entry, // Keep raw scores for modal
                totals: {
                    paper: judgePaperTotal,
                    presenter: judgePresenterTotal,
                    poster: judgePosterTotal,
                    marketing: judgeMarketingTotal
                }
            });
            
            // Add to Aggregates
            teamScores[tid].totalPaper += judgePaperTotal;
            teamScores[tid].totalPresenter += judgePresenterTotal;
            teamScores[tid].totalPoster += judgePosterTotal;
            teamScores[tid].totalMarketing += judgeMarketingTotal;

            teamScores[tid].innovation += (p.innovation||0);
            teamScores[tid].breakthrough += (p.innovation||0) + (p.impact||0);
            teamScores[tid].ux += (p.usability||0);
            teamScores[tid].count++;
        });

        // Calculate Final Averages
        const final = Object.values(teamScores).map(t => ({
            ...t,
            avgPaper: (t.totalPaper / t.count).toFixed(2),
            avgPresenter: (t.totalPresenter / t.count).toFixed(2),
            avgPoster: (t.totalPoster / t.count).toFixed(2),
            avgMarketing: (t.totalMarketing / t.count).toFixed(2),
            
            avgInnovation: (t.innovation / t.count).toFixed(2),
            avgBreakthrough: (t.breakthrough / t.count).toFixed(2),
            avgUX: (t.ux / t.count).toFixed(2),
        }));

        setResults(final);
    };

    // Filter for search
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

                {/* Awards Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AwardCard icon={<FileText size={24}/>} title="Best Capstone Paper" winner={getWinner(results, 'avgPaper')} sub="Highest Paper Score" />
                    <AwardCard icon={<Users size={24}/>} title="Best Presenter" winner={getWinner(results, 'avgPresenter')} sub="Highest Presentation Score" />
                    <AwardCard icon={<Layout size={24}/>} title="Best Poster" winner={getWinner(results, 'avgPoster')} sub="Highest Poster Score" />
                    <AwardCard icon={<Trophy size={24}/>} title="Most Innovative" winner={getWinner(results, 'avgInnovation')} sub="Highest Innovation Criteria" />
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-uaBlue text-white uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Team</th>
                                    <th className="px-6 py-4 text-center">Judges Scored</th>
                                    <th className="px-6 py-4 text-center text-yellow-300">Paper (Avg)</th>
                                    <th className="px-6 py-4 text-center text-green-300">Presenter (Avg)</th>
                                    <th className="px-6 py-4 text-center text-purple-300">Poster (Avg)</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredResults.map((r, i) => (
                                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-uaBlue text-lg">{r.name}</div>
                                            <div className="text-gray-500 text-xs">{r.projectTitle}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {r.count} Judges
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-lg">{r.avgPaper}</td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-lg">{r.avgPresenter}</td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-lg">{r.avgPoster}</td>
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
                                {filteredResults.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-500">No scores submitted yet.</td>
                                    </tr>
                                )}
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
                        <div className="bg-uaBlue p-6 flex justify-between items-start">
                            <div>
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

                        {/* Modal Body (Scrollable) */}
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

                                        <div className="space-y-3 text-sm">
                                            {/* Paper Breakdown */}
                                            <div>
                                                <div className="flex justify-between font-bold text-gray-700">
                                                    <span>Paper</span>
                                                    <span>{judge.totals.paper}/100</span>
                                                </div>
                                                <div className="pl-2 text-xs text-gray-500 space-y-1 mt-1 border-l-2 border-gray-300">
                                                    <div className="flex justify-between"><span>Research:</span> <span>{judge.scores.paper?.researchQuality}</span></div>
                                                    <div className="flex justify-between"><span>Innovation:</span> <span>{judge.scores.paper?.innovation}</span></div>
                                                    <div className="flex justify-between"><span>Impact:</span> <span>{judge.scores.paper?.impact}</span></div>
                                                </div>
                                            </div>

                                            {/* Presenter Breakdown */}
                                            <div>
                                                <div className="flex justify-between font-bold text-gray-700">
                                                    <span>Presenter</span>
                                                    <span>{judge.totals.presenter}/100</span>
                                                </div>
                                                <div className="pl-2 text-xs text-gray-500 space-y-1 mt-1 border-l-2 border-green-300">
                                                    <div className="flex justify-between"><span>Mastery:</span> <span>{judge.scores.presenter?.mastery}</span></div>
                                                    <div className="flex justify-between"><span>Q&A:</span> <span>{judge.scores.presenter?.panelDefense}</span></div>
                                                </div>
                                            </div>

                                            {/* Poster Breakdown */}
                                            <div>
                                                <div className="flex justify-between font-bold text-gray-700">
                                                    <span>Poster</span>
                                                    <span>{judge.totals.poster}/100</span>
                                                </div>
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
    const sorted = [...list].sort((a, b) => parseFloat(b[key]) - parseFloat(a[key]));
    const winner = sorted[0];
    return (
        <div>
            <span className="block text-xl font-bold truncate">{winner.name}</span>
            <span className="text-sm font-bold bg-yellow-400/20 text-yellow-700 px-2 py-0.5 rounded border border-yellow-400/50 inline-block mt-1">
                Score: {winner[key]}
            </span>
        </div>
    );
};

const AwardCard = ({ title, winner, sub, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-uaBlue">
            {icon}
        </div>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            {title}
        </h3>
        <div className="text-uaBlue mb-1 relative z-10">
            {winner}
        </div>
        <p className="text-xs text-gray-400 mt-2">{sub}</p>
    </div>
);