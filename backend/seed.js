/**
 * Seed Script — Creates default admin user and sample doctors
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const User = require('./models/User');
const Doctor = require('./models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/queue-management';

const sampleDoctors = [
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@hospital.com',
    password: 'Doctor@123',
    phone: '9876543210',
    department: 'Cardiology',
    qualifications: 'MBBS, MD (Cardiology)',
    experience: 15,
    consultationFee: 800,
    bio: 'Specialist in interventional cardiology with 15+ years of experience.',
    rating: 4.8,
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@hospital.com',
    password: 'Doctor@123',
    phone: '9876543211',
    department: 'Pediatrics',
    qualifications: 'MBBS, DCH, MD (Pediatrics)',
    experience: 10,
    consultationFee: 600,
    bio: 'Dedicated pediatrician focused on child health and development.',
    rating: 4.9,
  },
  {
    name: 'Dr. Amit Patel',
    email: 'amit.patel@hospital.com',
    password: 'Doctor@123',
    phone: '9876543212',
    department: 'Orthopedics',
    qualifications: 'MBBS, MS (Orthopedics)',
    experience: 12,
    consultationFee: 700,
    bio: 'Expert in joint replacement and sports injuries.',
    rating: 4.7,
  },
  {
    name: 'Dr. Sunita Reddy',
    email: 'sunita.reddy@hospital.com',
    password: 'Doctor@123',
    phone: '9876543213',
    department: 'Neurology',
    qualifications: 'MBBS, DM (Neurology)',
    experience: 8,
    consultationFee: 900,
    bio: 'Specializes in stroke management and epilepsy treatment.',
    rating: 4.6,
  },
  {
    name: 'Dr. Vikram Singh',
    email: 'vikram.singh@hospital.com',
    password: 'Doctor@123',
    phone: '9876543214',
    department: 'General Surgery',
    qualifications: 'MBBS, MS (General Surgery)',
    experience: 20,
    consultationFee: 750,
    bio: 'Senior surgeon with expertise in laparoscopic procedures.',
    rating: 4.9,
  },
];

async function seed() {
  try {
    console.log('\n🌱 Starting seed process...');
    console.log(`📡 Connecting to: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // --- Create Admin User ---
    const adminEmail = 'admin@hospital.com';
    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      console.log('ℹ️  Admin user already exists — skipping creation.');
    } else {
      adminUser = await User.create({
        name: 'Hospital Admin',
        email: adminEmail,
        password: 'Admin@123',
        phone: '9000000000',
        role: 'admin',
      });
      console.log('✅ Admin user created!');
      console.log('   📧 Email   : admin@hospital.com');
      console.log('   🔑 Password: Admin@123');
    }

    // --- Create Sample Patient ---
    const patientEmail = 'patient@hospital.com';
    let patientUser = await User.findOne({ email: patientEmail });

    if (patientUser) {
      console.log('ℹ️  Patient user already exists — skipping creation.');
    } else {
      patientUser = await User.create({
        name: 'John Doe',
        email: patientEmail,
        password: 'Patient@123',
        phone: '9876543222',
        role: 'patient',
      });
      console.log('✅ Patient user created!');
      console.log('   📧 Email   : patient@hospital.com');
      console.log('   🔑 Password: Patient@123');
    }

    // --- Create Sample Doctors ---
    console.log('\n👨‍⚕️  Creating sample doctors...\n');

    for (const doc of sampleDoctors) {
      const existing = await User.findOne({ email: doc.email });

      if (existing) {
        console.log(`   ⚠️  ${doc.name} already exists — skipping.`);
        continue;
      }

      // Create user account
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password,
        phone: doc.phone,
        role: 'doctor',
      });

      // Create doctor profile
      await Doctor.create({
        userId: user._id,
        name: doc.name,
        department: doc.department,
        qualifications: doc.qualifications,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        bio: doc.bio,
        rating: doc.rating,
        isActive: true,
      });

      console.log(`   ✅ ${doc.name} — ${doc.department}`);
    }

    console.log('\n' + '='.repeat(55));
    console.log('🎉 Seed completed successfully!');
    console.log('='.repeat(55));
    console.log('\n📋 Login Credentials:');
    console.log('   🔐 Admin   → admin@hospital.com / Admin@123');
    console.log('   🩺 Doctors → [email above] / Doctor@123');
    console.log('   👤 Patient → patient@hospital.com / Patient@123\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
