export type IdType = 'CC' | 'TI' | 'CE' | 'PAS';

export interface AccountProfile {
  uid: string;
  firstName: string;
  lastName: string;
  idType: IdType;
  idNumber: string;
  country: string;
  email: string;
  registeredAt: number;
  biometricEnabled?: boolean;
  fcmToken?: string;
}
