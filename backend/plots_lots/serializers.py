from rest_framework import serializers
from .models import Plot

class PlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plot
        fields = ['id_plot','owner','plot_name', ' latitud','longitud','plot_extension', 'registration_date']
        read_only_fields = ['id', 'fecha_registro']  # Estos campos no se pueden modificar

    def validate(self, data):
        # Validación personalizada para evitar duplicados en la georeferenciación
        latitud = data.get('latitud')
        longitud = data.get('longitud')
        if Plot.objects.filter(latitud=latitud, longitud=longitud).exists():
            raise serializers.ValidationError("La georeferenciación ya está asignada a otro predio.")
        return data