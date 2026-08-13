"use client";

import { fetchRandomFact } from "@/be/actions/home";
import TyphoonSpinner from "@/lib/components/common/TyphoonSpinner";
import Ionicons from "@expo/vector-icons/Ionicons";
import { App, Button } from "antd";
import { useState } from "react";

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
      icon={
        loading ? (
          <TyphoonSpinner size="small" colorClass="text-amber-700" />
        ) : (
          <Ionicons name="bulb-outline" size={16} color="#b45309" />
        )
      }
      onClick={showFact}
      disabled={loading}
      className="w-full! justify-start! text-sm! font-semibold! text-amber-700! hover:text-amber-800!"
    >
      Useless Facts
    </Button>
  );
};

export default FunFacts;
