#!/bin/bash

export KUBE_CONFIG=/home/tramuntana/.kube/config-cluster-k8s


SECONDS=0
for i in "20" "40" "60" "80" 
do
    curl -X DELETE  http://192.168.0.116:30090/stats/
    curl -X DELETE  http://192.168.0.116:30090/stats/docker/

    kubectl apply --kubeconfig $KUBE_CONFIG -f "deploy/stress/stress$i.yml"
    sleep 60
    kubectl delete --kubeconfig $KUBE_CONFIG -f "deploy/stress/stress$i.yml"

    curl http://192.168.0.116:30090/stats/docker > statsdocker$i.json 
    curl http://192.168.0.116:30090/stats > stats$i.json

    sleep 10
done
echo "Tiempo total del experimento $SECONDS"









