interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  className?: string;
}

/**
 * PageHeader - Consistent page header component
 * Used for displaying page titles with optional subtitle and icon
 */
export function PageHeader({ 
  title, 
  subtitle, 
  icon = "👋",
  className = "" 
}: PageHeaderProps) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h1 className="text-4xl font-bold text-accent mb-2">
        {title} {icon}
      </h1>
      {subtitle && (
        <p className="text-lg text-gray-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}

