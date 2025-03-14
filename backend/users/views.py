from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from .models import CustomUser, DocumentType, PersonType  
from .serializers import CustomUserSerializer, DocumentTypeSerializer, PersonTypeSerializer ,UserProfileSerializer, UserProfileUpdateSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny  
from drf_spectacular.utils import extend_schema, extend_schema_view,OpenApiParameter
from rest_framework.response import Response
from .validate import validate_user_exist
from API.google.google_drive import upload_to_drive
import os
from django.conf import settings
@extend_schema_view(
    post=extend_schema(
        summary="Crear un nuevo usuario",
        description="Permite la creación de un nuevo usuario en el sistema.",
        request=CustomUserSerializer,
        responses={201: CustomUserSerializer}
    )
)
class CustomUserCreateView(generics.CreateAPIView):
    """
    Vista para la creación de usuarios personalizados.
    
    - Usa `CreateAPIView` para manejar la creación de usuarios.
    - `queryset` define el conjunto de datos sobre el que opera la vista.
    - `serializer_class` especifica el serializador utilizado para validar y transformar los datos.
    - `permission_classes` actualmente está vacío, lo que significa que cualquiera puede acceder a esta vista.
    """
    
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = []  # Sin restricciones de acceso (puede ser cambiado según necesidad)
    def perform_create(self, serializer):
        """
        Crea un usuario y maneja la subida de archivos a Google Drive.
        """
        user = serializer.save()  # Guarda el usuario primero
        uploaded_files = self.request.FILES.getlist('attachments')
        # Obtiene los archivos subidos
        
        if uploaded_files and user.drive_folder_id:
            
            for uploaded_file in uploaded_files:
                temp_file_path = os.path.join(settings.MEDIA_ROOT, uploaded_file.name)

                # Guardar el archivo temporalmente
                with open(temp_file_path, 'wb+') as temp_file:
                    for chunk in uploaded_file.chunks():
                        temp_file.write(chunk)

                # Subir archivo a Google Drive
                upload_to_drive(temp_file_path, uploaded_file.name, folder_id=user.drive_folder_id)
                

                # Eliminar el archivo temporal
                os.remove(temp_file_path)

            
            user.save()

    def create(self, request, *args, **kwargs):
        """
        Sobrescribe create para manejar la respuesta personalizada.
        """
        response = super().create(request, *args, **kwargs)
        return Response(
            {
                "message": "Usuario Pre-registrado exitosamente.",
                "user": response.data
            },
            status=status.HTTP_201_CREATED
        )
    
@extend_schema_view(
    post =extend_schema(
        summary="Crear un nuevo Tipo de documento",
        request=DocumentTypeSerializer,
        responses={201: DocumentTypeSerializer, 403: {"detail": "No tienes permiso para realizar esta acción."}},
        description="Crea un nuevo tipo de documento en el sistema. Requiere permisos de administrador."
))
class DocumentTypeView(generics.CreateAPIView):
    """
    Vista para la creación de tipos de documento.

    Solo los usuarios administradores autenticados pueden acceder a esta vista.
    """

    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    permission_classes = [IsAdminUser, IsAuthenticated]

class DocumentTypeListView(generics.ListAPIView):
    queryset = DocumentType.objects.all()
    serializer_class= DocumentTypeSerializer
    permission_classes= [AllowAny]    
    
@extend_schema_view(
    post =extend_schema(
    summary="Crear un nuevo Tipo de persona",
    request=PersonTypeSerializer,
    responses={201: PersonTypeSerializer, 403: {"detail": "No tienes permiso para realizar esta acción."}},
    description="Crea un nuevo tipo de persona en el sistema. Requiere permisos de administrador."
))
class PersonTypeView(generics.CreateAPIView):
    """
    Vista para la creación de tipos de persona.

    Solo los usuarios administradores autenticados pueden acceder a esta vista.
    """
    queryset = PersonType.objects.all()
    serializer_class = PersonTypeSerializer
    permission_classes = [IsAdminUser, IsAuthenticated]
    
class PersonTypeListView(generics.ListAPIView):
    queryset = PersonType.objects.all()
    serializer_class= PersonTypeSerializer   
    permission_classes= [AllowAny]       
    
    
