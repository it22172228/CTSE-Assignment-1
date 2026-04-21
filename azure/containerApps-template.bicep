# Azure Container Apps Deployment Configuration
# This file contains the ARM template for deploying all microservices

parameters:
  environmentName:
    type: string
    defaultValue: smarteat-env
    metadata:
      description: Name of the Container Apps Environment

  location:
    type: string
    defaultValue: eastus
    metadata:
      description: Location for Azure resources

  registryName:
    type: string
    metadata:
      description: Azure Container Registry name

  registryResourceGroup:
    type: string
    metadata:
      description: Resource group of the container registry

  mongodbUri:
    type: secureString
    metadata:
      description: MongoDB connection string

  jwtSecret:
    type: secureString
    defaultValue: 'your-secure-jwt-secret-here'
    metadata:
      description: JWT secret for token generation

variables:
  containerAppEnvName: '[parameters(''environmentName'')]'

resources:
  # Container Apps Environment
  - type: Microsoft.App/managedEnvironments
    apiVersion: 2023-04-01-preview
    name: '[variables(''containerAppEnvName'')]'
    location: '[parameters(''location'')]'
    properties:
      appLogsConfiguration:
        destination: azure-analytics

  # User Service Container App
  - type: Microsoft.App/containerApps
    apiVersion: 2023-04-01-preview
    name: user-service
    location: '[parameters(''location'')]'
    dependsOn:
      - '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
    properties:
      managedEnvironmentId: '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
      configuration:
        ingress:
          external: true
          targetPort: 3000
          allowInsecure: false
        registries:
          - server: '[concat(parameters(''registryName''), ''.azurecr.io'')]'
            username: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').username]'
            passwordSecretRef: registryPassword
        secrets:
          - name: registry-password
            value: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').passwords[0].value]'
          - name: jwt-secret
            value: '[parameters(''jwtSecret'')]'
          - name: mongo-uri
            value: '[parameters(''mongodbUri'')]'
      template:
        containers:
          - name: user-service
            image: '[concat(parameters(''registryName''), ''.azurecr.io/user-service:latest'')]'
            resources:
              cpu: 0.5
              memory: 1Gi
            env:
              - name: PORT
                value: 3000
              - name: MONGO_URI
                secretRef: mongo-uri
              - name: JWT_SECRET
                secretRef: jwt-secret
              - name: NOTIFICATION_SERVICE_URL
                value: '[concat(''https://'', reference(resourceId(''Microsoft.App/containerApps'', ''notification-service''), ''2023-04-01-preview'').configuration.ingress.fqdn, ''/api'')]'
              - name: NODE_ENV
                value: production
        scale:
          minReplicas: 1
          maxReplicas: 3
          rules:
            - name: http-requests
              httpScaling:
                concurrentRequests: 100

  # Restaurant Service Container App
  - type: Microsoft.App/containerApps
    apiVersion: 2023-04-01-preview
    name: restaurant-service
    location: '[parameters(''location'')]'
    dependsOn:
      - '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
    properties:
      managedEnvironmentId: '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
      configuration:
        ingress:
          external: true
          targetPort: 3000
          allowInsecure: false
        registries:
          - server: '[concat(parameters(''registryName''), ''.azurecr.io'')]'
            username: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').username]'
            passwordSecretRef: registryPassword
        secrets:
          - name: registry-password
            value: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').passwords[0].value]'
          - name: jwt-secret
            value: '[parameters(''jwtSecret'')]'
          - name: mongo-uri
            value: '[parameters(''mongodbUri'')]'
      template:
        containers:
          - name: restaurant-service
            image: '[concat(parameters(''registryName''), ''.azurecr.io/restaurant-service:latest'')]'
            resources:
              cpu: 0.5
              memory: 1Gi
            env:
              - name: PORT
                value: 3000
              - name: MONGO_URI
                secretRef: mongo-uri
              - name: JWT_SECRET
                secretRef: jwt-secret
              - name: NOTIFICATION_SERVICE_URL
                value: '[concat(''https://'', reference(resourceId(''Microsoft.App/containerApps'', ''notification-service''), ''2023-04-01-preview'').configuration.ingress.fqdn, ''/api'')]'
              - name: NODE_ENV
                value: production
        scale:
          minReplicas: 1
          maxReplicas: 3

  # Order Service Container App
  - type: Microsoft.App/containerApps
    apiVersion: 2023-04-01-preview
    name: order-service
    location: '[parameters(''location'')]'
    dependsOn:
      - '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
    properties:
      managedEnvironmentId: '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
      configuration:
        ingress:
          external: true
          targetPort: 3000
          allowInsecure: false
        registries:
          - server: '[concat(parameters(''registryName''), ''.azurecr.io'')]'
            username: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').username]'
            passwordSecretRef: registryPassword
        secrets:
          - name: registry-password
            value: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').passwords[0].value]'
          - name: jwt-secret
            value: '[parameters(''jwtSecret'')]'
          - name: mongo-uri
            value: '[parameters(''mongodbUri'')]'
      template:
        containers:
          - name: order-service
            image: '[concat(parameters(''registryName''), ''.azurecr.io/order-service:latest'')]'
            resources:
              cpu: 0.5
              memory: 1Gi
            env:
              - name: PORT
                value: 3000
              - name: MONGO_URI
                secretRef: mongo-uri
              - name: JWT_SECRET
                secretRef: jwt-secret
              - name: FRONTEND_URL
                value: '[reference(resourceId(''Microsoft.App/containerApps'', ''frontend''), ''2023-04-01-preview'').configuration.ingress.fqdn]'
              - name: NOTIFICATION_SERVICE_URL
                value: '[concat(''https://'', reference(resourceId(''Microsoft.App/containerApps'', ''notification-service''), ''2023-04-01-preview'').configuration.ingress.fqdn, ''/api'')]'
              - name: RESTAURANT_SERVICE_URL
                value: '[concat(''https://'', reference(resourceId(''Microsoft.App/containerApps'', ''restaurant-service''), ''2023-04-01-preview'').configuration.ingress.fqdn, ''/api'')]'
              - name: NODE_ENV
                value: production
        scale:
          minReplicas: 1
          maxReplicas: 3

  # Notification Service Container App
  - type: Microsoft.App/containerApps
    apiVersion: 2023-04-01-preview
    name: notification-service
    location: '[parameters(''location'')]'
    dependsOn:
      - '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
    properties:
      managedEnvironmentId: '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
      configuration:
        ingress:
          external: true
          targetPort: 3000
          allowInsecure: false
        registries:
          - server: '[concat(parameters(''registryName''), ''.azurecr.io'')]'
            username: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').username]'
            passwordSecretRef: registryPassword
        secrets:
          - name: registry-password
            value: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').passwords[0].value]'
          - name: jwt-secret
            value: '[parameters(''jwtSecret'')]'
          - name: mongo-uri
            value: '[parameters(''mongodbUri'')]'
      template:
        containers:
          - name: notification-service
            image: '[concat(parameters(''registryName''), ''.azurecr.io/notification-service:latest'')]'
            resources:
              cpu: 0.5
              memory: 1Gi
            env:
              - name: PORT
                value: 3000
              - name: MONGO_URI
                secretRef: mongo-uri
              - name: JWT_SECRET
                secretRef: jwt-secret
              - name: NODE_ENV
                value: production
        scale:
          minReplicas: 1
          maxReplicas: 3

  # Frontend Container App
  - type: Microsoft.App/containerApps
    apiVersion: 2023-04-01-preview
    name: frontend
    location: '[parameters(''location'')]'
    dependsOn:
      - '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
    properties:
      managedEnvironmentId: '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
      configuration:
        ingress:
          external: true
          targetPort: 3000
          allowInsecure: false
        registries:
          - server: '[concat(parameters(''registryName''), ''.azurecr.io'')]'
            username: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').username]'
            passwordSecretRef: registryPassword
        secrets:
          - name: registry-password
            value: '[listCredentials(resourceId(parameters(''registryResourceGroup''), ''Microsoft.ContainerRegistry/registries'', parameters(''registryName'')), ''2023-06-01-preview'').passwords[0].value]'
      template:
        containers:
          - name: frontend
            image: '[concat(parameters(''registryName''), ''.azurecr.io/frontend:latest'')]'
            resources:
              cpu: 0.5
              memory: 1Gi
            env:
              - name: NODE_ENV
                value: production
        scale:
          minReplicas: 1
          maxReplicas: 3

outputs:
  containerAppsEnvironmentId:
    type: string
    value: '[resourceId(''Microsoft.App/managedEnvironments'', variables(''containerAppEnvName''))]'
  userServiceUrl:
    type: string
    value: '[reference(resourceId(''Microsoft.App/containerApps'', ''user-service''), ''2023-04-01-preview'').configuration.ingress.fqdn]'
  restaurantServiceUrl:
    type: string
    value: '[reference(resourceId(''Microsoft.App/containerApps'', ''restaurant-service''), ''2023-04-01-preview'').configuration.ingress.fqdn]'
  orderServiceUrl:
    type: string
    value: '[reference(resourceId(''Microsoft.App/containerApps'', ''order-service''), ''2023-04-01-preview'').configuration.ingress.fqdn]'
  notificationServiceUrl:
    type: string
    value: '[reference(resourceId(''Microsoft.App/containerApps'', ''notification-service''), ''2023-04-01-preview'').configuration.ingress.fqdn]'
  frontendUrl:
    type: string
    value: '[reference(resourceId(''Microsoft.App/containerApps'', ''frontend''), ''2023-04-01-preview'').configuration.ingress.fqdn]'
