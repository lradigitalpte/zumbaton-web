"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ClassesHeroProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const ClassesHero = ({ title = "Classes", breadcrumbs }: ClassesHeroProps) => {
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/explore" },
    { label: "Classes", href: "/classes" },
  ];
  const items = breadcrumbs ?? defaultBreadcrumbs;

  return (
    <section className="relative h-[50vh] min-h-[280px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero/hero.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container relative z-10 text-center"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          {title}
        </h1>
        <nav className="flex items-center justify-center gap-2 text-white/90 text-sm flex-wrap">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-green-400">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-green-400 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-green-400">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </motion.div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-dark to-transparent z-10" />
    </section>
  );
};

export default ClassesHero;
