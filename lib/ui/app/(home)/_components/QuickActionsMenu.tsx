"use client";

import SearchBar from "@/lib/components/SearchBar";
import { Button, Popover } from "antd";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import ActiveStorms from "./ActiveStorms";
import FunFacts from "./FunFacts";
import OnThisDay from "./OnThisDay";

const QuickActionsMenu = ({ allNames }: { allNames: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mb-4 flex w-full max-w-sm items-center gap-2">
      <div className="min-w-0 flex-1">
        <SearchBar variant="home" allNames={allNames} />
      </div>

      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger="click"
        placement="bottomRight"
        arrow={false}
        content={
          <div
            id="home-quick-actions-panel"
            role="menu"
            className="flex w-52 flex-col items-stretch gap-1"
          >
            <OnThisDay />
            <ActiveStorms />
            <FunFacts />
          </div>
        }
      >
        <Button
          type="text"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls="home-quick-actions-panel"
          aria-label={
            isOpen ? "Close discover menu" : "Discover: on this day, active storms, fun facts"
          }
          icon={isOpen ? <X size={20} /> : <Sparkles size={20} />}
          className="h-11! w-11! shrink-0! rounded-lg! border! border-amber-600/70! text-amber-700! hover:bg-amber-50!"
        />
      </Popover>
    </div>
  );
};

export default QuickActionsMenu;
