var express=require('express');
const router = express.Router();
const userController=require('../controllers/UserController');
// Import de votre config Multer
const upload = require("../Middleware/Upload");

// Use Multer to handle file uploads for both "photo" and "image_carte_etudiant"
router.post(
  '/create',
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "image_carte_etudiant", maxCount: 1 }
  ]),
  userController.addUser
);
router.get('/list', userController.getUsers);
router.get('/details/:id', userController.getUserById);
router.delete('/delete/:id', userController.deleteUser);

// Route de mise à jour d'un utilisateur (avec upload Multer)
router.put(
    "/update/:id",
    upload.fields([
      { name: "photo", maxCount: 1 },                 // Pour la photo de profil
      { name: "image_carte_etudiant", maxCount: 1 },  // Pour la carte étudiante (optionnel)
    ]),
    userController.updateUser
  );

router.post('/login', userController.user_signin);
router.post('/userwinthemailandpss', userController.getUserByEmailAndPassword);
router.post('/forgot-password', userController.sendResetCode);
router.post('/reset-code', userController.validateResetCode);
router.post('/reset-password', userController.resetPassword);
router.put('/toggle-block/:id', userController.toggleBlockUser);
router.get('/view/:id', userController.viewStudent);
router.get('/view/:id', userController.viewRestaurant);
router.get('/view/:id', userController.viewSupermarket);
router.get('/view/:id', userController.viewNGO);
router.get('/view/:id', userController.viewTransporter);
module.exports = router;
