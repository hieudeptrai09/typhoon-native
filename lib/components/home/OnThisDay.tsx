"use client";

import { fetchOnThisDay } from "@/be/actions/home";
import type { OnThisDayStorm } from "@/be/api/getOnThisDay";
import TyphoonSpinner from "@/lib/components/common/TyphoonSpinner";
import { INTENSITY_LABEL, MONTH_NAMES, TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/constants";
import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { App, Button } from "antd";
import Link from "next/link";
import { useState } from "react";

const EXTERNAL_POSITIONS = [141, 142, 143];

const getReasonIcon = (storm: OnThisDayStorm): { icon: IconName; color: string; label: string } => {
  const isExternal = EXTERNAL_POSITIONS.includes(storm.position);
  if (isExternal) {
    if (storm.reason === "both") {
      return {
        icon: "refresh",
        color: "#d97706",
        label: "Entered and exited the West Pacific basin",
      };
    }
    return storm.reason === "started"
      ? { icon: "log-in-outline", color: "#16a34a", label: "Entered the West Pacific basin" }
      : { icon: "log-out-outline", color: "#dc2626", label: "Exited the West Pacific basin" };
  }
  if (storm.reason === "both") {
    return { icon: "refresh", color: "#d97706", label: "Formed and dissipated" };
  }
  return storm.reason === "started"
    ? { icon: "play", color: "#16a34a", label: "Formed" }
    : { icon: "stop", color: "#dc2626", label: "Dissipated" };
};

const getVerb = (storm: OnThisDayStorm) => {
  const isExternal = EXTERNAL_POSITIONS.includes(storm.position);
  if (isExternal) {
    return storm.reason === "both"
      ? "entered and later exited the West Pacific basin or dissipated"
      : storm.reason === "started"
        ? "entered the West Pacific basin"
        : "exited the West Pacific basin or dissipated";
  }
  return storm.reason === "both"
    ? "formed and dissipated"
    : storm.reason === "started"
      ? "formed"
      : "dissipated";
};

const getEventYear = (storm: OnThisDayStorm) => {
  const date = storm.reason === "ended" ? storm.dateEnd : storm.dateStart;
  return date ? Number(date.slice(0, 4)) : storm.year;
};

const OnThisDay = () => {
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();

  const fetchStorms = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const storms = await fetchOnThisDay(today.getDate(), today.getMonth() + 1);

      if (storms.length === 0) {
        modal.info({
          title: "On this day",
          icon: null,
          centered: true,
          okText: "Got it",
          content: <p className="text-foreground">No storms formed or dissipated on this day.</p>,
        });
        return;
      }

      const dateStr = `${MONTH_NAMES[today.getMonth() + 1]} ${today.getDate()}`;

      modal.info({
        title: "On this day",
        icon: null,
        centered: true,
        okText: "Got it",
        content: (
          <div className="max-h-[70vh] overflow-y-auto">
            <p className="mb-3 text-sm font-semibold text-foreground">{dateStr}</p>
            <ul className="m-0 list-none space-y-1.5 p-0">
              {storms.map((storm, i) => {
                const eventYear = getEventYear(storm);
                const label = INTENSITY_LABEL[storm.intensity];
                const color = TEXT_COLOR_WHITE_BACKGROUND[storm.intensity];
                const verb = getVerb(storm);
                const {
                  icon: reasonIcon,
                  color: reasonColor,
                  label: reasonLabel,
                } = getReasonIcon(storm);

                return (
                  <li
                    key={i}
                    className="flex items-baseline gap-1.5 text-sm leading-relaxed text-foreground"
                  >
                    <Ionicons
                      name={reasonIcon}
                      size={14}
                      color={reasonColor}
                      aria-label={reasonLabel}
                    />
                    <span>
                      {eventYear}: {label}{" "}
                      <Link
                        href={`/info/${encodeURIComponent(storm.name.toLowerCase())}`}
                        className="font-bold"
                        style={{ color }}
                      >
                        {storm.name}
                      </Link>{" "}
                      {verb}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ),
      });
    } catch {
      modal.info({
        title: "Oops!",
        icon: null,
        centered: true,
        okText: "Close",
        content: <p className="text-foreground">Could not load storms for this day.</p>,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="text"
      icon={
        loading ? (
          <TyphoonSpinner colorClass="text-amber-700" size="small" />
        ) : (
          <Ionicons name="calendar-outline" size={16} color="#b45309" />
        )
      }
      onClick={fetchStorms}
      disabled={loading}
      className="w-full! justify-start! text-sm! font-semibold! text-amber-700! hover:text-amber-800!"
    >
      On this day
    </Button>
  );
};

export default OnThisDay;
