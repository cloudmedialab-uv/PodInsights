#!/bin/bash

DEPLOYMENT_NAME="$1"

if [ -z "$DEPLOYMENT_NAME" ]; then
    echo "Por favor, proporciona el nombre del deployment."
    exit 1
fi

while true
do
    RUNNING_PODS=$(kubectl --kubeconfig $KUBE_CONFIG get pods -l app="$DEPLOYMENT_NAME" -o=jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}' | wc -w)

    if [ "$RUNNING_PODS" == "4" ]; then
        echo "El deployment $DEPLOYMENT_NAME ha escalado a 4 y todos los pods están en estado 'Running'."
        break
    fi
    
    sleep 5
done

