var express=require('express');
const router = express.Router();
const userController=require('../controllers/UserController');

router.post('/create',userController.addUser);
router.get('/list', userController.getUsers);
router.get('/details/:id', userController.getUserById);
router.delete('/delete/:id', userController.deleteUser);
router.put('/update/:id', userController.updateUser);
router.post('/login', userController.user_signin);
router.post('/userwinthemailandpss', userController.getUserByEmailAndPassword);
router.post('/forgot-password', userController.sendResetCode);
router.post('/reset-code', userController.validateResetCode);
router.post('/reset-password', userController.resetPassword);
module.exports = router;
