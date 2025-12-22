import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Eye,
  Settings,
  Download,
  RotateCcw,
  Microscope,
  Activity,
  Sun,
  Contrast,
  FileText,
  Ruler,
  Target,
  Brain,
  Stethoscope,
  Triangle,
  Square,
  Circle,
  ZoomIn,
  ChevronDown,
  ChevronUp,
  Aperture,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Save,
  Share2,
  Gauge,
  Camera,
  Monitor,
  PieChart,
  BarChart3,
  TrendingUp,
  Search,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Bell,
  Star,
  Heart,
  Shield,
  Award,
  Archive,
  BookOpen,
  Layers,
  Grid3X3,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Minimize2,
  Volume2,
  Wifi,
  Battery,
  Signal,
  Play,
  Pause,
  History,
  Upload,
  PrinterIcon,
  Clipboard,
  Database,
  CloudUpload,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Server,
  Zap as Lightning,
  Timer,
  RefreshCw,
  Info,
  HelpCircle,
  ExternalLink,
  Maximize,
  X,
  Plus,
  Minus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  FolderOpen,
  FileImage,
  Scan,
  MousePointer,
  Crosshair,
  Navigation,
  Compass,
  Bookmark,
  Tag,
  Flag,
  AlertCircle,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlusCircle,
  RadioIcon as Radio,
  Thermometer,
  Droplets,
  Wind,
  Sunrise,
  Moon,
  Cloud,
  Lightbulb,
  Palette,
  ImageIcon,
  VideoIcon,
  MicIcon,
  SpeakerIcon,
  HeadphonesIcon,
  VolumeX,
  Volume1,
  VolumeIcon,
  WifiOff,
  SignalZero,
  BatteryLow,
  Power,
  PowerOff
} from 'lucide-react';

