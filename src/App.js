import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { 
  Search, Calculator, BookOpen, Calendar, Award, AlertCircle, Clock, Info, Home, 
  ChevronRight, Bot, Sparkles, FileText, Loader2, Send, Menu, Key, Check, Timer, 
  ExternalLink, Download, Upload, FileSearch, Trash2, Shield, Euro, Briefcase, 
  Users, Gift, BookType, PenTool, Settings, Play, Radio, PieChart, 
  Moon, Sun, User, LayoutGrid, Phone, Mail, HelpCircle, Smartphone, Printer, Globe,
  Mic, MicOff, Volume2, VolumeX, Command, MessageSquare, Landmark, Bell, Heart, MapPin, X, Plus
} from 'lucide-react';

const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.582 6.186a2.686 2.686 0 0 0-1.884-1.898C17.985 3.848 12 3.848 12 3.848s-5.985 0-7.698.44A2.686 2.686 0 0 0 2.418 6.186C2 7.85 2 12 2 12s0 4.15-.418-5.814a2.686 2.686 0 0 0 1.884 1.898c1.713.44 7.698.44 7.698.44s5.985 0 7.698-.44a2.686 2.686 0 0 0 1.884-1.898C22 16.15 22 12 22 12s0-4.15-.418-5.814zM9.996 15.005V8.995L15.26 12l-5.264 3.005z"/>
  </svg>
);

const HeartHandshake = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a1.6 1.6 0 0 1 2.22 0l.44.43"/>
  </svg>
);

const envApiKey = ""; 

const callGeminiAPI = async (promptOrHistory, customApiKey, archivosAdjuntos = []) => {
  const apiKey = customApiKey || envApiKey; 
  if (!apiKey) return "Error: No se ha configurado la clave API de Gemini.";
  
  let contents = [];
  
  if (Array.isArray(promptOrHistory)) {
    let validHistory = promptOrHistory;
    if (validHistory.length > 0 && validHistory[0].role === 'assistant') {
       validHistory = validHistory.slice(1);
    }
    contents = validHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
  } else {
    const parts = [{ text: promptOrHistory }];
    if (archivosAdjuntos && archivosAdjuntos.length > 0) {
      archivosAdjuntos.forEach(archivo => {
        parts.push({ inlineData: { mimeType: archivo.mimeType, data: archivo.data } });
      });
    }
    contents = [{ role: "user", parts: parts }];
  }

  const payload = {
    contents: contents,
    systemInstruction: { 
      parts: [{ 
        text: `Eres un asistente legal laboral experto en nóminas, derechos de los trabajadores, el Estatuto de los Trabajadores, el Convenio General del Sector de Limpieza Pública, Viaria y Recogida, y el Convenio Colectivo de FCC Medio Ambiente (Valencia Zona Norte).
        REGLA SUPREMA DE JERARQUÍA: Eres un experto en la jerarquía de normas laborales. Tu deber es REVISAR TODO y ofrecer SIEMPRE la opción más beneficiosa para la persona trabajadora, indicando claramente la fuente legal de la que procede (Estatuto de los Trabajadores, Convenio Estatal Sectorial o Convenio Colectivo FCC).
        REGLA ESTRICTA DE AÑO 2026: Estás operando en el AÑO VIGENTE 2026. Todas las comprobaciones de salarios, pluses, cotizaciones y auditorías de nóminas deben basarse ESTRICTAMENTE en las TABLAS SALARIALES DEFINITIVAS DE 2026 del Convenio Colectivo FCC Medio Ambiente (Valencia Zona Norte). Queda TOTALMENTE PROHIBIDO citar o referirse a tablas de 2024 o años anteriores como vigentes.
        REGLA ESTRICTA DE VACACIONES (ART. 30): La retribución de vacaciones se calcula hallando el promedio del salario percibido en el trimestre anterior al disfrute. INCLUYE: Salario Base, Antigüedad, Plus Penoso, Plus Nocturno, Plus Convenio, Plus Asistencia, Plus Reconversión Recogida y Plus Actividad Recogida Domiciliaria (Art. 17). EXCLUYE: Horas extraordinarias, plus productividad, prestaciones SS (IT/Bajas), plus transporte, dietas, ayuda discapacitados, plus actividad Art. 19, plus turnicidad/prolongación y ayudas sociales.
        REGLA ESTRICTA DE FIRMA (OBLIGATORIA): 
        Termina SIEMPRE todas y cada una de tus respuestas despidiéndote EXACTAMENTE con esta frase y NADA MÁS:
        "Un saludo, **JUAN CARLOS**, DELEGADO SINDICAL CGT"` 
      }] 
    }
  };

  const modelsToTry = ['gemini-3.1-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-1.5-flash-8b'];
  let lastError = "";

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar una respuesta.";
      } else {
        lastError = data.error?.message || `Error HTTP ${response.status}`;
        if (response.status === 400 && lastError.toLowerCase().includes("api key not valid")) {
            return "Error crítico: La clave API de Google introducida no es válida o tiene errores tipográficos.";
        }
      }
    } catch (error) { lastError = error.message; }
  }
  return `Error de conexión. Se han probado los modelos disponibles pero Google rechaza la clave. Detalle del último error: ${lastError}`;
};

