// Authority and Role Management System
import { useMemo } from 'react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

// Define user roles clearly
export enum UserRole {
  CUSTOMER = 'customer',
  MARKETER = 'marketer', 
  ADMIN = 'admin'
}

// Define permissions for each role
export interface Permissions {
  // Course permissions
  canViewCourses: boolean;
  canPurchaseCourses: boolean;
  canAccessMyCourses: boolean;
  
  // Marketer permissions
  canCreateReferralCodes: boolean;
  canViewCommissions: boolean;
  canAccessMarketerPanel: boolean;
  
  // Admin permissions
  canManageUsers: boolean;
  canManageCourses: boolean;
  canViewAllCommissions: boolean;
  canAccessAdminPanel: boolean;
  
  // Profile permissions
  canEditProfile: boolean;
  canViewPurchaseHistory: boolean;
  canViewCertificates: boolean;
  canViewLearningProgress: boolean;
}

// Permission matrix for each role
const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  [UserRole.CUSTOMER]: {
    canViewCourses: true,
    canPurchaseCourses: true,
    canAccessMyCourses: true,
    canCreateReferralCodes: false,
    canViewCommissions: false,
    canAccessMarketerPanel: false,
    canManageUsers: false,
    canManageCourses: false,
    canViewAllCommissions: false,
    canAccessAdminPanel: false,
    canEditProfile: true,
    canViewPurchaseHistory: true,
    canViewCertificates: true,
    canViewLearningProgress: true,
  },
  
  [UserRole.MARKETER]: {
    canViewCourses: true,
    canPurchaseCourses: true,
    canAccessMyCourses: true,
    canCreateReferralCodes: true,
    canViewCommissions: true,
    canAccessMarketerPanel: true,
    canManageUsers: false,
    canManageCourses: false,
    canViewAllCommissions: false,
    canAccessAdminPanel: false,
    canEditProfile: true,
    canViewPurchaseHistory: true,
    canViewCertificates: true,
    canViewLearningProgress: true,
  },
  
  [UserRole.ADMIN]: {
    canViewCourses: true,
    canPurchaseCourses: true,
    canAccessMyCourses: true,
    canCreateReferralCodes: true,
    canViewCommissions: true,
    canAccessMarketerPanel: true,
    canManageUsers: true,
    canManageCourses: true,
    canViewAllCommissions: true,
    canAccessAdminPanel: true,
    canEditProfile: true,
    canViewPurchaseHistory: true,
    canViewCertificates: true,
    canViewLearningProgress: true,
  }
};

// Utility functions for role checking
export class AuthUtils {
  /**
   * Get user role from user object
   */
  static getUserRole(user: User | null): UserRole {
    if (!user) return UserRole.CUSTOMER;
    
    // Check admin first (highest priority)
    if (user.is_admin_user || user.user_type === 'admin') {
      return UserRole.ADMIN;
    }
    
    // Check marketer
    if (user.is_staff_member || user.user_type === 'staff') {
      return UserRole.MARKETER;
    }
    
    // Default to customer
    return UserRole.CUSTOMER;
  }

  /**
   * Get permissions for a user
   */
  static getPermissions(user: User | null): Permissions {
    const role = this.getUserRole(user);
    return ROLE_PERMISSIONS[role];
  }

  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: User | null, permission: keyof Permissions): boolean {
    const permissions = this.getPermissions(user);
    return permissions[permission];
  }

  /**
   * Check if user is a specific role
   */
  static isRole(user: User | null, role: UserRole): boolean {
    return this.getUserRole(user) === role;
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User | null): boolean {
    return this.isRole(user, UserRole.ADMIN);
  }

  /**
   * Check if user is marketer
   */
  static isMarketer(user: User | null): boolean {
    return this.isRole(user, UserRole.MARKETER);
  }

  /**
   * Check if user is customer
   */
  static isCustomer(user: User | null): boolean {
    return this.isRole(user, UserRole.CUSTOMER);
  }

  /**
   * Check if user is marketer or admin (for marketer panel access)
   */
  static canAccessMarketerFeatures(user: User | null): boolean {
    return this.isMarketer(user) || this.isAdmin(user);
  }

  /**
   * Check if user is admin (for admin panel access)
   */
  static canAccessAdminFeatures(user: User | null): boolean {
    return this.isAdmin(user);
  }

  /**
   * Get role display name in Persian
   */
  static getRoleDisplayName(user: User | null): string {
    const role = this.getUserRole(user);
    
    switch (role) {
      case UserRole.ADMIN:
        return 'مدیر';
      case UserRole.MARKETER:
        return 'بازاریاب';
      case UserRole.CUSTOMER:
        return 'مشتری';
      default:
        return 'نامشخص';
    }
  }

  /**
   * Get role color for UI
   */
  static getRoleColor(user: User | null): string {
    const role = this.getUserRole(user);
    
    switch (role) {
      case UserRole.ADMIN:
        return 'danger'; // Red for admin
      case UserRole.MARKETER:
        return 'warning'; // Orange for marketer
      case UserRole.CUSTOMER:
        return 'primary'; // Blue for customer
      default:
        return 'secondary';
    }
  }

  /**
   * Get role icon for UI
   */
  static getRoleIcon(user: User | null): string {
    const role = this.getUserRole(user);
    
    switch (role) {
      case UserRole.ADMIN:
        return 'fas fa-crown';
      case UserRole.MARKETER:
        return 'fas fa-users';
      case UserRole.CUSTOMER:
        return 'fas fa-user';
      default:
        return 'fas fa-question';
    }
  }
}

// Note: Higher-order components should be created in separate files
// This file contains only utility functions for authority management

// Hook for easy permission checking in components
export function usePermissions() {
  const { user } = useAuth();
  return AuthUtils.getPermissions(user);
}

// Hook for role checking
export function useRole() {
  const { user } = useAuth();
  
  return useMemo(() => ({
    role: AuthUtils.getUserRole(user),
    isAdmin: AuthUtils.isAdmin(user),
    isMarketer: AuthUtils.isMarketer(user),
    isCustomer: AuthUtils.isCustomer(user),
    canAccessMarketerFeatures: AuthUtils.canAccessMarketerFeatures(user),
    canAccessAdminFeatures: AuthUtils.canAccessAdminFeatures(user),
    roleDisplayName: AuthUtils.getRoleDisplayName(user),
    roleColor: AuthUtils.getRoleColor(user),
    roleIcon: AuthUtils.getRoleIcon(user),
  }), [user]);
}
