import React from "react";

interface MenuItem {
  label: string;
  IconComponent: React.ElementType;
  action: () => void;
}

export default MenuItem;