const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  email: [{ type: String }],
  phone: { type: String },
  address: { type: String },
  linkedin: { type: String },
  locationLabel: { type: String },
  locationUrl: { type: String },
  linkedinName: { type: String },
  emailLabel: { type: String },
  phoneLabel: { type: String },
  linkedinLabel: { type: String },
  locationHeading: { type: String }
}, { _id: false });

const EducationSchema = new mongoose.Schema({
  level: { type: String, required: true },
  institution: { type: String, required: true },
  board: { type: String },
  year: { type: String },
  status: { type: String },
  certificateUrl: { type: String }
}, { _id: false });

const ExperienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  period: { type: String },
  duration: { type: String },
  outcome: { type: String },
  certificateUrl: { type: String }
}, { _id: false });

const SkillGroupSchema = new mongoose.Schema({
  group: { type: String, required: true },
  items: [{ type: String }]
}, { _id: false });

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  provider: { type: String },
  gotMark: { type: Number },
  totalMark: { type: Number },
  score: { type: Number },
  certificateUrl: { type: String }
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  photo: { type: String },
  objective: { type: String },
  heroRoles: [{ type: String }],
  heroTalkLabel: { type: String },
  contactTitle: { type: String },
  contactMessage: { type: String },
  contact: ContactSchema,
  education: [EducationSchema],
  experience: [ExperienceSchema],
  skills: [SkillGroupSchema],
  achievements: [AchievementSchema],
  strengths: [{ type: String }],
  hobbies: [{ type: String }],
  languages: [{ type: String }],
  nationality: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);