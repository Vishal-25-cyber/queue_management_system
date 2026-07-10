#!/usr/bin/env node

/**
 * Complete Setup Verification Script
 * Run this before starting the application
 */

const path = require('path');
const fs = require('fs');

console.log('\n🔍 Hospital Queue Management System - Setup Verification\n');
console.log('=' .repeat(60));

// Check Node version
console.log('\n✓ Checking Node.js version...');
const nodeVersion = process.version;
console.log(`  Node.js: ${nodeVersion}`);

if (parseInt(nodeVersion.split('.')[0].substring(1)) < 14) {
  console.error('  ✗ Node.js 14+ required!');
  process.exit(1);
}
console.log('  ✓ Node.js version OK');

// Check npm packages
console.log('\n✓ Checking npm packages...');
const requiredPackages = [
  'express',
  'mongoose',
  'jsonwebtoken',
  'bcryptjs',
  'cors',
  'dotenv',
  'socket.io',
];

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const installed = Object.keys(packageJson.dependencies || {});

  requiredPackages.forEach(pkg => {
    if (installed.includes(pkg)) {
      const version = packageJson.dependencies[pkg];
      console.log(`  ✓ ${pkg}: ${version}`);
    } else {
      console.warn(`  ✗ ${pkg}: NOT INSTALLED`);
    }
  });
} else {
  console.log('  ⚠ package.json not found. Run: npm install');
}

// Check .env file
console.log('\n✓ Checking environment configuration...');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  const envVars = env.split('\n').filter(line => line && !line.startsWith('#'));

  console.log(`  ✓ .env file found with ${envVars.length} variables:`);

  if (env.includes('MONGODB_URI')) {
    const uri = env.split('\n').find(line => line.startsWith('MONGODB_URI'));
    console.log(`  ✓ MONGODB_URI configured`);

    if (uri.includes('localhost')) {
      console.log('    → Using local MongoDB (ensure mongod is running)');
    } else if (uri.includes('mongodb+srv')) {
      console.log('    → Using MongoDB Atlas (cloud)');
    }
  } else {
    console.warn('  ✗ MONGODB_URI not configured!');
  }

  if (env.includes('JWT_SECRET')) {
    console.log('  ✓ JWT_SECRET configured');
  }

  if (env.includes('PORT')) {
    console.log('  ✓ PORT configured');
  }
} else {
  console.error('  ✗ .env file not found!');
  console.log('  Run: cp .env.example .env');
  console.log('  Then edit .env with your MongoDB URI');
}

// Check required directories
console.log('\n✓ Checking directory structure...');
const requiredDirs = [
  'config',
  'controllers',
  'middleware',
  'models',
  'routes',
  'socket',
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(path.join(__dirname, dir))) {
    console.log(`  ✓ ${dir}/`);
  } else {
    console.error(`  ✗ ${dir}/ - MISSING`);
  }
});

// Check required models
console.log('\n✓ Checking database models...');
const requiredModels = ['User.js', 'Doctor.js', 'Token.js', 'Appointment.js'];

requiredModels.forEach(model => {
  if (fs.existsSync(path.join(__dirname, 'models', model))) {
    console.log(`  ✓ ${model}`);
  } else {
    console.error(`  ✗ ${model} - MISSING`);
  }
});

// Check required controllers
console.log('\n✓ Checking controllers...');
const requiredControllers = [
  'authController.js',
  'doctorController.js',
  'patientController.js',
  'adminController.js',
];

requiredControllers.forEach(controller => {
  if (fs.existsSync(path.join(__dirname, 'controllers', controller))) {
    console.log(`  ✓ ${controller}`);
  } else {
    console.error(`  ✗ ${controller} - MISSING`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n✨ Setup verification complete!\n');

console.log('📋 Next Steps:');
console.log('1. Ensure MongoDB is running (local or Atlas)');
console.log('2. Verify MONGODB_URI in .env file');
console.log('3. Run: npm run dev');
console.log('\n');