const parseVoiceCommandWithGemini = async (userVoiceText, customApiKey, categoriasDisponibles) => {
  const apiKey = customApiKey || envApiKey;
  if (!apiKey) return null;

  const systemInstruction = `Eres la Inteligencia Artificial del Asistente de Voz de la App CGT Ayuda FCC.
Tu trabajo es interpretar lo que ha dicho el trabajador por micrófono y determinar qué acciones realizar en la aplicación web para el AÑO VIGENTE 2026.
Debes devolver UNICAMENTE un objeto JSON válido sin etiquetas de markdown adicionales, con la siguiente estructura exacta:
{
  "targetTab": "inicio | perfil | cuadrante | calculadoras | pagas | irpf | auditoria | traductor | redactor | asistente | portal | permisos | antiguedad | buscador | videos | estadisticas | afiliacion",
  "targetCalcSubTab": "diferencias | horas_extras",
  "categoriaBase": "string exacta coincidente con las disponibles o null",
  "categoriaSuperior": "string exacta coincidente con las disponibles o null",
  "diasSueltos": number o null,
  "bivolante": boolean o null,
  "porter": boolean o null,
  "horasNormales": number o null,
  "horasFestivas": number o null,
  "iniciarAuditoria": boolean o null,
  "redactarEscrito": boolean o null,
  "spokenResponse": "frase clara, breve y fraternal que DEBE TERMINAR OBLIGATORIAMENTE EXACTAMENTE CON ESTA DESPEDIDA LITERAL: 'Consulta los resultados con un delegado antes de presentar cualquier reclamación o escrito. UN SALUDO .. TU DELEGADO JUAN CARLOS'"
}
Regla "iniciarAuditoria": Establécelo a true si el trabajador te pide expresamente calcular sus vacaciones, auditar nóminas subidas o revisarlas.
Lista de categorías válidas exactas: ${JSON.stringify(categoriasDisponibles)}.`;

  const payload = {
    contents: [{ parts: [{ text: userVoiceText }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { responseMimeType: "application/json" }
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return JSON.parse(data.candidates[0].content.parts[0].text);
    }
  } catch (e) {
    console.error("Error en interpretación de voz Gemini:", e);
  }
  return null;
};

const plusesVehiculos2026 = { bivolante: 2.91, porter: 1.46 };

const tablaSalarial2026 = {
  "Peón limpieza día": { base: 31.35, nocturno: 0, penoso: 7.84, convenio: 4.10, actividad: 0, recorrido: 0, asistencia: 248.68, transporte: 4.94, marcha: 0, recogida: 0, fallas: 132.14 },
  "Peón limpieza noche": { base: 31.35, nocturno: 7.84, penoso: 7.84, convenio: 4.10, actividad: 0, recorrido: 0, asistencia: 234.29, transporte: 4.97, marcha: 0, recogida: 0, fallas: 132.14 },
  "Conductor/a limpieza día": { base: 32.19, nocturno: 0, penoso: 8.03, convenio: 4.32, actividad: 0, recorrido: 0, asistencia: 214.27, transporte: 6.08, marcha: 17.66, recogida: 0, fallas: 132.14 },
  "Conductor/a limpieza noche": { base: 32.19, nocturno: 8.03, penoso: 8.03, convenio: 4.32, actividad: 0, recorrido: 0, asistencia: 199.58, transporte: 6.15, marcha: 20.39, recogida: 0, fallas: 132.14 },
  "Conductor/a barredora día": { base: 32.19, nocturno: 0, penoso: 9.69, convenio: 4.32, actividad: 0, recorrido: 0, asistencia: 214.27, transporte: 6.08, marcha: 0, recogida: 0, fallas: 132.14 },
  "Conductor/a barredora noche": { base: 32.19, nocturno: 8.03, penoso: 9.69, convenio: 4.32, actividad: 0, recorrido: 0, asistencia: 192.54, transporte: 6.15, marcha: 20.39, recogida: 0, fallas: 132.14 },
  "Peón recogida día": { base: 31.11, nocturno: 0, penoso: 9.42, convenio: 4.89, actividad: 26.20, recorrido: 0, asistencia: 104.43, transporte: 5.41, marcha: 0, recogida: 353.30, fallas: 130.91 },
  "Peón recogida noche": { base: 31.11, nocturno: 9.42, penoso: 9.42, convenio: 4.89, actividad: 25.40, recorrido: 0, asistencia: 90.02, transporte: 5.46, marcha: 0, recogida: 353.30, fallas: 130.91 },
  "Peón espec. recog. día": { base: 31.35, nocturno: 0, penoso: 9.52, convenio: 5.04, actividad: 26.16, recorrido: 0, asistencia: 103.22, transporte: 5.44, marcha: 0, recogida: 353.30, fallas: 130.91 },
  "Peón espec. recog. noche": { base: 31.35, nocturno: 9.52, penoso: 9.52, convenio: 5.04, actividad: 25.29, recorrido: 0, asistencia: 88.84, transporte: 5.47, marcha: 0, recogida: 353.30, fallas: 130.91 },
  "Conductor/a recogida día": { base: 31.89, nocturno: 0, penoso: 9.66, convenio: 5.23, actividad: 15.35, recorrido: 12.58, asistencia: 99.57, transporte: 6.72, marcha: 0, recogida: 353.30, fallas: 130.91 },
  "Conductor/a recogida noche": { base: 31.89, nocturno: 9.56, penoso: 9.66, convenio: 5.23, actividad: 14.58, recorrido: 12.58, asistencia: 84.90, transporte: 6.78, marcha: 0, recogida: 353.30, fallas: 130.91 },
  "Peón espec. limp. día": { base: 31.65, nocturno: 0, penoso: 7.93, convenio: 4.20, actividad: 0, recorrido: 0, asistencia: 232.85, transporte: 4.96, marcha: 0, recogida: 0, fallas: 132.14 },
  "Peón espec. limp. noche": { base: 31.65, nocturno: 7.93, penoso: 7.93, convenio: 4.20, actividad: 0, recorrido: 0, asistencia: 218.44, transporte: 4.97, marcha: 0, recogida: 0, fallas: 132.14 },
  "Peón operario": { base: 32.19, nocturno: 0, penoso: 8.03, convenio: 4.32, actividad: 0, recorrido: 0, asistencia: 219.67, transporte: 4.78, marcha: 0, recogida: 0, fallas: 132.14 },
  "Jefe de equipo": { base: 32.59, nocturno: 0, penoso: 8.14, convenio: 6.72, actividad: 186.21, recorrido: 0, asistencia: 169.62, transporte: 5.52, marcha: 4.20, recogida: 0, fallas: 132.14 },
  "Oficial 1ª": { base: 32.19, nocturno: 0, penoso: 8.03, convenio: 4.45, actividad: 186.21, recorrido: 0, asistencia: 177.06, transporte: 5.51, marcha: 4.14, recogida: 0, fallas: 132.14 },
  "Oficial 2ª": { base: 31.95, nocturno: 0, penoso: 7.99, convenio: 4.14, actividad: 186.21, recorrido: 0, asistencia: 179.20, transporte: 5.51, marcha: 4.02, recogida: 0, fallas: 132.14 },
  "Oficial 3ª": { base: 31.65, nocturno: 0, penoso: 7.93, convenio: 4.10, actividad: 186.21, recorrido: 0, asistencia: 180.14, transporte: 5.51, marcha: 3.88, recogida: 0, fallas: 132.14 },
  "Peón especialista taller": { base: 31.65, nocturno: 0, penoso: 7.93, convenio: 4.10, actividad: 186.21, recorrido: 0, asistencia: 180.14, transporte: 5.51, marcha: 3.66, recogida: 0, fallas: 132.14 },
  "Peón taller": { base: 31.35, nocturno: 0, penoso: 7.84, convenio: 3.92, actividad: 186.21, recorrido: 0, asistencia: 182.57, transporte: 5.50, marcha: 3.55, recogida: 0, fallas: 132.14 },
  "Almacenero/a": { base: 32.19, nocturno: 0, penoso: 8.03, convenio: 4.45, actividad: 186.21, recorrido: 0, asistencia: 177.06, transporte: 5.51, marcha: 4.14, recogida: 0, fallas: 132.14 },
  "Ayudante almacen": { base: 31.95, nocturno: 0, penoso: 7.99, convenio: 4.14, actividad: 186.21, recorrido: 0, asistencia: 179.20, transporte: 5.51, marcha: 4.02, recogida: 0, fallas: 132.14 },
  "Verificador/a": { base: 32.19, nocturno: 0, penoso: 8.03, convenio: 4.45, actividad: 186.21, recorrido: 0, asistencia: 177.06, transporte: 5.60, marcha: 14.29, recogida: 0, fallas: 132.14 },
  "Portero/a": { base: 31.35, nocturno: 0, penoso: 0, convenio: 12.18, actividad: 0, recorrido: 0, asistencia: 248.08, transporte: 4.95, marcha: 0, recogida: 0, fallas: 132.14 },
  "Portero/a taller": { base: 31.35, nocturno: 0, penoso: 0, convenio: 11.81, actividad: 186.21, recorrido: 0, asistencia: 182.57, transporte: 5.49, marcha: 0, recogida: 0, fallas: 132.14 },
  "Aprendiz/a 16 años": { base: 16.85, nocturno: 0, penoso: 4.20, convenio: 4.21, actividad: 186.21, recorrido: 0, asistencia: 226.25, transporte: 5.39, marcha: 0, recogida: 0, fallas: 132.14 },
  "Aprendiz/a 17 años": { base: 20.61, nocturno: 0, penoso: 5.15, convenio: 4.21, actividad: 186.21, recorrido: 0, asistencia: 213.84, transporte: 5.41, marcha: 0, recogida: 0, fallas: 132.14 },
  "Inspector/a": { base: 1238.74/30, nocturno: 0, penoso: 0, convenio: 0, actividad: 315.11/30, recorrido: 0, asistencia: 0, transporte: 129.41/30, marcha: 0, recogida: 0, fallas: 132.14 },
  "Maestro/a de taller": { base: 1034.95/30, nocturno: 0, penoso: 0, convenio: 0, actividad: 310.49/30, recorrido: 0, asistencia: 0, transporte: 119.60/30, marcha: 0, recogida: 0, fallas: 132.14 },
  "Encargado/a de taller": { base: 1034.95/30, nocturno: 0, penoso: 0, convenio: 0, actividad: 310.49/30, recorrido: 0, asistencia: 0, transporte: 119.60/30, marcha: 0, recogida: 0, fallas: 132.14 },
  "Ayudante de servicios": { base: 1167.76/30, nocturno: 0, penoso: 0, convenio: 0, actividad: 420.26/30, recorrido: 0, asistencia: 0, transporte: 121.68/30, marcha: 0, recogida: 0, fallas: 132.14 },
  "Titulado/a superior": { base: 1574.22/30, nocturno: 0, penoso: 0, convenio: 0, actividad: 552.91/30, recorrido: 0, asistencia: 0, transporte: 121.68/30, marcha: 0, recogida: 0, fallas: 132.14 },
  "Titulado/a medio": { base: 1222.08/30, nocturno: 0, penoso: 0, convenio: 0, actividad: 430.82/30, recorrido: 0, asistencia: 0, transporte: 121.68/30, marcha: 0, recogida: 0, fallas: 132.14 }
};

const escalaAntiguedad = [
  { años: 2, porcentaje: 5, descripcion: "Tramo 2 Años" },
  { años: 4, porcentaje: 10, descripcion: "Tramo 4 Años" },
  { años: 6, porcentaje: 15, descripcion: "Tramo 6 Años" },
  { años: 8, porcentaje: 20, descripcion: "Tramo 8 Años" },
  { años: 9, porcentaje: 25, descripcion: "Tramo 9 Años" },
  { años: 16, porcentaje: 40, descripcion: "Tramo 16 Años" },
  { años: 21, porcentaje: 60, descripcion: "Tramo 21 Años (Tope Máximo)" }
];

const tablaHorasExtras2026 = {
  "DIA": {
    "Conductor/a": { normal: 17.32, festiva: 19.97 },
    "Cabo": { normal: 17.25, festiva: 19.69 },
    "Peón especialista": { normal: 17.13, festiva: 19.54 },
    "Peón": { normal: 16.83, festiva: 19.28 },
    "Ayudante de servicios": { normal: 18.91, festiva: 21.58 },
    "Inspector/a": { normal: 18.86, festiva: 21.54 }
  },
  "NOCHE": {
    "Conductor/a": { normal: 19.97, festiva: 23.35 },
    "Cabo": { normal: 19.68, festiva: 22.48 },
    "Peón especialista": { normal: 19.44, festiva: 22.25 },
    "Peón": { normal: 19.28, festiva: 22.01 },
    "Ayudante de servicios": { normal: 21.31, festiva: 24.53 },
    "Inspector/a": { normal: 21.27, festiva: 24.32 }
  },
  "TALLER": {
    "Encargado/a": { normal: 18.65, festiva: 21.31 },
    "Oficial primera": { normal: 19.61, festiva: 22.40 },
    "Oficial segunda": { normal: 19.01, festiva: 21.86 },
    "Oficial tercera": { normal: 18.48, festiva: 21.06 },
    "Peón especialista": { normal: 17.13, festiva: 19.54 },
    "Peón": { normal: 16.83, festiva: 19.28 },
    "Portero/a": { normal: 16.83, festiva: 19.28 },
    "Verificador/a": { normal: 17.32, festiva: 19.81 },
    "Jefe de equipo": { normal: 19.84, festiva: 22.67 }
  }
};

const conceptosSociales = {
  jubilacionAnticipada2026: [
    { antelacion: '24 meses', importe: 592.28, baseProrroga: 550.00 },
    { antelacion: '18 meses', importe: 430.75, baseProrroga: 400.00 },
    { antelacion: '12 meses', importe: 323.06, baseProrroga: 300.00 },
    { antelacion: '6 meses',  importe: 215.37, baseProrroga: 200.00 }
  ],
  jubilacionParcial: { importe: 150.00 },
  ayudas: [
    { articulo: 'Art. 39', concepto: 'Hijo/a discapacitado (mensual)', importe: 180.19 },
    { articulo: 'Art. 39', concepto: 'Cursos de formación', importe: 150.15 },
    { articulo: 'Art. 39', concepto: 'Fijos minusvalía >33% (anual)', importe: 248.28 },
    { articulo: 'Art. 39', concepto: 'Tope Total Anual Ayudas', importe: 3603.84 },
    { articulo: 'Art. 40', concepto: 'Premio natalidad por hijo/a', importe: 180.19 }
  ]
};

const useEstadisticasLocales = () => {
  const [estadisticas, setEstadisticas] = useState(() => {
    const saved = localStorage.getItem('cgt_estadisticas_uso');
    return saved ? JSON.parse(saved) : { totalClicks: 0, secciones: {} };
  });

  const registrarVisita = useCallback((seccion) => {
    setEstadisticas(prev => {
      const newStats = { ...prev };
      newStats.totalClicks += 1;
      newStats.secciones[seccion] = (newStats.secciones[seccion] || 0) + 1;
      localStorage.setItem('cgt_estadisticas_uso', JSON.stringify(newStats));
      return newStats;
    });
  }, []);
  return { estadisticas, registrarVisita };
};

const calcularDiferenciaDiaria = (categoriaPropia, categoriaSuperior, bivolante = false, porter = false) => {
  const dSup = tablaSalarial2026[categoriaSuperior];
  const dProp = tablaSalarial2026[categoriaPropia];
  if (!dSup || !dProp) return { diferenciaDiariaFinal: 0, diferenciaConceptos: [] };

  const divisorAnualSup = categoriaSuperior.toLowerCase().includes('recogida') ? 255 : 299;
  const divisorAnualProp = categoriaPropia.toLowerCase().includes('recogida') ? 255 : 299;

  const nombresConceptos = {
    base: 'Salario Base',
    nocturno: 'Plus Nocturnidad',
    penoso: 'Plus Penosidad/Toxicidad',
    convenio: 'Plus Convenio',
    actividad: 'Plus Actividad',
    recorrido: 'Plus Recorrido',
    transporte: 'Plus Transporte',
    marcha: 'Plus Puesta en Marcha',
    asistencia: 'Plus Asistencia (Anual)',
    recogida: 'Plus Recogida (Mensual)'
  };

  const diffs = [];
  Object.keys(nombresConceptos).forEach(key => {
    const getVal = (cat, divisorAnual) => {
      if (key === 'asistencia') return (cat.asistencia * 12) / divisorAnual;
      if (key === 'recogida') return (cat.recogida || 0) / 30;
      if (key === 'actividad') { const val = cat.actividad || 0; return val > 100 ? val / 30 : val; }
      return cat[key] || 0;
    };
    const diff = getVal(dSup, divisorAnualSup) - getVal(dProp, divisorAnualProp);
    if (Math.abs(diff) > 0.005) diffs.push({ nombre: nombresConceptos[key], importe: diff, key });
  });

  let sumaVehiculos = 0;
  if (bivolante) sumaVehiculos += plusesVehiculos2026.bivolante;
  if (porter) sumaVehiculos += plusesVehiculos2026.porter;

  let diferenciaBase = diffs.reduce((acc, curr) => acc + curr.importe, 0);
  const diferenciaDiariaFinal = Math.max(0, diferenciaBase) + sumaVehiculos;

  return { diferenciaDiariaFinal, diferenciaConceptos: diffs, sumaVehiculos };
};

const SidebarButton = memo(function SidebarButton({ active, onClick, icon, text, esEspecial }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${active ? (esEspecial ? 'bg-purple-50 text-purple-700 font-bold shadow-sm border border-purple-200' : 'bg-red-50 text-red-700 font-bold shadow-sm') : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}>
      <div className={`mr-3 ${active ? (esEspecial ? 'text-purple-600' : 'text-red-600') : 'text-gray-400'}`}>{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
      <span>{text}</span>
      {esEspecial && !active && <div className="ml-auto w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div>}
    </button>
  );
});

const BottomNavButton = memo(function BottomNavButton({ active, onClick, icon, text, esEspecial }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${active ? (esEspecial ? 'text-purple-700 scale-105' : 'text-red-700 scale-105') : 'text-gray-400 hover:text-gray-600'}`}>
      <div className={`${active ? (esEspecial ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-200' : 'bg-red-50 text-red-700 shadow-sm') : ''} p-1 rounded-xl mb-0.5 transition-colors relative`}>
        {icon}
        {esEspecial && !active && <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full w-2 h-2 animate-pulse"></div>}
      </div>
      <span className={`text-[9px] ${active ? 'font-black' : 'font-semibold'} ${active && esEspecial ? 'text-purple-700' : ''}`}>{text}</span>
    </button>
  );
});

const MobileMenuBtn = memo(function MobileMenuBtn({ onClick, icon, title, desc, color }) {
  const bgColors = { red: 'bg-red-100 text-red-700', green: 'bg-green-100 text-green-700', blue: 'bg-blue-100 text-blue-700', purple: 'bg-purple-100 text-purple-700', gray: 'bg-gray-100 text-gray-700' };
  return (
    <button onClick={onClick} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 text-left w-full shadow-sm">
      <div className={`${bgColors[color]} p-2.5 rounded-lg`}>{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
      <div><p className="font-bold text-gray-800 text-sm">{title}</p><p className="text-xs text-gray-400">{desc}</p></div>
    </button>
  );
});

const BotonAccesoRapido = memo(function BotonAccesoRapido({ icon, color, titulo, subtitulo, onClick }) {
  const bgColors = { red: 'bg-red-100 text-red-700', green: 'bg-green-100 text-green-700', blue: 'bg-blue-100 text-blue-700', purple: 'bg-purple-100 text-purple-700', orange: 'bg-orange-100 text-orange-700' };
  return (
    <button onClick={onClick} className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md hover:border-gray-300 transition-all active:scale-[0.98] relative overflow-hidden group">
      <div className={`${bgColors[color]} p-4 rounded-xl mr-4 z-10 shadow-sm group-hover:scale-105 transition-transform`}>{icon}</div>
      <div className="text-left flex-1 z-10 w-full">
        <h4 className="font-bold text-gray-800 text-base">{titulo}</h4>
        <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 z-10 group-hover:text-red-500 transition-colors flex-shrink-0" />
    </button>
  );
});

const PantallaInicio = memo(function PantallaInicio({ setActiveTab, apiKey }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ['/5.png', '/6.png', '/Imagen1.jpg', '/Imagen2.jpg'];

  useEffect(() => {
    const interval = setInterval(() => setCurrentImageIndex(prev => (prev + 1) % images.length), 4000); 
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="animate-fadeIn space-y-4 md:space-y-6 w-full no-print">
      <style>{`
        @keyframes sweep { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(200%) skewX(-15deg); } }
        .light-sweep { position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%); animation: sweep 4s infinite; pointer-events: none; z-index: 30; }
      `}</style>

      <div className={`relative w-full h-64 md:h-[400px] rounded-2xl overflow-hidden shadow-lg transition-colors duration-1000 ${currentImageIndex % 2 === 0 ? 'bg-red-800' : 'bg-amber-600'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 pointer-events-none z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none z-20"></div>
        <div className="light-sweep"></div>
        
        {images.map((img, idx) => (
          <img key={img} src={img} alt={`Cartel ${idx + 1}`} className={`absolute inset-0 w-full h-full object-contain p-2 md:p-6 transition-opacity duration-1000 drop-shadow-2xl z-10 ${currentImageIndex === idx ? 'opacity-100' : 'opacity-0'}`} />
        ))}
        
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
          {images.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`h-2.5 rounded-full transition-all duration-300 shadow-md ${currentImageIndex === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row mt-4">
        <div className="relative p-6 md:p-8 md:w-1/2 aspect-square md:aspect-auto md:min-h-[350px] flex flex-col items-center justify-between overflow-hidden bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase z-10 text-center text-3d-black shrink-0">CGT AYUDA</h2>
          <div className="relative w-full flex-1 flex items-center justify-center my-2 z-10 min-h-[120px]">
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${currentImageIndex % 2 === 0 ? 'opacity-100 scale-100 blur-none z-20' : 'opacity-0 scale-95 blur-sm z-0 pointer-events-none'}`}>
              <p className="text-3d-red text-[26px] md:text-3xl font-black uppercase tracking-tighter text-center leading-none mb-3">LA APP - WEB <br/> CON IA 🤖</p>
              <p className="text-3d-black text-[11px] md:text-sm font-black uppercase tracking-tight text-center leading-tight px-2">TUS DUDAS Y PROBLEMAS<br/>LEGALES EN SEGUNDOS<br/>SOLUCIONADO.</p>
            </div>
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${currentImageIndex % 2 !== 0 ? 'opacity-100 scale-100 blur-none z-20' : 'opacity-0 scale-105 blur-sm z-0 pointer-events-none'}`}>
              <p className="text-3d-black text-[26px] md:text-3xl font-black uppercase tracking-tighter text-center leading-none mb-3">LA APP - WEB <br/> CON IA 🤖</p>
              <p className="text-3d-red text-[11px] md:text-sm font-black uppercase tracking-tight text-center leading-tight px-2">TUS DUDAS Y PROBLEMAS<br/>LEGALES EN SEGUNDOS<br/>SOLUCIONADO.</p>
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase z-10 text-center text-3d-red shrink-0">FCC ZONA NORTE</h3>
        </div>
        
        <div className="p-6 md:p-10 flex flex-col justify-center md:w-1/2 text-center md:text-left bg-white">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight mb-3">Defensa y Asesoramiento 2026</h2>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-6 font-medium">Plataforma web y aplicación sindical para los/as trabajadores/as de Saneamiento Urbano en Valencia. Calcula tus derechos, audita tu nómina de 2026 y defiéndete con IA.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <button onClick={() => setActiveTab('asistente')} className={`w-full px-4 py-4 rounded-xl shadow-md flex items-center justify-center font-bold active:scale-95 transition-transform text-sm text-white ${apiKey ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-yellow-600 to-amber-600 animate-pulse'}`}>
              <Sparkles className="w-5 h-5 mr-2" /> {apiKey ? 'Asistente IA 2026' : 'Configurar IA'}
            </button>
            <button onClick={() => setActiveTab('traductor')} className={`w-full px-4 py-4 rounded-xl shadow-md flex items-center justify-center font-bold active:scale-95 transition-transform text-sm text-white ${apiKey ? 'bg-gradient-to-r from-indigo-600 to-blue-600' : 'bg-gray-300 text-gray-500'}`}>
              <BookType className="w-5 h-5 mr-2" /> Traductor IA
            </button>
          </div>
        </div>
      </div>

      <div className="w-full mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
          <BotonAccesoRapido icon={<Calculator className="w-6 h-6 md:w-8 md:h-8"/>} color="red" titulo="Diferencias" subtitulo="Categoría superior" onClick={() => { setActiveTab('calculadoras'); setActiveCalcSubTab('diferencias'); }} />
          <BotonAccesoRapido icon={<Euro className="w-6 h-6 md:w-8 md:h-8 text-green-700"/>} color="green" titulo="Pagas y Pluses" subtitulo="Pagas extras anuales" onClick={() => setActiveTab('pagas')} />
          <BotonAccesoRapido icon={<ExternalLink className="w-6 h-6 md:w-8 md:h-8 text-blue-600"/>} color="blue" titulo="Portal Empleado" subtitulo="Tus nóminas" onClick={() => setActiveTab('portal')} />
          <BotonAccesoRapido icon={<Calendar className="w-6 h-6 md:w-8 md:h-8"/>} color="green" titulo="Antigüedad" subtitulo="Cálculos y premios" onClick={() => setActiveTab('antiguedad')} />
          <BotonAccesoRapido icon={<PenTool className="w-6 h-6 md:w-8 md:h-8 text-purple-600"/>} color="purple" titulo="Redactor" subtitulo="Peticiones RRHH" onClick={() => setActiveTab('redactor')} />
          <BotonAccesoRapido icon={<FileSearch className="w-6 h-6 md:w-8 md:h-8 text-purple-600 animate-pulse"/>} color="purple" titulo="Auditar Nómina 2026" subtitulo="Análisis por IA" onClick={() => setActiveTab('auditoria')} />
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 font-bold tracking-wide py-3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-center items-center gap-1 md:gap-4 w-full mt-4">
        <p>CREADOR: MINUTO YO &amp; JUAN CARLOS</p>
        <span className="hidden md:inline text-gray-300">|</span>
        <p>COLAB. ESPECIAL: JAVIER ESCONTRELA Y DELEGADOS CGT</p>
        <span className="hidden md:inline text-gray-300">|</span>
        <p className="text-red-700">TEXTO Y DATOS: SITIOS OFICIALES Y CONVENIOS ACTUALIZADOS A 2026</p>
      </div>
    </div>
  );
});

const MiPerfil = memo(function MiPerfil({ perfil, setPerfil, categorias }) {
  const [guardadoExito, setGuardadoExito] = useState(false);

  const handleGuardar = () => {
    localStorage.setItem('cgt_perfil_usuario', JSON.stringify(perfil));
    setGuardadoExito(true);
    setTimeout(() => setGuardadoExito(false), 2500);
  };

  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-3 mb-6 flex items-center text-gray-800">
          <User className="mr-3 text-blue-600 w-6 h-6" /> Mi Perfil de Trabajador
        </h2>
        <p className="text-gray-500 text-sm mb-6 font-medium">Configura tus datos básicos una sola vez. Las calculadoras se rellenarán automáticamente.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoría Principal (Base)</label>
            <select className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" value={perfil.categoria} onChange={e => setPerfil({...perfil, categoria: e.target.value})}>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoría Superior Habitual</label>
            <select className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" value={perfil.categoriaSuperior} onChange={e => setPerfil({...perfil, categoriaSuperior: e.target.value})}>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Turno Habitual</label>
            <select className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" value={perfil.turno} onChange={e => setPerfil({...perfil, turno: e.target.value})}>
              <option value="DIA">Turno de Día</option>
              <option value="NOCHE">Turno de Noche</option>
              <option value="TALLER">Taller</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Fecha Ingreso (Antigüedad)</label>
            <input type="date" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" value={perfil.fechaIngreso} onChange={e => setPerfil({...perfil, fechaIngreso: e.target.value})} />
          </div>
          <div className="flex flex-col justify-center space-y-3 pt-4">
             <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={perfil.bivolante} onChange={e => setPerfil({...perfil, bivolante: e.target.checked})} />
                <span className="text-sm font-bold text-gray-800">Conduzco vehículo Bivolante</span>
             </label>
             <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={perfil.porter} onChange={e => setPerfil({...perfil, porter: e.target.checked})} />
                <span className="text-sm font-bold text-gray-800">Conduzco vehículo Porter</span>
             </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={handleGuardar} className={`px-8 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 text-white ${guardadoExito ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {guardadoExito ? <><Check className="w-5 h-5"/> ¡Perfil Guardado!</> : 'Guardar Mi Perfil'}
          </button>
        </div>
      </div>
    </div>
  );
});

const MiCuadrante = memo(function MiCuadrante({ perfil }) {
  const [dias, setDias] = useState(() => {
    const guardado = localStorage.getItem('cgt_cuadrante_dias');
    return guardado ? JSON.parse(guardado) : Array(31).fill('null');
  });

  useEffect(() => {
    localStorage.setItem('cgt_cuadrante_dias', JSON.stringify(dias));
  }, [dias]);
  
  const toggleDia = (index) => {
    setDias(prev => {
      const newDias = [...prev];
      const estados = ['null', 'D', 'CS'];
      const nextIndex = (estados.indexOf(newDias[index]) + 1) % estados.length;
      newDias[index] = estados[nextIndex];
      return newDias;
    });
  };

  const totales = {
    descanso: dias.filter(d => d === 'D').length,
    superior: dias.filter(d => d === 'CS').length
  };

  const { diferenciaDiariaFinal } = calcularDiferenciaDiaria(
    perfil.categoria, 
    perfil.categoriaSuperior, 
    perfil.bivolante, 
    perfil.porter
  );

  const totalEurosEstimado = diferenciaDiariaFinal * totales.superior;

  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-lg md:text-xl font-bold flex items-center text-gray-800"><Calendar className="mr-2 text-orange-600 w-5 h-5 md:w-6 md:h-6" /> Cuadrante Diferencias (Días Sueltos)</h2>
          <button onClick={() => setDias(Array(31).fill('null'))} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 transition flex items-center"><Trash2 className="w-4 h-4 mr-1"/> Borrar</button>
        </div>
        
        <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center mb-5 no-print text-[10px] md:text-xs font-bold">
          <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded-md">Trabajo Normal</span>
          <span className="bg-green-50 text-green-900 border border-green-200 px-2 py-1 rounded-md">(D) Descanso</span>
          <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-1 rounded-md">(CS) Cat. Superior</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 md:gap-3 mb-6">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="text-center font-bold text-gray-400 text-xs mb-1">{d}</div>)}
          {dias.map((estado, i) => (
            <button key={i} onClick={() => toggleDia(i)} className={`aspect-square rounded-xl flex flex-col items-center justify-center font-black text-base md:text-lg transition-all transform active:scale-95 shadow-sm border ${
              estado === 'D' ? 'bg-green-500 text-white border-green-600' : 
              estado === 'CS' ? 'bg-purple-600 text-white border-purple-700' : 
              'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}>
              <span>{i + 1}</span>
              {estado !== 'null' && <span className="text-[8px] md:text-[9px] opacity-90 -mt-1 font-bold">{estado}</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-center font-bold max-w-md mx-auto">
           <div className="bg-green-600 text-white p-3 rounded-xl shadow-sm"><span className="text-[10px] block uppercase mb-1">Descansos</span><span className="text-2xl font-mono font-black">{totales.descanso}</span></div>
           <div className="bg-purple-600 text-white p-3 rounded-xl shadow-sm"><span className="text-[10px] block uppercase mb-1">C. Superior</span><span className="text-2xl font-mono font-black">{totales.superior}</span></div>
        </div>

        {totales.superior > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-700 to-indigo-800 p-4 md:p-6 rounded-xl border border-purple-900 shadow-lg text-white flex flex-col sm:flex-row justify-between items-center gap-4 no-invert">
            <div className="text-center sm:text-left">
              <h4 className="font-black flex items-center justify-center sm:justify-start text-xs md:text-sm uppercase tracking-widest text-purple-200 mb-1.5"><Info className="w-4 h-4 mr-1.5" /> Deuda Acumulada</h4>
              <p className="text-sm text-gray-200 font-medium">Has marcado {totales.superior} días sueltos de {perfil.categoriaSuperior}.</p>
              {(perfil.bivolante || perfil.porter) && (
                <p className="text-[11px] text-emerald-300 mt-2 font-black uppercase tracking-wider bg-black/20 inline-block px-2.5 py-1 rounded-md border border-white/10">
                  <span className="mr-1">✓</span> Incluye plus de vehículos: {perfil.bivolante ? 'Bivolante' : ''}{perfil.bivolante && perfil.porter ? ' y ' : ''}{perfil.porter ? 'Porter' : ''}
                </p>
              )}
            </div>
            <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter bg-black/30 px-5 py-3 rounded-xl border border-white/10 shadow-inner">
              +{totalEurosEstimado.toFixed(2)} €
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const CalculadoraDiferencias = memo(function CalculadoraDiferencias({ perfil, voiceCalcData, apiKey, onConfigureIA }) {
  const [categoriaPropia, setCategoriaPropia] = useState(perfil.categoria);
  const [categoriaSuperior, setCategoriaSuperior] = useState(perfil.categoriaSuperior);
  const [dias, setDias] = useState(1);
  const [bivolante, setBivolante] = useState(perfil.bivolante);
  const [porter, setPorter] = useState(perfil.porter);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState('');
  const [copied, setCopied] = useState(false);
  const claimRef = useRef(null);

  useEffect(() => {
    if (voiceCalcData) {
      if (voiceCalcData.categoriaBase) setCategoriaPropia(voiceCalcData.categoriaBase);
      if (voiceCalcData.categoriaSuperior) setCategoriaSuperior(voiceCalcData.categoriaSuperior);
      if (voiceCalcData.dias !== null && voiceCalcData.dias !== undefined) setDias(voiceCalcData.dias);
      if (voiceCalcData.bivolante !== null && voiceCalcData.bivolante !== undefined) setBivolante(voiceCalcData.bivolante);
      if (voiceCalcData.porter !== null && voiceCalcData.porter !== undefined) setPorter(voiceCalcData.porter);
    }
  }, [voiceCalcData]);

  const categorias = Object.keys(tablaSalarial2026);

  const { diferenciaDiariaFinal, diferenciaConceptos } = calcularDiferenciaDiaria(
    categoriaPropia, 
    categoriaSuperior, 
    bivolante, 
    porter
  );

  let plusesVehiculos = [];
  if (bivolante) plusesVehiculos.push({ nombre: 'Plus Bivolante', importe: plusesVehiculos2026.bivolante });
  if (porter) plusesVehiculos.push({ nombre: 'Plus Vehículo Porter', importe: plusesVehiculos2026.porter });

  const totalReclamar = (diferenciaDiariaFinal * dias);

  const handleGenerateClaim = async () => {
    if (!apiKey) { onConfigureIA(); return; }
    setIsGenerating(true);
    setDraftResult('');
    let textoVehiculos = '';
    if (bivolante && porter) textoVehiculos = ' y asumiendo la conducción de vehículos Bivolante y Porter';
    else if (bivolante) textoVehiculos = ' y asumiendo la conducción de vehículo Bivolante';
    else if (porter) textoVehiculos = ' y asumiendo la conducción de vehículo Porter';

    const prompt = `Redacta una carta formal muy concisa dirigida al Departamento de Recursos Humanos de FCC Medio Ambiente (Valencia). Soy un trabajador con la categoría base de "${categoriaPropia}". Durante ${dias} días he estado realizando funciones correspondientes a la categoría superior de "${categoriaSuperior}"${textoVehiculos}. Solicito formalmente el abono de la diferencia salarial correspondiente a estos días, que asciende a un total estimado de ${totalReclamar.toFixed(2)} euros brutos, calculados usando la tabla salarial actualizada de 2026. La carta debe tener espacios para que yo rellene mi Nombre, DNI y Firma. No incluyas explicaciones tuyas, solo el texto de la carta listo para imprimir. Asesorado por JUAN CARLOS, DELEGADO SINDICAL CGT.`;
    const response = await callGeminiAPI(prompt, apiKey);
    setDraftResult(response);
    setIsGenerating(false);
  };

  const handleDownloadPDF = () => {
    if (window.html2pdf && claimRef.current) {
      const element = claimRef.current;
      const opt = {
        margin:       10,
        filename:     `Reclamacion_Diferencias_CGT_${categoriaSuperior.replace(/ /g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm flex items-start gap-3 no-print">
         <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
         <div>
            <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider">Aviso Sindical</h4>
            <p className="text-xs text-blue-800 mt-1">Es recomendable <strong>consultar con un delegado</strong> de CGT para hacer una revisión conjunta de tus cálculos antes de registrar cualquier documento por registro de entrada.</p>
         </div>
      </div>

      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 no-print">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-3 mb-4 flex items-center text-gray-800">
          <Calculator className="mr-3 text-red-600 w-6 h-6" /> Reclamación de Diferencias (Días Sueltos) - Tablas 2026
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          <div className="lg:col-span-7 space-y-5 bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-inner h-fit">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Tu Categoría Base</label>
                <select className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm font-medium text-gray-800 focus:outline-none" value={categoriaPropia} onChange={(e) => setCategoriaPropia(e.target.value)}>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoría Superior</label>
                <select className="w-full p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-900 shadow-sm focus:outline-none" value={categoriaSuperior} onChange={(e) => setCategoriaSuperior(e.target.value)}>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 mt-2">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide mt-2">Días Realizados en Cat. Superior</label>
                <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-gray-200 bg-white w-full">
                  <button onClick={() => setDias(Math.max(1, dias - 1))} className="bg-gray-100 w-14 h-12 font-bold text-2xl text-gray-600 hover:bg-gray-200">-</button>
                  <input type="number" min="1" className="w-full h-12 text-center border-x border-gray-200 text-xl font-bold focus:outline-none" value={dias} onChange={(e) => setDias(parseInt(e.target.value) || 0)} />
                  <button onClick={() => setDias(dias + 1)} className="bg-gray-100 w-14 h-12 font-bold text-2xl text-gray-600 hover:bg-gray-200">+</button>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5"><Euro className="w-4 h-4 text-green-600"/> Ajustes Adicionales</label>
              <label className="flex items-center space-x-3 cursor-pointer p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-full">
                <input type="checkbox" className="w-5 h-5 text-red-600 rounded" checked={bivolante} onChange={(e) => setBivolante(e.target.checked)} />
                <span className="text-sm font-bold text-gray-800 flex flex-1 justify-between items-center">
                  <span>He conducido Bivolante</span>
                  <span className="bg-red-100 text-red-700 font-bold text-[10px] px-2 py-1 rounded-md">+{plusesVehiculos2026.bivolante.toFixed(2)} €/día</span>
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-full">
                <input type="checkbox" className="w-5 h-5 text-red-600 rounded" checked={porter} onChange={(e) => setPorter(e.target.checked)} />
                <span className="text-sm font-bold text-gray-800 flex flex-1 justify-between items-center">
                  <span>He conducido Porter</span>
                  <span className="bg-red-100 text-red-700 font-bold text-[10px] px-2 py-1 rounded-md">+{plusesVehiculos2026.porter.toFixed(2)} €/día</span>
                </span>
              </label>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl shadow-xl flex-1 flex flex-col border border-slate-800 no-invert">
              <div className="p-6 relative z-10 flex-1 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800 shrink-0">
                  <h3 className="font-black text-sm tracking-widest text-white uppercase flex items-center"><Calculator className="w-5 h-5 mr-2 text-red-500" /> Desglose de Pluses</h3>
                </div>
                <div className="space-y-4 mb-5 overflow-y-auto flex-1">
                  {diferenciaConceptos.length > 0 && (
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest flex items-center gap-1.5"><Award className="w-3 h-3" /> Dif. por categoría sup.</p>
                      <div className="space-y-2">
                        {diferenciaConceptos.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-medium">{item.nombre}</span>
                            <span className={`font-mono font-bold ${item.importe > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{item.importe > 0 ? '+' : ''}{item.importe.toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {plusesVehiculos.length > 0 && (
                    <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-800/30">
                      <div className="space-y-2">
                        {plusesVehiculos.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs"><span className="text-purple-200 font-medium">{item.nombre}</span><span className="font-mono font-bold text-purple-400">+{item.importe.toFixed(2)} €</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="shrink-0 mt-auto">
                  <div className="flex justify-between items-center bg-slate-800 p-4 rounded-t-xl border-b border-slate-700">
                    <span className="text-white font-bold text-[11px] tracking-wider uppercase">Suma Total Diaria</span>
                    <span className="font-mono text-xl font-black text-emerald-400">+{diferenciaDiariaFinal.toFixed(2)} €</span>
                  </div>
                  <div className="bg-black/80 p-5 rounded-b-xl border border-slate-700/50 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Total a Reclamar ({dias} días)</p>
                    <p className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{totalReclamar.toFixed(2)}<span className="text-2xl text-slate-500 font-sans">€</span></p>
                  </div>
                </div>
              </div>
            </div>
            {totalReclamar !== 0 && (
              <button onClick={handleGenerateClaim} disabled={isGenerating || totalReclamar < 0} className={`w-full p-4 rounded-xl shadow-md font-bold flex items-center justify-center text-white ${apiKey ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-yellow-600 to-amber-600 animate-pulse'}`}>
                {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> ✨ Redactando escrito...</> : apiKey ? <><FileText className="w-5 h-5 mr-2" /> ✨ Redactar Escrito para RRHH</> : <><Key className="w-5 h-5 mr-2" /> ⚠️ Configura tu Clave IA</>}
              </button>
            )}
          </div>
        </div>
      </div>
      {draftResult && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 shadow-inner animate-fadeIn print:bg-white print:border-none print:p-0">
          <div className="flex items-center justify-between mb-4 border-b border-purple-200 pb-3 no-print">
            <h3 className="text-base font-bold text-purple-900 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-purple-600" /> Borrador de Reclamación Generado</h3>
            <div className="flex gap-2">
              <button onClick={handleDownloadPDF} className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold uppercase flex items-center gap-1 shadow"><Download className="w-3.5 h-3.5"/> Descargar PDF</button>
              <button onClick={() => { navigator.clipboard.writeText(draftResult); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`text-xs px-4 py-2 rounded-lg font-bold uppercase ${copied ? 'bg-green-600 text-white' : 'bg-purple-200 text-purple-800'}`}>{copied ? 'Copiado' : 'Copiar Texto'}</button>
            </div>
          </div>
          <div ref={claimRef} className="text-sm md:text-base text-gray-800 whitespace-pre-wrap font-serif leading-relaxed bg-white p-6 rounded-xl border border-purple-100 shadow-sm print:border-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between border-b pb-3 mb-4 text-red-700">
              <span className="font-black text-lg">SECCIÓN SINDICAL CGT - FCC MEDIO AMBIENTE</span>
              <Shield className="w-6 h-6" />
            </div>
            {draftResult}
          </div>
        </div>
      )}
    </div>
  );
});

const CalculadoraHorasExtras = memo(function CalculadoraHorasExtras({ perfil, apiKey, onConfigureIA }) {
  const turnos = Object.keys(tablaHorasExtras2026);
  const [turno, setTurno] = useState(() => localStorage.getItem('cgt_turno_horas') || 'DIA');
  const categoriasDisponibles = Object.keys(tablaHorasExtras2026[turno]);
  const [categoria, setCategoria] = useState(() => localStorage.getItem('cgt_cat_horas') || categoriasDisponibles[0]);
  const [horasNormales, setHorasNormales] = useState(0);
  const [horasFestivas, setHorasFestivas] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState('');

  const handleTurnoChange = (t) => { setTurno(t); localStorage.setItem('cgt_turno_horas', t); };
  const handleCategoriaChange = (e) => { setCategoria(e.target.value); localStorage.setItem('cgt_cat_horas', e.target.value); };
  useEffect(() => { setCategoria(Object.keys(tablaHorasExtras2026[turno])[0]); }, [turno]);

  const precios = tablaHorasExtras2026[turno][categoria] || {normal:0, festiva:0};
  const totalNormal = horasNormales * precios.normal;
  const totalFestivo = horasFestivas * precios.festiva;
  const total = totalNormal + totalFestivo;

  const handleGenerateClaim = async () => {
    if (!apiKey) { onConfigureIA(); return; }
    setIsGenerating(true);
    setDraftResult('');
    const prompt = `Redacta una carta formal muy concisa dirigida al Departamento de Recursos Humanos de FCC Medio Ambiente (Valencia). Soy un trabajador con la categoría de "${categoria}" en el turno de "${turno}". He realizado un total de ${horasNormales} horas extras en día normal y ${horasFestivas} horas extras en día festivo/descanso. Solicito formalmente el abono correspondiente a estas horas extras, que asciende a un total estimado de ${total.toFixed(2)} euros brutos, basándome en los precios del Anexo III del convenio colectivo de FCC Zona Norte de Valencia para el año 2026. La carta debe tener espacios para que yo rellene mi Nombre, DNI y Firma. No incluyas explicaciones tuyas, solo el texto de la carta listo para imprimir. Asesorado por JUAN CARLOS, DELEGADO SINDICAL CGT.`;
    const response = await callGeminiAPI(prompt, apiKey);
    setDraftResult(response);
    setIsGenerating(false);
  };

  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 no-print">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-3 mb-4 flex items-center text-gray-800"><Timer className="mr-3 text-purple-600 w-6 h-6" /> Calculadora de Horas Extras (Anexo III - Tablas 2026)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="space-y-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Tu Turno / Sección</label>
              <div className="flex gap-2">
                {turnos.map(t => <button key={t} onClick={() => handleTurnoChange(t)} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${turno === t ? 'bg-purple-600 text-white border-transparent' : 'bg-white text-gray-600 border border-gray-200'}`}>{t}</button>)}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Tu Categoría</label>
              <select className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none" value={categoria} onChange={handleCategoriaChange}>
                {categoriasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase flex justify-between"><span>Hrs. Extras Normales</span><span className="text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md">{precios.normal.toFixed(2)} €/h</span></label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-gray-200 bg-white">
                <button onClick={() => setHorasNormales(Math.max(0, horasNormales - 1))} className="bg-gray-100 w-14 h-12 font-bold text-2xl text-gray-600">-</button>
                <input type="number" min="0" className="w-full h-12 text-center text-xl font-bold focus:outline-none" value={horasNormales} onChange={(e) => setHorasNormales(parseFloat(e.target.value) || 0)} />
                <button onClick={() => setHorasNormales(horasNormales + 1)} className="bg-gray-100 w-14 h-12 font-bold text-2xl text-gray-600">+</button>
              </div>
            </div>
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase flex justify-between"><span>Hrs. Extras Festivas</span><span className="text-red-600 bg-red-100 px-2 py-0.5 rounded-md">{precios.festiva.toFixed(2)} €/h</span></label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-gray-200 bg-white">
                <button onClick={() => setHorasFestivas(Math.max(0, horasFestivas - 1))} className="bg-gray-100 w-14 h-12 font-bold text-2xl text-gray-600">-</button>
                <input type="number" min="0" className="w-full h-12 text-center text-xl font-bold focus:outline-none" value={horasFestivas} onChange={(e) => setHorasFestivas(parseFloat(e.target.value) || 0)} />
                <button onClick={() => setHorasFestivas(horasFestivas + 1)} className="bg-gray-100 w-14 h-12 font-bold text-2xl text-gray-600">+</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="bg-black text-white p-6 md:p-8 rounded-2xl shadow-xl flex-1 flex flex-col justify-center no-invert">
              <h3 className="text-purple-400 font-extrabold mb-5 uppercase tracking-widest text-xs flex items-center z-10 border-b border-gray-800 pb-2"><Award className="w-4 h-4 mr-2" /> Resultado Total (2026)</h3>
              <div className="space-y-4 z-10 relative">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3"><span className="text-gray-400 text-sm">Normales:</span><span className="font-mono text-lg">{totalNormal.toFixed(2)} €</span></div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-3"><span className="text-gray-400 text-sm">Festivas:</span><span className="font-mono text-lg">{totalFestivo.toFixed(2)} €</span></div>
                <div className="flex justify-between items-end pt-3"><span className="text-lg font-bold">Total:</span><span className="text-4xl font-black text-green-400">{total.toFixed(2)} €</span></div>
              </div>
            </div>
            {total > 0 && (
              <button onClick={handleGenerateClaim} disabled={isGenerating} className={`w-full p-4 rounded-xl shadow-md font-bold flex items-center justify-center text-white ${apiKey ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-yellow-600 to-amber-600 animate-pulse'}`}>
                {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Redactando...</> : apiKey ? <><FileText className="w-5 h-5 mr-2" /> Redactar Escrito para RRHH</> : <><Key className="w-5 h-5 mr-2" /> Configura tu Clave IA</>}
              </button>
            )}
          </div>
        </div>
      </div>
      {draftResult && <div className="bg-purple-50 p-6 rounded-2xl shadow-inner mt-4 print:bg-white"><div className="text-sm md:text-base font-serif bg-white p-6 rounded-xl border border-purple-100">{draftResult}</div></div>}
    </div>
  );
});

const PagasExtrasPluses = memo(function PagasExtrasPluses({ perfil }) {
  const [subTab, setSubTab] = useState('pagas'); 
  const [categoria, setCategoria] = useState(perfil.categoria);
  const [anios, setAnios] = useState(0);

  useEffect(() => {
    if(perfil.fechaIngreso){
      const ingreso = new Date(perfil.fechaIngreso);
      const hoy = new Date();
      let a = hoy.getFullYear() - ingreso.getFullYear();
      if(hoy.getMonth() < ingreso.getMonth() || (hoy.getMonth() === ingreso.getMonth() && hoy.getDate() < ingreso.getDate())) a--;
      setAnios(Math.max(0, a));
    }
  }, [perfil.fechaIngreso]);

  const categorias = Object.keys(tablaSalarial2026);
  let porcentaje = 0;
  for (let i = 0; i < escalaAntiguedad.length; i++) { if (anios >= escalaAntiguedad[i].años) porcentaje = escalaAntiguedad[i].porcentaje; else break; }

  const baseDiaria = tablaSalarial2026[categoria]?.base || 0;
  const antiDiaria = (baseDiaria * porcentaje) / 100;
  const totalPaga = (baseDiaria + antiDiaria) * 30; 
  const plusFallas = tablaSalarial2026[categoria]?.fallas || 0;

  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-3 mb-4 flex items-center text-gray-800"><Euro className="mr-3 text-green-600 w-6 h-6 no-print" /> Pagas Extras y Pluses (Valores 2026)</h2>
        
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto md:mx-0 mb-6 no-print">
          <button onClick={() => setSubTab('pagas')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${subTab === 'pagas' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500'}`}><Gift className="w-4 h-4" /> Pagas Extras</button>
          <button onClick={() => setSubTab('pluses')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${subTab === 'pluses' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500'}`}><Sparkles className="w-4 h-4" /> Pluses Anuales</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 no-print">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Tu Categoría</label>
            <select className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none" value={categoria} onChange={(e) => setCategoria(e.target.value)}>{categorias.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          {subTab === 'pagas' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Años Antigüedad</label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-gray-200 bg-white">
                <button onClick={() => setAnios(Math.max(0, anios - 1))} className="bg-gray-100 w-14 h-[50px] font-bold text-2xl text-gray-600">-</button>
                <input type="number" min="0" className="w-full h-[50px] text-center border-x border-gray-200 text-xl font-bold focus:outline-none" value={anios} onChange={(e) => setAnios(parseInt(e.target.value) || 0)} />
                <button onClick={() => setAnios(anios + 1)} className="bg-gray-100 w-14 h-[50px] font-bold text-2xl text-gray-600">+</button>
              </div>
            </div>
          )}
        </div>

        {subTab === 'pagas' ? (
          <div className="space-y-4 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PagaCard titulo="Paga de Beneficios" subtitulo="(Abonada en Marzo)" importe={totalPaga} notaEspecial="El importe del 2026 se cobra al año siguiente." />
                <PagaCard titulo="Paga de Verano" subtitulo="(Abonada en Junio/Julio)" importe={totalPaga} />
                <PagaCard titulo="Paga de San Martín de Porres" subtitulo="(Abonada en Noviembre)" importe={totalPaga} />
                <PagaCard titulo="Paga de Navidad" subtitulo="(Abonada en Diciembre)" importe={totalPaga} />
             </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
                <h4 className="font-black text-gray-800 text-lg mb-2">Plus de Fallas 2026</h4>
                <div className="bg-white rounded-xl p-4 flex justify-between items-center border border-orange-100"><span className="text-sm font-bold text-gray-500">Importe Único</span><span className="font-mono text-2xl font-black text-orange-600">{plusFallas.toFixed(2)} €</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const PagaCard = memo(function PagaCard({ titulo, subtitulo, importe, notaEspecial }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">
       <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="bg-white border border-gray-200 p-2.5 rounded-xl text-green-600"><Gift className="w-6 h-6" /></div>
             <div><h4 className="font-black text-gray-800 text-sm md:text-base leading-tight">{titulo}</h4><p className="text-[10px] text-gray-500 font-bold uppercase">{subtitulo}</p></div>
          </div>
       </div>
       <div className="bg-white rounded-xl p-4 flex justify-between items-center border border-gray-100"><span className="text-xs font-bold text-gray-400 uppercase">Total percibir</span><span className="font-mono text-xl font-black text-green-600">{importe.toFixed(2)} €</span></div>
       {notaEspecial && <div className="mt-4 bg-blue-50 text-blue-800 text-[10px] font-bold py-2.5 px-3 rounded-lg border border-blue-200 text-center uppercase">{notaEspecial}</div>}
    </div>
  );
});

const RetencionesIRPF = memo(function RetencionesIRPF({ apiKey, onConfigureIA }) {
  const [devengos, setDevengos] = useState(1540.63);
  const [baseSS, setBaseSS] = useState(1837.19);
  const [baseIRPF, setBaseIRPF] = useState(1539.56);
  const [irpfPorcentaje, setIrpfPorcentaje] = useState(13.00);
  const [primaConvenio, setPrimaConvenio] = useState(1.07);

  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultadoAuditoria, setResultadoAuditoria] = useState('');

  const contingenciasComunes = baseSS * 0.047; 
  const mei = baseSS * 0.0012; 
  const desempleoFP = baseSS * 0.0165;
  const totalSS = contingenciasComunes + mei + desempleoFP; 
  const importeIRPF = baseIRPF * (irpfPorcentaje / 100); 
  const totalDeducciones = totalSS + importeIRPF + primaConvenio; 
  const liquidoPercibir = devengos - totalDeducciones;

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onloadend = () => { setArchivoAdjunto({ data: reader.result.split(',')[1], mimeType: uploadedFile.type }); };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const ejecutarAuditoria = async () => {
    if (!apiKey) { onConfigureIA(); return; }
    if (!archivoAdjunto) return;
    setIsAnalyzing(true);
    setResultadoAuditoria('');
    const prompt = `Actúas como un asesor fiscal experto en nóminas en España en el AÑO VIGENTE 2026. He adjuntado un documento de mi nómina mensual de la empresa FCC Medio Ambiente (Valencia Zona Norte). Tu tarea es auditar únicamente el apartado de RETENCIONES Y DEDUCCIONES basándote en la normativa y TABLAS VIGENTES DEL AÑO 2026 (Queda prohibido citar o referir a 2024 o años anteriores).

Por favor, estructura tu respuesta en Markdown de la siguiente forma:
- 🔍 **DATOS LEÍDOS DE LA NÓMINA (AÑO 2026)**: Indica el Total Devengado, las Bases de Cotización (Seguridad Social e IRPF) y los porcentajes que ha aplicado la empresa.
- 🧮 **AUDITORÍA DE SEGURIDAD SOCIAL 2026**: Comprueba si los porcentajes aplicados por ley al trabajador son correctos sobre esa base (4,70% Contingencias Comunes, 1,65% Desempleo+FP, y M.E.I. vigente en 2026).
- 💶 **ANÁLISIS DE IRPF**: Comprueba el porcentaje de IRPF aplicado según la proyección de ingresos de 2026.
- ⚠️ **CONCLUSIÓN**: Dime claramente si mi nómina está bien calculada o si me han retenido de más/de menos.

Termina tu respuesta SIEMPRE despidiéndote EXACTAMENTE con esta firma y nada más:
"Un saludo, **JUAN CARLOS**, DELEGADO SINDICAL CGT"`;
    const response = await callGeminiAPI(prompt, apiKey, [archivoAdjunto]);
    setResultadoAuditoria(response);
    setIsAnalyzing(false);
  };

  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 no-print">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-3 mb-4 flex items-center text-blue-900"><Landmark className="mr-3 text-blue-600 w-6 h-6" /> Herramienta Fiscal y Retenciones (2026)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8">
          <div className="lg:col-span-5 space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-inner">
            <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center border-b border-gray-200 pb-2 mb-4"><Calculator className="w-4 h-4 mr-2 text-blue-600" /> Inserta tus Bases</h3>
            <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">1. Total Devengado (Bruto)</label><input type="number" step="0.01" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-bold focus:outline-none" value={devengos} onChange={(e) => setDevengos(parseFloat(e.target.value) || 0)} /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">2. Base Cotización SS</label><input type="number" step="0.01" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-bold focus:outline-none" value={baseSS} onChange={(e) => setBaseSS(parseFloat(e.target.value) || 0)} /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">3. Base Sujeta a IRPF</label><input type="number" step="0.01" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-sm font-bold focus:outline-none" value={baseIRPF} onChange={(e) => setBaseIRPF(parseFloat(e.target.value) || 0)} /></div>
            <div className="pt-2 border-t border-gray-200 mt-2"><label className="block text-xs font-bold text-blue-800 mb-1.5 uppercase">% IRPF Aplicado</label><input type="number" step="0.01" className="w-full p-3 text-center bg-blue-50 border border-blue-200 text-lg font-black text-blue-900 rounded-xl focus:outline-none" value={irpfPorcentaje} onChange={(e) => setIrpfPorcentaje(parseFloat(e.target.value) || 0)} /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase mt-3">Primas o Seguros</label><input type="number" step="0.01" className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm font-bold" value={primaConvenio} onChange={(e) => setPrimaConvenio(parseFloat(e.target.value) || 0)} /></div>
          </div>
          <div className="lg:col-span-7 bg-[#fdfdfd] border-2 border-dashed border-gray-300 rounded-xl p-6 relative shadow-md">
             <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm mb-6 border-b border-gray-200 pb-2">Desglose de Deducciones 2026</h3>
             <div className="space-y-5">
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cotización Seguridad Social</p>
                 <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2">
                   <div className="flex justify-between text-xs md:text-sm"><span className="text-gray-600">Trab. Cont. Comunes (4.70%)</span><span className="font-mono font-bold text-red-600">-{contingenciasComunes.toFixed(2)} €</span></div>
                   <div className="flex justify-between text-xs md:text-sm"><span className="text-gray-600">Trab. Desem + F Profes (1.65%)</span><span className="font-mono font-bold text-red-600">-{desempleoFP.toFixed(2)} €</span></div>
                   <div className="flex justify-between text-xs md:text-sm"><span className="text-gray-600">M.E.I. (0.12%)</span><span className="font-mono font-bold text-red-600">-{mei.toFixed(2)} €</span></div>
                 </div>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Impuesto Renta F.P.</p>
                 <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex justify-between text-sm items-center"><span className="text-blue-900 font-semibold">Retención a Cta. IRPF ({irpfPorcentaje.toFixed(2)}%)</span><span className="font-mono font-black text-red-700 text-lg">-{importeIRPF.toFixed(2)} €</span></div>
               </div>
               <div className="border-t border-gray-300 pt-4 mt-6">
                 <div className="flex justify-between text-sm mb-2"><span className="font-bold text-gray-600">(B) Total Retenciones:</span><span className="font-mono font-bold text-gray-800">{totalDeducciones.toFixed(2)} €</span></div>
                 <div className="flex justify-between items-end bg-green-50 p-4 rounded-xl border border-green-200 mt-4 shadow-sm">
                   <div><span className="font-black text-green-900 text-sm uppercase">Líquido a Percibir</span></div>
                   <span className="font-mono font-black text-green-700 text-3xl md:text-4xl tracking-tighter">{liquidoPercibir.toFixed(2)} €</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 no-print">
        <h3 className="text-lg font-bold border-b border-gray-100 pb-3 mb-4 flex items-center text-purple-900"><Sparkles className="mr-3 text-purple-600 w-6 h-6 animate-pulse" /> Auditoría IA de Retenciones 2026</h3>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
             <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer relative flex flex-col items-center justify-center text-center h-[200px]">
                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <Upload className="w-12 h-12 text-gray-400 mb-3" /><p className="text-sm font-bold text-gray-700">{archivoAdjunto ? '¡Documento cargado!' : 'Sube tu nómina (Foto o PDF)'}</p>
             </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 rounded-xl shadow-lg relative flex-1 flex flex-col justify-center border border-blue-800 no-invert">
              <h4 className="text-blue-300 font-black mb-3 uppercase tracking-widest text-xs z-10">Asesor Fiscal Virtual (2026)</h4>
              <button onClick={ejecutarAuditoria} disabled={isAnalyzing || !archivoAdjunto} className={`w-full p-4 rounded-xl shadow-lg font-bold text-white mt-auto z-10 ${apiKey ? 'bg-blue-600 hover:bg-blue-500' : 'bg-yellow-600 hover:bg-yellow-500 animate-pulse text-yellow-50'}`}>
                {isAnalyzing ? "Auditando retenciones 2026..." : apiKey ? "Auditar mis Retenciones 2026" : "Necesitas la Clave IA"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {resultadoAuditoria && <div className="bg-blue-50 p-6 rounded-2xl shadow-inner mt-4 print:bg-white"><div className="text-sm md:text-base font-serif bg-white p-6 rounded-xl border border-blue-100">{resultadoAuditoria}</div></div>}
    </div>
  );
});

const CalculadoraAuditoria = memo(({ apiKey, onConfigureIA, voiceCommandToAudit }) => {
  const [archivos, setArchivos] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultado, setResultado] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ data: reader.result.split(',')[1], mimeType: file.type, name: file.name });
        reader.readAsDataURL(file);
      });
    })).then(newFiles => {
      setArchivos(prev => [...prev, ...newFiles]);
    });
  };

  const eliminarArchivo = (index) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (voiceCommandToAudit && archivos.length > 0 && !isAnalyzing) {
      ejecutarAnálisis(voiceCommandToAudit.text);
    }
  }, [voiceCommandToAudit]);

  const ejecutarAnálisis = async (peticionVoz = null) => {
    if (!apiKey) { onConfigureIA(); return; }
    if (!archivos.length) return;
    setIsAnalyzing(true);
    setResultado('');
    
    const consultaUsuario = peticionVoz ? `\n\nEl trabajador ha indicado por voz lo siguiente: "${peticionVoz}"` : '';

    const prompt = `Actúas como un experto auditor laboral de CGT en el AÑO VIGENTE 2026. Analiza los documentos o nóminas adjuntas de FCC Medio Ambiente (Valencia Zona Norte).

REGLA OBLIGATORIA: Debes auditar utilizando ÚNICAMENTE Y EXCLUSIVAMENTE LAS TABLAS SALARIALES DEFINITIVAS DEL AÑO 2026 del Convenio Colectivo de FCC Zona Norte Valencia.
Menciona explícitamente en la introducción que el análisis se realiza con las TABLAS OFICIALES VIGENTES DE 2026. Queda ESTRICTAMENTE PROHIBIDO citar tablas de 2024 o años anteriores.

INSTRUCCIÓN ESPECIAL VACACIONES (SI HAY VARIAS NÓMINAS O SE PIDE):
Si detectas más de una nómina adjunta (ej: 3 nóminas) o el trabajador solicita "calcular vacaciones"${consultaUsuario}, debes aplicar el Artículo 30 del Convenio FCC Zona Norte. La retribución de vacaciones se calcula hallando el PROMEDIO del salario percibido por todos los conceptos durante el TRIMESTRE ANTERIOR a su disfrute. 
EXCEPCIONES (NO SE INCLUYEN): Horas extraordinarias, plus productividad, prestaciones de Seguridad Social (IT), plus transporte, dietas, ayuda a discapacitados, plus de actividad de mercados/playas/contenedores (Art. 19), plus turnicidad/prolongación, ni ayudas sociales.
SÍ SE INCLUYEN: Salario Base, Antigüedad, Plus Penoso, Plus Nocturno, Plus Convenio, Plus Asistencia, Plus Reconversión Recogida y el Plus de Actividad Recogida Domiciliaria (Art. 17).
Muestra el cálculo paso a paso sumando las bases válidas de cada mes aportado y divídelas entre 3.

SI ES UNA AUDITORÍA NORMAL DE UN SOLO MES:
Comprueba punto por punto usando las cifras de 2026:
1. Salario Base 2026 según categoría (Ej: Peón 31,35 €/día, Conductor 32,19 €/día).
2. Plus Penosidad 2026 (25% del base).
3. Plus Asistencia 2026, Plus Convenio 2026, Plus Transporte 2026.
4. Plus Bivolante (2,91 €/día) o Porter (1,46 €/día).
5. Horas extras 2026 (Anexo III).
6. Cotizaciones a la Seguridad Social (4,70% CC, 1,65% Desempleo, M.E.I. vigente en 2026 e IRPF).

Indica en formato Markdown claro el resultado detallado de la petición.`;

    const res = await callGeminiAPI(prompt, apiKey, archivos);
    setResultado(res);
    setIsAnalyzing(false);
  };

  return (
    <div className="animate-fadeIn space-y-6 w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-3 mb-4 flex items-center text-purple-900"><FileSearch className="mr-3 text-purple-600 w-6 h-6 animate-pulse" /> Auditoría Completa de Nómina IA (Tablas 2026)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-gray-50 h-full min-h-[220px] relative">
             <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" title="Sube una o varias nóminas (Fotos o PDF)" />
             <div className="pointer-events-none flex flex-col items-center">
               <Upload className="w-10 h-10 text-gray-400 mb-2" />
               <p className="font-bold text-sm text-gray-700">Haz clic o arrastra archivos aquí</p>
               <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Acepta Fotos y PDF. Puedes subir 3 nóminas juntas.</p>
             </div>
             {archivos.length > 0 && (
               <div className="mt-4 w-full space-y-2 z-20 relative">
                 {archivos.map((file, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-white p-2 border border-gray-200 rounded-lg shadow-sm text-xs">
                     <span className="truncate font-bold text-gray-700 flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-purple-500 shrink-0"/> {file.name || `Documento ${idx+1}`}</span>
                     <button onClick={() => eliminarArchivo(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded-md"><X className="w-4 h-4"/></button>
                   </div>
                 ))}
               </div>
             )}
           </div>
           <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-center no-invert">
             <h3 className="text-purple-300 font-black uppercase text-xs mb-3">Auditor Laboral IA 2026</h3>
             <p className="text-xs text-purple-200 mb-6 leading-relaxed">Sube tus nóminas en PDF o foto. Si subes 3 nóminas y utilizas el asistente de voz ("Calcula mis vacaciones"), la IA aplicará automáticamente la regla del promedio del Artículo 30.</p>
             <button onClick={() => ejecutarAnálisis()} disabled={isAnalyzing || archivos.length === 0} className={`w-full p-4 rounded-xl font-bold shadow-lg transition-all text-white ${apiKey ? 'bg-purple-600 hover:bg-purple-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}>
               {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin inline"/> Procesando Documentos...</> : apiKey ? 'Ejecutar Auditoría 2026' : 'Configura tu Clave IA'}
             </button>
           </div>
        </div>
      </div>
      {resultado && (
        <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-md">
           <h3 className="font-bold text-purple-900 mb-3 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-purple-600"/> Informe de Auditoría Emitido (Tablas 2026):</h3>
           <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-serif bg-purple-50/50 p-5 rounded-xl border border-purple-100">{resultado}</div>
        </div>
      )}
    </div>
  );
});

const TraductorLegal = memo(({ apiKey, onConfigureIA }) => {
  const [texto, setTexto] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [resultado, setResultado] = useState('');

  const traducirTexto = async () => {
    if (!apiKey) { onConfigureIA(); return; }
    if (!texto.trim()) return;
    setIsTranslating(true);
    setResultado('');
    const prompt = `Traduce el siguiente texto legal extraído de un convenio o del Estatuto de los Trabajadores a un lenguaje cotidiano, claro y comprensible para cualquier trabajador de a pie, explicando exactamente a qué tiene derecho o a qué le obliga: \n\n"${texto}"`;
    const res = await callGeminiAPI(prompt, apiKey);
    setResultado(res);
    setIsTranslating(false);
  };

  return (
    <div className="animate-fadeIn space-y-6 w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-3 mb-4 flex items-center text-purple-900"><BookType className="mr-3 text-purple-600 w-6 h-6" /> Traductor de Convenios e Artículos a Lenguaje Claro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <textarea rows="8" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Pega aquí el texto legal confuso de un artículo del convenio o boletín..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none font-sans" />
           <div className="bg-gradient-to-br from-indigo-900 to-purple-950 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-center no-invert">
             <h3 className="text-indigo-300 font-bold uppercase text-xs mb-3">Inteligencia Jurídica Sencilla</h3>
             <p className="text-xs text-indigo-200 mb-6 leading-relaxed">Convierte la jerga legal incomprensible en explicaciones directas sobre tus derechos reales.</p>
             <button onClick={traducirTexto} disabled={isTranslating || !texto.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-4 rounded-xl w-full mt-auto shadow-md">
               {isTranslating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin inline"/> Traduciendo...</> : apiKey ? 'Traducir a Lenguaje Claro' : 'Falta Clave IA'}
             </button>
           </div>
        </div>
      </div>
      {resultado && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md">
           <h3 className="font-bold text-indigo-900 mb-3 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-indigo-600"/> Explicación Clara:</h3>
           <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">{resultado}</div>
        </div>
      )}
    </div>
  );
});

const RedactorPeticiones = memo(function RedactorPeticiones({ apiKey, onConfigureIA }) {
  const temas = [
    "Petición de Vacaciones", 
    "Solicitud de Cambio de Turno", 
    "Reclamación por falta de EPIs / Ropa Laboral", 
    "Petición de Excedencia Voluntaria", 
    "Solicitud de permiso no retribuido de 10 días", 
    "Queja Formal a Recursos Humanos", 
    "Solicitud de Anticipo de Nómina", 
    "Reclamación de Categoría Superior / Diferencias Salariales", 
    "Otro Tema (Descríbelo en los detalles)"
  ];

  const [tema, setTema] = useState(temas[0]);
  const [detalles, setDetalles] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [documento, setDocumento] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRedactar = async () => {
    if (!apiKey) { onConfigureIA(); return; }
    setIsGenerating(true);
    setDocumento('');
    const prompt = `Redacta una instancia u escrito formal oficial dirigido a la Dirección de Recursos Humanos de la empresa FCC Medio Ambiente (Valencia Zona Norte).
Motivo principal de la solicitud: "${tema}".
Detalles o especificaciones aportadas por el trabajador: "${detalles}".
El escrito debe ser riguroso, formal y amparado en la legalidad vigente (Estatuto de los Trabajadores y Convenio Colectivo FCC 2026). Debe incluir campos claros entre corchetes para [Nombre y Apellidos], [DNI], [Fecha], y espacio para la [Firma del Trabajador/a].
Firma al final asesorado por JUAN CARLOS, DELEGADO SINDICAL CGT. No añadas introducciones o explicaciones extra fuera del escrito oficial.`;

    const res = await callGeminiAPI(prompt, apiKey);
    setDocumento(res);
    setIsGenerating(false);
  };

  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 no-print">
        <h2 className="text-xl font-bold border-b border-gray-100 pb-3 mb-4 flex items-center text-red-900"><PenTool className="mr-3 text-red-600 w-6 h-6" /> Redactor Mágico de Peticiones e Instancias a RRHH</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">Selecciona el tipo de solicitud que deseas realizar a la empresa e indica los detalles específicos. La IA redactará el documento oficial formal listo para registrar.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Tipo de Solicitud / Instancia</label>
               <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-red-500 outline-none" value={tema} onChange={e => setTema(e.target.value)}>
                 {temas.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Detalles Específicos (Fechas, Fechas de disfrute, Nombres...)</label>
               <textarea rows="5" value={detalles} onChange={e => setDetalles(e.target.value)} placeholder="Ej: Solicito disfrutar de 5 días de vacaciones pendientes del 10 al 15 de Octubre..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none" />
             </div>
           </div>
           <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between no-invert">
             <div>
               <h3 className="text-red-400 font-black uppercase text-xs mb-3">Redacción Oficial Imprimible</h3>
               <p className="text-xs text-slate-300 leading-relaxed mb-4">El escrito resultante cumplirá con todos los formulismos legales y sindicales exigidos por Recursos Humanos de FCC para su registro oficial de entrada.</p>
             </div>
             <button onClick={handleRedactar} disabled={isGenerating} className={`w-full p-4 rounded-xl font-bold shadow-lg transition-all text-white mt-auto ${apiKey ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
               {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin inline"/> Redactando instancia...</> : apiKey ? 'Redactar Petición Oficial' : 'Configurar Clave IA'}
             </button>
           </div>
        </div>
      </div>

      {documento && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
           <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3 no-print">
             <h3 className="font-bold text-gray-800 flex items-center"><FileText className="w-5 h-5 mr-2 text-red-600"/> Instancia Oficial Generada:</h3>
             <div className="flex gap-2">
               <button onClick={() => { window.print(); }} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg flex items-center gap-1.5"><Download className="w-4 h-4"/> Imprimir</button>
               <button onClick={() => { navigator.clipboard.writeText(documento); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`px-3 py-1.5 font-bold text-xs rounded-lg text-white ${copied ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'}`}>{copied ? '¡Copiado!' : 'Copiar Texto'}</button>
             </div>
           </div>
           <div className="whitespace-pre-wrap text-sm md:text-base text-gray-900 leading-relaxed font-serif bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner">{documento}</div>
        </div>
      )}
    </div>
  );
});

const AsistenteIA = memo(({ apiKey, onSaveKey, onClearKey }) => {
  const [inputKey, setInputKey] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu Asistente Legal e Inteligencia Artificial Sindical de CGT en FCC Medio Ambiente. Conozco a fondo el **Estatuto de los Trabajadores**, el **Convenio General del Sector de Limpieza Pública y Recogida**, y las **Tablas Salariales Definitivas de 2026** del **Convenio Colectivo FCC Zona Norte 2022-2027**. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!mensaje.trim() || loading || !apiKey) return;
    const userText = mensaje;
    setMensaje('');
    
    const newHistory = [...chatHistory, { role: 'user', text: userText }];
    setChatHistory(newHistory);
    setLoading(true);

    const respuesta = await callGeminiAPI(newHistory, apiKey);
    setChatHistory([...newHistory, { role: 'assistant', text: respuesta }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-4 w-full h-[78vh] print-area">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-5 rounded-2xl shadow-lg text-white flex justify-between items-center no-invert shrink-0">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-200" />
          <div>
            <h2 className="text-lg font-bold leading-tight">Asistente Sindical e Inteligencia Jurídica IA (2026)</h2>
            <p className="text-xs text-purple-200">Estatuto de los Trabajadores • Convenio Sectorial Estatal • Convenio Colectivo FCC Valencia (Tablas 2026)</p>
          </div>
        </div>
        {apiKey && (
          <button onClick={onClearKey} className="text-xs bg-purple-900/60 hover:bg-purple-900 px-3 py-1.5 rounded-lg border border-purple-400/40 text-purple-200 font-bold transition">
            Cambiar Clave IA
          </button>
        )}
      </div>

      {!apiKey && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md space-y-4 no-print">
           <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base border-b border-amber-200 pb-2">
             <Key className="w-5 h-5 text-amber-600" /> Configuración de tu Clave Personal Gratuita de Google AI Studio
           </div>
           
           <p className="text-xs md:text-sm text-amber-800 leading-relaxed font-medium">
             Para activar el asistente inteligente e interpretar tus derechos laborales con IA, debes añadir tu clave gratuita de Google. Es rápida y totalmente personal:
           </p>

           <ol className="list-decimal list-inside text-xs md:text-sm text-amber-900 space-y-2 font-semibold bg-white p-4 rounded-xl border border-amber-200">
             <li>Abre en tu navegador la web oficial: <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-1">aistudio.google.com <ExternalLink className="w-3 h-3"/></a></li>
             <li>Inicia sesión con tu cuenta de correo de Google (Gmail).</li>
             <li>Haz clic en el botón azul <strong>"Get API key"</strong> (Obtener clave API) en la esquina superior izquierda.</li>
             <li>Pulsa en <strong>"Create API key"</strong> (Crear clave API) y copia el código generado.</li>
             <li>Pégalo en el recuadro inferior y haz clic en <strong>"Guardar Clave"</strong>.</li>
           </ol>

           <div className="flex gap-2 pt-2">
             <input type="password" placeholder="Pega aquí tu clave (AIzaSy...)" className="flex-1 p-3.5 bg-white border border-amber-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none" value={inputKey} onChange={e => setInputKey(e.target.value)} />
             <button onClick={() => onSaveKey(inputKey)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-md transition-all active:scale-95">
               Guardar Clave
             </button>
           </div>
        </div>
      )}

      <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 overflow-y-auto shadow-inner space-y-4 custom-scrollbar">
         {chatHistory.map((msg, idx) => (
           <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none shadow-md font-medium' : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200 font-serif whitespace-pre-wrap'}`}>
               {msg.text}
             </div>
           </div>
         ))}
         {loading && (
           <div className="flex justify-start">
             <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none border border-gray-200 text-sm text-gray-500 flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Consultando Estatuto de los Trabajadores, Convenio General y Tablas FCC 2026...
             </div>
           </div>
         )}
      </div>

      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-gray-200 shrink-0 shadow-sm no-print">
         <input type="text" value={mensaje} onChange={e => setMensaje(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEnviar()} placeholder={apiKey ? "Pregunta sobre convenio 2026, retenciones, jornada, permisos..." : "Debes añadir tu clave API en el recuadro superior..."} className="flex-1 px-4 py-3.5 bg-gray-50 rounded-xl outline-none text-sm font-medium" disabled={!apiKey || loading} />
         <button onClick={handleEnviar} disabled={!apiKey || loading || !mensaje.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl font-bold no-invert transition-all active:scale-95">
           <Send className="w-5 h-5"/>
         </button>
      </div>
    </div>
  );
});

const PortalEmpleado = memo(() => {
  return (
    <div className="animate-fadeIn w-full max-w-4xl mx-auto space-y-6 print-area font-sans">
      
      <div className="bg-[#450a0a] border border-red-900/80 text-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
        <span className="text-3xl">👋</span>
        <div>
          <h2 className="text-lg md:text-xl font-black text-white leading-tight">
            Hola compañeros/as, soy <span className="text-red-400">Juan Carlos, vuestro Delegado Sindical</span>.
          </h2>
          <p className="text-xs md:text-sm text-red-200/90 mt-1">
            Aquí tenéis todas las herramientas oficiales para acceder a vuestras nóminas sin problemas.
          </p>
        </div>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2 text-blue-400">
          <Globe className="w-5 h-5" /> Acceso Web Directo
        </h3>
        <p className="text-xs text-slate-300">
          Entra a tu nómina sin instalar nada, directamente desde el navegador.
        </p>
        <a 
          href="https://iris.fcc.es/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm"
        >
          Entrar a iris.fcc.es <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
          <Smartphone className="w-5 h-5" /> Descargar App FCC
        </h3>
        <p className="text-xs text-slate-300">
          Instala la aplicación oficial en tu teléfono móvil:
        </p>
        <div className="space-y-2.5">
          <a 
            href="https://play.google.com/store/apps/details?id=es.fcc.app" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-md transition-all text-sm"
          >
            <Download className="w-4 h-4" /> Descargar para Android
          </a>
          <a 
            href="https://www.fcc.es/linkapp" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-2 w-full bg-black hover:bg-slate-950 border border-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm"
          >
            <Download className="w-4 h-4" /> Descargar para iOS
          </a>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2 text-slate-200">
          <Settings className="w-5 h-5 text-amber-500" /> Servicio Técnico (Servidek)
        </h3>

        <div className="grid grid-cols-1 gap-3">
          <a 
            href="mailto:servicedeskfcc@fcc.es" 
            className="flex items-center gap-3 p-4 bg-slate-800/90 rounded-xl border border-slate-700/80 hover:bg-slate-750 transition"
          >
            <div className="bg-blue-600 p-2.5 rounded-lg text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ENVIAR EMAIL</p>
              <p className="font-mono font-bold text-sm text-white">servicedeskfcc@fcc.es</p>
            </div>
          </a>

          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LLAMAR A SOPORTE</span>
            </div>
            <a 
              href="tel:+34919019499" 
              className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-750 text-sm font-mono font-bold text-slate-200 hover:text-white transition"
            >
              <span>+(34) 919 019 499</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </a>
            <a 
              href="tel:+34902111344" 
              className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-750 text-sm font-mono font-bold text-slate-200 hover:text-white transition"
            >
              <span>+(34) 902 111 344</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        </div>

        <div className="bg-amber-950/60 border border-amber-800/80 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📌</span>
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wide">CÓDIGOS DE INCIDENCIA</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="font-mono bg-amber-900/90 text-amber-200 border border-amber-700/80 px-3 py-1 rounded-md text-xs font-bold">
              Inc0273103
            </span>
            <span className="font-mono bg-amber-900/90 text-amber-200 border border-amber-700/80 px-3 py-1 rounded-md text-xs font-bold">
              Inc0273064 general
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3 rounded-xl shadow-md border border-slate-700 text-xs transition"
        >
          <Printer className="w-4 h-4" /> Imprimir Contactos
        </button>
      </div>

    </div>
  );
});

const TablaPermisos = memo(() => {
  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl md:text-2xl font-bold border-b border-gray-100 pb-4 mb-6 flex items-center text-blue-900"><Briefcase className="mr-3 text-blue-600 w-8 h-8 shrink-0" /> Permisos Retribuidos y Grados de Parentesco</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-600" /> Los 12 Permisos Retribuidos Oficiales</h3>
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-xl shadow-sm"><p className="font-bold text-blue-900">1. Matrimonio</p><p className="text-sm text-blue-800"><span className="font-bold text-base">15 días</span> naturales consecutivos.</p></div>
            <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-xl shadow-sm"><p className="font-bold text-red-900">2. Fallecimiento (Cónyuge / Hijos / Padres)</p><p className="text-sm text-red-800"><span className="font-bold text-base">4 días</span> hábiles + 3 por desplazamiento.</p></div>
            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-xl shadow-sm"><p className="font-bold text-orange-900">3. Fallecimiento de Hermanos/as</p><p className="text-sm text-orange-800"><span className="font-bold text-base">3 días</span> hábiles + 3 por desplazamiento.</p></div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-xl shadow-sm"><p className="font-bold text-yellow-900">4. Hospitalización / Intervención / Enfermedad Grave</p><p className="text-sm text-yellow-800">Hasta <span className="font-bold text-base">5 días</span> retribuidos por Ley de Familias (Estatuto Art. 37.3.b).</p></div>
            <div className="p-4 border-l-4 border-fuchsia-500 bg-fuchsia-50 rounded-r-xl shadow-sm"><p className="font-bold text-fuchsia-900">5. Fallecimiento de Familiares de 3º Grado</p><p className="text-sm text-fuchsia-800"><span className="font-bold text-base">2 días</span> + 2 adicionales si hay desplazamiento.</p></div>
            <div className="p-4 border-l-4 border-cyan-500 bg-cyan-50 rounded-r-xl shadow-sm"><p className="font-bold text-cyan-900">6. Matrimonio de Familiares de 1º o 2º Grado</p><p className="text-sm text-cyan-800"><span className="font-bold text-base">2 días</span> + 4 en caso de desplazamiento.</p></div>
            <div className="p-4 border-l-4 border-rose-500 bg-rose-50 rounded-r-xl shadow-sm"><p className="font-bold text-rose-900">7. Alumbramiento de Esposa</p><p className="text-sm text-rose-800"><span className="font-bold text-base">3 días</span> + 3 por desplazamiento.</p></div>
            <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-xl shadow-sm"><p className="font-bold text-emerald-900">8. Traslado de Domicilio Habitual</p><p className="text-sm text-emerald-800"><span className="font-bold text-base">2 días</span> por convenio.</p></div>
            <div className="p-4 border-l-4 border-teal-500 bg-teal-50 rounded-r-xl shadow-sm"><p className="font-bold text-teal-900">9. Asuntos Propios (Sin Justificar)</p><p className="text-sm text-teal-800"><span className="font-bold text-base">3 días</span> retribuidos al año.</p></div>
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-xl shadow-sm"><p className="font-bold text-purple-900">10. Exámenes Prenatales y Preparación al Parto</p><p className="text-sm text-purple-800"><span className="font-bold text-base">El tiempo indispensable</span> con preaviso.</p></div>
            <div className="p-4 border-l-4 border-pink-500 bg-pink-50 rounded-r-xl shadow-sm"><p className="font-bold text-pink-900">11. Nacimiento / Adopción / Acogimiento</p><p className="text-sm text-pink-800"><span className="font-bold text-base">16 semanas</span> (Prestación SS 100%).</p></div>
            <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-xl shadow-sm"><p className="font-bold text-indigo-900">12. Cumplimiento de Deber Inexcusable Público</p><p className="text-sm text-indigo-800"><span className="font-bold text-base">Tiempo indispensable</span> (Juicios, votaciones...).</p></div>
          </div>
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-600" /> Esquema de Grados de Parentesco</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <ul className="space-y-4 text-sm">
                <li className="flex items-start"><div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded font-bold mr-3 mt-0.5 shrink-0">1º Grado</div><div className="text-slate-700 leading-tight">Padres, Hijos/as, Cónyuge / Pareja de Hecho, Suegros/as, Yerno y Nuera.</div></li>
                <li className="flex items-start"><div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded font-bold mr-3 mt-0.5 shrink-0">2º Grado</div><div className="text-slate-700 leading-tight">Abuelos/as, Nietos/as, Hermanos/as, Cuñados/as.</div></li>
                <li className="flex items-start"><div className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded font-bold mr-3 mt-0.5 shrink-0">3º Grado</div><div className="text-slate-700 leading-tight">Bisabuelos/as, Tíos/as, Sobrinos/as, Bisnietos/as.</div></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const CalculoAntiguedad = memo(({ perfil }) => {
  const [aniosInput, setAniosInput] = useState(10);
  const [modoFecha, setModoFecha] = useState(false);
  const [fechaAlta, setFechaAlta] = useState(perfil.fechaIngreso || '2015-01-01');

  const calcularAntigüedadDesdeFecha = (f) => {
    const ingreso = new Date(f);
    const hoy = new Date();
    let a = hoy.getFullYear() - ingreso.getFullYear();
    if(hoy.getMonth() < ingreso.getMonth() || (hoy.getMonth() === ingreso.getMonth() && hoy.getDate() < ingreso.getDate())) a--;
    return Math.max(0, a);
  };

  const aniosEfectivos = modoFecha ? calcularAntigüedadDesdeFecha(fechaAlta) : aniosInput;

  let porcentaje = 0;
  let tramoActual = "Menos de 2 Años";
  for (let i = 0; i < escalaAntiguedad.length; i++) {
    if (aniosEfectivos >= escalaAntiguedad[i].años) {
      porcentaje = escalaAntiguedad[i].porcentaje;
      tramoActual = escalaAntiguedad[i].descripcion;
    } else break;
  }

  const baseDiariaPeon = tablaSalarial2026["Peón limpieza día"]?.base || 31.35;
  const plusAntiguedadDiario = (baseDiariaPeon * porcentaje) / 100;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <h2 className="text-xl font-bold border-b border-gray-100 pb-3 text-gray-800 flex items-center"><Calendar className="w-6 h-6 mr-3 text-red-600" /> Antigüedad, Tramos y Ayudas Sociales (2026)</h2>
      
      <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm space-y-4">
         <div className="flex justify-between items-center border-b border-green-200 pb-3">
           <p className="text-xs font-bold text-green-900 uppercase tracking-widest">Simulador de Tramos de Antigüedad (Art. 12)</p>
           <button onClick={() => setModoFecha(!modoFecha)} className="text-xs bg-white text-green-700 px-3 py-1.5 rounded-lg font-bold border border-green-300 shadow-sm">
             {modoFecha ? 'Modo Años Cumplidos' : 'Modo Fecha de Alta'}
           </button>
         </div>

         {!modoFecha ? (
           <div className="flex items-center justify-center gap-4">
             <button onClick={() => setAniosInput(Math.max(0, aniosInput - 1))} className="bg-white w-12 h-12 rounded-xl border border-green-300 font-bold text-2xl text-green-800 shadow-sm">-</button>
             <div className="text-center px-4"><span className="text-3xl font-black text-green-900">{aniosInput}</span><span className="text-xs font-bold block text-green-700 uppercase">Años Cumplidos</span></div>
             <button onClick={() => setAniosInput(aniosInput + 1)} className="bg-white w-12 h-12 rounded-xl border border-green-300 font-bold text-2xl text-green-800 shadow-sm">+</button>
           </div>
         ) : (
           <div className="max-w-xs mx-auto">
             <label className="block text-xs font-bold text-green-800 mb-1">Fecha de Alta en la Empresa:</label>
             <input type="date" value={fechaAlta} onChange={e => setFechaAlta(e.target.value)} className="w-full p-3 bg-white border border-green-300 rounded-xl text-center font-bold text-green-900" />
           </div>
         )}

         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-green-200 text-center">
            <div><span className="text-[10px] text-gray-400 font-bold uppercase block">Tramo Alcanzado</span><span className="font-bold text-gray-800 text-sm">{tramoActual}</span></div>
            <div><span className="text-[10px] text-gray-400 font-bold uppercase block">% Salario Base</span><span className="font-mono font-black text-green-600 text-lg">+{porcentaje}%</span></div>
            <div className="col-span-2 md:col-span-1"><span className="text-[10px] text-gray-400 font-bold uppercase block">Plus Diario Estimado (2026)</span><span className="font-mono font-black text-green-700 text-lg">+{plusAntiguedadDiario.toFixed(2)} €/día</span></div>
         </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Award className="w-5 h-5 text-red-600" /> Premios por Jubilación Anticipada (Art. 41 - Valores 2026)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {conceptosSociales.jubilacionAnticipada2026.map(j => (
            <div key={j.antelacion} className="flex justify-between items-center text-sm p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-800">{j.antelacion} antes de edad legal</span>
              <span className="font-mono font-bold text-red-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">{j.importe.toFixed(2)} € / año serv.</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-blue-600" /> Ayudas Sociales y Familiares (Arts. 39 y 40 - Valores 2026)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {conceptosSociales.ayudas.map((a, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-medium text-gray-700">{a.concepto}</span>
              <span className="font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">{a.importe.toFixed(2)} €</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const BuscadorConvenios = memo(() => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <h2 className="text-xl font-bold border-b border-gray-100 pb-3 text-gray-800 flex items-center"><Download className="mr-3 text-red-600 w-6 h-6" /> Convenios Colectivos y Marco Legal Directo</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="https://www.cgtvalencia.org/wp-content/uploads/2026/06/convenio-2018-2027-FCC-TERMINADO-2.pdf" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 hover:bg-red-100 transition rounded-2xl text-red-700 shadow-sm text-center group">
          <FileText className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm">Descargar Convenio FCC 2022-2027 (PDF)</span>
          <span className="text-[10px] text-red-500 font-bold mt-1">Texto Oficial Completo CGT</span>
        </a>

        <a href="https://bop.dival.es/bop/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-6 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition rounded-2xl text-blue-700 shadow-sm text-center group">
          <ExternalLink className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm">Boletín Oficial Valencia (BOP)</span>
          <span className="text-[10px] text-blue-500 font-bold mt-1">Publicaciones Oficiales</span>
        </a>

        <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-6 bg-green-50 border border-green-200 hover:bg-green-100 transition rounded-2xl text-green-700 shadow-sm text-center group">
          <BookOpen className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
          <span className="font-black text-sm">Estatuto de los Trabajadores (BOE)</span>
          <span className="text-[10px] text-green-600 font-bold mt-1">Ley Marco Estatal</span>
        </a>
      </div>

      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
         <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center"><Info className="w-4 h-4 mr-2 text-purple-600"/> Jerarquía Legal de Aplicación</h3>
         <p className="text-xs text-gray-600 leading-relaxed">
           En la resolución de dudas laborales, el orden legal aplicable es: <strong>1º Convenio Colectivo FCC Valencia Zona Norte</strong> (siempre que mejore la ley) ➔ <strong>2º Convenio General Estatal del Sector de Limpieza Pública y Recogida</strong> ➔ <strong>3º Estatuto de los Trabajadores</strong>. Prevalece siempre la norma que resulte más favorable para la persona trabajadora.
         </p>
      </div>
    </div>
  );
});

const VideotecaSindical = memo(() => {
  const videos = [
    { 
      id: '1', 
      titulo: 'Estatuto de los Trabajadores: lo que debes saber', 
      desc: 'Resumen rápido de los derechos básicos.',
      fuente: 'CATÁLOGO CGT',
      url: 'https://www.youtube.com/results?search_query=estatuto+de+los+trabajadores+cgt',
      thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '2', 
      titulo: 'Entender la Nómina', 
      desc: 'Aprende a leer los devengos y deducciones.',
      fuente: 'CATÁLOGO CGT',
      url: 'https://www.youtube.com/results?search_query=como+leer+nomina+fcc+cgt',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '3', 
      titulo: 'Tipos de Despido e Indemnizaciones', 
      desc: 'Información vital sobre finiquitos.',
      fuente: 'CATÁLOGO CGT',
      url: 'https://www.youtube.com/results?search_query=tipos+de+despido+cgt',
      thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '4', 
      titulo: 'Ley de Prevención de Riesgos Laborales', 
      desc: 'Audio de la normativa de seguridad e higiene.',
      fuente: 'CATÁLOGO CGT',
      url: 'https://www.youtube.com/results?search_query=prevencion+riesgos+laborales+cgt',
      thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    },
    { 
      id: '5', 
      titulo: 'Estatuto Trabajadores (Audio Ley Completa)', 
      desc: 'Audio oficial del Estatuto.',
      fuente: 'CATÁLOGO CGT',
      url: 'https://www.youtube.com/results?search_query=estatuto+trabajadores+audio+cgt',
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const [activeVideo, setActiveVideo] = useState(videos[0]);
  const [filterQuery, setFilterQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchYoutube = () => {
    if (!searchQuery.trim()) return;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  const filteredCatalog = videos.filter(v => 
    v.titulo.toLowerCase().includes(filterQuery.toLowerCase()) || 
    v.desc.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 text-white font-sans">
      
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-white">
          <Play className="w-6 h-6 text-red-500 fill-red-500" /> Videoteca y Buscador
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Busca en nuestro catálogo curado o utiliza el buscador integrado para explorar en Youtube de forma segura.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a 
          href="https://www.youtube.com/results?search_query=cgt+valencia" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#8b0000] hover:bg-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-md border border-red-900 transition text-sm"
        >
          <Globe className="w-4 h-4" /> CGT Valencia
        </a>
        <a 
          href="https://www.youtube.com/results?search_query=cgt+espa%C3%B1a" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-black hover:bg-slate-950 text-white font-bold py-3 px-4 rounded-xl shadow-md border border-slate-800 transition text-sm"
        >
          <YoutubeIcon className="w-4 h-4 text-red-500" /> CGT España
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative group">
            <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center">
              <img 
                src={activeVideo.thumbnail} 
                alt={activeVideo.titulo} 
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10 space-y-3">
                <YoutubeIcon className="w-16 h-16 text-red-600 drop-shadow-2xl" />
                <h3 className="text-lg md:text-xl font-black text-white px-2 max-w-md drop-shadow">
                  {activeVideo.titulo}
                </h3>
                <a 
                  href={activeVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#E3000F] hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm transition transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" /> Reproducir Vídeo Seguro
                </a>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">
                  ABRE EN LA APP OFICIAL DE YOUTUBE
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-4 border-t border-slate-800">
              <h4 className="font-bold text-sm text-white">{activeVideo.titulo}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <YoutubeIcon className="w-3.5 h-3.5 text-red-500" /> FUENTE: {activeVideo.fuente}
              </p>
            </div>
          </div>

          <div className="flex gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-500 absolute left-3" />
              <input 
                type="text" 
                placeholder="Busca cualquier otro tema general..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchYoutube()}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
              />
            </div>
            <button 
              onClick={handleSearchYoutube}
              className="bg-[#E3000F] hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <Search className="w-3.5 h-3.5" /> Buscar
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span className="text-slate-300">📺</span>
            <h3 className="font-black text-xs text-slate-200 uppercase tracking-wider">CATÁLOGO INTERNO</h3>
          </div>

          <input 
            type="text" 
            placeholder="Filtrar catálogo curado..." 
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 mb-3"
          />

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar flex-1">
            {filteredCatalog.map(item => {
              const isActive = activeVideo.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveVideo(item)}
                  className={`w-full text-left p-3 rounded-xl transition border ${
                    isActive 
                      ? 'bg-[#7a0a0a] border-red-600 text-white shadow-lg' 
                      : 'bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-xs">{item.titulo}</p>
                  <p className={`text-[10px] mt-1 ${isActive ? 'text-red-200' : 'text-slate-400'}`}>{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
});

const MonitorActividad = memo(({ estadisticas }) => {
  const secciones = Object.entries(estadisticas.secciones || {}).sort((a, b) => b[1] - a[1]);
  const maxClicks = Math.max(...Object.values(estadisticas.secciones || { base: 1 }), 1);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <h2 className="text-xl font-bold border-b border-gray-100 pb-3 text-gray-800 flex items-center"><PieChart className="mr-3 text-red-600 w-6 h-6" /> Monitor de Mi Actividad Personal</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-200 text-center shadow-sm">
           <p className="text-xs font-bold text-red-800 uppercase tracking-widest mb-1">Interacciones Totales</p>
           <p className="text-5xl font-black text-red-700 font-mono">{estadisticas.totalClicks}</p>
           <p className="text-[10px] text-red-500 font-bold mt-2">Consultas realizadas en tu dispositivo</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-200 text-center shadow-sm flex flex-col justify-center">
           <p className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-1">Sección Más Utilizada</p>
           <p className="text-xl font-black text-purple-900 capitalize">{secciones[0] ? secciones[0][0].replace('_', ' ') : 'Ninguna'}</p>
           <p className="text-[10px] text-purple-500 font-bold mt-2">Tus preferencias registradas</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 text-sm">Ranking de Uso por Herramienta:</h3>
        {secciones.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Todavía no hay actividad registrada.</p>
        ) : (
          <div className="space-y-2">
             {secciones.map(([sec, count]) => (
               <div key={sec} className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                 <div className="flex justify-between text-xs font-bold text-gray-700">
                   <span className="capitalize">{sec.replace('_', ' ')}</span>
                   <span className="font-mono text-purple-700">{count} accesos</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                   <div className="bg-gradient-to-r from-red-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(count / maxClicks) * 100}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
});

const ModalNotificaciones = memo(function ModalNotificaciones({ onClose, isDia28, setActiveTab }) {
  const [tab, setTab] = useState('nominas');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn no-print">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-black text-gray-800 text-base uppercase flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600" /> Centro de Notificaciones CGT
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold gap-1">
          <button onClick={() => setTab('nominas')} className={`flex-1 py-2 rounded-lg transition ${tab === 'nominas' ? 'bg-red-600 text-white shadow' : 'text-gray-600'}`}>
            Nóminas
          </button>
          <button onClick={() => setTab('pildoras')} className={`flex-1 py-2 rounded-lg transition ${tab === 'pildoras' ? 'bg-red-600 text-white shadow' : 'text-gray-600'}`}>
            Píldoras Legales
          </button>
          <button onClick={() => setTab('avisos')} className={`flex-1 py-2 rounded-lg transition ${tab === 'avisos' ? 'bg-red-600 text-white shadow' : 'text-gray-600'}`}>
            Asambleas CGT
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {tab === 'nominas' && (
            <div className="space-y-3">
              {isDia28 ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl">
                  <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">Alerta Activa</span>
                  <h4 className="font-bold text-red-900 mt-2 text-sm">Publicación de Recibos Mensuales 2026</h4>
                  <p className="text-xs text-red-800 mt-1">Hoy es día {new Date().getDate()}. Las nóminas ya deberían estar subidas en la plataforma Iris FCC. Accede al Portal del Empleado para auditarla con nuestra IA basada en las tablas de 2026.</p>
                  <button onClick={() => { onClose(); setActiveTab('portal'); }} className="mt-3 bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow">
                    Ir a Iris FCC
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-xs text-gray-600">
                  <p className="font-bold text-gray-800">Próxima Alerta de Nóminas</p>
                  <p className="mt-1">El día 28 de este mes se activará el aviso para comprobar la subida de los recibos de salarios.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'pildoras' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">Píldora Legal #1</span>
                <h4 className="font-bold text-blue-900 mt-2 text-sm">Derecho a Asuntos Propios</h4>
                <p className="text-xs text-blue-800 mt-1">¿Sabías que tienes derecho a 3 días retribuidos al año de asuntos propios sin justificar por convenio colectivo FCC?</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
                <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase">Píldora Legal #2</span>
                <h4 className="font-bold text-purple-900 mt-2 text-sm">Horas Extras y Descansos</h4>
                <p className="text-xs text-purple-800 mt-1">El descanso entre jornadas laborables debe ser como mínimo de 12 horas consecutivas por Ley.</p>
              </div>
            </div>
          )}

          {tab === 'avisos' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <span className="text-[10px] font-black bg-amber-600 text-white px-2 py-0.5 rounded-full uppercase">Asamblea Informativa</span>
                <h4 className="font-bold text-amber-900 mt-2 text-sm">Negociación de Acuerdos 2026</h4>
                <p className="text-xs text-amber-800 mt-1">Sigue atento a las convocatorias de la sección sindical de CGT para participar en las decisiones colectivas.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const AfiliateCGT = memo(function AfiliateCGT() {
  const [enviado, setEnviado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  
  const [datosForm, setDatosForm] = useState({
    nombre: '', apellido1: '', apellido2: '',
    direccion: '', numero: '', piso: '', cp: '', poblacion: '', provincia: '',
    dni: '', fechaNac: '', email: '', telFijo: '', telMovil: '',
    empresa: 'FCC Medio Ambiente', situacionLaboral: '', jornadaLaboral: '', centroTrabajo: 'Valencia Zona Norte',
    iban: '', observaciones: '', privacidad: false, comunicaciones: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const textoResumen = `SOLICITUD DE AFILIACIÓN Y DOMICILIACIÓN DE CUOTAS - CGT
--------------------------------------------------
[1] DATOS PERSONALES:
Nombre completo: ${datosForm.nombre} ${datosForm.apellido1} ${datosForm.apellido2}
DNI/NIE: ${datosForm.dni} | Fecha de Nacimiento: ${datosForm.fechaNac}
Dirección: ${datosForm.direccion}, Nº: ${datosForm.numero}, Piso/Pta: ${datosForm.piso}
Código Postal: ${datosForm.cp} - ${datosForm.poblacion} (${datosForm.provincia})

[2] CONTACTO:
Teléfono Móvil: ${datosForm.telMovil} | Teléfono Fijo: ${datosForm.telFijo}
E-mail: ${datosForm.email}

[3] DATOS LABORALES:
Empresa: ${datosForm.empresa}
Centro de Trabajo: ${datosForm.centroTrabajo}
Situación Laboral: ${datosForm.situacionLaboral}
Jornada Laboral: ${datosForm.jornadaLaboral}

[4] DATOS BANCARIOS (IBAN):
IBAN: ${datosForm.iban}

[5] CONSENTIMIENTOS LEGALES:
Acepto la Política de Privacidad de CGT: ${datosForm.privacidad ? 'SÍ' : 'NO'}
Acepto recibir comunicaciones de CGT: ${datosForm.comunicaciones ? 'SÍ' : 'NO'}

[6] OBSERVACIONES O DUDAS:
${datosForm.observaciones || 'Ninguna observación adicional.'}
--------------------------------------------------
Destinatario: cgtfccjuancarlos@hotmail.com`;

  const mailtoUrl = `mailto:cgtfccjuancarlos@hotmail.com?subject=${encodeURIComponent(`Solicitud de Afiliación CGT - ${datosForm.nombre} ${datosForm.apellido1}`)}&body=${encodeURIComponent(textoResumen)}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    try {
      window.location.href = mailtoUrl;
    } catch (err) {
      console.log("Error mailto:", err);
    }
  };

  const handleCopiarDatos = () => {
    navigator.clipboard.writeText(textoResumen);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="animate-fadeIn space-y-6 w-full print-area">
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0">
            <Heart className="w-6 h-6 md:w-8 md:h-8 fill-red-600" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">Afíliate a la CGT en FCC</h2>
            <p className="text-xs md:text-sm text-gray-500 font-bold">Unión, Defensa Colectiva y Asesoría Jurídica Sin Intermediarios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800">
              <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-red-400">¿Por qué afiliarte a CGT?</h3>
              <ul className="space-y-4 text-xs">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong className="text-white block">Independencia Total:</strong> No dependemos de subvenciones ni de la empresa. Nos financiamos con nuestras cuotas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong className="text-white block">Asesoría Jurídica Gratuita:</strong> Abogados laboralistas especializados a tu disposición.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong className="text-white block">Democracia Directa:</strong> Las decisiones se toman en asamblea. Tu voz cuenta.</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl text-xs text-red-900 font-semibold shadow-sm">
              <p className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-red-600" /> Sede CGT Valencia: <strong className="underline">Av. del Cid, 154</strong></p>
              <p className="flex items-center gap-2 mb-3"><Phone className="w-4 h-4 text-red-600" /> Teléfono: <strong>96 383 44 40</strong></p>
              <div className="pt-3 border-t border-red-200/60 mt-3 space-y-2">
                <p className="flex items-center gap-2 uppercase tracking-wide font-black text-red-800"><HelpCircle className="w-4 h-4 text-red-600" /> ¿Tienes alguna duda?</p>
                <p className="text-[11px] leading-relaxed text-red-800">
                  Si necesitas ayuda con la afiliación o tienes alguna consulta sindical, escríbenos directamente a:
                </p>
                <a href="mailto:cgtfccjuancarlos@hotmail.com" className="inline-flex items-center gap-1.5 font-bold underline text-red-700 hover:text-red-900 break-all bg-white px-2 py-1 rounded border border-red-200">
                  <Mail className="w-3.5 h-3.5" /> cgtfccjuancarlos@hotmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-200 shadow-inner">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
                <FileText className="w-5 h-5 text-gray-700" />
                <h3 className="font-black text-gray-800 text-base uppercase">Ficha Digital de Afiliación</h3>
              </div>

              {enviado ? (
                <div className="bg-green-50 border border-green-300 p-6 rounded-2xl text-green-900 space-y-5 shadow-sm animate-fadeIn">
                  <div className="flex items-center gap-3 border-b border-green-200 pb-4">
                    <div className="bg-green-600 p-2 rounded-full"><Check className="w-6 h-6 text-white" /></div>
                    <div>
                      <p className="font-black text-lg">¡Formulario Completado!</p>
                      <p className="text-xs text-green-800 mt-0.5">Elige cómo quieres enviar tus datos a <strong className="break-all font-mono bg-white px-1 rounded border border-green-200">cgtfccjuancarlos@hotmail.com</strong></p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a href={mailtoUrl} className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs md:text-sm uppercase tracking-wide rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95">
                      <Mail className="w-5 h-5" /> 1. Enviar desde mi App de Correo
                    </a>
                    
                    <button type="button" onClick={handleCopiarDatos} className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs md:text-sm uppercase tracking-wide rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95">
                      <FileText className="w-5 h-5" /> {copiado ? '¡Datos Copiados al Portapapeles!' : '2. Copiar Datos (Opción Alternativa)'}
                    </button>
                    <p className="text-[10px] text-center text-green-800 font-semibold px-2">Si el botón rojo no te abre el correo, usa el botón negro para copiar todos los datos y pégalos en tu WhatsApp o en tu correo web de Gmail/Outlook.</p>
                  </div>

                  <div className="mt-4">
                    <button type="button" onClick={() => setEnviado(false)} className="text-xs text-green-700 hover:text-green-900 underline font-bold w-full text-center block pt-2">
                      Volver a modificar los datos
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b pb-1">1. Datos Personales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Nombre</label><input type="text" required name="nombre" value={datosForm.nombre} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Primer Apellido</label><input type="text" required name="apellido1" value={datosForm.apellido1} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Segundo Apellido</label><input type="text" name="apellido2" value={datosForm.apellido2} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="col-span-2"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">DNI / NIE</label><input type="text" required name="dni" value={datosForm.dni} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div className="col-span-2"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Fecha Nacimiento</label><input type="date" required name="fechaNac" value={datosForm.fechaNac} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b pb-1">2. Contacto y Dirección</h4>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 md:col-span-6"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Vía / Dirección</label><input type="text" required name="direccion" value={datosForm.direccion} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div className="col-span-4 md:col-span-2"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Nº</label><input type="text" required name="numero" value={datosForm.numero} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div className="col-span-8 md:col-span-4"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Piso / Pta</label><input type="text" name="piso" value={datosForm.piso} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div className="col-span-4 md:col-span-3"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Cód. Postal</label><input type="text" required name="cp" value={datosForm.cp} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div className="col-span-8 md:col-span-5"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Población</label><input type="text" required name="poblacion" value={datosForm.poblacion} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div className="col-span-12 md:col-span-4"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Provincia</label><input type="text" required name="provincia" value={datosForm.provincia} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">E-Mail</label><input type="email" name="email" value={datosForm.email} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Tel. Móvil</label><input type="tel" required name="telMovil" value={datosForm.telMovil} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b pb-1">3. Datos Laborales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Empresa</label><input type="text" required name="empresa" value={datosForm.empresa} onChange={handleChange} className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-bold text-gray-600" /></div>
                      <div><label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Centro de Trabajo</label><input type="text" required name="centroTrabajo" value={datosForm.centroTrabajo} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold" /></div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Situación Laboral</label>
                        <select name="situacionLaboral" value={datosForm.situacionLaboral} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold">
                          <option value="">Seleccionar...</option>
                          <option value="Fijo">Fijo / Indefinido</option>
                          <option value="Fijo Discontinuo">Fijo Discontinuo</option>
                          <option value="Eventual">Eventual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Jornada Laboral</label>
                        <select name="jornadaLaboral" value={datosForm.jornadaLaboral} onChange={handleChange} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold">
                          <option value="">Seleccionar...</option>
                          <option value="Completa">Jornada Completa</option>
                          <option value="Parcial">Jornada Parcial</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b pb-1">4. Orden de Domiciliación Bancaria</h4>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Cuenta IBAN (24 dígitos)</label>
                      <input type="text" required name="iban" value={datosForm.iban} onChange={handleChange} placeholder="ESXX XXXX XXXX XXXX XXXX XXXX" className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-sm font-mono font-bold tracking-widest uppercase placeholder-red-200 focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-100 p-4 rounded-xl border border-gray-200">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-300 pb-1">5. Consentimientos y Observaciones</h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" required name="privacidad" checked={datosForm.privacidad} onChange={handleChange} className="w-5 h-5 mt-0.5 text-red-600 rounded border-gray-300" />
                        <span className="text-[10px] text-gray-600 leading-tight">
                          <strong className="text-gray-800">Acepto la Política de Privacidad:</strong> Autorizo a la Confederación General del Trabajo (CGT) al tratamiento de estos datos para tramitar la afiliación, el cobro de la cuota sindical y mantener la relación asociativa, conforme a la normativa vigente de Protección de Datos.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" name="comunicaciones" checked={datosForm.comunicaciones} onChange={handleChange} className="w-5 h-5 mt-0.5 text-red-600 rounded border-gray-300" />
                        <span className="text-[10px] text-gray-600 leading-tight">
                          <strong className="text-gray-800">Comunicaciones:</strong> Acepto estar al día de las novedades de CGT y recibir comunicaciones y noticias relacionadas con la entidad.
                        </span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-700 mb-1">Observaciones o Dudas (Opcional)</label>
                      <textarea rows="2" name="observaciones" value={datosForm.observaciones} onChange={handleChange} placeholder="Si tienes alguna duda escríbenos aquí..." className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium resize-none" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" /> Generar Solicitud de Afiliación
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const AsistenteVozFlotante = memo(function AsistenteVozFlotante({ apiKey, categoriasDisponibles, onExecuteAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.getVoices();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          setResponseText('No se ha detectado sonido de voz. Pulsa el micrófono e inténtalo de nuevo.');
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setResponseText('Permiso de micrófono no concedido en tu navegador. Puedes escribir o dictar con el teclado abajo.');
          return;
        }
        if (event.error === 'aborted') return;
        console.warn("Aviso de reconocimiento de voz:", event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const hablarTexto = (texto) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    
    // Búsqueda de voz masculina en español de España
    const voices = window.speechSynthesis.getVoices();
    let maleVoice = voices.find(v => 
      v.lang.startsWith('es') && 
      (v.name.includes('Pablo') || v.name.includes('Jorge') || v.name.includes('Diego') || v.name.includes('Enrique') || /male/i.test(v.name) || /hombre/i.test(v.name))
    );
    if (!maleVoice) maleVoice = voices.find(v => v.lang === 'es-ES' && !v.name.includes('Monica') && !v.name.includes('Helena') && !v.name.includes('Laura') && !v.name.includes('Marisol'));
    if (!maleVoice) maleVoice = voices.find(v => v.lang.startsWith('es'));
    if (maleVoice) utterance.voice = maleVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const detenerVoz = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleEscucha = async () => {
    detenerVoz();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponseText('');

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.warn("Permiso de micrófono no concedido directamente:", e);
        }
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.error("No se pudo iniciar el micro:", err);
          setIsListening(false);
        }
      } else {
        setResponseText("Tu navegador no soporta voz directa. Puedes escribir o usar la dictación por voz de tu teclado abajo.");
      }
    }
  };

  const procesarPeticion = async (textoAProcesar) => {
    const txt = textoAProcesar || transcript;
    if (!txt.trim()) return;

    setIsProcessing(true);
    detenerVoz();

    if (!apiKey) {
      const msgNoKey = "Hola compañero. Para usar las funciones avanzadas por voz, configura tu clave API en la sección 'Consultas Convenio IA'. ¡Es totalmente gratis!";
      setResponseText(msgNoKey);
      hablarTexto(msgNoKey);
      setIsProcessing(false);
      return;
    }

    const resJSON = await parseVoiceCommandWithGemini(txt, apiKey, categoriasDisponibles);

    if (resJSON) {
      onExecuteAction(resJSON, txt);
      if (resJSON.spokenResponse) {
        setResponseText(resJSON.spokenResponse);
        hablarTexto(resJSON.spokenResponse);
      }
    } else {
      const msgError = "No he podido entender la orden. Intenta decir por ejemplo: 'Soy peón de limpieza día y he hecho 5 días de peón recogida noche'.";
      setResponseText(msgError);
      hablarTexto(msgError);
    }

    setIsProcessing(false);
  };

  return (
    <div className="fixed bottom-[132px] md:bottom-8 right-4 md:right-8 z-[110] no-print">
      
      {isOpen && (
        <div className="mb-3 w-80 md:w-96 bg-slate-900 border border-slate-700 text-white rounded-2xl p-5 shadow-2xl animate-fadeIn no-invert">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600 rounded-xl text-white">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-none">Control por Voz e IA (2026)</h4>
                <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Gemini Multimodal Directo</p>
              </div>
            </div>
            <button onClick={() => { setIsOpen(false); detenerVoz(); }} className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg">Cerrar</button>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 min-h-[80px] flex flex-col justify-between">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tu consulta o dictado por voz:</p>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={isListening ? "Escuchando tu voz..." : "Habla por el micro o escribe/dicta tu consulta..."}
                className="w-full bg-transparent text-xs text-slate-200 font-medium outline-none resize-none border-none p-0 focus:ring-0"
                rows={2}
              />
              {isListening && (
                <div className="flex gap-1 items-center mt-2 justify-center">
                  <span className="w-1.5 h-3 bg-red-500 animate-bounce rounded-full"></span>
                  <span className="w-1.5 h-5 bg-red-500 animate-bounce rounded-full [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-3 bg-red-500 animate-bounce rounded-full [animation-delay:0.4s]"></span>
                </div>
              )}
            </div>

            {responseText && (
              <div className="bg-purple-950/80 border border-purple-800/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-purple-400"/> Respuesta Asistente
                  </span>
                  {isSpeaking && (
                    <button onClick={detenerVoz} className="text-purple-300 hover:text-white">
                      <VolumeX className="w-3.5 h-3.5"/>
                    </button>
                  )}
                </div>
                <p className="text-xs text-purple-100 font-serif leading-relaxed">
                  {responseText}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={toggleEscucha} 
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
              >
                {isListening ? <><MicOff className="w-4 h-4"/> Parar</> : <><Mic className="w-4 h-4"/> Hablar Ahora</>}
              </button>
              
              <button 
                onClick={() => procesarPeticion()} 
                disabled={isProcessing || !transcript.trim()} 
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white p-3 rounded-xl font-bold text-xs flex items-center justify-center"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`p-3.5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border-2 active:scale-90 ${isOpen ? 'bg-slate-900 border-purple-500 text-purple-400 scale-105' : 'bg-gradient-to-r from-purple-600 to-indigo-600 border-white text-white hover:scale-110'}`}
      >
        <Mic className="w-5 h-5 animate-pulse" />
      </button>
    </div>
  );
});

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [activeCalcSubTab, setActiveCalcSubTab] = useState('diferencias');
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('cgt_dark_mode') === 'true');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [voiceCommandToAudit, setVoiceCommandToAudit] = useState(null);
  
  const { estadisticas, registrarVisita } = useEstadisticasLocales();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cgt_gemini_api_key') || '');

  const [voiceCalcData, setVoiceCalcData] = useState({
    categoriaBase: null,
    categoriaSuperior: null,
    dias: null,
    bivolante: null,
    porter: null
  });

  const [perfil, setPerfil] = useState(() => {
    const guardado = localStorage.getItem('cgt_perfil_usuario');
    return guardado ? JSON.parse(guardado) : {
      categoria: 'Peón limpieza día',
      categoriaSuperior: 'Peón recogida día',
      turno: 'DIA',
      fechaIngreso: '2015-01-01',
      bivolante: false,
      porter: false
    };
  });

  useEffect(() => {
    const manifestObj = {
      name: "CGT Ayuda FCC",
      short_name: "CGT Ayuda",
      start_url: ".",
      display: "standalone",
      background_color: "#0f172a",
      theme_color: "#dc2626",
      icons: [{ src: "/5.png", sizes: "192x192 512x512", type: "image/png" }]
    };
    const stringManifest = JSON.stringify(manifestObj);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    let linkTag = document.querySelector('link[rel="manifest"]');
    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.rel = 'manifest';
      document.head.appendChild(linkTag);
    }
    linkTag.href = manifestURL;

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cgt_perfil_usuario', JSON.stringify(perfil));
  }, [perfil]);

  useEffect(() => {
    document.title = "CGT Ayuda FCC";
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no');

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if ('serviceWorker' in navigator) {
      try {
        const swCode = `
          const CACHE_NAME = 'cgt-offline-v1';
          self.addEventListener('install', e => {
            e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['/'])));
          });
          self.addEventListener('fetch', e => {
            e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
          });
        `;
        const blob = new Blob([swCode], { type: 'application/javascript' });
        navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(() => {});
      } catch (e) {}
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  useEffect(() => {
    registrarVisita(activeTab === 'calculadoras' ? `calculadoras_${activeCalcSubTab}` : activeTab);
  }, [activeTab, activeCalcSubTab, registrarVisita]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('cgt_dark_mode', newMode);
  };

  const isDia28OrLater = new Date().getDate() >= 28;

  return (
    <div className={`flex h-[100dvh] font-sans overflow-hidden w-full relative print:bg-white print:h-auto print:overflow-visible ${darkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-gray-50 text-gray-800'}`}>
      
      {darkMode && (
        <style>{`
          .bg-white { background-color: #1e293b !important; border-color: #334155 !important; color: #f8fafc !important; }
          .bg-gray-50, [class*="bg-[#fdfdfd]"] { background-color: #0f172a !important; border-color: #1e293b !important; color: #e2e8f0 !important; }
          .bg-gray-100 { background-color: #334155 !important; border-color: #475569 !important; color: #f8fafc !important; }
          .bg-gray-200 { background-color: #475569 !important; color: #f8fafc !important; }
          
          .text-gray-800, .text-gray-900, .text-gray-700 { color: #f8fafc !important; }
          .text-gray-600, .text-gray-500 { color: #cbd5e1 !important; }
          .text-gray-400 { color: #94a3b8 !important; }
          
          .border-gray-100, .border-gray-200, .border-gray-300 { border-color: #334155 !important; }
          
          input, select, textarea { background-color: #0f172a !important; color: #f8fafc !important; border-color: #334155 !important; }
          
          .bg-red-50 { background-color: #450a0a !important; border-color: #7f1d1d !important; color: #fca5a5 !important; }
          .text-red-700, .text-red-800, .text-red-900 { color: #f87171 !important; }
          .text-red-600 { color: #ef4444 !important; }
          
          .bg-blue-50 { background-color: #172554 !important; border-color: #1e3a8a !important; color: #bfdbfe !important; }
          .text-blue-900, .text-blue-800 { color: #93c5fd !important; }
          .text-blue-600, .text-blue-700 { color: #60a5fa !important; }
          
          .bg-green-50 { background-color: #052e16 !important; border-color: #14532d !important; color: #bbf7d0 !important; }
          .text-green-800, .text-green-900 { color: #86efac !important; }
          .text-green-600, .text-green-700 { color: #4ade80 !important; }
          
          .bg-purple-50 { background-color: #2e1065 !important; border-color: #4c1d95 !important; color: #e9d5ff !important; }
          .text-purple-900, .text-purple-800 { color: #d8b4fe !important; }
          .text-purple-600, .text-purple-700 { color: #c084fc !important; }
          
          .bg-amber-50, .bg-orange-50, .bg-yellow-50 { background-color: #451a03 !important; border-color: #78350f !important; color: #fcd34d !important; }
          .text-amber-800, .text-amber-900 { color: #fcd34d !important; }
          
          .custom-scrollbar::-webkit-scrollbar-track, body::-webkit-scrollbar-track { background: #0f172a !important; }
          .custom-scrollbar::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: #334155 !important; }
          .no-invert { background-color: inherit; color: inherit; }
        `}</style>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none; box-shadow: none; background: white; color: black; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* MENÚ LATERAL ESCRITORIO */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 z-20 shadow-lg flex-none shrink-0 no-print">
        <div className="p-5 bg-white border-b border-gray-200 flex flex-col items-center text-center shrink-0">
          <div className="text-red-700 bg-red-50 p-4 rounded-full mb-3 border border-red-100">
             <Shield size={40} />
          </div>
          <h1 className="text-xl font-black tracking-tight leading-tight text-red-700">CGT AYUDA</h1>
          <p className="text-gray-500 text-xs font-bold mt-1">FCC Zona Norte</p>
        </div>
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <span className="text-[11px] font-bold text-gray-600 flex items-center w-fit shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-500 mr-1.5 animate-pulse" /> IA Multimodal &amp; Voz
          </span>
          <div className="flex items-center gap-2">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick} 
                className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-sm text-[11px] font-black transition-all active:scale-95 shrink-0 animate-pulse"
                title="Instalar App"
              >
                <Download className="w-3.5 h-3.5" /> INSTALAR
              </button>
            )}
            <button 
              onClick={toggleDarkMode} 
              className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-[11px] font-black text-gray-700 hover:bg-gray-100 transition-all active:scale-95 shrink-0"
            >
              {darkMode ? <><Sun className="w-3.5 h-3.5 text-amber-500" /> MODO DÍA</> : <><Moon className="w-3.5 h-3.5 text-indigo-600" /> MODO OSCURO</>}
            </button>
            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${apiKey ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`}></span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto pb-4 custom-scrollbar">
          <button onClick={() => setActiveTab('inicio')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'inicio' ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-md border border-gray-800 scale-[1.02]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold border border-gray-200'}`}>
            <div className={`mr-3 ${activeTab === 'inicio' ? 'text-red-500' : 'text-gray-500'}`}><Home className="w-5 h-5" /></div>
            <span>Inicio y Portada</span>
          </button>
          
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">Área Personal</p>
            <SidebarButton active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} icon={<User />} text="Mi Perfil" />
            <SidebarButton active={activeTab === 'cuadrante'} onClick={() => setActiveTab('cuadrante')} icon={<LayoutGrid />} text="Mi Cuadrante" />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">Calculadoras</p>
            <SidebarButton active={activeTab === 'calculadoras' && activeCalcSubTab === 'diferencias'} onClick={() => { setActiveTab('calculadoras'); setActiveCalcSubTab('diferencias'); }} icon={<Calculator />} text="Diferencias Salariales" />
            <SidebarButton active={activeTab === 'calculadoras' && activeCalcSubTab === 'horas_extras'} onClick={() => { setActiveTab('calculadoras'); setActiveCalcSubTab('horas_extras'); }} icon={<Timer />} text="Horas Extras" />
            <SidebarButton active={activeTab === 'pagas'} onClick={() => setActiveTab('pagas')} icon={<Euro />} text="Pagas y Pluses" />
            <SidebarButton active={activeTab === 'irpf'} onClick={() => setActiveTab('irpf')} icon={<Landmark />} text="Retenciones IRPF, ETC" />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">Herramientas IA</p>
            <SidebarButton active={activeTab === 'auditoria'} onClick={() => setActiveTab('auditoria')} icon={<FileSearch className="text-purple-600" />} text="Auditar Mi Nómina" esEspecial={true} />
            <SidebarButton active={activeTab === 'traductor'} onClick={() => setActiveTab('traductor')} icon={<BookType className="text-purple-600" />} text="Traductor Legal" esEspecial={true} />
            <SidebarButton active={activeTab === 'redactor'} onClick={() => setActiveTab('redactor')} icon={<PenTool className="text-purple-600" />} text="Redactor Peticiones" esEspecial={true} />
            <SidebarButton active={activeTab === 'asistente'} onClick={() => setActiveTab('asistente')} icon={<Bot className="text-purple-600" />} text="Consultas Convenio IA" esEspecial={true} />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">Información y Sindical</p>
            <SidebarButton active={activeTab === 'portal'} onClick={() => setActiveTab('portal')} icon={<ExternalLink />} text="Portal del Empleado" />
            <SidebarButton active={activeTab === 'afiliacion'} onClick={() => setActiveTab('afiliacion')} icon={<Heart className="text-red-600" />} text="Afíliate a CGT" />
            <SidebarButton active={activeTab === 'permisos'} onClick={() => setActiveTab('permisos')} icon={<Briefcase />} text="Permisos y Licencias" />
            <SidebarButton active={activeTab === 'antiguedad'} onClick={() => setActiveTab('antiguedad')} icon={<Calendar />} text="Antigüedad y Ayudas" />
            <SidebarButton active={activeTab === 'buscador'} onClick={() => setActiveTab('buscador')} icon={<BookOpen />} text="Convenios Colectivos" />
            <SidebarButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} icon={<Play />} text="Videoteca Sindical" />
            <SidebarButton active={activeTab === 'estadisticas'} onClick={() => setActiveTab('estadisticas')} icon={<PieChart />} text="Mi Actividad" />
          </div>
        </nav>
        
        <div className="p-4 bg-orange-50 border-t border-orange-100 flex flex-col gap-2 shadow-inner shrink-0 no-print">
          <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-orange-600 animate-pulse" /> Radio Clara Directo
          </span>
          <audio controls className="w-full h-8" preload="none" src="https://cervera.eldialdigital.com:21111/stream">Audio no soportado.</audio>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-gray-50 w-full print:bg-white print:overflow-visible">
        
        <div className="hidden md:flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200 z-10 shrink-0 shadow-sm no-print">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-800">{perfil.categoria}</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Turno {perfil.turno}</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNotificationModal(true)} 
              className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              title="Centro de Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {isDia28OrLater && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-600 rounded-full animate-ping"></span>
              )}
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {isDia28OrLater ? '3' : '2'}
              </span>
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto w-full relative print:overflow-visible custom-scrollbar">
          
          {/* HEADER MÓVIL */}
          <div className={`md:hidden pt-3 pb-3 px-4 flex items-center justify-between w-full mx-auto sticky top-0 z-30 border-b border-gray-200/80 shadow-sm no-print ${darkMode ? 'bg-[#0f172a]/95 text-white border-slate-800' : 'bg-gray-50/95 text-gray-900'}`}>
            <div className={`flex items-center px-3 py-1.5 rounded-full shadow-sm border gap-2 cursor-pointer ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`} onClick={() => setActiveTab('inicio')}>
              <Shield className="w-4 h-4 text-red-600" />
              <h1 className="text-[11px] font-black text-red-600 tracking-tight leading-none mt-0.5">CGT AYUDA</h1>
            </div>

            <div className="flex items-center gap-2">
              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick} 
                  className="bg-green-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1 animate-pulse"
                >
                  <Download className="w-3.5 h-3.5" /> Instalar
                </button>
              )}

              <button 
                onClick={() => setShowNotificationModal(true)} 
                className="relative p-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1 rounded-full">
                  {isDia28OrLater ? '3' : '2'}
                </span>
              </button>

              <button onClick={toggleDarkMode} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-sm border text-[10px] font-black tracking-wide ${darkMode ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-white border-gray-200 text-indigo-700'}`}>
                 {darkMode ? <><Sun className="w-3.5 h-3.5 text-amber-400" /> MODO DÍA</> : <><Moon className="w-3.5 h-3.5 text-indigo-600" /> MODO OSCURO</>}
              </button>
            </div>
          </div>

          {/* BANNER DÍA 28 NÓMINA */}
          {isDia28OrLater && (
            <div className="bg-gradient-to-r from-red-700 via-red-800 to-amber-700 text-white py-2.5 px-4 shadow-md flex items-center justify-between no-print border-b border-red-900">
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
                <Bell className="w-4 h-4 animate-bounce text-amber-300 shrink-0" />
                <span>¡Aviso de Nóminas! Ya es día {new Date().getDate()}. Comprueba tus recibos del mes subidos a Iris FCC.</span>
              </div>
              <button onClick={() => setActiveTab('portal')} className="bg-white text-red-800 font-extrabold text-[10px] uppercase px-3 py-1 rounded-lg shadow hover:bg-red-50 shrink-0 ml-2">
                Ir a Iris FCC
              </button>
            </div>
          )}

          {/* CONTENIDO INTERACTIVO DE LAS PESTAÑAS */}
          <div className="px-4 md:px-8 max-w-md md:max-w-5xl mx-auto pb-48 md:pb-12 pt-4 md:pt-8 w-full print:p-0 print:max-w-none">
            {activeTab === 'inicio' && <PantallaInicio setActiveTab={setActiveTab} apiKey={apiKey} />}
            {activeTab === 'perfil' && <MiPerfil perfil={perfil} setPerfil={setPerfil} categorias={Object.keys(tablaSalarial2026)} />}
            {activeTab === 'cuadrante' && <MiCuadrante perfil={perfil} />}
            
            {activeTab === 'calculadoras' && (
              <div className="space-y-6 w-full">
                <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-full md:max-w-md mx-auto md:mx-0 no-print">
                  <button onClick={() => setActiveCalcSubTab('diferencias')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeCalcSubTab === 'diferencias' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-950'}`}><Calculator className="w-4 h-4" /> Diferencias</button>
                  <button onClick={() => setActiveCalcSubTab('horas_extras')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeCalcSubTab === 'horas_extras' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-950'}`}><Timer className="w-4 h-4" /> Horas Extras</button>
                </div>
                {activeCalcSubTab === 'diferencias' ? <CalculadoraDiferencias perfil={perfil} voiceCalcData={voiceCalcData} apiKey={apiKey} onConfigureIA={() => setActiveTab('asistente')} /> : <CalculadoraHorasExtras perfil={perfil} apiKey={apiKey} onConfigureIA={() => setActiveTab('asistente')} />}
              </div>
            )}

            {activeTab === 'pagas' && <PagasExtrasPluses perfil={perfil} />}
            {activeTab === 'irpf' && <RetencionesIRPF apiKey={apiKey} onConfigureIA={() => setActiveTab('asistente')} />}
            {activeTab === 'auditoria' && <CalculadoraAuditoria apiKey={apiKey} onConfigureIA={() => setActiveTab('asistente')} voiceCommandToAudit={voiceCommandToAudit} />}
            {activeTab === 'traductor' && <TraductorLegal apiKey={apiKey} onConfigureIA={() => setActiveTab('asistente')} />}
            {activeTab === 'redactor' && <RedactorPeticiones apiKey={apiKey} onConfigureIA={() => setActiveTab('asistente')} />}
            {activeTab === 'portal' && <PortalEmpleado />}
            {activeTab === 'afiliacion' && <AfiliateCGT />}
            {activeTab === 'buscador' && <BuscadorConvenios />}
            {activeTab === 'antiguedad' && <CalculoAntiguedad perfil={perfil} />}
            {activeTab === 'permisos' && <TablaPermisos />}
            {activeTab === 'videos' && <VideotecaSindical />}
            {activeTab === 'estadisticas' && <MonitorActividad estadisticas={estadisticas} />}
            {activeTab === 'asistente' && <AsistenteIA apiKey={apiKey} onSaveKey={(k) => { setApiKey(k); localStorage.setItem('cgt_gemini_api_key', k); }} onClearKey={() => { setApiKey(''); localStorage.removeItem('cgt_gemini_api_key'); }} />}
          </div>

        </main>

        {/* RADIO CLARA MÓVIL */}
        <div className="md:hidden fixed bottom-[64px] left-0 w-full bg-orange-50 border-t border-orange-200 py-1.5 px-3 z-40 flex items-center justify-between shadow-md no-print">
           <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
             <Radio className="w-3.5 h-3.5 text-orange-600 animate-pulse" /> Radio Clara
           </span>
           <audio controls className="h-7 w-44 shadow-sm rounded" preload="none" src="https://cervera.eldialdigital.com:21111/stream">Audio no soportado.</audio>
        </div>

        {/* MENÚ NAVEGACIÓN MÓVIL INFERIOR */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-[64px] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1 no-print" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <BottomNavButton active={activeTab === 'inicio'} onClick={() => { setActiveTab('inicio'); setShowMobileMore(false); }} icon={<Home className="w-5 h-5" />} text="Inicio" />
          <BottomNavButton active={activeTab === 'perfil'} onClick={() => { setActiveTab('perfil'); setShowMobileMore(false); }} icon={<User className="w-5 h-5" />} text="Mi Perfil" />
          <BottomNavButton active={activeTab === 'cuadrante'} onClick={() => { setActiveTab('cuadrante'); setShowMobileMore(false); }} icon={<LayoutGrid className="w-5 h-5" />} text="Cuadrante" />
          <BottomNavButton active={activeTab === 'calculadoras'} onClick={() => { setActiveTab('calculadoras'); setActiveCalcSubTab('diferencias'); setShowMobileMore(false); }} icon={<Calculator className="w-5 h-5" />} text="Calculadora" />
          <BottomNavButton active={showMobileMore} onClick={() => setShowMobileMore(!showMobileMore)} icon={<Menu className="w-5 h-5" />} text="Más..." />
        </nav>

        {/* MENÚ "MÁS..." MÓVIL */}
        {showMobileMore && (
          <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end animate-fadeIn no-print" onClick={() => setShowMobileMore(false)}>
            <div className="bg-white w-full rounded-t-3xl p-6 space-y-4 shadow-2xl max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Más Opciones</h3>
                <button className="text-gray-400 font-bold hover:text-gray-600" onClick={() => setShowMobileMore(false)}>Cerrar</button>
              </div>
              <div className="grid grid-cols-1 gap-3 py-2 h-[65vh] overflow-y-auto pb-8 custom-scrollbar">
                <MobileMenuBtn onClick={() => { setActiveTab('afiliacion'); setShowMobileMore(false); }} icon={<Heart/>} title="Afíliate a CGT" desc="Formulario y ventajas sindicales" color="red" />
                <MobileMenuBtn onClick={() => { setActiveTab('auditoria'); setShowMobileMore(false); }} icon={<FileSearch/>} title="Auditar Mi Nómina" desc="Análisis con IA de 2026" color="purple" />
                <MobileMenuBtn onClick={() => { setActiveTab('permisos'); setShowMobileMore(false); }} icon={<Briefcase/>} title="Permisos y Licencias" desc="Días por ley y convenio" color="blue" />
                <MobileMenuBtn onClick={() => { setActiveTab('portal'); setShowMobileMore(false); }} icon={<ExternalLink/>} title="Portal del Empleado" desc="Nóminas e incidencias Servidek" color="red" />
                <MobileMenuBtn onClick={() => { setActiveTab('pagas'); setShowMobileMore(false); }} icon={<Euro/>} title="Pagas y Pluses" desc="Pagas extras y plus fallas" color="green" />
                <MobileMenuBtn onClick={() => { setActiveTab('irpf'); setShowMobileMore(false); }} icon={<Landmark/>} title="Retenciones IRPF, ETC" desc="Calculadora fiscal y Auditoría IA" color="blue" />
                <MobileMenuBtn onClick={() => { setActiveTab('antiguedad'); setShowMobileMore(false); }} icon={<Calendar/>} title="Antigüedad y Ayudas" desc="Calcula tus tramos y prestaciones" color="green" />
                <MobileMenuBtn onClick={() => { setActiveTab('buscador'); setShowMobileMore(false); }} icon={<BookOpen/>} title="Convenios y Buscador" desc="Boletines y descargas PDF" color="blue" />
                <MobileMenuBtn onClick={() => { setActiveTab('videos'); setShowMobileMore(false); }} icon={<Play/>} title="Videoteca Sindical" desc="Buscador de videos" color="red" />
                <MobileMenuBtn onClick={() => { setActiveTab('traductor'); setShowMobileMore(false); }} icon={<BookType/>} title="Traductor Legal IA" desc="Traduce convenios a lenguaje claro" color="purple" />
                <MobileMenuBtn onClick={() => { setActiveTab('redactor'); setShowMobileMore(false); }} icon={<PenTool/>} title="Redactor Mágico IA" desc="Crea instancias y peticiones al instante" color="purple" />
                <MobileMenuBtn onClick={() => { setActiveTab('estadisticas'); setShowMobileMore(false); }} icon={<PieChart/>} title="Mi Actividad" desc="Monitor de uso personal" color="gray" />
                <MobileMenuBtn onClick={() => { setActiveTab('asistente'); setShowMobileMore(false); }} icon={<Bot/>} title="Asistente Sindical IA" desc="Chatea con nuestro bot" color="purple" />
              </div>
            </div>
          </div>
        )}

        {/* MODAL CENTRO DE NOTIFICACIONES */}
        {showNotificationModal && <ModalNotificaciones onClose={() => setShowNotificationModal(false)} isDia28={isDia28OrLater} setActiveTab={setActiveTab} />}

        {/* ASISTENTE DE VOZ FLOTANTE */}
        <AsistenteVozFlotante 
          apiKey={apiKey}
          categoriasDisponibles={Object.keys(tablaSalarial2026)}
          onExecuteAction={(actions, transcript) => {
            if (actions.targetTab) setActiveTab(actions.targetTab);
            if (actions.targetCalcSubTab) setActiveCalcSubTab(actions.targetCalcSubTab);
            
            if (actions.iniciarAuditoria) {
              setActiveTab('auditoria');
              setVoiceCommandToAudit({ text: transcript, ts: Date.now() });
            }

            if (actions.categoriaBase || actions.categoriaSuperior || actions.diasSueltos !== null || actions.bivolante !== null || actions.porter !== null) {
              setVoiceCalcData({
                categoriaBase: actions.categoriaBase,
                categoriaSuperior: actions.categoriaSuperior,
                dias: actions.diasSueltos,
                bivolante: actions.bivolante,
                porter: actions.porter
              });
            }
          }}
        />

      </div>
    </div>
  );
}