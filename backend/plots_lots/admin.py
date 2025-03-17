from django.contrib import admin
from .models import Plot


# Register your models here.
@admin.register(Plot)
class PlotAdmin(admin.ModelAdmin):
    list_display = ('id_plot', 'owner', 'plot_name', 'latitud', 'longitud', 'plot_extension', 'registration_date','is_activate')
    search_fields = ('plot_name', 'owner')
    list_filter = ('registration_date',)
    ordering = ('-registration_date',)
