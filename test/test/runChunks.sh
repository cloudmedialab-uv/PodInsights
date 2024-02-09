#!/bin/bash

export KUBE_CONFIG=/home/tramuntana/.kube/config-cluster-k8s


kubectl apply --kubeconfig $KUBE_CONFIG -f deploy/filter.yml

sleep 5

kubectl apply --kubeconfig $KUBE_CONFIG -f "deploy/function.yml"

sleep 5

bash scripts/fullscale-replica.sh ffmpeg-fn-v2 2> /dev/null

sleep 10


for i in $(seq 1 100); do

    bash scripts/send-request.sh "-i chunk$i.mp4 -vf scale=1920:1080 -an -crf 0 echunk$i.mp4" "\"http://192.168.0.50:8080/2160-10/SKA-2/chunk$i.mp4\"" \""echunk$i.mp4\""

done

echo "Todas las peticiones han sido enviadas."

RETRY_COUNT=0
while true; do
    CHUNKS=$(curl -s "http://192.168.0.242:8080/upload/times.json" | wc -l)
    CHUNKS=$((CHUNKS + 1))
    if [ $CHUNKS -eq 100 ] 
    then
        echo ""
        break
    fi

    echo -ne "\rchunks completados: $CHUNKS"

    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq 3600 ]; then
        echo "Alcanzado el límite de reintentos para el experimento."
        break
    fi
done

echo "Tiempo total del experimento $SECONDS"

kubectl delete --kubeconfig $KUBE_CONFIG -f deploy/function.yml

kubectl delete --kubeconfig $KUBE_CONFIG -f deploy/filter.yml

