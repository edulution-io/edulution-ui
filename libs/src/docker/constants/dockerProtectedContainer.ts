const DOCKER_PROTECTED_CONTAINERS = {
  API: 'edulution-api',
  UI: 'edulution-ui',
  REDIS: 'edulution-redis',
  MONGODB: 'edulution-db',
  TRAEFIK: 'edulution-traefik',
  KEYCLOAK: 'edulution-keycloak',
  KEYCLOAK_DB: 'edulution-keycloak-db',
  DEV_REDIS: 'redisEdu',
  DEV_MONGODB: 'mongoEdu',
} as const;

export default DOCKER_PROTECTED_CONTAINERS;
