/**
 * Dashboard Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { resumeAPI } from '@/lib/api';
import Link from 'next/link';
import { FileText, Mail, BarChart3, Search, Plus, Download } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
    const { profile } = useAuth();
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            const data = await resumeAPI.list();
            setResumes(data);
        } catch (error) {
            console.error('Failed to load resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, {profile?.full_name || 'User'}!
                        </h1>
                        <p className="text-primary-100">
                            Ready to optimize your resume and land your dream job?
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            {
                                title: 'Generate Resume',
                                description: 'Create ATS-optimized resume',
                                icon: FileText,
                                href: '/resume-generator',
                                color: 'primary',
                            },
                            {
                                title: 'Cover Letter',
                                description: 'Generate cover letter',
                                icon: Mail,
                                href: '/cover-letter',
                                color: 'success',
                            },
                            {
                                title: 'Gap Analyzer',
                                description: 'Analyze skill gaps',
                                icon: BarChart3,
                                href: '/gap-analyzer',
                                color: 'warning',
                            },
                            {
                                title: 'Resume Analyzer',
                                description: 'Analyze existing resume',
                                icon: Search,
                                href: '/resume-analyzer',
                                color: 'error',
                            },
                        ].map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                                >
                                    <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-6 h-6 text-${action.color}-600`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
                                    <p className="text-sm text-gray-600">{action.description}</p>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Recent Resumes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Your Resumes</h2>
                            <Link
                                href="/resume-generator"
                                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Resume</span>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <LoadingSpinner size="large" />
                            </div>
                        ) : resumes.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes yet</h3>
                                <p className="text-gray-600 mb-4">Create your first optimized resume</p>
                                <Link
                                    href="/resume-generator"
                                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Generate Resume
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {resumes.map((resume) => (
                                    <div
                                        key={resume.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{resume.job_title}</h3>
                                            <p className="text-sm text-gray-600">{resume.company_name}</p>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="text-sm text-gray-500">
                                                    ATS Score: <span className="font-semibold text-primary-600">{resume.ats_score}%</span>
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Iterations: {resume.iterations}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/resume/${resume.id}`}
                                            className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>View</span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
