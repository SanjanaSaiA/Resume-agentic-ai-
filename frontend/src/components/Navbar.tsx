/**
 * Navbar Component
 * Main navigation with all required links
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
    Home,
    User,
    FileText,
    Mail,
    BarChart3,
    Search,
    LayoutDashboard,
    LogOut,
    Menu,
    X
} from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, logout, profile } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const navLinks = [
        { href: '/', label: 'Home', icon: Home, public: true },
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, public: false },
        { href: '/profile', label: 'Profile', icon: User, public: false },
        { href: '/resume-generator', label: 'Resume Generator', icon: FileText, public: false },
        { href: '/cover-letter', label: 'Cover Letter', icon: Mail, public: false },
        { href: '/gap-analyzer', label: 'Gap Analyzer', icon: BarChart3, public: false },
        { href: '/resume-analyzer', label: 'Resume Analyzer', icon: Search, public: false },
    ];

    const visibleLinks = navLinks.filter(link => link.public || isAuthenticated);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                ResumeAI
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {visibleLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={clsx(
                                        'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        {isAuthenticated ? (
                            <button
                                onClick={logout}
                                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2 ml-4">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {visibleLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={clsx(
                                        'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium',
                                        isActive
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    logout();
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <div className="space-y-2 pt-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full px-3 py-2 text-center text-base font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full px-3 py-2 text-center text-base font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
