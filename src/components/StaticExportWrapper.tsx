
"use client";

import React, { useState, useEffect } from 'react';

type StaticExportWrapperProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const StaticExportWrapper: React.FC<StaticExportWrapperProps> = ({ children, fallback = null }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default StaticExportWrapper;
