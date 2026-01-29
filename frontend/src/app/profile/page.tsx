/**
 * Comprehensive Profile Create/Edit Page with all sections
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Save, Plus, X, GraduationCap, Briefcase, Code, Award } from 'lucide-react';

interface Education {
    degree: string;
    field: string;
    university: string;
    location: string;
    start_year: number | string;
    end_year: number | string;
    gpa: number | string;
    achievements: string[];
}

interface Experience {
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    achievements: string[];
    technologies: string[];
}

interface Project {
    name: string;
    description: string;
    technologies: string[];
    link: string;
    github: string;
    start_date: string;
    end_date: string;
}

interface Certification {
    name: string;
    issuer: string;
    date: string;
    expiry_date: string;
    credential_id: string;
    credential_url: string;
}

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: '',
        location: '',
        summary: '',
        skills: [] as string[],
        education: [] as Education[],
        experience: [] as Experience[],
        projects: [] as Project[],
        certifications: [] as Certification[],
    });
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                linkedin: profile.linkedin || '',
                github: profile.github || '',
                portfolio: profile.portfolio || '',
                location: profile.location || '',
                summary: profile.summary || '',
                skills: profile.skills || [],
                education: profile.education || [],
                experience: profile.experience || [],
                projects: profile.projects || [],
                certifications: profile.certifications || [],
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (profile) {
                await profileAPI.update(formData);
                toast.success('Profile updated successfully!');
            } else {
                await profileAPI.create(formData);
                toast.success('Profile created successfully!');
            }
            await refreshProfile();
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    // Skills
    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    // Education
    const addEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, {
                degree: '',
                field: '',
                university: '',
                location: '',
                start_year: '',
                end_year: '',
                gpa: '',
                achievements: []
            }]
        });
    };

    const updateEducation = (index: number, field: keyof Education, value: any) => {
        const updated = [...formData.education];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, education: updated });
    };

    const removeEducation = (index: number) => {
        setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) });
    };

    // Projects
    const addProject = () => {
        setFormData({
            ...formData,
            projects: [...formData.projects, {
                name: '',
                description: '',
                technologies: [],
                link: '',
                github: '',
                start_date: '',
                end_date: ''
            }]
        });
    };

    const updateProject = (index: number, field: keyof Project, value: any) => {
        const updated = [...formData.projects];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, projects: updated });
    };

    const removeProject = (index: number) => {
        setFormData({ ...formData, projects: formData.projects.filter((_, i) => i !== index) });
    };

    // Certifications
    const addCertification = () => {
        setFormData({
            ...formData,
            certifications: [...formData.certifications, {
                name: '',
                issuer: '',
                date: '',
                expiry_date: '',
                credential_id: '',
                credential_url: ''
            }]
        });
    };

    const updateCertification = (index: number, field: keyof Certification, value: any) => {
        const updated = [...formData.certifications];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, certifications: updated });
    };

    const removeCertification = (index: number) => {
        setFormData({ ...formData, certifications: formData.certifications.filter((_, i) => i !== index) });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {profile ? 'Edit Profile' : 'Create Your Profile'}
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Complete your profile to generate optimized resumes
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="San Francisco, CA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="https://linkedin.com/in/johndoe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                                    <input
                                        type="url"
                                        value={formData.github}
                                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="https://github.com/johndoe"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                                <textarea
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Brief summary of your professional background..."
                                />
                            </div>
                        </section>

                        {/* Skills */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                            <div className="flex space-x-2 mb-3">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Add a skill (e.g., Python, React)"
                                />
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.map((skill) => (
                                    <span key={skill} className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                        <span>{skill}</span>
                                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-primary-900">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <GraduationCap className="w-6 h-6 mr-2" />
                                    Education
                                </h2>
                                <button type="button" onClick={addEducation} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Education
                                </button>
                            </div>
                            {formData.education.map((edu, index) => (
                                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between mb-3">
                                        <h3 className="font-medium text-gray-900">Education #{index + 1}</h3>
                                        <button type="button" onClick={() => removeEducation(index)} className="text-red-600 hover:text-red-700">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Degree (e.g., Bachelor of Science)"
                                        />
                                        <input
                                            type="text"
                                            value={edu.field}
                                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Field (e.g., Computer Science)"
                                        />
                                        <input
                                            type="text"
                                            value={edu.university}
                                            onChange={(e) => updateEducation(index, 'university', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="University Name"
                                        />
                                        <input
                                            type="text"
                                            value={edu.location}
                                            onChange={(e) => updateEducation(index, 'location', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Location"
                                        />
                                        <input
                                            type="number"
                                            value={edu.start_year}
                                            onChange={(e) => updateEducation(index, 'start_year', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Start Year"
                                        />
                                        <input
                                            type="number"
                                            value={edu.end_year}
                                            onChange={(e) => updateEducation(index, 'end_year', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="End Year"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={edu.gpa}
                                            onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="GPA (e.g., 3.8)"
                                        />
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Projects */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <Code className="w-6 h-6 mr-2" />
                                    Projects
                                </h2>
                                <button type="button" onClick={addProject} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Project
                                </button>
                            </div>
                            {formData.projects.map((proj, index) => (
                                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between mb-3">
                                        <h3 className="font-medium text-gray-900">Project #{index + 1}</h3>
                                        <button type="button" onClick={() => removeProject(index)} className="text-red-600 hover:text-red-700">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={proj.name}
                                            onChange={(e) => updateProject(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Project Name"
                                        />
                                        <textarea
                                            value={proj.description}
                                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Project Description"
                                            rows={2}
                                        />
                                        <input
                                            type="text"
                                            value={proj.technologies.join(', ')}
                                            onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Technologies (comma-separated, e.g., React, Node.js, MongoDB)"
                                        />
                                        <div className="grid md:grid-cols-2 gap-3">
                                            <input
                                                type="url"
                                                value={proj.github}
                                                onChange={(e) => updateProject(index, 'github', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="GitHub URL"
                                            />
                                            <input
                                                type="url"
                                                value={proj.link}
                                                onChange={(e) => updateProject(index, 'link', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Live Demo URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Certifications */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <Award className="w-6 h-6 mr-2" />
                                    Certifications
                                </h2>
                                <button type="button" onClick={addCertification} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm flex items-center">
                                    <Plus className="w-4 h-4 mr-1" /> Add Certification
                                </button>
                            </div>
                            {formData.certifications.map((cert, index) => (
                                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between mb-3">
                                        <h3 className="font-medium text-gray-900">Certification #{index + 1}</h3>
                                        <button type="button" onClick={() => removeCertification(index)} className="text-red-600 hover:text-red-700">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={cert.name}
                                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Certification Name"
                                        />
                                        <input
                                            type="text"
                                            value={cert.issuer}
                                            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Issuer (e.g., Google, AWS)"
                                        />
                                        <input
                                            type="text"
                                            value={cert.date}
                                            onChange={(e) => updateCertification(index, 'date', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Date Issued (e.g., Jan 2024)"
                                        />
                                        <input
                                            type="url"
                                            value={cert.credential_url}
                                            onChange={(e) => updateCertification(index, 'credential_url', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Credential URL"
                                        />
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Submit */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Save Profile</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
