import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.http import MediaIoBaseUpload
import io
# Cargar credenciales del archivo JSON descargado de Google Cloud
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Ruta base del proyecto
CREDENTIALS_FILE = os.path.join(BASE_DIR, 'client_secret.json')  # Ruta al JSON

SCOPES = ['https://www.googleapis.com/auth/drive.file']  # Permiso para subir archivos

private_key = (
    os.getenv('PRIVATE_KEY') or  # Intenta con os.getenv (local)
    os.environ.get('PRIVATE_KEY', '')  # Intenta con os.environ.get (producción)
).replace('\\n', '\n')

def get_drive_service():
    """Autenticación con Google Drive API usando credenciales desde variables de entorno"""
    credentials_info = {
        "type": "service_account",
        "project_id": os.environ.get('PROJECT_ID', default=os.getenv("PROJECT_ID")),
        "private_key_id": os.environ.get('PRIVATE_KEY_ID', default=os.getenv("PRIVATE_KEY_ID")),  # Si tienes este valor
        "private_key": private_key,  # Formatea correctamente el private key
        "client_email": os.environ.get('CLIENT_EMAIL', default=os.getenv("CLIENT_EMAIL")),
        "client_id":os.environ.get('CLIENT_ID', default=os.getenv("CLIENT_ID")),
        "auth_uri": os.environ.get('AUTH_URI', default=os.getenv("AUTH_URI")),
        "token_uri":os.environ.get('TOKEN_URI', default=os.getenv("TOKEN_URI")),
        "auth_provider_x509_cert_url": os.environ.get('AUTH_PROVIDER_CERT_URL', default=os.getenv("AUTH_PROVIDER_CERT_URL")),
        "client_x509_cert_url": os.environ.get('CLIENT_X509_CERT_URL', default=os.getenv("CLIENT_X509_CERT_URL")),  # Si tienes este valor
        "universe_domain": "googleapis.com"
    }

    # Crear las credenciales
    creds = service_account.Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def upload_to_drive(file_path, file_name, folder_id=None):
    """
    Sube un archivo a Google Drive.

    :param file_path: Ruta del archivo en el sistema de archivos.
    :param file_name: Nombre con el que se guardará en Google Drive.
    :param folder_id: (Opcional) ID de la carpeta de Google Drive donde se guardará.
    :return: ID del archivo subido.
    """
    service = get_drive_service()

    file_metadata = {'name': file_name}
    if folder_id:
        file_metadata['parents'] = [folder_id]  # Guardar en una carpeta específica

    media = MediaFileUpload(file_path, resumable=True)
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    return file.get('id')  # Retorna el ID del archivo subido

def upload_file_to_drive(file, file_name, folder_id=None):
    """
    Sube un archivo a Google Drive desde Django sin necesidad de guardarlo en el sistema de archivos.

    :param file: Objeto InMemoryUploadedFile o TemporaryUploadedFile de Django.
    :param file_name: Nombre con el que se guardará en Google Drive.
    :param folder_id: (Opcional) ID de la carpeta de Google Drive donde se guardará.
    :return: ID del archivo subido.
    """
    service = get_drive_service()  # Asegúrate de que esta función esté bien definida para la autenticación

    file_metadata = {'name': file_name}
    if folder_id:
        file_metadata['parents'] = [folder_id]  # Guardar en una carpeta específica

    # Convierte el archivo en un stream para subirlo a Google Drive
    media = MediaIoBaseUpload(io.BytesIO(file.read()), mimetype=file.content_type)

    uploaded_file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()

    return uploaded_file.get('id') 
def create_folder(folder_name, parent_folder_id=None):
    """
    Crea una carpeta en Google Drive si no existe.

    :param folder_name: Nombre de la carpeta.
    :param parent_folder_id: (Opcional) ID de la carpeta padre donde se creará la carpeta.
    :return: ID de la carpeta (existente o nueva).
    """
    # Buscar si la carpeta ya existe
    folder_id = find_folder_by_name(folder_name, parent_folder_id)
    if folder_id:
        return folder_id  # Devolver el ID de la carpeta existente

    # Si no existe, crear la carpeta
    service = get_drive_service()

    folder_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder'  # Tipo MIME para carpetas
    }
    if parent_folder_id:
        folder_metadata['parents'] = [parent_folder_id]  # Crear dentro de una carpeta existente

    folder = service.files().create(body=folder_metadata, fields='id').execute()
    return folder.get('id')  # Retorna el ID de la carpeta creada

def share_folder(folder_id, email=None, role='reader', make_public=False):
    """
    Comparte una carpeta en Google Drive con una cuenta específica o la hace pública.

    :param folder_id: ID de la carpeta en Google Drive.
    :param email: (Opcional) Correo electrónico de la cuenta con la que se compartirá la carpeta.
    :param role: Rol del usuario ('reader' para solo lectura, 'writer' para edición).
    :param make_public: Si es True, la carpeta será accesible para cualquier persona con el enlace.
    """
    service = get_drive_service()

    if email:
        # Compartir con una cuenta específica
        permission_metadata = {
            'type': 'user',
            'role': role,
            'emailAddress': email
        }
        service.permissions().create(
            fileId=folder_id,
            body=permission_metadata,
            fields='id'
        ).execute()

    if make_public:
        # Hacer la carpeta pública
        permission_metadata = {
            'type': 'anyone',
            'role': 'reader'
        }
        service.permissions().create(
            fileId=folder_id,
            body=permission_metadata,
            fields='id'
        ).execute()

def find_folder_by_name(folder_name, parent_folder_id=None):
    """
    Busca una carpeta por nombre en Google Drive.

    :param folder_name: Nombre de la carpeta a buscar.
    :param parent_folder_id: (Opcional) ID de la carpeta padre donde buscar.
    :return: ID de la carpeta si existe, o None si no se encuentra.
    """
    service = get_drive_service()

    query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder'"
    if parent_folder_id:
        query += f" and '{parent_folder_id}' in parents"

    results = service.files().list(
        q=query,
        fields="files(id, name)"
    ).execute()

    folders = results.get('files', [])
    if folders:
        return folders[0]['id']  # Devuelve el ID de la primera carpeta encontrada
    return None  # No se encontró ninguna carpeta        
