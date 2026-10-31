
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  generateMnemonicContent,
  saveMnemonic,
  getMnemonics,
  getMnemonicById,
  updateMnemonic,
  deleteMnemonic,
} = require('../controllers/mnemonicController');

router.use(protect);

router.post('/generate', generateMnemonicContent);
router.post('/', saveMnemonic);
router.get('/', getMnemonics);
router.get('/:id', getMnemonicById);
router.put('/:id', updateMnemonic);
router.delete('/:id', deleteMnemonic);

module.exports = router;
