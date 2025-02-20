from .models import CustomUser,Otp
from rest_framework.exceptions import NotFound
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError
def validate_user(document):
        """
        Verifica si el usuario con el documento proporcionado existe.
        """
        
        return CustomUser.objects.filter(document=document).first()
def validate_otp(user, is_validated=False, otp=None):
    """
    Valida si existe un OTP según el estado de validación.
    
    - `user`: Usuario al que pertenece el OTP.
    - `is_validated`: `True` para buscar OTPs ya validados, `False` para buscar OTPs no usados.
    - `otp`: (Opcional) Código OTP a verificar.
    
    Retorna el objeto OTP si existe, de lo contrario lanza un error.
    """
    try:
        filters = {"user": user, "is_validated": is_validated,}
        if otp is not None:
            filters["otp"] = otp  # Filtrar por OTP si se proporciona
        
        return Otp.objects.get(**filters)
    
    except ObjectDoesNotExist:
        message = (
            "No hay un OTP validado para este usuario."
            if is_validated else "OTP inválido o ya ha sido utilizado."
        )
        raise ValidationError({"detail": message})   