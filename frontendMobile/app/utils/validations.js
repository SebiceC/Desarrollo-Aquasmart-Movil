import * as yup from "yup";

export const loginSchema = yup.object().shape({
  cedula: yup
    .string()
    .matches(/^\d{1,12}$/, "Cédula inválida")
    .required("Campo obligatorio"),
  password: yup.string().required("Campo obligatorio"),
});
