/**
 * Resume Generator Page
 * Main feature - generates ATS-optimized resumes with iterative improvement
 */
'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { resumeAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FileText, Link as LinkIcon, Upload, Zap, Target, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ResumeGeneratorPage() {
    const [jobUrl, setJobUrl] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [inputMethod, setInputMethod] = useState<'url' | 'text'>('url');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [progress, setProgress] = useState<string[]>([]);
    const [showLatexModal, setShowLatexModal] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setProgress([]);

        try {
            // Simulate progress updates
            setProgress(['🔍 Extracting job description...']);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setProgress(prev => [...prev, '🤖 Generating initial resume...']);
            await new Promise(resolve => setTimeout(resolve, 1000));

            setProgress(prev => [...prev, '📊 Calculating ATS score...']);

            const data = await resumeAPI.generate({
                job_url: inputMethod === 'url' ? jobUrl : undefined,
                job_description: inputMethod === 'text' ? jobDescription : undefined,
                job_title: jobTitle,
                company_name: companyName,
            });

            setProgress(prev => [...prev, `✅ Optimization complete! ATS Score: ${data.ats_score}%`]);
            setResult(data);
            toast.success(`Resume generated with ${data.ats_score}% ATS score!`);
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Failed to generate resume';
            toast.error(message);
            setProgress(prev => [...prev, `❌ Error: ${message}`]);
        } finally {
            setLoading(false);
        }
    };

    const downloadLatex = () => {
        if (!result) return;
        const blob = new Blob([result.latex_content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${result.job_title}_${result.company_name}.tex`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyLatex = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.latex_content);
        toast.success('LaTeX code copied to clipboard!');
    };



    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Generator</h1>
                        <p className="text-xl text-gray-600">
                            AI-powered resume optimization with iterative improvement loop
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Input Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Details</h2>

                            <form onSubmit={handleGenerate} className="space-y-6">
                                {/* Input Method Toggle */}
                                <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setInputMethod('url')}
                                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${inputMethod === 'url'
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <LinkIcon className="w-4 h-4 inline mr-2" />
                                        Job URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputMethod('text')}
                                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${inputMethod === 'text'
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Paste JD
                                    </button>
                                </div>

                                {/* Job URL or Description */}
                                {inputMethod === 'url' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Posting URL
                                        </label>
                                        <input
                                            type="url"
                                            value={jobUrl}
                                            onChange={(e) => setJobUrl(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="https://example.com/job/12345"
                                            required={inputMethod === 'url'}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Description
                                        </label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Paste the job description here..."
                                            required={inputMethod === 'text'}
                                        />
                                    </div>
                                )}

                                {/* Job Title & Company */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Google"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <LoadingSpinner size="small" />
                                            <span>Generating Resume...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            <span>Generate Optimized Resume</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* How it works */}
                            <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                                <h3 className="font-semibold text-primary-900 mb-2">How it works:</h3>
                                <ul className="space-y-1 text-sm text-primary-800">
                                    <li>• AI extracts job requirements</li>
                                    <li>• Generates tailored resume from your profile</li>
                                    <li>• Calculates ATS compatibility score</li>
                                    <li>• Optimizes until score ≥ 85%</li>
                                    <li>• Maximum 5 iterations</li>
                                </ul>
                            </div>
                        </div>

                        {/* Progress & Results */}
                        <div className="space-y-6">
                            {/* Progress */}
                            {progress.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                                    <div className="space-y-2">
                                        {progress.map((step, idx) => (
                                            <div key={idx} className="flex items-start space-x-2 text-sm">
                                                <span className="text-gray-600">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Results */}
                            {result && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900">Results</h3>
                                        <div className="flex items-center space-x-2 px-4 py-2 bg-success-100 text-success-700 rounded-lg">
                                            <Target className="w-5 h-5" />
                                            <span className="font-semibold">{result.ats_score}% ATS Score</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">Job Position</div>
                                            <div className="font-semibold text-gray-900">
                                                {result.job_title} at {result.company_name}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">Optimization Details</div>
                                            <div className="text-gray-900">
                                                Completed in <span className="font-semibold">{result.iterations}</span> iteration(s)
                                            </div>
                                        </div>

                                        {result.keywords && result.keywords.length > 0 && (
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-600 mb-2">Matched Keywords</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.keywords.slice(0, 10).map((keyword: string, idx: number) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                                                        >
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setShowLatexModal(true)}
                                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <FileText className="w-5 h-5" />
                                                <span>View LaTeX</span>
                                            </button>
                                            <button
                                                onClick={downloadLatex}
                                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                            >
                                                <Upload className="w-5 h-5" />
                                                <span>Download LaTeX</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* LaTeX Viewer Modal */}
                {showLatexModal && result && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h3 className="text-2xl font-bold text-gray-900">LaTeX Resume Code</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={copyLatex}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                                    >
                                        Copy Code
                                    </button>
                                    <button
                                        onClick={() => setShowLatexModal(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto p-6">
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                    <code>{result.latex_content}</code>
                                </pre>
                            </div>
                            <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
                                <strong>Tip:</strong> Copy this LaTeX code and compile it using Overleaf, TeXShop, or any LaTeX editor to generate a PDF.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
