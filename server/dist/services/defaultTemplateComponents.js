"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultComponentsForTemplate = void 0;
const getDefaultComponentsForTemplate = (templateId, siteName = "My Website") => {
    const ts = Date.now();
    if (templateId === "modern-business" || templateId === "about-us") {
        return [
            {
                id: `navbar-${ts}-1`,
                type: "navbar",
                navbarLogo: `${siteName}`,
                variant: "modern",
                navbarItems: [
                    { label: "Services", url: "#services" },
                    { label: "Case Studies", url: "#cases" },
                    { label: "Our Team", url: "#team" },
                    { label: "Book Audit", url: "#audit" },
                ],
            },
            {
                id: `hero-${ts}-2`,
                type: "hero",
                variant: "modern",
                badge: "✦ Strategic Growth & Modern Consulting",
                title: "Sustainable Scale & Modern Business Strategy",
                subtitle: `We partner with ambitious enterprises and leaders to unlock transformative digital operations, brand acceleration, and verifiable revenue outcomes for ${siteName}.`,
                buttonText: "Schedule Strategic Consultation",
                buttonUrl: "#audit",
            },
            {
                id: `spacer-${ts}-3`,
                type: "spacer",
                variant: "modern",
                height: 30,
            },
            {
                id: `columns-${ts}-4`,
                type: "columns",
                variant: "modern",
                columns: {
                    left: {
                        type: "image",
                        imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1000&auto=format&fit=crop&q=80",
                    },
                    right: {
                        type: "text",
                        text: "Service 01 — Growth & Strategy Advisory\nWe diagnose operational bottlenecks, restructure go-to-market pipelines, and align leadership teams for accelerated execution.",
                    },
                },
            },
            {
                id: `columns-${ts}-5`,
                type: "columns",
                variant: "modern",
                columns: {
                    left: {
                        type: "text",
                        text: "Service 02 — Digital Systems & Headless Tech\nModernise your tech stack with headless CMS infrastructure, automated workflows, and frictionless enterprise digital publishing.",
                    },
                    right: {
                        type: "image",
                        imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80",
                    },
                },
            },
            {
                id: `text-${ts}-6`,
                type: "text",
                variant: "modern",
                text: "Our Proven Client Commitment\nOver the past 5 years, we have empowered 120+ client organizations to boost profitability by an average of 42% in their first 12 months, backed by transparent KPIs and dedicated advisory sprints.",
            },
            {
                id: `button-${ts}-7`,
                type: "button",
                variant: "modern",
                buttonText: "Book Your 30-Min Discovery Session",
                buttonUrl: "#audit",
            },
            {
                id: `footer-${ts}-8`,
                type: "footer",
                variant: "modern",
                footerLogo: `${siteName}`,
                footerDescription: "Strategic clarity, sustainable execution, and verifiable results.",
                footerCopyright: `© 2026 ${siteName}. All rights reserved.`,
                footerLinks: [
                    { label: "Client Portal", url: "#" },
                    { label: "Privacy Policy", url: "#" },
                    { label: "Terms of Engagement", url: "#" },
                ],
            },
        ];
    }
    if (templateId === "premium-saas" || templateId === "contact-page") {
        return [
            {
                id: `navbar-${ts}-1`,
                type: "navbar",
                variant: "premium",
                navbarLogo: `✦ ${siteName.toUpperCase()}`,
                navbarItems: [
                    { label: "Platform", url: "#platform" },
                    { label: "Architecture", url: "#architecture" },
                    { label: "Benchmarks", url: "#benchmarks" },
                    { label: "Enterprise API", url: "#api" },
                ],
            },
            {
                id: `hero-${ts}-2`,
                type: "hero",
                variant: "premium",
                badge: "PREMIUM ENTERPRISE PLATFORM ✦ 99.99% UPTIME",
                title: "Autonomous Edge Intelligence for Next-Gen Engineering",
                subtitle: `Deploy, orchestrate, and observe sub-millisecond AI pipelines globally with ${siteName}. Zero server management, multi-region failover, and hardware-accelerated inferencing.`,
                buttonText: "Deploy Enterprise Cluster →",
                buttonUrl: "#deploy",
            },
            {
                id: `spacer-${ts}-3`,
                type: "spacer",
                variant: "premium",
                height: 30,
            },
            {
                id: `columns-${ts}-4`,
                type: "columns",
                variant: "premium",
                columns: {
                    left: {
                        type: "image",
                        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
                    },
                    right: {
                        type: "text",
                        text: "Global Distributed Mesh\nInstant zero-loss edge routing across 300+ Point of Presence (PoP) datacenters. Dynamic load-shedding and automatic cryptographic integrity checks.",
                    },
                },
            },
            {
                id: `columns-${ts}-5`,
                type: "columns",
                variant: "premium",
                columns: {
                    left: {
                        type: "text",
                        text: "Sub-Millisecond Neural Telemetry\nReal-time tracing and automated vector indexing with native OpenTelemetry export. Detect bottlenecks before they impact mission-critical workloads.",
                    },
                    right: {
                        type: "image",
                        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
                    },
                },
            },
            {
                id: `divider-${ts}-6`,
                type: "divider",
                variant: "premium",
                dividerStyle: "solid",
                dividerWidth: "100%",
            },
            {
                id: `text-${ts}-7`,
                type: "text",
                variant: "premium",
                text: "Enterprise Tier Performance Benchmarks\n• 99.999% Guaranteed High-Availability SLA\n• SOC 2 Type II, ISO 27001 & HIPAA Compliant Endpoints\n• 12.4M Ops/sec Throughput with Sub-5ms P99 Global Latency",
            },
            {
                id: `button-${ts}-8`,
                type: "button",
                variant: "premium",
                buttonText: "Request Private Sandbox & API Key",
                buttonUrl: "#api",
            },
            {
                id: `footer-${ts}-9`,
                type: "footer",
                variant: "premium",
                footerLogo: `✦ ${siteName.toUpperCase()} ENTERPRISE`,
                footerDescription: "Mission-critical infrastructure for the modern intelligent web.",
                footerCopyright: `© 2026 ${siteName}. Global Edge Mesh.`,
                footerLinks: [
                    { label: "API Reference", url: "#" },
                    { label: "System Status: 99.999%", url: "#" },
                    { label: "Security Whitepaper", url: "#" },
                ],
            },
        ];
    }
    // Default: Minimal & Clean (Free)
    return [
        {
            id: `navbar-${ts}-1`,
            type: "navbar",
            variant: "minimal",
            navbarLogo: `${siteName.toUpperCase()}`,
            navbarItems: [
                { label: "Works", url: "#works" },
                { label: "Journal", url: "#journal" },
                { label: "About", url: "#about" },
                { label: "Contact", url: "#contact" },
            ],
        },
        {
            id: `hero-${ts}-2`,
            type: "hero",
            variant: "minimal",
            title: "Thoughtful design for human-first digital products.",
            subtitle: `We are an independent studio. We distill complex concepts into quiet, timeless digital experiences, publications, and brand identities for ${siteName}.`,
            buttonText: "Explore Selected Works",
            buttonUrl: "#works",
        },
        {
            id: `spacer-${ts}-3`,
            type: "spacer",
            variant: "minimal",
            height: 40,
        },
        {
            id: `columns-${ts}-4`,
            type: "columns",
            variant: "minimal",
            columns: {
                left: {
                    type: "image",
                    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80",
                },
                right: {
                    type: "text",
                    text: "Project 01 — Kanso Living\nAn architectural case study and minimalist publication exploring restrained interior spaces, natural textures, and Japanese minimalism.",
                },
            },
        },
        {
            id: `divider-${ts}-5`,
            type: "divider",
            variant: "minimal",
            dividerStyle: "solid",
            dividerWidth: "100%",
        },
        {
            id: `columns-${ts}-6`,
            type: "columns",
            variant: "minimal",
            columns: {
                left: {
                    type: "text",
                    text: "Project 02 — Mono Type Foundry\nA bespoke typographical catalogue and specimen book designed for editorial clarity and high-legibility digital typography.",
                },
                right: {
                    type: "image",
                    imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80",
                },
            },
        },
        {
            id: `spacer-${ts}-7`,
            type: "spacer",
            variant: "minimal",
            height: 30,
        },
        {
            id: `text-${ts}-8`,
            type: "text",
            variant: "minimal",
            text: "About the Studio\nFounded on the principle that the best design goes unnoticed, we partner with authors, architects, and forward-thinking creators across Zurich, Tokyo, and New York to build lasting digital presences.",
        },
        {
            id: `button-${ts}-9`,
            type: "button",
            variant: "minimal",
            buttonText: "Start a Collaboration",
            buttonUrl: "#contact",
        },
        {
            id: `footer-${ts}-10`,
            type: "footer",
            variant: "minimal",
            footerLogo: `${siteName.toUpperCase()}`,
            footerDescription: "Simplicity, intention, and typographical craft.",
            footerCopyright: `© 2026 ${siteName}. Crafted with minimalism.`,
            footerLinks: [
                { label: "Journal", url: "#journal" },
                { label: "Colophon", url: "#" },
                { label: "Email", url: "mailto:hello@example.com" },
            ],
        },
    ];
};
exports.getDefaultComponentsForTemplate = getDefaultComponentsForTemplate;
