import bcryptjs from "bcryptjs";
import User from "../models/Users.js";
import { generarJWT } from "../middlewares/Webtoken.js";

export const crearUsuario = async (req, res) => {
  const { nombre_completo, email, password_hash, fecha_nacimiento, fecha_registro } = req.body;

  try {
    const salt = bcryptjs.genSaltSync();
    const hashedPassword = bcryptjs.hashSync(password_hash, salt);

    const usuario = await User.create({
      nombre_completo,
      email,
      password_hash: hashedPassword,
      fecha_nacimiento,
      fecha_registro
    });

    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear usuario", error: error.message });
  }
};

export const loginUsuario = async (req, res) => {
  const { email, password_hash } = req.body;

  try {
    const usuario = await User.findOne({ email, estado: { $ne: 0 } });

    if (!usuario) {
      return res.status(400).json({ mensaje: "Usuario / Password no son correctos!" });
    }

    const validPassword = bcryptjs.compareSync(password_hash, usuario.password_hash);

    if (!validPassword) {
      return res.status(400).json({ mensaje: "Usuario / Password no son correctos!" });
    }

    const token = await generarJWT(usuario._id);
    res.json({ usuario, token });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

export const listarUsuarios = (req, res) => {
  User.find()
    .then(usuarios => res.status(200).json(usuarios))
    .catch(error => res.status(500).json({ mensaje: "Error al listar usuarios", error: error.message }));
};

export const obtenerUsuario = (req, res) => {
  User.findById(req.params.id)
    .then(usuario => 
      !usuario 
        ? res.status(404).json({ mensaje: "Usuario no encontrado" })
        : res.status(200).json(usuario)
    )
    .catch(error => res.status(500).json({ mensaje: "Error al obtener usuario", error: error.message }));
};

export const actualizarUsuario = async (req, res) => {
  const { nombre_completo, email, password_hash, fecha_nacimiento, fecha_registro } = req.body;

  try {
    const updateData = { nombre_completo, email, fecha_nacimiento, fecha_registro };

    if (password_hash) {
      const salt = bcryptjs.genSaltSync();
      updateData.password_hash = bcryptjs.hashSync(password_hash, salt);
    }

    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar usuario", error: error.message });
  }
};

export const eliminarUsuario = (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(usuario => 
      !usuario 
        ? res.status(404).json({ mensaje: "Usuario no encontrado" })
        : res.status(200).json({ mensaje: "Usuario eliminado correctamente" })
    )
    .catch(error => res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message }));
};
