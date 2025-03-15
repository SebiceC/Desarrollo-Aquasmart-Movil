from django.urls import path
from .views import PlotViewSet
urlpatterns = [
    path('register', PlotViewSet.as_view({'post': 'create'}),name='registrar-predio' ),
]