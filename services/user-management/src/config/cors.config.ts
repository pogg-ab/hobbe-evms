import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const allowedOrigins = [
  'http://localhost:3000',
  'https://admin.portal.hobbeplatform.com',
  'http://localhost:4000',
  'http://89.117.37.84:4000',
];

export const corsConfig: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
