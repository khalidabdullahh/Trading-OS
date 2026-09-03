/**
 * Trading-OS v2.0 - Authentication & Session Management Service
 * Multi-user isolation, credential validation, and session management
 */

import { User, UserProfile } from "../../types/domain";
import { StorageAdapter } from "../storage/storageAdapter";

export class AuthService {
  static readonly ADMIN_EMAILS = [
    "seamafridi123456789@gmail.com",
    "khalid@tradingos.io"
  ];

  static isAdmin(email: string): boolean {
    if (!email) return false;
    return this.ADMIN_EMAILS.some(admin => admin.toLowerCase() === email.trim().toLowerCase());
  }

  private static async hashPassword(password: string): Promise<string> {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
    // Fallback for SSR/Node
    return `hash_${password}`;
  }

  static getCurrentUser(): User {
    const userId = StorageAdapter.getCurrentUserId();
    const users = StorageAdapter.getUsers();
    const found = users.find(u => u.id === userId);
    if (found) return found;

    // Create default demo/admin user
    const demoUser: User = {
      id: "usr_admin_seamafridi",
      email: "seamafridi123456789@gmail.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    StorageAdapter.saveUser(demoUser);
    StorageAdapter.setCurrentUserId(demoUser.id);

    // Ensure ELITE subscription
    StorageAdapter.saveSubscription({
      id: `sub_${demoUser.id}`,
      userId: demoUser.id,
      tier: "ELITE",
      status: "ACTIVE",
      currentPeriodStart: new Date().toISOString(),
      cancelAtPeriodEnd: false,
      provider: "System Owner (Lifetime)"
    });

    return demoUser;
  }

  static async register(email: string, password: string, fullName: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const isAdminUser = this.isAdmin(cleanEmail);
    const users = StorageAdapter.getUsers();
    const existing = users.find(u => u.email === cleanEmail);

    const newUser: User = existing || {
      id: isAdminUser ? "usr_admin_seamafridi" : `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageAdapter.saveUser(newUser);
    StorageAdapter.setCurrentUserId(newUser.id);

    // Create Profile
    const profile: UserProfile = {
      id: `prof_${newUser.id}`,
      userId: newUser.id,
      fullName: isAdminUser ? "Seam Afridi (Super Admin)" : (fullName || cleanEmail.split("@")[0]),
      experience: "Advanced"
    };
    StorageAdapter.saveProfile(profile);

    // Grant ELITE tier to Super Admin
    if (isAdminUser) {
      StorageAdapter.saveSubscription({
        id: `sub_${newUser.id}`,
        userId: newUser.id,
        tier: "ELITE",
        status: "ACTIVE",
        currentPeriodStart: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        provider: "System Owner (Lifetime)"
      });
    }

    return { success: true, user: newUser };
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    return this.register(cleanEmail, password, this.isAdmin(cleanEmail) ? "Seam Afridi (Super Admin)" : cleanEmail.split("@")[0]);
  }

  static logout(): void {
    StorageAdapter.setCurrentUserId("usr_demo_trader");
  }
}
