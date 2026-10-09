import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { logoutUser, updateProfile } from '@/features/auth/store/authSlice';
import { LogOut, User, Mail, MapPin, Phone, Edit2, Save, X } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: '',
        phoneNumber: '',
        preferredCity: ''
    });

    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    React.useEffect(() => {
        if (user) {
            setEditForm({
                fullName: user.name || '',
                phoneNumber: user.phone || '',
                preferredCity: user.location || ''
            });
        }
    }, [user]);

    if (!user) return null;

    const handleSave = async () => {
        const payload = {
            fullName: editForm.fullName,
            email: user.email,
            phoneNumber: editForm.phoneNumber,
            preferredCity: editForm.preferredCity,
            profilePictureUrl: user.profilePictureUrl || "",
        };
        await dispatch(updateProfile(payload) as any);
        setIsEditing(false);
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl" style={{ marginTop: '120px', minHeight: '60vh' }}>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-serif text-ink">My Account</h1>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest font-semibold text-gold hover:text-ink transition-colors"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-1 text-sm font-sans uppercase tracking-widest font-semibold text-taupe hover:text-ink transition-colors"
                        >
                            <X size={16} /> Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-1 text-sm font-sans uppercase tracking-widest font-semibold text-white bg-gold px-4 py-2 rounded-full hover:bg-gold-dark transition-colors"
                        >
                            <Save size={16} /> Save
                        </button>
                    </div>
                )}
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-sand p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-ivory to-sand/30 z-0"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10 mt-6">
                    <div className="shrink-0">
                        {user.profilePictureUrl ? (
                            <img 
                                src={user.profilePictureUrl} 
                                alt={user.name} 
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-white border-4 border-sand shadow-sm flex items-center justify-center">
                                <User size={48} className="text-gold" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left pt-2 w-full">
                        {isEditing ? (
                            <div className="mb-2">
                                <input 
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                    className="text-3xl font-serif text-ink font-semibold bg-ivory/50 border border-sand rounded-xl px-4 py-2 w-full md:w-auto outline-none focus:border-gold transition-colors"
                                    placeholder="Full Name"
                                />
                            </div>
                        ) : (
                            <h2 className="text-3xl font-serif text-ink font-semibold">{user.name}</h2>
                        )}
                        <p className="text-sm font-sans tracking-widest text-gold mt-1 uppercase">
                            {user.role}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-ivory/50 border border-sand/50 justify-center md:justify-start">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                    <Mail size={18} className="text-gold" />
                                </div>
                                <div className="text-left w-full">
                                    <p className="text-[0.65rem] uppercase tracking-widest text-taupe font-sans">Email Address</p>
                                    <p className="text-sm font-sans text-ink font-medium">{user.email || 'Not provided'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-ivory/50 border border-sand/50 justify-center md:justify-start">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                    <Phone size={18} className="text-gold" />
                                </div>
                                <div className="text-left w-full">
                                    <p className="text-[0.65rem] uppercase tracking-widest text-taupe font-sans">Phone Number</p>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            value={editForm.phoneNumber}
                                            onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                                            className="text-sm font-sans text-ink font-medium bg-white border border-sand rounded-lg px-3 py-1 w-full mt-1 outline-none focus:border-gold transition-colors"
                                            placeholder="e.g. +91 9876543210"
                                        />
                                    ) : (
                                        <p className="text-sm font-sans text-ink font-medium">{user.phone || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-ivory/50 border border-sand/50 justify-center md:justify-start">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                    <MapPin size={18} className="text-gold" />
                                </div>
                                <div className="text-left w-full">
                                    <p className="text-[0.65rem] uppercase tracking-widest text-taupe font-sans">Location</p>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            value={editForm.preferredCity}
                                            onChange={(e) => setEditForm({...editForm, preferredCity: e.target.value})}
                                            className="text-sm font-sans text-ink font-medium bg-white border border-sand rounded-lg px-3 py-1 w-full mt-1 outline-none focus:border-gold transition-colors"
                                            placeholder="e.g. Mumbai"
                                        />
                                    ) : (
                                        <p className="text-sm font-sans text-ink font-medium">{user.location || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-sand flex justify-center md:justify-start">
                            <button
                                onClick={() => dispatch(logoutUser() as any)}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-coral text-white font-sans text-xs tracking-[0.15em] uppercase font-semibold hover:bg-opacity-90 transition-all shadow-sm"
                            >
                                <LogOut size={16} />
                                Logout securely
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