export default function ProfessionalXRayPanel() {
  const [settings, setSettings] = useState({
    // Image Processing
    contrast: [45],
    brightness: [22],
    gamma: [1.2],
    clarity: [68],
    sharpness: [42],
    exposure: [0],
    windowing: [55],
    saturation: [30],
    highlights: [15],
    shadows: [-10],

    // Enhancement Features
    dentalEnhancement: true,
    noiseReduction: true,
    edgeEnhancement: true,
    adaptiveContrast: false,
    motionCorrection: true,
    artifactReduction: true,
    metalArtifactReduction: false,

    // Analysis Tools
    measurementTool: 'ruler',
    aiAssistance: true,
    realTimeAnalysis: true,
    autoCalibration: true,
    zoom: [150],
    rotation: [0],

    // Anatomical Visibility
    showTeeth: true,
    showCrown: true,
    showRoots: true,
    showJaw: true,
    showNerve: false,
    showImplants: true,
    showProblems: true,
    showAnnotations: true,
    showMeasurements: true,

    // Advanced Features
    histogramEqualization: false,
    waveletDenoising: true,
    contrastLimitedAdaptiveHistogramEqualization: false,
    unsharpMasking: true,
    bilateralFiltering: false,
    guidedFiltering: true
  });

  const [expandedSections, setExpandedSections] = useState({
    imageProcessing: true,
    aiAnalysis: false,
    anatomyView: false,
    diagnostics: true,
    patientInfo: false,
    tools: false,
    advanced: false,
    systemInfo: false
  });

  const [currentPreset, setCurrentPreset] = useState('dental');
  const [analysisProgress, setAnalysisProgress] = useState(89);
  const [activeTab, setActiveTab] = useState('processing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [notifications, setNotifications] = useState([]);

  const [patientData] = useState({
    name: 'أحمد حسن محمد',
    id: 'PT-2024-00847',
    age: 32,
    gender: 'ذكر',
    lastVisit: '2024-06-18',
    condition: 'فحص دوري',
    doctor: 'د. سارة أحمد',
    phone: '+966501234567',
    email: 'ahmed.hassan@email.com',
    address: 'الرياض، المملكة العربية السعودية',
    insuranceId: 'INS-789456123',
    bloodType: 'O+',
    allergies: 'لا توجد حساسية معروفة',
    medicalHistory: 'تاريخ عائلي لأمراض اللثة'
  });

  const [diagnosticFindings, setDiagnosticFindings] = useState([
    {
      id: 'dx_001',
      type: 'تسوس الأسنان',
      location: 'الضرس الأول العلوي الأيمن',
      severity: 'متوسط',
      confidence: 94,
      priority: 'عالي',
      enabled: true,
      description: 'تسوس يمتد إلى طبقة العاج',
      timestamp: '2024-06-21 15:42:33',
      recommendations: ['علاج تحفظي', 'حشوة مركبة', 'متابعة دورية']
    },
    {
      id: 'dx_002',
      type: 'التهاب اللثة',
      location: 'الأسنان الأمامية السفلية',
      severity: 'خفيف',
      confidence: 87,
      priority: 'متوسط',
      enabled: true,
      description: 'فقدان عظمي أفقي بسيط',
      timestamp: '2024-06-21 15:42:28',
      recommendations: ['تنظيف عميق', 'تحسين نظافة الفم', 'زيارة دورية كل 3 أشهر']
    },
    {
      id: 'dx_003',
      type: 'ضرس العقل المدفون',
      location: 'الضرس الثالث السفلي الأيسر',
      severity: 'شديد',
      confidence: 96,
      priority: 'عالي',
      enabled: false,
      description: 'انطمار أفقي مع توسع الجراب',
      timestamp: '2024-06-21 15:41:55',
      recommendations: ['استشارة جراح الفم', 'تقييم جراحي', 'مراقبة دقيقة']
    },
    {
      id: 'dx_004',
      type: 'كسر في الترميم',
      location: 'الضرس الثاني العلوي الأيسر',
      severity: 'متوسط',
      confidence: 91,
      priority: 'متوسط',
      enabled: true,
      description: 'شق في الحشوة المعدنية القديمة',
      timestamp: '2024-06-21 15:41:20',
      recommendations: ['إعادة ترميم', 'تاج خزفي', 'فحص دوري']
    }
  ]);

  const [measurementHistory] = useState([
    { id: 1, type: 'مسافة', value: '4.2 مم', location: 'جذر الضرس الأول', timestamp: '15:40' },
    { id: 2, type: 'زاوية', value: '23°', location: 'ميلان ضرس العقل', timestamp: '15:38' },
    { id: 3, type: 'مساحة', value: '2.8 مم²', location: 'تجويف التسوس', timestamp: '15:35' }
  ]);

  const presets = [
    { value: 'dental', label: 'الأسنان العام', icon: Stethoscope, color: 'bg-blue-500', description: 'فحص شامل للأسنان' },
    { value: 'endodontic', label: 'علاج الجذور', icon: Target, color: 'bg-green-500', description: 'تصوير القنوات الجذرية' },
    { value: 'periodontal', label: 'أمراض اللثة', icon: Activity, color: 'bg-orange-500', description: 'تقييم العظم السنخي' },
    { value: 'orthodontic', label: 'تقويم الأسنان', icon: Ruler, color: 'bg-purple-500', description: 'قياسات التقويم' },
    { value: 'implant', label: 'زراعة الأسنان', icon: Settings, color: 'bg-red-500', description: 'تخطيط الزراعة' },
    { value: 'pediatric', label: 'أسنان الأطفال', icon: Heart, color: 'bg-pink-500', description: 'أسنان لبنية ودائمة' },
    { value: 'oral_surgery', label: 'جراحة الفم', icon: Activity, color: 'bg-indigo-500', description: 'تخطيط جراحي' }
  ];

  const measurementTools = [
    { icon: Ruler, label: 'قياس خطي', value: 'ruler', desc: 'المسافة', unit: 'مم' },
    { icon: Triangle, label: 'قياس زاوي', value: 'angle', desc: 'الزاوية', unit: '°' },
    { icon: Circle, label: 'قياس دائري', value: 'circle', desc: 'القطر', unit: 'مم' },
    { icon: Square, label: 'قياس المساحة', value: 'area', desc: 'المساحة', unit: 'مم²' },
    { icon: Crosshair, label: 'نقطة مرجعية', value: 'point', desc: 'إحداثي', unit: 'px' },
    { icon: Navigation, label: 'مسار منحني', value: 'curve', desc: 'منحنى', unit: 'مم' }
  ];

  const systemStats = [
    { label: 'استخدام المعالج', value: 23, unit: '%', icon: Cpu, color: 'text-blue-600' },
    { label: 'استخدام الذاكرة', value: 67, unit: '%', icon: MemoryStick, color: 'text-green-600' },
    { label: 'مساحة التخزين', value: 45, unit: '%', icon: HardDrive, color: 'text-orange-600' },
    { label: 'الشبكة', value: 89, unit: 'Mbps', icon: Network, color: 'text-purple-600' }
  ];

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'شديد': return 'text-red-700 bg-red-50 border-red-200';
      case 'متوسط': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'خفيف': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'عالي': return 'text-red-600 bg-red-50';
      case 'متوسط': return 'text-orange-600 bg-orange-50';
      case 'منخفض': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSystemStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const tabs = [
    { id: 'processing', label: 'معالجة الصورة', icon: Filter, count: null },
    { id: 'analysis', label: 'التحليل الذكي', icon: Brain, count: null },
    { id: 'diagnostics', label: 'التشخيص', icon: AlertTriangle, count: diagnosticFindings.filter(f => f.enabled).length },
    { id: 'patient', label: 'بيانات المريض', icon: User, count: null },
    { id: 'tools', label: 'الأدوات', icon: Settings, count: null },
    { id: 'system', label: 'النظام', icon: Monitor, count: null }
  ];

  // Simulate real-time analysis progress
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            setIsProcessing(false);
            return 100;
          }
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const startAnalysis = () => {
    setIsProcessing(true);
    setAnalysisProgress(0);
  };

  const resetSettings = () => {
    setSettings({
      contrast: [45],
      brightness: [22],
      gamma: [1.2],
      clarity: [68],
      sharpness: [42],
      exposure: [0],
      windowing: [55],
      measurementTool: 'ruler',
      zoom: [150],
      rotation: [0]
    });
  };

  const exportData = (format) => {
    console.log(`Exporting data in ${format} format...`);
    // Simulate export functionality
  };

  const toggleDiagnostic = (id) => {
    setDiagnosticFindings(prev =>
      prev.map(finding =>
        finding.id === id ? { ...finding, enabled: !finding.enabled } : finding
      )
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900 w-full max-w-[420px] min-w-[320px] h-screen border-r border-gray-200 shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RadiologyPro</h1>
              <p className="text-sm text-gray-600 font-medium">نظام التصوير الطبي المتقدم</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`text-white border-0 shadow-sm ${systemStatus === 'healthy' ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                systemStatus === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                  'bg-gradient-to-r from-red-500 to-red-600'
              }`}>
              <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></div>
              {systemStatus === 'healthy' ? 'نشط' : systemStatus === 'warning' ? 'تحذير' : 'خطأ'}
            </Badge>
            <span className="text-xs text-gray-500 font-mono">v4.2.1</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">د. سارة أحمد</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-500" />
            <Signal className="w-4 h-4 text-green-500" />
            <Battery className="w-4 h-4 text-green-500" />
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-3 p-2 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-blue-800">معالجة الصورة...</span>
              <span className="text-sm font-bold text-blue-600">{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100 px-2">
        <div className="flex overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === id
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              {count !== null && count > 0 && (
                <Badge className="bg-red-500 text-white text-xs px-1 py-0 h-4 min-w-4">
                  {count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Processing Tab */}
        {activeTab === 'processing' && (
          <>
            {/* Presets */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Label className="text-sm font-semibold text-gray-800 mb-3 block">إعدادات التحليل المسبقة</Label>
              <div className="grid grid-cols-1 gap-2">
                {presets.map(({ value, label, icon: Icon, color, description }) => (
                  <button
                    key={value}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${currentPreset === value
                        ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    onClick={() => setCurrentPreset(value)}
                  >
                    <div className={`w-8 h-8 ${color} rounded-2xl flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-right">
                      <span className="font-medium text-sm block">{label}</span>
                      <span className="text-xs text-gray-500">{description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Processing Controls */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-semibold text-gray-800">ضوابط معالجة الصورة</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  إعادة تعيين
                </Button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'contrast', label: 'التباين', icon: Contrast, min: -50, max: 50, unit: '%' },
                  { key: 'brightness', label: 'السطوع', icon: Sun, min: -50, max: 50, unit: '%' },
                  { key: 'gamma', label: 'تصحيح جاما', icon: Aperture, min: 0.5, max: 2.5, step: 0.1, unit: '' },
                  { key: 'clarity', label: 'الوضوح', icon: Eye, min: 0, max: 100, unit: '%' },
                  { key: 'sharpness', label: 'الحدة', icon: Target, min: 0, max: 100, unit: '%' },
                  { key: 'saturation', label: 'التشبع', icon: Palette, min: -50, max: 50, unit: '%' },
                  { key: 'highlights', label: 'الإضاءات', icon: Lightbulb, min: -50, max: 50, unit: '%' },
                  { key: 'shadows', label: 'الظلال', icon: Moon, min: -50, max: 50, unit: '%' }
                ].map(({ key, label, icon: Icon, min, max, step = 1, unit }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <Label className="text-sm font-medium text-gray-700">{label}</Label>
                      </div>
                      <div className="bg-gray-100 px-3 py-1 rounded-md border">
                        <span className="text-sm font-mono text-gray-800">
                          {Array.isArray(settings[key]) ? settings[key][0] : settings[key]}{unit}
                        </span>
                      </div>
                    </div>
                    <Slider
                      value={Array.isArray(settings[key]) ? settings[key] : [settings[key]]}
                      onValueChange={(value) => updateSetting(key, value)}
                      min={min}
                      max={max}
                      step={step}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Measurement Tools */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Label className="text-sm font-semibold text-gray-800 mb-3 block">أدوات القياس والتحليل</Label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {measurementTools.map(({ icon: Icon, label, value, desc, unit }) => (
                  <button
                    key={value}
                    className={`p-3 border rounded-2xl text-center transition-all duration-200 ${settings.measurementTool === value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    onClick={() => updateSetting('measurementTool', value)}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-2" />
                    <div className="text-xs font-semibold">{label}</div>
                    <div className="text-xs opacity-75">{desc} ({unit})</div>
                  </button>
                ))}
              </div>

              {/* Zoom and Rotation Controls */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">مستوى التكبير</span>
                    <span className="text-lg font-bold text-blue-600">{settings.zoom[0]}%</span>
                  </div>
                  <Slider
                    value={settings.zoom}
                    onValueChange={(value) => updateSetting('zoom', value)}
                    min={25}
                    max={400}
                    step={25}
                    className="w-full"
                  />
                </div>

                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">زاوية الدوران</span>
                    <span className="text-lg font-bold text-blue-600">{settings.rotation[0]}°</span>
                  </div>
                  <Slider
                    value={settings.rotation}
                    onValueChange={(value) => updateSetting('rotation', value)}
                    min={-180}
                    max={180}
                    step={15}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Quick Transform Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Label className="text-sm font-semibold text-gray-800 mb-3 block">تحويلات سريعة</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" size="sm" className="p-2">
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="p-2">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="p-2">
                  <FlipHorizontal className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="p-2">
                  <FlipVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <Label className="text-sm font-semibold text-gray-800 mb-3 block">التحليل الذكي</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <div className="text-sm font-medium text-gray-700">
                    <p>التحليل الذكي قيد التشغيل</p>
                    <p className="text-xs text-gray-500">يتم استخدام الذكاء الاصطناعي لتحليل الصورة</p>
                  </div>
                </div>
                <Switch
                  checked={settings.aiAssistance}
                  onCheckedChange={(checked) => updateSetting('aiAssistance', checked)}
                  className="bg-gray-200"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div className="text-sm font-medium text-gray-700">
                    <p>التحليل في الوقت الحقيقي</p>
                    <p className="text-xs text-gray-500">الحصول على نتائج فورية أثناء المعالجة</p>
                  </div>
                </div>
                <Switch
                  checked={settings.realTimeAnalysis}
                  onCheckedChange={(checked) => updateSetting('realTimeAnalysis', checked)}
                  className="bg-gray-200"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <div className="text-sm font-medium text-gray-700">
                    <p>المعايرة التلقائية</p>
                    <p className="text-xs text-gray-500">ضبط الإعدادات تلقائيًا بناءً على الصورة</p>
                  </div>
                </div>
                <Switch
                  checked={settings.autoCalibration}
                  onCheckedChange={(checked) => updateSetting('autoCalibration', checked)}
                  className="bg-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Diagnostics Tab */}
        {activeTab === 'diagnostics' && (
          <>
            {/* Findings List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Label className="text-sm font-semibold text-gray-800 mb-3 block">نتائج التشخيص</Label>
              <div className="space-y-2">
                {diagnosticFindings.map(({ id, type, location, severity, confidence, priority, enabled, description, timestamp, recommendations }) => (
                  <div key={id} className={`p-3 rounded-2xl border transition-all duration-200 ${enabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <span className={`text-sm font-semibold ${enabled ? 'text-green-800' : 'text-red-800'}`}>{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${getSeverityColor(severity)}`}>{severity}</span>
                        <span className={`text-xs font-medium ${getPriorityColor(priority)}`}>{priority}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="font-medium text-gray-700">{location}</span> - {new Date(timestamp).toLocaleString('ar-SA')}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">{description}</div>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.map((rec, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 rounded-full px-3 py-1 border">{rec}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Button
                        variant={enabled ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleDiagnostic(id)}
                        className="text-xs"
                      >
                        {enabled ? 'إلغاء التفعيل' : 'تفعيل التحليل'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <Label className="text-sm font-semibold text-gray-800 mb-3 block">إجراءات سريعة</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  تصدير البيانات
                </Button>
                <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                  <PrinterIcon className="w-4 h-4" />
                  طباعة التقرير
                </Button>
                <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  مشاركة النتائج
                </Button>
                <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  حذف السجل
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Patient Info Tab */}
        {activeTab === 'patient' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <Label className="text-sm font-semibold text-gray-800 mb-3 block">معلومات المريض</Label>
            <div className="space-y-4">
              {Object.entries(patientData).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <Label className="text-sm font-semibold text-gray-800 mb-3 block">الأدوات</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                <Database className="w-4 h-4" />
                إدارة البيانات
              </Button>
              <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                <CloudUpload className="w-4 h-4" />
                رفع الصور
              </Button>
              <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                <HardDrive className="w-4 h-4" />
                إدارة التخزين
              </Button>
              <Button variant="outline" size="sm" className="flex items-center justify-center gap-2">
                <Cpu className="w-4 h-4" />
                أداء النظام
              </Button>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <Label className="text-sm font-semibold text-gray-800 mb-3 block">معلومات النظام</Label>
            <div className="space-y-4">
              {systemStats.map(({ label, value, unit, icon: Icon, color }, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span>{label}</span>
                  </div>
                  <span className="text-gray-900">{value}{unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}