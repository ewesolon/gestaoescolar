import { Router } from 'express';
import { 
  buscarItensQuarentena,
  buscarCriteriosProduto,
  colocarEmQuarentena,
  liberarItem,
  rejeitarItem,
  uploadFoto,
  buscarHistorico,
  buscarItemPorId
} from '../controllers/controleQualidadeController';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/qualidade'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `qualidade-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, JPG e PNG são permitidas'));
    }
  }
});

// Rotas
router.get('/quarentena', buscarItensQuarentena);
router.get('/criterios/:produtoId', buscarCriteriosProduto);
router.get('/historico/:recebimentoItemId', buscarHistorico);
router.get('/:id', buscarItemPorId);

router.post('/quarentena/:recebimentoItemId', colocarEmQuarentena);
router.post('/upload-foto/:controleId', upload.single('foto'), uploadFoto);

router.put('/liberar/:controleId', liberarItem);
router.put('/rejeitar/:controleId', rejeitarItem);

export default router;