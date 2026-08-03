import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { data: authUser, isPending } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  if (isPending) {
    return <Loading />;
  }

  // ❌ Not logged in
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in
  return <Outlet />;
};

export default ProtectedRoute;
