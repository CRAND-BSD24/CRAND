import React from "react";

export const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`rounded-lg shadow-md bg-white ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ 
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`p-4 border-b ${className || ''}`}>{children}</div>;
};

export const CardTitle = ({ 
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <h2 className={`text-lg font-bold ${className || ''}`}>{children}</h2>;
};

export const CardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export const CardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p className={`text-sm text-gray-500 ${className || ""}`}>{children}</p>
  );
};
