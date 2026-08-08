import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization, Shop, Role, PlatformAdmin } from '../../core/types';
import { getRepositories, getServices } from '../../infrastructure/config';

interface AuthState {
  user: User | null;
  currentOrganization: Organization | null;
  currentShop: Shop | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminUser: PlatformAdmin | null;
  isAdminAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signUpWithPhone: (phone: string, pin: string) => Promise<void>;
  signInWithPhone: (phone: string, pin: string) => Promise<void>;
  signInAdminWithEmail: (email: string, pin: string) => Promise<boolean>;
  logout: () => void;
  selectOrganization: (orgId: string) => Promise<void>;
  selectShop: (shopId: string) => Promise<void>;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    currentOrganization: null,
    currentShop: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
    adminUser: null,
    isAdminAuthenticated: false,
  });

  const repos = getRepositories();
  const services = getServices();

  const handleUserSession = async (userId: string, email: string) => {
    let user = await repos.users.findById(userId);
    if (!user) {
      user = await repos.users.create({ id: userId, email, name: email.split('@')[0], phone: '' });
    }

    let orgToSelect: Organization | null = null;
    let shopToSelect: Shop | null = null;
    let roleToSet: Role | null = null;

    const pendingOrgName = localStorage.getItem('boutika_pending_org_name');

    if (pendingOrgName) {
      try {
        // Create org directly instead of using missing RPC
        orgToSelect = await repos.organizations.create({
          name: pendingOrgName,
          ownerId: user.id,
          planTier: 'starter',
          settings: {}
        });
        
        // Create default shop
        shopToSelect = await repos.shops.create({
          organizationId: orgToSelect.id,
          name: 'Boutique Principale',
          address: ''
        });

        // Add user as owner in organization_members
        await repos.organizationMembers.create({
          organizationId: orgToSelect.id,
          userId: user.id,
          role: 'owner'
        });

        localStorage.removeItem('boutika_pending_org_name');
        roleToSet = 'owner';
      } catch (err) {
        console.error("Failed to create org", err);
      }
    } else {
      let handledByInvitation = false;
      if (user.phone) {
        try {
          const invitations = await repos.invitations.findByPhone(user.phone);
          const pendingInvite = invitations.find(i => i.status === 'pending');
          if (pendingInvite) {
            await repos.organizationMembers.create({
              organizationId: pendingInvite.organizationId,
              userId: user.id,
              role: pendingInvite.role as Role
            });
            await repos.invitations.updateStatus(pendingInvite.organizationId, pendingInvite.id, 'accepted');
            
            const firstOrg = await repos.organizations.findById(pendingInvite.organizationId);
            if (firstOrg) {
              orgToSelect = firstOrg;
              roleToSet = pendingInvite.role as Role;
              const shops = await repos.shops.findAllByOrganization(firstOrg.id);
              if (shops.length > 0) shopToSelect = shops[0];
            }
            handledByInvitation = true;
          }
        } catch (err) {
          console.error("Failed to process invitation", err);
        }
      }

      if (!handledByInvitation) {
        // Login flow: Fetch organizations for user
        if (email === 'zetsufried@gmail.com') {
          const mockOrg1 = await repos.organizations.findById('org1');
          if (mockOrg1) {
            orgToSelect = mockOrg1;
            roleToSet = 'owner';
            const shops = await repos.shops.findAllByOrganization('org1');
            if (shops.length > 0) shopToSelect = shops[0];
          }
        } else {
          const members = await repos.organizationMembers.findByUserId(user.id);
          if (members.length > 0) {
            const firstOrg = await repos.organizations.findById(members[0].organizationId);
            if (firstOrg) {
              orgToSelect = firstOrg;
              roleToSet = members[0].role;
              const shops = await repos.shops.findAllByOrganization(firstOrg.id);
              if (shops.length > 0) shopToSelect = shops[0];
            }
          } else {
            // Fallback for users created before organization_members was implemented
            // or if local storage has a saved org
            const savedOrgId = localStorage.getItem('boutika_org_id');
            if (savedOrgId) {
              const org = await repos.organizations.findById(savedOrgId).catch(() => null);
              if (org && org.ownerId === user.id) {
                orgToSelect = org;
                roleToSet = 'owner';
                const shops = await repos.shops.findAllByOrganization(org.id);
                if (shops.length > 0) shopToSelect = shops[0];
              }
            }
            
            if (!orgToSelect) {
              const allOrgs = await repos.organizations.findAll();
              const owned = allOrgs.filter((o: any) => o.ownerId === user.id);
              if (owned.length > 0) {
                orgToSelect = owned[0];
                roleToSet = 'owner';
                const shops = await repos.shops.findAllByOrganization(owned[0].id);
                if (shops.length > 0) shopToSelect = shops[0];
                
                // Heal the data
                try {
                  await repos.organizationMembers.create({
                    organizationId: owned[0].id,
                    userId: user.id,
                    role: 'owner'
                  });
                } catch (e) {
                  // ignore
                }
              }
            }
          }
        }
      }
    }

    localStorage.setItem('boutika_user_id', user.id);
    if (orgToSelect) localStorage.setItem('boutika_org_id', orgToSelect.id);
    if (shopToSelect) localStorage.setItem('boutika_shop_id', shopToSelect.id);

    setState(prev => ({ 
      ...prev, 
      user: user!, 
      isAuthenticated: true,
      currentOrganization: orgToSelect,
      currentShop: shopToSelect,
      role: roleToSet,
      isLoading: false
    }));
  };

  useEffect(() => {
    const unsubscribe = repos.auth.onAuthStateChange(async (event, userId) => {
      if (event === 'SIGNED_OUT') {
        logout();
        return;
      }

      if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') {
        return;
      }

      if (userId) {
        try {
          const authUser = await repos.auth.getCurrentUser();
          if (authUser) {
            // Check if admin (by email or specific phone number)
            if (authUser.email === 'koudjomawugnayajohnson@gmail.com' || authUser.phone === '+22383362944' || authUser.phone === '22383362944') {
               // Create admin record if it doesn't exist yet
               let admin = await repos.platformAdmins.findByUserId(userId).catch(() => null);
               if (!admin) {
                 // For now, let's just set the state if it's the right email/phone
                 admin = { userId, role: 'super_admin' };
               }
               localStorage.setItem('boutika_admin_id', admin.userId);
               setState(prev => ({ ...prev, adminUser: admin, isAdminAuthenticated: true }));
            }
            await handleUserSession(authUser.id, authUser.email || '');
          }
        } catch (error) {
          console.error("Failed to authenticate user during state change:", error);
          // If JWT expired, clear session
          logout();
        }
      }
    });

    // In a real app, verify token from local storage here
    const savedUserId = localStorage.getItem('boutika_user_id');
    if (savedUserId) {
      repos.users.findById(savedUserId).then(async user => {
        if (user) {
          let orgToSelect: Organization | null = null;
          let shopToSelect: Shop | null = null;
          let roleToSet: Role | null = null;
          
          const savedOrgId = localStorage.getItem('boutika_org_id');
          const savedShopId = localStorage.getItem('boutika_shop_id');

          if (savedOrgId) {
            const org = await repos.organizations.findById(savedOrgId).catch(() => null);
            if (org) {
              orgToSelect = org;
              roleToSet = org.ownerId === user.id ? 'owner' : 'member'; // Simplified role check
              if (savedShopId) {
                const shop = await repos.shops.findById(org.id, savedShopId).catch(() => null);
                if (shop) shopToSelect = shop;
              }
            }
          }

          // Basic logic fallback if no saved org id
          if (!orgToSelect) {
            try {
              const members = await repos.organizationMembers.findByUserId(user.id);
              if (members.length > 0) {
                const firstOrg = await repos.organizations.findById(members[0].organizationId);
                if (firstOrg) {
                  orgToSelect = firstOrg;
                  roleToSet = members[0].role;
                  const shops = await repos.shops.findAllByOrganization(firstOrg.id);
                  if (shops.length > 0) shopToSelect = shops[0];
                }
              } else {
                const allOrgs = await repos.organizations.findAll();
                const owned = allOrgs.filter((o: any) => o.ownerId === user.id);
                if (owned.length > 0) {
                  orgToSelect = owned[0];
                  roleToSet = 'owner';
                  const shops = await repos.shops.findAllByOrganization(owned[0].id);
                  if (shops.length > 0) shopToSelect = shops[0];
                }
              }
            } catch (err) {
              console.error('Error fetching fallback org:', err);
            }
          }

          setState(prev => ({ 
            ...prev, 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            currentOrganization: orgToSelect,
            currentShop: shopToSelect,
            role: roleToSet
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }).catch(err => {
        console.error('Error fetching user:', err);
        setState(prev => ({ ...prev, isLoading: false }));
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }

    // Load admin user
    const savedAdminId = localStorage.getItem('boutika_admin_id');
    if (savedAdminId) {
      repos.platformAdmins.findByUserId(savedAdminId).then(admin => {
        if (admin) {
          setState(prev => ({ ...prev, adminUser: admin, isAdminAuthenticated: true }));
        }
      }).catch(err => {
        console.error('Error fetching admin:', err);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signUpWithPhone = async (phone: string, pin: string) => {
    const user = await repos.auth.signUpWithPhone(phone, pin);
    // When signUp is done without confirm phone, the user is automatically signed in
    // onAuthStateChange will handle the rest
    setState(prev => ({ ...prev, isLocked: false }));
  };

  const signInWithPhone = async (phone: string, pin: string) => {
    const user = await repos.auth.signInWithPhone(phone, pin);
    // onAuthStateChange will handle the rest
    setState(prev => ({ ...prev, isLocked: false }));
  };

  const logout = () => {
    repos.auth.logout();
    localStorage.removeItem('boutika_user_id');
    localStorage.removeItem('boutika_org_id');
    localStorage.removeItem('boutika_shop_id');
    localStorage.removeItem('boutika_admin_id');
    localStorage.removeItem('boutika_mock_admin_otp');
    setState({
      user: null,
      currentOrganization: null,
      currentShop: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      adminUser: null,
      isAdminAuthenticated: false,
    });
    window.location.href = '/';
  };

  const selectOrganization = async (orgId: string) => {
    if (!state.user) return;
    
    if (!orgId) {
      setState(prev => ({ ...prev, currentOrganization: null, currentShop: null, role: null }));
      return;
    }

    const org = await repos.organizations.findById(orgId);
    if (!org) throw new Error("Organization not found");

    const members = await repos.organizationMembers.findByUserId(state.user.id);
    const member = members.find(m => m.organizationId === orgId);
    
    if (org.ownerId === state.user.id) {
      setState(prev => ({ ...prev, currentOrganization: org, role: 'owner' }));
    } else if (member) {
      setState(prev => ({ ...prev, currentOrganization: org, role: member.role }));
    } else {
      throw new Error("Access denied to this organization");
    }
  };

  const selectShop = async (shopId: string) => {
    if (!state.user || !state.currentOrganization) return;
    
    if (!shopId) {
      setState(prev => ({ ...prev, currentShop: null }));
      return;
    }

    const shop = await repos.shops.findById(state.currentOrganization.id, shopId);
    if (!shop) throw new Error("Shop not found");

    if (state.role === 'owner' || state.role === 'admin') {
      setState(prev => ({ ...prev, currentShop: shop }));
    } else {
      // For members, verify shop staff assignment
      const staffAssignments = await repos.shopStaff.findByUserId(state.user.id);
      const isAssigned = staffAssignments.some(s => s.shopId === shopId);
      if (isAssigned) {
        setState(prev => ({ ...prev, currentShop: shop }));
      } else {
        throw new Error("Access denied to this shop");
      }
    }
  };

  const signInAdminWithEmail = async (email: string, pin: string) => {
    if (email !== 'koudjomawugnayajohnson@gmail.com') return false;
    
    try {
      const user = await repos.auth.signInAdminWithEmail(email, pin);
      if (user) {
        // Find platform admin record
        const admin = await repos.platformAdmins.findByUserId('u1'); // Usually we'd search by user.id but u1 is hardcoded for mock if necessary
        if (admin) {
          localStorage.setItem('boutika_admin_id', admin.userId);
          setState(prev => ({ ...prev, adminUser: admin, isAdminAuthenticated: true }));
          return true;
        } else {
           // Create missing admin record for the user if they login with correct email
           const newAdmin = { userId: user.id, role: 'super_admin' as Role };
           localStorage.setItem('boutika_admin_id', newAdmin.userId);
           setState(prev => ({ ...prev, adminUser: newAdmin as PlatformAdmin, isAdminAuthenticated: true }));
           return true;
        }
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  };



  const logoutAdmin = () => {
    localStorage.removeItem('boutika_admin_id');
    localStorage.removeItem('boutika_mock_admin_otp');
    setState(prev => ({ ...prev, adminUser: null, isAdminAuthenticated: false }));
  };

  return (
    <AuthContext.Provider value={{ ...state, signUpWithPhone, signInWithPhone, signInAdminWithEmail, logout, selectOrganization, selectShop, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
