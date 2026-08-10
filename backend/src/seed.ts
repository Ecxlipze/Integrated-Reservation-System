import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Flight } from './models/Flight';
import { Hotel } from './models/Hotel';
import { Bus } from './models/Bus';
import { Tour } from './models/Tour';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/integrated_reservation';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing
    await Flight.deleteMany({});
    await Hotel.deleteMany({});
    await Bus.deleteMany({});
    await Tour.deleteMany({});

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Flight.insertMany([
      { airline: 'Oceanic Airlines', flightNumber: 'OA815', origin: 'SYD', destination: 'LAX', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000), price: 850, availableSeats: 12 },
      { airline: 'Emirates', flightNumber: 'EK202', origin: 'JFK', destination: 'DXB', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000), price: 1200, availableSeats: 5 }
    ]);

    await Hotel.insertMany([
      { name: 'Grand Plaza Hotel', location: 'New York, NY', rating: 4.5, amenities: ['WiFi', 'Pool', 'Gym'], pricePerNight: 250, availableRooms: 10 },
      { name: 'Budget Inn', location: 'Austin, TX', rating: 3.2, amenities: ['WiFi'], pricePerNight: 65, availableRooms: 20 }
    ]);

    await Bus.insertMany([
      { operator: 'MegaBus', route: 'NY - DC', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), price: 25, availableSeats: 40 },
      { operator: 'Greyhound', route: 'LA - SF', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000), price: 45, availableSeats: 15 }
    ]);

    await Tour.insertMany([
      { title: 'Grand Canyon Explorer', destination: 'Grand Canyon, AZ', durationDays: 3, price: 350, rating: 4.8, availableSlots: 8 },
      { title: 'Rome City Walk', destination: 'Rome, Italy', durationDays: 1, price: 50, rating: 4.9, availableSlots: 20 }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
