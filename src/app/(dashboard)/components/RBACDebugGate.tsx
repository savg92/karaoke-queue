"use client";

import { useProfileRole } from "@/lib/hooks/useRBAC";
import { RBACDebug } from "@/components/RBACDebug";

export function RBACDebugGate() {
    const { data: profileRole, isLoading } = useProfileRole();
    if (isLoading) return null;
    if (profileRole !== 'SUPER_ADMIN') return null;
    return <RBACDebug />;
}
