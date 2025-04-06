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

export const CardHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-4 border-b">{children}</div>;
};

export const CardTitle = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-lg font-bold">{children}</h2>;
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
