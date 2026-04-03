import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  ListChecks, 
  Settings, 
  Moon, 
  Sun, 
  Languages, 
  Palette, 
  Search, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal,
  ExternalLink,
  Plus,
  History,
  FileSearch,
  Zap,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// --- Types ---

type Theme = 'light' | 'dark';
type Language = 'en' | 'zh';
type PantoneStyle = 
  | 'classic-blue' 
  | 'living-coral' 
  | 'ultra-violet' 
  | 'greenery' 
  | 'rose-quartz' 
  | 'serenity' 
  | 'marsala' 
  | 'radiant-orchid' 
  | 'emerald' 
  | 'tangerine-tango';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
}

interface Artifact {
  id: string;
  title: string;
  content: string;
  type: 'summary' | 'report' | 'skill' | 'analysis' | 'risk' | 'checklist';
  version: number;
  timestamp: Date;
}

// --- Constants ---

const PANTONE_STYLES: { id: PantoneStyle; name: string; color: string }[] = [
  { id: 'classic-blue', name: 'Classic Blue', color: '#0f4c81' },
  { id: 'living-coral', name: 'Living Coral', color: '#ff6f61' },
  { id: 'ultra-violet', name: 'Ultra Violet', color: '#5f4b8b' },
  { id: 'greenery', name: 'Greenery', color: '#88b04b' },
  { id: 'rose-quartz', name: 'Rose Quartz', color: '#f7cac9' },
  { id: 'serenity', name: 'Serenity', color: '#92a8d1' },
  { id: 'marsala', name: 'Marsala', color: '#955251' },
  { id: 'radiant-orchid', name: 'Radiant Orchid', color: '#b565a7' },
  { id: 'emerald', name: 'Emerald', color: '#009473' },
  { id: 'tangerine-tango', name: 'Tangerine Tango', color: '#dd4124' },
];

