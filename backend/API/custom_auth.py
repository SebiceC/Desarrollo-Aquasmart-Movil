from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CustomTokenAuthentication(TokenAuthentication):
    """
    Autenticación basada en tokens, con validación del esquema 'Token' en el header Authorization.
    """

    def authenticate(self, request):
        auth = request.headers.get("Authorization", "")

        if auth.startswith("Bearer "):
            raise AuthenticationFailed("Formato incorrecto. Usa 'Token <tu_token>' en lugar de 'Bearer <tu_token>'.")

        return super().authenticate(request)
    
    def authenticate_credentials(self, key):
        """
        Verifica si el token existe y es válido.
        """
        try:
            token = self.get_model().objects.get(key=key)
        except self.get_model().DoesNotExist:
            raise AuthenticationFailed("Su sesión se cerró porque el token es inválido o inició sesión en otro dispositivio.")
        
        return (token.user, token)