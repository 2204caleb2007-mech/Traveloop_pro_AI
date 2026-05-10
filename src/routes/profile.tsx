import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Mail, Globe, Bell, Shield, Trash2, Sun, Moon, Check, Edit3, X, MapPin, Heart } from "lucide-react";
import { useState } from "react";
import { useProfile, useAuth } from "@/hooks/useTrips";
import { profileStore } from "@/lib/mockData";
import { useTrips } from "@/hooks/useTrips";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile & Settings — GlobeX AI" }] }),
  component: ProfilePage,
});

const LANGUAGES = ["English", "Hindi", "French", "Spanish", "German", "Japanese", "Arabic"];
const TRAVEL_STYLES = ["Adventure", "Culture", "Luxury", "Budget", "Beach", "Nature", "Food", "Urban", "Spiritual"];

function ProfilePage() {
  const profile = useProfile();
  const { user } = useAuth();
  const trips = useTrips();

  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  function showSaved() { setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000); }

  function saveName() { profileStore.update({ name: nameInput.trim() || profile.name }); setEditName(false); showSaved(); }
  function saveEmail() { profileStore.update({ email: emailInput.trim() || profile.email }); setEditEmail(false); showSaved(); }
  function toggleStyle(style: string) {
    const styles = profile.travelStyle.includes(style)
      ? profile.travelStyle.filter(s => s !== style)
      : [...profile.travelStyle, style];
    profileStore.update({ travelStyle: styles });
  }
  function removeSavedDest(dest: string) {
    profileStore.update({ savedDestinations: profile.savedDestinations.filter(d => d !== dest) });
  }

  const upcoming = trips.filter(t => t.status === "upcoming").length;
  const completed = trips.filter(t => t.status === "completed").length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold mb-8">Profile & Settings</h1>

          {/* Profile card */}
          <div className="glass rounded-3xl p-6 mb-6">
            <div className="flex items-start gap-5 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground ">
                  {profile.name[0]?.toUpperCase() ?? "E"}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Edit3 className="h-3 w-3 text-primary-foreground" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold">{profile.name}</h2>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <div><span className="font-bold text-gradient">{upcoming}</span> <span className="text-muted-foreground text-xs">upcoming</span></div>
                  <div><span className="font-bold text-gradient">{completed}</span> <span className="text-muted-foreground text-xs">completed</span></div>
                  <div><span className="font-bold text-gradient">{trips.length}</span> <span className="text-muted-foreground text-xs">total trips</span></div>
                </div>
              </div>
              {savedMsg && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 text-neon text-xs font-medium">
                  <Check className="h-3.5 w-3.5" />Saved!
                </motion.div>
              )}
            </div>

            {/* Editable fields */}
            <div className="space-y-4">
              <EditField id="profile-name" icon={<User className="h-4 w-4" />} label="Full Name" value={profile.name}
                editing={editName} inputValue={nameInput} onInputChange={setNameInput}
                onEdit={() => setEditName(true)} onSave={saveName} onCancel={() => { setEditName(false); setNameInput(profile.name); }} />
              <EditField id="profile-email" icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email}
                editing={editEmail} inputValue={emailInput} onInputChange={setEmailInput}
                onEdit={() => setEditEmail(true)} onSave={saveEmail} onCancel={() => { setEditEmail(false); setEmailInput(profile.email); }} />
            </div>
          </div>

          {/* Travel Style */}
          <div className="glass rounded-2xl p-5 mb-5">
            <h3 className="font-semibold mb-1 flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Travel Style</h3>
            <p className="text-xs text-muted-foreground mb-4">Select your travel preferences</p>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_STYLES.map(style => (
                <button key={style} id={`style-${style}`} onClick={() => toggleStyle(style)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${profile.travelStyle.includes(style) ? "bg-primary text-primary-foreground" : "glass hover:bg-white/10"}`}>
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Saved destinations */}
          {profile.savedDestinations.length > 0 && (
            <div className="glass rounded-2xl p-5 mb-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Saved Destinations</h3>
              <div className="space-y-2">
                {profile.savedDestinations.map(dest => (
                  <div key={dest} className="flex items-center justify-between glass rounded-xl px-4 py-2.5">
                    <span className="text-sm">📍 {dest}</span>
                    <button onClick={() => removeSavedDest(dest)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="glass rounded-2xl p-5 mb-5 space-y-5">
            <h3 className="font-semibold">Preferences</h3>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl glass"><Globe className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm font-medium">Language</p><p className="text-xs text-muted-foreground">App display language</p></div>
              </div>
              <select id="language-select" value={profile.language}
                onChange={e => { profileStore.update({ language: e.target.value }); showSaved(); }}
                className="bg-input/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl glass"><Bell className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm font-medium">Notifications</p><p className="text-xs text-muted-foreground">Trip reminders and updates</p></div>
              </div>
              <button id="toggle-notifications-btn"
                onClick={() => { profileStore.update({ notificationsEnabled: !profile.notificationsEnabled }); showSaved(); }}
                className={`relative w-11 h-6 rounded-full transition-colors ${profile.notificationsEnabled ? "bg-primary" : "bg-muted"}`}>
                <motion.div animate={{ x: profile.notificationsEnabled ? 22 : 2 }} className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow" />
              </button>
            </div>

            {/* Theme — always dark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl glass"><Moon className="h-4 w-4 text-primary" /></div>
                <div><p className="text-sm font-medium">Theme</p><p className="text-xs text-muted-foreground">Dark mode is always active</p></div>
              </div>
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary font-medium">
                <Moon className="h-3 w-3" />Dark
              </span>
            </div>
          </div>

          {/* Security */}
          <div className="glass rounded-2xl p-5 mb-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Account Security</h3>
            <div className="space-y-2">
              <button className="w-full text-left glass rounded-xl px-4 py-3 text-sm hover:bg-white/5 transition-colors flex justify-between items-center">
                Change Password <span className="text-muted-foreground text-xs">→</span>
              </button>
              <button className="w-full text-left glass rounded-xl px-4 py-3 text-sm hover:bg-white/5 transition-colors flex justify-between items-center">
                Two-Factor Authentication <span className="text-xs text-muted-foreground">Disabled →</span>
              </button>
              <button className="w-full text-left glass rounded-xl px-4 py-3 text-sm hover:bg-white/5 transition-colors flex justify-between items-center">
                Active Sessions <span className="text-muted-foreground text-xs">→</span>
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="glass rounded-2xl p-5 border border-destructive/20">
            <h3 className="font-semibold text-destructive mb-1">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mb-4">These actions are permanent and cannot be undone.</p>
            <button id="delete-account-btn" onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
              <Trash2 className="h-4 w-4" />Delete Account
            </button>
          </div>
        </motion.div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display font-semibold text-lg mb-2">Delete Account?</h3>
            <p className="text-sm text-muted-foreground mb-6">All your trips and data will be permanently deleted. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl glass text-sm">Cancel</button>
              <button id="confirm-delete-account-btn" onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function EditField({ id, icon, label, value, editing, inputValue, onInputChange, onEdit, onSave, onCancel }: {
  id: string; icon: React.ReactNode; label: string; value: string;
  editing: boolean; inputValue: string; onInputChange: (v: string) => void;
  onEdit: () => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        {editing ? (
          <input id={id} type="text" value={inputValue} onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
            autoFocus className="w-full bg-input/50 border border-primary rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
      {editing ? (
        <div className="flex gap-1">
          <button onClick={onSave} className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <button id={`edit-${id}`} onClick={onEdit} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"><Edit3 className="h-3.5 w-3.5" /></button>
      )}
    </div>
  );
}
