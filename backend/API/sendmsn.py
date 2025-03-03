from django.core.mail import send_mail

def send_sms_recover(email, otp_generado):
        """
        Envía un correo con el OTP de recuperación de contraseña.
        """
        asunto = "Recuperación de Contraseña"
        mensaje = f"Su OTP de recuperación es: {otp_generado}. Úselo para restablecer su contraseña."
        remitente = "noreply@example.com"
        send_mail(asunto, mensaje, remitente, [email])
        
