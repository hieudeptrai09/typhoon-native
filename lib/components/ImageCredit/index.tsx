import type { ImageCredit as ImageCreditType } from "@/lib/types";
import { Copyright } from "lucide-react";

interface ImageCreditProps {
  credit?: ImageCreditType;
  position?: "top" | "bottom";
  align?: "start" | "center" | "end";
}

const alignClass = { start: "", center: "justify-center", end: "justify-end" } as const;

const ImageCredit = ({ credit, position = "bottom", align = "start" }: ImageCreditProps) => {
  if (!credit?.author) return null;

  const { author, license, licenseUrl, sourceUrl } = credit;
  const linkClass = "text-gray-400! hover:underline";
  const spacing = position === "top" ? "mb-1.5" : "mt-1.5";

  return (
    <div className="@container">
      <p
        className={`flex items-center gap-1 text-[11px] leading-relaxed text-gray-400 @md:w-48 ${alignClass[align]} ${spacing} `}
        title={`${author}${license ? `, ${license}` : ""}`}
      >
        <Copyright className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={linkClass}
            >
              {author}
            </a>
          ) : (
            author
          )}
          {license && (
            <>
              {", "}
              {licenseUrl ? (
                <a
                  href={licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow license"
                  className={linkClass}
                >
                  {license}
                </a>
              ) : (
                license
              )}
            </>
          )}
        </span>
      </p>
    </div>
  );
};

export default ImageCredit;
