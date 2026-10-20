import type { ComponentType, PageComponent } from "./types";

export interface PageTemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  plan: "free" | "premium";
  badge: string;
  legacyId?: string;
  blockSummary: { name: string; type: ComponentType }[];
  createComponents: () => PageComponent[];
}

const createUniqueId = (type: ComponentType, index: number) =>
  `${type}-template-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;

export const TEMPLATE_ID_MAPPINGS: Record<string, string> = {
  // Backward-compatible legacy aliases:
  "business-landing": "minimal-clean",
  "about-us": "modern-business",
  "contact-page": "premium-saas",
  // Canonical IDs:
  "minimal-clean": "minimal-clean",
  "modern-business": "modern-business",
  "premium-saas": "premium-saas",
};

export const resolveTemplateId = (id?: string | null): string => {
  if (!id) return "minimal-clean";
  return TEMPLATE_ID_MAPPINGS[id] || id;
};

export const PAGE_TEMPLATES: PageTemplateDefinition[] = [
  // 1. MINIMAL & CLEAN — FREE
  {
    id: "minimal-clean",
    legacyId: "business-landing",
    name: "Minimal & Clean",
    description: "Pure white background, clean typography, spacious layout, simple navigation, minimal cards. Suitable for portfolios, blogs, and personal websites.",
    category: "Portfolio & Personal",
    iconName: "Feather",
    plan: "free",
    badge: "Free",
    blockSummary: [
      { name: "Minimal Navbar", type: "navbar" },
      { name: "Editorial Hero", type: "hero" },
      { name: "Spacer", type: "spacer" },
      { name: "Featured Work Cards", type: "columns" },
      { name: "Hairline Divider", type: "divider" },
      { name: "Journal & Archive Cards", type: "columns" },
      { name: "Spacer", type: "spacer" },
      { name: "Bio & Statement", type: "text" },
      { name: "Inquiry Button", type: "button" },
      { name: "Refined Footer", type: "footer" },
    ],
    createComponents: () => [
      {
        id: createUniqueId("navbar", 1),
        type: "navbar",
        variant: "minimal",
        navbarLogo: "AURA STUDIO",
        navbarItems: [
          { label: "Works", url: "#works" },
          { label: "Writing", url: "#writing" },
          { label: "About", url: "#about" },
          { label: "Contact", url: "#contact" },
        ],
      },
      {
        id: createUniqueId("hero", 2),
        type: "hero",
        variant: "minimal",
        title: "Thoughtful design for human-first digital products.",
        subtitle: "We are an independent design studio. We distill complex ideas into quiet, timeless digital experiences, publications, and brand identities.",
        buttonText: "Explore Selected Works",
        buttonUrl: "#works",
      },
      {
        id: createUniqueId("spacer", 3),
        type: "spacer",
        variant: "minimal",
        height: 40,
      },
      {
        id: createUniqueId("columns", 4),
        type: "columns",
        variant: "minimal",
        columns: {
          left: {
            type: "image",
            imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80",
          },
          right: {
            type: "text",
            text: "Selected Work 01 — Kanso Living\nAn architectural publication exploring restrained interior spaces, natural light, and modern Japanese minimalism.",
          },
        },
      },
      {
        id: createUniqueId("divider", 5),
        type: "divider",
        variant: "minimal",
        dividerStyle: "solid",
        dividerWidth: "100%",
      },
      {
        id: createUniqueId("columns", 6),
        type: "columns",
        variant: "minimal",
        columns: {
          left: {
            type: "text",
            text: "Selected Work 02 — Mono Type Specimen\nA bespoke typographical catalogue and specimen monograph designed for high-legibility digital and print typography.",
          },
          right: {
            type: "image",
            imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80",
          },
        },
      },
      {
        id: createUniqueId("spacer", 7),
        type: "spacer",
        variant: "minimal",
        height: 30,
      },
      {
        id: createUniqueId("text", 8),
        type: "text",
        variant: "minimal",
        text: "About the Studio\nFounded on the principle that the finest design prioritizes clarity over noise. We partner with authors, architects, and forward-thinking creators across Zurich, Tokyo, and San Francisco to build enduring digital presences.",
      },
      {
        id: createUniqueId("button", 9),
        type: "button",
        variant: "minimal",
        buttonText: "Start a Collaboration",
        buttonUrl: "#contact",
      },
      {
        id: createUniqueId("footer", 10),
        type: "footer",
        variant: "minimal",
        footerLogo: "AURA STUDIO",
        footerDescription: "Simplicity, intention, and typographical craft.",
        footerCopyright: "© 2026 Aura Studio. Crafted with minimalism.",
        footerLinks: [
          { label: "Journal", url: "#journal" },
          { label: "Colophon", url: "#colophon" },
          { label: "Email", url: "mailto:hello@aurastudio.design" },
        ],
      },
    ],
  },

  // 2. MODERN BUSINESS — FREE
  {
    id: "modern-business",
    legacyId: "about-us",
    name: "Modern Business",
    description: "Warm cream background, sage-green accents, professional hero section, service cards, and clear call-to-action. Suitable for agencies, service providers, and small businesses.",
    category: "Agency & Business",
    iconName: "Briefcase",
    plan: "free",
    badge: "Free",
    blockSummary: [
      { name: "Executive Navbar", type: "navbar" },
      { name: "Agency Hero Banner", type: "hero" },
      { name: "Spacer", type: "spacer" },
      { name: "Growth Advisory Card", type: "columns" },
      { name: "Digital Systems Card", type: "columns" },
      { name: "Client Trust Metric", type: "text" },
      { name: "Schedule Call Button", type: "button" },
      { name: "Corporate Footer", type: "footer" },
    ],
    createComponents: () => [
      {
        id: createUniqueId("navbar", 1),
        type: "navbar",
        variant: "modern",
        navbarLogo: "Verdant Growth Partners",
        navbarItems: [
          { label: "Services", url: "#services" },
          { label: "Case Studies", url: "#cases" },
          { label: "Our Team", url: "#team" },
          { label: "Book Audit", url: "#audit" },
        ],
      },
      {
        id: createUniqueId("hero", 2),
        type: "hero",
        variant: "modern",
        badge: "✦ Strategic Growth & Modern Advisory",
        title: "Sustainable Scale & Modern Business Strategy",
        subtitle: "We partner with ambitious enterprises and leaders to unlock transformative digital operations, brand acceleration, and verifiable revenue outcomes.",
        buttonText: "Schedule Strategic Consultation",
        buttonUrl: "#audit",
      },
      {
        id: createUniqueId("spacer", 3),
        type: "spacer",
        variant: "modern",
        height: 30,
      },
      {
        id: createUniqueId("columns", 4),
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
        id: createUniqueId("columns", 5),
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
        id: createUniqueId("text", 6),
        type: "text",
        variant: "modern",
        text: "Our Proven Client Commitment\nOver the past 5 years, we have empowered 120+ client organizations to boost profitability by an average of 42% in their first 12 months, backed by transparent KPIs and dedicated advisory sprints.",
      },
      {
        id: createUniqueId("button", 7),
        type: "button",
        variant: "modern",
        buttonText: "Book Your 30-Min Discovery Session",
        buttonUrl: "#audit",
      },
      {
        id: createUniqueId("footer", 8),
        type: "footer",
        variant: "modern",
        footerLogo: "Verdant Growth Partners",
        footerDescription: "Strategic clarity, sustainable execution, and verifiable results.",
        footerCopyright: "© 2026 Verdant Growth Partners LLC. All rights reserved.",
        footerLinks: [
          { label: "Client Portal", url: "#" },
          { label: "Privacy Policy", url: "#" },
          { label: "Terms of Engagement", url: "#" },
        ],
      },
    ],
  },

  // 3. OBSIDIAN SAAS / TECH ENTERPRISE — PREMIUM
  {
    id: "premium-saas",
    legacyId: "contact-page",
    name: "Obsidian SaaS / Tech Enterprise",
    description: "High-contrast dark obsidian aesthetic with cyber-violet accents, enterprise infrastructure metrics, feature showcases, and glowing CTA. Exclusive to Premium subscribers.",
    category: "Enterprise & Tech",
    iconName: "Crown",
    plan: "premium",
    badge: "Premium",
    blockSummary: [
      { name: "Dark Frosted Navbar", type: "navbar" },
      { name: "Neon Mesh Hero", type: "hero" },
      { name: "Spacer", type: "spacer" },
      { name: "Global Edge Mesh Card", type: "columns" },
      { name: "Neural Telemetry Card", type: "columns" },
      { name: "Cyber Divider", type: "divider" },
      { name: "Enterprise SLA Benchmark", type: "text" },
      { name: "Sandbox Deploy Button", type: "button" },
      { name: "Obsidian Tech Footer", type: "footer" },
    ],
    createComponents: () => [
      {
        id: createUniqueId("navbar", 1),
        type: "navbar",
        variant: "premium",
        navbarLogo: "✦ AETHER PRO",
        navbarItems: [
          { label: "Platform", url: "#platform" },
          { label: "Architecture", url: "#architecture" },
          { label: "Benchmarks", url: "#benchmarks" },
          { label: "Enterprise API", url: "#api" },
        ],
      },
      {
        id: createUniqueId("hero", 2),
        type: "hero",
        variant: "premium",
        badge: "PREMIUM ENTERPRISE PLATFORM ✦ 99.99% UPTIME",
        title: "Autonomous Edge Intelligence for Next-Gen Engineering",
        subtitle: "Deploy, orchestrate, and observe sub-millisecond AI pipelines globally. Zero server management, multi-region failover, and hardware-accelerated inferencing.",
        buttonText: "Deploy Enterprise Cluster →",
        buttonUrl: "#deploy",
      },
      {
        id: createUniqueId("spacer", 3),
        type: "spacer",
        variant: "premium",
        height: 30,
      },
      {
        id: createUniqueId("columns", 4),
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
        id: createUniqueId("columns", 5),
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
        id: createUniqueId("divider", 6),
        type: "divider",
        variant: "premium",
        dividerStyle: "solid",
        dividerWidth: "100%",
      },
      {
        id: createUniqueId("text", 7),
        type: "text",
        variant: "premium",
        text: "Enterprise Tier Performance Benchmarks\n• 99.999% Guaranteed High-Availability SLA\n• SOC 2 Type II, ISO 27001 & HIPAA Compliant Endpoints\n• 12.4M Ops/sec Throughput with Sub-5ms P99 Global Latency",
      },
      {
        id: createUniqueId("button", 8),
        type: "button",
        variant: "premium",
        buttonText: "Request Private Sandbox & API Key",
        buttonUrl: "#api",
      },
      {
        id: createUniqueId("footer", 9),
        type: "footer",
        variant: "premium",
        footerLogo: "✦ AETHER ENTERPRISE",
        footerDescription: "Mission-critical infrastructure for the modern intelligent web.",
        footerCopyright: "© 2026 Aether Pro Technologies Inc. Global Edge Mesh.",
        footerLinks: [
          { label: "API Reference", url: "#" },
          { label: "System Status: 99.999%", url: "#" },
          { label: "Security Whitepaper", url: "#" },
        ],
      },
    ],
  },
];

export const getTemplateById = (id: string): PageTemplateDefinition | undefined => {
  const resolvedId = resolveTemplateId(id);
  return PAGE_TEMPLATES.find((t) => t.id === resolvedId || t.legacyId === id);
};
