import { ReactNode, useMemo } from 'react';
import { usePermission } from './usePermission';

interface Props {
  module: string;
  action?: string;        // single action
  actions?: string[];     // multiple actions (ANY match)
  fallback?: ReactNode;
  children: ReactNode;
}

const Can = ({
  module,
  action,
  actions,
  fallback = null,
  children,
}: Props) => {
  const { can, canAccess, isLoaded } = usePermission();

  const allowed = useMemo(() => {
    if (!isLoaded) return false;

    // ✅ MULTIPLE ACTIONS (ANY)
    if (actions && actions.length > 0) {
      return actions.some((a) => can(module, a));
    }

    // ✅ SINGLE ACTION
    if (action) {
      return can(module, action);
    }

    // ✅ MODULE LEVEL (fallback to view)
    return canAccess(module);
  }, [module, action, actions, can, canAccess, isLoaded]);

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
};

export default Can;