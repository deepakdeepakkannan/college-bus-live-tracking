const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Bus = require('./models/Bus');
const Student = require('./models/Student');
const GPS = require('./models/GPS');

dotenv.config();

const app = express();
const isVercel = Boolean(process.env.VERCEL);
const configuredOrigins = [process.env.FRONTEND_URL, process.env.VERCEL_FRONTEND_URL]
  .flatMap((value) => (value || '').split(','))
  .map((value) => value.trim())
  .filter(Boolean);
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  ...configuredOrigins
];
const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.includes(origin)) return true;

  try {
    return new URL(origin).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};
const pfxPath = process.env.SSL_PFX_PATH || path.join(__dirname, 'certs', 'localhost.pfx');
const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'certs', 'localhost.pem');
const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'certs', 'localhost-key.pem');
const pfxPassphrase = process.env.SSL_PFX_PASSPHRASE || 'live2local';
const hasPfx = fs.existsSync(pfxPath);
const hasPem = fs.existsSync(certPath) && fs.existsSync(keyPath);
const preferHttps = process.env.USE_HTTPS === 'true';
const useHttps = preferHttps && (hasPfx || hasPem);

const httpsOptions = hasPfx
  ? { pfx: fs.readFileSync(pfxPath), passphrase: pfxPassphrase }
  : hasPem
    ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
    : null;

const server = useHttps
  ? https.createServer(httpsOptions, app)
  : http.createServer(app);

if (useHttps) {
  console.log(`Starting HTTPS server using ${hasPfx ? 'PFX' : 'PEM'} certificates`);
} else if (preferHttps) {
  console.warn('HTTPS was requested but certificates are unavailable. Starting HTTP server instead.');
} else {
  console.log('Starting HTTP server for local development.');
}

const io = new Server(server, {
  cors: {
    origin: isAllowedOrigin,
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.set('io', io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
let buses = [];
let students = [];
let gpsLogs = [];
let college = {
  collegeName: 'Shree Venkateshwara Group of Institutions',
  address: 'Otthakkuthirai, Gobichettipalayam, Erode District, Tamil Nadu',
  phone: '+91 98765 43210',
  email: 'transport@svg.edu',
  website: 'https://svg.edu'
};

const buildBusSeedData = () => {
  const routeTemplates = [
    { route: 'Route 1', startingPoint: 'Main Gate', destination: 'Hostel Block', timing: '07:30 AM' },
    { route: 'Route 2', startingPoint: 'North Campus', destination: 'Science Block', timing: '08:00 AM' },
    { route: 'Route 3', startingPoint: 'Library', destination: 'Cafeteria', timing: '08:15 AM' },
    { route: 'Route 4', startingPoint: 'Residential Area', destination: 'Admin Block', timing: '08:30 AM' },
    { route: 'Route 5', startingPoint: 'Sports Complex', destination: 'Main Gate', timing: '09:00 AM' },
    { route: '107', startingPoint: 'Ottakkuthirai', destination: 'Sivagiri', timing: '08:45 AM' }
  ];

  const buses = [];
  for (let index = 1; index <= 120; index += 1) {
    const template = routeTemplates[(index - 1) % routeTemplates.length];
    const row = Math.floor((index - 1) / 10);
    const column = (index - 1) % 10;
    const latitude = 11.34 + row * 0.008 + column * 0.0005;
    const longitude = 77.72 + column * 0.005 + row * 0.001;
    const stops = [
      { name: template.startingPoint, distance: 0, studentsWaiting: 6 + (index % 5) },
      { name: 'Middle Stop', distance: 2.1 + (index % 4), studentsWaiting: 4 + (index % 3) },
      { name: template.destination, distance: 4.8 + (index % 3), studentsWaiting: 3 + (index % 4) }
    ];

    buses.push({
      _id: `bus-${index}`,
      busNumber: `SVG-${String(index).padStart(3, '0')}`,
      registrationNumber: `TN-01-AB-${String(index).padStart(4, '0')}`,
      driverName: `Driver ${index}`,
      driverPhone: '+91 96593 96462',
      capacity: 42 + (index % 4),
      route: template.route,
      startingPoint: template.startingPoint,
      destination: template.destination,
      timing: template.timing,
      currentLocation: { latitude, longitude },
      speed: 18 + (index % 20),
      status: index % 6 === 0 ? 'Idle' : 'Active',
      currentStudents: 14 + (index % 24),
      stops
    });
  }

  return buses;
};

const initialBuses = buildBusSeedData();

const initialStudents = [
  {
    _id: 'std-1',
    name: 'Aarav Sharma',
    registerNumber: 'REG-1001',
    department: 'Computer Science',
    year: '2nd Year',
    busNumber: 'GVC-101',
    stop: 'Library'
  },
  {
    _id: 'std-2',
    name: 'Sneha Nair',
    registerNumber: 'REG-1002',
    department: 'Electronics',
    year: '3rd Year',
    busNumber: 'GVC-202',
    stop: 'Science Block'
  }
];

const seedData = () => {
  buses = [...initialBuses];
  students = [...initialStudents];
  gpsLogs = [];
  app.locals.buses = buses;
  app.locals.students = students;
  app.locals.gpsLogs = gpsLogs;
  app.locals.college = college;
};

seedData();

const initializeDatabase = async () => {
  if (!MONGO_URI) {
    console.log('No MONGO_URI provided. Running with seeded in-memory data.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const busCount = await Bus.countDocuments();
    const studentCount = await Student.countDocuments();

    if (busCount === 0) {
      await Bus.insertMany(initialBuses);
      console.log('Seeded buses into MongoDB');
    }

    if (studentCount === 0) {
      await Student.insertMany(initialStudents);
      console.log('Seeded students into MongoDB');
    }

    const dbBuses = await Bus.find();
    buses = dbBuses;
    app.locals.buses = buses;

    const dbStudents = await Student.find();
    students = dbStudents;
    app.locals.students = students;
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

initializeDatabase();

io.on('connection', (socket) => {
  socket.on('joinBus', (busNumber) => socket.join(busNumber));
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/college', (req, res) => res.json(college));
app.get('/dashboard-summary', (req, res) => {
  res.json({
    totalBuses: buses.length,
    totalStudents: students.length,
    activeBuses: buses.filter((bus) => bus.status === 'Active').length,
    completedTrips: 8
  });
});

app.post('/login', (req, res) => {
  const { role, email, password } = req.body;
  const users = {
    admin: { email: 'admin@greenvalley.edu', password: 'admin123' },
    driver: { email: 'driver@greenvalley.edu', password: 'driver123' },
    student: { email: 'student@greenvalley.edu', password: 'student123' }
  };

  const user = users[role];
  if (!user || user.email !== email || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({ role, name: role.charAt(0).toUpperCase() + role.slice(1), email });
});

app.use('/api', require('./routes/busRoutes'));

if (!isVercel) {
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/college' || req.path === '/dashboard-summary' || req.path === '/login') {
      return next();
    }
    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (${useHttps ? 'https' : 'http'})`);
  });
}

module.exports = app;
