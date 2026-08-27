
export const PROJECTS = [
    {
        id: 1,
        title: 'ASC: Agent Service Client',
        category: 'SaaS Platform / AI',
        role: 'Founder & Lead AI Engineer',
        description: 'Plataforma SaaS multitenant para el despliegue masivo de agentes de IA multicanal (WhatsApp, Instagram y Messenger) sobre el ecosistema de Meta.',
        details: [
            'Orquestación Agentica: Flujos cíclicos con LangGraph para autonomía y memoria persistente.',
            'Multicanal Meta: Integración con Meta Cloud API para conversaciones en WhatsApp, Instagram y Messenger.',
            'Optimización RAG: Motor de búsqueda semántica con Qdrant para contexto empresarial real.'
        ],
        image: '/ASC.png',
        tags: ['LangGraph', 'Qdrant', 'Multicanal', 'Meta Cloud API'],
        link: 'https://autosalescloser.com',
        github: '#'
    },
    {
        id: 2,
        title: 'Carguita: Logística en Tiempo Real',
        category: 'Logistics / Full Stack',
        role: 'Lead Full Stack Developer',
        description: 'Plataforma de monitoreo de carga con dashboards optimizados para clientes y transportistas.',
        details: [
            'Geolocalización: Algoritmos de geofencing y tracking mediante WebSockets.',
            'Gestión Integral: Control de flotas para múltiples tipos de transporte en tiempo real.'
        ],
        image: '/carguita-logo.avif',
        tags: ['WebSockets', 'Next.js', 'Logistics'],
        link: 'https://carguita.com',
        github: '#'
    },
    {
        id: 3,
        title: 'Ecosistema RAG Multimodal & MCP',
        category: 'AI Engineering',
        role: 'AI Engineer',
        description: 'Sistema capaz de procesar documentos técnicos, tablas y diagramas complejos utilizando modelos de visión.',
        details: [
            'Visión e IA: Procesamiento avanzado con GPT-4o y Claude 3.5 Sonnet.',
            'Interoperabilidad: Implementación de Model Context Protocol (MCP) para agentes locales.'
        ],
        image: '/rag-ecosystem.png',
        tags: ['GPT-4o', 'MCP', 'Multimodal'],
        link: 'https://github.com/garcia-bj/rag-ecosystem',
        github: '#'
    },
    {
        id: 4,
        title: 'De-Vega: Menús con IA',
        category: 'FoodTech / IA',
        role: 'Full Stack Developer & AI Engineer',
        description: 'Aplicación web de creación y edición de imágenes con IA para generar menús personalizados de restaurante, con autopublicación automática a redes sociales.',
        details: [
            'Generación de imágenes: Creación y edición asistida por IA para menús personalizados.',
            'Autopublicación: Publicación automática como post e historia en Instagram y Facebook.',
            'Almacenamiento: Gestión de assets con MinIO.'
        ],
        image: '/logo-devega.png',
        logo: true,
        tags: ['IA Generativa', 'MinIO', 'Instagram API', 'Facebook API'],
        link: 'https://github.com/garcia-bj/dashboard-de-vega',
        github: '#'
    },
    {
        id: 5,
        title: 'Genuino Importaciones',
        category: 'Web / Automatización',
        role: 'Full Stack Developer & Automation Engineer',
        description: 'Sitio web corporativo y formulario inteligente de embudos de ventas con filtrado automático de clientes y asignación a asesores comerciales.',
        details: [
            'Web corporativa: Sitio web para Genuino Importaciones.',
            'Formulario inteligente: Filtrado y priorización automática de leads.',
            'Asignación: Designación y notificación automática al asesor comercial correspondiente.'
        ],
        image: '/logo-genuino.png',
        logo: true,
        tags: ['n8n', 'CRM', 'Automatización', 'Embudos de Venta'],
        link: 'https://genuinoimportaciones.com/',
        github: '#'
    }
];
