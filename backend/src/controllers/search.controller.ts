import { Request, Response, NextFunction } from 'express';
import { searchFlights, searchHotels, searchBuses, searchTours } from '../services/search.service';
import { getCache, setCache } from '../utils/cache.util';

export const unifiedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, minPrice, maxPrice, rating, date, sortBy, page, limit } = req.query as any;

    // Build a unique cache key based on query parameters
    const cacheKey = `search:${category}:${JSON.stringify(req.query)}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        source: 'cache'
      });
    }

    const searchParams = { minPrice, maxPrice, rating, date, sortBy, page, limit };
    let result;

    switch (category) {
      case 'flight':
        result = await searchFlights(searchParams);
        break;
      case 'hotel':
        result = await searchHotels(searchParams);
        break;
      case 'bus':
        result = await searchBuses(searchParams);
        break;
      case 'tour':
        result = await searchTours(searchParams);
        break;
      default:
        return res.status(400).json({ message: 'Invalid category' });
    }

    // Cache the result for 60 seconds
    await setCache(cacheKey, result, 60);

    res.json({
      ...result,
      source: 'database'
    });
  } catch (error) {
    next(error);
  }
};

import { Flight } from '../models/Flight';
import { Hotel } from '../models/Hotel';
import { Bus } from '../models/Bus';
import { Tour } from '../models/Tour';

export const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, id } = req.params;

    const cacheKey = `product:${category}:${id}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json({ product: cachedData, source: 'cache' });
    }

    let product;
    switch (category.toLowerCase()) {
      case 'flight':
        product = await Flight.findById(id).populate('supplierId', 'firstName lastName email');
        break;
      case 'hotel':
        product = await Hotel.findById(id).populate('supplierId', 'firstName lastName email');
        break;
      case 'bus':
        product = await Bus.findById(id).populate('supplierId', 'firstName lastName email');
        break;
      case 'tour':
        product = await Tour.findById(id).populate('supplierId', 'firstName lastName email');
        break;
      default:
        return res.status(400).json({ message: 'Invalid category' });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await setCache(cacheKey, product, 300); // cache for 5 minutes

    res.json({ product, source: 'database' });
  } catch (error) {
    next(error);
  }
};
