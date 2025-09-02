import { supabase } from "./supabaseClient"

export async function fetchIsAdmin(): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      return false;
    }
    
    const { data, error } = await supabase.rpc("is_admin");
    
    if (error) {
      console.error("is_admin RPC error:", error);
      return false;
    }
    
    return Boolean(data);
  } catch (e) {
    console.error("fetchIsAdmin error:", e);
    return false;
  }
}
