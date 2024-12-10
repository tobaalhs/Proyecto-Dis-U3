import json
import subprocess
import os
import shutil
from datetime import datetime

def get_ngrok_tunnels(api_key1, api_key2):
    # Obtener túneles de la primera cuenta
    command1 = f'ngrok api tunnels list --api-key "{api_key1}"'
    result1 = subprocess.run(command1, capture_output=True, text=True)
    
    # Obtener túneles de la segunda cuenta
    command2 = f'ngrok api tunnels list --api-key "{api_key2}"'
    result2 = subprocess.run(command2, capture_output=True, text=True)
    
    urls = {
        "urls": {
            "fronted": "",
            "backend-identity": "",
            "backend-catalog": "",
            "backend-orders": "",
            "backend-rating": ""
        }
    }
    
    try:
        # Procesar resultados de la primera cuenta
        json_str1 = result1.stdout.split('200 OK\n')[1] if '200 OK' in result1.stdout else result1.stdout
        response1 = json.loads(json_str1)
        
        # Procesar resultados de la segunda cuenta
        json_str2 = result2.stdout.split('200 OK\n')[1] if '200 OK' in result2.stdout else result2.stdout
        response2 = json.loads(json_str2)
        
        # Combinar todos los túneles
        all_tunnels = response1['tunnels'] + response2['tunnels']
        
        # Mapear puertos a servicios
        url_mapping = {
            "8081": "backend-identity",
            "8082": "backend-catalog",
            "8083": "backend-orders",
            "8084": "backend-rating",
            "4200": "fronted"
        }
        
        # Mapear las URLs a los servicios correspondientes
        for tunnel in all_tunnels:
            port = tunnel['forwards_to'].split(':')[-1]
            if port in url_mapping:
                service = url_mapping[port]
                urls["urls"][service] = tunnel['public_url']
        
        # Usar os.path.expanduser para obtener la ruta del usuario actual
        project_path = os.path.join(os.path.expanduser('~'), 'Desktop', 'Proyecto-Dis-U3-main', 'ueats-web', 'src', 'assets', 'links.json')
        
        # Crear directorios si no existen
        os.makedirs(os.path.dirname(project_path), exist_ok=True)
        
        # Eliminar archivo existente si existe
        if os.path.exists(project_path):
            os.remove(project_path)
            print(f"Archivo eliminado: {project_path}")
        
        # Guardar en la ruta del proyecto
        with open(project_path, 'w') as f:
            json.dump(urls, f, indent=2)
            
        print("URLs actualizadas y guardadas en el proyecto:")
        print(json.dumps(urls, indent=2))
        print(f"\nArchivo guardado en: {project_path}")
        
    except json.JSONDecodeError as e:
        print(f"Error al parsear JSON: {e}")
        print("Respuestas recibidas:")
        print("Cuenta 1:", result1.stdout)
        print("Cuenta 2:", result2.stdout)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    API_KEY1 = "2pzunLAT7gURJMoFxV5M247kKV2_4KZxVR4Y1Me45auzu22GY"
    API_KEY2 = "2pzvjiDsSTJSykEFDXU3Jghgeom_6Q2D15eDcCv5WXCFw6vx4"
    get_ngrok_tunnels(API_KEY1, API_KEY2)