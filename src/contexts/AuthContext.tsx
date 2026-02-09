import React, { createContext, useContext, useState, ReactNode } from "react";
import { tenants, warehouses, users } from "@/data/mockData";

interface AuthState {
  isAuthenticated: boolean;
  currentUser: typeof users[0] | null;
  currentTenantId: string | null;
  currentWarehouseId: string | null;
  tokenExpiry: string;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  selectTenant: (tenantId: string) => void;
  selectWarehouse: (warehouseId: string) => void;
  getTenantName: () => string;
  getWarehouseName: () => string;
  getUserTenants: () => typeof tenants;
  getUserWarehouses: () => typeof warehouses;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    currentTenantId: null,
    currentWarehouseId: null,
    tokenExpiry: "",
  });

  const signIn = (email: string, _password: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setState({
        isAuthenticated: true,
        currentUser: user,
        currentTenantId: user.tenants.length === 1 ? user.tenants[0] : null,
        currentWarehouseId: null,
        tokenExpiry: new Date(Date.now() + 3600000).toISOString(),
      });
      return true;
    }
    return false;
  };

  const signOut = () => setState({ isAuthenticated: false, currentUser: null, currentTenantId: null, currentWarehouseId: null, tokenExpiry: "" });

  const selectTenant = (tenantId: string) => setState(s => ({ ...s, currentTenantId: tenantId, currentWarehouseId: null }));
  const selectWarehouse = (warehouseId: string) => setState(s => ({ ...s, currentWarehouseId: warehouseId }));

  const getTenantName = () => tenants.find(t => t.id === state.currentTenantId)?.name ?? "";
  const getWarehouseName = () => warehouses.find(w => w.id === state.currentWarehouseId)?.name ?? "";
  const getUserTenants = () => tenants.filter(t => state.currentUser?.tenants.includes(t.id));
  const getUserWarehouses = () => warehouses.filter(w => w.tenantId === state.currentTenantId && state.currentUser?.warehouses.includes(w.id));

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, selectTenant, selectWarehouse, getTenantName, getWarehouseName, getUserTenants, getUserWarehouses }}>
      {children}
    </AuthContext.Provider>
  );
};
