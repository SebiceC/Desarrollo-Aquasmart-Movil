from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Plot
from .serializers import PlotSerializer

class PlotViewSet(viewsets.ModelViewSet):
    queryset = Plot.objects.all()
    serializer_class = PlotSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def perform_create(self, serializer):
        # Asignar automáticamente el dueño del predio al usuario autenticado
        serializer.save(dueño=self.request.user)