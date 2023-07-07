const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');


mongoose.set('strictQuery', true);
const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const conn = mongoose.connect("mongodb+srv://sahil:sahil@flight.vdrclkj.mongodb.net/flight-booking", { useNewUrlParser: true });

/*AUTH TABLE*/

const authSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const Auth = mongoose.model('auth-table', authSchema);

app.post('/authen', (req, res) => {
  const { username, password } = req.body;
  Auth.findOne({ username, password })
    .then((user) => {
      if (user) {
        // Authentication successful
        res.json({ success: true, message: 'Authentication successful' });
      } else {
        // Invalid credentials
        res.json({ success: false, message: 'Invalid username or password' });
      }
    })
    .catch((error) => {
      res.json({ success: false, message: 'Authentication failed' });
    });
});

app.post('/authenticate', (req, res) => {
  const { username, password } = req.body;
  const newAuth = new Auth({ username, password });

  newAuth.save()
    .then(() => {
      res.send('Successfully created a new user');
    })
    .catch((error) => {
      res.send(error.message);
    });
});

/*USER table*/

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact_number: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('user-table', userSchema);

app.get('/users', (req, res) => {
  User.find()
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      res.send(error.message);
    });
});

app.route('/users')
  .get((req, res) => {
    // Retrieve all users
    User.find({})
      .then((foundUsers) => {
        res.send(foundUsers);
      })
      .catch((err) => {
        res.send(err);
      });
  })
  .post((req, res) => {
    // Create a new user
    const { username, password, email, contact_number } = req.body;
    const newUser = new User({
      username,
      password,
      email,
      contact_number,
    });
    

    newUser.save()
      .then(() => {
        res.send('Successfully added a new user');
      })
      .catch((err) => {
        res.send(err);
      });
  })
  .delete((req, res) => {
    // Delete all users
    User.deleteMany({})
      .then(() => {
        res.send('Successfully deleted all users');
      })
      .catch((err) => {
        res.send(err);
      });
  });

// Route for deleting a specific user by _id
app.delete('/users/:_id', (req, res) => {
  const { _id } = req.params;

  User.findOneAndDelete({ _id })
    .then(() => {
      res.send('Successfully deleted the user');
    })
    .catch((err) => {
      res.send(err);
    });
});

  /*FLIGHT TABLE*/

  const flightSchema = new mongoose.Schema({
    flight_id: {
      type: String,
      required: true,
      unique: true
    },
    flight_number: {
      type: String,
      required: true
    },
    origin: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    seat_count: {
      type: Number,
      required: true
    }
  });
  
  const Flight = mongoose.model('flight-table', flightSchema);
  app.get('/flight', (req, res) => {
    Flight.find()
      .then((flights) => {
        res.json(flights);
      })
      .catch((error) => {
        res.send(error.message);
      });
  });
  app.get('/flights', (req, res) => {
    const { origin, destination, date ,time } = req.query;
    Flight.find({ origin, destination, date, time })
      .then((flights) => {
        res.json(flights);
      })
      .catch((error) => {
        res.send(error.message);
      });
  });

  // POST a new flight
  app.post('/flights', (req, res) => {
    const { flight_id, flight_number, origin, destination, time, date, seat_count } = req.body;
  
    const newFlight = new Flight({
      flight_id,
      flight_number,
      origin,
      destination,
      time,
      date,
      seat_count
    });
  
    newFlight.save()
      .then(() => {
        res.send('Successfully added a new flight');
      })
      .catch((err) => {
        res.send(err);
      });
  });
  
  // DELETE a flight by _id
  app.delete('/flights/:_id', (req, res) => {
    const _id = req.params._id;
  
    Flight.findOneAndDelete({ flight_id: _id })
      .then(() => {
        res.send('Successfully deleted the flight');
      })
      .catch((err) => {
        res.send(err);
      });
  });

  app.delete('/flights', (req, res) => {
    Flight.deleteMany({})
      .then(() => {
        res.send('Successfully deleted all flights');
      })
      .catch((err) => {
        res.send(err);
      });
  });


  /*BOOKING TABLE*/

  const bookingSchema = new mongoose.Schema({
    username: {
      type: String,
      required:true
    },
    booking_id: {
      type: String,
      default: shortid.generate,
      unique: true,
    },
    name: {
      type: String,
      required: true
    },
    flight_id: {
      type: String,
      required:true
    },
    seat_number: {
      type: String,
      required: true
    },

  });
  
  const Booking = mongoose.model('booking-table', bookingSchema);



  app.get('/bookings', (req, res) => {
    const { username } = req.query;
    Booking.find({ username })
      .then((bookings) => {
        res.json(bookings);
      })
      .catch((error) => {
        res.send(error.message);
      });
  });
  
  // POST a new booking
  app.post('/bookings', (req, res) => {
    const { name, flight_id, seat_number,username } = req.body;
    const newBooking = new Booking({ name, flight_id, seat_number, username  });
  
    newBooking.save()
      .then(() => {
        res.send('Booking created successfully');
      })
      .catch((error) => {
        res.send(error.message);
      });
  });
  
  // DELETE a booking by booking_id
  app.delete('/bookings/:_id', (req, res) => {
    const _id = req.params._id;
  
    Booking.findOneAndDelete({ booking_id: _id })
      .then(() => {
        res.send("booking deleted sucessfully");
      })
      .catch((error) => {
        res.send(error.message);
      });
  });
  
  // DELETE all bookings
  app.delete('/bookings', (req, res) => {
    Booking.deleteMany({})
      .then(() => {
        res.send('All bookings deleted successfully');
      })
      .catch((error) => {
        res.send(error.message);
      });
  });
  

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
