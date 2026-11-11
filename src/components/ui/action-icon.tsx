const paths = {
  "LayoutDashboard": "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  "UsersRound": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  "GraduationCap": "m2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6M22 9v7",
  "BookOpen": "M12 7v14M3 3c4-1 7 0 9 3 2-3 5-4 9-3v16c-4-1-7 0-9 2-2-2-5-3-9-2V3Z",
  "ChartColumn": "M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3",
  "Settings": "m9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 3 2 3-2 3 1 2-3-1-3 2-2-2-3-3-1-1-3H9ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  "ArrowLeft": "m12 19-7-7 7-7M5 12h14",
  "ArrowRight": "m12 5 7 7-7 7M5 12h14",
  "House": "m3 10 9-7 9 7v10H3V10Zm6 10v-7h6v7",
  "CirclePlus": "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 8v8M8 12h8",
  "Eye": "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  "EyeOff": "m3 3 18 18M10 5c5-1 9 3 12 7a20 20 0 0 1-3 4M6 6a20 20 0 0 0-4 6c5 8 11 9 16 5M10 10a3 3 0 0 0 4 4",
  "Pencil": "m16 3 5 5-12 12-6 1 1-6Zm-2 2 5 5",
  "Trash2": "M3 6h18M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6m4 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-5 5v6m4-6v6",
  "Send": "m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2",
  "ClipboardCheck": "M9 5H5v16h14V5h-4M9 3h6v4H9zM9 14l2 2 4-4",
  "ClipboardList": "M9 5H5v16h14V5h-4M9 3h6v4H9zM9 12h.01M12 12h3M9 16h.01M12 16h3",
  "RefreshCw": "M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5M4 17a9 9 0 0 0 15 2l3-3m0 5v-5h-5",
  "UserPlus": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM19 8v6m-3-3h6",
  "Users": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  "UserMinus": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM16 11h6",
  "Save": "M3 3h15l3 3v15H3V3Zm4 0v6h10V3M7 21v-8h10v8",
  "Check": "m5 12 4 4L19 6",
  "X": "m6 6 12 12M6 18 18 6",
  "Search": "M19 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 5 6",
  "ListFilter": "M4 6h16M7 12h10M10 18h4",
  "RotateCcw": "M3 10a9 9 0 1 1 2 8M3 3v7h7",
  "CheckCircle": "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM8 12l3 3 5-6",
  "Download": "M21 15v6H3v-6M12 3v12m-5-5 5 5 5-5",
  "Upload": "M21 15v6H3v-6M12 15V3m-5 5 5-5 5 5",
  "Copy": "M9 9h12v12H9zM15 5V3H3v12h2",
  "UserRound": "M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  "KeyRound": "M14 7a5 5 0 1 1-4 8L3 22l-2-2 2-2-1-1 2-2 1 1 4-4a5 5 0 0 1 5-5ZM16 10h.01",
  "LogOut": "M9 21H3V3h6M9 12h12m-5-5 5 5-5 5",
  "LogIn": "M15 3h6v18h-6M3 12h12m-5-5 5 5-5 5",
  "ShieldCheck": "m12 3 9 4v5c0 5-9 9-9 9s-9-4-9-9V7l9-4Zm-4 9 3 3 5-6",
  "MessageSquare": "M21 3H3v14h4v4l5-4h9V3Z",
  "Trophy": "M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H3v3a4 4 0 0 0 5 4M16 5h5v3a4 4 0 0 1-5 4M12 14v7M8 21h8",
  "Ban": "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM5 5l14 14",
  "AlertTriangle": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3ZM12 9v4M12 17h.01",
  "Clock": "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2",
  "CheckCheck": "M18 6 7 17l-5-5M22 10l-7.5 7.5L13 16",
  "History": "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2",
  "ChevronDown": "m6 9 6 6 6-6"
} as const;

export type ActionIconName = keyof typeof paths;

export function ActionIcon({ name, size = 16, className = "" }: {
  name: ActionIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      <path d={paths[name]} />
    </svg>
  );
}

export function navigationIcon(key: string): ActionIconName {
  const icons: Record<string, ActionIconName> = {
    overview: "LayoutDashboard", classes: "UsersRound", students: "GraduationCap",
    quizzes: "BookOpen", assessment: "ClipboardCheck", results: "ChartColumn",
    profile: "UserRound", settings: "Settings", "teacher-accounts": "UsersRound",
    ranking: "ChartColumn", badges: "Trophy",
  };
  return icons[key] ?? "ChartColumn";
}
