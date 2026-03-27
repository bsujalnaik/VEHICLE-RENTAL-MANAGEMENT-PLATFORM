import React from 'react';

export const Stepper = ({ children }) => {
  return (
    <div className="flex justify-between items-center w-full relative">
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border-glass -z-0"></div>
      {children}
    </div>
  );
};

export const Step = ({ active, completed, children }) => {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2 bg-bg-deep px-4">
      {children}
    </div>
  );
};

export const StepLabel = ({ children, active }) => {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-primary' : 'text-text-dim'}`}>
      {children}
    </span>
  );
};
