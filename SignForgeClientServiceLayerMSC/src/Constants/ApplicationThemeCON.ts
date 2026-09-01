export default class ApplicationThemeCON {
  public static readonly BRAND_SAPPHIRE = '#0C2086';
  public static readonly BRAND_SAPPHIRE_HOVER = '#081765';
  
  public static readonly STORAGE_KEY_THEME = 'we_theme';
  public static readonly STORAGE_KEY_DOCUMENTS = 'signcorp_documents';

  public static readonly STATUS_CONFIGS: Record<string, { label: string; bgLight: string; bgDark: string; textLight: string; textDark: string; dot: string }> = {
    DRAFT: {
      label: 'Draft',
      bgLight: 'bg-slate-100',
      bgDark: 'dark:bg-zinc-800/60',
      textLight: 'text-slate-700',
      textDark: 'dark:text-zinc-300',
      dot: 'bg-slate-400 dark:bg-zinc-400',
    },
    SENT: {
      label: 'Pending Candidate',
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-950/40',
      textLight: 'text-amber-700',
      textDark: 'dark:text-amber-400',
      dot: 'bg-amber-500 animate-pulse',
    },
    CANDIDATE_SIGNED: {
      label: 'Pending Countersign',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-950/40',
      textLight: 'text-blue-700',
      textDark: 'dark:text-blue-400',
      dot: 'bg-blue-500 animate-pulse',
    },
    HR_COUNTERSIGNED: {
      label: 'Fully Executed',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-950/40',
      textLight: 'text-emerald-700',
      textDark: 'dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    EXPIRED: {
      label: 'Expired',
      bgLight: 'bg-rose-50',
      bgDark: 'dark:bg-rose-950/40',
      textLight: 'text-rose-700',
      textDark: 'dark:text-rose-400',
      dot: 'bg-rose-500',
    },
    VOID: {
      label: 'Void',
      bgLight: 'bg-zinc-100',
      bgDark: 'dark:bg-zinc-800/40',
      textLight: 'text-zinc-600',
      textDark: 'dark:text-zinc-400',
      dot: 'bg-zinc-400',
    },
  };
}
