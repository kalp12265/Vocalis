'use client';
import { useState } from 'react';
import {
  UserRound,
  Clock3,
  Target,
  AudioLines,
  Flame,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useVocalis, getStats } from '@/hooks/use-vocalis';
import {
  PageHeading,
  StatCard,
  Avatar,
  Badge,
  Card,
  Button,
  Dialog,
} from './ui';
import { goals, comfortLevels } from '@/data/topics';

export default function ProfilePage() {
  const { data, updateProfile, reset, clearDemo } = useVocalis();
  const stats = getStats(data.sessions);
  const [name, setName] = useState(data.profile.name);
  const [selected, setSelected] = useState(data.profile.goals);
  const [comfort, setComfort] = useState(data.profile.comfort);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [exported, setExported] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile({ name: name.trim(), goals: selected, comfort });
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  }

  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          { application: 'Vocalis', exportedAt: new Date().toISOString(), ...data },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vocalis-your-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  }

  return (
    <>
      <PageHeading
        label="YOUR SPACE. YOUR VOICE."
        title="A little more about you."
        description="Make your practice personal, and keep your progress in your own hands."
      />
      <Card className="profile-header">
        <Avatar name={data.profile.name} size="lg" />
        <div>
          <h2>{data.profile.name || 'Speaker'}</h2>
          <p>
            {stats.level} speaker · {stats.streak} day streak
          </p>
          <Badge>A voice in progress</Badge>
        </div>
      </Card>
      <div className="stats-grid" style={{ marginTop: 22 }}>
        <StatCard
          icon={AudioLines}
          label="Total sessions"
          value={data.sessions.length}
          detail="Every attempt counts"
        />
        <StatCard
          icon={Clock3}
          label="Speaking time"
          value={`${stats.minutes} min`}
          detail="Invested in your voice"
        />
        <StatCard
          icon={Flame}
          label="Current streak"
          value={`${stats.streak} days`}
          detail="Progress through consistency"
        />
        <StatCard
          icon={Target}
          label="Average score"
          value={stats.average || '—'}
          detail="A guide, not a grade"
        />
      </div>
      <div className="profile-layout">
        <Card>
          <h2 className="feedback-title">
            <UserRound />
            Your practice preferences
          </h2>
          <form className="profile-form" onSubmit={save}>
            <label htmlFor="profile-name">What should we call you?</label>
            <input
              required
              maxLength={40}
              className="form-input"
              id="profile-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              autoComplete="given-name"
            />
            <label>Your goals</label>
            <div className="goal-options">
              {goals.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={selected.includes(g)}
                  className={`goal-option ${selected.includes(g) ? 'selected' : ''}`}
                  onClick={() => {
                    setSelected((old) =>
                      old.includes(g) ? old.filter((x) => x !== g) : [...old, g],
                    );
                    setSaved(false);
                  }}
                >
                  <span className="option-check">
                    {selected.includes(g) && <Check size={11} />}
                  </span>
                  {g}
                </button>
              ))}
            </div>
            <label htmlFor="comfort">
              How comfortable are you with spontaneous speaking?
            </label>
            <select
              id="comfort"
              value={comfort}
              onChange={(e) => {
                setComfort(e.target.value);
                setSaved(false);
              }}
            >
              {comfortLevels.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Button type="submit" disabled={!name.trim()}>
              Save preferences <Check size={14} />
            </Button>
            {saved && (
              <span role="status" className="save-success">
                <Check size={12} />
                Saved to your profile
              </span>
            )}
          </form>
        </Card>
        <div className="profile-side">
          <Card className="focus-panel">
            <div className="focus-icon">
              <Sparkles size={16} />
              YOUR SPEAKING SNAPSHOT
            </div>
            <div className="weak-area">
              <span>
                <Target size={13} />
              </span>
              <div>
                <h4>Strongest skill</h4>
                <p>{stats.strongest}</p>
              </div>
            </div>
            <div className="weak-area">
              <span>
                <Sparkles size={13} />
              </span>
              <div>
                <h4>Current focus</h4>
                <p>{stats.weakest}</p>
              </div>
            </div>
            <p>
              Your preferences help us suggest a starting point. Your sessions
              help us find what to work on next.
            </p>
          </Card>
          <Card className="data-panel">
            <h2 className="feedback-title">
              <ShieldCheck />
              Your data belongs to you.
            </h2>
            <p>
              Your profile, sessions, and progress are saved in this browser. No
              account, cloud sync, or cross-device tracking is required.
            </p>
            <ul className="privacy-list">
              <li>Recordings stay in the current tab unless you download them.</li>
              <li>
                Browser speech recognition may send audio to your browser’s
                speech service.
              </li>
              <li>
                Transcripts are sent to the app server for local coaching. A
                configured external provider may process them.
              </li>
              <li>Clearing browser storage removes your progress.</li>
            </ul>
            <div className="data-actions">
              <Button variant="secondary" onClick={exportData}>
                <Download size={13} />
                Export my data
              </Button>
              {data.sessions.some((s) => s.demo) && (
                <Button variant="secondary" onClick={clearDemo}>
                  Clear sample sessions
                </Button>
              )}
            </div>
            {exported && (
              <p className="export-note" role="status">
                Your JSON export has been downloaded.
              </p>
            )}
            <button className="danger-button" onClick={() => setConfirm(true)}>
              Reset all local progress
            </button>
          </Card>
        </div>
      </div>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        alert
        titleId="reset-title"
        descriptionId="reset-description"
      >
        <span className="icon-box orange" style={{ marginBottom: 18 }}>
          <AlertTriangle size={22} />
        </span>
        <h2 id="reset-title">Start with a clean slate?</h2>
        <p id="reset-description">
          This removes your profile preferences and all saved sessions from this
          browser. It can’t be undone. Export your data first if you want to keep
          a copy.
        </p>
        <div className="modal-actions">
          <Button
            autoFocus
            variant="secondary"
            onClick={() => setConfirm(false)}
          >
            Keep my progress
          </Button>
          <Button
            onClick={() => {
              reset();
              setName('Alex');
              setSelected([]);
              setComfort('Neutral');
              setConfirm(false);
            }}
          >
            Reset all data
          </Button>
        </div>
      </Dialog>
    </>
  );
}
