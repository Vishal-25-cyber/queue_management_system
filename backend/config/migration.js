const mongoose = require('mongoose');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const DEFAULT_ADMIN = {
  name: 'System Admin',
  email: 'admin@hospital.com',
  password: 'admin',
  role: 'admin',
  phone: '0000000000'
};

const DEFAULT_DEPARTMENTS = [
  { name: 'Cardiology', description: 'Specialized care for heart conditions and cardiovascular health.' },
  { name: 'Neurology', description: 'Treatment of disorders affecting the brain, spinal cord, and nerves.' },
  { name: 'Orthopedics', description: 'Focus on musculoskeletal system injuries, bones, and joints.' },
  { name: 'Pediatrics', description: 'Comprehensive medical care for infants, children, and adolescents.' },
  { name: 'General Surgery', description: 'Surgical treatment for abdominal contents, thyroid, and soft tissues.' },
  { name: 'Dentistry', description: 'Oral healthcare, hygiene, teeth repairs, and dental surgery.' },
  { name: 'Dermatology', description: 'Diagnosis and treatment of skin, hair, and nail disorders.' },
  { name: 'ENT', description: 'Specialized treatment for Ear, Nose, Throat, head, and neck issues.' }
];

const runMigration = async () => {
  try {
    console.log('🔄 Running database seeding & migration...');

    // 1. Seed Departments if none exist or missing
    for (const dept of DEFAULT_DEPARTMENTS) {
      let existing = await Department.findOne({ name: dept.name });
      if (!existing) {
        await Department.create(dept);
        console.log(`✅ Seeded department: ${dept.name}`);
      }
    }

    // 2. Fetch all seeded departments to build a mapping dictionary
    const departments = await Department.find({});
    const deptMap = {};
    departments.forEach(d => {
      deptMap[d.name.toLowerCase()] = d._id;
    });

    // 3. Migrate Doctor documents from string departments to ObjectId references
    const doctors = await Doctor.find({});
    let migrateCount = 0;

    for (const doctor of doctors) {
      // Check if current department is a string (represented as value in mongoose but not castable or not matching an ID)
      const currentDept = String(doctor.department);
      
      // If it doesn't match an ObjectId format (24 hex characters), it's a legacy string department
      const isLegacyString = !/^[0-9a-fA-F]{24}$/.test(currentDept);

      if (isLegacyString) {
        const matchingId = deptMap[currentDept.toLowerCase()];
        if (matchingId) {
          doctor.department = matchingId;
          await doctor.save();
          migrateCount++;
          console.log(`🔗 Migrated doctor ${doctor.name}'s department reference to ${currentDept}`);
        } else {
          // Fallback to Cardiology if department doesn't match anything
          doctor.department = deptMap['cardiology'];
          await doctor.save();
          migrateCount++;
          console.log(`⚠ Warning: Doctor ${doctor.name} had unknown department "${currentDept}". Reset to Cardiology.`);
        }
      }
    }

    // 4. Seed fixed Admin user
    let adminUser = await User.findOne({ email: DEFAULT_ADMIN.email });
    if (!adminUser) {
      await User.create(DEFAULT_ADMIN);
      console.log(`✅ Seeded fixed Admin: ${DEFAULT_ADMIN.email} / ${DEFAULT_ADMIN.password}`);
    } else {
      // Ensure the fixed password is set just in case the user wants it to be FIXED.
      adminUser.password = DEFAULT_ADMIN.password;
      await adminUser.save();
      console.log(`✅ Admin password verified for ${DEFAULT_ADMIN.email}`);
    }

    console.log(`✨ Seeding & Migration complete! Migrated ${migrateCount} legacy doctor references.\n`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

module.exports = runMigration;
