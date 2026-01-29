/**
 * Gap Skill Analyzer Page
 * Analyzes skill gaps and provides learning recommendations
 */
'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart3, FileText, Link2, FileEdit, Target, AlertTriangle, CheckCircle2, BookOpen, Award, Clock, TrendingUp, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { gapAnalysisAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Strength {
    skill: string;
    level: string;
    evidence: string;
}

interface PriorityGap {
    skill: string;
    priority: string;
    reason: string;
    time_to_learn: string;
}

interface Recommendation {
    type: string;
    title: string;
    description: string;
    resource: string;
    duration: string;
}

interface Certification {
    name: string;
    provider: string;
    relevance: string;
    cost: string;
    duration: string;
}

interface TrainingCourse {
    name: string;
    platform: string;
    url: string;
    skill_covered: string;
    duration: string;
}

interface GapAnalysis {
    id: number;
    job_title: string | null;
    matching_skills: string[];
    missing_skills: string[];
    priority_gaps: PriorityGap[];
    learning_roadmap: string;
    match_percentage: number;
    created_at: string;
    strengths: Strength[];
    recommendations: Recommendation[];
    certifications_suggested: Certification[];
    training_courses: TrainingCourse[];
}

export default function GapAnalyzerPage() {
    const [loading, setLoading] = useState(false);
    const [inputMethod, setInputMethod] = useState<'url' | 'manual'>('url');
    const [jobUrl, setJobUrl] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
    const [history, setHistory] = useState<GapAnalysis[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        strengths: true,
        gaps: true,
        recommendations: true,
        roadmap: true
    });

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await gapAnalysisAPI.list();
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (inputMethod === 'url' && !jobUrl.trim()) {
            toast.error('Please enter a job URL');
            return;
        }
        if (inputMethod === 'manual' && !jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        setLoading(true);
        setAnalysis(null);

        try {
            const payload = {
                job_url: inputMethod === 'url' ? jobUrl : undefined,
                job_description: inputMethod === 'manual' ? jobDescription : undefined,
                job_title: jobTitle || undefined,
            };

            const result = await gapAnalysisAPI.analyze(payload);
            setAnalysis(result);
            toast.success('Gap analysis completed!');
            loadHistory();
        } catch (error: any) {
            console.error('Analysis error:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to analyze. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const selectHistoryItem = async (id: number) => {
        try {
            const data = await gapAnalysisAPI.getById(id);
            setAnalysis(data);
        } catch (error) {
            toast.error('Failed to load analysis');
        }
    };

    const getMatchColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        if (percentage >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getMatchBgColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        if (percentage >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-4">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Gap Skill Analyzer</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Compare your skills with job requirements and get a personalized learning roadmap
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Input Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                {/* Input Method Toggle */}
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setInputMethod('url')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all ${inputMethod === 'url'
                                            ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Link2 className="w-4 h-4" />
                                        Job URL
                                    </button>
                                    <button
                                        onClick={() => setInputMethod('manual')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all ${inputMethod === 'manual'
                                            ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <FileEdit className="w-4 h-4" />
                                        Manual Entry
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {inputMethod === 'url' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Job Posting URL
                                            </label>
                                            <input
                                                type="url"
                                                value={jobUrl}
                                                onChange={(e) => setJobUrl(e.target.value)}
                                                placeholder="https://linkedin.com/jobs/view/..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    )}

                                    {inputMethod === 'manual' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Job Description
                                            </label>
                                            <textarea
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                placeholder="Paste the full job description here..."
                                                rows={8}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Target className="w-4 h-4 inline mr-1" />
                                            Job Title (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="e.g., Software Engineer at Google"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <button
                                        onClick={handleAnalyze}
                                        disabled={loading}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyzing Skills...
                                            </>
                                        ) : (
                                            <>
                                                <BarChart3 className="w-5 h-5" />
                                                Analyze Skill Gap
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Results Section */}
                            {analysis && (
                                <div className="mt-8 space-y-6">
                                    {/* Match Percentage Card */}
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">Skill Match Analysis</h2>
                                                {analysis.job_title && (
                                                    <p className="text-sm text-gray-500">For: {analysis.job_title}</p>
                                                )}
                                            </div>
                                            <div className={`text-4xl font-bold ${getMatchColor(analysis.match_percentage)}`}>
                                                {analysis.match_percentage}%
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div
                                                className={`h-4 rounded-full transition-all duration-500 ${getMatchBgColor(analysis.match_percentage)}`}
                                                style={{ width: `${analysis.match_percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                                            <span>{analysis.matching_skills.length} skills matched</span>
                                            <span>{analysis.missing_skills.length} skills to develop</span>
                                        </div>
                                    </div>

                                    {/* Strengths Section */}
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('strengths')}
                                            className="w-full p-4 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                <span className="font-semibold text-green-800">Your Strengths ({analysis.matching_skills.length})</span>
                                            </div>
                                            {expandedSections.strengths ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        {expandedSections.strengths && (
                                            <div className="p-4">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {analysis.matching_skills.map((skill, i) => (
                                                        <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                                {analysis.strengths && analysis.strengths.length > 0 && (
                                                    <div className="space-y-2">
                                                        {analysis.strengths.slice(0, 5).map((s, i) => (
                                                            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                                <span className="font-medium">{s.skill}</span>
                                                                <span className="text-sm text-gray-500">{s.level}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Gaps Section */}
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('gaps')}
                                            className="w-full p-4 flex items-center justify-between bg-orange-50 hover:bg-orange-100 transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                                <span className="font-semibold text-orange-800">Skills to Develop ({analysis.missing_skills.length})</span>
                                            </div>
                                            {expandedSections.gaps ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        {expandedSections.gaps && (
                                            <div className="p-4">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {analysis.missing_skills.map((skill, i) => (
                                                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                                {analysis.priority_gaps && analysis.priority_gaps.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h4 className="font-medium text-gray-700">Priority Gaps</h4>
                                                        {analysis.priority_gaps.slice(0, 5).map((gap, i) => (
                                                            <div key={i} className={`p-3 rounded-lg border ${getPriorityColor(gap.priority)}`}>
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-medium">{gap.skill}</span>
                                                                    <span className="text-xs font-semibold uppercase">{gap.priority}</span>
                                                                </div>
                                                                <p className="text-sm opacity-80">{gap.reason}</p>
                                                                <p className="text-xs mt-1 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {gap.time_to_learn}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Recommendations Section */}
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('recommendations')}
                                            className="w-full p-4 flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                                <span className="font-semibold text-blue-800">Recommendations</span>
                                            </div>
                                            {expandedSections.recommendations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        {expandedSections.recommendations && (
                                            <div className="p-4 space-y-6">
                                                {/* Training Courses */}
                                                {analysis.training_courses && analysis.training_courses.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                            <BookOpen className="w-4 h-4" />
                                                            Recommended Courses
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {analysis.training_courses.slice(0, 5).map((course, i) => (
                                                                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-medium text-gray-900">{course.name}</span>
                                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{course.platform}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 mt-1">Skill: {course.skill_covered} • {course.duration}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Certifications */}
                                                {analysis.certifications_suggested && analysis.certifications_suggested.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                            <Award className="w-4 h-4" />
                                                            Suggested Certifications
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {analysis.certifications_suggested.slice(0, 3).map((cert, i) => (
                                                                <div key={i} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-medium text-purple-900">{cert.name}</span>
                                                                        <span className="text-xs text-purple-700">{cert.cost}</span>
                                                                    </div>
                                                                    <p className="text-sm text-purple-700 mt-1">{cert.provider} • {cert.duration}</p>
                                                                    <p className="text-sm text-gray-600 mt-1">{cert.relevance}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* General Recommendations */}
                                                {analysis.recommendations && analysis.recommendations.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                            <TrendingUp className="w-4 h-4" />
                                                            Action Items
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {analysis.recommendations.slice(0, 5).map((rec, i) => (
                                                                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">{rec.type}</span>
                                                                        <span className="font-medium">{rec.title}</span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600">{rec.description}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{rec.resource} • {rec.duration}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Learning Roadmap */}
                                    {analysis.learning_roadmap && (
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                            <button
                                                onClick={() => toggleSection('roadmap')}
                                                className="w-full p-4 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition-all"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                                    <span className="font-semibold text-indigo-800">Learning Roadmap</span>
                                                </div>
                                                {expandedSections.roadmap ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </button>
                                            {expandedSections.roadmap && (
                                                <div className="p-6">
                                                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                                                        {analysis.learning_roadmap}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* History Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        Analysis History
                                    </h3>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    {historyLoading ? (
                                        <div className="p-8 text-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No analyses yet</p>
                                            <p className="text-sm">Run your first gap analysis above!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {history.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => selectHistoryItem(item.id)}
                                                    className={`w-full p-4 text-left hover:bg-purple-50 transition-all ${analysis?.id === item.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {item.job_title || 'Untitled Analysis'}
                                                        </p>
                                                        <span className={`text-sm font-bold ${getMatchColor(item.match_percentage)}`}>
                                                            {item.match_percentage}%
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(item.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
