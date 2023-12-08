const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { query } = require('./db');

const configPassport = (passport) => {
  passport.use(
    new LocalStrategy({}, (username, password, done) => {
      // Query for user
      query('SELECT * FROM users WHERE username=$1', [username])
        .then((rows) => {
          if (!rows.length) return done({ error: 'Incorrect username' });

          const user = rows[0];

          // Check user password
          bcrypt
            .compare(password, user.pass)
            .then((isMatch) => {
              // if an exception occurred while verifying the credentials
              if (!isMatch) return done({ error: 'Incorrect password.' });
              delete user.pass;
              done(false, user);
            })
            .catch((err) => done(err));
        })
        .catch((err) => console.error(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(false, user.id);
  });

  passport.deserializeUser((id, done) => {
    query('SELECT * FROM users WHERE id=$1', [id])
      .then((rows) => {
        if (!rows.length) return done({ error: 'User not found' });
        done(null, rows[0]);
      })
      .catch((err) => console.error(err));
  });
};

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.json({ isAuthenticated: false });
};

module.exports = { configPassport, ensureAuthenticated };
