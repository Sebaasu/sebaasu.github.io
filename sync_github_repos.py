import os
import urllib.request
import json
import yaml

def sync():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    datos_dir = os.path.join(base_dir, 'datos')
    contacto_path = os.path.join(datos_dir, 'contacto.yaml')
    proyectos_path = os.path.join(datos_dir, 'proyectos.yaml')
    
    if not os.path.exists(contacto_path):
        print(f"Error: {contacto_path} not found")
        return
        
    # Read existing contacto.yaml
    with open(contacto_path, 'r', encoding='utf-8') as f:
        contacto = yaml.safe_load(f)
        
    proyectos_online = contacto.get('proyectos_online', [])
    if proyectos_online is None:
        proyectos_online = []
        
    existing_urls = {p['url'].lower().strip('/') for p in proyectos_online if 'url' in p}
    
    # Read proyectos.yaml for backup descriptions
    desc_map = {}
    if os.path.exists(proyectos_path):
        with open(proyectos_path, 'r', encoding='utf-8') as f:
            proyectos_data = yaml.safe_load(f)
            for p in proyectos_data.get('proyectos', []):
                clean_id = p['id'].replace('_', '-').lower()
                desc_map[clean_id] = p['descripcion']
                
    # Fetch from GitHub API
    github_user = contacto['enlaces']['github'].split('/')[-1]
    api_url = f"https://api.github.com/users/{github_user}/repos"
    
    print(f"Fetching repositories for user '{github_user}' from GitHub API...")
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            repos = json.loads(response.read().decode())
    except Exception as e:
        print("Error fetching from GitHub API:", e)
        return
        
    new_added = 0
    for r in repos:
        url = r['html_url']
        clean_url = url.lower().strip('/')
        
        # Don't add user pages repository (e.g. username.github.io)
        if r['name'].lower() == f"{github_user.lower()}.github.io":
            continue
            
        if clean_url not in existing_urls:
            desc = r['description']
            if not desc:
                # Try projects.yaml mapping
                clean_name = r['name'].replace('_', '-').lower()
                desc = desc_map.get(clean_name, "")
            
            # Shorten description if too long
            if desc and len(desc) > 150:
                desc = desc[:147] + "..."
                
            name_formatted = r['name'].replace('-', ' ').title()
            name_formatted = name_formatted.replace('Sic', 'SIC').replace('Xk335B', 'XK335B').replace('S7200', 'S7-200')
            
            new_project = {
                'nombre': name_formatted,
                'url': url,
                'descripcion': desc or "Proyecto de desarrollo."
            }
            proyectos_online.append(new_project)
            existing_urls.add(clean_url)
            new_added += 1
            print(f"Added new repository: {name_formatted} ({url})")
            
    if new_added > 0:
        contacto['proyectos_online'] = proyectos_online
        with open(contacto_path, 'w', encoding='utf-8') as f:
            yaml.dump(contacto, f, allow_unicode=True, sort_keys=False)
        print(f"Successfully updated {contacto_path} with {new_added} new repositories.")
        
        # Run build_data.py to update portfolio js/data.js
        try:
            import build_data
            build_data.build()
        except ImportError:
            print("Warning: build_data.py could not be imported to update portfolio database.")
    else:
        print("No new repositories found to add.")

if __name__ == '__main__':
    sync()
