from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from datetime import datetime
from django.conf import settings
import secrets
import string
""" Classe que maneja la creaccion del superuser"""
class UserManager(BaseUserManager):
    """ Funcion de creacion de superuser"""
    def create_user(self, document, first_name, last_name,email,phone, password=None, **extra_fields):
        if not document:
            raise ValueError('El documento es obligatorio')
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        if not phone:
            raise ValueError('El número de teléfono es obligatorio')
        
        email = self.normalize_email(email)
        user = self.model(
            document=document,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone = phone,
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        
        user.save(using=self._db)
        return user
    """ Funcion da los persiomos correspondientes al superuser"""
    def create_superuser(self, document, first_name, last_name, email, phone, password=None, **extra_fields):
        """Da todos los permisos al superusuario"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('isRegistered', True)
        
        return self.create_user(document, first_name, last_name, email,phone, password, **extra_fields)
"""Usuario personalizado astraido de modelo user de django"""
class CustomUser(AbstractUser): 
    document = models.CharField(max_length=12,primary_key=True, db_index=True)      
    first_name = models.CharField(max_length=50, db_index=True)
    last_name = models.CharField(max_length=50, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    document_type = models.ForeignKey('DocumentType',on_delete= models.CASCADE, related_name="document_type", null=True, db_index=True)
    person_type = models.ForeignKey('PersonType',on_delete= models.CASCADE, related_name="person_type", null=True, db_index=True)
    phone = models.CharField(max_length=20, db_index=True)
    address = models.CharField(max_length=200, db_index=True)
    is_registered = models.BooleanField(default=False,help_text='permite ver si el usuario paso el pre registro', db_index=True)
    username = None
    
    USERNAME_FIELD = 'document'
    REQUIRED_FIELDS =['first_name', 'last_name', 'phone', 'address','email']
    objects = UserManager() 
    
    def __str__(self):
        return f"{self.document} - {self.first_name} {self.last_name}"    
"""Clase que maneja la cracion y validacion de codigo de un solo uso"""    
class Otp(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE,to_field='document', related_name='otp')
    otp = models.CharField(max_length=6, unique=True)
    creation_time = models.DateTimeField(default=timezone.now)
    is_validated = models.BooleanField(default=False)
    is_login = models.BooleanField(default=False)
    def generateOTP(self):
        """Genera un otp de recuperación único de 6 caracteres."""
        caracteres = string.digits  # dígitos
        self.otp = ''.join(secrets.choice(caracteres) for _ in range(6))  # Selecciona 6 caracteres aleatorios
        self.creation_time = datetime.now()  # Guarda la fecha y hora de creación
        self.is_validated = False
        self.save()
        return self.otp
    
    def validate_life_otp(self):
        """Verifica si el otp sigue siendo válido (no ha expirado)."""
        return (timezone.now() - self.creation_time) <= timezone.timedelta(minutes=15)
    def __str__(self):
        return f"OTP {self.otp} para {self.user.first_name}"
    
    class Meta:
        verbose_name = "OTP"
        verbose_name_plural = "OTPS"    
        
class DocumentType(models.Model):
    documentTypeId = models.AutoField(primary_key= True, )
    typeName =  models.CharField(max_length= 50)
    def __str__(self):
        return f"{self.documentTypeId}-{self.typeName}"    

class PersonType(models.Model):
    personTypeId = models.AutoField(primary_key= True,)
    typeName = models.CharField(max_length=20)
    
    def __str__(self):
        return f"{self.personTypeId}-{self.typeName}"
    
class LoginHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='login_history')
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.document} - {self.timestamp}"           

