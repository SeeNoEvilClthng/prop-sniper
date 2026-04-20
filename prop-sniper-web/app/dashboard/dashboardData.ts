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
  icon: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Home",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        description: "Main overview of your pipeline",
        icon: "🏠",
      },
    ],
  },
  {
    title: "Leads",
    items: [
      {
        label: "All Leads",
        href: "/dashboard/leads",
        description: "View every saved lead",
        icon: "📋",
      },
      {
        label: "Add Lead",
        href: "/dashboard/add-lead",
        description: "Create a new lead manually",
        icon: "➕",
      },
      {
        label: "Lead Statuses",
        href: "/dashboard/status",
        description: "See leads grouped by stage",
        icon: "📊",
      },
      {
        label: "Driving Leads",
        href: "/dashboard/driving",
        description: "Track driving-for-dollars targets",
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
        description: "Vacant property opportunities",
        icon: "🏚️",
      },
      {
        label: "High Equity",
        href: "/dashboard/lists/equity",
        description: "Owners with strong equity",
        icon: "💰",
      },
      {
        label: "Pre-Foreclosure",
        href: "/dashboard/lists/preforeclosure",
        description: "Motivated owner segment",
        icon: "⚠️",
      },
      {
        label: "Tax Delinquent",
        href: "/dashboard/lists/tax",
        description: "Tax delinquent properties",
        icon: "🧾",
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
        icon: "📈",
      },
      {
        label: "Score Trends",
        href: "/dashboard/analytics/scores",
        description: "See strongest deal scores",
        icon: "📉",
      },
      {
        label: "Pipeline Stats",
        href: "/dashboard/analytics/pipeline",
        description: "Track progress by stage",
        icon: "📌",
      },
      {
        label: "Market View",
        href: "/dashboard/analytics/market",
        description: "View opportunity by city",
        icon: "🌎",
      },
    ],
  },
];

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
  {
    id: "6",
    address: "8754 Wilcrest Dr",
    city: "Houston",
    state: "TX",
    zip: "77099",
    status: "New",
    score: 74,
    arv: 255000,
    asking: 182000,
    repairs: 24000,
    equityPercent: 41,
    tags: ["Absentee Owner", "Tax Delinquent"],
    owner: "Sandra K.",
    phone: "(713) 555-0108",
  },
];

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

export function getScoreTone(score: number) {
  if (score >= 85) {
    return {
      label: "Strong",
      color: "text-emerald-300",
      bar: "from-emerald-400 to-lime-300",
    };
  }
  if (score >= 70) {
    return {
      label: "Solid",
      color: "text-yellow-300",
      bar: "from-yellow-300 to-amber-400",
    };
  }
  return {
    label: "Weak",
    color: "text-rose-300",
    bar: "from-rose-400 to-red-400",
  };
}

export function findNavMeta(pathname: string) {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.href === pathname) {
        return {
          title: item.label,
          description: item.description,
          section: section.title,
          icon: item.icon,
        };
      }
    }
  }
  return null;
}