import { Router } from 'express';
import { unifiedSearch } from '../controllers/search.controller';
import { validate } from '../middlewares/validation.middleware';
import { searchSchema } from '../schemas/search.schema';

const router = Router();

router.get('/', validate(searchSchema), unifiedSearch);

export default router;
