
import React, { useState } from 'react';
import { X, Mail, Shield, AlertTriangle, Loader2, CheckCircle2, Lock, Phone } from 'lucide-react';
import { auth, db, doc, updateDoc, collection, query, where, getDocs, writeBatch, googleProvider, signInWithRedirect } from '../firebase';
import { deleteUser, updateEmail, reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup, verifyBeforeUpdateEmail } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, user }) => {
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || '');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState<'email' | 'delete' | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isGoogleUser = user?.providerData?.some((p: any) => p.providerId === 'google.com');
  const isPhoneUser = !!user?.phoneNumber || user?.providerData?.some((p: any) => p.providerId === 'phone') || (!user?.email && !!user?.phoneNumber);

  const handleReauthenticate = async () => {
    setError(null);
    try {
      if (isGoogleUser) {
        await reauthenticateWithPopup(auth.currentUser!, googleProvider);
      } else {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(auth.currentUser!, credential);
      }
      
      const action = showReauthModal;
      setShowReauthModal(null);
      setPassword('');
      
      if (action === 'email') {
        await performEmailUpdate();
      } else if (action === 'delete') {
        await performAccountDeletion();
      }
    } catch (err: any) {
      setError(err.message || 'Re-authentication failed. Please check your password.');
    }
  };

  const performEmailUpdate = async () => {
    setIsUpdatingEmail(true);
    try {
      await verifyBeforeUpdateEmail(auth.currentUser!, newEmail);
      await updateDoc(doc(db, 'users', user.uid), { email: newEmail });
      setSuccess('A verification email has been sent to your new address. Please verify it to complete the update.');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setShowReauthModal('email');
      } else {
        setError(err.message);
      }
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user.email) return;
    setError(null);
    setSuccess(null);
    
    if (isGoogleUser) {
      setError('Email addresses for Google accounts must be managed through Google Settings.');
      return;
    }

    await performEmailUpdate();
  };

  const handleUpdatePhone = async () => {
    if (!newPhone || newPhone === user?.phoneNumber) return;
    setError(null);
    setSuccess(null);
    setIsUpdatingPhone(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        phoneNumber: newPhone,
        lastUpdated: new Date().toISOString()
      });
      setSuccess('Phone number updated successfully in your profile.');
    } catch (err: any) {
      setError(err.message || 'Failed to update phone number.');
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const performAccountDeletion = async () => {
    setIsDeletingAccount(true);
    try {
      const uid = user.uid;
      const batch = writeBatch(db);
      
      // 1. Delete user document
      batch.delete(doc(db, 'users', uid));
      
      // 2. Clean up classes and student associations
      const classesRef = collection(db, 'classes');
      const qTeacher = query(classesRef, where('teacherId', '==', uid));
      const qStudent = query(classesRef, where('studentIds', 'array-contains', uid));
      
      const [teacherSnap, studentSnap] = await Promise.all([
        getDocs(qTeacher),
        getDocs(qStudent)
      ]);

      // If teacher: delete all classes they own
      for (const d of teacherSnap.docs) {
        batch.delete(d.ref);
        const alertsRef = collection(db, 'classes', d.id, 'alerts');
        const alertsSnap = await getDocs(alertsRef);
        alertsSnap.docs.forEach(ad => batch.delete(ad.ref));
      }

      // If student: remove from all classes
      studentSnap.docs.forEach(d => {
        const studentIds = (d.data().studentIds || []).filter((id: string) => id !== uid);
        batch.update(d.ref, { studentIds });
      });

      // 3. Clean up certifier requests for this user
      const certifierRequestsRef = collection(db, 'certifierRequests');
      const qCertifier = query(certifierRequestsRef, where('userId', '==', uid));
      const certifierSnap = await getDocs(qCertifier);
      certifierSnap.docs.forEach(cd => batch.delete(cd.ref));

      // 4. Credentials are server-managed
      // Note: User credentials records are secured with server-only write rules

      // 5. Delete alerts created by this user
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
      if (!userDoc.empty) {
        const uData = userDoc.docs[0].data();
        if (uData.classId) {
          const userAlertsRef = collection(db, 'classes', uData.classId, 'alerts');
          const userAlertsSnap = await getDocs(query(userAlertsRef, where('userId', '==', uid)));
          userAlertsSnap.docs.forEach(ad => batch.delete(ad.ref));
        }
      }

      await batch.commit();
      await deleteUser(auth.currentUser!);
      onClose();
      window.location.reload();
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setShowReauthModal('delete');
      } else {
        setError(err.message);
      }
      setIsDeletingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    await performAccountDeletion();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl overflow-hidden relative"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F4F8FA] border border-[#7F7FFA]/20 rounded-xl flex items-center justify-center text-[#7F7FFA]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-[#3C3C3C] tracking-tight">Account Settings</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Email or Phone Section */}
          {isPhoneUser ? (
            <div className="space-y-4">
              <label htmlFor="settings-phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    id="settings-phone"
                    type="tel" 
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-[#7F7FFA] focus:bg-white transition-all outline-none text-[#3C3C3C]"
                    placeholder="+1234567890"
                  />
                </div>
                <button 
                  onClick={handleUpdatePhone}
                  disabled={isUpdatingPhone || !newPhone || newPhone === user?.phoneNumber}
                  className="px-6 py-4 bg-[#7F7FFA] text-white font-bold rounded-xl hover:bg-[#6868EB] transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {isUpdatingPhone ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic ml-1">
                Signed up with phone number. Enter full format including country code (e.g. +1234567890).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <label htmlFor="settings-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    id="settings-email"
                    type="email" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isGoogleUser}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-[#7F7FFA] focus:bg-white transition-all outline-none disabled:opacity-50 text-[#3C3C3C]"
                    placeholder={isGoogleUser ? 'Managed via Google' : 'Enter new email'}
                  />
                </div>
                {!isGoogleUser && (
                  <button 
                    onClick={handleUpdateEmail}
                    disabled={isUpdatingEmail || newEmail === user?.email}
                    className="px-6 py-4 bg-[#7F7FFA] text-white font-bold rounded-xl hover:bg-[#6868EB] transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {isUpdatingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update'}
                  </button>
                )}
              </div>
              {isGoogleUser && (
                <p className="text-[10px] text-slate-400 font-medium italic ml-1">
                  Linked to Google Account. Changes must be made in your Google settings.
                </p>
              )}
            </div>
          )}

          {/* Contact Support & Data Requests */}
          <div className="p-6 bg-[#F4F8FA] rounded-3xl border border-slate-200/60 flex flex-col items-center text-center gap-4">
            <div>
              <h4 className="text-sm font-black text-[#3C3C3C] mb-1">Data, Privacy & Support</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Please email us at support@begin-fin.com for data download and/or deletion requests as well as user support.
              </p>
            </div>
            <a 
              href="mailto:support@begin-fin.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#7F7FFA] text-white rounded-xl text-xs font-bold hover:bg-[#6868EB] transition-all shadow-sm"
            >
              <Mail className="w-4 h-4" /> Email Support
            </a>
          </div>
        </div>

        {/* Re-authentication Overlay */}
        <AnimatePresence>
          {showReauthModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm z-[210] flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-[#3C3C3C] mb-2">Re-authentication Required</h4>
              <p className="text-sm text-slate-500 font-medium mb-8">
                {isGoogleUser 
                  ? "For security, please sign in with Google again to confirm this action."
                  : "For security, please enter your password to confirm this action."}
              </p>
              
              {!isGoogleUser && (
                <input 
                  id="reauth-password"
                  type="password"
                  placeholder="Enter your password"
                  aria-label="Confirm Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 focus:border-[#7F7FFA] rounded-xl mb-6 outline-none font-bold text-[#3C3C3C]"
                />
              )}

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={handleReauthenticate}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {isGoogleUser ? (
                    <><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" /> Confirm with Google</>
                  ) : 'Confirm Password'}
                </button>
                <button 
                  onClick={() => setShowReauthModal(null)}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(error || success) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mt-6 p-4 border rounded-xl flex items-center gap-3 ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}
            >
              {error ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <p className="text-xs font-bold leading-relaxed">{error || success}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
