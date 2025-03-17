from django.db import models
from users.models import CustomUser
import hashlib
import uuid
class Plot(models.Model):
    id_plot = models.CharField(primary_key=True,max_length=10, verbose_name="ID de predio")
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="dueño_de_predio")
    plot_name = models.CharField(max_length= 20, db_index=True, null=False, blank=False, verbose_name="Nombre de predio")
    latitud =  models.DecimalField(max_digits=9, decimal_places=6, null=False, blank=False, verbose_name="Longitud de predio")
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=False, blank=False, verbose_name="Latitud de predio")
    plot_extension =models.DecimalField(max_digits=4, decimal_places=2, null=False, blank=False, verbose_name="Extensión de tierra")
    registration_date = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de registro")
    is_activate = models.BooleanField(default=True, help_text="Indica si el predio esta habilitado", db_index=True, verbose_name="estado predio")
    
    REQUIRED_FIELDS = ['owner','plot_name','latitud','longitud','plot_extension']
    
    class Meta:
        verbose_name = "Predio"
        verbose_name_plural = "Predios"
    
    def save(self, *args, **kwargs):
        # Generar el código solo si no existe aún
        if not self.id_plot:           
                        
            unique_value = str(uuid.uuid4())
    
    
            # Crear el hash MD5 del valor
            hash_obj = hashlib.md5(unique_value.encode())
            
            # Convertir el hash hexadecimal a un entero
            hash_int = int(hash_obj.hexdigest(), 16)
            
            # Convertir el entero en una cadena numérica y truncar a la longitud deseada
            hash_str = str(hash_int)[:7]           
            
            # Generar el código
            self.id_plot = f"PR-{hash_str}"
            print (self.id_plot)
        # Generar el código de la receta
        super().save(*args, **kwargs)    
    def __str__(self):
        return f"{self.plot_name} (ID: {self.id_plot})"
        