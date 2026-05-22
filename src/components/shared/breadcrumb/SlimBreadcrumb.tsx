import { Link } from 'react-router';
import { Icon } from '@iconify/react';

interface BreadcrumbItem {
  title: string;
  to?: string;
}

interface SlimBreadcrumbProps {
  title: string;
  items?: BreadcrumbItem[];
}

const SlimBreadcrumb = ({ title, items = [] }: SlimBreadcrumbProps) => {
  console.log(title)
  return (
    <div className="flex items-center justify-between mb-2">

      {/* Title */}

      {/* Breadcrumb trail */}
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
                >
                  {item.title}
                </Link>
              ) : (
                <span className={`text-sm ${isLast ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {item.title}
                </span>
              )}
              {!isLast && (
                <Icon
                  icon="tabler:chevron-right"
                  width={14}
                  className="text-muted-foreground shrink-0"
                />
              )}
            </li>
          );
        })}
      </ol>

    </div>
  );
};

export default SlimBreadcrumb;