/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User as UserIcon, 
  Heart, 
  BookOpen, 
  ShieldAlert, 
  Send, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Compass, 
  Flame, 
  Layers, 
  Copy, 
  Terminal,
  Activity,
  Calendar,
  LogOut
} from 'lucide-react';

interface AuthUser {
  _id: string;
  nombre_completo: string;
  email: string;
  fecha_nacimiento: string;
}

interface Profile {
  _id: string;
  usuario_id: any;
  numero_vida: number;
  numero_expresion: number;
  numero_alma: number;
  createdAt?: string;
}

interface ReadingResult {
  _id?: string;
  tipo_lectura: string;
  cache?: boolean;
  modelo?: string;
  tokens_usados?: number;
  respuesta: {
    resumen?: string;
    interpretacion_numero_vida?: string;
    interpretacion_numero_expresion?: string;
    interpretacion_numero_alma?: string;
    fortalezas?: string[];
    areas_de_trabajo?: string[];
    numero_destacado?: number;
  };
}

interface MatchResult {
  _id: string;
  puntaje_calculado: number;
  interpretacion_ia: string;
  usuario_id_1: string;
  usuario_id_2: string;
  createdAt?: string;
}

interface AuditLogItem {
  _id: string;
  endpoint: string;
  metodo: string;
  status_code: number;
  timestamp: string;
  user_id?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'readings' | 'compatibility' | 'users' | 'audit' | 'endpoints'>('calculator');
  
  // Auth state
  const [token, setToken] = useState<string>(() => localStorage.getItem('numerologia_token') || '');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('numerologia_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Calculator inputs
  const [calcName, setCalcName] = useState('Ana Ejemplo');
  const [calcBirthDate, setCalcBirthDate] = useState('1995-06-15');
  const [calcLifeNum, setCalcLifeNum] = useState<number>(7);
  const [calcExpNum, setCalcExpNum] = useState<number>(3);
  const [calcSoulNum, setCalcSoulNum] = useState<number>(9);

  // Data collections from API
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [readingsList, setReadingsList] = useState<ReadingResult[]>([]);
  const [matchesList, setMatchesList] = useState<MatchResult[]>([]);
  const [usersList, setUsersList] = useState<AuthUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Action states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Forms
  const [loginEmail, setLoginEmail] = useState('ana@example.com');
  const [loginPassword, setLoginPassword] = useState('clave-segura-123');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regDate, setRegDate] = useState('1995-06-15');

