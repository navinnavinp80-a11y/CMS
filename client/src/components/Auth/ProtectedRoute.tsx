import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guards all authenticated CMS routes.
 * If user is not authenticated or their token has expired/invalid,
 * clears credentials and redirects to /login with the intended destination preserved.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, checkTokenValidity } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !checkTokenValidity()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

interface PublicOnlyRouteProps {
  children: ReactNode;
}

/**
 * Guards authentication pages like /login and /signup.
 * If the user already holds a valid authenticated session,
 * redirects them to the Dashboard instead of showing the login/signup form.
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, checkTokenValidity } = useAuth();
  const location = useLocation();

  if (isAuthenticated && checkTokenValidity()) {
    const fromPath = (location.state as any)?.from?.pathname;
    const intendedPath = fromPath && fromPath !== "/" && fromPath !== "/login" ? fromPath : "/dashboard";
    return <Navigate to={intendedPath} replace />;
  }

  return <>{children}</>;
}
