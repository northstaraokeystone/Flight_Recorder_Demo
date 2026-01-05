/**
 * DataViewLayout - §CONSTRAINT-LAYOUT
 * Shared layout component for all data screens (Screens 2-5)
 * Ensures consistent structure across the application
 */

import React from 'react';

interface DataViewLayoutProps {
  header?: React.ReactNode;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  bottomSection?: React.ReactNode;
}

export function DataViewLayout({
  header,
  leftPanel,
  rightPanel,
  bottomSection,
}: DataViewLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 animate-fadeIn">
      <div className="w-full max-w-6xl min-w-[1000px]">
        {/* Header */}
        {header && <div className="mb-6">{header}</div>}

        {/* Data Row - THE DOMINANT SECTION (60-65% of space) */}
        <div className="flex gap-6 min-h-[320px]">
          {/* Left Panel - 40-50% width */}
          <div className="flex-1 min-w-[400px] min-h-[280px]">
            {leftPanel}
          </div>

          {/* Right Panel - 50-60% width */}
          <div className="flex-1 min-w-[450px] min-h-[320px]">
            {rightPanel}
          </div>
        </div>

        {/* Bottom Section - flexible height for violation panels */}
        {bottomSection && (
          <div className="mt-6">
            {bottomSection}
          </div>
        )}
      </div>
    </div>
  );
}
