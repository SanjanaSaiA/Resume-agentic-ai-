/**
 * Footer Component
 */
import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold text-white mb-4">ResumeAI</h3>
                        <p className="text-gray-400 mb-4">
                            AI-powered resume optimization platform. Get your resume ATS-ready with our intelligent agents.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Features</h4>
                        <ul className="space-y-2">
                            <li><Link href="/resume-generator" className="hover:text-white transition-colors">Resume Generator</Link></li>
                            <li><Link href="/cover-letter" className="hover:text-white transition-colors">Cover Letter</Link></li>
                            <li><Link href="/gap-analyzer" className="hover:text-white transition-colors">Gap Analyzer</Link></li>
                            <li><Link href="/resume-analyzer" className="hover:text-white transition-colors">Resume Analyzer</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-white transition-colors">About</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">How It Works</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} ResumeAI. Built with Next.js, FastAPI, and Google ADK. All rights reserved.</p>
                    <p className="text-sm mt-2">100% Free & Open Source</p>
                </div>
            </div>
        </footer>
    );
}