@extend_schema_view(
    get=extend_schema(
        summary="Listar todos los usuarios",
        description="Devuelve una lista de todos los usuarios registrados. "
                    "Solo accesible para administradores autenticados.",
        responses={200: CustomUserSerializer(many=True)}
    )
)
class CustomUserListView(generics.ListAPIView):
    """
    Vista para listar los usuarios personalizados.
    
    - Usa `ListAPIView` para manejar la recuperación de la lista de usuarios.
    - `queryset` obtiene todos los usuarios registrados en el sistema.
    - `serializer_class` transforma los datos en un formato JSON adecuado.
    - `permission_classes` restringe el acceso a usuarios autenticados y administradores.
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAdminUser, IsAuthenticated]  # Solo administradores autenticados pueden acceder


@extend_schema(
    summary="Registrar usuario",
    description="Activa un usuario desactivado en el sistema. Solo accesible para administradores autenticados.",
    parameters=[
        OpenApiParameter(
            name="document",
            description="Número de documento del usuario a activar",
            required=True,
            type=str,
            location=OpenApiParameter.PATH
        )
    ],
    responses={
        200: {"description": "Usuario activado correctamente.","example":{"status":"User activated"}},
        400: {"description": "El usuario ya está registrado o activado.","example":{"status":"The user is registered or activated."}},
        404: {"description": "Usuario no encontrado.","example":{"error":"User not found."}},
    }
)
class UserRegisterAPIView(APIView):
    """
    API para registar usuario en el sistema.

    Solo los administradores autenticados pueden acceder a esta vista.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, document):
        """
        Activa un usuario con el número de documento proporcionado.

        Args:
            request: Objeto de la solicitud.
            document (str): Documento del usuario a activar.

        Returns:
            Response: Estado de la activación del usuario.
        """        
        user = validate_user_exist(document)
        # Verificar si ya está registrado
        if user.is_registered:
            return Response({'status': 'el usuario ya se encuentra registrado'}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya está activo
        if user.is_active:
            return Response({'status': 'El usuario ya se encuentra activo.'}, status=status.HTTP_400_BAD_REQUEST)   
        user.is_registered = True
        user.is_active = True
        user.save()
        return Response({'status': 'User registred'}, status=status.HTTP_200_OK)

class UserInactiveAPIView(APIView):
    """
    API para desactivar usuario en el sistema.

    Solo los administradores autenticados pueden acceder a esta vista.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, document):
        """
        Activa un usuario con el número de documento proporcionado.

        Args:
            request: Objeto de la solicitud.
            document (str): Documento del usuario a activar.

        Returns:
            Response: Estado de la activación del usuario.
        """        
        user = validate_user_exist(document)       
        # Verificar si ya está registrado
        if not user.is_registered:
            return Response({'status': 'El usuario no a pasado el pre-registro o esta pendiente.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya está activo
        if not user.is_active:
            return Response({'status': 'El usuario ya se encuentrea inactivo.'}, status=status.HTTP_400_BAD_REQUEST)   
        user.is_active = False
        user.save()
        return Response({'status': 'El usuario a sido desactivado correctamente.'}, status=status.HTTP_200_OK)
    
class UserActivateAPIView(APIView):
    """
    API para activar usuarios en el sistema.

    Solo los administradores autenticados pueden acceder a esta vista.
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, document):
        """
        Activa un usuario con el número de documento proporcionado.

        Args:
            request: Objeto de la solicitud.
            document (str): Documento del usuario a activar.

        Returns:
            Response: Estado de la activación del usuario.
        """        
        user = validate_user_exist(document)
       
        # Verificar si ya está registrado
        if not user.is_registered:
            return Response({'status': 'El usuario no a pasado el pre-registro o esta pendiente'}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya está activo
        if user.is_active:
            return Response({'status': 'El usuario ya se encuentra activo.'}, status=status.HTTP_400_BAD_REQUEST)   
        user.is_active = True
        user.save()
        return Response({'status': 'El usuario a sido activado con exito.'}, status=status.HTTP_200_OK)    

# RF: Actualización de información de usuarios del distrito
@extend_schema_view(
    get=extend_schema(
        summary="Obtener detalles de usuario",
        description="Obtiene información detallada de un usuario específico por documento. Solo para administradores.",
        responses={200: CustomUserSerializer}
    ),
    patch=extend_schema(
        summary="Actualizar usuario",
        description="Actualiza información parcial de un usuario. Solo para superusuarios o administradores.",
        request=CustomUserSerializer,
        responses={200: CustomUserSerializer}
    )
)
class AdminUserUpdateAPIView(generics.RetrieveUpdateAPIView):
    """
    API para gestión de actualizaciones de usuarios por administradores
    
    Permite:
    - Ver detalles completos de un usuario (GET)
    - Actualización parcial de campos (PATCH)
    """
    
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'document'
    lookup_url_kwarg = 'document'
    
    def get_permissions(self):
        """Define permisos combinados para la vista"""
        return [IsAuthenticated(), self.IsAdminOrSuperUser()]
    
    class IsAdminOrSuperUser(permissions.BasePermission):
        """Permiso personalizado que verifica is_staff o is_superuser"""
        
        def has_permission(self, request, view):
            return request.user.is_staff or request.user.is_superuser
        
        def has_object_permission(self, request, view, obj):
            return self.has_permission(request, view)
    
    def get_queryset(self):
        """Optimiza consultas relacionadas"""
        return super().get_queryset().select_related('person_type', 'document_type')
    
    def perform_update(self, serializer):
        """Manejo especial para actualización de contraseña"""
        password = serializer.validated_data.pop('password', None)
        instance = serializer.save()
        
        if password:
            instance.set_password(password)
            instance.save(update_fields=['password'])
    
    def patch(self, request, *args, **kwargs):
        """Maneja actualizaciones parciales con formato de respuesta consistente"""
        
        # Validación para el documento
        if 'document' in request.data:
            return Response(
                {
                    'status': 'error',
                    'message': 'Modificación de documento no permitida',
                    'details': 'El documento de identidad no puede ser modificado'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response = super().patch(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            return Response({
                'status': 'success',
                'message': 'Usuario actualizado exitosamente',
                'data': response.data
            }, status=status.HTTP_200_OK)
        
        return response

class UserProfilelView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        print(self.request.user)
        return self.request.user
    
class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Retorna el usuario autenticado para actualizar su perfil."""
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Personaliza la respuesta dependiendo de los campos actualizados."""
        partial = kwargs.pop('partial', True)  # 🔹 Permite actualizaciones parciales
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            
            # 🔹 Detecta qué campo fue actualizado
            updated_fields = []
            if 'email' in request.data:
                updated_fields.append("correo electrónico")
            if 'phone' in request.data:
                updated_fields.append("número de teléfono")

            # 🔹 Construye el mensaje de respuesta dinámico
            if updated_fields:
                message = f"Se ha actualizado tu {' y '.join(updated_fields)} correctamente."
            else:
                message = "Datos actualizados correctamente."

            return Response({"message": message}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)