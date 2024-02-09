#!/bin/bash

kubectl create ns metrics

kubectl apply -f metrics-db.yml

kubectl create secret docker-registry routerdi-registry-creds \
    -n metrics \
    --docker-server routerdi1315.uv.es:33443 \
    --docker-username=cloudlab \
    --docker-password=registro

# Solo necesario si se usa la app de kubernetes
kubectl apply -f metrics.yml
kubectl patch serviceaccount metrics-sa -n metrics -p "{\"imagePullSecrets\": [{\"name\": \"routerdi-registry-creds\"}]}"

#kubectl patch serviceaccount default -n metrics -p "{\"imagePullSecrets\": [{\"name\": \"routerdi-registry-creds\"}]}"


kubectl apply -f metrics-server.yml