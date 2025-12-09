import Link from "next/link";

const PricingBox = (props: {
  price: string;
  duration: string;
  packageName: string;
  subtitle: string;
  children: React.ReactNode;
}) => {
  const { price, duration, packageName, subtitle, children } = props;

  return (
    <div className="w-full h-full">
      <div className="relative overflow-hidden h-full border border-gray-200 dark:border-white/20 rounded-2xl bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl dark:hover:bg-gray-800/70 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent dark:from-green-600/20 dark:to-transparent"></div>
        <div className="relative p-8 pb-24 z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">{packageName}</h2>
            <div className="mb-4 text-gray-600 dark:text-white/70">{subtitle}</div>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-green-600 dark:text-green-400">
              ${price} <span className="text-lg text-gray-600 dark:text-white/70">/{duration}</span>
          </h3>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Benefits:</h4>
        </div>

          <div className="border-t border-gray-200 dark:border-white/20 mb-6 pt-6"></div>
          <div className="mb-6">{children}</div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 text-center z-10">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded px-8 py-3 text-base font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-all duration-300 hover:scale-105 shadow-lg w-full"
              >
            <span>Choose Plan</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingBox;
