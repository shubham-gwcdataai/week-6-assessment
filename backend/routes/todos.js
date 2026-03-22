const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getAll, create, update, remove } = require('../controllers/todoController');

router.get('/',     authenticate, getAll);
router.post('/',    authenticate, create);
router.put('/:id',  authenticate, update);
router.delete('/:id', authenticate, remove);

module.exports = router;
