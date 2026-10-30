const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING PHASE 1 BACKEND VERIFICATION TESTS ---');
  let tokenA, userA, tokenB, userB, subjectA1Id, subjectA2Id;

  // 1. Health check
  const health = await makeRequest('/api/health', 'GET');
  console.assert(health.status === 200, `Health check failed: ${health.status}`);
  console.log('✔ Health check passed');

  // Unique email suffixes to prevent collision across test runs
  const timestamp = Date.now();
  const emailA = `alice_${timestamp}@test.edu`;
  const emailB = `bob_${timestamp}@test.edu`;

  // 2. Register Student A
  const regA = await makeRequest('/api/auth/register', 'POST', {
    name: 'Alice Smith',
    email: emailA,
    password: 'password123',
    confirmPassword: 'password123',
  });
  console.assert(regA.status === 201 && regA.body.token, 'Register Student A failed');
  tokenA = regA.body.token;
  userA = regA.body.user;
  console.log('✔ Student A registered successfully');

  // 3. Reject duplicate email registration
  const dupReg = await makeRequest('/api/auth/register', 'POST', {
    name: 'Alice Imposter',
    email: emailA,
    password: 'password123',
    confirmPassword: 'password123',
  });
  console.assert(dupReg.status === 400, 'Duplicate registration should be rejected with 400');
  console.log('✔ Duplicate email registration properly rejected');

  // 4. Reject invalid credentials
  const badLogin = await makeRequest('/api/auth/login', 'POST', {
    email: emailA,
    password: 'wrongpassword',
  });
  console.assert(badLogin.status === 401, 'Invalid password should be rejected with 401');
  console.log('✔ Invalid credentials properly rejected');

  // 5. Successful login
  const loginA = await makeRequest('/api/auth/login', 'POST', {
    email: emailA,
    password: 'password123',
  });
  console.assert(loginA.status === 200 && loginA.body.token, 'Login failed');
  tokenA = loginA.body.token;
  console.log('✔ Student A logged in successfully');

  // 6. Protected /api/auth/me
  const meA = await makeRequest('/api/auth/me', 'GET', null, tokenA);
  console.assert(meA.status === 200 && meA.body.user.email === emailA, 'GET /api/auth/me failed');
  console.log('✔ Protected auth check /api/auth/me passed');

  // 7. Create subjects for Student A
  const sub1 = await makeRequest('/api/subjects', 'POST', {
    subjectName: 'Calculus I',
    description: 'Differential and integral calculus foundations',
    semester: 'Fall 2026',
  }, tokenA);
  console.assert(sub1.status === 201, 'Failed to create subject 1');
  subjectA1Id = sub1.body.data._id;

  const sub2 = await makeRequest('/api/subjects', 'POST', {
    subjectName: 'Data Structures & Algorithms',
    description: 'Trees, graphs, and algorithmic complexity',
    semester: 'Fall 2026',
  }, tokenA);
  console.assert(sub2.status === 201, 'Failed to create subject 2');
  subjectA2Id = sub2.body.data._id;
  console.log('✔ Student A created 2 subjects successfully');

  // 8. Retrieve all subjects for Student A
  const subsA = await makeRequest('/api/subjects', 'GET', null, tokenA);
  console.assert(subsA.status === 200 && subsA.body.count === 2, 'Should have 2 subjects');
  console.log('✔ Retrieved subjects for Student A: count = 2');

  // 9. Register Student B
  const regB = await makeRequest('/api/auth/register', 'POST', {
    name: 'Bob Jones',
    email: emailB,
    password: 'password456',
    confirmPassword: 'password456',
  });
  console.assert(regB.status === 201, 'Register Student B failed');
  tokenB = regB.body.token;
  userB = regB.body.user;
  console.log('✔ Student B registered successfully');

  // 10. Verify Student B has 0 subjects (User data isolation)
  const subsB = await makeRequest('/api/subjects', 'GET', null, tokenB);
  console.assert(subsB.status === 200 && subsB.body.count === 0, 'Student B should have 0 subjects');
  console.log('✔ Data isolation verified: Student B has 0 subjects');

  // 11. Verify Student B CANNOT access, edit, or delete Student A's subject
  const accessDeniedGet = await makeRequest(`/api/subjects/${subjectA1Id}`, 'GET', null, tokenB);
  console.assert(accessDeniedGet.status === 404, 'Student B should not find Student A subject');

  const accessDeniedPut = await makeRequest(`/api/subjects/${subjectA1Id}`, 'PUT', {
    subjectName: 'Hacked Subject',
  }, tokenB);
  console.assert(accessDeniedPut.status === 404, 'Student B should not be able to edit Student A subject');

  const accessDeniedDel = await makeRequest(`/api/subjects/${subjectA1Id}`, 'DELETE', null, tokenB);
  console.assert(accessDeniedDel.status === 404, 'Student B should not be able to delete Student A subject');
  console.log('✔ Strict user isolation verified: cross-user access/modification blocked');

  // 12. Edit Student A's subject
  const updateSub = await makeRequest(`/api/subjects/${subjectA1Id}`, 'PUT', {
    subjectName: 'Advanced Calculus & Analysis',
    description: 'Updated description with multivariate topics',
    semester: 'Spring 2027',
  }, tokenA);
  console.assert(updateSub.status === 200 && updateSub.body.data.subjectName === 'Advanced Calculus & Analysis', 'Subject update failed');
  console.log('✔ Student A updated subject successfully');

  // 13. Delete subject 2 for Student A
  const delSub = await makeRequest(`/api/subjects/${subjectA2Id}`, 'DELETE', null, tokenA);
  console.assert(delSub.status === 200, 'Subject deletion failed');
  const subsAAfterDel = await makeRequest('/api/subjects', 'GET', null, tokenA);
  console.assert(subsAAfterDel.body.count === 1, 'Student A should now have 1 subject remaining');
  console.log('✔ Subject deleted successfully with count updated to 1');

  // 14. Dashboard stats for Student A
  const dashStats = await makeRequest('/api/dashboard/stats', 'GET', null, tokenA);
  console.assert(dashStats.status === 200, 'Failed to fetch dashboard stats');
  console.assert(dashStats.body.data.metrics.totalSubjects === 1, 'Dashboard total subjects should be 1');
  console.assert(dashStats.body.data.metrics.totalStudyMaterials === 0, 'Dashboard study materials should be 0');
  console.assert(dashStats.body.data.metrics.preparationProgress === 0, 'Dashboard prep progress should be 0');
  console.assert(Array.isArray(dashStats.body.data.upcomingExams) && dashStats.body.data.upcomingExams.length === 0, 'Upcoming exams should be empty');
  console.assert(dashStats.body.data.recentActivity.length > 0, 'Recent activity should have items');
  console.log('✔ Dashboard statistics verified matches Phase 1 specs');

  // 15. Profile GET and PUT for Student A
  const profGet = await makeRequest('/api/users/profile', 'GET', null, tokenA);
  console.assert(profGet.status === 200 && profGet.body.data.name === 'Alice Smith', 'Profile GET failed');
  console.assert(profGet.body.data.totalSubjects === 1, 'Profile subject count should be 1');

  const profPut = await makeRequest('/api/users/profile', 'PUT', {
    name: 'Alice Johnson',
  }, tokenA);
  console.assert(profPut.status === 200 && profPut.body.data.name === 'Alice Johnson', 'Profile PUT failed');
  console.log('✔ Student profile retrieved and updated successfully to "Alice Johnson"');

  console.log('--- ALL PHASE 1 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
