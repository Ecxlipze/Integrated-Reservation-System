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
