
import express, { Request, Response, NextFunction } from 'express';
import { locationService } from '../services/locationService';
import { LocationListResponse, LocationResponse, BaseResponse, ErrorResponse } from '../types';

const router = express.Router();

// Get all locations
router.get('/', async (req: Request, res: Response<LocationListResponse>, next: NextFunction) => {
  try {
    const locations = await locationService.getAllLocations();
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

// Get location by ID
router.get('/:id', async (req: Request, res: Response<LocationResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const location = await locationService.getLocationById(id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    next(error);
  }
});

// Create location
router.post('/', async (req: Request, res: Response<LocationResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const result = await locationService.createLocation(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update location
router.put('/:id', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const result = await locationService.updateLocation(id, req.body);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete location
router.delete('/:id', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const result = await locationService.deleteLocation(id);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
