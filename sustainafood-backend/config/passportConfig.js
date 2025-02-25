// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const jwt = require("jsonwebtoken");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: "508010930090-0rt70r0msve7ga6emefr0iat604hme1o.apps.googleusercontent.com", // Remplacez par votre Client ID
//       clientSecret: "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", // Remplacez par votre Client Secret
//       callbackURL: "http://localhost:3000/auth/google/callback", // L'URL de callback
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Création d'un token JWT pour l'utilisateur
//         const token = jwt.sign(
//           { id: profile.id, email: profile.emails[0].value, name: profile.displayName },
//           "votre_secret_key",
//           { expiresIn: "1h" }
//         );

//         return done(null, { profile, token });
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// // Sérialisation et désérialisation des utilisateurs
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// module.exports = passport;
