PodInsights: Kubernetes Resource Monitoring System
==================================================

Introduction
------------

PodInsights is a centralized monitoring system for Kubernetes nodes. It deploys a daemonset across each node to monitor Kubernetes resources marked with a configurable label. PodInsights offers millisecond-level monitoring and can measure CPU and memory usage more precisely than traditional tools.

Features
--------

*   **High-Resolution Monitoring**: Track CPU and memory usage at the millisecond level.
*   **Daemonset Deployment**: Ensures comprehensive coverage across all Kubernetes nodes.
*   **Configurable Monitoring**: Users can specify which resources to monitor using configurable labels.
*   **Internal Database Storage**: Metrics are stored in an internal MongoDB database for efficient data management.
*   **API Access**: Provides an API for querying stored statistics. Documentation is available at [API Documentation](https://url.documentacion.api.com).

Prerequisites
-------------

*   Kubernetes cluster
*   kubectl configured to communicate with your cluster

Installation
------------

1.  **Deploy PodInsights**:
    
    ```kubectl apply -f https://github.com/cloudmedialab-uv/PodInsights/blob/main/deploy/k8s/metrics.yml```
    
    This command creates a dedicated namespace and sets up all necessary resources for PodInsights.
    
2.  **Configure Monitoring**: Edit the ConfigMap to set monitoring parameters like interval and labels.
    

Usage
-----

### Labeling Resources for Monitoring

To monitor a Kubernetes resource, add the `monitorthispod: "true"` label. For example, to monitor an Nginx deployment:


```
apiVersion: apps/v1 
kind: Deployment 
metadata:   
    name: nginx   
    namespace: default   
    labels:     
        monitorthispod: "true" 
spec:   ...
```

### Querying Metrics

Use the provided API to query the metrics:

basic http request to get all metrics

`curl -X GET https://url.api.query/metrics`

example response:

```
[{
    "_id":"6548fcd0f1993657d9111307",
    "createdAt":1699282128096,
    "name":"k8s_user-container-0-deployment-7967975f5b",
    "memUsage":"2085126144",
    "memLimit":"101246816256",
    "cpuPercent":93.49533083645443,
    "nodeName":"worker13"
},
...]
```

* * *

For detailed API usage and documentation, please visit [API Documentation](https://url.documentacion.api.com).
