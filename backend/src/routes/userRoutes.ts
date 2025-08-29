import { Router } from "express";
import { register, login } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Registro
router.post("/register", register);
// Login
router.post("/login", login);
// Exemplo de rota protegida
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;
