from rest_framework import permissions

class PuedeCambiarIsActive(permissions.BasePermission):
    def has_permission(self, request, view):
        
        return request.user.has_perm('users.can_toggle_is_active')

class PuedeCambiarIsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('users.can_toggle_is_staff')

class CanAddDocumentType(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('users.add_documenttype')

class CanRegister(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perms([
            'users.can_toggle_is_active',
            'users.can_toggle_is_registered'
        ])