import * as yup from "yup";

// Función auxiliar para validar máximo caracteres
const maxLength = (max) => yup.string().max(max, `Máximo ${max} caracteres`);

// Esquema de validación para el nombre
export const nombreValidation = yup
  .string()
  .required("Campo obligatorio")
  .matches(/^[A-Za-zÁ-ÿ\s]+$/, "Solo se permiten letras y espacios")
  .concat(maxLength(20));

// Esquema de validación para el apellido
export const apellidoValidation = yup
  .string()
  .required("Campo obligatorio")
  .matches(/^[A-Za-zÁ-ÿ\s]+$/, "Solo se permiten letras y espacios")
  .concat(maxLength(20));

// Esquema de validación para la identificación
export const identificacionValidation = yup
  .string()
  .matches(/^\d{6,15}$/, "Debe tener entre 6 y 15 dígitos")
  .required("Campo obligatorio");

// Esquema de validación para la dirección
export const direccionValidation = yup
  .string()
  .concat(maxLength(35))
  .required("Campo obligatorio");

// Esquema de validación para el teléfono
export const telefonoValidation = yup
  .string()
  .required("Campo obligatorio")
  .matches(/^\d{10,13}$/, "Debe tener entre 10 y 13 dígitos");

// Esquema de validación para el email
export const emailValidation = yup
  .string()
  .email("Correo inválido")
  .concat(maxLength(50))
  .required("Campo obligatorio");

// Esquema de validación para la contraseña
export const contraseñaValidation = yup
  .string()
  .min(8, "Mínimo 8 caracteres")
  .concat(maxLength(20))
  .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
  .matches(/[a-z]/, "Debe contener al menos una minúscula")
  .matches(/[0-9]/, "Debe contener al menos un número")
  .matches(
    /[!@#$%^&*()_+-={}|:;"'<>,.?/]/,
    "Debe contener un carácter especial"
  )
  .required("Campo obligatorio");

// Esquema de validación para confirmar la contraseña
export const confirmarContraseñaValidation = yup
  .string()
  .oneOf([yup.ref("contraseña"), null], "Las contraseñas no coinciden")
  .required("Campo obligatorio");

// Esquema de validación para el tipo de identificación
export const tipoIdentificacionValidation = yup
  .string()
  .required("Campo obligatorio");

// Esquema de validación para el tipo de persona
export const tipoPersonaValidation = yup
  .string()
  .required("Campo obligatorio");