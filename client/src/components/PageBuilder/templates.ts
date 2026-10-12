import type { ComponentType, PageComponent } from "./types";

export interface PageTemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  blockSummary: { name: string; type: ComponentType }[];
  createComponents: () => PageComponent[];
}

const createUniqueId = (type: ComponentType, index: number) =>
  `${type}-template-${Date.now()}-${index}-${Math.floor(Math.random() * 10000)}`;

export const PAGE_TEMPLATES: PageTemplateDefinition[] = [
  {
    id: "business-landing",
    name: "Business Landing Page",
    description: "Complete modern landing page layout with navigation header, hero banner, feature columns, call-to-action button, and footer.",
    category: "Business",
    iconName: "Briefcase",
    blockSummary: [
      { name: "Navbar Header", type: "navbar" },
      { name: "Hero Section", type: "hero" },
      { name: "Two Columns", type: "columns" },
      { name: "CTA Button", type: "button" },
      { name: "Footer Section", type: "footer" },
    ],
    createComponents: () => [
      {
        id: createUniqueId("navbar", 1),
        type: "navbar",
        navbarLogo: "Acme Corp",
        navbarItems: [
          { label: "Home", url: "/" },
          { label: "Services", url: "#services" },
          { label: "About", url: "#about" },
          { label: "Contact", url: "#contact" },
        ],
      },
      {
        id: createUniqueId("hero", 2),
        type: "hero",
        title: "Grow Your Business with Modern Solutions",
        subtitle: "We help ambitious companies build digital products, scale operations, and delight customers.",
        buttonText: "Get Started Today",
      },
      {
        id: createUniqueId("columns", 3),
        type: "columns",
        columns: {
          left: {
            type: "text",
            text: "Why Choose Acme Corp?\nWe combine strategic design, cutting-edge technology, and data-driven insights to accelerate growth.",
          },
          right: {
            type: "text",
            text: "Proven Results\nOver 500+ global brands trust our platform to power their digital transformation and customer engagement.",
          },
        },
      },
      {
        id: createUniqueId("button", 4),
        type: "button",
        buttonText: "Schedule a Consultation",
        buttonUrl: "#contact",
      },
      {
        id: createUniqueId("footer", 5),
        type: "footer",
        footerLogo: "Acme Corp",
        footerDescription: "Empowering modern enterprises through digital innovation.",
        footerCopyright: "© 2026 Acme Corp. All rights reserved.",
        footerLinks: [
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
          { label: "Support", url: "/support" },
        ],
      },
    ],
  },
  {
    id: "about-us",
    name: "About Us Page",
    description: "Introduce your company history, core values, team mission, and showcase featured workspace media.",
    category: "Company",
    iconName: "UserCheck",
    blockSummary: [
      { name: "Navbar Header", type: "navbar" },
      { name: "Hero Section", type: "hero" },
      { name: "Story Text", type: "text" },
      { name: "Mission Columns", type: "columns" },
      { name: "Team Image", type: "image" },
      { name: "Footer Section", type: "footer" },
    ],
    createComponents: () => [
      {
        id: createUniqueId("navbar", 1),
        type: "navbar",
        navbarLogo: "Our Company",
        navbarItems: [
          { label: "Home", url: "/" },
          { label: "About Us", url: "/about" },
          { label: "Careers", url: "/careers" },
          { label: "Contact", url: "/contact" },
        ],
      },
      {
        id: createUniqueId("hero", 2),
        type: "hero",
        title: "Building the Future of Digital Experiences",
        subtitle: "Passionate creators, engineers, and designers crafting software that makes a difference.",
        buttonText: "Meet Our Team",
      },
      {
        id: createUniqueId("text", 3),
        type: "text",
        text: "Founded in 2020, Our Company started with a simple belief: technology should empower human potential. Today, we support thousands of organizations across 40 countries with scalable tools and transparent service.",
      },
      {
        id: createUniqueId("columns", 4),
        type: "columns",
        columns: {
          left: {
            type: "text",
            text: "Our Mission\nTo build software that simplifies complex workflows and unlocks creative potential for teams everywhere.",
          },
          right: {
            type: "text",
            text: "Our Vision\nA connected digital world where every business has access to enterprise-grade publishing tools.",
          },
        },
      },
      {
        id: createUniqueId("image", 5),
        type: "image",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80",
      },
      {
        id: createUniqueId("footer", 6),
        type: "footer",
        footerLogo: "Our Company",
        footerDescription: "Crafting exceptional digital products since 2020.",
        footerCopyright: "© 2026 Our Company. All rights reserved.",
        footerLinks: [
          { label: "Home", url: "/" },
          { label: "About", url: "/about" },
          { label: "Contact", url: "/contact" },
        ],
      },
    ],
  },
  {
    id: "contact-page",
    name: "Contact Page",
    description: "Provide direct contact channels, support team information, call-to-action button, and footer.",
    category: "Support",
    iconName: "Mail",
    blockSummary: [
      { name: "Navbar Header", type: "navbar" },
      { name: "Hero Header", type: "hero" },
      { name: "Contact Details Text", type: "text" },
      { name: "Direct Action Button", type: "button" },
      { name: "Footer Section", type: "footer" },
    ],
    createComponents: () => [
      {
        id: createUniqueId("navbar", 1),
        type: "navbar",
        navbarLogo: "Support Center",
        navbarItems: [
          { label: "Home", url: "/" },
          { label: "FAQ", url: "/faq" },
          { label: "Contact", url: "/contact" },
        ],
      },
      {
        id: createUniqueId("hero", 2),
        type: "hero",
        title: "We'd Love to Hear From You",
        subtitle: "Have a question, feedback, or custom inquiry? Our team is available 24/7 to assist.",
        buttonText: "Send a Message",
      },
      {
        id: createUniqueId("text", 3),
        type: "text",
        text: "Contact Details:\n• Email: support@example.com\n• Phone: +1 (800) 555-0199\n• Office: 100 Innovation Way, Suite 400, San Francisco, CA 94105",
      },
      {
        id: createUniqueId("button", 4),
        type: "button",
        buttonText: "Email Support Directly",
        buttonUrl: "mailto:support@example.com",
      },
      {
        id: createUniqueId("footer", 5),
        type: "footer",
        footerLogo: "Support Center",
        footerDescription: "Dedicated to providing prompt and friendly assistance.",
        footerCopyright: "© 2026 Support Center. All rights reserved.",
        footerLinks: [
          { label: "Home", url: "/" },
          { label: "Help Docs", url: "/docs" },
          { label: "Contact", url: "/contact" },
        ],
      },
    ],
  },
];
