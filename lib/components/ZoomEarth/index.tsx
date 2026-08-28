import type { Storm } from "@/lib/types";
import { ExternalLink } from "lucide-react";

const zoomEarthUrl = (name: string, year: number): string =>
  `https://zoom.earth/storms/${name.trim().toLowerCase().replace(/\s+/g, "-")}-${year}/`;

const ZoomEarth = ({ storm }: { storm: Storm }) => (
  <a
    href={zoomEarthUrl(storm.name, storm.year)}
    target="_blank"
    rel="noopener noreferrer"
    title={`View ${storm.name} ${storm.year} on Zoom Earth`}
    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
  >
    Zoom Earth
    <ExternalLink size={12} />
  </a>
);

export default ZoomEarth;
