import React from 'react';

/**
 * پس‌زمینهٔ نور ملایم؛ ثابت (بدون انیمیشن دائمی) تا روی گوشی‌های ضعیف‌تر
 * رندر و اسکرول روان بماند. memo هم از رندر دوباره جلوگیری می‌کند.
 */
const AuroraBackgroundBase: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full glow-orb bg-[#8FAE9B] dark:bg-[#7FD1C7] opacity-40 dark:opacity-20" />
      <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full glow-orb bg-[#9DB4C8] dark:bg-[#1C2340] opacity-40 dark:opacity-35" />
      <div className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full glow-orb bg-[#B8A9D9] dark:bg-[#9181B7] opacity-35 dark:opacity-15" />
      <div className="absolute top-1/2 right-4 w-44 h-44 rounded-full glow-orb bg-[#E28859] dark:bg-[#E9966E] opacity-20 dark:opacity-10" />
    </div>
  );
};

export const AuroraBackground = React.memo(AuroraBackgroundBase);
