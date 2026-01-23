import { useUser } from "@clerk/nextjs";

export const UserGreeting = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-700">
        Welcome, {user?.firstName || user?.username || "User"}
      </span>
    </div>
  );
};
