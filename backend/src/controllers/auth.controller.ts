import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const generateToken = (userId: string, role: UserRole) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, phone, role, referredByCode } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let referredBy;
    if (referredByCode) {
      const referrer = await User.findOne({ referralCode: referredByCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Generate simple referral code (e.g., KOT-123456)
    const referralCode = `${firstName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000000)}`;

    const user = new User({
      firstName,
      lastName,
      email,
      passwordHash: password,
      phone,
      role: role || UserRole.Customer,
      referralCode,
      referredBy
    });

    await user.save();

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
