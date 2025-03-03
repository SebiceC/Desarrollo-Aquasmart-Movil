from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import DocumentType,PersonType, CustomUser
# Register your models here.
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('document', 'document_type','person_type','first_name', 'last_name', 'email', 'is_staff','is_active','is_registered','date_joined','last_login','display_groups',)  
    list_filter = ('is_staff','is_active','is_registered','groups','document_type','person_type',)  
    search_fields = ('document', 'email', 'first_name', 'last_name','document_type','person_type',)
    ordering = ('document',)
    fieldsets = (
        (None, {
            'fields': ('document_type','document','person_type', 'first_name', 'last_name', 'email', 'password',)
        }),
        ('Personal info', {
            'fields': ('phone', 'address')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser','is_registered', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('document', 'first_name', 'last_name', 'email', 'password1', 'password2')
        }),
    )
    def display_groups(self, obj):
        """Devuelve los nombres de los grupos a los que pertenece el usuario."""
        return ", ".join(group.name for group in obj.groups.all())
    display_groups.short_description = 'Groups'  # Título de la columna
    
admin.site.register(CustomUser, CustomUserAdmin)   
@admin.register(DocumentType)    
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('documentTypeId','typeName')  
    list_filter = ('documentTypeId','typeName')
    search_fields = ('documentTypeId','typeName')
    ordering = ['documentTypeId']
          
@admin.register(PersonType)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('personTypeId','typeName')
    list_filter = ('personTypeId','typeName')
    search_fields = ('personTypeId','typeName')
    ordering = ['personTypeId']  