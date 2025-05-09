# ai_service/Dockerfile

# 1. Choisir une image de base Python
# python:3.9-slim est une bonne option, légère et contenant Python 3.9
FROM python:3.9-slim

# 2. Définir le répertoire de travail à l'intérieur du conteneur
# C'est là que les commandes suivantes et votre application s'exécuteront
WORKDIR /app

# 3. Copier UNIQUEMENT le fichier des dépendances d'abord
# Ceci est une optimisation. Si requirements.txt ne change pas, Docker
# utilisera le cache pour cette couche, accélérant les builds futurs.
COPY requirements.txt .

# 4. Installer les dépendances Python listées dans requirements.txt
# --no-cache-dir réduit la taille de l'image en ne stockant pas le cache pip
# Les bibliothèques comme Flask, TensorFlow, Prophet, etc., seront installées ici.
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copier TOUT le reste du code de votre application IA dans le répertoire /app du conteneur
# Cela inclut app.py, vos fichiers .pkl, class_indices.json, etc.
# Le "." signifie "le contenu du répertoire courant" (où se trouve le Dockerfile)
# et l'autre "." signifie "le répertoire de travail courant DANS le conteneur" (/app)
COPY . .

# 6. Exposer le port sur lequel votre application Flask écoute
# Dans votre app.py, vous avez probablement app.run(port=5000) ou Gunicorn est configuré pour ce port.
# Cela n'ouvre pas réellement le port sur la machine hôte, mais informe Docker
# que l'application dans le conteneur utilise ce port.
EXPOSE 5000

# 7. Définir la commande par défaut pour exécuter votre application lorsque le conteneur démarre
# Gunicorn est un serveur WSGI robuste recommandé pour la production Flask.
# "app:app" signifie : dans le fichier app.py (le module 'app'), trouve une instance de l'application nommée 'app'.
# --workers 4: Nombre de processus Gunicorn (ajustez selon les cœurs CPU disponibles).
# --bind 0.0.0.0:5000: Fait écouter Gunicorn sur toutes les interfaces réseau sur le port 5000 à l'intérieur du conteneur.
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "app:app"]

# Si vous étiez en développement et ne vouliez pas utiliser Gunicorn, vous pourriez utiliser :
# CMD ["python", "app.py"]
# Mais assurez-vous que votre app.py contienne à la fin :
# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000) # host='0.0.0.0' est crucial pour l'accès depuis l'extérieur du conteneur