const DEFAULT_TEMPLATE = `FDA醫療器材網路安全指引文件
FDA認為需要透過一套強而有力的網路安全規範，來確保數位醫療器材的安全性及有效性，因此於2022年4月8日公布「醫療器材的網路安全：品質管理系統的相關考量與上市前提交文件內容」(即Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submission)的指引文件，一方面，這個新版本，是為了要取代2018年所發布的舊指引文件，並進一步強化醫療器材設計的安全性(因為在設計開發的最初即做好評估，就可以有效減少「整體產品生命週期」【Total Product Lifecycle】中的網路安全風險)，而另一方面，FDA藉著對此類型產品上市前申請(Premarket Submission)所需提繳的文件內容中有關網路安全的部分做出更清楚說明的方式，以一併解決網路安全性的疑慮。根據觀察，在這份新的指引草案中，有兩大重點，分別為：(一)產品安全開發架構(A Secure Product Development Framework)以及(二)提升「網路安全透明度」(Cybersecurity Transparency)．其中重點包含：
(一) 產品安全開發架構：
FDA提供相當完整的架構，使醫療器材製造商可以提供完整的文件供審核，其重點就在於網路安全的風險分析、提供完整的醫療器材連接架構(包含連接網路或是其他醫療器材)以及最後要做的網路安全測試，因此，透過這樣的架構，便可以評估產品開發到上市可能遇到的威脅，然後有效的降低這些危險。
(二) 提升網路安全透明度：
提升網路安全透明度則是需要提供可能的網路風險給使用者，使其知道潛在的風險在哪，以及該如何去避免，透過這樣的風險告知，讓使用者在使用醫療器材時可以維持其安全性及有效性。
 
小結
FDA意識到醫療器材網路安全是整個醫療系統使用者共同的責任，亦即製造商、醫院和相關醫護機構必須共同努力來管理網路安全風險，故在這份新指引中，提供了相當完整的架構，值得醫療器材相關產業的參與者參考。

參考資料
1. For more information about the “Digital Health”, please refer to this website:
https://www.fda.gov/medical-devices/digital-health-center-excellence/what-digital-health 
2. For more information about the “Cybersecurity”, please refer to this website:
https://www.fda.gov/medical-devices/digital-health-center-excellence/cybersecurity 
3. For more information about the ”Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submission”, please refer to this website:
https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-system-considerations
-and-content-premarket-submissions`;

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  collapsed 
}: { 
  icon: any; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  collapsed: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
    }`}
  >
    <Icon size={20} />
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
  </button>
);

const StatusChip = ({ label, status }: { label: string; status: 'online' | 'busy' | 'offline' }) => (
  <div className="flex items-center gap-2 px-3 py-1 bg-accent rounded-full border border-border">
    <div className={`w-2 h-2 rounded-full ${
      status === 'online' ? 'bg-green-500 animate-pulse' : 
      status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
    }`} />
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
  </div>
);

// --- Main App ---

export default function App() {
  // UI State
  const [theme, setTheme] = useState<Theme>('light');
  const [lang, setLang] = useState<Language>('en');
  const [style, setStyle] = useState<PantoneStyle>('classic-blue');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // MDRI State
  const [inputText, setInputText] = useState('');
  const [templateText, setTemplateText] = useState(DEFAULT_TEMPLATE);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [mdriStep, setMdriStep] = useState(0); // 0: Input, 1: Summary, 2: Report, 3: Skill

  // AI Features State
  const [analysisResult, setAnalysisResult] = useState('');
  const [riskResult, setRiskResult] = useState('');
  const [checklistResult, setChecklistResult] = useState('');

  const logEndRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');
  const randomizeStyle = () => {
    const random = PANTONE_STYLES[Math.floor(Math.random() * PANTONE_STYLES.length)];
    setStyle(random.id);
    addLog(`Style changed to ${random.name}`, 'info');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-style', style);
  }, [theme, style]);

  // --- AI Logic ---

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), []);

  const runAgent = async (step: number) => {
    if (!inputText) {
      addLog('Please provide input text first.', 'error');
      return;
    }

    setIsProcessing(true);
    addLog(`Starting MDRI Agent Step ${step}...`, 'ai');

    try {
      let prompt = '';
      let model = 'gemini-3-flash-preview';
      let tools: any[] = [];

      if (step === 1) {
        prompt = `You are a Medical Device Regulatory Expert. 
        Task: Perform web research and create a comprehensive summary of regulations/guidance related to the following input.
        Input: ${inputText}
        Output Language: ${lang === 'en' ? 'English' : 'Traditional Chinese (繁體中文)'}
        Requirements:
        - Word count: 2000-3000 words.
        - Include an Executive Summary.
        - Include a Regulatory Landscape overview.
        - Include Key Requirements.
        - Include an Evidence Map (table).
        - Include Sources consulted with URLs.
        - Format: Markdown.`;
        tools = [{ googleSearch: {} }];
      } else if (step === 2) {
        const summary = artifacts.find(a => a.type === 'summary')?.content || '';
        prompt = `You are a Medical Device Regulatory Expert.
        Task: Generate a comprehensive regulation report based on the following summary and template.
        Summary: ${summary}
        Template: ${templateText}
        Output Language: ${lang === 'en' ? 'English' : 'Traditional Chinese (繁體中文)'}
        Requirements:
        - Word count: 3000-4000 words.
        - Align strictly to the template structure.
        - Include detailed impact analysis.
        - Include recommendations for manufacturers.
        - Format: Markdown.`;
      } else if (step === 3) {
        const report = artifacts.find(a => a.type === 'report')?.content || '';
        prompt = `You are an AI Skill Architect.
        Task: Create a 'skill.md' that describes how an agent should reliably produce a comprehensive medical device regulation report for similar inputs in the future.
        Context: ${report}
        Output Language: ${lang === 'en' ? 'English' : 'Traditional Chinese (繁體中文)'}
        Requirements:
        - Follow the 'Skill Creator' pattern: name, description (with trigger guidance), inputs required, workflow steps, output format templates, quality checklist, and test prompts.
        - Ensure the description is 'pushy' to encourage correct triggering.
        - Include specific contexts for when to use this skill.
        - Format: Markdown.`;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { tools }
      });

      let content = response.text || 'No content generated.';
      
      // Extract grounding metadata if available
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        const sources = groundingMetadata.groundingChunks
          .map((chunk: any) => chunk.web ? `* [${chunk.web.title}](${chunk.web.uri})` : null)
          .filter(Boolean)
          .join('\n');
        
        if (sources) {
          content += `\n\n---\n### Web Research Sources\n${sources}`;
        }
      }

      const type = step === 1 ? 'summary' : step === 2 ? 'report' : 'skill';
      const title = step === 1 ? 'Web-Researched Summary' : step === 2 ? 'Regulation Report' : 'Reusable Skill.md';

      const newArtifact: Artifact = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        content,
        type,
        version: 1,
        timestamp: new Date()
      };

      setArtifacts(prev => [...prev, newArtifact]);
      setCurrentArtifact(newArtifact);
      setMdriStep(step);
      addLog(`Step ${step} completed successfully.`, 'success');
    } catch (error: any) {
      addLog(`Error in Step ${step}: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const runAdditionalAI = async (type: 'analysis' | 'risk' | 'checklist') => {
    if (!inputText) return;
    setIsProcessing(true);
    addLog(`Running AI ${type}...`, 'ai');

    try {
      let prompt = '';
      if (type === 'analysis') {
        prompt = `Perform a Regulatory Gap Analysis for this medical device description: ${inputText}. Compare it against general FDA cybersecurity expectations. Output in Markdown.`;
      } else if (type === 'risk') {
        prompt = `Identify potential cybersecurity risks for this medical device: ${inputText}. Provide a risk matrix and mitigation strategies. Output in Markdown.`;
      } else if (type === 'checklist') {
        prompt = `Create a Premarket Submission Checklist for this medical device based on FDA cybersecurity guidance: ${inputText}. Output in Markdown.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const content = response.text || '';
      if (type === 'analysis') setAnalysisResult(content);
      if (type === 'risk') setRiskResult(content);
      if (type === 'checklist') setChecklistResult(content);
      
      addLog(`AI ${type} completed.`, 'success');
    } catch (error: any) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Renderers ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-wow p-6 bg-gradient-to-br from-primary/10 to-transparent"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Sparkles size={24} />
            </div>
            <span className="text-xs font-bold text-primary uppercase">Active Session</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{artifacts.length}</h3>
          <p className="text-muted-foreground text-sm">Artifacts Generated</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-wow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xs font-bold text-green-500 uppercase">System Health</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">Optimal</h3>
          <p className="text-muted-foreground text-sm">All AI agents online</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-wow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
              <Zap size={24} />
            </div>
            <span className="text-xs font-bold text-purple-500 uppercase">Performance</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">98.4%</h3>
          <p className="text-muted-foreground text-sm">Accuracy rating</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-wow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <History size={20} className="text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  log.type === 'success' ? 'bg-green-500' :
                  log.type === 'error' ? 'bg-red-500' :
                  log.type === 'ai' ? 'bg-primary' : 'bg-muted-foreground'
                }`} />
                <div>
                  <p className="font-medium">{log.message}</p>
                  <p className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-muted-foreground italic">No activity yet.</p>}
          </div>
        </div>

        <div className="card-wow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveTab('mdri')} className="p-4 rounded-xl border border-border hover:bg-accent transition-all text-left group">
              <FileSearch size={20} className="mb-2 text-primary group-hover:scale-110 transition-transform" />
              <p className="font-bold text-sm">Start MDRI</p>
              <p className="text-xs text-muted-foreground">New regulation report</p>
            </button>
            <button onClick={() => setActiveTab('features')} className="p-4 rounded-xl border border-border hover:bg-accent transition-all text-left group">
              <ShieldCheck size={20} className="mb-2 text-green-500 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-sm">Risk Analysis</p>
              <p className="text-xs text-muted-foreground">Quick security check</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMDRI = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-wow p-6">
            <h3 className="text-lg font-bold mb-4">1. Input Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Regulatory Content</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste news, guidance, or standards text here..."
                  className="input-wow h-40 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Report Template</label>
                <textarea 
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className="input-wow h-40 resize-none text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="card-wow p-6">
            <h3 className="text-lg font-bold mb-4">2. Agent Chain</h3>
            <div className="space-y-3">
              {[
                { step: 1, label: 'Web-Researched Summary', icon: Search },
                { step: 2, label: 'Regulation Report', icon: FileText },
                { step: 3, label: 'Generate Skill.md', icon: Zap }
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => runAgent(item.step)}
                  disabled={isProcessing || (item.step > 1 && !artifacts.some(a => a.type === (item.step === 2 ? 'summary' : 'report')))}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    mdriStep >= item.step 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-card border-border hover:bg-accent'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  {isProcessing && mdriStep === item.step - 1 ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : mdriStep >= item.step ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Artifact Viewer */}
        <div className="lg:col-span-8">
          <div className="card-wow h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-primary" />
                <h3 className="font-bold">Artifact Viewer</h3>
                {currentArtifact && (
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-bold uppercase">
                    {currentArtifact.type} v{currentArtifact.version}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-accent rounded-lg transition-colors" title="Download">
                  <Download size={18} />
                </button>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors" title="External Link">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {currentArtifact ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentArtifact.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <div className="p-6 bg-accent rounded-full">
                    <Sparkles size={48} className="opacity-20" />
                  </div>
                  <p className="font-medium">No artifact selected. Run an agent to begin.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'analysis', title: 'Gap Analysis', icon: FileSearch, result: analysisResult, color: 'text-blue-500' },
          { id: 'risk', title: 'Risk Matrix', icon: ShieldCheck, result: riskResult, color: 'text-red-500' },
          { id: 'checklist', title: 'Submission Checklist', icon: ListChecks, result: checklistResult, color: 'text-green-500' }
        ].map((feat) => (
          <div key={feat.id} className="card-wow flex flex-col h-[600px]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <feat.icon size={20} className={feat.color} />
                <h3 className="font-bold">{feat.title}</h3>
              </div>
              <button 
                onClick={() => runAdditionalAI(feat.id as any)}
                disabled={isProcessing || !inputText}
                className="p-2 hover:bg-accent rounded-lg text-primary disabled:opacity-50"
              >
                <Sparkles size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {feat.result ? (
                <div className="markdown-body text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{feat.result}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                  Click Sparkles to generate.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card-wow p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Palette size={20} className="text-primary" />
          Appearance & Style
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold mb-3 block">Pantone Color Palette</label>
            <div className="grid grid-cols-5 gap-3">
              {PANTONE_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`group relative h-12 rounded-lg transition-all ${
                    style === s.id ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: s.color }}
                  title={s.name}
                >
                  {style === s.id && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">Jackslot Style</p>
                <p className="text-xs text-muted-foreground">Randomize your workspace vibe</p>
              </div>
            </div>
            <button onClick={randomizeStyle} className="btn-wow btn-primary text-xs">Roll Style</button>
          </div>
        </div>
      </div>

      <div className="card-wow p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Languages size={20} className="text-primary" />
          Localization & Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Interface Language</p>
            <button onClick={toggleLang} className="btn-wow btn-outline flex items-center gap-2">
              <Languages size={16} />
              {lang === 'en' ? 'English' : '繁體中文'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Dark Mode</p>
            <button onClick={toggleTheme} className="btn-wow btn-outline flex items-center gap-2">
              {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'light' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFollowUp = () => (
    <div className="mt-12 pt-12 border-t border-border">
      <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <HelpCircle size={28} className="text-primary" />
        Comprehensive Follow-up Questions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "How does the 2022 FDA guidance differ from the 2018 version in terms of TPLC?",
          "What are the specific requirements for a Software Bill of Materials (SBOM)?",
          "How should manufacturers handle legacy devices under the new cybersecurity rules?",
          "What is the role of the Secure Product Development Framework (SPDF)?",
          "How does FDA define 'Cybersecurity Transparency' for end-users?",
          "What are the key elements of a Post-Market Management Plan?",
          "How should vulnerability disclosure programs be structured?",
          "What is the impact of the PATCH Act on medical device submissions?",
          "How do these requirements align with international standards like ISO 81001-5-1?",
          "What are the common pitfalls in cybersecurity risk assessments for SaMD?",
          "How should cloud-based medical device components be secured?",
          "What are the documentation requirements for multi-device connectivity?",
          "How does the FDA evaluate the effectiveness of cybersecurity controls?",
          "What is the expected timeline for FDA review of cybersecurity documentation?",
          "How should manufacturers prioritize vulnerabilities found during testing?",
          "What are the best practices for implementing secure boot and code signing?",
          "How does the FDA view the use of open-source software in medical devices?",
          "What are the requirements for user authentication and access control?",
          "How should data encryption be implemented for data at rest and in transit?",
          "What are the specific cybersecurity considerations for AI/ML-enabled devices?"
        ].map((q, i) => (
          <div key={i} className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group flex gap-3">
            <span className="text-primary font-bold opacity-50">{i + 1}.</span>
            <p className="text-sm font-medium group-hover:text-primary transition-colors">{q}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex bg-background text-foreground transition-colors duration-300`}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="fixed left-0 top-0 h-full bg-card border-r border-border z-50 flex flex-col"
      >
        <div className="p-6 flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-primary"
            >
              <Sparkles size={24} fill="currentColor" />
              <span className="font-display font-bold text-xl tracking-tight">MedReg AI</span>
            </motion.div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-accent rounded-lg text-muted-foreground"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={LayoutDashboard} 
            label={lang === 'en' ? 'Dashboard' : '儀表板'} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            icon={FileSearch} 
            label={lang === 'en' ? 'MDRI Studio' : '法規研究室'} 
            active={activeTab === 'mdri'} 
            onClick={() => setActiveTab('mdri')}
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            icon={Zap} 
            label={lang === 'en' ? 'AI Features' : 'AI 功能'} 
            active={activeTab === 'features'} 
            onClick={() => setActiveTab('features')}
            collapsed={sidebarCollapsed}
          />
          <SidebarItem 
            icon={Settings} 
            label={lang === 'en' ? 'Settings' : '設定'} 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            collapsed={sidebarCollapsed}
          />
        </nav>

        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              JD
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">Regulatory Officer</p>
                <p className="text-xs text-muted-foreground truncate">Premium Access</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-display">
              {activeTab === 'dashboard' ? (lang === 'en' ? 'System Overview' : '系統概覽') :
               activeTab === 'mdri' ? (lang === 'en' ? 'Medical Device Regulation Intelligence' : '醫療器材法規情報') :
               activeTab === 'features' ? (lang === 'en' ? 'Advanced AI Analysis' : '進階 AI 分析') :
               (lang === 'en' ? 'Workspace Settings' : '工作區設定')}
            </h2>
            <StatusChip label="Gemini 3.1" status="online" />
            <StatusChip label="Web Search" status="online" />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button onClick={toggleLang} className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
              <Languages size={20} />
            </button>
            <div className="h-6 w-px bg-border mx-2" />
            <button className="btn-wow btn-primary flex items-center gap-2 text-sm">
              <Sparkles size={16} />
              {lang === 'en' ? 'New Project' : '新專案'}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'mdri' && renderMDRI()}
              {activeTab === 'features' && renderFeatures()}
              {activeTab === 'settings' && renderSettings()}
            </motion.div>
          </AnimatePresence>

          {/* Live Log Footer */}
          <div className="mt-12 card-wow overflow-hidden">
            <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Terminal size={14} />
                Live System Logs
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-muted-foreground">STREAMING_ACTIVE</span>
              </div>
            </div>
            <div className="h-32 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-black/5 dark:bg-black/20">
              {logs.map(log => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-muted-foreground">[{log.timestamp.toLocaleTimeString()}]</span>
                  <span className={`font-bold ${
                    log.type === 'success' ? 'text-green-500' :
                    log.type === 'error' ? 'text-red-500' :
                    log.type === 'ai' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {log.type.toUpperCase()}:
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {renderFollowUp()}
        </div>
      </main>
    </div>
  );
}
