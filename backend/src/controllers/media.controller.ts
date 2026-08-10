import { Request, Response, NextFunction } from 'express';
import { uploadFileToCloud } from '../services/media.service';

export const uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Call the service which will eventually handle the cloud upload
    const url = await uploadFileToCloud(req.file);

    res.status(200).json({
      message: 'File uploaded successfully',
      url
    });
  } catch (error) {
    next(error);
  }
};
