export type LeadStatus =
  | "New"
  | "Contacted"
  | "Follow Up"
  | "Negotiating"
  | "Under Contract"
  | "Dead";

export type LeadTag =
  | "Absentee Owner"
  | "High Equity"
  | "Vacant"
  | "Pre-Foreclosure"
  | "Tax Delinquent"
  | "Tired Landlord";

export type Lead = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: LeadStatus;
  score: number;
  arv: number;
  asking: number;
  repairs: number;
  equityPercent: number;
  tags: LeadTag[];
  owner: string;
  phone: string;
};

export type NavItem = {
  label: string;
  href: string;
  description: string;
  section: string;
  icon: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const leadsSeed: Lead[] = [
  {
    id: "1",
    address: "5039 Galahad Dr",
    city: "San Antonio",
    state: "TX",
    zip: "78218",
    status: "Negotiating",
    score: 84,
    arv: 265000,
    asking: 200000,
    repairs: 18000,
    equityPercent: 47,
    tags: ["Absentee Owner", "High Equity", "Vacant"],
    owner: "Michael R.",
    phone: "(210) 555-0192",
  },
  {
    id: "2",
    address: "542 Bertetti Dr",
    city: "San Antonio",
    state: "TX",
    zip: "78227",
    status: "Under Contract",
    score: 91,
    arv: 248000,
    asking: 180000,
    repairs: 22000,
    equityPercent: 53,
    tags: ["High Equity", "Tired Landlord"],
    owner: "Angela P.",
    phone: "(210) 555-0148",
  },
  {
    id: "3",
    address: "1371 S Parkway E",
    city: "Memphis",
    state: "TN",
    zip: "38106",
    status: "Follow Up",
    score: 76,
    arv: 210000,
    asking: 143000,
    repairs: 30000,
    equityPercent: 39,
    tags: ["Tax Delinquent", "Vacant"],
    owner: "James T.",
    phone: "(901) 555-0123",
  },
  {
    id: "4",
    address: "1256 Cleardale Dr",
    city: "Dallas",
    state: "TX",
    zip: "75232",
    status: "Contacted",
    score: 71,
    arv: 295000,
    asking: 215000,
    repairs: 25000,
    equityPercent: 33,
    tags: ["Pre-Foreclosure", "Absentee Owner"],
    owner: "Patricia S.",
    phone: "(469) 555-0167",
  },
  {
    id: "5",
    address: "1403 Lamar Ave",
    city: "Memphis",
    state: "TN",
    zip: "38104",
    status: "New",
    score: 80,
    arv: 325000,
    asking: 219000,
    repairs: 35000,
    equityPercent: 44,
    tags: ["High Equity", "Tired Landlord", "Vacant"],
    owner: "Ronald D.",
    phone: "(901) 555-0189",
  },
];

export const filters: Array<LeadTag | "All"> = [
  "All",
  "Absentee Owner",
  "High Equity",
  "Vacant",
  "Pre-Foreclosure",
  "Tax Delinquent",
  "Tired Landlord",
];

export const navGroups: NavGroup[] = [
  {
    title: "Leads",
    items: [
      {
        label: "All Leads",
        href: "/dashboard/leads",
        description: "View and manage every saved lead",
        section: "Leads",
        icon: "🏠",
      },
      {
        label: "Add Lead",
        href: "/dashboard/add-lead",
        description: "Save a new property to your pipeline",
        section: "Leads",
        icon: "➕",
      },
      {
        label: "Lead Statuses",
        href: "/dashboard/status",
        description: "Track every deal by stage",
        section: "Leads",
        icon: "📊",
      },
      {
        label: "Driving Leads",
        href: "/dashboard/driving",
        description: "Manage properties found while driving for dollars",
        section: "Leads",
        icon: "🚗",
      },
    ],
  },
  {
    title: "Lists",
    items: [
      {
        label: "Vacant List",
        href: "/dashboard/lists/vacant",
        description: "Review vacant property opportunities",
        section: "Lists",
        icon: "🏚️",
      },
      {
        label: "High Equity",
        href: "/dashboard/lists/equity",
        description: "See stronger equity-based opportunities",
        section: "Lists",
        icon: "💰",
      },
      {
        label: "Pre-Foreclosure",
        href: "/dashboard/lists/preforeclosure",
        description: "Review motivated owner leads",
        section: "Lists",
        icon: "⚠️",
      },
      {
        label: "Tax Delinquent",
        href: "/dashboard/lists/tax",
        description: "Find distressed property segments",
        section: "Lists",
        icon: "🧾",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        label: "Text Campaigns",
        href: "/dashboard/marketing/text",
        description: "Follow up with owners faster",
        section: "Marketing",
        icon: "💬",
      },
      {
        label: "Direct Mail",
        href: "/dashboard/marketing/mail",
        description: "Prepare postcard-style campaigns",
        section: "Marketing",
        icon: "📬",
      },
      {
        label: "Buyer Blasts",
        href: "/dashboard/marketing/blast",
        description: "Push deals to your buyer list",
        section: "Marketing",
        icon: "📣",
      },
      {
        label: "Skip Trace",
        href: "/dashboard/marketing/skiptrace",
        description: "Improve owner contact information",
        section: "Marketing",
        icon: "🔎",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        label: "Deal Analyzer",
        href: "/dashboard/analyzer",
        description: "Review ARV, repairs, and spread",
        section: "Analytics",
        icon: "📈",
      },
      {
        label: "Score Trends",
        href: "/dashboard/analytics/scores",
        description: "Watch top opportunities over time",
        section: "Analytics",
        icon: "📉",
      },
      {
        label: "Pipeline Stats",
        href: "/dashboard/analytics/pipeline",
        description: "Track your lead movement",
        section: "Analytics",
        icon: "📋",
      },
      {
        label: "Market View",
        href: "/dashboard/analytics/market",
        description: "See city and market performance",
        section: "Analytics",
        icon: "🌎",
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        label: "Import CSV",
        href: "/dashboard/tools/import",
        description: "Bring in PropStream or Batch leads",
        section: "Tools",
        icon: "📂",
      },
      {
        label: "Map View",
        href: "/dashboard/map",
        description: "See saved leads on a map",
        section: "Tools",
        icon: "🗺️",
      },
      {
        label: "Comp Finder",
        href: "/dashboard/tools/comps",
        description: "Analyze nearby comparable sales",
        section: "Tools",
        icon: "📍",
      },
      {
        label: "Repair Estimator",
        href: "/dashboard/tools/repairs",
        description: "Estimate rehab numbers faster",
        section: "Tools",
        icon: "🛠️",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        href: "/dashboard/account/profile",
        description: "Manage your account details",
        section: "Account",
        icon: "👤",
      },
      {
        label: "Team Access",
        href: "/dashboard/account/team",
        description: "Control user access and roles",
        section: "Account",
        icon: "👥",
      },
      {
        label: "Billing",
        href: "/dashboard/account/billing",
        description: "Manage plan and payment settings",
        section: "Account",
        icon: "💳",
      },
      {
        label: "Settings",
        href: "/dashboard/account/settings",
        description: "Customize your dashboard workflow",
        section: "Account",
        icon: "⚙️",
      },
    ],
  },
];

export function findNavMeta(pathname: string): NavItem | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return item;
    }
  }
  return null;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getSpread(lead: Lead) {
  return lead.arv - lead.asking - lead.repairs;
}

export function getScoreTone(score: number) {
  if (score >= 85) {
    return {
      text: "Strong",
      color: "text-emerald-300",
      bar: "from-emerald-400 to-lime-300",
      glow: "shadow-[0_0_30px_rgba(52,211,153,0.15)]",
    };
  }
  if (score >= 70) {
    return {
      text: "Solid",
      color: "text-yellow-300",
      bar: "from-yellow-300 to-amber-400",
      glow: "shadow-[0_0_30px_rgba(250,204,21,0.12)]",
    };
  }
  return {
    text: "Weak",
    color: "text-rose-300",
    bar: "from-rose-400 to-red-400",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.12)]",
  };
}

export function statusClasses(status: LeadStatus) {
  switch (status) {
    case "New":
      return "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30";
    case "Contacted":
      return "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/30";
    case "Follow Up":
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30";
    case "Negotiating":
      return "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30";
    case "Under Contract":
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30";
    case "Dead":
      return "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30";
    default:
      return "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-400/30";
  }
}