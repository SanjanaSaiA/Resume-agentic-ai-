/**
 * Resume Analyzer Page
 */
'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Search } from 'lucide-react';

export default function ResumeAnalyzerPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <Search className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Analyzer</h1>
                        <p className="text-xl text-gray-600">
                            Upload and analyze existing resumes for ATS optimization
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <p className="text-center text-gray-600">
                            Resume analysis feature coming soon. Upload your existing resume to get ATS score, strengths, weaknesses, and improvement suggestions.
                        </p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
