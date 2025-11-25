require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const searchRoutes = require('./src/routes/search');
const movieRoutes = require('./src/routes/movie');
const metricsRoutes = require('./src/routes/metrics');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/search', searchRoutes);
app.use('/api/movie', movieRoutes);
app.use('/api/metrics', metricsRoutes);

app.get('/', (req, res) => res.send('OMDB Movie Explorer Backend is running'));

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
