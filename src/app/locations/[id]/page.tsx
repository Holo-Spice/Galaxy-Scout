import { LocationDetailContent } from "@/components/LocationDetailContent";

export default function LocationPage({ params }: { params: { id: string } }) {
  return <LocationDetailContent id={params.id} />;
}