  // Reading form
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedReadingType, setSelectedReadingType] = useState('general');
  const [latestReading, setLatestReading] = useState<ReadingResult | null>(null);

  // Compatibility form
  const [ownProfileId, setOwnProfileId] = useState('');
  const [otherProfileId, setOtherProfileId] = useState('');
  const [latestMatch, setLatestMatch] = useState<MatchResult | null>(null);

  // Helper calculation functions
  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return num;
  };

  const calculateLifePath = (dateStr: string) => {
    if (!dateStr) return 1;
    const digits = dateStr.replace(/\D/g, '');
    const sum = digits.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    return Math.max(1, reduceToSingleDigit(sum));
  };

  const calculatePythagorean = (text: string, vowelsOnly: boolean = false) => {
    const letterValues: Record<string, number> = {
      a: 1, j: 1, s: 1,
      b: 2, k: 2, t: 2,
      c: 3, l: 3, u: 3,
      d: 4, m: 4, v: 4,
      e: 5, n: 5, w: 5,
      f: 6, o: 6, x: 6,
      g: 7, p: 7, y: 7,
      h: 8, q: 8, z: 8,
      i: 9, r: 9
    };
    const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú']);
    const clean = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let sum = 0;
    for (const char of clean) {
      if (vowelsOnly && !vowels.has(char)) continue;
      if (letterValues[char]) {
        sum += letterValues[char];
      }
    }
    return sum === 0 ? 1 : Math.max(1, reduceToSingleDigit(sum));
  };

  // Recalculate on inputs change
  useEffect(() => {
    setCalcLifeNum(calculateLifePath(calcBirthDate));
    setCalcExpNum(calculatePythagorean(calcName, false));
    setCalcSoulNum(calculatePythagorean(calcName, true));
  }, [calcName, calcBirthDate]);

  // Load basic resources on mount
  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/v1/numerology-profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(Array.isArray(data) ? data : []);
        if (data.length > 0 && !selectedProfileId) {
          setSelectedProfileId(data[0]._id);
          setOwnProfileId(data[0]._id);
          if (data.length > 1) {
            setOtherProfileId(data[1]._id);
          }
        }
      }
    } catch (err) {
      console.warn("No se pudo cargar perfiles:", err);
    }
  };

  const fetchReadings = async () => {
    try {
      const res = await fetch('/api/v1/readings');
      if (res.ok) {
        const data = await res.json();
        setReadingsList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("No se pudo cargar lecturas:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/v1/compatibility-matches');
      if (res.ok) {
        const data = await res.json();
        setMatchesList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("No se pudo cargar compatibilidad:", err);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/users', {
        headers: { 'x-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("No se pudo cargar usuarios:", err);
    }
  };

  const fetchAuditLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/audit-logs', {
        headers: { 'x-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn("No se pudo cargar auditoría:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchReadings();
    fetchMatches();
    if (token) {
      fetchUsers();
      fetchAuditLogs();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password_hash: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setCurrentUser(data.usuario);
        localStorage.setItem('numerologia_token', data.token);
        localStorage.setItem('numerologia_user', JSON.stringify(data.usuario));
        setMessage({ type: 'success', text: `¡Sesión iniciada con éxito! Bienvenido, ${data.usuario.nombre_completo}` });
      } else {
        setMessage({ type: 'error', text: data.mensaje || 'Error al iniciar sesión' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: regName,
          email: regEmail,
          password_hash: regPass,
          fecha_nacimiento: regDate
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.' });
        setLoginEmail(regEmail);
        setLoginPassword(regPass);
      } else {
        const errDetail = data.errores ? data.errores.map((e: any) => e.mensaje).join(', ') : data.mensaje;
        setMessage({ type: 'error', text: errDetail || 'Error al registrar' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('numerologia_token');
    localStorage.removeItem('numerologia_user');
    setMessage({ type: 'success', text: 'Sesión cerrada correctamente' });
  };

  const handleCreateProfile = async () => {
    if (!token || !currentUser) {
      setMessage({ type: 'error', text: 'Debes iniciar sesión con un token para crear tu perfil en MongoDB' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/numerology-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        },
        body: JSON.stringify({
          usuario_id: currentUser._id,
          numero_vida: calcLifeNum,
          numero_expresion: calcExpNum,
          numero_alma: calcSoulNum
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: '¡Perfil numerológico guardado en MongoDB con éxito!' });
        fetchProfiles();
      } else {
        setMessage({ type: 'error', text: data.mensaje || 'Error al guardar el perfil' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReading = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Se requiere iniciar sesión (Token JWT) para solicitar lecturas a Gemini' });
      return;
    }
    if (!selectedProfileId) {
      setMessage({ type: 'error', text: 'Selecciona o crea primero un perfil numerológico' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/readings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        },
        body: JSON.stringify({
          perfil_id: selectedProfileId,
          tipo_lectura: selectedReadingType
        })
      });
      const data = await res.json();
      if (res.ok) {
        setLatestReading(data);
        fetchReadings();
        setMessage({ 
          type: 'success', 
          text: data.cache 
            ? 'Lectura recuperada desde la base de datos (Caché)' 
            : '¡Nueva lectura generada exitosamente con Gemini AI!' 
        });
      } else {
        setMessage({ type: 'error', text: data.mensaje || 'No se pudo generar la lectura' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al conectar con la API' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCompatibility = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Se requiere iniciar sesión (Token JWT) para generar análisis de compatibilidad' });
      return;
    }
    if (!ownProfileId || !otherProfileId) {
      setMessage({ type: 'error', text: 'Selecciona ambos perfiles para comparar' });
      return;
    }
    if (ownProfileId === otherProfileId) {
      setMessage({ type: 'error', text: 'Debes seleccionar dos perfiles de usuarios distintos' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/compatibility-matches/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token
        },
        body: JSON.stringify({
          perfil_id_propio: ownProfileId,
          perfil_id_compatibilidad: otherProfileId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setLatestMatch(data);
        fetchMatches();
        setMessage({ type: 'success', text: '¡Análisis de compatibilidad generado con Gemini!' });
      } else {
        setMessage({ type: 'error', text: data.mensaje || 'No se pudo generar el análisis' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al conectar con la API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-200 via-white to-pink-200 bg-clip-text text-transparent">
                Numerología & IA
              </h1>
              <p className="text-xs text-slate-400">Plataforma & API REST v1</p>
            </div>
          </div>

          {/* User auth badge */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  {currentUser.nombre_completo.charAt(0)}
                </div>
                <div className="text-left pr-2">
                  <div className="text-xs font-semibold text-slate-200">{currentUser.nombre_completo}</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Autenticado (JWT)
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('users')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium"
              >
                <Key className="w-3.5 h-3.5" />
                Iniciar sesión / Registro
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition font-medium whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            Calculadora & Perfil
          </button>

          <button
            onClick={() => setActiveTab('readings')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition font-medium whitespace-nowrap ${
              activeTab === 'readings'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Lecturas IA (Gemini)
          </button>

          <button
            onClick={() => setActiveTab('compatibility')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition font-medium whitespace-nowrap ${
              activeTab === 'compatibility'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            Compatibilidad IA
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition font-medium whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Usuarios & Token JWT
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition font-medium whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Auditoría (AuditLogs)
          </button>

          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition font-medium whitespace-nowrap ${
              activeTab === 'endpoints'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Consola API & Postman
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {message && (
        <div className={`p-3 text-sm flex items-center justify-between border-b ${
          message.type === 'success' 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
            : 'bg-rose-950/80 text-rose-300 border-rose-800'
        }`}>
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 w-full">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-75 hover:opacity-100 px-2">✕</button>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* TAB 1: CALCULATOR & PROFILES */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Flame className="w-4 h-4" />
                  Cálculo Pitagórico
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Calculadora Numerológica</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Genera al instante tus tres números clave para registrar tu perfil en MongoDB: Número de Vida, de Expresión y de Alma.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={calcName}
                      onChange={(e) => setCalcName(e.target.value)}
                      placeholder="Ej: Ana Ejemplo"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={calcBirthDate}
                      onChange={(e) => setCalcBirthDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Numbers Preview Cards */}
                <div className="grid grid-cols-3 gap-3 my-6">
                  <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3 text-center">
                    <span className="text-[10px] text-purple-400 uppercase font-semibold">Número de Vida</span>
                    <div className="text-3xl font-extrabold text-white my-1">{calcLifeNum}</div>
                    <span className="text-[10px] text-slate-500">Día + Mes + Año</span>
                  </div>

                  <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-3 text-center">
                    <span className="text-[10px] text-indigo-400 uppercase font-semibold">Expresión</span>
                    <div className="text-3xl font-extrabold text-white my-1">{calcExpNum}</div>
                    <span className="text-[10px] text-slate-500">Todas las letras</span>
                  </div>

                  <div className="bg-slate-950 border border-pink-500/30 rounded-xl p-3 text-center">
                    <span className="text-[10px] text-pink-400 uppercase font-semibold">Alma</span>
                    <div className="text-3xl font-extrabold text-white my-1">{calcSoulNum}</div>
                    <span className="text-[10px] text-slate-500">Solo vocales</span>
                  </div>
                </div>

                <button
                  onClick={handleCreateProfile}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Guardar Perfil en la Base de Datos (`POST /numerology-profiles`)
                </button>
                {!currentUser && (
                  <p className="text-[11px] text-amber-400/90 text-center mt-2">
                    * Recuerda iniciar sesión en la pestaña "Usuarios" para vincular tu perfil.
                  </p>
                )}
              </div>
            </div>

            {/* Profiles in Database list */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Perfiles en Base de Datos</h2>
                    <p className="text-xs text-slate-400">Colección `numerologyprofiles` en MongoDB</p>
                  </div>
                  <button
                    onClick={fetchProfiles}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Actualizar
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 max-h-[460px] pr-1">
                  {profiles.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      No hay perfiles creados aún en MongoDB. ¡Guarda uno desde la calculadora!
                    </div>
                  ) : (
                    profiles.map((p) => (
                      <div
                        key={p._id}
                        className={`p-4 rounded-xl border transition ${
                          selectedProfileId === p._id
                            ? 'bg-purple-950/20 border-purple-500/50 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-mono text-purple-400">ID: {p._id}</span>
                            <div className="text-sm font-semibold text-slate-200 mt-0.5">
                              {p.usuario_id?.nombre_completo || (typeof p.usuario_id === 'string' ? `Usuario: ${p.usuario_id}` : 'Perfil Registrado')}
                            </div>
                            {p.usuario_id?.email && (
                              <div className="text-xs text-slate-500">{p.usuario_id.email}</div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedProfileId(p._id);
                              setActiveTab('readings');
                            }}
                            className="text-xs bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 px-2.5 py-1 rounded-md transition"
                          >
                            Pedir Lectura →
                          </button>
                        </div>

                        <div className="flex gap-4 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[10px]">VIDA</span>
                            <span className="font-bold text-slate-200">{p.numero_vida}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">EXPRESIÓN</span>
                            <span className="font-bold text-slate-200">{p.numero_expresion}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">ALMA</span>
                            <span className="font-bold text-slate-200">{p.numero_alma}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI READINGS */}
        {activeTab === 'readings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  Servicio Gemini AI
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Generar Lectura Numerológica</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Llama al endpoint `POST /api/v1/readings/generate`. Gemini interpreta los números de vida, expresión y alma con un esquema estructurado.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Perfil a consultar</label>
                    <select
                      value={selectedProfileId}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {profiles.length === 0 ? (
                        <option value="">No hay perfiles disponibles</option>
                      ) : (
                        profiles.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.usuario_id?.nombre_completo || p._id} (Vida: {p.numero_vida}, Expr: {p.numero_expresion}, Alma: {p.numero_alma})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Lectura</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'general', label: 'General' },
                        { id: 'amor', label: 'Amor y Vínculos' },
                        { id: 'trabajo', label: 'Trabajo y Carrera' },
                        { id: 'proposito', label: 'Propósito de Vida' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedReadingType(t.id)}
                          className={`py-2 px-3 text-xs rounded-lg border font-medium transition ${
                            selectedReadingType === t.id
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateReading}
                    disabled={loading || !selectedProfileId}
                    className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Consultando a Gemini...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Generar con Gemini (`/readings/generate`)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* History list */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-200">Lecturas Guardadas</h3>
                  <span className="text-xs text-slate-500">{readingsList.length} registros</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {readingsList.map((r, i) => (
                    <div
                      key={r._id || i}
                      onClick={() => setLatestReading(r)}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer text-xs flex items-center justify-between transition"
                    >
                      <div>
                        <span className="font-semibold text-slate-300 capitalize">{r.tipo_lectura}</span>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {r.respuesta?.resumen || 'Lectura manual'}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400">Ver →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reading Output Display */}
            <div className="lg:col-span-7">
              {latestReading ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                        Tipo de Lectura: {latestReading.tipo_lectura}
                      </span>
                      <h2 className="text-xl font-bold text-white mt-1">Interpretación Numerológica</h2>
                    </div>
                    {latestReading.cache !== undefined && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        latestReading.cache 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {latestReading.cache ? 'Recuperado de Caché' : 'Generado por Gemini'}
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  {latestReading.respuesta?.resumen && (
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
                      <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-1">Resumen General</h4>
                      <p className="text-sm text-slate-200 leading-relaxed">{latestReading.respuesta.resumen}</p>
                    </div>
                  )}

                  {/* Specific numbers interpretation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {latestReading.respuesta?.interpretacion_numero_vida && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-purple-400 uppercase">Número de Vida</span>
                        <p className="text-xs text-slate-300 mt-1 leading-snug">{latestReading.respuesta.interpretacion_numero_vida}</p>
                      </div>
                    )}

                    {latestReading.respuesta?.interpretacion_numero_expresion && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">Expresión</span>
                        <p className="text-xs text-slate-300 mt-1 leading-snug">{latestReading.respuesta.interpretacion_numero_expresion}</p>
                      </div>
                    )}

                    {latestReading.respuesta?.interpretacion_numero_alma && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] font-bold text-pink-400 uppercase">Alma</span>
                        <p className="text-xs text-slate-300 mt-1 leading-snug">{latestReading.respuesta.interpretacion_numero_alma}</p>
                      </div>
                    )}
                  </div>

                  {/* Strengths and Growth Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {latestReading.respuesta?.fortalezas && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Fortalezas Clave
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {latestReading.respuesta.fortalezas.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {latestReading.respuesta?.areas_de_trabajo && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          Áreas de Crecimiento
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {latestReading.respuesta.areas_de_trabajo.map((a, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Highlighted number */}
                  {latestReading.respuesta?.numero_destacado && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-400">Número más influyente en esta lectura:</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold rounded-lg border border-purple-500/30">
                        Número {latestReading.respuesta.numero_destacado}
                      </span>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                    <span>Modelo: {latestReading.modelo || 'gemini-2.5-flash'}</span>
                    {latestReading.tokens_usados && <span>Tokens: {latestReading.tokens_usados}</span>}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <BookOpen className="w-12 h-12 stroke-[1.5] mb-3 text-slate-600" />
                  <p className="text-base font-medium text-slate-400">Selecciona un perfil y genera una lectura</p>
                  <p className="text-xs max-w-sm mt-1">
                    Gemini evaluará las vibraciones de tus números para darte consejos prácticos y certeros.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COMPATIBILITY */}
        {activeTab === 'compatibility' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Heart className="w-4 h-4" />
                  Sinergia de Pareja o Socios
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Análisis de Compatibilidad</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Endpoint `POST /api/v1/compatibility-matches/analyze`. Compara dos perfiles y Gemini genera un puntaje de 0 a 100 con su interpretación.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Perfil Propio (Autenticado)</label>
                    <select
                      value={ownProfileId}
                      onChange={(e) => setOwnProfileId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
                    >
                      {profiles.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.usuario_id?.nombre_completo || p._id} (Vida: {p.numero_vida})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Perfil de la otra persona</label>
                    <select
                      value={otherProfileId}
                      onChange={(e) => setOtherProfileId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-pink-500"
                    >
                      {profiles.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.usuario_id?.nombre_completo || p._id} (Vida: {p.numero_vida})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAnalyzeCompatibility}
                    disabled={loading || !ownProfileId || !otherProfileId}
                    className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analizando con Gemini...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Calcular Compatibilidad (`/compatibility-matches/analyze`)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Matches History */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-200 mb-3">Historial de Compatibilidades</h3>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {matchesList.map((m) => (
                    <div
                      key={m._id}
                      onClick={() => setLatestMatch(m)}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-pink-500/50 cursor-pointer text-xs flex items-center justify-between transition"
                    >
                      <div>
                        <span className="font-bold text-pink-400">{m.puntaje_calculado}% de afinidad</span>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{m.interpretacion_ia}</div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Ver →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Match Result Display */}
            <div className="lg:col-span-7">
              {latestMatch ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">
                    Resultado de Compatibilidad
                  </span>

                  <div className="relative inline-flex items-center justify-center my-4">
                    <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center p-1 shadow-2xl shadow-pink-500/30">
                      <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{latestMatch.puntaje_calculado}%</span>
                        <span className="text-[10px] uppercase font-semibold text-pink-400 tracking-wider">Afinidad</span>
                      </div>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-950 border border-pink-500/20 text-left">
                    <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      Interpretación de Gemini
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {latestMatch.interpretacion_ia}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Guardado en colección `compatibilitymatches` con ID: {latestMatch._id}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <Heart className="w-12 h-12 stroke-[1.5] mb-3 text-slate-600" />
                  <p className="text-base font-medium text-slate-400">Selecciona dos perfiles para comparar</p>
                  <p className="text-xs max-w-sm mt-1">
                    Gemini evaluará si sus números se complementan o presentan retos de comunicación.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: USERS & AUTH */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Login & Register */}
            <div className="lg:col-span-6 space-y-6">
              {/* Login */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1">Iniciar Sesión (`POST /users/login`)</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Autentícate para recibir el token JWT válido por 4 horas para encabezado `x-token`.
                </p>

                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Obtener Token JWT
                  </button>
                </form>
              </div>

              {/* Register */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-1">Registrar Nuevo Usuario (`POST /users`)</h3>
                <p className="text-xs text-slate-400 mb-4">
                  La contraseña se hashea de forma segura con bcrypt en el servidor.
                </p>

                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ana Ejemplo"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ana@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña (Mín. 6 caracteres)</label>
                    <input
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="clave-segura-123"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={regDate}
                      onChange={(e) => setRegDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                  >
                    Crear Cuenta
                  </button>
                </form>
              </div>
            </div>

            {/* Current Token & Users list */}
            <div className="lg:col-span-6 space-y-6">
              {/* Active Token Display */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" />
                    Token JWT Activo (`x-token`)
                  </h3>
                  {token && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(token);
                        setMessage({ type: 'success', text: 'Token JWT copiado al portapapeles' });
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar
                    </button>
                  )}
                </div>
                {token ? (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 break-all">
                    {token}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-500 text-center">
                    No hay token activo. Inicia sesión a la izquierda para autenticarte.
                  </div>
                )}
              </div>

              {/* Users list */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Usuarios Registrados (`GET /users`)</h3>
                    <p className="text-xs text-slate-400">Ruta protegida con JWT</p>
                  </div>
                  <button
                    onClick={fetchUsers}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {usersList.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-6">
                      {token ? 'No se han registrado usuarios aún' : 'Inicia sesión para listar los usuarios protegidos'}
                    </div>
                  ) : (
                    usersList.map((u) => (
                      <div key={u._id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs">
                        <div className="font-semibold text-slate-200">{u.nombre_completo}</div>
                        <div className="text-slate-400 text-[11px]">{u.email}</div>
                        <div className="font-mono text-[10px] text-slate-600 mt-1">ID: {u._id}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    Bitácora de Auditoría
                  </div>
                  <h2 className="text-xl font-bold text-white">Registros de Auditoría (`/audit-logs`)</h2>
                  <p className="text-xs text-slate-400">
                    Permite auditar llamadas, métodos HTTP, códigos de respuesta y marcas de tiempo en MongoDB.
                  </p>
                </div>
                <button
                  onClick={fetchAuditLogs}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualizar Registros
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Método</th>
                      <th className="py-2.5 px-3">Endpoint</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Fecha y Hora</th>
                      <th className="py-2.5 px-3">Usuario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                          {token ? 'No hay registros de auditoría aún en la base de datos' : 'Inicia sesión para ver registros protegidos'}
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.metodo === 'POST' ? 'bg-indigo-500/20 text-indigo-300' :
                              log.metodo === 'GET' ? 'bg-emerald-500/20 text-emerald-300' :
                              log.metodo === 'PUT' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-rose-500/20 text-rose-300'
                            }`}>
                              {log.metodo}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{log.endpoint}</td>
                          <td className="py-2.5 px-3">
                            <span className={`font-bold ${
                              log.status_code < 300 ? 'text-emerald-400' :
                              log.status_code < 400 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {log.status_code}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[120px]">
                            {log.user_id || 'Público / N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: POSTMAN & ENDPOINTS CONSOLE */}
        {activeTab === 'endpoints' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Terminal className="w-4 h-4" />
                Referencia Rápida
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Guía de Endpoints API v1</h2>
              <p className="text-xs text-slate-400 mb-6">
                Todas las rutas están listas en el backend Express. Los endpoints protegidos requieren la cabecera `x-token: &lt;JWT&gt;`.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Autenticación & Usuarios",
                    endpoints: [
                      { m: "POST", p: "/api/v1/users", auth: false, desc: "Registra cuenta de usuario" },
                      { m: "POST", p: "/api/v1/users/login", auth: false, desc: "Inicia sesión y genera Token" },
                      { m: "GET", p: "/api/v1/users", auth: true, desc: "Lista usuarios registrados" },
                      { m: "PUT", p: "/api/v1/users/:id", auth: true, desc: "Actualiza datos de usuario" }
                    ]
                  },
                  {
                    title: "Perfiles Numerológicos",
                    endpoints: [
                      { m: "GET", p: "/api/v1/numerology-profiles", auth: false, desc: "Lista perfiles (con populate)" },
                      { m: "POST", p: "/api/v1/numerology-profiles", auth: true, desc: "Crea perfil numerológico" },
                      { m: "GET", p: "/api/v1/numerology-profiles/:id", auth: false, desc: "Consulta perfil por ID" },
                      { m: "DELETE", p: "/api/v1/numerology-profiles/:id", auth: true, desc: "Elimina un perfil" }
                    ]
                  },
                  {
                    title: "Lecturas con Inteligencia Artificial",
                    endpoints: [
                      { m: "POST", p: "/api/v1/readings/generate", auth: true, desc: "Genera con Gemini (con caché)" },
                      { m: "GET", p: "/api/v1/readings", auth: false, desc: "Lista todas las lecturas" },
                      { m: "POST", p: "/api/v1/readings", auth: true, desc: "Guarda lectura manual" }
                    ]
                  },
                  {
                    title: "Compatibilidad & Auditoría",
                    endpoints: [
                      { m: "POST", p: "/api/v1/compatibility-matches/analyze", auth: true, desc: "Evalúa 2 perfiles con Gemini" },
                      { m: "GET", p: "/api/v1/compatibility-matches", auth: false, desc: "Lista análisis de compatibilidad" },
                      { m: "GET", p: "/api/v1/audit-logs", auth: true, desc: "Consulta bitácora de auditoría" }
                    ]
                  }
                ].map((group, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-slate-200 mb-3">{group.title}</h3>
                    <div className="space-y-2">
                      {group.endpoints.map((ep, eIdx) => (
                        <div key={eIdx} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              ep.m === 'POST' ? 'bg-indigo-500/20 text-indigo-300' :
                              ep.m === 'GET' ? 'bg-emerald-500/20 text-emerald-300' :
                              ep.m === 'PUT' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {ep.m}
                            </span>
                            <span className="font-mono text-slate-300">{ep.p}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            ep.auth ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500'
                          }`}>
                            {ep.auth ? 'JWT req.' : 'Público'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
