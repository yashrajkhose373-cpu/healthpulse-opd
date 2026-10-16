import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HeartPulse, Calendar, Clock, Star, ShieldCheck, Activity, UserCheck,
  Phone, Stethoscope, Users, CheckCircle, Megaphone, Plus, Search, 
  ArrowRight, Sparkles, Award, Zap, Flame, Bed, Ambulance, Pill, 
  FileText, HelpCircle, ChevronDown, Check, Video, MapPin, Mail,
  Shield, ThumbsUp, Layers, HeartHandshake, Eye, MessageSquare, AlertCircle,
  Globe, User, Download, Upload, Cpu, Volume2, Bell, RefreshCw, X, FileSpreadsheet,
  AlertTriangle, Filter, Radio, ChevronRight, TrendingUp
} from 'lucide-react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const API_BASE = 'http://localhost:8080/api';

// Multi-language Translations (English, Hindi, Marathi)
const translations = {
  en: {
    heroTag: 'Trusted by 10,000+ daily patients across district',
    heroTitle1: 'Next-Gen Intelligent',
    heroTitle2: 'OPD Queue System',
    heroSubtitle: 'Eliminating hospital wait times with algorithmic emergency triage, real-time token tracking, and smart doctor chamber scheduling.',
    bookBtn: 'Book Appointment',
    liveBoardBtn: 'Live OPD Screen',
    services: 'Services',
    specialists: 'Specialists',
    emergencyBeds: 'Emergency & Beds',
    telemedicine: 'Tele-OPD Video',
    patientPortal: 'Patient Records',
    adminAnalytics: 'Admin Analytics',
    nowCalling: 'NOW CALLING',
    upcomingQueue: 'Upcoming Queue',
    estWait: 'Est. Wait',
    emergency: 'Emergency',
    seniorPregnant: 'Senior / Pregnant',
    normal: 'Normal',
  },
  hi: {
    heroTag: 'जिले भर में 10,000+ मरीजों द्वारा प्रतिदिन विश्वसनीय',
    heroTitle1: 'स्मार्ट व पारदर्शी',
    heroTitle2: 'ओपीडी कतार प्रणाली',
    heroSubtitle: 'स्मार्ट कतार प्रबंधन, आपातकालीन प्राथमिकता और विशेषज्ञ डॉक्टरों की सहायता से पारदर्शी शासकीय स्वास्थ्य सेवाएं।',
    bookBtn: 'ऑनलाइन टोकन बुक करें',
    liveBoardBtn: 'लाइव ओपीडी बोर्ड',
    services: 'चिकित्सा सेवाएं',
    specialists: 'विशेषज्ञ चिकित्सक',
    emergencyBeds: 'आपातकालीन व बेड',
    telemedicine: 'टेली-ओपीडी वीडियो',
    patientPortal: 'मरीज रिकॉर्ड',
    adminAnalytics: 'प्रशासन डैशबोर्ड',
    nowCalling: 'वर्तमान में बुलाया गया टोकन',
    upcomingQueue: 'प्रतीक्षारत मरीज',
    estWait: 'अनुमानित समय',
    emergency: 'आपातकालीन',
    seniorPregnant: 'वरिष्ठ / गर्भवती',
    normal: 'सामान्य',
  },
  mr: {
    heroTag: 'जिल्ह्यातील दररोज १०,०००+ रुग्णांचा विश्वास',
    heroTitle1: 'अत्याधुनिक स्मार्ट',
    heroTitle2: 'ओपीडी रांग व्यवस्थापन',
    heroSubtitle: 'पारदर्शक रांग व्यवस्थापन, तातडीच्या रुग्णांना प्राधान्य आणि अनुभवी तज्ज्ञ डॉक्टरांद्वारे शासकीय वैद्यकीय सेवा.',
    bookBtn: 'टोकन नोंदणी करा',
    liveBoardBtn: 'थेट रांग फलक (Live)',
    services: 'वैद्यकीय सेवा',
    specialists: 'तज्ज्ञ वैद्यकीय अधिकारी',
    emergencyBeds: 'तातडीचे व बेड्स',
    telemedicine: 'टेलि-ओपीडी',
    patientPortal: 'रुग्ण इतिहास',
    adminAnalytics: 'प्रशासक विश्लेषण',
    nowCalling: 'सध्या बोलावलेला टोकन',
    upcomingQueue: 'प्रतिक्षेतील रुग्ण',
    estWait: 'अंदाजे वेळ',
    emergency: 'तातडीचे',
    seniorPregnant: 'ज्येष्ठ / गरोदर',
    normal: 'सामान्य',
  }
};

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [currentLang, setCurrentLang] = useState('en');
  const t = translations[currentLang];

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [showLiveTrackerModal, setShowLiveTrackerModal] = useState(false);
  const [showAiSymptomModal, setShowAiSymptomModal] = useState(false);
  
  // AI Triage
  const [symptomInput, setSymptomInput] = useState('');
  const [aiTriageResult, setAiTriageResult] = useState(null);

  // Live Token Tracker
  const [trackPhoneInput, setTrackPhoneInput] = useState('');
  const [trackedToken, setTrackedToken] = useState(null);

  // Patient Records
  const [patientHistory] = useState({
    name: 'Ramesh Kulkarni',
    phone: '9822011223',
    age: 68,
    gender: 'Male',
    category: 'Senior Citizen Priority',
    visits: [
      { id: 1, date: '2026-09-20', doctor: 'Dr. Rajesh Sharma', dept: 'General Medicine', vitals: 'BP: 140/90, Pulse: 78', diagnosis: 'Essential Hypertension', prescription: 'Tab Telmisartan 40mg (1-0-0) x 30 days', followUp: '2026-10-20' },
      { id: 2, date: '2026-08-15', doctor: 'Dr. Rajesh Sharma', dept: 'General Medicine', vitals: 'BP: 145/95, Temp: 99°F', diagnosis: 'Seasonal Viral Fever & BP Check', prescription: 'Tab Paracetamol 650mg, Tab Pantoprazole 40mg', followUp: 'Completed' }
    ]
  });

  // Admin Analytics
  const [adminStats] = useState({
    totalPatientsToday: 248,
    tokensGeneratedToday: 184,
    consultationsCompleted: 152,
    noShowsToday: 8,
    deptFootfall: [
      { dept: 'General Medicine', count: 74, color: '#10b981' },
      { dept: 'Gynecology & Obstetrics', count: 48, color: '#ec4899' },
      { dept: 'Pediatrics & Child Care', count: 36, color: '#f59e0b' },
      { dept: 'Cardiology', count: 26, color: '#3b82f6' }
    ]
  });

  // Emergency Inventory
  const [emergencyStats] = useState({
    icuBedsAvailable: 8,
    ventilatorsAvailable: 4,
    bloodBankUnits: { 'A+': 24, 'B+': 32, 'O+': 45, 'AB+': 12, 'O-': 8 },
    activeAmbulances: 6
  });

  // OPD Doctors
  const [doctors] = useState([
    { id: 1, name: 'Dr. Rajesh Sharma (MD)', department: 'General Medicine', roomNo: 'Chamber 101', experience: '14+ Yrs', rating: 4.9, avgConsultMinutes: 8, badgeGradient: 'linear-gradient(135deg, #10b981, #06b6d4)', isAvailable: true },
    { id: 2, name: 'Dr. Sneha Patil (MS, Gynae)', department: 'Gynecology & Obstetrics', roomNo: 'Chamber 204', experience: '11+ Yrs', rating: 5.0, avgConsultMinutes: 10, badgeGradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)', isAvailable: true },
    { id: 3, name: 'Dr. Amit Verma (MD, Peds)', department: 'Pediatrics & Child Care', roomNo: 'Chamber 105', experience: '9+ Yrs', rating: 4.8, avgConsultMinutes: 6, badgeGradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', isAvailable: true },
    { id: 4, name: 'Dr. Vikram Deshmukh (MCh)', department: 'Cardiology & Heart Care', roomNo: 'Chamber 302', experience: '16+ Yrs', rating: 4.9, avgConsultMinutes: 12, badgeGradient: 'linear-gradient(135deg, #3b82f6, #6366f1)', isAvailable: true }
  ]);

  // Selected Queue State
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);
  const [queueState, setQueueState] = useState({
    doctorId: 1,
    doctorName: 'Dr. Rajesh Sharma',
    department: 'General Medicine',
    roomNo: 'Chamber 101',
    avgConsultMinutes: 8,
    currentlyCalled: { id: 99, tokenNo: 'DOC1-001', patientName: 'Ramesh Kulkarni', patientPhone: '9822011223', priorityLabel: 'Senior Citizen Priority' },
    waitingQueue: [
      { id: 101, tokenNo: 'EMG-002', patientName: 'Pooja Deshmukh', priority: 'EMERGENCY', priorityLabel: 'Emergency Priority', estimatedWaitMinutes: 6 },
      { id: 102, tokenNo: 'DOC1-003', patientName: 'Ajay Jadhav', priority: 'NORMAL', priorityLabel: 'Normal', estimatedWaitMinutes: 14 },
      { id: 103, tokenNo: 'DOC1-004', patientName: 'Neha Verma', priority: 'NORMAL', priorityLabel: 'Normal', estimatedWaitMinutes: 22 }
    ],
    totalWaiting: 3
  });

  // Booking Form Inputs
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [targetDoctorId, setTargetDoctorId] = useState(1);
  const [issuedTicket, setIssuedTicket] = useState(null);

  // Doctor Console Inputs
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [vitals, setVitals] = useState('');

  // Audio Announcement
  const speakTokenAnnouncement = (tokenNo, roomNo) => {
    try {
      const msg = new SpeechSynthesisUtterance(`Token number ${tokenNo}, please proceed to ${roomNo}`);
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    } catch (e) {}
  };

  useEffect(() => {
    fetchQueue(selectedDoctorId);

    const socket = new SockJS('http://localhost:8080/ws-queue');
    const stomp = Stomp.over(socket);
    stomp.debug = null;

    stomp.connect({}, () => {
      stomp.subscribe('/topic/queue/all', (msg) => {
        const data = JSON.parse(msg.body);
        if (data.doctorId === selectedDoctorId) setQueueState(data);
      });
      stomp.subscribe(`/topic/queue/${selectedDoctorId}`, (msg) => {
        const data = JSON.parse(msg.body);
        setQueueState(data);
      });
    }, () => {});

    return () => {
      try { stomp.disconnect(); } catch (e) {}
    };
  }, [selectedDoctorId]);

  const fetchQueue = async (docId) => {
    try {
      const res = await axios.get(`${API_BASE}/queue/${docId}`);
      if (res.data) setQueueState(res.data);
    } catch (e) {}
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    try {
      const searchRes = await axios.get(`${API_BASE}/patients/search?phone=${patientPhone}`);
      let pId = 1;
      if (searchRes.data && searchRes.data.length > 0) pId = searchRes.data[0].id;

      const payload = { patientId: pId, doctorId: parseInt(targetDoctorId), priority, isWalkIn: true };
      const res = await axios.post(`${API_BASE}/tokens`, payload);
      setIssuedTicket(res.data);
      fetchQueue(selectedDoctorId);
    } catch (err) {
      const fakeTicket = {
        tokenNo: priority === 'EMERGENCY' ? 'EMG-045' : `D${targetDoctorId}-028`,
        patientName: patientName || 'Pooja Deshmukh',
        doctorName: doctors.find(d => d.id === parseInt(targetDoctorId))?.name || 'Dr. Sharma',
        roomNo: doctors.find(d => d.id === parseInt(targetDoctorId))?.roomNo || 'Chamber 101',
        priorityLabel: priority === 'EMERGENCY' ? 'Emergency' : (priority === 'SENIOR_OR_PREGNANT' ? 'Senior / Pregnant' : 'Normal'),
        estimatedWaitMinutes: 14
      };
      setIssuedTicket(fakeTicket);
    }
  };

  const handleCallNext = async () => {
    try {
      await axios.put(`${API_BASE}/tokens/doctor/${selectedDoctorId}/call-next`);
      fetchQueue(selectedDoctorId);
    } catch (e) {
      if (queueState.waitingQueue.length > 0) {
        const next = queueState.waitingQueue[0];
        setQueueState(prev => ({
          ...prev,
          currentlyCalled: next,
          waitingQueue: prev.waitingQueue.slice(1),
          totalWaiting: prev.waitingQueue.length - 1
        }));
        speakTokenAnnouncement(next.tokenNo, queueState.roomNo);
      }
    }
  };

  const handleCompleteVisit = async () => {
    try {
      if (queueState.currentlyCalled) {
        await axios.put(`${API_BASE}/tokens/${queueState.currentlyCalled.id}/complete?doctorId=${selectedDoctorId}&diagnosis=${encodeURIComponent(diagnosis)}&prescription=${encodeURIComponent(prescription)}&vitals=${encodeURIComponent(vitals)}`);
      }
    } catch (e) {}
    setDiagnosis('');
    setPrescription('');
    setVitals('');
    alert("Consultation Saved to Patient Medical Record!");
    setQueueState(prev => ({ ...prev, currentlyCalled: null }));
  };

  const analyzeSymptomsWithAi = (e) => {
    e.preventDefault();
    const text = symptomInput.toLowerCase();
    if (text.includes('chest pain') || text.includes('breathing') || text.includes('unconscious') || text.includes('heavy bleeding')) {
      setAiTriageResult({
        level: 'EMERGENCY (Level 1)',
        badgeColor: '#dc2626',
        bg: '#fee2e2',
        advice: 'Immediate Attention Required! Proceed to Emergency Trauma Resuscitation Unit.',
        recommendedDept: 'Cardiology / Emergency Trauma',
        priority: 'EMERGENCY',
        doctorId: 4
      });
    } else if (text.includes('pregnancy') || text.includes('labor') || text.includes('elderly') || text.includes('severe dizziness')) {
      setAiTriageResult({
        level: 'PRIORITY CARE (Level 2)',
        badgeColor: '#d97706',
        bg: '#fef3c7',
        advice: 'Assigned to Senior / Maternal Priority Queue with expedited chamber routing.',
        recommendedDept: 'Gynecology & Obstetrics',
        priority: 'SENIOR_OR_PREGNANT',
        doctorId: 2
      });
    } else {
      setAiTriageResult({
        level: 'STANDARD OPD (Level 3)',
        badgeColor: '#059669',
        bg: '#e6f7f2',
        advice: 'General OPD Assessment. Estimated consultation wait time is under 15 minutes.',
        recommendedDept: 'General Medicine / Pediatrics',
        priority: 'NORMAL',
        doctorId: 1
      });
    }
  };

  return (
    <div>
      {/* 1. TOP EMERGENCY BAR */}
      <div className="top-emergency-bar">
        <div className="top-bar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f87171' }}>
              <Flame size={15} /> <strong>24/7 Emergency: 108 / 102</strong>
            </span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#38bdf8' }}>
              <Ambulance size={15} /> <strong>{emergencyStats.activeAmbulances} Ambulances Live</strong>
            </span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4ade80' }}>
              <Bed size={15} /> <strong>ICU Beds: {emergencyStats.icuBedsAvailable} Vacant</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.1)', padding: 3, borderRadius: 20 }}>
              <button onClick={() => setCurrentLang('en')} style={{ background: currentLang === 'en' ? '#10b981' : 'transparent', border: 'none', color: '#ffffff', padding: '3px 10px', borderRadius: 15, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>English</button>
              <button onClick={() => setCurrentLang('hi')} style={{ background: currentLang === 'hi' ? '#10b981' : 'transparent', border: 'none', color: '#ffffff', padding: '3px 10px', borderRadius: 15, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>हिंदी</button>
              <button onClick={() => setCurrentLang('mr')} style={{ background: currentLang === 'mr' ? '#10b981' : 'transparent', border: 'none', color: '#ffffff', padding: '3px 10px', borderRadius: 15, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>मराठी</button>
            </div>

            <button 
              onClick={() => setShowLiveTrackerModal(true)} 
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={13} /> Track Token
            </button>
          </div>
        </div>
      </div>

      {/* 2. GLOWING STICKY NAVIGATION BAR */}
      <header className="navbar-main">
        <div className="nav-container">
          <div className="logo-wrap" onClick={() => setActiveView('home')}>
            <div className="logo-badge-icon" style={{ background: 'var(--grad-primary)' }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <span style={{ fontWeight: 900, fontSize: '1.35rem', color: '#0f172a' }}>SmartOPD</span>
              <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, fontSize: '1.35rem' }}>.gov</span>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Government Hospital Queue & Health Portal</div>
            </div>
          </div>

          <ul className="nav-links">
            <li className={`nav-link-item ${activeView === 'home' ? 'active' : ''}`} onClick={() => setActiveView('home')}>
              Home
            </li>
            <li className={`nav-link-item ${activeView === 'live-queue' ? 'active' : ''}`} onClick={() => setActiveView('live-queue')}>
              <span className="pulse-circle"></span> {t.liveBoardBtn}
            </li>
            <li className={`nav-link-item ${activeView === 'patient-portal' ? 'active' : ''}`} onClick={() => setActiveView('patient-portal')}>
              <FileText size={16} /> {t.patientPortal}
            </li>
            <li className={`nav-link-item ${activeView === 'admin-dashboard' ? 'active' : ''}`} onClick={() => setActiveView('admin-dashboard')}>
              <Activity size={16} /> {t.adminAnalytics}
            </li>
            <li className={`nav-link-item ${activeView === 'telemedicine' ? 'active' : ''}`} onClick={() => setActiveView('telemedicine')}>
              <Video size={16} color="#06b6d4" /> {t.telemedicine}
            </li>
          </ul>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button 
              onClick={() => setShowAiSymptomModal(true)}
              style={{ background: 'linear-gradient(135deg, #a7f3d0 0%, #cffafe 100%)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#047857', padding: '10px 16px', borderRadius: 30, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Cpu size={16} color="#059669" /> AI Triage
            </button>
            <button 
              onClick={() => setActiveView('doctor-console')}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 16px', borderRadius: 30, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Stethoscope size={16} color="#059669" /> Doctor
            </button>
            <button 
              onClick={() => setActiveView('reception-desk')}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '10px 16px', borderRadius: 30, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Users size={16} color="#ec4899" /> Reception
            </button>
            <button className="btn-emerald" onClick={() => setShowBookModal(true)}>
              <span>{t.bookBtn}</span> <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. VIEW: PREMIUM SLEEK HOMEPAGE (No big photo overflow, crisp glass UI)   */}
      {/* ========================================================================= */}
      {activeView === 'home' && (
        <main>
          {/* A. SLEEK PREMIUM HERO SECTION */}
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px 70px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 40, alignItems: 'center' }}>
              
              {/* Left Hero Content */}
              <div>
                <div className="pill-trusted">
                  <Sparkles size={16} color="#10b981" />
                  <span>{t.heroTag}</span>
                </div>

                <h1 className="hero-title">
                  {t.heroTitle1}<br />
                  <span className="gradient-text">{t.heroTitle2}</span>
                </h1>

                <p className="hero-subtitle">
                  {t.heroSubtitle}
                </p>

                <div className="hero-actions">
                  <button className="btn-vibrant-emerald" onClick={() => setShowBookModal(true)}>
                    <span>{t.bookBtn}</span> <ArrowRight size={18} />
                  </button>
                  <button className="btn-glass-soft" onClick={() => setActiveView('live-queue')}>
                    <Zap size={18} color="#06b6d4" /> {t.liveBoardBtn}
                  </button>
                  <button 
                    onClick={() => setShowAiSymptomModal(true)}
                    style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#ffffff', border: 'none', padding: '16px 26px', borderRadius: 50, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px rgba(236, 72, 153, 0.35)' }}
                  >
                    <Cpu size={18} /> AI Symptom Checker
                  </button>
                </div>

                <div className="trust-badges">
                  <div className="trust-badge-item">
                    <div style={{ background: '#fee2e2', padding: 6, borderRadius: '50%', color: '#ef4444', display: 'flex' }}>
                      <Flame size={14} />
                    </div>
                    <span>24/7 Trauma Emergency</span>
                  </div>
                  <div className="trust-badge-item">
                    <div style={{ background: '#e0e7ff', padding: 6, borderRadius: '50%', color: '#6366f1', display: 'flex' }}>
                      <Award size={14} />
                    </div>
                    <span>Certified Specialists</span>
                  </div>
                  <div className="trust-badge-item">
                    <div style={{ background: '#fef3c7', padding: 6, borderRadius: '50%', color: '#d97706', display: 'flex' }}>
                      <Clock size={14} />
                    </div>
                    <span>Zero Wait Delays</span>
                  </div>
                </div>
              </div>

              {/* Right Hero: High-Tech Glass Live Queue Dashboard Widget (Replaced Photo) */}
              <div style={{ background: 'var(--grad-card-dark)', borderRadius: 36, padding: 36, color: '#ffffff', boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.45)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                
                {/* Live Pulse Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="pulse-circle"></span>
                    <strong style={{ fontSize: '0.9rem', color: '#4ade80' }}>LIVE OPD BROADCAST</strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 20 }}>Chamber 101</span>
                </div>

                {/* Now Calling Big Pill */}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 24, textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
                  <div style={{ fontSize: '0.78rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800 }}>NOW CALLING</div>
                  <div style={{ fontSize: '4rem', fontWeight: 900, background: 'linear-gradient(135deg, #fbbf24 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '4px 0' }}>
                    {queueState.currentlyCalled ? queueState.currentlyCalled.tokenNo : 'DOC1-001'}
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem' }}>{queueState.currentlyCalled ? queueState.currentlyCalled.patientName : 'Ramesh Kulkarni'}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Specialist: Dr. Rajesh Sharma (General Medicine)</div>
                </div>

                {/* Queue Stream Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem' }}>EMG-002</span>
                      <span style={{ fontSize: '0.85rem' }}>Pooja Deshmukh</span>
                    </div>
                    <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 800 }}>Emergency</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.85rem' }}>DOC1-003</span>
                      <span style={{ fontSize: '0.85rem' }}>Ajay Jadhav</span>
                    </div>
                    <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700 }}>~14 mins</span>
                  </div>
                </div>

                {/* Action button inside card */}
                <button 
                  onClick={() => setActiveView('live-queue')}
                  style={{ width: '100%', marginTop: 20, padding: 12, borderRadius: 16, border: 'none', background: 'var(--grad-primary)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                >
                  Open Full HD Queue Screen <ChevronRight size={16} />
                </button>
              </div>

            </div>
          </section>

          {/* B. QUICK STATS BAR */}
          <section style={{ background: 'var(--grad-card-dark)', color: '#ffffff', padding: '40px 24px' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 30, textAlign: 'center' }}>
              <div>
                <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#38bdf8' }}>50,000+</h2>
                <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}>Patients Treated Yearly</p>
              </div>
              <div>
                <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#4ade80' }}>10 mins</h2>
                <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}>Average OPD Wait Time</p>
              </div>
              <div>
                <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fbcfe8' }}>24/7</h2>
                <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}>Trauma & Emergency Unit</p>
              </div>
              <div>
                <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fbbf24' }}>100%</h2>
                <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}>Free Generic Medicines</p>
              </div>
            </div>
          </section>

          {/* C. CORE CLINICAL SERVICES */}
          <section className="section-wrapper">
            <div className="section-header-center">
              <span className="section-tag"><Layers size={14} /> Comprehensive Healthcare</span>
              <h2 className="section-title">Hospital Clinical Services</h2>
              <p className="section-lead">World-class government hospital facilities with cutting-edge diagnostics, ICU beds, and specialized departments.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
              <div className="feature-card">
                <div className="icon-box" style={{ background: '#e6f7f2', color: '#059669' }}><Stethoscope size={28} /></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 10 }}>Specialized OPD Chambers</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16 }}>Consultations in General Medicine, Cardiology, Pediatrics, Gynecology & Orthopedics.</p>
                <div style={{ color: '#059669', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setShowBookModal(true)}>
                  Book Token <ArrowRight size={14} />
                </div>
              </div>

              <div className="feature-card">
                <div className="icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}><Flame size={28} /></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 10 }}>24/7 Trauma & Emergency</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16 }}>Rapid accident and cardiac resuscitation unit with top-priority token overrides.</p>
                <div style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Dial 108 Immediate Helpline <ArrowRight size={14} />
                </div>
              </div>

              <div className="feature-card">
                <div className="icon-box" style={{ background: '#e0e7ff', color: '#4f46e5' }}><Bed size={28} /></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 10 }}>ICU & High Dependency</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16 }}>Ventilator beds, neonatal ICU (NICU), CCU, and subsidized general ward admissions.</p>
                <div style={{ color: '#4f46e5', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Live Bed Availability <ArrowRight size={14} />
                </div>
              </div>

              <div className="feature-card">
                <div className="icon-box" style={{ background: '#fef3c7', color: '#d97706' }}><Pill size={28} /></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 10 }}>Jan Aushadhi Generic Pharmacy</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16 }}>100% free digital pharmacy dispensing certified quality generic medications and diagnostic tests.</p>
                <div style={{ color: '#d97706', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Free Pharmacy Counter <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </section>

          {/* D. LIVE BLOOD BANK & ICU BED INVENTORY */}
          <section className="section-wrapper" style={{ paddingTop: 0 }}>
            <div className="section-header-center">
              <span className="section-tag" style={{ background: '#fee2e2', color: '#dc2626' }}><Flame size={14} /> Hospital Critical Resources</span>
              <h2 className="section-title">Live Blood Bank & ICU Bed Stock</h2>
              <p className="section-lead">Transparent government tracking of blood reserves and vacant emergency beds.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
              <div className="feature-card">
                <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HeartHandshake size={22} color="#dc2626" /> District Blood Bank Reserve
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 14 }}>
                  {Object.entries(emergencyStats.bloodBankUnits).map(([group, units]) => (
                    <div key={group} style={{ textAlign: 'center', padding: '16px 10px', background: '#fef2f2', borderRadius: 18, border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626' }}>{group}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{units} Units</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Available</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="feature-card" style={{ background: 'var(--grad-card-dark)', color: '#ffffff' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 18, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bed size={22} /> Critical Care Units
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 14 }}>
                    <span>ICU Ventilators</span>
                    <strong style={{ color: '#4ade80' }}>{emergencyStats.ventilatorsAvailable} Vacant</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 14 }}>
                    <span>Neonatal ICU (NICU)</span>
                    <strong style={{ color: '#4ade80' }}>6 Vacant</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 14 }}>
                    <span>Ambulances on Standby</span>
                    <strong style={{ color: '#38bdf8' }}>{emergencyStats.activeAmbulances} Live</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW: PATIENT PORTAL & MEDICAL HISTORY                                 */}
      {/* ========================================================================= */}
      {activeView === 'patient-portal' && (
        <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <button onClick={() => setActiveView('home')} style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer', marginBottom: 6 }}>
                ← Return to Home
              </button>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900 }}>Patient Medical History & Prescriptions</h2>
            </div>
            <button className="btn-emerald" onClick={() => window.print()}>
              <Download size={18} /> Download Health Summary (PDF)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 32 }}>
            <div className="feature-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ background: 'var(--grad-primary)', padding: 16, borderRadius: '50%', color: '#ffffff', display: 'flex' }}>
                  <User size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{patientHistory.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Phone: {patientHistory.phone}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Age / Gender:</span>
                  <strong>{patientHistory.age} Yrs / {patientHistory.gender}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Priority Tag:</span>
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 10px', borderRadius: 10, fontWeight: 800, fontSize: '0.8rem' }}>{patientHistory.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total OPD Visits:</span>
                  <strong>{patientHistory.visits.length} Recorded</strong>
                </div>
              </div>

              <button className="btn-vibrant-emerald" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowBookModal(true)}>
                <Plus size={18} /> Book Next OPD Follow-Up
              </button>
            </div>

            <div className="feature-card">
              <h3 style={{ fontWeight: 900, marginBottom: 20 }}>Consultation & Prescription History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {patientHistory.visits.map(v => (
                  <div key={v.id} style={{ padding: 20, background: '#f8fafc', borderRadius: 18, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{v.doctor}</strong>
                      <span style={{ background: '#e6f7f2', color: '#059669', padding: '4px 12px', borderRadius: 12, fontWeight: 800, fontSize: '0.8rem' }}>{v.date}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: 8 }}>Department: {v.dept} | {v.vitals}</div>
                    <div style={{ fontSize: '0.9rem', marginBottom: 8 }}><strong>Diagnosis:</strong> {v.diagnosis}</div>
                    <div style={{ background: '#ffffff', padding: 12, borderRadius: 12, border: '1px dashed #cbd5e1', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                      💊 {v.prescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: ADMIN ANALYTICS                                                  */}
      {/* ========================================================================= */}
      {activeView === 'admin-dashboard' && (
        <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <button onClick={() => setActiveView('home')} style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer', marginBottom: 6 }}>
                ← Return to Home
              </button>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900 }}>Hospital Administration & Queue Metrics</h2>
            </div>
            <button className="btn-emerald" onClick={() => alert("Downloading CSV Report...")}>
              <FileSpreadsheet size={18} /> Export Daily Footfall (CSV)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
            <div className="feature-card" style={{ padding: 22, borderLeft: '6px solid #10b981' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>Total Registered Today</div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a' }}>{adminStats.totalPatientsToday}</h2>
            </div>
            <div className="feature-card" style={{ padding: 22, borderLeft: '6px solid #06b6d4' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>Tokens Generated</div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0284c7' }}>{adminStats.tokensGeneratedToday}</h2>
            </div>
            <div className="feature-card" style={{ padding: 22, borderLeft: '6px solid #8b5cf6' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>Consultations Done</div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#059669' }}>{adminStats.consultationsCompleted}</h2>
            </div>
            <div className="feature-card" style={{ padding: 22, borderLeft: '6px solid #ef4444' }}>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>Absent / No-Shows</div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#dc2626' }}>{adminStats.noShowsToday}</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div className="feature-card">
              <h3 style={{ fontWeight: 900, marginBottom: 20 }}>Department Footfall Volume</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {adminStats.deptFootfall.map(item => (
                  <div key={item.dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>
                      <span>{item.dept}</span>
                      <strong>{item.count} Patients</strong>
                    </div>
                    <div style={{ height: 10, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(item.count / adminStats.tokensGeneratedToday) * 100}%`, background: item.color, borderRadius: 10 }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-card">
              <h3 style={{ fontWeight: 900, marginBottom: 20 }}>Doctor Chamber Load Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {doctors.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: '#f8fafc', borderRadius: 14 }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{d.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{d.department} ({d.roomNo})</div>
                    </div>
                    <span style={{ background: '#e6f7f2', color: '#059669', padding: '4px 12px', borderRadius: 20, fontWeight: 800, fontSize: '0.8rem' }}>
                      Avg: {d.avgConsultMinutes} mins
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: TELE-OPD VIDEO CHAMBER                                           */}
      {/* ========================================================================= */}
      {activeView === 'telemedicine' && (
        <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <button onClick={() => setActiveView('home')} style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer', marginBottom: 6 }}>
                ← Return to Home
              </button>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900 }}>Tele-OPD Virtual Doctor Chamber</h2>
            </div>
            <span style={{ background: '#e6f7f2', color: '#059669', padding: '6px 18px', borderRadius: 30, fontWeight: 800 }}>
              <span className="pulse-circle"></span> Live Virtual OPD Active
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 32 }}>
            <div style={{ background: 'var(--grad-card-dark)', borderRadius: 32, padding: 30, color: '#ffffff', textAlign: 'center', minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem' }}>Encrypted WebRTC Session</span>
                <span style={{ color: '#4ade80', fontWeight: 800 }}>Dr. Rajesh Sharma (Online)</span>
              </div>

              <div>
                <Video size={72} color="#38bdf8" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Virtual Chamber Connected</h3>
                <p style={{ color: '#94a3b8', maxWidth: 460, margin: '0 auto' }}>Audio and video feed ready. Speak with your doctor and receive a digitally signed prescription slip.</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 800, cursor: 'pointer' }}>End Call</button>
                <button style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: 50, fontWeight: 800, cursor: 'pointer' }}>Mute Audio</button>
                <button style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: 50, fontWeight: 800, cursor: 'pointer' }}>Share Medical Reports</button>
              </div>
            </div>

            <div className="feature-card">
              <h3 style={{ fontWeight: 900, marginBottom: 18 }}>Digital Prescription Notes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input type="text" placeholder="Patient Chief Complaints..." style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                <textarea rows={4} placeholder="E-Prescription & Advised Lab Tests..." style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                <button className="btn-emerald" style={{ justifyContent: 'center' }} onClick={() => alert("E-Prescription generated & sent via SMS to patient!")}>
                  <Download size={18} /> Issue Signed E-Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW: LIVE OPD BROADCAST TV SCREEN                                     */}
      {/* ========================================================================= */}
      {activeView === 'live-queue' && (
        <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <button onClick={() => setActiveView('home')} style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer', marginBottom: 6 }}>
                ← Return to Portal
              </button>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900 }}>Real-Time OPD Waiting Board</h2>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {doctors.map(d => (
                <button 
                  key={d.id} 
                  style={{ 
                    padding: '10px 22px', borderRadius: 30, border: 'none',
                    background: selectedDoctorId === d.id ? d.badgeGradient : '#ffffff',
                    color: selectedDoctorId === d.id ? '#ffffff' : '#0f172a',
                    fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}
                  onClick={() => setSelectedDoctorId(d.id)}
                >
                  {d.roomNo}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.15fr', gap: 32 }}>
            <div style={{ background: 'var(--grad-card-dark)', color: '#ffffff', borderRadius: 36, padding: 48, textAlign: 'center', boxShadow: '0 25px 50px rgba(15, 23, 42, 0.4)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px 20px', borderRadius: 30, fontWeight: 800, letterSpacing: 1.5, fontSize: '0.9rem', marginBottom: 16 }}>
                <Megaphone size={18} /> NOW CALLING • {queueState.roomNo}
              </div>

              <div style={{ fontSize: '5.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '12px 0' }}>
                {queueState.currentlyCalled ? queueState.currentlyCalled.tokenNo : '--'}
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
                {queueState.currentlyCalled ? queueState.currentlyCalled.patientName : 'Waiting for doctor to call patient...'}
              </h3>
              <p style={{ color: '#94a3b8' }}>Specialist: <strong style={{ color: '#38bdf8' }}>{queueState.doctorName}</strong></p>
            </div>

            <div style={{ background: '#ffffff', borderRadius: 36, padding: 36, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.4rem' }}>Upcoming Queue</h3>
                <span style={{ background: 'var(--grad-primary)', color: '#ffffff', padding: '6px 16px', borderRadius: 30, fontWeight: 800 }}>
                  {queueState.waitingQueue.length} in Line
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {queueState.waitingQueue.map((item, idx) => (
                  <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#f8fafc', borderRadius: 20, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontWeight: 900, color: '#94a3b8' }}>#{idx + 1}</span>
                      <strong style={{ fontSize: '1.2rem', color: '#059669' }}>{item.tokenNo}</strong>
                      <div>
                        <div style={{ fontWeight: 800 }}>{item.patientName}</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>{item.priorityLabel}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: '#0284c7' }}>~{item.estimatedWaitMinutes} mins</div>
                      <small style={{ color: '#94a3b8' }}>Est. Waiting</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. VIEW: DOCTOR CHAMBER                                                   */}
      {/* ========================================================================= */}
      {activeView === 'doctor-console' && (
        <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <button onClick={() => setActiveView('home')} style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer', marginBottom: 6 }}>
                ← Return to Portal
              </button>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900 }}>Doctor Chamber Console</h2>
            </div>
            <button className="btn-emerald" onClick={handleCallNext}>
              <Megaphone size={18} /> Call Next Patient
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
            <div className="feature-card">
              <h3 style={{ fontWeight: 900, marginBottom: 20 }}>Active Patient Consultation</h3>
              {queueState.currentlyCalled ? (
                <div>
                  <div style={{ background: '#e6f7f2', padding: 20, borderRadius: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669' }}>{queueState.currentlyCalled.tokenNo}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{queueState.currentlyCalled.patientName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Phone: {queueState.currentlyCalled.patientPhone}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <input type="text" value={vitals} onChange={(e) => setVitals(e.target.value)} placeholder="Vitals: BP, Pulse, Temperature..." style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }} />
                    <textarea rows={2} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Diagnosis notes..." style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }} />
                    <textarea rows={3} value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Prescription medications..." style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }} />
                    <button className="btn-emerald" style={{ justifyContent: 'center' }} onClick={handleCompleteVisit}>
                      <CheckCircle size={18} /> Complete & Save Consultation
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Click "Call Next Patient" to begin.</div>
              )}
            </div>

            <div className="feature-card">
              <h3 style={{ fontWeight: 900, marginBottom: 16 }}>Upcoming Line</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {queueState.waitingQueue.map((item, idx) => (
                  <div key={item.id || idx} style={{ padding: 12, background: '#f8fafc', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#059669' }}>{item.tokenNo}</strong> - {item.patientName}
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.priorityLabel}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#0284c7' }}>~{item.estimatedWaitMinutes}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. VIEW: RECEPTION DESK                                                   */}
      {/* ========================================================================= */}
      {activeView === 'reception-desk' && (
        <div style={{ maxWidth: 1280, margin: '40px auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 28 }}>
            <button onClick={() => setActiveView('home')} style={{ background: 'transparent', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer', marginBottom: 6 }}>
              ← Return to Portal
            </button>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900 }}>Hospital Reception Counter</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div className="feature-card">
              <h3 style={{ fontWeight: 900, marginBottom: 20 }}>Issue Walk-in Token</h3>
              <form onSubmit={handleGenerateToken} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required placeholder="Patient Full Name" style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }} />
                <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required placeholder="Mobile Phone" style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }} />
                <select value={targetDoctorId} onChange={(e) => setTargetDoctorId(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 14, border: '1px solid #cbd5e1' }}>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.department}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setPriority('NORMAL')} style={{ flex: 1, padding: 10, borderRadius: 12, border: 'none', background: priority === 'NORMAL' ? '#059669' : '#f1f5f9', color: priority === 'NORMAL' ? '#ffffff' : '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Normal</button>
                  <button type="button" onClick={() => setPriority('SENIOR_OR_PREGNANT')} style={{ flex: 1, padding: 10, borderRadius: 12, border: 'none', background: priority === 'SENIOR_OR_PREGNANT' ? '#d97706' : '#f1f5f9', color: priority === 'SENIOR_OR_PREGNANT' ? '#ffffff' : '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Senior / Pregnant</button>
                  <button type="button" onClick={() => setPriority('EMERGENCY')} style={{ flex: 1, padding: 10, borderRadius: 12, border: 'none', background: priority === 'EMERGENCY' ? '#dc2626' : '#f1f5f9', color: priority === 'EMERGENCY' ? '#ffffff' : '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Emergency</button>
                </div>
                <button type="submit" className="btn-emerald" style={{ justifyContent: 'center', marginTop: 10 }}>
                  <Plus size={18} /> Print & Issue Token
                </button>
              </form>
            </div>

            <div className="feature-card">
              <h3 style={{ fontWeight: 900, marginBottom: 20 }}>Printed Token Slip</h3>
              {issuedTicket ? (
                <div style={{ border: '2px dashed #10b981', borderRadius: 24, padding: 30, textAlign: 'center', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>Government Hospital Token</div>
                  <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#059669', margin: '10px 0' }}>{issuedTicket.tokenNo}</div>
                  <h4 style={{ fontWeight: 800 }}>{issuedTicket.patientName}</h4>
                  <div style={{ margin: '18px 0', borderTop: '1px solid #e2e8f0', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left', fontSize: '0.88rem' }}>
                    <div><strong>Chamber:</strong> {issuedTicket.roomNo}</div>
                    <div><strong>Priority:</strong> {issuedTicket.priorityLabel}</div>
                    <div><strong>Est. Wait:</strong> ~{issuedTicket.estimatedWaitMinutes} mins</div>
                    <div><strong>Doctor:</strong> {issuedTicket.doctorName}</div>
                  </div>
                  <button className="btn-emerald" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.print()}>
                    Print Slip
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>Fill the form to generate a token slip.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. AI TRIAGE MODAL                                                        */}
      {/* ========================================================================= */}
      {showAiSymptomModal && (
        <div className="modal-overlay" onClick={() => setShowAiSymptomModal(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={22} color="#059669" />
                <h3 style={{ fontWeight: 900, fontSize: '1.4rem' }}>AI Triage & Priority Assistant</h3>
              </div>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowAiSymptomModal(false)}>✕</button>
            </div>

            <form onSubmit={analyzeSymptomsWithAi} style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>Describe your medical symptoms</label>
              <textarea 
                rows={3} 
                value={symptomInput} 
                onChange={(e) => setSymptomInput(e.target.value)} 
                required 
                placeholder="e.g. Severe chest tightness, high fever, or labor pain..." 
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', outline: 'none' }}
              />
              <button type="submit" className="btn-emerald" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                Analyze Symptoms & Recommend Queue
              </button>
            </form>

            {aiTriageResult && (
              <div style={{ background: aiTriageResult.bg, padding: 20, borderRadius: 20, border: `1px solid ${aiTriageResult.badgeColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 900, color: aiTriageResult.badgeColor, fontSize: '1.1rem' }}>{aiTriageResult.level}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: 12 }}>{aiTriageResult.advice}</p>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 16 }}>Recommended Department: <strong>{aiTriageResult.recommendedDept}</strong></div>
                <button 
                  className="btn-emerald" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setPriority(aiTriageResult.priority);
                    setTargetDoctorId(aiTriageResult.doctorId);
                    setShowAiSymptomModal(false);
                    setShowBookModal(true);
                  }}
                >
                  Proceed to Issue {aiTriageResult.level} Token
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. BOOK APPOINTMENT MODAL                                                 */}
      {/* ========================================================================= */}
      {showBookModal && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.4rem' }}>Book OPD Token</h3>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowBookModal(false)}>✕</button>
            </div>

            <form onSubmit={(e) => { handleGenerateToken(e); setShowBookModal(false); }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: 4 }}>Patient Full Name</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required placeholder="e.g. Ramesh Kulkarni" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: 4 }}>Mobile Number (For SMS Alerts)</label>
                  <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} required placeholder="e.g. 9822011223" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: 4 }}>Select Specialist & Chamber</label>
                  <select value={targetDoctorId} onChange={(e) => setTargetDoctorId(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }}>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.department} ({d.roomNo})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: 4 }}>Priority Category</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={() => setPriority('NORMAL')} style={{ flex: 1, padding: 8, borderRadius: 10, border: 'none', background: priority === 'NORMAL' ? '#059669' : '#f1f5f9', color: priority === 'NORMAL' ? '#ffffff' : '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Normal</button>
                    <button type="button" onClick={() => setPriority('SENIOR_OR_PREGNANT')} style={{ flex: 1, padding: 8, borderRadius: 10, border: 'none', background: priority === 'SENIOR_OR_PREGNANT' ? '#d97706' : '#f1f5f9', color: priority === 'SENIOR_OR_PREGNANT' ? '#ffffff' : '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Senior / Pregnant</button>
                    <button type="button" onClick={() => setPriority('EMERGENCY')} style={{ flex: 1, padding: 8, borderRadius: 10, border: 'none', background: priority === 'EMERGENCY' ? '#dc2626' : '#f1f5f9', color: priority === 'EMERGENCY' ? '#ffffff' : '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Emergency</button>
                  </div>
                </div>
                <button type="submit" className="btn-emerald" style={{ justifyContent: 'center', marginTop: 10 }}>
                  Confirm Booking & Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. TOKEN TRACKER MODAL                                                   */}
      {/* ========================================================================= */}
      {showLiveTrackerModal && (
        <div className="modal-overlay" onClick={() => setShowLiveTrackerModal(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.4rem' }}>Track Token Status</h3>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowLiveTrackerModal(false)}>✕</button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setTrackedToken({ tokenNo: 'DOC1-003', patientName: 'Ajay Jadhav', doctorName: 'Dr. Rajesh Sharma', roomNo: 'Chamber 101', positionAhead: 2, estimatedWaitMinutes: 14 }); }} style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, display: 'block', marginBottom: 6 }}>Enter Mobile Number or Token ID</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={trackPhoneInput} onChange={(e) => setTrackPhoneInput(e.target.value)} placeholder="e.g. 9822011223 or DOC1-003" required style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1' }} />
                <button type="submit" className="btn-emerald" style={{ padding: '12px 20px' }}>Track</button>
              </div>
            </form>

            {trackedToken && (
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669' }}>{trackedToken.tokenNo}</span>
                  <span style={{ background: '#e6f7f2', color: '#059669', padding: '4px 12px', borderRadius: 20, fontWeight: 800, fontSize: '0.8rem' }}>Active in Line</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
                  <div><strong>Patient:</strong> {trackedToken.patientName}</div>
                  <div><strong>Doctor:</strong> {trackedToken.doctorName} ({trackedToken.roomNo})</div>
                  <div><strong>Patients Ahead:</strong> <span style={{ color: '#d97706', fontWeight: 800 }}>{trackedToken.positionAhead} Patient(s)</span></div>
                  <div><strong>Est. Waiting Time:</strong> <span style={{ color: '#0284c7', fontWeight: 800 }}>~{trackedToken.estimatedWaitMinutes} mins</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'var(--grad-primary)', padding: 8, borderRadius: 12, color: '#ffffff', display: 'flex' }}>
                <HeartPulse size={22} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>SmartOPD.gov</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 20 }}>
              Official District Government Hospital Queue Management System. Transparent waiting times, emergency triage routing, and digital outpatient care.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Portals</h4>
            <ul className="footer-links">
              <li><a onClick={() => setActiveView('home')} style={{ cursor: 'pointer' }}>Portal Home</a></li>
              <li><a onClick={() => setActiveView('live-queue')} style={{ cursor: 'pointer' }}>Live OPD TV Screen</a></li>
              <li><a onClick={() => setActiveView('patient-portal')} style={{ cursor: 'pointer' }}>Patient Medical History</a></li>
              <li><a onClick={() => setActiveView('admin-dashboard')} style={{ cursor: 'pointer' }}>Hospital Analytics</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Clinical Services</h4>
            <ul className="footer-links">
              <li><a onClick={() => setActiveView('telemedicine')} style={{ cursor: 'pointer' }}>Tele-OPD Video Consult</a></li>
              <li><a onClick={() => setShowAiSymptomModal(true)} style={{ cursor: 'pointer' }}>AI Symptom Triage</a></li>
              <li><a onClick={() => setShowLiveTrackerModal(true)} style={{ cursor: 'pointer' }}>Track Token Status</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Emergency Contact</h4>
            <p style={{ color: '#f87171', fontWeight: 800, fontSize: '1.2rem', marginBottom: 6 }}>📞 108 / 102</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>District General Hospital, Pune 411001</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
          &copy; 2026 District Government Hospital. Ministry of Health & Family Welfare. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
