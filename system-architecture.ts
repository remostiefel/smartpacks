/**
 * System-Architektur Visualisierung
 * 
 * Definiert die Module, Verbindungen und Datenflüsse der Anwendung
 */

export type ModuleCategory = 
  | 'frontend'
  | 'backend'
  | 'database'
  | 'external'
  | 'pedagogy';

export interface SystemModule {
  id: string;
  name: string;
  category: ModuleCategory;
  description: string;
  technologies: string[];
  features: string[];
  position?: { x: number; y: number };
}

export interface ModuleConnection {
  from: string;
  to: string;
  type: 'data' | 'api' | 'auth' | 'process';
  label: string;
  bidirectional?: boolean;
}

export interface SystemArchitecture {
  modules: SystemModule[];
  connections: ModuleConnection[];
  dataFlows: {
    name: string;
    path: string[];
    description: string;
  }[];
}

/**
 * Vollständige System-Architektur
 */
export function getSystemArchitecture(): SystemArchitecture {
  const modules: SystemModule[] = [
    // Frontend Modules
    {
      id: 'landing',
      name: 'Landing Page',
      category: 'frontend',
      description: 'Authentifizierung und Einstieg',
      technologies: ['React', 'Wouter', 'shadcn/ui'],
      features: ['Login-Formular', 'Lehrer-Auswahl', 'Passwort-Eingabe', 'Dual Auth Mode'],
      position: { x: 100, y: 100 }
    },
    {
      id: 'dashboard',
      name: 'Teacher Dashboard',
      category: 'frontend',
      description: 'Hauptansicht für Lehrpersonen',
      technologies: ['React', 'TanStack Query', 'Recharts'],
      features: ['Klassenübersicht', 'Schülerliste', 'Analytics', 'Fehlersuche'],
      position: { x: 100, y: 250 }
    },
    {
      id: 'student-detail',
      name: 'Student Detail',
      category: 'frontend',
      description: 'Detailansicht pro Schüler',
      technologies: ['React', 'Tabs', 'Forms'],
      features: ['Mathe-Fehler', 'Rechtschreibung', 'Vokabeln', 'Kreativaufgaben'],
      position: { x: 100, y: 400 }
    },
    {
      id: 'homework-gen',
      name: 'Homework Generator',
      category: 'frontend',
      description: 'Hausaufgaben-Erstellung',
      technologies: ['React', 'PDF-Export'],
      features: ['Seitenzahl-Auswahl', 'PDF-Download', 'Vorschau'],
      position: { x: 100, y: 550 }
    },
    {
      id: 'paeckchen-demo',
      name: 'Päckchen Demonstrator',
      category: 'frontend',
      description: 'Interaktives Demo-Tool',
      technologies: ['React', 'AI-Integration'],
      features: ['Fehler-Eingabe', 'Analyse', 'Empfehlungen', 'Katalog'],
      position: { x: 100, y: 700 }
    },
    {
      id: 'system-viz',
      name: 'System Visualisierung',
      category: 'frontend',
      description: 'Architektur-Übersicht',
      technologies: ['React', 'SVG', 'D3.js'],
      features: ['Modul-Graph', 'Datenfluss', 'Interaktiv'],
      position: { x: 100, y: 850 }
    },
    {
      id: 'help-center',
      name: 'Hilfe & Dokumentation',
      category: 'frontend',
      description: 'Umfassendes Hilfe-System',
      technologies: ['React', 'Markdown', 'ReactMarkdown'],
      features: ['Artikel-Suche', 'Kategorien', 'Didaktische Grundlagen', 'FAQs'],
      position: { x: 100, y: 1000 }
    },
    {
      id: 'flow-facetten',
      name: 'Flow-Facetten Assessment',
      category: 'frontend',
      description: 'Motivations- und Selbstkonzeptdiagnostik',
      technologies: ['React', 'Recharts', 'TanStack Query'],
      features: ['8-Dimensionen-Fragebogen', 'Radar-Chart', 'Ampelsystem', 'Handlungsempfehlungen'],
      position: { x: 100, y: 1150 }
    },
    {
      id: 'learning-viz',
      name: 'Lernverlaufs-Visualisierung',
      category: 'frontend',
      description: 'Analytics & Fortschritt',
      technologies: ['React', 'Recharts', 'D3.js'],
      features: ['Timeline', 'Heatmap', 'Error-Matrix', 'LED-Indikator'],
      position: { x: 100, y: 1300 }
    },
    {
      id: 'generator-training',
      name: 'Generator Training',
      category: 'frontend',
      description: 'Interaktives Lernmodul',
      technologies: ['React', 'Pattern Recognition'],
      features: ['Muster-Erkennung', 'Übungs-Szenarien', 'Gamification'],
      position: { x: 100, y: 1450 }
    },
    {
      id: 'feedback-system',
      name: 'Feedback & Support',
      category: 'frontend',
      description: 'User Feedback Collection',
      technologies: ['React', 'Forms', 'Zod Validation'],
      features: ['Bug-Reports', 'Feature-Requests', 'Ratings', 'Priority-System'],
      position: { x: 100, y: 1600 }
    },
    {
      id: 'batch-export',
      name: 'Batch Export Center',
      category: 'frontend',
      description: 'Multi-Schüler PDF-Export',
      technologies: ['React', 'Progress Tracking'],
      features: ['Klassen-Export', 'Custom Selection', 'ZIP-Download', 'Preview'],
      position: { x: 100, y: 1750 }
    },
    {
      id: 'report-generator',
      name: 'Report Generator',
      category: 'frontend',
      description: 'Umfassende Schülerberichte',
      technologies: ['React', 'PDF Export'],
      features: ['Vollständiger Bericht', 'Assessment-Übersicht', 'Fehleranalyse'],
      position: { x: 100, y: 1900 }
    },
    {
      id: 'living-life',
      name: 'Living Life Modul',
      category: 'frontend',
      description: 'Außerschulische Lernaufgaben',
      technologies: ['React', 'Context API', 'Portfolio'],
      features: ['Community-Aufgaben', 'Natur-Erkundungen', 'Kunst & Kultur', 'Portfolio-Reflexion'],
      position: { x: 100, y: 2050 }
    },
    {
      id: 'admin-dashboard',
      name: 'Admin Panel',
      category: 'frontend',
      description: 'Systemverwaltung & Analytics',
      technologies: ['React', 'Recharts', 'Admin Controls'],
      features: ['User Management', 'System Stats', 'Feature Flags', 'Database Tools'],
      position: { x: 100, y: 2200 }
    },

    // Backend Modules
    {
      id: 'api-server',
      name: 'Express API Server',
      category: 'backend',
      description: 'REST API Backend',
      technologies: ['Express.js', 'TypeScript', 'Node.js'],
      features: ['Routing', 'Middleware', 'Session-Management'],
      position: { x: 500, y: 250 }
    },
    {
      id: 'auth-service',
      name: 'Authentication',
      category: 'backend',
      description: 'Authentifizierungs-Service',
      technologies: ['Passport.js', 'OIDC', 'Sessions'],
      features: ['Local Auth', 'Replit OAuth', 'Session-Store'],
      position: { x: 500, y: 100 }
    },
    {
      id: 'storage',
      name: 'Storage Layer',
      category: 'backend',
      description: 'Datenbank-Abstraktionsschicht',
      technologies: ['Drizzle ORM', 'PostgreSQL'],
      features: ['CRUD', 'Queries', 'Transactions'],
      position: { x: 700, y: 400 }
    },
    {
      id: 'pdf-gen',
      name: 'PDF Generator',
      category: 'backend',
      description: 'Arbeitsblatt-Erstellung',
      technologies: ['PDFKit', 'Node.js'],
      features: ['Mathe-AB', 'Rechtschreibung', 'Vokabeln', 'Kreativ', 'Facetten'],
      position: { x: 500, y: 550 }
    },
    {
      id: 'math-pedagogy',
      name: 'Math Pedagogy Engine',
      category: 'pedagogy',
      description: 'Fehlerklassifikation & Päckchen',
      technologies: ['TypeScript', 'Algorithmen'],
      features: ['Error Classification', 'Päckchen-Generator', 'Pattern Detection'],
      position: { x: 700, y: 700 }
    },
    {
      id: 'paeckchen-lib',
      name: 'Päckchen Library',
      category: 'pedagogy',
      description: 'Päckchen-Vorlagen und Templates',
      technologies: ['TypeScript', 'Templates'],
      features: ['12+ Päckchen-Typen', 'Facetten-System', 'Sprachmuster'],
      position: { x: 900, y: 700 }
    },
    {
      id: 'test-pipeline',
      name: 'Test Pipeline',
      category: 'backend',
      description: 'QA & Validierung',
      technologies: ['TypeScript', 'Testing'],
      features: ['Error-Generator', 'Validierung', 'Stress-Test', 'Reports'],
      position: { x: 500, y: 850 }
    },
    {
      id: 'analytics-engine',
      name: 'Analytics Engine',
      category: 'backend',
      description: 'Fortschritts- und Fehleranalyse',
      technologies: ['TypeScript', 'Statistical Analysis'],
      features: ['Timeline Generation', 'Heatmap Data', 'Error Clustering', 'Predictive Analytics'],
      position: { x: 500, y: 1000 }
    },
    {
      id: 'assessment-engine',
      name: 'Assessment Engine',
      category: 'pedagogy',
      description: 'Flow-Facetten Diagnostik',
      technologies: ['TypeScript', 'Psychometrics'],
      features: ['8-Dimensionen-Scoring', 'Normwerte', 'Handlungsempfehlungen', 'Verlaufsanalyse'],
      position: { x: 700, y: 850 }
    },
    {
      id: 'help-content-api',
      name: 'Help Content API',
      category: 'backend',
      description: 'Wissensdatenbank',
      technologies: ['TypeScript', 'Content Management'],
      features: ['Artikel-Verwaltung', 'Suche', 'Kategorisierung', 'Markdown-Support'],
      position: { x: 500, y: 1150 }
    },
    {
      id: 'feedback-api',
      name: 'Feedback API',
      category: 'backend',
      description: 'Feedback-Verwaltung',
      technologies: ['Express', 'PostgreSQL', 'Zod'],
      features: ['CRUD Operations', 'Kategorisierung', 'Status-Tracking', 'Comments', 'Admin-Only Actions'],
      position: { x: 500, y: 1300 }
    },
    {
      id: 'batch-pdf-api',
      name: 'Batch PDF API',
      category: 'backend',
      description: 'Multi-Dokument Generierung',
      technologies: ['PDFKit', 'Archiver', 'Async Queue'],
      features: ['Parallel Generation', 'ZIP Compression', 'Progress Tracking', 'Error Handling'],
      position: { x: 500, y: 1450 }
    },
    {
      id: 'report-api',
      name: 'Report Templates API',
      category: 'backend',
      description: 'Bericht-Vorlagen',
      technologies: ['Express', 'Template Engine'],
      features: ['Template Management', 'Data Aggregation', 'PDF Assembly'],
      position: { x: 500, y: 1600 }
    },
    {
      id: 'living-life-api',
      name: 'Living Life Generator',
      category: 'backend',
      description: 'Außerschulische Aufgaben-Generierung',
      technologies: ['TypeScript', 'Task Algorithms'],
      features: ['Category-based Tasks', 'Age-appropriate Content', 'Reflection Prompts'],
      position: { x: 500, y: 1750 }
    },
    {
      id: 'admin-api',
      name: 'Admin API',
      category: 'backend',
      description: 'Administrative Funktionen',
      technologies: ['Express', 'Auth Middleware'],
      features: ['User CRUD', 'System Config', 'Analytics Aggregation'],
      position: { x: 500, y: 1900 }
    },

    // Database
    {
      id: 'database',
      name: 'PostgreSQL Database',
      category: 'database',
      description: 'Neon Serverless DB',
      technologies: ['PostgreSQL', 'Neon', 'Drizzle ORM'],
      features: [
        'users', 'classes', 'students', 'errors', 'homework', 'sessions',
        'assessments', 'assessment_responses', 'assessment_dimensions', 'assessment_items',
        'feedback_tickets', 'feedback_comments',
        'creative_profiles', 'creative_tasks',
        'vocabulary_lists', 'spelling_errors'
      ],
      position: { x: 900, y: 400 }
    },

    // External Services
    {
      id: 'openai',
      name: 'OpenAI API',
      category: 'external',
      description: 'KI-Unterstützung (optional)',
      technologies: ['GPT-5', 'REST API'],
      features: ['Error Analysis', 'Content Generation'],
      position: { x: 700, y: 100 }
    },
    {
      id: 'replit-auth',
      name: 'Replit OAuth',
      category: 'external',
      description: 'Externe Authentifizierung',
      technologies: ['OIDC', 'OAuth 2.0'],
      features: ['User Identity', 'SSO'],
      position: { x: 300, y: 100 }
    }
  ];

  const connections: ModuleConnection[] = [
    // Frontend -> Backend Connections
    { from: 'landing', to: 'auth-service', type: 'auth', label: 'Login Request' },
    { from: 'dashboard', to: 'api-server', type: 'api', label: 'Data Fetch', bidirectional: true },
    { from: 'student-detail', to: 'api-server', type: 'api', label: 'CRUD Operations', bidirectional: true },
    { from: 'homework-gen', to: 'api-server', type: 'api', label: 'Generate Request' },
    { from: 'paeckchen-demo', to: 'api-server', type: 'api', label: 'Demo Request' },
    { from: 'system-viz', to: 'api-server', type: 'api', label: 'Architecture Data' },

    // Backend Internal Connections
    { from: 'api-server', to: 'auth-service', type: 'auth', label: 'Authentication Check' },
    { from: 'api-server', to: 'storage', type: 'data', label: 'DB Operations', bidirectional: true },
    { from: 'api-server', to: 'pdf-gen', type: 'process', label: 'PDF Request' },
    { from: 'api-server', to: 'math-pedagogy', type: 'process', label: 'Error Analysis' },
    { from: 'api-server', to: 'test-pipeline', type: 'process', label: 'Test Execution' },

    // Pedagogy Connections
    { from: 'math-pedagogy', to: 'paeckchen-lib', type: 'data', label: 'Template Selection' },
    { from: 'pdf-gen', to: 'paeckchen-lib', type: 'data', label: 'Exercise Templates' },
    { from: 'pdf-gen', to: 'math-pedagogy', type: 'data', label: 'Homework Exercises' },
    { from: 'test-pipeline', to: 'paeckchen-lib', type: 'data', label: 'Template Validation' },

    // Database Connections
    { from: 'storage', to: 'database', type: 'data', label: 'SQL Queries', bidirectional: true },
    { from: 'auth-service', to: 'database', type: 'data', label: 'Session Storage' },
    { from: 'pdf-gen', to: 'storage', type: 'data', label: 'Fetch Student Data' },
    { from: 'math-pedagogy', to: 'storage', type: 'data', label: 'Error History' },

    // External Service Connections
    { from: 'auth-service', to: 'replit-auth', type: 'auth', label: 'OAuth Flow' },
    { from: 'api-server', to: 'openai', type: 'api', label: 'AI Analysis (optional)' },
    { from: 'test-pipeline', to: 'math-pedagogy', type: 'process', label: 'Validation' },
    { from: 'paeckchen-demo', to: 'math-pedagogy', type: 'process', label: 'Real-time Analysis' },
    
    // New Module Connections
    { from: 'help-center', to: 'help-content-api', type: 'api', label: 'Content Fetch' },
    { from: 'flow-facetten', to: 'api-server', type: 'api', label: 'Assessment Data' },
    { from: 'api-server', to: 'assessment-engine', type: 'process', label: 'Scoring & Analysis' },
    { from: 'assessment-engine', to: 'storage', type: 'data', label: 'Assessment Results' },
    { from: 'learning-viz', to: 'analytics-engine', type: 'api', label: 'Analytics Request' },
    { from: 'analytics-engine', to: 'storage', type: 'data', label: 'Historical Data' },
    { from: 'feedback-system', to: 'feedback-api', type: 'api', label: 'Submit Feedback' },
    { from: 'feedback-api', to: 'database', type: 'data', label: 'Store Feedback' },
    { from: 'generator-training', to: 'math-pedagogy', type: 'process', label: 'Pattern Exercises' },
    
    // Batch Export Connections
    { from: 'batch-export', to: 'api-server', type: 'api', label: 'Export Request' },
    { from: 'api-server', to: 'batch-pdf-api', type: 'process', label: 'Batch Generation' },
    { from: 'batch-pdf-api', to: 'pdf-gen', type: 'process', label: 'Individual PDFs' },
    
    // Report System Connections
    { from: 'report-generator', to: 'report-api', type: 'api', label: 'Template Request' },
    { from: 'report-api', to: 'analytics-engine', type: 'data', label: 'Data Aggregation' },
    { from: 'report-api', to: 'pdf-gen', type: 'process', label: 'PDF Assembly' },
    
    // System Visualization Connections
    { from: 'system-viz', to: 'help-center', type: 'api', label: 'Documentation Link' },
    { from: 'help-center', to: 'pedagogy-center', type: 'api', label: 'Didaktik-Content' },
    { from: 'help-center', to: 'paeckchen-demo', type: 'api', label: 'Live Examples' }
  ];

  const dataFlows = [
    {
      name: 'Fehler-Erfassung bis Hausaufgabe',
      path: [
        'student-detail',
        'api-server',
        'storage',
        'database',
        'math-pedagogy',
        'paeckchen-lib',
        'pdf-gen',
        'homework-gen'
      ],
      description: 'Kompletter Workflow von Fehler-Eingabe bis PDF-Hausaufgabe'
    },
    {
      name: 'Login & Authentifizierung',
      path: ['landing', 'auth-service', 'replit-auth', 'database', 'dashboard'],
      description: 'Benutzer-Authentifizierung und Session-Management'
    },
    {
      name: 'Päckchen-Demonstration',
      path: ['paeckchen-demo', 'api-server', 'math-pedagogy', 'paeckchen-lib'],
      description: 'Interaktive Demo für Lehrpersonen'
    },
    {
      name: 'Test & Qualitätssicherung',
      path: ['test-pipeline', 'math-pedagogy', 'paeckchen-lib', 'pdf-gen'],
      description: 'Automatisierte Validierung und Testing'
    },
    {
      name: 'Analytics & Reporting',
      path: ['dashboard', 'api-server', 'storage', 'database'],
      description: 'Klassen- und Schüler-Analytics'
    },
    {
      name: 'Flow-Facetten Assessment',
      path: ['flow-facetten', 'api-server', 'assessment-engine', 'storage', 'database'],
      description: 'Motivations- und Selbstkonzeptdiagnostik mit 8 Dimensionen'
    },
    {
      name: 'Lernverlaufs-Visualisierung',
      path: ['learning-viz', 'analytics-engine', 'storage', 'database'],
      description: 'Visualisierung von Lernfortschritt und Fehlermustern'
    },
    {
      name: 'Hilfe & Wissensmanagement',
      path: ['help-center', 'help-content-api', 'api-server'],
      description: 'Zugriff auf didaktische Grundlagen und Anleitungen'
    },
    {
      name: 'Feedback-Loop',
      path: ['feedback-system', 'feedback-api', 'database'],
      description: 'User Feedback für kontinuierliche Verbesserung'
    },
    {
      name: 'Kreative Förderung',
      path: ['student-detail', 'api-server', 'creative-matching', 'storage'],
      description: 'Personalisierte Kreativaufgaben basierend auf Interessen'
    },
    {
      name: 'Batch-Export Workflow',
      path: ['batch-export', 'api-server', 'batch-pdf-api', 'pdf-gen', 'storage'],
      description: 'Multi-Schüler PDF-Generierung mit ZIP-Kompression'
    },
    {
      name: 'Ticket-Lifecycle',
      path: ['feedback-system', 'feedback-api', 'database', 'feedback-dashboard'],
      description: 'Feedback-Management von Erstellung bis Resolution'
    },
    {
      name: 'Report-Generierung',
      path: ['student-detail', 'report-api', 'analytics-engine', 'pdf-gen'],
      description: 'Umfassende Berichte mit allen Schülerdaten'
    },
    {
      name: 'Hilfe-Artikel Navigation',
      path: ['help-center', 'help-content-api', 'documentation'],
      description: 'Kontextuelle Hilfe und didaktische Grundlagen'
    },
    {
      name: 'Living Life Workflow',
      path: ['living-life', 'living-life-api', 'storage', 'database'],
      description: 'Außerschulische Aufgaben erstellen und Portfolio dokumentieren'
    },
    {
      name: 'Admin-Verwaltung',
      path: ['admin-dashboard', 'admin-api', 'database'],
      description: 'System-Administration und User-Management'
    },
    {
      name: 'Multi-Modul Analytics',
      path: ['student-detail', 'analytics-engine', 'all-modules', 'storage'],
      description: 'Modulübergreifende Lernfortschrittsanalyse'
    }
  ];

  return {
    modules,
    connections,
    dataFlows
  };
}

/**
 * Statistiken über die Architektur
 */
export function getArchitectureStats() {
  const arch = getSystemArchitecture();
  
  const modulesByCategory = arch.modules.reduce((acc, mod) => {
    acc[mod.category] = (acc[mod.category] || 0) + 1;
    return acc;
  }, {} as Record<ModuleCategory, number>);

  const connectionsByType = arch.connections.reduce((acc, conn) => {
    acc[conn.type] = (acc[conn.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalFeatures = arch.modules.reduce((sum, mod) => sum + mod.features.length, 0);
  const totalTechnologies = new Set(arch.modules.flatMap(mod => mod.technologies)).size;

  return {
    totalModules: arch.modules.length,
    totalConnections: arch.connections.length,
    totalDataFlows: arch.dataFlows.length,
    totalFeatures,
    totalTechnologies,
    modulesByCategory,
    connectionsByType
  };
}
