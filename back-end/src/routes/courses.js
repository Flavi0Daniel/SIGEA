const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const CourseController = require('../controllers/CourseController');

router.get('/', verifyToken, CourseController.list);
router.post('/', verifyToken, checkRole('admin'), CourseController.create);
router.put('/:id', verifyToken, checkRole('admin'), CourseController.update);
router.put('/:id/deactivate', verifyToken, checkRole('admin'), CourseController.deactivate);
router.put('/:id/reactivate', verifyToken, checkRole('admin'), CourseController.reactivate);


module.exports = router;
