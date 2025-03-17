from rest_framework.permissions import BasePermission, IsAdminUser

class IsOwnerOrAdmin(BasePermission):
    """
    Permiso personalizado que:
    1. Para acciones de lista (GET /plots):
       - Permite acceso solo a administradores
    2. Para acciones sobre predios específicos:
       - Permite acceso a administradores
       - Permite acceso a dueños de sus propios predios
       - Deniega acceso a otros usuarios
    """
    def has_permission(self, request, view):
        # Verificar autenticación básica
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Para listar predios, solo permitir admins
        if view.action == 'list':
            return IsAdminUser().has_permission(request, view)
            
        # Para otras acciones, permitir usuarios autenticados
        return True

    def has_object_permission(self, request, view, obj):
        # Permitir acceso si es admin o dueño del predio
        return (
            IsAdminUser().has_permission(request, view) or 
            obj.owner.document == request.user.document
        )
