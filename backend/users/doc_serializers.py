from rest_framework import serializers

class LoginResponseSerializer(serializers.Serializer):
    """
    Serializer para la respuesta de inicio de sesión.

    Contiene los tokens JWT que se devuelven tras una autenticación exitosa.

    Atributos:
        - `refresh` (str): Token de refresco, utilizado para obtener un nuevo token de acceso.
        - `access` (str): Token de acceso, necesario para autenticar solicitudes en la API.
    """
    refresh = serializers.CharField(help_text="Token de refresco para renovar sesión")
    access = serializers.CharField(help_text="Token de acceso para autenticación")


class LoginSerializer(serializers.Serializer):
    """
    Serializer para la solicitud de inicio de sesión.

    Se utiliza para autenticar a un usuario con su documento y contraseña.

    Atributos:
        - `document` (str): Número de documento del usuario.
        - `password` (str): Contraseña del usuario (solo escritura).
    """
    document = serializers.CharField(help_text="Número de documento del usuario")
    password = serializers.CharField(write_only=True, help_text="Contraseña del usuario")