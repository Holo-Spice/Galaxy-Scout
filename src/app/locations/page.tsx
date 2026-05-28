"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { locations } from "@/lib/mock-data";
import { LocationCard } from "@/components/LocationCard";
import { staggerContainer, staggerItem } from "@/lib/animation";

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-surface-0 px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-[24px] font-semibold leading-[1.3] tracking-[-0.3px] text-ink mb-6"
      >
        观测地点
      </motion.h1>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {locations.map((location) => (
          <motion.div key={location.id} variants={staggerItem}>
            <Link href={`/locations/${location.id}`}>
              <LocationCard location={location} />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
