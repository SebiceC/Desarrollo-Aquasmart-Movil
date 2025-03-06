from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiExample
from .models import Otp,CustomUser
from .serializers import  GenerateOtpPasswordRecoverySerializer, ValidateOtpSerializer, ResetPasswordSerializer, LoginSerializer
from rest_framework.exceptions import ValidationError, NotFound,PermissionDenied
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from API.custom_auth import CustomTokenAuthentication
class LoginView(APIView):
    """
    Vista para el inicio de sesión de usuarios.

    Permite a los usuarios autenticarse proporcionando sus credenciales.
    Devuelve un token de acceso en caso de éxito.

    Permisos:
    - `AllowAny`: No requiere autenticación para acceder.

    Métodos:
    - `POST`: Recibe las credenciales del usuario y devuelve el token de autenticación.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: LoginSerializer,
            400: {"error": "Detalles del error de validación.", "example": {"error": "Detalles del error de validación."}},
            404: {"error": "Usuario no encontrado.","example": {"error": "Usuario no encontrado."}},
            500: {"error": "Unexpected error.", "detail": "Detalles del error interno.","example": {"error": "Unexpected error.", "detail": "Detalles del error interno."}}
        },
        examples=[
            OpenApiExample(
                "Ejemplo de solicitud",
                value={"document": "123456789", "password": "mypassword"},
                request_only=True
            )
        ],
        description="Autentica a un usuario con sus credenciales y devuelve un token de acceso.",
        summary="Inicio de sesión",
    )
    def post(self, request, *args, **kwargs):
        """
        Procesa el inicio de sesión del usuario.

        Recibe un conjunto de credenciales en el cuerpo de la solicitud y, si son válidas, 
        devuelve un token de acceso.

        Parámetros:
        - `request.data` (dict): Debe contener las credenciales necesarias.

        Retorno:
        - `200 OK`: Si la autenticación es exitosa.
        - `400 BAD REQUEST`: Si hay errores de validación en las credenciales.
        - `404 NOT FOUND`: Si el usuario no existe.
        - `500 INTERNAL SERVER ERROR`: Si ocurre un error inesperado.
        """
        try:
            serializer = LoginSerializer(data=request.data)
            
            if serializer.is_valid(raise_exception=True):
                data = serializer.validated_data
                document = data.get('document')
                user_instance = CustomUser.objects.filter(document=document).first()
                Token.objects.filter(user=user_instance).delete()
                otp_instance = Otp.objects.filter(user=document).first()
                otp_instance.is_login = True
                otp_instance.save()
                return Response(serializer.validated_data, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except NotFound as e:
            return Response({"error": e.detail}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({"error": e.detail}, status=status.HTTP_403_FORBIDDEN) 
        except Exception as e:
            return Response({"error": "Unexpected error.", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 


class GenerateOtpView(APIView):
    permission_classes = [AllowAny]
    """
    Vista para la recuperación de contraseña mediante OTP.

    Permite a los usuarios solicitar un código OTP que se enviará por SMS o correo electrónico.
    Este código podrá ser utilizado para restablecer la contraseña.

    Métodos:
        - `post(request)`: Genera y envía un código OTP.
        - `get_permissions()`: Define permisos para la vista.
    """

    @extend_schema(
        summary="Recuperar contraseña",
        description="Se enviará un código OTP por SMS o correo para recuperar la contraseña.",
        request=GenerateOtpPasswordRecoverySerializer,
        responses={
            200: {"description": "Correo enviado correctamente", "example": {"detail": "OTP enviado."}},
            400: {"description": "Error en la solicitud", "example": {"document": ["Este campo es obligatorio."]}},
        }
    )
    def post(self, request):
        """
        Maneja la solicitud de recuperación de contraseña.

        Parámetros:
            - `document` (str): Número de documento del usuario.

        Respuestas:
            - 200: Se ha enviado el OTP correctamente al correo registrado.
            - 400: Error en la solicitud, por ejemplo, si falta el documento en la petición.
        """
        serializer = GenerateOtpPasswordRecoverySerializer(data=request.data)
        try:
            if serializer.is_valid():
                data = serializer.save()
                return Response(data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except NotFound as e:
            return Response({"error": e.detail}, status=status.HTTP_404_NOT_FOUND)        
        except Exception as e:
            return Response({"error": "Unexpected error.", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  

class ValidateOtpView(APIView):
    permission_classes = [AllowAny]
    """
    Vista para validar un código OTP.

    Permite a los usuarios enviar un OTP asociado a su documento para verificar su identidad.
    No requiere autenticación para el método `POST`.

    Métodos:
    - `POST`: Recibe un `document` y un `otp` para validarlo.
    """

    @extend_schema(
        request=ValidateOtpSerializer,
        responses={
            200: {"message": "OTP validado correctamente.","example": {"message": "OTP validado correctamente."}},
            400: {"message": "Errores de validación."}
        },
        description="Valida un OTP asociado a un documento.",
        summary="Validar OTP",
    )
    def post(self, request):
        """
        Procesa la validación de un OTP.

        Recibe un documento y un OTP en el cuerpo de la solicitud. Si el OTP es válido,
        devuelve un mensaje de éxito; de lo contrario, devuelve errores de validación.

        Parámetros:
        - `request.data` (dict): Debe contener `document` y `otp`.

        Retorno:
        - `200 OK`: Si el OTP es válido.
        - `400 BAD REQUEST`: Si hay errores en la validación.
        """
        serializer = ValidateOtpSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    """
    Vista para restablecer la contraseña de un usuario.

    Permite a los usuarios restablecer su contraseña proporcionando su documento 
    y habiendo validado un OTP previamente. No requiere autenticación para `POST`.

    Métodos:
    - `POST`: Recibe un `document` y una `new_password` para cambiar la contraseña.
    """

    @extend_schema(
        request=ResetPasswordSerializer,
        responses={
            200: {"message": "Contraseña restablecida correctamente."},
            400: {"message": "Errores de validación."}
        },
        description="Restablece la contraseña de un usuario si ha validado un OTP.",
        summary="Restablecer contraseña",
    )
    def post(self, request):
        """
        Procesa el restablecimiento de la contraseña.

        Recibe un documento y una nueva contraseña en el cuerpo de la solicitud. 
        Si el OTP fue validado previamente, la contraseña se actualiza.

        Parámetros:
        - `request.data` (dict): Debe contener `document` y `new_password`.

        Retorno:
        - `200 OK`: Si la contraseña fue cambiada con éxito.
        - `400 BAD REQUEST`: Si hay errores en la validación.
        """
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Contraseña restablecida correctamente."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """
    Vista para cerrar sesión de un usuario autenticado.

    Permite eliminar el token de autenticación del usuario, invalidando su sesión actual.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Cierra la sesión del usuario autenticado eliminando su token de acceso.

        Retorno:
        - `200 OK`: Si el cierre de sesión es exitoso.
        - `401 UNAUTHORIZED`: Si el usuario no está autenticado.
        """
        if not request.user.is_authenticated:
            return Response(
                {"error": "No estás autenticado. Por favor, inicia sesión."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            # Eliminar el token del usuario autenticado
            request.user.auth_token.delete()
            return Response({"message": "Sesión cerrada correctamente."}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": "No se pudo cerrar la sesión.", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ValidateTokenView(APIView):
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Verifica si el token en la cabecera es válido.
        Si el token no existe o no coincide con el del usuario, se devuelve un error.
        """
        user = request.user
        print(user)
        try:
            user_token = Token.objects.get(user=user)

            # El token ya fue validado por TokenAuthentication, así que no es necesario compararlo manualmente
            return Response({"detail": "Sesión valida."}, status=status.HTTP_200_OK)

        except Token.DoesNotExist:
            return Response(
                {"detail": "Su sesión se cerró."},
                status=status.HTTP_401_UNAUTHORIZED
            )
    