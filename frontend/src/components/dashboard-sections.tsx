"use client";

import { StaggerContainer, StaggerItem } from "@/components/stagger-container";

export function DashboardStagger({ children }: { children: React.ReactNode }) {
  return (
    <StaggerContainer>
      {children}
    </StaggerContainer>
  );
}

export { StaggerItem as DashboardSection };
