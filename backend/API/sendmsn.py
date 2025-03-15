from django.core.mail import send_mail
from django.conf import settings

def send_email(email, otp_generado, purpose ):
    """
    Envía un correo con el OTP de recuperación de contraseña.
    """
    if purpose == "login":   
        asunto = "Otp Inicio de Sesion"
        mensaje = f"Su OTP de inicio de sesion es: {otp_generado}. Úselo iniciar sesion."    
    elif purpose == "recover":                
        asunto = "Recuperación de Contraseña"
        mensaje = f"Su OTP de recuperación es: {otp_generado}. Úselo para restablecer su contraseña."
    
    try:
        send_mail(
            subject=asunto,
            message=mensaje,
            from_email=settings.EMAIL_HOST_USER,  # Usa el remitente de settings.py
            recipient_list=[email],
            fail_silently=False,  # Genera errores si hay fallos
        )
        return "Correo enviado exitosamente"
    except Exception as e:
        return f"Error al enviar correo: {e}"
        
