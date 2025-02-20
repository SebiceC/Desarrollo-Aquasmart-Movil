from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from .models import LoginHistory

@receiver(user_logged_in)
def log_login(sender, request, user, **kwargs):
    """
    Señal que registra el historial de inicio de sesión de los usuarios.

    Esta función se ejecuta automáticamente cada vez que un usuario inicia sesión
    en el sistema. Crea un registro en la tabla `LoginHistory` con la información
    del usuario autenticado.

    Parámetros:
    - sender: El modelo que envía la señal (normalmente `User`).
    - request: Objeto HTTPRequest de Django con la información de la petición.
    - user: Usuario que ha iniciado sesión.
    - kwargs: Argumentos adicionales de la señal.

    Acciones realizadas:
    - Crea un nuevo registro en `LoginHistory` con el usuario autenticado.
    - Imprime en la consola un mensaje de inicio de sesión exitoso con el documento del usuario.
    """
    LoginHistory.objects.create(user=user)
    print(f"User {user.document} logged in successfully!")
