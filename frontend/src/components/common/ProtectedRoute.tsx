import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresMembership?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresMembership = false 
}) => {
  const { user, loading, checkMembership } = useAuth();
  const [membershipChecked, setMembershipChecked] = useState(!requiresMembership);
  const [hasMembership, setHasMembership] = useState(false);

  useEffect(() => {
    const verifyMembership = async () => {
      if (user && requiresMembership) {
        const status = await checkMembership();
        setHasMembership(status);
        setMembershipChecked(true);
      }
    };

    if (requiresMembership && user) {
      verifyMembership();
    }
  }, [user, requiresMembership, checkMembership]);

  if (loading || (requiresMembership && !membershipChecked)) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiresMembership && !hasMembership) {
    return <Navigate to="/membership" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
