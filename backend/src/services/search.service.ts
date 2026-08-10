import { Flight } from '../models/Flight';
import { Hotel } from '../models/Hotel';
import { Bus } from '../models/Bus';
import { Tour } from '../models/Tour';

interface SearchParams {
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  date?: string;
  sortBy?: 'lowest_price' | 'highest_rating' | 'recommended';
  page: number;
  limit: number;
}

const buildSortQuery = (sortBy?: string, isHotelOrTour = false) => {
  let sortObj: any = {};
  if (sortBy === 'lowest_price') {
    sortObj = { price: 1 };
  } else if (sortBy === 'highest_rating' && isHotelOrTour) {
    sortObj = { rating: -1 };
  } else {
    // Default / Recommended
    sortObj = { createdAt: -1 };
  }
  return sortObj;
};

export const searchFlights = async (params: SearchParams) => {
  const query: any = {};
  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) query.price.$gte = params.minPrice;
    if (params.maxPrice) query.price.$lte = params.maxPrice;
  }
  if (params.date) {
    const start = new Date(params.date);
    const end = new Date(params.date);
    end.setUTCHours(23, 59, 59, 999);
    query.departureTime = { $gte: start, $lte: end };
  }

  const sort = buildSortQuery(params.sortBy);
  const skip = (params.page - 1) * params.limit;

  const [data, total] = await Promise.all([
    Flight.find(query).sort(sort).skip(skip).limit(params.limit),
    Flight.countDocuments(query)
  ]);

  return { data, total, page: params.page, limit: params.limit };
};

export const searchHotels = async (params: SearchParams) => {
  const query: any = {};
  if (params.minPrice || params.maxPrice) {
    query.pricePerNight = {};
    if (params.minPrice) query.pricePerNight.$gte = params.minPrice;
    if (params.maxPrice) query.pricePerNight.$lte = params.maxPrice;
  }
  if (params.rating) {
    query.rating = { $gte: params.rating };
  }

  let sortObj: any = {};
  if (params.sortBy === 'lowest_price') {
    sortObj = { pricePerNight: 1 };
  } else if (params.sortBy === 'highest_rating') {
    sortObj = { rating: -1 };
  } else {
    sortObj = { rating: -1 }; // Recommended
  }

  const skip = (params.page - 1) * params.limit;

  const [data, total] = await Promise.all([
    Hotel.find(query).sort(sortObj).skip(skip).limit(params.limit),
    Hotel.countDocuments(query)
  ]);

  return { data, total, page: params.page, limit: params.limit };
};

export const searchBuses = async (params: SearchParams) => {
  const query: any = {};
  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) query.price.$gte = params.minPrice;
    if (params.maxPrice) query.price.$lte = params.maxPrice;
  }
  if (params.date) {
    const start = new Date(params.date);
    const end = new Date(params.date);
    end.setUTCHours(23, 59, 59, 999);
    query.departureTime = { $gte: start, $lte: end };
  }

  const sort = buildSortQuery(params.sortBy);
  const skip = (params.page - 1) * params.limit;

  const [data, total] = await Promise.all([
    Bus.find(query).sort(sort).skip(skip).limit(params.limit),
    Bus.countDocuments(query)
  ]);

  return { data, total, page: params.page, limit: params.limit };
};

export const searchTours = async (params: SearchParams) => {
  const query: any = {};
  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) query.price.$gte = params.minPrice;
    if (params.maxPrice) query.price.$lte = params.maxPrice;
  }
  if (params.rating) {
    query.rating = { $gte: params.rating };
  }

  const sort = buildSortQuery(params.sortBy, true);
  const skip = (params.page - 1) * params.limit;

  const [data, total] = await Promise.all([
    Tour.find(query).sort(sort).skip(skip).limit(params.limit),
    Tour.countDocuments(query)
  ]);

  return { data, total, page: params.page, limit: params.limit };
};
