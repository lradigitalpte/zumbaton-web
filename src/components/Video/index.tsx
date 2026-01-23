"use client";

import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

export default function Video() {
  return (
    <section className="relative z-10 py-16 md:py-20 lg:py-28">
      {/* Background geometry (tinted green, softer so text stays sharp) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-[url(/images/video/shape.svg)] bg-cover bg-center bg-no-repeat opacity-40"
          style={{ filter: "hue-rotate(110deg) saturate(1.2)" }}
        />
      </div>

      <div className="container relative z-10">
        <SectionTitle
          title="Feel the Zumba Energy"
          paragraph="See the rhythm, color, and community that make our sessions so much fun. One minute of real class energy — imagine yourself dancing with us. One beat. One step. One happy you."
          center
          mb="80px"
        />
      </div>
      <div className="relative overflow-hidden">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[770px] overflow-hidden rounded-2xl shadow-2xl border border-white/30 bg-white/60 backdrop-blur">
              <div className="relative aspect-[16/9] items-center justify-center">
                <Image
                  src="/images/landing1.jfif"
                  alt="Zumba dance session"
                  className="object-cover"
                  fill
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/25 to-transparent" />
                <div className="absolute top-0 right-0 flex h-full w-full items-center justify-center">
                  <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-white/90 text-green-600 shadow-lg">
                    <svg
                      width="16"
                      height="18"
                      viewBox="0 0 16 18"
                      className="fill-current"
                    >
                      <path d="M15.5 8.13397C16.1667 8.51888 16.1667 9.48112 15.5 9.86602L2 17.6603C1.33333 18.0452 0.499999 17.564 0.499999 16.7942L0.5 1.20577C0.5 0.43597 1.33333 -0.0451549 2 0.339745L15.5 8.13397Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
