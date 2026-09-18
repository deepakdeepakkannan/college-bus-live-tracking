const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Bus = require('../models/Bus');
const Student = require('../models/Student');
const GPS = require('../models/GPS');
const { syncBusLocation } = require('../services/gpsService');

const useMongo = () => mongoose.connection.readyState === 1;

const normalizeValue = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const isBusNumberQuery = (rawQuery) => {
  const normalizedQuery = normalizeValue(rawQuery);
  if (!normalizedQuery) return false;

  return normalizedQuery.startsWith('svg') || /^\d{1,3}$/.test(normalizedQuery);
};

const matchesQuery = (bus, rawQuery) => {
  const query = rawQuery?.trim();
  if (!query) return false;

  const normalizedQuery = normalizeValue(query);
  if (!normalizedQuery) return false;

  const isBusSearch = isBusNumberQuery(query);
  const queryDigits = normalizedQuery.replace(/\D/g, '');
  const queryDigitsWithoutLeadingZeros = queryDigits.replace(/^0+/, '');
  const valuesToCheck = isBusSearch
    ? [bus.busNumber, bus.registrationNumber]
    : [bus.busNumber, bus.route, bus.registrationNumber, bus.driverName, bus.driverPhone, bus.startingPoint, bus.destination];

  return valuesToCheck.some((value) => {
    const normalizedValue = normalizeValue(value);

    if (normalizedValue.includes(normalizedQuery)) {
      return true;
    }

    if (!isBusSearch || !queryDigitsWithoutLeadingZeros) {
      return false;
    }

    const valueDigits = normalizedValue.replace(/\D/g, '');
    const valueDigitsWithoutLeadingZeros = valueDigits.replace(/^0+/, '');

    if (!valueDigitsWithoutLeadingZeros) {
      return false;
    }

    if (queryDigitsWithoutLeadingZeros.length <= 1) {
      return valueDigitsWithoutLeadingZeros.startsWith(queryDigitsWithoutLeadingZeros);
    }

    if (queryDigitsWithoutLeadingZeros.length === 2) {
      return valueDigitsWithoutLeadingZeros.startsWith(queryDigitsWithoutLeadingZeros) ||
        valueDigitsWithoutLeadingZeros.includes(queryDigitsWithoutLeadingZeros);
    }

    return valueDigitsWithoutLeadingZeros.startsWith(queryDigitsWithoutLeadingZeros) ||
      queryDigitsWithoutLeadingZeros.startsWith(valueDigitsWithoutLeadingZeros) ||
      valueDigitsWithoutLeadingZeros.includes(queryDigitsWithoutLeadingZeros);
  });
};

router.get('/buses', async (req, res) => {
  try {
    if (useMongo()) {
      const buses = await Bus.find();
      return res.json(buses);
    }

    return res.json(req.app.locals.buses || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/bus', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ message: 'Query parameter q is required' });
    }

    if (useMongo()) {
      const buses = await Bus.find();
      const matchingBuses = buses.filter((item) => matchesQuery(item, query));
      if (!matchingBuses.length) return res.status(404).json({ message: 'Bus not found' });
      return res.json(matchingBuses.length === 1 ? matchingBuses[0] : matchingBuses);
    }

    const matchingBuses = (req.app.locals.buses || []).filter((item) => matchesQuery(item, query));

    if (!matchingBuses.length) return res.status(404).json({ message: 'Bus not found' });
    return res.json(matchingBuses.length === 1 ? matchingBuses[0] : matchingBuses);
  } catch (error) {
    console.error('Bus search failed:', error);
    return res.status(500).json({ message: 'Unable to search buses right now. Please try again later.' });
  }
});

router.get('/students', async (req, res) => {
  try {
    if (useMongo()) {
      const students = await Student.find();
      return res.json(students);
    }

    return res.json(req.app.locals.students || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/gps/update', async (req, res) => {
  try {
    const { busId, latitude, longitude, speed, timestamp, status } = req.body;
    const io = req.app.get('io');
    const eventTime = timestamp || new Date();

    if (useMongo()) {
      const gpsEntry = new GPS({ busId, latitude, longitude, speed, timestamp: eventTime, status });
      await gpsEntry.save();
      await syncBusLocation({ app: req.app, busId, latitude, longitude, speed, status, timestamp: eventTime, useMongo: true, busModel: Bus });
    } else {
      const history = req.app.locals.gpsLogs || [];
      req.app.locals.gpsLogs = [...history, { busId, latitude, longitude, speed, timestamp: eventTime, status }];
      await syncBusLocation({ app: req.app, busId, latitude, longitude, speed, status, timestamp: eventTime, useMongo: false });
    }

    io?.to(busId).emit('gpsUpdate', { busId, latitude, longitude, speed, timestamp: eventTime, status });
    return res.json({ message: 'GPS update received' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/gps/history/:busId', async (req, res) => {
  try {
    if (useMongo()) {
      const history = await GPS.find({ busId: req.params.busId }).sort({ timestamp: 1 });
      return res.json(history);
    }

    const history = (req.app.locals.gpsLogs || []).filter((entry) => entry.busId === req.params.busId);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/addBus', async (req, res) => {
  try {
    if (useMongo()) {
      const newBus = new Bus(req.body);
      await newBus.save();
      return res.status(201).json(newBus);
    }

    const buses = req.app.locals.buses || [];
    const newBus = { ...req.body, _id: `bus-${Date.now()}` };
    req.app.locals.buses = [...buses, newBus];
    return res.status(201).json(newBus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/addStudent', async (req, res) => {
  try {
    if (useMongo()) {
      const newStudent = new Student(req.body);
      await newStudent.save();
      return res.status(201).json(newStudent);
    }

    const students = req.app.locals.students || [];
    const newStudent = { ...req.body, _id: `student-${Date.now()}` };
    req.app.locals.students = [...students, newStudent];
    return res.status(201).json(newStudent);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
