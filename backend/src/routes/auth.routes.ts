import { Router } from 'express';
import { 
  register, 
  login, 
  getMe, 
  generateWebAuthnRegistration,
  verifyWebAuthnRegistration,
  generateWebAuthnAuth,
  verifyWebAuthnAuth
} from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, getMe);

// WebAuthn Routes
router.get('/webauthn/register', requireAuth, generateWebAuthnRegistration);
router.post('/webauthn/register', requireAuth, verifyWebAuthnRegistration);
router.get('/webauthn/authenticate', requireAuth, generateWebAuthnAuth);
router.post('/webauthn/authenticate', requireAuth, verifyWebAuthnAuth);

export default router;
