
import express, { Request, Response, NextFunction } from 'express';
import { companyService } from '../services/companyService';
import { CompanyListResponse, CompanyResponse, BaseResponse, ErrorResponse } from '../types';

const router = express.Router();

// Get all companies
router.get('/', async (req: Request, res: Response<CompanyListResponse>, next: NextFunction) => {
  try {
    const companies = await companyService.getAllCompanies();
    res.json(companies);
  } catch (error) {
    next(error);
  }
});

// Get company by ID
router.get('/:id', async (req: Request, res: Response<CompanyResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const company = await companyService.getCompanyById(id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    next(error);
  } 
});

// Create company
router.post('/', async (req: Request, res: Response<CompanyResponse | ErrorResponse>, next: NextFunction) => {
  try {
    const result = await companyService.createCompany(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Update company
router.put('/:id', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const result = await companyService.updateCompany(id, req.body);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete company
router.delete('/:id', async (req: Request, res: Response<BaseResponse>, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const result = await companyService.deleteCompany(id);
    
    if (result === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
