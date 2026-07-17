export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface BuyerProfileModel {
  id: string;
  userId: string;
  displayName: string;
  defaultAddressId?: string;
}

export interface UserModel {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string;
  image?: string;
}

export interface AddressModel {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}
