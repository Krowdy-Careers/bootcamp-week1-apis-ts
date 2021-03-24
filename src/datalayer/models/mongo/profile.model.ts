import mongoose, { Schema, } from 'mongoose';

import { ProfileType, } from 'types/profile.types';

const {
  Types: { ObjectId, },
} = Schema;

const ProfileSchema = new Schema({
  createdBy  : { type: ObjectId, },
  docNumber  : { type: String, },
  firstName  : { type: String, },
  isActive   : { type: Boolean, },
  lastName   : { type: String, },
  linkedinUrl: { type: String, },
}, {
  timestamps: true,
});

const ProfileModel = mongoose.model<ProfileType & mongoose.Document>(
  'Profile',
  ProfileSchema
);
export default ProfileModel;
