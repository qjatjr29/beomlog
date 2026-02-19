import { getStatusText } from "@/data/storage/setting.storage";
import { supabase } from "@/lib/supabase";
import { createContext, useContext, useState, ReactNode } from "react";

interface AdminContextType {
  isAdminMode: boolean;
  adminPassword: string;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const login = async (password: string): Promise<boolean> => {
    const { error } = await supabase.rpc("set_status_text", {
      p_text: await getStatusText(),
      p_password: password,
    });

    if (error?.message.includes("unauthorized")) {
      return false;
    }

    setIsAdminMode(true);
    setAdminPassword(password);
    return true;
  };

  const logout = () => {
    setIsAdminMode(false);
    setAdminPassword("");
  };
  return (
    <AdminContext.Provider
      value={{ isAdminMode, adminPassword, login, logout }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};
