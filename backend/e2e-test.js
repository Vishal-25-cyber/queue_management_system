/**
 * E2E API Integration Test Script — v2 (Corrected Routes)
 * Tests all major flows: Auth, Departments, Doctors, Patients, Appointments, Queue, Reports
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let patientToken = '';
let patientId = '';
let doctorId = '';
let appointmentId = '';

const PASS = '✅';
const FAIL = '❌';
const INFO = 'ℹ️ ';

let passed = 0;
let failed = 0;

// ─── HTTP Helper ───────────────────────────────────────────────────────────────
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, data: raw }); }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function check(label, condition, info = '') {
  if (condition) {
    console.log(`  ${PASS} ${label}${info ? ' — ' + info : ''}`);
    passed++;
  } else {
    console.log(`  ${FAIL} ${label}${info ? ' — ' + info : ''}`);
    failed++;
  }
}

async function run() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('   🏥  Hospital Queue Management System — API E2E Test Suite v2');
  console.log('══════════════════════════════════════════════════════════════\n');

  // 1. Health Check
  console.log('► 1. Health Check');
  const health = await request('GET', '/api/health');
  check('Server is reachable', health.status === 200, health.data?.message);

  // 2. Admin Login
  console.log('\n► 2. Admin Login');
  const adminLogin = await request('POST', '/api/auth/login', { email: 'admin@hospital.com', password: 'Admin@123' });
  check('Admin login succeeds (200)', adminLogin.status === 200 && !!adminLogin.data?.token);
  check('Admin role = admin', adminLogin.data?.user?.role === 'admin');
  adminToken = adminLogin.data?.token || '';

  // 3. List Departments
  console.log('\n► 3. Departments');
  const deptList = await request('GET', '/api/departments', null, adminToken);
  check('GET /api/departments → 200', deptList.status === 200);
  check('Returns departments array', Array.isArray(deptList.data?.departments));
  console.log(`  ${INFO} ${deptList.data?.departments?.length || 0} departments seeded`);

  // 4. Create Department (Ophthalmology)
  console.log('\n► 4. Create New Department');
  const newDept = await request('POST', '/api/departments', {
    name: 'Ophthalmology', description: 'Eye care and visual wellness.'
  }, adminToken);
  if (newDept.status === 201) {
    check('POST /api/departments → 201 Created', true, 'Ophthalmology created');
  } else if (newDept.status === 400 && String(newDept.data?.message).includes('already exists')) {
    check('Ophthalmology already exists (graceful duplicate)', true);
  } else {
    check('Create department failed', false, JSON.stringify(newDept.data));
  }

  // 5. List Doctors
  console.log('\n► 5. Doctors');
  const doctorList = await request('GET', '/api/doctors', null, adminToken);
  check('GET /api/doctors → 200', doctorList.status === 200);
  check('Returns doctors array', Array.isArray(doctorList.data?.doctors));
  console.log(`  ${INFO} ${doctorList.data?.doctors?.length || 0} doctors in system`);
  if (doctorList.data?.doctors?.length > 0) {
    doctorId = doctorList.data.doctors[0]._id;
    console.log(`  ${INFO} Using → ${doctorList.data.doctors[0].name} (ID: ${doctorId})`);
  }

  // 6. Admin Dashboard Stats
  console.log('\n► 6. Admin Dashboard Stats');
  const dashboard = await request('GET', '/api/admin/dashboard', null, adminToken);
  check('GET /api/admin/dashboard → 200', dashboard.status === 200);
  check('Stats object returned', !!dashboard.data?.stats);
  if (dashboard.data?.stats) {
    const s = dashboard.data.stats;
    console.log(`  ${INFO} Patients: ${s.totalPatients}, Doctors: ${s.totalDoctors}, Departments: ${s.totalDepartments || 'N/A'}`);
  }

  // 7. Admin Queue Status
  console.log('\n► 7. Admin Queue Status');
  const queueStatus = await request('GET', '/api/admin/queue-status', null, adminToken);
  check('GET /api/admin/queue-status → 200', queueStatus.status === 200);
  check('Returns queueData array', Array.isArray(queueStatus.data?.queueData));
  console.log(`  ${INFO} Active queues: ${queueStatus.data?.queueData?.length || 0} doctors with queues`);

  // 8. Patient Registration (includes confirmPassword)
  console.log('\n► 8. Patient Registration');
  const regEmail = `e2e_${Date.now()}@test.com`;
  const reg = await request('POST', '/api/auth/register', {
    name: 'E2E Test Patient',
    email: regEmail,
    password: 'password123',
    confirmPassword: 'password123',
    phone: '9111222333',
  });
  check('POST /api/auth/register → 201', reg.status === 201, reg.data?.message);
  // Registration returns token in this version — the UI discards it and redirects to login
  check('Success response received', reg.data?.success === true);

  // 9. Patient Login
  console.log('\n► 9. Patient Login');
  const patLogin = await request('POST', '/api/auth/login', { email: regEmail, password: 'password123' });
  check('POST /api/auth/login → 200', patLogin.status === 200 && !!patLogin.data?.token);
  check('User role = patient', patLogin.data?.user?.role === 'patient');
  patientToken = patLogin.data?.token || '';
  patientId = patLogin.data?.user?.id || '';
  console.log(`  ${INFO} Patient ID: ${patientId}`);

  // 10. Get Current User (me)
  console.log('\n► 10. Get Current User (me)');
  const me = await request('GET', '/api/auth/me', null, patientToken);
  check('GET /api/auth/me → 200', me.status === 200);
  check('User data returned', !!me.data?.user);

  // 11. Book Appointment (POST /api/appointments)
  console.log('\n► 11. Patient Books Appointment');
  if (doctorId && patientToken) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    // Rotate slots to avoid duplicate slot collision across test runs
    const SLOTS = ['09:00 AM','09:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','04:00 PM'];
    const slot = SLOTS[new Date().getMinutes() % SLOTS.length];
    const apptRes = await request('POST', '/api/appointments', {
      doctorId,
      appointmentDate: dateStr,
      timeSlot: slot,
      symptoms: 'Blurry vision in left eye',
    }, patientToken);
    check('POST /api/appointments → 201', apptRes.status === 201, apptRes.data?.message);
    appointmentId = apptRes.data?.appointment?._id;
    console.log(`  ${INFO} Appointment ID: ${appointmentId}`);
  } else {
    console.log(`  ⚠️  Skipped (no doctor or patient token)`);
  }

  // 12. Get My Appointments
  console.log('\n► 12. Patient Gets My Appointments');
  const myAppts = await request('GET', '/api/appointments', null, patientToken);
  check('GET /api/appointments → 200', myAppts.status === 200);
  check('Returns appointments array', Array.isArray(myAppts.data?.appointments));
  console.log(`  ${INFO} Patient has ${myAppts.data?.appointments?.length || 0} appointment(s)`);

  // 13. Admin Lists All Appointments
  console.log('\n► 13. Admin Lists All Appointments');
  const adminAppts = await request('GET', '/api/appointments/admin', null, adminToken);
  check('GET /api/appointments/admin → 200', adminAppts.status === 200);
  check('Returns appointments array', Array.isArray(adminAppts.data?.appointments));
  console.log(`  ${INFO} Total appointments in system: ${adminAppts.data?.appointments?.length || 0}`);

  // 14. Admin Approves Appointment
  if (appointmentId) {
    console.log('\n► 14. Admin Approves Appointment');
    const approve = await request('PUT', `/api/appointments/admin/${appointmentId}/approve`, {}, adminToken);
    check(`PUT /api/appointments/admin/${appointmentId}/approve → 200`, approve.status === 200, approve.data?.message);
  }

  // 15. Reports API
  console.log('\n► 15. Report Endpoints (Admin only)');
  const rptPatients = await request('GET', '/api/admin/reports/patients', null, adminToken);
  check('GET /api/admin/reports/patients → 200', rptPatients.status === 200, `${rptPatients.data?.reportData?.length || 0} records`);

  const rptAppts = await request('GET', '/api/admin/reports/appointments', null, adminToken);
  check('GET /api/admin/reports/appointments → 200', rptAppts.status === 200, `${rptAppts.data?.reportData?.length || 0} records`);

  const rptQueues = await request('GET', '/api/admin/reports/queues', null, adminToken);
  check('GET /api/admin/reports/queues → 200', rptQueues.status === 200, `${rptQueues.data?.reportData?.length || 0} records`);

  const rptDoctors = await request('GET', '/api/admin/reports/doctors', null, adminToken);
  check('GET /api/admin/reports/doctors → 200', rptDoctors.status === 200, `${rptDoctors.data?.reportData?.length || 0} records`);

  // 16. Notifications API
  console.log('\n► 16. Notifications API');
  const notifs = await request('GET', '/api/notifications', null, patientToken);
  check('GET /api/notifications → 200', notifs.status === 200);
  check('Returns notifications array', Array.isArray(notifs.data?.notifications));
  console.log(`  ${INFO} Patient has ${notifs.data?.notifications?.length || 0} notification(s)`);

  // 17. Patient Books a Direct Queue Token
  console.log('\n► 17. Patient Books Direct Queue Token');
  if (doctorId && patientToken) {
    const tokenRes = await request('POST', '/api/patients/book-token', { doctorId }, patientToken);
    check('POST /api/patients/book-token → 201', tokenRes.status === 201, tokenRes.data?.message);
    if (tokenRes.data?.token) {
      console.log(`  ${INFO} Token #${tokenRes.data.token.tokenNumber} — Queue position: ${tokenRes.data.token.queuePosition}`);
    }
  } else {
    console.log(`  ⚠️  Skipped`);
  }

  // 18. Get Patient's Current Token
  console.log('\n► 18. Patient Gets Active Token Status');
  const myToken = await request('GET', '/api/patients/my-token', null, patientToken);
  check('GET /api/patients/my-token → 200', myToken.status === 200);
  if (myToken.data?.token) {
    console.log(`  ${INFO} Token #${myToken.data.token.tokenNumber}, Status: ${myToken.data.token.status}`);
  }

  // 19. Admin Patient Management
  console.log('\n► 19. Admin Patient Management');
  const patMgmt = await request('GET', '/api/admin/patients', null, adminToken);
  check('GET /api/admin/patients → 200', patMgmt.status === 200);
  console.log(`  ${INFO} System has ${patMgmt.data?.patients?.length || patMgmt.data?.total || 0} patient records`);

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`   📊  Results: ${PASS} ${passed} passed   ${FAIL} ${failed} failed   out of ${passed + failed} checks`);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (failed === 0) {
    console.log('🎉  ALL TESTS PASSED! System is fully operational.\n');
  } else {
    console.log(`⚠️   ${failed} test(s) need attention — see results above.\n`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

run().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
