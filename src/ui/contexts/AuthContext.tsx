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
  requestPhoneOtp: (phone: string) => Promise<boolean>;
  login: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  selectOrganization: (orgId: string) => Promise<void>;
  selectShop: (shopId: string) => Promise<void>;
  requestAdminOtp: (email: string) => Promise<boolean>;
  loginAdmin: (email: string, otp: string) => Promise<boolean>;
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

  useEffect(() => {
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
            const org = await repos.organizations.findById(savedOrgId);
            if (org) {
              orgToSelect = org;
              roleToSet = org.ownerId === user.id ? 'owner' : 'member'; // Simplified role check
              if (savedShopId) {
                const shop = await repos.shops.findById(org.id, savedShopId);
                if (shop) shopToSelect = shop;
              }
            }
          }

          // Basic mock logic fallback
          if (!orgToSelect) {
            const mockOrg1 = await repos.organizations.findById('org1');
            if (mockOrg1 && mockOrg1.ownerId === user.id) {
              orgToSelect = mockOrg1;
              roleToSet = 'owner';
              const shops = await repos.shops.findAllByOrganization('org1');
              if (shops.length > 0) shopToSelect = shops[0];
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
      });
    }
  }, []);

  const requestPhoneOtp = async (phone: string) => {
    return await repos.auth.requestPhoneOtp(phone);
  };

  const login = async (phone: string, otp: string) => {
    const verifiedUser = await repos.auth.verifyPhoneOtp(phone, otp);
    if (!verifiedUser) return false;

    let user = await repos.users.findById(verifiedUser.id);
    let isNew = false;
    if (!user) {
      // In real app, the backend might have created the user, 
      // but in mock we might need to handle it. 
      // For now, if we have an ID from verify, we should fetch it or create it locally.
      user = await repos.users.create({ id: verifiedUser.id, phone } as any);
      isNew = true;
    }

    let orgToSelect: Organization | null = null;
    let shopToSelect: Shop | null = null;
    let roleToSet: Role | null = null;

    if (isNew) {
      // Auto-create for demo purposes
      orgToSelect = await repos.organizations.create({
        name: `Org de ${phone}`,
        ownerId: user.id,
        planTier: 'starter',
        settings: {}
      });
      shopToSelect = await repos.shops.create({
        organizationId: orgToSelect.id,
        name: `Boutique de ${phone}`
      });
      roleToSet = 'owner';
    } else {
      // Try to find an existing org
      // For mock simplicity, we just use the first org where ownerId === user.id
      // (Since we can't query all orgs easily without a method, we assume org1 for demo if it matches)
      const mockOrg1 = await repos.organizations.findById('org1');
      if (mockOrg1 && mockOrg1.ownerId === user.id) {
        orgToSelect = mockOrg1;
        roleToSet = 'owner';
        const shops = await repos.shops.findAllByOrganization('org1');
        if (shops.length > 0) shopToSelect = shops[0];
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
      role: roleToSet
    }));
    return true;
  };

  const logout = () => {
    localStorage.removeItem('boutika_user_id');
    localStorage.removeItem('boutika_org_id');
    localStorage.removeItem('boutika_shop_id');
    setState({
      user: null,
      currentOrganization: null,
      currentShop: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const selectOrganization = async (orgId: string) => {
    if (!state.user) return;
    
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

  const requestAdminOtp = async (email: string) => {
    if (email !== 'koudjomawugnayajohnson@gmail.com') {
      throw new Error("Email non autorisé");
    }
    // Generate a mock OTP
    const mockOtp = "123456";
    // Actually send it (will just console.log in MockMailerService)
    await services.mailer.sendAdminOtp(email, mockOtp);
    // In a real app we would store it server-side temporarily.
    // For this mock, we will just expect "123456" in loginAdmin.
    localStorage.setItem('boutika_mock_admin_otp', mockOtp);
    return true;
  };

  const loginAdmin = async (email: string, otp: string) => {
    if (email !== 'koudjomawugnayajohnson@gmail.com') return false;
    
    const expectedOtp = localStorage.getItem('boutika_mock_admin_otp') || "123456";
    if (otp !== expectedOtp) return false;

    // Hardcode matching to the existing 'u1' which is an admin in MockDatabase
    const admin = await repos.platformAdmins.findByUserId('u1');
    if (admin) {
      localStorage.setItem('boutika_admin_id', admin.userId);
      setState(prev => ({ ...prev, adminUser: admin, isAdminAuthenticated: true }));
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('boutika_admin_id');
    localStorage.removeItem('boutika_mock_admin_otp');
    setState(prev => ({ ...prev, adminUser: null, isAdminAuthenticated: false }));
  };

  return (
    <AuthContext.Provider value={{ ...state, requestPhoneOtp, login, logout, selectOrganization, selectShop, requestAdminOtp, loginAdmin, logoutAdmin }}>
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
