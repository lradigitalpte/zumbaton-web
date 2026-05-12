"use client";

import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const PricingBox = (props: {
  price: string;
  duration: string;
  packageName: string;
  subtitle: string;
  children: React.ReactNode;
}) => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const { price, duration, packageName, subtitle, children } = props;

  return (
    <div className="w-full h-full">
      <div className="relative overflow-hidden h-full border border-gray-200 dark:border-white/20 rounded-none bg-white dark:bg-zinc-950 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="relative p-4 sm:p-6 md:p-8 pb-24 sm:pb-24 z-10">
          <div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black mb-1 sm:mb-2 text-gray-900 dark:text-white uppercase italic tracking-tight">{packageName}</h2>
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm md:text-base text-gray-600 dark:text-zinc-400 font-medium">{subtitle}</div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 text-lime-600 dark:text-lime-500">
              {price} <span className="text-sm sm:text-lg text-gray-500 dark:text-zinc-500 font-bold">/{duration}</span>
          </h3>
            <h4 className="text-xs sm:text-sm md:text-base text-gray-900 dark:text-white font-black uppercase tracking-widest mb-3 sm:mb-4">Benefits:</h4>
        </div>

          <div className="border-t border-gray-100 dark:border-zinc-800 mb-4 sm:mb-6 pt-4 sm:pt-6"></div>
          <div className="mb-4 sm:mb-6 px-4 sm:px-0">{children}</div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-8 text-center z-10 bg-white dark:bg-zinc-950">
          <button
            type="button"
            onClick={openWhatsAppModal}
            className="inline-flex items-center justify-center gap-2 rounded-none px-5 sm:px-8 py-2 sm:py-3.5 text-xs sm:text-base font-black text-black bg-lime-500 hover:bg-lime-400 transition-all duration-300 hover:scale-[1.02] shadow-lg w-full uppercase tracking-wider"
          >
            <span>Choose Plan</span>
            <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingBox;
