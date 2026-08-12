"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useRef, useState } from "react";

const ScrollEndFade = ({ children, className, ...rest }: ComponentPropsWithoutRef<"div">) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showEndFade, setShowEndFade] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const getScroller = (): HTMLElement | null =>
      wrapper.querySelector<HTMLElement>(
        "[data-scroll-container], .ant-table-content, .ant-table-body",
      );

    const update = () => {
      const scroller = getScroller();
      if (!scroller) {
        setShowEndFade(false);
        return;
      }
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      // fade only when scrollable AND not yet at the right end (1px tolerance)
      setShowEndFade(maxScroll > 1 && Math.ceil(scroller.scrollLeft) < maxScroll - 1);
    };

    update();

    // scroll doesn't bubble, but capture catches it from the inner scroller
    wrapper.addEventListener("scroll", update, { capture: true, passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    const scroller = getScroller();
    if (scroller) ro.observe(scroller);

    // rebind + recompute if the table subtree is replaced (e.g. filter/sort)
    const mo = new MutationObserver(() => {
      const next = getScroller();
      if (next) ro.observe(next);
      update();
    });
    mo.observe(wrapper, { childList: true, subtree: true });

    return () => {
      wrapper.removeEventListener("scroll", update, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ""}`} {...rest}>
      {children}
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-stone-100 to-transparent transition-opacity duration-200 md:hidden ${
          showEndFade ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
    </div>
  );
};

export default ScrollEndFade;
