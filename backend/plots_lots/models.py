from django.db import models
from users.models import CustomUser
from django.core.exceptions import ValidationError
class Plot(models.Model):
    id_plot = models.AutoField(primary_key=True, verbose_name="ID de predio")
    owner = models.ForeignKey(CustomUser,on_delete=models.CASCADE, related_name="Dueño_depredio")
    plot_name = models.CharField(max_length= 20, db_index=True, null=False, blank=False, verbose_name="Nombre de predio")
    latitud =  models.DecimalField(max_digits=9, decimal_places=6, null=False, blank=False, verbose_name="Longitud de predio")
    longitud = models.DecimalField(max_digits=9, decimal_places=6, null=False, blank=False, verbose_name="Latitud de predio")
    plot_extension =models.DecimalField(max_digits=4, decimal_places=2, null=False, blank=False, verbose_name="Extensión de tierra")
    registration_date = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de registro")
    
    REQUIRED_FIELDS = ['plot_name', ' latitud','longitud','plot_extension']
    
    class Meta:
        verbose_name = "Predio"
        verbose_name_plural = "Predios"
        
    def __str__(self):
        return f"{self.plot_name} (ID: {self.id_plot})"
        