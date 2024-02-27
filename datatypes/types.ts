import React from "react";

export interface MenuItem {
  label: string;
  IconComponent: React.ElementType; // Using React.ElementType to accept a component type
  action: () => void;
}