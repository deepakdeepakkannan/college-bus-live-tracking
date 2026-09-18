const syncBusLocation = async ({ app, busId, latitude, longitude, speed, status, timestamp, useMongo = false, busModel = null }) => {
  if (!busId) return null;

  if (useMongo && busModel) {
    const query = { $or: [{ busNumber: busId }, { _id: busId }] };
    const updatedBus = await busModel.findOneAndUpdate(
      query,
      {
        currentLocation: { latitude, longitude },
        speed,
        status,
        updatedAt: timestamp || new Date()
      },
      { new: true }
    );

    return updatedBus;
  }

  const buses = app.locals?.buses || [];
  const bus = buses.find((item) => item.busNumber === busId || item._id === busId);

  if (!bus) return null;

  bus.currentLocation = { latitude, longitude };
  bus.speed = speed;
  bus.status = status;
  bus.updatedAt = timestamp || new Date();

  app.locals.buses = buses;
  return bus;
};

module.exports = { syncBusLocation };
