import type { IconName } from "@/lib/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Empty } from "antd";
import type { ReactNode } from "react";

const EmptyResults = ({
  description = "No typhoon names match your current filters. Try adjusting your search criteria.",
  icon = "funnel-outline",
  action,
}: {
  description?: string;
  icon?: IconName;
  action?: ReactNode;
}) => {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <Empty
        image={<Ionicons name={icon} size={64} color="#9ca3af" />}
        imageStyle={{ height: 64, display: "flex", justifyContent: "center" }}
        description={<span className="text-foreground">{description}</span>}
      >
        {action}
      </Empty>
    </div>
  );
};

export default EmptyResults;
