# BusinessAnalysis AI

## 📝 Description du Projet
BusinessAnalysis AI est une application web qui permet aux utilisateurs de gérer des projets et de générer automatiquement des analyses métier complètes. Le système génère des spécifications telles que les exigences fonctionnelles et non-fonctionnelles, les user stories, les critères d'acceptation, les risques et les recommandations.

## 🛠 Technologies Utilisées
**Backend :**
- Java 21
- Spring Boot 3.5.3 (Web, Data JPA, Security, Validation)
- MySQL
- JWT pour l'authentification sécurisée
- MapStruct, Lombok
- Génération de documents (OpenPDF, Apache POI)
- Springdoc OpenAPI (Swagger) pour la documentation de l'API

**Frontend :**
- Angular (v22.0.0)
- TypeScript
- RxJS
- npm (Node Package Manager)

## 🤖 Agents IA Principaux
Dans la version actuelle, l'intégration de l'intelligence artificielle est **simulée** (mock) via un moteur interne (`AnalysisServiceImpl`). Le système démontre la logique des agents suivants de manière autonome :
- **Business Analyst Agent** : Analyse l'idée principale du projet et évalue les risques et hypothèses.
- **Requirements Agent** : Génère les exigences métier, fonctionnelles et non-fonctionnelles.
- **User Story Agent** : Produit les User Stories et leurs Critères d'Acceptation associés.
- **Documentation Agent** : Compile l'ensemble de l'analyse dans un format structuré et exportable.
- **AI Chat Agent** : Conçu pour l'interaction dynamique (fonctionnalité simulée dans cette version de démonstration).

## 📁 Structure du Projet
- `/` (racine) : Contient le code source du backend (Spring Boot), les configurations Maven (`pom.xml`, `mvnw`) et les paramètres globaux.
- `/src/main/java/` : Code source Java du backend (Controllers, Services, Repositories, Sécurité, etc.).
- `/frontend/` : Contient l'application cliente Angular et ses configurations associées (`package.json`, `angular.json`).

## 📋 Prérequis
- **Java Development Kit (JDK) 21**
- **Node.js et npm** (dernière version stable recommandée)
- **Serveur MySQL** (en cours d'exécution sur le port 3306)
> **⚠️ Important :** Le serveur MySQL **doit impérativement être démarré** avant de lancer le Backend.

## ⚙️ Configuration (Base de données)
Le projet est préconfiguré pour créer automatiquement la base de données au démarrage si le serveur MySQL est actif.
Les paramètres de base de données par défaut (modifiables dans `src/main/resources/application.properties`) sont :
- **URL** : `jdbc:mysql://localhost:3306/business_analysis_ai?createDatabaseIfNotExist=true`
- **Utilisateur** : `root`
- **Mot de passe** : *(vide)*

## 🚀 Commandes d'Installation

### 1. Cloner le projet
```bash
git clone https://github.com/bedhiafiranime/business-analysis-ai.git
cd business-analysis-ai
```

### 2. Backend (Spring Boot)
Aucune installation globale de Maven n'est requise grâce au wrapper Maven intégré (`mvnw`). Les dépendances se téléchargeront automatiquement lors du premier lancement.

### 3. Frontend (Angular)
Ouvrez un nouveau terminal et installez les dépendances :
```bash
cd frontend
npm install
```

## ▶️ Commandes d'Exécution

### Démarrer le Backend
Assurez-vous que MySQL tourne, puis depuis la racine du projet, exécutez la commande suivante :
- Sous **Windows** :
  ```cmd
  mvnw.cmd spring-boot:run
  ```
- Sous **Linux/Mac** :
  ```bash
  ./mvnw spring-boot:run
  ```

### Démarrer le Frontend
Depuis le dossier `frontend` :
```bash
npm start
```
*(Cette commande lance `ng serve` en arrière-plan)*

## 🔗 URLs de l'Application
- **Frontend (Interface Utilisateur)** : [http://localhost:4200](http://localhost:4200)
- **Backend (API Base URL)** : [http://localhost:8080](http://localhost:8080)
- **Documentation API (Swagger UI)** : [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
