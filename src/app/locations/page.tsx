import Link from "next/link";
import { locations } from "@/lib/mock-data";
import { LocationCard } from "@/components/LocationCard";

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-surface-0 px-6 py-10">
      <h1 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.3px] text-ink mb-6">
        观测地点
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Link key={location.id} href={`/locations/${location.id}`}>
            <LocationCard location={location} />
          </Link>
        ))}
      </div>
    </main>
  );
}
