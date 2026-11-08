import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

export const generarJWT = (uid) => {
  return new Promise((resolve, reject) => {
    const payload = { uid };

    jwt.sign(
      payload,
      process.env.SECRETORPRIVATEKEY,
      { expiresIn: "4h" },
      (err, token) => {
        if (err) {
          console.error(err);
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};

export const validarJWT = async (req, res, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      msg: "No hay token en la petición"
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    const usuario = await User.findById(uid);

    if (!usuario) {
      return res.status(401).json({
        msg: "Token no válido - usuario no existe en DB"
      });
    }

    if (usuario.estado === 0) {
      return res.status(401).json({
        msg: "Token no válido - usuario inactivo"
      });
    }

    req.usuario = usuario;
    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({
      msg: "Token no valido"
    });
  }
};