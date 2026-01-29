/**
 * Home/Landing Page
 * Explains how ResumeAI works with step-by-step flow
 */
import Link from 'next/link';
import { FileText, Zap, Target, Download, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Get Your Resume <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">ATS-Ready</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            AI-powered resume optimization with iterative improvement loops. Achieve 85%+ ATS scores automatically.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                            >
                                How It Works
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How ResumeAI Works</h2>
                        <p className="text-xl text-gray-600">Our AI agents work together to optimize your resume</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                step: '1',
                                title: 'Extract Job Requirements',
                                description: 'Paste job URL or upload JD. Our AI extracts key requirements and keywords.',
                                icon: FileText,
                            },
                            {
                                step: '2',
                                title: 'Generate Tailored Resume',
                                description: 'AI creates a resume matching the job description using your profile.',
                                icon: Zap,
                            },
                            {
                                step: '3',
                                title: 'Calculate ATS Score',
                                description: 'Hybrid scoring system evaluates keyword match and relevance.',
                                icon: Target,
                            },
                            {
                                step: '4',
                                title: 'Optimize Until 85%+',
                                description: 'If score < 85%, AI optimizes and rescores in a loop until target reached.',
                                icon: CheckCircle2,
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.step} className="relative">
                                    <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100 hover:shadow-lg transition-shadow">
                                        <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-xl mb-4">
                                            {item.step}
                                        </div>
                                        <Icon className="w-8 h-8 text-primary-600 mb-3" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ATS Optimization Explanation */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-6">The Optimization Loop</h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Unlike simple resume builders, ResumeAI uses an intelligent optimization loop powered by specialized AI agents:
                            </p>
                            <div className="space-y-4">
                                {[
                                    'JD Extractor Agent parses job requirements',
                                    'Resume Generator creates tailored content',
                                    'ATS Scorer calculates compatibility (0-100)',
                                    'Optimizer Agent improves weak areas',
                                    'Loop continues until score ≥ 85%',
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start space-x-3">
                                        <CheckCircle2 className="w-6 h-6 text-success-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                            <div className="font-mono text-sm">
                                <div className="text-primary-600 mb-2">// Optimization Loop</div>
                                <div className="text-gray-800">
                                    <span className="text-purple-600">while</span> (ats_score &lt; <span className="text-orange-600">85%</span> && iterations &lt; <span className="text-orange-600">5</span>) {'{'}
                                </div>
                                <div className="ml-4 text-gray-600">
                                    resume = <span className="text-blue-600">generate_resume</span>(job, profile);
                                </div>
                                <div className="ml-4 text-gray-600">
                                    score = <span className="text-blue-600">calculate_ats_score</span>(resume, job);
                                </div>
                                <div className="ml-4 text-gray-800">
                                    <span className="text-purple-600">if</span> (score &lt; <span className="text-orange-600">85%</span>) {'{'}
                                </div>
                                <div className="ml-8 text-gray-600">
                                    resume = <span className="text-blue-600">optimize_resume</span>(resume, feedback);
                                </div>
                                <div className="ml-8 text-gray-600">
                                    iterations++;
                                </div>
                                <div className="ml-4 text-gray-800">{'}'}</div>
                                <div className="text-gray-800">{'}'}</div>
                                <div className="text-purple-600 mt-2">return</div> <span className="text-gray-800">final_resume;</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">All-in-One Platform</h2>
                        <p className="text-xl text-gray-600">Everything you need for your job search</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'Resume Generator',
                                description: 'AI-optimized resumes with 85%+ ATS scores',
                                link: '/resume-generator',
                            },
                            {
                                title: 'Cover Letter',
                                description: 'Role-specific, ATS-optimized cover letters',
                                link: '/cover-letter',
                            },
                            {
                                title: 'Gap Analyzer',
                                description: 'Identify missing skills with learning roadmap',
                                link: '/gap-analyzer',
                            },
                            {
                                title: 'Resume Analyzer',
                                description: 'Analyze existing resumes for improvements',
                                link: '/resume-analyzer',
                            },
                        ].map((feature) => (
                            <Link
                                key={feature.title}
                                href={feature.link}
                                className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:border-primary-300 group"
                            >
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 mb-4">{feature.description}</p>
                                <div className="flex items-center text-primary-600 font-medium">
                                    Learn more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Land Your Dream Job?</h2>
                    <p className="text-xl mb-8 text-primary-100">
                        Join thousands of job seekers using AI to optimize their resumes
                    </p>
                    <Link
                        href="/register"
                        className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Get Started Free
                    </Link>
                    <p className="mt-4 text-primary-200 text-sm">100% Free • No Credit Card Required • Open Source</p>
                </div>
            </section>
        </div>
    );
}
