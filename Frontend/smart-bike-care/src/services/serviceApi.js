
import api from "./api";

// Create a service for a bike
export const addService = (
  bikeId,
  data
) => {
  return api.post(
    `/bikes/${bikeId}/services`,
    data
  );
};

// Get all services for a bike
export const getBikeServices = (
  bikeId
) => {
  return api.get(
    `/bikes/${bikeId}/services`
  );
};

// Get one service
export const getServiceById = (
  serviceId
) => {
  return api.get(
    `/services/${serviceId}`
  );
};

// Update one service
export const updateService = (
  serviceId,
  data
) => {
  return api.put(
    `/services/${serviceId}`,
    data
  );
};

// Delete one service
export const deleteService = (
  serviceId
) => {
  return api.delete(
    `/services/${serviceId}`
  );
};

