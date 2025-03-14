from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.timezone import now, timedelta
from datetime import datetime
import secrets
import string

class UserManager(BaseUserManager):
    """
    Administrador de usuarios personalizado para la gestión de usuarios y superusuarios.
    """

    def create_user(self, document, first_name, last_name, email, phone, password=None, **extra_fields):
        """
        Crea y guarda un usuario con el documento, nombre, apellido, correo y teléfono proporcionados.

        Args:
            document (str): Número de documento del usuario.
            first_name (str): Nombre del usuario.
            last_name (str): Apellido del usuario.
            email (str): Correo electrónico único del usuario.
            phone (str): Número de teléfono del usuario.
            password (str, optional): Contraseña del usuario. Si no se proporciona, el usuario no podrá iniciar sesión.
            **extra_fields: Campos adicionales opcionales.

        Returns:
            CustomUser: Usuario creado.
        """
        if not document:
            raise ValueError("El documento es obligatorio")
        if not email:
            raise ValueError("El correo electrónico es obligatorio")
        if not phone:
            raise ValueError("El número de teléfono es obligatorio")

        email = self.normalize_email(email)
        user = self.model(
            document=document,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, document, first_name, last_name, email, phone, password=None, **extra_fields):
        """
        Crea y guarda un superusuario con privilegios administrativos.

        Args:
            document (str): Documento del superusuario.
            first_name (str): Nombre del superusuario.
            last_name (str): Apellido del superusuario.
            email (str): Correo electrónico único del superusuario.
            phone (str): Número de teléfono del superusuario.
            password (str, optional): Contraseña del superusuario.
            **extra_fields: Campos adicionales.

        Returns:
            CustomUser: Superusuario creado.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_registered", True)

        return self.create_user(document, first_name, last_name, email, phone, password, **extra_fields)

class CustomUser(AbstractUser):
    """
    Modelo de usuario personalizado con autenticación basada en el documento.
    """

    document = models.CharField(max_length=12, primary_key=True, db_index=True, verbose_name="Documento")
    first_name = models.CharField(max_length=50, db_index=True, verbose_name="Nombre")
    last_name = models.CharField(max_length=50, db_index=True, verbose_name="Apellido")
    email = models.EmailField(unique=True, db_index=True, verbose_name="Correo Electrónico")
    document_type = models.ForeignKey('DocumentType', on_delete=models.CASCADE, related_name="users_with_document_type", null=True, db_index=True, verbose_name="Tipo de Documento")
    person_type = models.ForeignKey('PersonType', on_delete=models.CASCADE, related_name="users_with_person_type", null=True, db_index=True, verbose_name="Tipo de Persona")
    phone = models.CharField(max_length=20, db_index=True, verbose_name="Teléfono")
    address = models.CharField(max_length=200, db_index=True, verbose_name="Dirección")
    is_registered = models.BooleanField(default=False, help_text="Indica si el usuario completó el pre-registro", db_index=True, verbose_name="Registrado")
    drive_folder_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID Carpeta Google Drive")  

    username = None

    USERNAME_FIELD = 'document'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone', 'address', 'email']

    objects = UserManager()

    def __str__(self):
        return f"{self.document} - {self.first_name} {self.last_name}"   

class Otp(models.Model):
    """
    Modelo para gestionar códigos OTP para autenticación y recuperación de cuentas.
    """

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, to_field='document', related_name='otp', verbose_name="Usuario")
    otp = models.CharField(max_length=6, unique=True, verbose_name="Código OTP")
    creation_time = models.DateTimeField(default=now, verbose_name="Fecha de Creación")
    is_validated = models.BooleanField(default=False, verbose_name="Validado")
    is_login = models.BooleanField(default=False, verbose_name="Para Inicio de Sesión")

    def generate_otp(self):
        """
        Genera un código OTP de 6 dígitos y lo almacena en la base de datos.

        Returns:
            str: Código OTP generado.
        """
        caracteres = string.digits
        self.otp = ''.join(secrets.choice(caracteres) for _ in range(6))
        self.creation_time = datetime.now()
        self.is_validated = False
        self.save()
        return self.otp

    def validate_life_otp(self):
        """
        Valida si el OTP sigue siendo válido dentro de los 15 minutos de creación.

        Returns:
            bool: True si el OTP es válido, False si ha expirado.
        """
        return (now() - self.creation_time) <= timedelta(minutes=5)

    def __str__(self):
        return f"OTP {self.otp} para {self.user.first_name}"

    class Meta:
        verbose_name = "Código OTP"
        verbose_name_plural = "Códigos OTP"  
        
class DocumentType(models.Model):
    """
    Modelo para los tipos de documentos de identificación.
    """

    documentTypeId = models.AutoField(primary_key=True, verbose_name="ID de Tipo de Documento")
    typeName = models.CharField(max_length=50, verbose_name="Nombre del Tipo de Documento")

    def __str__(self):
        return f"{self.documentTypeId} - {self.typeName}"  

class PersonType(models.Model):
    """
    Modelo para definir tipos de personas (ej. Natural, Jurídica).
    """

    personTypeId = models.AutoField(primary_key=True, verbose_name="ID de Tipo de Persona")
    typeName = models.CharField(max_length=20, verbose_name="Nombre del Tipo de Persona")

    def __str__(self):
        return f"{self.personTypeId} - {self.typeName}"
    
class LoginHistory(models.Model):
    """
    Modelo para registrar el historial de inicio de sesión de los usuarios.
    """

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='login_history', verbose_name="Usuario")
    timestamp = models.DateTimeField(default=now, verbose_name="Fecha y Hora de Inicio de Sesión")

    def __str__(self):
        return f"{self.user.document} - {self.timestamp}"

    class Meta:
        verbose_name = "Historial de Inicio de Sesión"
        verbose_name_plural = "Historiales de Inicio de Sesión"         

class LoginRestriction(models.Model):
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        to_field='document', 
        related_name='login_restriction', 
        verbose_name="user"
    )
    attempts = models.IntegerField(default=0)
    blocked_until = models.DateTimeField(null=True, blank=True)
    last_attempt_time = models.DateTimeField(null=True, blank=True)
    
    def register_attempt(self):
        """Registra un intento fallido de inicio de sesión"""
        if self.is_blocked():
            return "User is blocked until {}".format(self.blocked_until)
        
        self.attempts += 1
        self.last_attempt_time = now()
        
        if self.attempts == 4:
            message = "Último intento antes de ser bloqueado."
        elif self.attempts >= 5:
            self.block_user()
            message = "Usuario bloqueado por 30 minutos."
        else:
            message = "Credenciales inválidas."
        
        self.save()
        return message
    
    def block_user(self):
        """Bloquea al usuario por 30 minutos"""
        self.blocked_until = now() + timedelta(hours=0.5)
        self.attempts = 0  # Reiniciar intentos
        self.save()
    
    def is_blocked(self):
        """Verifica si el usuario está bloqueado"""
        if self.blocked_until and now() < self.blocked_until:
            return True
        if self.blocked_until and now() >= self.blocked_until:
            self.blocked_until = None
            self.attempts = 0
            self.save()
        return False