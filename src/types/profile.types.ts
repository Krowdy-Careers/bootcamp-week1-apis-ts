import { DateModel, } from './common.types';

export interface ProfileType extends DateModel {
  linkedinUrl?: string;
  docNumber?: string;
  firstName?: string;
  lastName?: string;
  educations?: any;
  experiences?: any;
  userId?: string;
  isActive? : boolean;
}

export interface BackgroundNew {
  firstName? : string;
  lastName?: string;
  educations?: any;
  experiences?: any;
  userId?: string;
}
