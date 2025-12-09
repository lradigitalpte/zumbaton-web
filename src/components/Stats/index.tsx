"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

const stats: StatItem[] = [
  { value: 5000, label: "Training Hours", suffix: "+" },
  { value: 500, label: "Active Members", suffix: "+" },
  { value: 1000, label: "Classes Taught", suffix: "+" },
  { value: 20, label: "Certified Instructors", suffix: "+" },
];

const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const startTime = Date.now();
            const startValue = 0;

            const animate = () => {
              const now = Date.now();
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Easing function for smooth animation
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              const current = Math.floor(startValue + (end - startValue) * easeOutQuart);

              setCount(current);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCount(end);
              }
            };

            animate();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [end, duration, hasAnimated]);

  return { count, ref };
};

const StatCard = ({ stat, delay }: { stat: StatItem; delay: number }) => {
  const { count, ref } = useCountUp(stat.value, 2000);

  return (
    <div
      ref={ref}
      className="text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
        <span>{count.toLocaleString()}</span>
        {stat.suffix && (
          <span className="text-green-600 dark:text-green-500">{stat.suffix}</span>
        )}
      </h3>
      <div className="text-base text-gray-600 dark:text-gray-300">{stat.label}</div>
    </div>
  );
};

const Stats = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
