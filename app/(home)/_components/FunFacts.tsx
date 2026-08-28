"use client";

import TyphoonSpinner from "@/lib/components/TyphoonSpinner";
import { App, Button } from "antd";
import { Lightbulb } from "lucide-react";
import { useState } from "react";
import { fetchRandomFact } from "../_actions";

const FunFacts = () => {
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();

  const showFact = async () => {
    setLoading(true);
    try {
      const fact = await fetchRandomFact();

      modal.info({
        title: "Did you know?",
        icon: null,
        centered: true,
        okText: "Got it",
        content: <p className="leading-relaxed text-foreground">{fact ?? "No facts available."}</p>,
      });
    } catch {
      modal.info({
        title: "Oops!",
        icon: null,
        centered: true,
        okText: "Close",
        content: <p className="text-foreground">Could not load fact.</p>,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="text"
      aria-label="Show a random typhoon fact"
      title="Useless facts"
      icon={
        loading ? (
          <TyphoonSpinner size="small" colorClass="text-amber-700" />
        ) : (
          <Lightbulb size={20} />
        )
      }
      onClick={showFact}
      disabled={loading}
      className="h-11! w-11! shrink-0! rounded-lg! border! border-amber-600/70! text-amber-700! hover:bg-amber-50!"
    />
  );
};

export default FunFacts;
