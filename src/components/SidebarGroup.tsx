import { ReactNode } from 'react';

type SidebarGroupProps = {
  title: string;
  children: ReactNode;
};

export function SidebarGroup({ title, children }: SidebarGroupProps) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div className="sidebar-group-title">{title}</div>
      {children}
    </div>
  );
}
