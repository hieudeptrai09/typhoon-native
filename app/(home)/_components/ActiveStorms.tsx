"use client";

import TyphoonSpinner from "@/lib/components/TyphoonSpinner";
import { INTENSITY_LABEL } from "@/lib/constants";
import type { ActiveOnThisDayStorm } from "@/lib/db/api/getActiveOnThisDay";
import { TEXT_COLOR_WHITE_BACKGROUND } from "@/lib/utils/colors";
import { formatStormDateRange } from "@/lib/utils/date";
import { App, Button } from "antd";
import { Waves } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { fetchActiveOnThisDay } from "../_actions";

type ActiveStorm = ActiveOnThisDayStorm;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Local-midnight Date from "YYYY-MM-DD", so day math matches the user's clock.
const parseLocalDate = (date: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const groupBySeasonYear = (storms: ActiveStorm[]): [number, ActiveStorm[]][] => {
  const groups = new Map<number, ActiveStorm[]>();

  for (const storm of storms) {
    const group = groups.get(storm.year);
    if (group) group.push(storm);
    else groups.set(storm.year, [storm]);
  }

  return [...groups.entries()].sort(([a], [b]) => a - b);
};

const getDayProgress = (storm: ActiveStorm) => {
  const startDate = parseLocalDate(storm.dateStart);
  const today = new Date();

  // An ongoing storm has no end date: count real days since it formed.
  if (!storm.dateEnd) {
    const dayOfStorm = Math.round((today.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
    return { dayOfStorm, totalDays: null };
  }

  const endDate = parseLocalDate(storm.dateEnd);
  const todayMonth = today.getMonth() + 1;
  const anniversaryYear =
    todayMonth >= startDate.getMonth() + 1 ? startDate.getFullYear() : endDate.getFullYear();
  const anniversaryDate = new Date(anniversaryYear, todayMonth - 1, today.getDate());

  const dayOfStorm = Math.round((anniversaryDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
  return { dayOfStorm, totalDays };
};

const ActiveStorms = () => {
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();

  const fetchStorms = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const storms = await fetchActiveOnThisDay(today.getDate(), today.getMonth() + 1);

      if (storms.length === 0) {
        modal.info({
          title: "Active on this day",
          icon: null,
          centered: true,
          okText: "Got it",
          content: (
            <p className="text-foreground">No storms were active on this date in past years.</p>
          ),
        });
        return;
      }

      modal.info({
        title: "Active on this day",
        icon: null,
        centered: true,
        okText: "Got it",
        content: (
          <div className="max-h-[70vh] overflow-y-auto">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Storms that were in progress on this date in past years
            </p>
            <div className="space-y-3">
              {groupBySeasonYear(storms).map(([year, yearStorms]) => (
                <div key={year}>
                  <p className="m-0 mb-1 text-sm font-bold text-foreground">{year}</p>
                  <ol className="m-0 list-decimal list-outside space-y-1.5 pl-8">
                    {yearStorms.map((storm, i) => {
                      const label = INTENSITY_LABEL[storm.intensity];
                      const color = TEXT_COLOR_WHITE_BACKGROUND[storm.intensity];
                      const range = formatStormDateRange(
                        storm.dateStart,
                        storm.dateEnd ?? undefined,
                      );
                      const { dayOfStorm, totalDays } = getDayProgress(storm);

                      return (
                        <li key={i} className="text-sm leading-relaxed text-foreground">
                          {label}{" "}
                          <Link
                            href={`/info/${encodeURIComponent(storm.name.toLowerCase())}`}
                            className="font-bold"
                            style={{ color }}
                          >
                            {storm.name}
                          </Link>
                          <span className="text-foreground"> ({range})</span>
                          <br />
                          <span className="text-sm text-foreground">
                            Day{" "}
                            {totalDays !== null ? (
                              <>
                                <span className="font-semibold">{dayOfStorm}</span>/
                                <span className="font-semibold">{totalDays}</span>
                              </>
                            ) : (
                              <span className="font-semibold">{dayOfStorm}</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    } catch {
      modal.info({
        title: "Oops!",
        icon: null,
        centered: true,
        okText: "Close",
        content: <p className="text-foreground">Could not load active storms.</p>,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="text"
      icon={
        loading ? <TyphoonSpinner colorClass="text-amber-700" size="small" /> : <Waves size={16} />
      }
      onClick={fetchStorms}
      disabled={loading}
      className="w-full! justify-start! text-sm! font-semibold! text-amber-700! hover:text-amber-800!"
    >
      Active on this day
    </Button>
  );
};

export default ActiveStorms;
