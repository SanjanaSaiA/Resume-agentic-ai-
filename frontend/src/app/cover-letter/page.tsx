/**
 * Cover Letter Generator Page
 * Generates AI-powered cover letters based on job description and user profile
 */
'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Mail, FileText, Link2, FileEdit, Copy, Download, Clock, Building2, Briefcase, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { coverLetterAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

interface CoverLetter {
    id: number;
    content: string;
    job_title: string | null;
    company_name: string | null;
    created_at: string;
}

export default function CoverLetterPage() {
    const [loading, setLoading] = useState(false);
    const [inputMethod, setInputMethod] = useState<'url' | 'manual'>('url');
    const [jobUrl, setJobUrl] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [generatedCoverLetter, setGeneratedCoverLetter] = useState<CoverLetter | null>(null);
    const [coverLetterHistory, setCoverLetterHistory] = useState<CoverLetter[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Load cover letter history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const history = await coverLetterAPI.list();
            setCoverLetterHistory(history);
        } catch (error) {
            console.error('Failed to load cover letter history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleGenerate = async () => {
        // Validate input
        if (inputMethod === 'url' && !jobUrl.trim()) {
            toast.error('Please enter a job URL');
            return;
        }
        if (inputMethod === 'manual' && !jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        setLoading(true);
        setGeneratedCoverLetter(null);

        try {
            const payload = {
                job_url: inputMethod === 'url' ? jobUrl : undefined,
                job_description: inputMethod === 'manual' ? jobDescription : undefined,
                job_title: jobTitle || undefined,
                company_name: companyName || undefined,
            };

            const result = await coverLetterAPI.generate(payload);
            setGeneratedCoverLetter(result);
            toast.success('Cover letter generated successfully!');

            // Refresh history
            loadHistory();
        } catch (error: any) {
            console.error('Generation error:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to generate cover letter. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (generatedCoverLetter?.content) {
            await navigator.clipboard.writeText(generatedCoverLetter.content);
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (generatedCoverLetter?.content) {
            try {
                // Create PDF document
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                // Set font
                doc.setFont('helvetica', 'normal');

                // Add title
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Cover Letter', 105, 20, { align: 'center' });

                // Add job info if available
                if (generatedCoverLetter.job_title || generatedCoverLetter.company_name) {
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'italic');
                    const jobInfo = `For: ${generatedCoverLetter.job_title || 'Position'}${generatedCoverLetter.company_name ? ` at ${generatedCoverLetter.company_name}` : ''}`;
                    doc.text(jobInfo, 105, 28, { align: 'center' });
                }

                // Add horizontal line
                doc.setDrawColor(100, 100, 100);
                doc.line(20, 33, 190, 33);

                // Set content font
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);

                // Split content into lines that fit the page width
                const content = generatedCoverLetter.content;
                const pageWidth = 170; // mm (A4 width - margins)
                const lineHeight = 6; // mm
                let yPosition = 45;
                const maxY = 280; // Leave margin at bottom

                // Split by paragraphs first, then by line width
                const paragraphs = content.split('\n');

                paragraphs.forEach((paragraph: string) => {
                    if (paragraph.trim() === '') {
                        yPosition += lineHeight / 2; // Half line for empty paragraphs
                        return;
                    }

                    const lines = doc.splitTextToSize(paragraph.trim(), pageWidth);

                    lines.forEach((line: string) => {
                        // Check if we need a new page
                        if (yPosition > maxY) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(line, 20, yPosition);
                        yPosition += lineHeight;
                    });

                    yPosition += lineHeight / 2; // Extra space between paragraphs
                });

                // Generate filename
                const filename = `Cover_Letter_${(generatedCoverLetter.job_title || 'generated').replace(/\s+/g, '_')}_${(generatedCoverLetter.company_name || '').replace(/\s+/g, '_')}.pdf`;

                // Save the PDF
                doc.save(filename);
                toast.success('Cover letter downloaded as PDF!');
            } catch (error) {
                console.error('PDF generation error:', error);
                toast.error('Failed to generate PDF. Downloading as text instead.');
                // Fallback to text download
                const blob = new Blob([generatedCoverLetter.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cover_letter_${generatedCoverLetter.job_title?.replace(/\s+/g, '_') || 'generated'}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
    };

    const selectHistoryItem = async (id: number) => {
        try {
            const letter = await coverLetterAPI.getById(id);
            setGeneratedCoverLetter(letter);
        } catch (error) {
            toast.error('Failed to load cover letter');
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cover Letter Generator</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Generate personalized, professional cover letters tailored to specific job postings using AI
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
                                            ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Link2 className="w-4 h-4" />
                                        Job URL
                                    </button>
                                    <button
                                        onClick={() => setInputMethod('manual')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all ${inputMethod === 'manual'
                                            ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <FileEdit className="w-4 h-4" />
                                        Manual Entry
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* URL Input */}
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
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            />
                                            <p className="mt-2 text-sm text-gray-500">
                                                Paste the URL of the job posting from LinkedIn, Indeed, or any job board
                                            </p>
                                        </div>
                                    )}

                                    {/* Manual Input */}
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
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                            />
                                        </div>
                                    )}

                                    {/* Optional Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Briefcase className="w-4 h-4 inline mr-1" />
                                                Job Title (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                                placeholder="e.g., Software Engineer"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Building2 className="w-4 h-4 inline mr-1" />
                                                Company Name (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                placeholder="e.g., Google"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Generating Cover Letter...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-5 h-5" />
                                                Generate Cover Letter
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Generated Cover Letter Display */}
                            {generatedCoverLetter && (
                                <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                Generated Cover Letter
                                            </h2>
                                            {generatedCoverLetter.job_title && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    For: {generatedCoverLetter.job_title}
                                                    {generatedCoverLetter.company_name && ` at ${generatedCoverLetter.company_name}`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCopy}
                                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                                            >
                                                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                                            {generatedCoverLetter.content}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* History Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        Recent Cover Letters
                                    </h3>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    {historyLoading ? (
                                        <div className="p-8 text-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : coverLetterHistory.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No cover letters yet</p>
                                            <p className="text-sm">Generate your first cover letter above!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {coverLetterHistory.map((letter) => (
                                                <button
                                                    key={letter.id}
                                                    onClick={() => selectHistoryItem(letter.id)}
                                                    className={`w-full p-4 text-left hover:bg-indigo-50 transition-all ${generatedCoverLetter?.id === letter.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                                                        }`}
                                                >
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {letter.job_title || 'Untitled Position'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {letter.company_name || 'Unknown Company'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(letter.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
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
